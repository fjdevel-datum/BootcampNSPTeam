import { X } from "lucide-react";
import { useState } from "react";

interface GastoFormProps {
  imageData: string;
  imageType: 'camera' | 'file';
  fileName?: string;
  onSave: (data: GastoFormData) => void;
  onCancel: () => void;
}

export interface GastoFormData {
  nombreEmpresa: string;
  descripcion: string;
  montoTotal: string;
  fecha: string;
}

export default function GastoForm({ imageData, imageType, fileName, onSave, onCancel }: GastoFormProps) {
  const [formData, setFormData] = useState<GastoFormData>({
    nombreEmpresa: '',
    descripcion: '',
    montoTotal: '',
    fecha: ''
  });

  const handleSave = () => {
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar esta imagen?')) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h2 className="text-xl font-bold">Gasto detectado</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 pb-32">
        {/* Grid de 2 columnas: Imagen y Formulario */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna izquierda: Imagen capturada */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              {/* Contenedor con altura fija para la imagen */}
              <div className="w-full h-96 flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden">
                <img
                  src={imageData}
                  alt="Factura capturada"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <p className="text-sm text-slate-500 mt-2 text-center">
                {imageType === 'camera' ? '📷 Foto capturada' : '📁 Archivo seleccionado'}
                {fileName && ` • ${fileName}`}
              </p>
            </div>
          </div>

          {/* Columna derecha: Formulario */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Datos del gasto
              </h3>

              <form className="space-y-4">
                {/* Nombre Empresa */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.nombreEmpresa}
                    onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})}
                    placeholder="Texaco"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Compra de combustible"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Monto Total */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monto Total
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montoTotal}
                    onChange={(e) => setFormData({...formData, montoTotal: e.target.value})}
                    placeholder="25.00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Nota informativa */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    * Por ahora es solo visual. Si quieres, luego lo conectamos para editar/actualizar en BD.
                  </p>
                </div>
              </form>

              {/* Información adicional - Simulando datos JSON del OCR */}
              <div className="mt-6 bg-slate-900 rounded-lg p-4">
                <p className="text-xs text-slate-400 font-mono">
                  {JSON.stringify({
                    fileSize: 66852,
                    contentType: "image/jpeg",
                    blobName: "gastos/21/Imagen de WhatsApp 2025-09-24 a las 08.34.50_8050fc30.jpg",
                    id: 21,
                    blobUrl: "https://storageocr2025.blob.core.windows.net/..."
                  }, null, 2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer fijo con botones */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition"
          >
            REGRESAR
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Subir Nueva Imagen
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
          >
            Eliminar Imagen
          </button>
        </div>
      </div>
    </div>
  );
}
