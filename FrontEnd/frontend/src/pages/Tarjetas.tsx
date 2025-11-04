import { ArrowLeft, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { obtenerMisTarjetas } from "../services/tarjetas";
import type { Tarjeta } from "../types/tarjeta";
import { getTipoTarjeta, formatearNumeroTarjeta } from "../types/tarjeta";

export default function TarjetasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarTarjetas();
  }, []);

  const cargarTarjetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerMisTarjetas();
      setTarjetas(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar tarjetas";
      setError(errorMsg);
      console.error("Error cargando tarjetas:", err);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para mostrar MM/YY
  const formatearFechaVencimiento = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = String(fecha.getFullYear()).slice(-2);
    return `${mes}/${anio}`;
  };

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
                {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  {user?.name || user?.username}
                </span>
                <span className="text-xs text-slate-500">Empleado</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Título */}
      <div className="bg-white px-6 py-8 text-center border-b border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CreditCard className="h-6 w-6 text-sky-600" />
          <h1 className="text-2xl font-bold text-slate-900">Mis Tarjetas</h1>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-sky-600 mb-4" />
              <p className="text-slate-600">Cargando tus tarjetas...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error al cargar tarjetas</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={cargarTarjetas}
                    className="mt-3 text-sm text-red-700 underline hover:no-underline"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sin tarjetas */}
          {!loading && !error && tarjetas.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  No posee tarjeta corporativa
                </h2>
                <p className="text-slate-600 mb-6">
                  Actualmente no tienes tarjetas corporativas asignadas. Si necesitas una,
                  contacta al departamento de Finanzas.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    ¿Necesitas una tarjeta corporativa?
                  </p>
                  <p className="text-sm text-blue-700">
                    Envía una solicitud al departamento de Finanzas indicando el motivo y
                    duración estimada de uso.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid de tarjetas */}
          {!loading && !error && tarjetas.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {tarjetas.map((tarjeta) => {
                  const tipoTarjeta = getTipoTarjeta(tarjeta.numeroTarjeta);
                  const numeroFormateado = formatearNumeroTarjeta(tarjeta.numeroTarjeta);
                  const fechaVencimiento = formatearFechaVencimiento(tarjeta.fechaExpiracion);

                  const colorClass = {
                    visa: "from-blue-600 to-blue-800",
                    mastercard: "from-slate-700 to-slate-900",
                    other: "from-purple-600 to-purple-800",
                  }[tipoTarjeta];

                  return (
                    <div key={tarjeta.idTarjeta} className="relative group">
                      <div
                        className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${colorClass} text-white min-h-[240px] flex flex-col justify-between transition-transform hover:scale-[1.02]`}
                      >
                        {/* Header de la tarjeta */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-medium opacity-80">
                                Tarjeta Corporativa
                              </p>
                              <p className="text-sm font-semibold capitalize">{tipoTarjeta}</p>
                            </div>
                          </div>
                        </div>

                        {/* Chip de la tarjeta */}
                        <div className="my-4">
                          <div className="h-10 w-14 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-90"></div>
                        </div>

                        {/* Número de tarjeta */}
                        <div className="mb-4">
                          <p className="text-xl font-mono tracking-wider">
                            {numeroFormateado}
                          </p>
                        </div>

                        {/* Footer: Banco y Vencimiento */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs opacity-70 mb-1">Banco</p>
                            <p className="text-sm font-semibold tracking-wide">
                              {tarjeta.banco}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-70 mb-1">Vence</p>
                            <p className="text-sm font-semibold">{fechaVencimiento}</p>
                          </div>
                        </div>

                        {/* Logo del tipo de tarjeta */}
                        <div className="absolute bottom-6 right-6">
                          {tipoTarjeta === "visa" && (
                            <div className="text-2xl font-bold italic opacity-30">VISA</div>
                          )}
                          {tipoTarjeta === "mastercard" && (
                            <div className="flex gap-[-8px]">
                              <div className="h-8 w-8 rounded-full bg-red-500 opacity-30"></div>
                              <div className="h-8 w-8 rounded-full bg-orange-400 opacity-30 -ml-4"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Información importante
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Las tarjetas corporativas están vinculadas a tu cuenta empresarial
                  </li>
                  <li>• Solo puedes usar las tarjetas para gastos autorizados</li>
                  <li>• En caso de extravío, notificar el incidente a Chief Administrative Officer junto al número de gestión del banco emisor de la tarjeta de crédito. </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
