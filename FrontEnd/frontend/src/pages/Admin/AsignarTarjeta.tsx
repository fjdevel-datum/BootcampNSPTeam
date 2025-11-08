import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  UserCheck,
} from "lucide-react";
import { asignarTarjeta, listarTarjetas } from "../../services/tarjetas";
import { listarEmpleados } from "../../services/empleados";
import type { Tarjeta } from "../../types/tarjeta";
import type { UsuarioAdmin } from "../../types/empleado";
import { getTipoTarjeta, formatearNumeroTarjeta } from "../../types/tarjeta";

export default function AdminAsignarTarjeta() {
  const navigate = useNavigate();
  const { idTarjeta } = useParams<{ idTarjeta: string }>();
  
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const [empleados, setEmpleados] = useState<UsuarioAdmin[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTarjeta]);

  const cargarDatos = async () => {
    if (!idTarjeta) {
      setError("ID de tarjeta no válido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [tarjetasData, empleadosData] = await Promise.all([
        listarTarjetas(),
        listarEmpleados(),
      ]);
      
      const tarjetaEncontrada = tarjetasData.find((t) => t.idTarjeta === Number(idTarjeta));
      
      if (!tarjetaEncontrada) {
        setError("Tarjeta no encontrada");
        return;
      }
      
      setTarjeta(tarjetaEncontrada);
      setEmpleados(empleadosData);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar datos";
      setError(errorMsg);
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!empleadoSeleccionado) {
      setSubmitError("Debes seleccionar un empleado");
      return;
    }

    if (!tarjeta) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccess(false);

    try {
      await asignarTarjeta({
        idTarjeta: tarjeta.idTarjeta,
        idEmpleado: Number(empleadoSeleccionado),
      });

      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/admin/tarjetas");
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al asignar tarjeta";
      setSubmitError(errorMsg);
      console.error("Error asignando tarjeta:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </main>
    );
  }

  if (error || !tarjeta) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error || "Tarjeta no encontrada"}</p>
          <button
            onClick={() => navigate("/admin/tarjetas")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Volver a Tarjetas
          </button>
        </div>
      </main>
    );
  }

  // Ya está asignada
  if (tarjeta.empleado) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Tarjeta Ya Asignada</h2>
          <p className="text-slate-600 mb-2">
            Esta tarjeta ya está asignada a:
          </p>
          <p className="font-semibold text-slate-900 mb-4">
            {tarjeta.empleado.nombre} {tarjeta.empleado.apellido}
          </p>
          <button
            onClick={() => navigate("/admin/tarjetas")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Volver a Tarjetas
          </button>
        </div>
      </main>
    );
  }

  const tipoTarjeta = getTipoTarjeta(tarjeta.numeroTarjeta);
  const numeroFormateado = formatearNumeroTarjeta(tarjeta.numeroTarjeta);
  
  const fechaVencimiento = (() => {
    const fecha = new Date(tarjeta.fechaExpiracion);
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = String(fecha.getFullYear()).slice(-2);
    return `${mes}/${anio}`;
  })();

  const colorClass = {
    visa: "from-blue-600 to-blue-800",
    mastercard: "from-slate-700 to-slate-900",
    amex: "from-emerald-600 to-emerald-800",
    other: "from-purple-600 to-purple-800",
  }[tipoTarjeta];

  const empleadoSelec = empleados.find((e) => e.idEmpleado === Number(empleadoSeleccionado));

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

          <h1 className="text-xl font-bold text-white">Asignar Tarjeta a Empleado</h1>
          <div className="w-[140px]"></div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tarjeta Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Tarjeta a Asignar</h2>

              <div
                className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${colorClass} text-white min-h-[240px] flex flex-col justify-between`}
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
                    <p className="text-sm font-semibold">{tarjeta.banco}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">País</span>
                  <span className="font-medium text-slate-900">{tarjeta.nombrePais}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Estado</span>
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                    Disponible
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Seleccionar Empleado</h2>

              {submitError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm mt-1">{submitError}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">¡Tarjeta asignada exitosamente!</p>
                    <p className="text-sm mt-1">Redirigiendo...</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="empleado" className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="h-4 w-4 inline-block mr-1" />
                    Empleado *
                  </label>
                  <select
                    id="empleado"
                    value={empleadoSeleccionado}
                    onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona un empleado</option>
                    {empleados
                      .filter((e) => e.idEmpleado !== null)
                      .map((empleado) => (
                        <option key={empleado.idEmpleado} value={empleado.idEmpleado!}>
                          {empleado.nombre} {empleado.apellido} - {empleado.correo}
                        </option>
                      ))}
                  </select>
                </div>

                {empleadoSelec && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">
                          {empleadoSelec.nombre} {empleadoSelec.apellido}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">{empleadoSelec.correo}</p>
                        {empleadoSelec.cargo && (
                          <p className="text-sm text-blue-600 mt-1">
                            {empleadoSelec.cargo} - {empleadoSelec.departamento}
                          </p>
                        )}
                        <p className="text-xs text-blue-600 mt-2">
                          Tarjetas actuales: {empleadoSelec.totalTarjetas}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                    disabled={isSubmitting || success || !empleadoSeleccionado}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Asignando...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        ¡Asignada!
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-5 w-5" />
                        Asignar Tarjeta
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
