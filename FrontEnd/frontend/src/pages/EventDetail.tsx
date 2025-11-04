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
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { defaultEventData, type EventoBackend } from "../types/event";
import { dataUrlToFile, downloadGastoFile } from "../services/ocr";
import { eventosService } from "../services/eventos";
import { useAuth } from "../context/AuthContext";
import { gastosService } from "../services/gastos";
import type { GastoBackend } from "../types/gasto";

interface EventLocationState {
  evento?: EventoBackend;
}

interface NavigateStatePayload {
  imageData: string;
  imageType: "camera" | "file";
  fileName?: string;
  sourceFile: File;
}

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

  // Estados para manejo de imágenes y cámara
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Obtener la primera letra del username para el avatar
  const getUserInitial = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  const totalGastado = useMemo(
    () =>
      gastos.reduce((acumulado, gasto) => {
        const monto = Number(gasto.monto ?? 0);
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

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
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
    console.log('🚪 [EventDetail] Logout iniciado');
    await logout();
    console.log('✅ [EventDetail] Logout completado, redirigiendo...');
    window.location.href = '/';
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
          setEventoError("No se encontró información del evento seleccionado.");
        }
      })
      .catch((error) => {
        console.error("Error al cargar el evento:", error);
        if (!cancelled) {
          setEventoError("No se pudo cargar la información del evento.");
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
      alert("No se pudo identificar el evento. Regresa a la lista e inténtalo de nuevo.");
      return false;
    }
    return true;
  };

  // Función para abrir la cámara
  const openCamera = async () => {
    if (!ensureEventoIdentificado()) {
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Usa cámara trasera en móviles
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  // Función para cerrar la cámara
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

  // Función para capturar foto
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

  // Función para seleccionar archivo
  const selectFile = () => {
    if (!ensureEventoIdentificado()) {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Función para manejar archivo seleccionado
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {isLoadingEvento && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 text-sm text-center">
          Cargando información del evento...
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
                ${financialOverview.totalReceived.toFixed(2)}
              </p>
            </div>

            {/* Gastado */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-slate-800 rounded-sm mr-2"></div>
                <span className="text-sm text-slate-600">Gastado</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                ${financialOverview.totalSpent.toFixed(2)}
              </p>
            </div>

            {/* Restante */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-sky-600 rounded-sm mr-2"></div>
                <span className="text-sm text-slate-600">Restante</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                ${financialOverview.remaining.toFixed(2)}
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
                const monto = Number(gasto.monto ?? 0);
                const moneda = gasto.moneda || "USD";
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
                            : "Gasto sin descripción"}
                        </p>
                        <p className="text-base font-bold text-slate-900">
                          {formatCurrency(monto, moneda)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 md:text-sm">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {formatFecha(gasto.fecha)}
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
                  Este comprobante no es una imagen. Descárgalo para revisarlo.
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={handleOpenPreviewInTab}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-sky-500 hover:text-sky-600"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir en pestaña
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

      {/* Modal de Cámara */}
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

              {/* Vista previa de la cámara */}
              <div className="relative bg-slate-900 rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>

              {/* Botones de acción */}
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

      {/* Botón REGRESAR */}
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






