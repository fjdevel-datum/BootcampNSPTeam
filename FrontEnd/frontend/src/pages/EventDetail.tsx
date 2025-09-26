import { ArrowLeft, FileText, Paperclip, Camera, X,Download } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { defaultEventData } from "../types/event";

// Interfaces para manejo de archivos e imágenes
interface CapturedImage {
  id: string;
  dataUrl: string;
  timestamp: Date;
  type: 'camera' | 'file';
  fileName?: string;
}

export default function EventDetailPage() {
  const { eventName } = useParams<{ eventName: string }>();
  const navigate = useNavigate();
  
  // Estados para manejo de imágenes y cámara
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Función para abrir la cámara
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Usa cámara trasera en móviles
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  // Función para cerrar la cámara
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  // Función para capturar foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const newImage: CapturedImage = {
          id: Date.now().toString(),
          dataUrl,
          timestamp: new Date(),
          type: 'camera'
        };
        
        setCapturedImages(prev => [...prev, newImage]);
        closeCamera();
      }
    }
  };

  // Función para seleccionar archivo
  const selectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Función para manejar archivo seleccionado
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newImage: CapturedImage = {
          id: Date.now().toString(),
          dataUrl,
          timestamp: new Date(),
          type: 'file',
          fileName: file.name
        };
        setCapturedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para eliminar imagen
  const removeImage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
  };
  
  // Por ahora usamos datos mock - después se conectará al backend
  const eventData = {
    ...defaultEventData,
    name: eventName || "EVENTO",
    colorClass: "bg-sky-900"
  };

  const { financialData } = eventData;

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
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
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{transaction.description}</p>
                    <p className="text-sm text-slate-500">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Galería de imágenes capturadas */}
      {capturedImages.length > 0 && (
        <div className="px-6 pb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Fotos capturadas ({capturedImages.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {capturedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.dataUrl}
                    alt={`Captura ${image.type}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {image.type === 'camera' ? '📷' : '📁'} {image.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
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
            onClick={() => navigate('/home')}
            className="w-full max-w-xs mx-auto block bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-6 rounded-lg transition"
          >
            REGRESAR
          </button>
        </div>
      </div>
    </main>
  );
}