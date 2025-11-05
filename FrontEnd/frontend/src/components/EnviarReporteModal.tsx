import { useState, useEffect } from 'react';
import { X, Send, FileSpreadsheet, MapPin, User, CheckCircle } from 'lucide-react';
import { listarDestinatarios, enviarReporte } from '../services/reportes';
import type { DestinatarioReporte, EnviarReporteRequest } from '../types/reporte';

interface EnviarReporteModalProps {
  eventoId: number;
  nombreEvento: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnviarReporteModal({
  eventoId,
  nombreEvento,
  onClose,
  onSuccess,
}: EnviarReporteModalProps) {
  const [destinatarios, setDestinatarios] = useState<DestinatarioReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDestinatarios, setLoadingDestinatarios] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    mensaje: string;
    asunto?: string;
    cantidadGastos?: number;
  } | null>(null);

  const [formData, setFormData] = useState<EnviarReporteRequest>({
    emailDestino: '',
    codigoPais: '',
    nombreProveedor: '',
    formato: 'EXCEL', // Siempre Excel por defecto
  });

  // Cargar destinatarios al montar
  useEffect(() => {
    const cargarDestinatarios = async () => {
      try {
        const data = await listarDestinatarios();
        setDestinatarios(data);
      } catch (err) {
        setError('Error al cargar destinatarios');
        console.error(err);
      } finally {
        setLoadingDestinatarios(false);
      }
    };
    cargarDestinatarios();
  }, []);

  const handleDestinatarioChange = (codigoPais: string) => {
    const destinatario = destinatarios.find((d) => d.codigoPais === codigoPais);
    if (destinatario) {
      setFormData({
        ...formData,
        emailDestino: destinatario.email,
        codigoPais: destinatario.codigoPais,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await enviarReporte(eventoId, formData);

      if (response.exitoso) {
        setSuccess({
          mensaje: response.mensaje,
          asunto: response.asunto,
          cantidadGastos: response.cantidadGastos,
        });
        
        // Cerrar modal después de 3 segundos
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      } else {
        setError(response.mensaje);
      }
    } catch (err) {
      const error = err as { response?: { data?: { mensaje?: string } } };
      setError(error.response?.data?.mensaje || 'Error al enviar el reporte');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Mensaje de Éxito */}
        {success ? (
          <div className="text-center py-8">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="text-green-600" size={64} />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              ¡Reporte Enviado!
            </h3>
            
            <p className="text-gray-600 mb-4">{success.mensaje}</p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {success.asunto && (
                <div>
                  <p className="text-sm text-gray-600">Asunto:</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">
                    {success.asunto}
                  </p>
                </div>
              )}
              {success.cantidadGastos !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Gastos reportados:</p>
                  <p className="text-lg font-bold text-blue-600">
                    {success.cantidadGastos}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                Cerrando automáticamente...
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet className="text-green-600" size={28} />
                Enviar Reporte Excel
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

        {/* Info del evento */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Evento</p>
          <p className="font-semibold text-gray-800">{nombreEvento}</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleccionar Destinatario (País) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} />
              País / Destinatario
            </label>
            {loadingDestinatarios ? (
              <div className="text-sm text-gray-500">Cargando destinatarios...</div>
            ) : (
              <select
                value={formData.codigoPais}
                onChange={(e) => handleDestinatarioChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccione un país</option>
                {destinatarios.map((dest) => (
                  <option key={dest.codigoPais} value={dest.codigoPais}>
                    {dest.nombrePais} - {dest.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Nombre del Proveedor */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={16} />
              Nombre del Proveedor
            </label>
            <input
              type="text"
              placeholder="Ej: SUBWAY DE GUATEMALA"
              value={formData.nombreProveedor}
              onChange={(e) =>
                setFormData({ ...formData, nombreProveedor: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Opcional. Se usará en el asunto del correo.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Vista previa del asunto */}
          {formData.codigoPais && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Asunto del correo:</p>
              <p className="font-mono text-sm text-gray-800">
                {formData.codigoPais}-
                {formData.nombreProveedor || '[PROVEEDOR]'}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.codigoPais}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Reporte
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info adicional */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            ℹ️ Al enviar el reporte, el evento cambiará a estado "completado"
            y no podrá agregar más gastos.
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
