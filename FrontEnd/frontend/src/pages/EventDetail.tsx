import { ArrowLeft, FileText, Paperclip, Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { defaultEventData, type EventoBackend } from "../types/event";
import { dataUrlToFile } from "../services/ocr";
import { eventosService } from "../services/eventos";

interface EventLocationState {
  evento?: EventoBackend;
}

interface NavigateStatePayload {
  imageData: string;
  imageType: "camera" | "file";
  fileName?: string;
  sourceFile: File;
}

export default function EventDetailPage() {
  const { eventName } = useParams<{ eventName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as EventLocationState | null) ?? null;

  const decodedEventName = eventName ? decodeURIComponent(eventName) : "";

  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoBackend | null>(
    locationState?.evento ?? null
  );
  const [eventoError, setEventoError] = useState<string | null>(null);
  const [isLoadingEvento, setIsLoadingEvento] = useState(false);

  // Estados para manejo de imágenes y cámara
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Datos mock mientras no se integran métricas reales
  const eventData = {
    ...defaultEventData,
    name: eventoSeleccionado?.nombreEvento || decodedEventName || "EVENTO",
    colorClass: "bg-sky-900",
  };

  const { financialData } = eventData;

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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
                AL
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">Ann Lee</span>
                <span className="text-xs text-slate-500">Coordinadora</span>
              </div>
            </div>
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
                ${financialData.totalReceived.toFixed(2)}
              </p>
            </div>

            {/* Gastado */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-slate-800 rounded-sm mr-2"></div>
                <span className="text-sm text-slate-600">Gastado</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                ${financialData.totalSpent.toFixed(2)}
              </p>
            </div>

            {/* Restante */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-sky-600 rounded-sm mr-2"></div>
                <span className="text-sm text-slate-600">Restante</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                ${financialData.remaining.toFixed(2)}
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

          {eventData.transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No hay transacciones registradas para este evento.
            </p>
          ) : (
            <div className="space-y-3">
              {eventData.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{transaction.description}</p>
                    <p className="text-sm text-slate-500">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {transaction.type === "income" ? "Ingreso" : "Gasto"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
