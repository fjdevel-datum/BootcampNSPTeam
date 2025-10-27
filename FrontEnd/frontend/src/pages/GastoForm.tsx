import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { GastoFormData } from "../types/gasto";
import {
  analyzeExpenseImage,
  buildPayloadFromFormData,
  parseLlmResponse,
  saveGastoFromLlm,
  uploadGastoFile,
} from "../services/ocr";
import { obtenerCategorias, type CategoriaGasto } from "../services/categorias";

interface GastoFormProps {
  imageData?: string;
  imageType?: "camera" | "file";
  fileName?: string;
  sourceFile?: File;
  onSave?: (result: { formData: GastoFormData; gastoId: number; llmJson: string }) => void;
  onCancel?: () => void;
}

interface LocationState {
  imageData: string;
  imageType: "camera" | "file";
  fileName?: string;
  sourceFile: File;
}

const DEFAULT_FORM: GastoFormData = {
  nombreEmpresa: "",
  descripcion: "",
  montoTotal: "",
  fecha: "",
  idCategoria: "",
};

const FILE_LABEL: Record<"camera" | "file", string> = {
  camera: "Foto capturada",
  file: "Archivo seleccionado",
};

export default function GastoForm({
  imageData: propImageData,
  imageType: propImageType,
  fileName: propFileName,
  sourceFile: propSourceFile,
  onSave: propOnSave,
  onCancel: propOnCancel,
}: GastoFormProps) {
  const navigate = useNavigate();
  const { eventName } = useParams<{ eventName: string }>();
  const location = useLocation();
  
  // Determinar si estamos en modo ruta (nueva funcionalidad) o modo modal (legacy)
  const locationState = location.state as LocationState | null;
  const isRouteMode = Boolean(locationState);
  
  // Usar datos de location.state si estamos en modo ruta, sino usar props
  const imageData = isRouteMode ? locationState!.imageData : propImageData!;
  const imageType = isRouteMode ? locationState!.imageType : propImageType!;
  const fileName = isRouteMode ? locationState?.fileName : propFileName;
  const sourceFile = isRouteMode ? locationState!.sourceFile : propSourceFile!;
  
  const [formData, setFormData] = useState<GastoFormData>(DEFAULT_FORM);
  const [llmJson, setLlmJson] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState<boolean>(true);

  // Handler para cancelar
  const handleCancel = () => {
    if (isRouteMode) {
      navigate(`/event/${eventName}`);
    } else if (propOnCancel) {
      propOnCancel();
    }
  };

  // Handler para guardar exitoso
  const handleSaveSuccess = (result: { formData: GastoFormData; gastoId: number; llmJson: string }) => {
    if (isRouteMode) {
      // Regresar a la vista del evento
      navigate(`/event/${eventName}`, { state: { gastoCreado: true } });
    } else if (propOnSave) {
      propOnSave(result);
    }
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    let cancelled = false;

    const cargarCategorias = async () => {
      try {
        const categoriasObtenidas = await obtenerCategorias();
        if (!cancelled) {
          setCategorias(categoriasObtenidas);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error al cargar categorías:", err);
          setError("No se pudieron cargar las categorías de gasto.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCategorias(false);
        }
      }
    };

    cargarCategorias();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsAnalyzing(true);
      setError(null);
      setWarning(null);
      setFormData(DEFAULT_FORM);

      try {
        const analysis = await analyzeExpenseImage(sourceFile);
        if (cancelled) return;

        const parsed = parseLlmResponse(analysis.llmResponse);
        setFormData(parsed.formData);
        setLlmJson(parsed.cleanedJsonString);
        if (parsed.error) {
          setWarning(parsed.error);
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "No se pudo procesar la imagen con el OCR.";
        setError(message);
      } finally {
        if (!cancelled) {
          setIsAnalyzing(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [sourceFile]);

  const fileDescriptor = useMemo(() => {
    const label = FILE_LABEL[imageType];
    return fileName ? `${label} - ${fileName}` : label;
  }, [imageType, fileName]);

  const handleChange = (field: keyof GastoFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAmountBlur = () => {
    const normalized = normalizeAmount(formData.montoTotal);
    if (normalized !== null) {
      setFormData((prev) => ({
        ...prev,
        montoTotal: normalized,
      }));
    }
  };

  const handleSaveClick = async () => {
    setError(null);
    setWarning(null);

    if (!formData.nombreEmpresa.trim()) {
      setError("Ingresa el nombre de la empresa.");
      return;
    }

    if (!formData.idCategoria) {
      setError("Debes seleccionar una categoría de gasto.");
      return;
    }

    const amount = normalizeAmount(formData.montoTotal);
    if (amount === null) {
      setError("El monto total no es valido. Usa solo numeros y dos decimales.");
      return;
    }

    const sanitized: GastoFormData = {
      nombreEmpresa: formData.nombreEmpresa.trim(),
      descripcion: formData.descripcion.trim(),
      montoTotal: amount,
      fecha: formData.fecha,
      idCategoria: formData.idCategoria,
    };

    setFormData(sanitized);
    setIsSaving(true);

    try {
      const payload = buildPayloadFromFormData(sanitized);
      const saved = await saveGastoFromLlm(payload);
      const gastoId = saved.id ?? saved.idGasto ?? saved.id_gasto;
      if (!gastoId) {
        throw new Error("El backend no devolvio un identificador valido del gasto.");
      }

      await uploadGastoFile(gastoId, sourceFile);
      const updatedJson = JSON.stringify(payload);
      setLlmJson(updatedJson);

      handleSaveSuccess({ formData: sanitized, gastoId, llmJson: updatedJson });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ocurrio un problema al guardar el gasto o subir el archivo.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Estas seguro de eliminar esta imagen?")) {
      handleCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h2 className="text-xl font-bold">Gasto detectado</h2>
          <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 pb-32">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="w-full h-96 flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden relative">
                <img
                  src={imageData}
                  alt="Factura capturada"
                  className="max-w-full max-h-full object-contain"
                />
                {(isAnalyzing || isSaving) && (
                  <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
                    <span className="text-sm text-slate-600">
                      {isSaving ? "Guardando gasto..." : "Procesando imagen..."}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-2 text-center">{fileDescriptor}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Datos del gasto</h3>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {warning && !error && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {warning}
                </div>
              )}

              <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.nombreEmpresa}
                    onChange={handleChange("nombreEmpresa")}
                    placeholder="Texaco"
                    disabled={isAnalyzing || isSaving}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripcion
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={handleChange("descripcion")}
                    placeholder="Compra de combustible"
                    disabled={isAnalyzing || isSaving}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monto Total
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.montoTotal}
                    onChange={handleChange("montoTotal")}
                    onBlur={handleAmountBlur}
                    placeholder="25.00"
                    disabled={isAnalyzing || isSaving}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange("fecha")}
                    disabled={isAnalyzing || isSaving}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  {isLoadingCategorias ? (
                    <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando categorías...</span>
                    </div>
                  ) : (
                    <select
                      value={formData.idCategoria}
                      onChange={handleChange("idCategoria")}
                      disabled={isAnalyzing || isSaving}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="">-- Selecciona una categoría --</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.idCategoria} value={categoria.idCategoria}>
                          {categoria.nombreCategoria}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  Verifica los datos antes de guardar. Puedes editarlos si el OCR no los detecto
                  correctamente.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition"
            disabled={isSaving}
          >
            Regresar
          </button>
          <button
            onClick={handleSaveClick}
            className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isAnalyzing || isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar gasto"}
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
            disabled={isSaving}
          >
            Eliminar imagen
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeAmount(value: string): string | null {
  if (!value) {
    return null;
  }
  const cleaned = value.replace(/[^\d,.-]/g, "");
  if (!cleaned) {
    return null;
  }
  const decimalComma = cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".");
  let normalized = cleaned;
  if (decimalComma) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = cleaned.replace(/,/g, "");
  }
  const numeric = Number.parseFloat(normalized);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return numeric.toFixed(2);
}
