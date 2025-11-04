import {
  ArrowLeft,
  FileText,
  Paperclip,
  Camera,
  X,
  Eye,
  Loader2,
  MapPin,
  CalendarDays,
  CreditCard,
  Download,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { defaultEventData, type EventoBackend } from "../types/event";
import { dataUrlToFile, downloadGastoFile } from "../services/ocr";
import { eventosService } from "../services/eventos";
import { useAuth } from "../context/AuthContext";
import { gastosService } from "../services/gastos";
import type { ActualizarGastoPayload, GastoBackend } from "../types/gasto";
import { obtenerCategorias, type CategoriaGasto } from "../services/categorias";
import { obtenerMisTarjetas } from "../services/tarjetas";
import type { Tarjeta } from "../types/tarjeta";

interface EventLocationState {
  evento?: EventoBackend;
}

interface NavigateStatePayload {
  imageData: string;
  imageType: "camera" | "file";
  fileName?: string;
  sourceFile: File;
}

interface EditGastoForm {
  idGasto: number;
  descripcion: string;
  lugar: string;
  fecha: string;
  monto: string;
  moneda: string;
  idCategoria: string;
  idTarjeta: string;
}

const MONEDAS_DISPONIBLES = ["USD", "GTQ", "HNL", "PAB", "EUR"] as const;
interface PreviewModalData {
  url: string;
  fileName: string;
  contentType: string;
}

export default function EventDetailPage() {
  const { eventName } = useParams<{ eventName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as EventLocationState | null) ?? null;
  const { logout, user } = useAuth();

  const decodedEventName = eventName ? decodeURIComponent(eventName) : "";

  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoBackend | null>(
    locationState?.evento ?? null
  );
  const [eventoError, setEventoError] = useState<string | null>(null);
  const [isLoadingEvento, setIsLoadingEvento] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [gastos, setGastos] = useState<GastoBackend[]>([]);
  const [isLoadingGastos, setIsLoadingGastos] = useState(false);
  const [gastosError, setGastosError] = useState<string | null>(null);
  const [gastoIdEnProceso, setGastoIdEnProceso] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<PreviewModalData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditGastoForm | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [categoriasCatalogo, setCategoriasCatalogo] = useState<CategoriaGasto[]>([]);
  const [tarjetasCatalogo, setTarjetasCatalogo] = useState<Tarjeta[]>([]);
  const [catalogoError, setCatalogoError] = useState<string | null>(null);
  const [isCatalogoLoading, setIsCatalogoLoading] = useState(false);
  const [accionFeedback, setAccionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Estados para manejo de imagenes y camara
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Obtener la primera letra del username para el avatar
  const getUserInitial = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  useEffect(() => {
    let cancelado = false;
    setIsCatalogoLoading(true);
    Promise.all([obtenerCategorias(), obtenerMisTarjetas()])
      .then(([categorias, tarjetas]) => {
        if (cancelado) {
          return;
        }
        setCategoriasCatalogo(categorias);
        setTarjetasCatalogo(tarjetas);
        setCatalogoError(null);
      })
      .catch((error) => {
        if (cancelado) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las listas de categorias y tarjetas.";
        setCatalogoError(message);
      })
      .finally(() => {
        if (!cancelado) {
          setIsCatalogoLoading(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const totalGastado = useMemo(
    () =>
      gastos.reduce((acumulado, gasto) => {
        const valorBase = gasto.montoUsd ?? gasto.monto ?? 0;
        const monto = Number(valorBase);
        if (Number.isNaN(monto)) {
          return acumulado;
        }
        return acumulado + monto;
      }, 0),
    [gastos]
  );

  const financialData = useMemo(() => {
    const base = defaultEventData.financialData;
    const totalRecibido = base.totalReceived;
    return {
      ...base,
      totalSpent: totalGastado,
      remaining: Math.max(totalRecibido - totalGastado, 0),
    };
  }, [totalGastado]);

  const eventDisplayName =
    eventoSeleccionado?.nombreEvento || decodedEventName || "EVENTO";

  const eventData = {
    ...defaultEventData,
    name: eventDisplayName,
    colorClass: "bg-sky-900",
    financialData,
    transactions: [],
  };

  const formatCurrency = (valor: number, codigoMoneda: string | null | undefined) => {
    const monto = Number(valor);
    if (!Number.isFinite(monto)) {
      return "$0.00";
    }
    const monedaBase =
      typeof codigoMoneda === "string" ? codigoMoneda.trim().toUpperCase() : "";
    const moneda = monedaBase || "USD";
    try {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: moneda,
        minimumFractionDigits: 2,
      }).format(monto);
    } catch {
      return `${moneda} ${monto.toFixed(2)}`;
    }
  };

  const formatFecha = (valor: string | null) => {
    if (!valor) {
      return "Sin fecha";
    }
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(fecha);
  };

  const inferImageMime = (fileName: string | null | undefined, currentType: string | null | undefined) => {
    const normalizedType = (currentType ?? "").toLowerCase();
    if (normalizedType.startsWith("image/")) {
      return normalizedType;
    }
    if (!fileName) {
      return normalizedType;
    }
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".png")) {
      return "image/png";
    }
    if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
      return "image/jpeg";
    }
    if (lowerName.endsWith(".gif")) {
      return "image/gif";
    }
    if (lowerName.endsWith(".webp")) {
      return "image/webp";
    }
    return normalizedType;
  };

  const obtenerTextoTarjeta = (gasto: GastoBackend) => {
    if (!gasto.idTarjeta) {
      return "Tarjeta personal";
    }
    const numero = gasto.numeroTarjeta?.trim() ?? "";
    if (!numero) {
      return "Tarjeta corporativa";
    }
    const digits = numero.replaceAll(/\D+/g, "");
    if (digits.length >= 4) {
      return `Tarjeta ${digits.slice(-4)}`;
    }
    return numero;
  };

  const normalizarFechaIso = (valor: string | null | undefined) => {
    if (!valor) {
      return "";
    }
    return valor.split("T")[0];
  };

  const abrirModalEdicion = (gasto: GastoBackend) => {
    setEditForm({
      idGasto: gasto.idGasto,
      descripcion: gasto.descripcion ?? "",
      lugar: gasto.lugar ?? "",
      fecha: normalizarFechaIso(gasto.fecha),
      monto: gasto.monto != null ? String(gasto.monto) : "",
      moneda: (gasto.moneda ?? "USD").toUpperCase(),
      idCategoria: gasto.idCategoria != null ? String(gasto.idCategoria) : "",
      idTarjeta: gasto.idTarjeta != null ? String(gasto.idTarjeta) : "personal",
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const cerrarModalEdicion = () => {
    setIsEditModalOpen(false);
    setEditForm(null);
    setEditError(null);
  };

  const handleEditFieldChange =
    (field: keyof EditGastoForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

  const handleSubmitEdicion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editForm) {
      return;
    }

    const descripcion = editForm.descripcion.trim();
    const lugar = editForm.lugar.trim();
    const fecha = editForm.fecha;
    const moneda = editForm.moneda.trim().toUpperCase();
    const montoNumber = Number.parseFloat(editForm.monto);
    const categoriaId = editForm.idCategoria ? Number.parseInt(editForm.idCategoria, 10) : NaN;

    if (!lugar) {
      setEditError("El lugar es obligatorio.");
      return;
    }

    if (!fecha) {
      setEditError("La fecha es obligatoria.");
      return;
    }

    if (!editForm.idCategoria || Number.isNaN(categoriaId)) {
      setEditError("Selecciona una categoria valida.");
      return;
    }

    if (!moneda) {
      setEditError("Selecciona una moneda valida.");
      return;
    }

    if (!Number.isFinite(montoNumber) || montoNumber <= 0) {
      setEditError("El monto debe ser mayor a cero.");
      return;
    }

    const payload: ActualizarGastoPayload = {
      descripcion: descripcion || null,
      lugar,
      fecha,
      monto: Number(montoNumber.toFixed(2)),
      moneda,
      idCategoria: categoriaId,
    };

    if (editForm.idTarjeta === "personal") {
      payload.idTarjeta = null;
      payload.sinTarjeta = true;
    } else if (editForm.idTarjeta) {
      payload.idTarjeta = Number.parseInt(editForm.idTarjeta, 10);
    }

    setIsSavingEdit(true);
    try {
      const actualizado = await gastosService.actualizar(editForm.idGasto, payload);
      setGastos((prev) =>
        prev.map((g) =>
          g.idGasto === actualizado.idGasto
            ? {
                ...g,
                ...actualizado,
                tieneComprobante: actualizado.tieneComprobante ?? g.tieneComprobante,
              }
            : g
        )
      );
      showFeedback("success", "Gasto actualizado correctamente.");
      cerrarModalEdicion();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el gasto. Intenta nuevamente.";
      setEditError(message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteGasto = async (gasto: GastoBackend) => {
    if (!window.confirm(`Eliminar el gasto "${gasto.descripcion ?? "sin descripcion"}"?`)) {
      return;
    }
    setIsDeletingId(gasto.idGasto);
    try {
      await gastosService.eliminar(gasto.idGasto);
      setGastos((prev) => prev.filter((item) => item.idGasto !== gasto.idGasto));
      showFeedback("success", "Gasto eliminado correctamente.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar el gasto. Intenta nuevamente.";
      showFeedback("error", message);
    } finally {
      setIsDeletingId(null);
    }
  };

  const openPreviewModal = (data: PreviewModalData) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = data.url;
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const closePreviewModal = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewData(null);
    setIsPreviewOpen(false);
  };

  const showFeedback = (type: "success" | "error", message: string) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setAccionFeedback({ type, message });
    feedbackTimeoutRef.current = setTimeout(() => {
      setAccionFeedback(null);
      feedbackTimeoutRef.current = null;
    }, 6000);
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleDownloadPreview = () => {
    if (!previewData) {
      return;
    }
    const link = document.createElement("a");
    link.href = previewData.url;
    link.download = previewData.fileName || "comprobante-gasto";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPreviewInTab = () => {
    if (!previewData) {
      return;
    }
    window.open(previewData.url, "_blank", "noopener,noreferrer");
  };

  const handleViewReceipt = async (gasto: GastoBackend) => {
    if (!gasto.tieneComprobante) {
      alert("Este gasto no tiene un comprobante adjunto.");
      return;
    }
    setGastoIdEnProceso(gasto.idGasto);
    try {
      const { blob, fileName, contentType } = await downloadGastoFile(gasto.idGasto);
      if (!blob || blob.size === 0) {
        throw new Error("El comprobante esta vacio.");
      }
      const blobUrl = URL.createObjectURL(blob);
      const finalFileName = fileName || `comprobante-${gasto.idGasto}`;
      const resolvedContentType = inferImageMime(finalFileName, contentType);
      openPreviewModal({
        url: blobUrl,
        fileName: finalFileName,
        contentType: resolvedContentType,
      });
    } catch (error) {
      console.error("Error al abrir el comprobante del gasto:", error);
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo abrir el comprobante del gasto.";
      alert(message);
    } finally {
      setGastoIdEnProceso(null);
    }
  };

  const handleLogout = async () => {
    console.log("[EventDetail] Logout iniciado");
    await logout();
    console.log("[EventDetail] Logout completado, redirigiendo...");
    window.location.href = "/";
  };

  useEffect(() => {
    if (eventoSeleccionado || !decodedEventName) {
      return;
    }

    let cancelled = false;
    setIsLoadingEvento(true);
    setEventoError(null);

    eventosService
      .listarEventos()
      .then((eventos) => {
        if (cancelled) return;
        const normalizedName = decodedEventName.toLowerCase();
        const encontrado = eventos.find(
          (evt) => evt.nombreEvento.toLowerCase() === normalizedName
        );
        if (encontrado) {
          setEventoSeleccionado(encontrado);
        } else {
          setEventoError("No se encontro informacion del evento seleccionado.");
        }
      })
      .catch((error) => {
        console.error("Error al cargar el evento:", error);
        if (!cancelled) {
          setEventoError("No se pudo cargar la informacion del evento.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingEvento(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [decodedEventName, eventoSeleccionado]);

  const idEvento = eventoSeleccionado?.idEvento ?? null;

  useEffect(() => {
    if (!idEvento) {
      setGastos([]);
      return;
    }

    let cancelled = false;
    setIsLoadingGastos(true);
    setGastosError(null);

    gastosService
      .listarPorEvento(idEvento)
      .then((lista) => {
        if (!cancelled) {
          setGastos(lista);
        }
      })
      .catch((error) => {
        console.error("Error al obtener los gastos del evento:", error);
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los gastos del evento.";
          setGastosError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingGastos(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [idEvento]);

  const ensureEventoIdentificado = () => {
    if (!idEvento) {
      alert("No se pudo identificar el evento. Regresa a la lista e intentalo de nuevo.");
      return false;
    }
    return true;
  };

  // Funcion para abrir la camara
  const openCamera = async () => {
    if (!ensureEventoIdentificado()) {
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Usa camara trasera en moviles
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("No se pudo acceder a la camara. Verifica los permisos.");
    }
  };

  // Funcion para cerrar la camara
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const navigateToGastoForm = (state: NavigateStatePayload) => {
    if (!idEvento) {
      return;
    }
    const slug =
      eventName ??
      (eventoSeleccionado ? encodeURIComponent(eventoSeleccionado.nombreEvento) : "");
    if (!slug) {
      alert("No se pudo determinar la ruta del evento.");
      return;
    }
    navigate(`/event/${slug}/gasto`, {
      state: { ...state, idEvento },
    });
  };

  // Funcion para capturar foto
  const capturePhoto = async () => {
    if (!ensureEventoIdentificado()) {
      return;
    }
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        try {
          const file = await dataUrlToFile(dataUrl, `captura-${Date.now()}.jpg`);

          closeCamera();

          navigateToGastoForm({
            imageData: dataUrl,
            imageType: "camera",
            fileName: file.name,
            sourceFile: file,
          });
        } catch (error) {
          console.error("Error preparando la imagen capturada:", error);
          alert("No se pudo preparar la imagen capturada. Intenta de nuevo.");
        }
      }
    }
  };

  // Funcion para seleccionar archivo
  const selectFile = () => {
    if (!ensureEventoIdentificado()) {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Funcion para manejar archivo seleccionado
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (!ensureEventoIdentificado()) {
      return;
    }
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || "";
        navigateToGastoForm({
          imageData: dataUrl,
          imageType: "file",
          fileName: file.name,
          sourceFile: file,
        });
      };
      reader.readAsDataURL(file);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (event.target) {
      event.target.value = "";
    }
  };

  const financialOverview = eventData.financialData;

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Regresar</span>
          </button>

          {/* Dropdown de perfil */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition"
            >
              {getUserInitial()}
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <>
                {/* Overlay para cerrar al hacer click afuera */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                
                {/* Menu dropdown */}
                <div className="absolute right-0 top-12 z-20 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition flex items-center gap-2"
                  >
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-sky-500 text-white text-xs font-semibold">
                      {getUserInitial()}
                    </div>
                    <span className="font-medium">Ver Perfil</span>
                  </button>
                  
                  <hr className="my-2 border-slate-200" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    Cerrar Sesion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {isLoadingEvento && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 text-sm text-center">
          Cargando informacion del evento...
        </div>
      )}

      {eventoError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm text-center">
          {eventoError}
        </div>
      )}

      {/* Event Title */}
      <div className="bg-white px-6 py-8 text-center border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">
          {eventData.name}
        </h1>
      </div>

      {/* Financial Overview */}
      <div className="px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">VISIBILIDAD DE INGRESOS</h2>
            <button className="text-sm text-sky-600 hover:text-sky-700 font-medium">
              View report
            </button>
          </div>

          <p className="text-sm text-slate-500 mb-6">Fecha: {new Date().toLocaleDateString()}</p>

          <div className="grid grid-cols-3 gap-6">
            {/* Total Recibido */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-sky-400 rounded-sm mr-2"></div>
                <span className="text-sm text-slate-600">Total Recibido</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(financialOverview.totalReceived, "USD")}
              </p>
            </div>

            {/* Gastado */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-slate-800 rounded-sm mr-2"></div>
                <span className="text-sm text-slate-600">Gastado</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(financialOverview.totalSpent, "USD")}
              </p>
            </div>

            {/* Restante */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-sky-600 rounded-sm mr-2"></div>
                <span className="text-sm text-slate-600">Restante</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(financialOverview.remaining, "USD")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de transacciones */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Historial de transacciones</h3>
          </div>

          {accionFeedback && (
            <div
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                accionFeedback.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-red-300 bg-red-50 text-red-700"
              }`}
            >
              {accionFeedback.message}
            </div>
          )}

          {isLoadingGastos ? (
            <p className="text-center text-slate-500 py-8">
              Cargando gastos del evento...
            </p>
          ) : gastosError ? (
            <p className="text-center text-red-600 py-8">{gastosError}</p>
          ) : gastos.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No hay transacciones registradas para este evento.
            </p>
          ) : (
            <div className="space-y-4">
              {gastos.map((gasto) => {
                const montoOriginal = gasto.monto ?? 0;
                const moneda = gasto.moneda || "USD";
                const montoFormateado = formatCurrency(montoOriginal, moneda);
                const fechaLegible = formatFecha(gasto.fecha);
                return (
                  <div
                    key={gasto.idGasto}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm md:flex-row md:items-center md:gap-6 md:p-5"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <span className="text-lg font-semibold">-</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <p className="text-base font-semibold text-slate-900">
                          {gasto.descripcion && gasto.descripcion.trim()
                            ? gasto.descripcion
                            : "Gasto sin descripcion"}
                        </p>
                        <p className="text-base font-bold text-slate-900">
                          {montoFormateado}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 md:text-sm">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {fechaLegible}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {gasto.lugar && gasto.lugar.trim() ? gasto.lugar : "Sin lugar"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {obtenerTextoTarjeta(gasto)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2 self-end md:self-auto">
                      <button
                        type="button"
                        onClick={() => handleViewReceipt(gasto)}
                        disabled={!gasto.tieneComprobante || gastoIdEnProceso === gasto.idGasto}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:border-sky-500 hover:text-sky-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                        title={
                          gasto.tieneComprobante
                            ? "Ver comprobante"
                            : "Este gasto no tiene comprobante"
                        }
                      >
                        {gastoIdEnProceso === gasto.idGasto ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirModalEdicion(gasto)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:border-amber-500 hover:text-amber-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                        title="Editar gasto"
                        disabled={isDeletingId === gasto.idGasto}
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGasto(gasto)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                        title="Eliminar gasto"
                        disabled={isDeletingId === gasto.idGasto}
                      >
                        {isDeletingId === gasto.idGasto ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isPreviewOpen && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Comprobante del gasto</h3>
                <p className="text-xs text-slate-500">{previewData.fileName}</p>
              </div>
              <button
                onClick={closePreviewModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {(previewData.contentType || "").toLowerCase().startsWith("image/") ? (
                <img
                  src={previewData.url}
                  alt={previewData.fileName}
                  className="mx-auto max-h-72 w-full rounded-lg object-contain shadow-sm"
                />
              ) : (
                <div className="py-16 text-center text-sm text-slate-500">
                  Este comprobante no es una imagen. Descargalo para revisarlo.
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={handleOpenPreviewInTab}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-sky-500 hover:text-sky-600"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir en pestana
              </button>
              <button
                onClick={handleDownloadPreview}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-sky-500 hover:text-sky-600"
              >
                <Download className="h-4 w-4" />
                Descargar
              </button>
              <button
                onClick={closePreviewModal}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Editar gasto</h3>
                <p className="text-xs text-slate-500">ID #{editForm.idGasto}</p>
              </div>
              <button
                onClick={cerrarModalEdicion}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {catalogoError && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {catalogoError}
              </div>
            )}

            {editError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {editError}
              </div>
            )}

            {isCatalogoLoading && (
              <p className="mb-3 text-xs text-slate-500">Actualizando catalogos...</p>
            )}

            <form onSubmit={handleSubmitEdicion} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Descripcion
                  <input
                    type="text"
                    value={editForm.descripcion}
                    onChange={handleEditFieldChange("descripcion")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    placeholder="Motivo del gasto"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Lugar
                  <input
                    type="text"
                    value={editForm.lugar}
                    onChange={handleEditFieldChange("lugar")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    placeholder="Ej. Restaurante"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Fecha
                  <input
                    type="date"
                    value={editForm.fecha}
                    onChange={handleEditFieldChange("fecha")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Monto
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.monto}
                    onChange={handleEditFieldChange("monto")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Moneda
                  <select
                    value={editForm.moneda}
                    onChange={handleEditFieldChange("moneda")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    required
                  >
                    {MONEDAS_DISPONIBLES.map((mon) => (
                      <option key={mon} value={mon}>
                        {mon}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Categoria
                  <select
                    value={editForm.idCategoria}
                    onChange={handleEditFieldChange("idCategoria")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    required
                    disabled={isCatalogoLoading}
                  >
                    <option value="">Selecciona una categoria</option>
                    {categoriasCatalogo.map((categoria) => (
                      <option key={categoria.idCategoria} value={categoria.idCategoria}>
                        {categoria.nombreCategoria}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Tarjeta
                  <select
                    value={editForm.idTarjeta}
                    onChange={handleEditFieldChange("idTarjeta")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isCatalogoLoading}
                  >
                    <option value="personal">Tarjeta personal</option>
                    {tarjetasCatalogo.map((tarjeta) => {
                      const ultimos = tarjeta.numeroTarjeta?.slice(-4) ?? "";
                      return (
                        <option key={tarjeta.idTarjeta} value={tarjeta.idTarjeta}>
                          Tarjeta {ultimos} - {tarjeta.banco}
                        </option>
                      );
                    })}
                  </select>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalEdicion}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-80"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Action Buttons - Para tomar fotos */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={selectFile}
          className="w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition"
          title="Adjuntar archivo"
        >
          <Paperclip className="h-6 w-6" />
        </button>
        <button
          onClick={openCamera}
          className="w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition"
          title="Tomar foto"
        >
          <Camera className="h-6 w-6" />
        </button>
      </div>

      {/* Input oculto para seleccionar archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modal de Camara */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="w-full max-w-2xl mx-4">
            <div className="bg-white rounded-2xl p-6">
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Tomar Foto</h3>
                <button
                  onClick={closeCamera}
                  className="p-2 hover:bg-slate-100 rounded-full transition"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              {/* Vista previa de la camara */}
              <div className="relative bg-slate-900 rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>

              {/* Botones de accion */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={closeCamera}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Capturar
                </button>
              </div>
            </div>
          </div>

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Boton REGRESAR */}
      <div className="px-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/home")}
            className="w-full max-w-xs mx-auto block bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-6 rounded-lg transition"
          >
            REGRESAR
          </button>
        </div>
      </div>
    </main>
  );
}

