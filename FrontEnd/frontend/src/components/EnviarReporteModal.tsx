import { useState, useEffect } from 'react';
import { X, Send, FileSpreadsheet, FileText, MapPin, User } from 'lucide-react';
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

  const [formData, setFormData] = useState<EnviarReporteRequest>({
    emailDestino: '',
    codigoPais: '',
    nombreProveedor: '',
    formato: 'EXCEL',
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

  const handleDestinatarioChange = (email: string) => {
    const destinatario = destinatarios.find((d) => d.email === email);
    if (destinatario) {
      setFormData({
        ...formData,
        emailDestino: email,
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
        alert(`✅ ${response.mensaje}\n\nAsunto: ${response.asunto}\nGastos: ${response.cantidadGastos}`);
        onSuccess();
        onClose();
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📧 Enviar Reporte
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
          {/* Seleccionar Destinatario */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} />
              País / Destinatario
            </label>
            {loadingDestinatarios ? (
              <div className="text-sm text-gray-500">Cargando destinatarios...</div>
            ) : (
              <select
                value={formData.emailDestino}
                onChange={(e) => handleDestinatarioChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccione un país</option>
                {destinatarios.map((dest) => (
                  <option key={dest.codigoPais} value={dest.email}>
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

          {/* Formato del Reporte */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} />
              Formato del Reporte
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="formato"
                  value="EXCEL"
                  checked={formData.formato === 'EXCEL'}
                  onChange={(e) =>
                    setFormData({ ...formData, formato: e.target.value as 'EXCEL' })
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <FileSpreadsheet size={20} className="text-green-600" />
                <span>Excel (.xlsx)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="formato"
                  value="PDF"
                  checked={formData.formato === 'PDF'}
                  onChange={(e) =>
                    setFormData({ ...formData, formato: e.target.value as 'PDF' })
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <FileText size={20} className="text-red-600" />
                <span>PDF</span>
              </label>
            </div>
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
              disabled={loading || !formData.emailDestino}
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
      </div>
    </div>
  );
}
