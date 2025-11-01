import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  Globe,
  User,
} from "lucide-react";
import { crearTarjeta } from "../../services/tarjetas";
import { listarPaises, type Pais } from "../../services/paises";
import { listarEmpleados } from "../../services/empleados";
import type { UsuarioAdmin } from "../../types/empleado";
import { getTipoTarjeta, formatearNumeroTarjeta } from "../../types/tarjeta";

const INITIAL_FORM = {
  banco: "",
  numeroTarjeta: "",
  fechaExpiracion: "",
  idPais: "",
  idEmpleado: "",
};

type FormState = typeof INITIAL_FORM;
type FormField = keyof FormState;

export default function AdminNuevaTarjeta() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Datos de catálogos
  const [paises, setPaises] = useState<Pais[]>([]);
  const [empleados, setEmpleados] = useState<UsuarioAdmin[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Cargar catálogos al montar
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      const [paisesData, empleadosData] = await Promise.all([
        listarPaises(),
        listarEmpleados(),
      ]);
      setPaises(paisesData);
      setEmpleados(empleadosData);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const handleChange = (field: FormField) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = event.target.value;
    
    // Formatear número de tarjeta automáticamente
    if (field === "numeroTarjeta") {
      value = value.replace(/\D/g, ""); // Solo números
      if (value.length > 19) value = value.slice(0, 19);
    }
    
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<FormField, string>> = {};

    if (!form.banco.trim()) {
      newErrors.banco = "El banco es requerido.";
    }

    if (!form.numeroTarjeta.trim()) {
      newErrors.numeroTarjeta = "El número de tarjeta es requerido.";
    } else if (form.numeroTarjeta.replace(/\s/g, "").length < 15) {
      newErrors.numeroTarjeta = "El número debe tener al menos 15 dígitos.";
    }

    if (!form.fechaExpiracion) {
      newErrors.fechaExpiracion = "La fecha de expiración es requerida.";
    } else {
      const fechaSeleccionada = new Date(form.fechaExpiracion);
      const hoy = new Date();
      if (fechaSeleccionada <= hoy) {
        newErrors.fechaExpiracion = "La fecha debe ser futura.";
      }
    }

    if (!form.idPais) {
      newErrors.idPais = "Debes seleccionar un país.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await crearTarjeta({
        banco: form.banco.trim(),
        numeroTarjeta: form.numeroTarjeta.replace(/\s/g, ""),
        fechaExpiracion: form.fechaExpiracion,
        idPais: Number(form.idPais),
        idEmpleado: form.idEmpleado ? Number(form.idEmpleado) : null,
      });

      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/admin/tarjetas");
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al crear la tarjeta";
      setSubmitError(errorMsg);
      console.error("Error creando tarjeta:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Datos para el preview de la tarjeta
  const tipoTarjeta = getTipoTarjeta(form.numeroTarjeta);
  const numeroFormateado = formatearNumeroTarjeta(form.numeroTarjeta) || "•••• •••• •••• ••••";
  const paisSeleccionado = paises.find((p) => p.idPais === Number(form.idPais));
  const empleadoSeleccionado = empleados.find((e) => e.idEmpleado === Number(form.idEmpleado));
  
  // Formatear fecha para mostrar MM/YY
  const fechaVencimiento = form.fechaExpiracion
    ? (() => {
        const fecha = new Date(form.fechaExpiracion);
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const anio = String(fecha.getFullYear()).slice(-2);
        return `${mes}/${anio}`;
      })()
    : "MM/YY";

  // Color basado en tipo de tarjeta
  const colorClass = {
    visa: "from-blue-600 to-blue-800",
    mastercard: "from-slate-700 to-slate-900",
    amex: "from-emerald-600 to-emerald-800",
    other: "from-purple-600 to-purple-800",
  }[tipoTarjeta];

  if (loadingCatalogos) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando formulario...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/tarjetas")}
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Volver a Tarjetas</span>
          </button>

          <h1 className="text-xl font-bold text-white">Nueva Tarjeta Corporativa</h1>
          <div className="w-[140px]"></div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Datos de la Tarjeta</h2>

              {submitError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error al crear tarjeta</p>
                    <p className="text-sm mt-1">{submitError}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">¡Tarjeta creada exitosamente!</p>
                    <p className="text-sm mt-1">Redirigiendo...</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Banco */}
                <div>
                  <label htmlFor="banco" className="block text-sm font-medium text-slate-700 mb-2">
                    <Building2 className="h-4 w-4 inline-block mr-1" />
                    Banco Emisor *
                  </label>
                  <input
                    id="banco"
                    type="text"
                    value={form.banco}
                    onChange={handleChange("banco")}
                    placeholder="Ej: Banco Agrícola, BAC, etc."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.banco ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors.banco && <p className="mt-1 text-sm text-red-600">{errors.banco}</p>}
                </div>

                {/* Número de Tarjeta */}
                <div>
                  <label htmlFor="numeroTarjeta" className="block text-sm font-medium text-slate-700 mb-2">
                    <CreditCard className="h-4 w-4 inline-block mr-1" />
                    Número de Tarjeta *
                  </label>
                  <input
                    id="numeroTarjeta"
                    type="text"
                    value={form.numeroTarjeta}
                    onChange={handleChange("numeroTarjeta")}
                    placeholder="1234567890123456"
                    maxLength={19}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                      errors.numeroTarjeta ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors.numeroTarjeta && <p className="mt-1 text-sm text-red-600">{errors.numeroTarjeta}</p>}
                  <p className="mt-1 text-xs text-slate-500">Solo números (15-19 dígitos)</p>
                </div>

                {/* Fecha de Expiración */}
                <div>
                  <label htmlFor="fechaExpiracion" className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    Fecha de Expiración *
                  </label>
                  <input
                    id="fechaExpiracion"
                    type="date"
                    value={form.fechaExpiracion}
                    onChange={handleChange("fechaExpiracion")}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.fechaExpiracion ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors.fechaExpiracion && <p className="mt-1 text-sm text-red-600">{errors.fechaExpiracion}</p>}
                </div>

                {/* País */}
                <div>
                  <label htmlFor="idPais" className="block text-sm font-medium text-slate-700 mb-2">
                    <Globe className="h-4 w-4 inline-block mr-1" />
                    País *
                  </label>
                  <select
                    id="idPais"
                    value={form.idPais}
                    onChange={handleChange("idPais")}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.idPais ? "border-red-500" : "border-slate-300"
                    }`}
                  >
                    <option value="">Selecciona un país</option>
                    {paises.map((pais) => (
                      <option key={pais.idPais} value={pais.idPais}>
                        {pais.nombrePais}
                      </option>
                    ))}
                  </select>
                  {errors.idPais && <p className="mt-1 text-sm text-red-600">{errors.idPais}</p>}
                </div>

                {/* Empleado (Opcional) */}
                <div>
                  <label htmlFor="idEmpleado" className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="h-4 w-4 inline-block mr-1" />
                    Asignar a Empleado (Opcional)
                  </label>
                  <select
                    id="idEmpleado"
                    value={form.idEmpleado}
                    onChange={handleChange("idEmpleado")}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sin asignar</option>
                    {empleados
                      .filter((e) => e.idEmpleado !== null)
                      .map((empleado) => (
                        <option key={empleado.idEmpleado} value={empleado.idEmpleado!}>
                          {empleado.nombre} {empleado.apellido} - {empleado.correo}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Puedes asignarla ahora o después
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/tarjetas")}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || success}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creando...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        ¡Creada!
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        Crear Tarjeta
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview de la Tarjeta */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Vista Previa</h2>

              <div className="space-y-6">
                {/* Tarjeta Preview */}
                <div
                  className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${colorClass} text-white min-h-[240px] flex flex-col justify-between transform transition-all duration-300 hover:scale-105`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium opacity-80">Tarjeta Corporativa</p>
                        <p className="text-sm font-semibold capitalize">{tipoTarjeta}</p>
                      </div>
                    </div>
                  </div>

                  {/* Chip */}
                  <div className="my-4">
                    <div className="h-10 w-14 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-90"></div>
                  </div>

                  {/* Número */}
                  <div className="mb-4">
                    <p className="text-xl font-mono tracking-wider">{numeroFormateado}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs opacity-70 mb-1">Vence</p>
                      <p className="text-sm font-semibold">{fechaVencimiento}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-70 mb-1">Banco</p>
                      <p className="text-sm font-semibold">{form.banco || "---"}</p>
                    </div>
                  </div>
                </div>

                {/* Info adicional */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      País
                    </span>
                    <span className="font-medium text-slate-900">
                      {paisSeleccionado?.nombrePais || "No seleccionado"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Asignada a
                    </span>
                    <span className="font-medium text-slate-900">
                      {empleadoSeleccionado ? `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido}` : "Sin asignar"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Tipo detectado</span>
                    <span className="font-medium text-slate-900 capitalize">{tipoTarjeta}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
