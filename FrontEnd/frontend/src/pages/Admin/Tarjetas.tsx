import { ArrowLeft, CreditCard, Plus, Trash2, UserPlus, X, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarTarjetas, eliminarTarjeta } from "../../services/tarjetas";
import { getTipoTarjeta, getNombreCompletoEmpleado, formatearNumeroTarjeta } from "../../types/tarjeta";

interface TarjetaEmpresa {
  id: number;
  numero: string;
  tipo: "visa" | "mastercard" | "amex" | "other";
  vencimiento: string;
  banco: string;
  asignadoA: string | null;
  colorClass: string;
  idPais: number;
  nombrePais: string;
}

// Función para generar colores aleatorios para las tarjetas
function getRandomColorClass(): string {
  const colors = [
    "from-blue-600 to-blue-800",
    "from-slate-700 to-slate-900",
    "from-emerald-600 to-emerald-800",
    "from-purple-600 to-purple-800",
    "from-orange-600 to-orange-800",
    "from-red-600 to-red-800",
    "from-indigo-600 to-indigo-800",
    "from-pink-600 to-pink-800",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function AdminTarjetas() {
  const navigate = useNavigate();
  const [tarjetas, setTarjetas] = useState<TarjetaEmpresa[]>([]);
  const [filterAsignadas, setFilterAsignadas] = useState<"todas" | "asignadas" | "disponibles">("todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tarjetaAEliminar, setTarjetaAEliminar] = useState<TarjetaEmpresa | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar tarjetas desde el backend
  useEffect(() => {
    cargarTarjetas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarTarjetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const tarjetasBackend = await listarTarjetas();
      
      // Transformar datos del backend al formato del componente
      const tarjetasTransformadas: TarjetaEmpresa[] = tarjetasBackend.map((t) => ({
        id: t.idTarjeta,
        numero: t.numeroTarjeta,
        tipo: getTipoTarjeta(t.numeroTarjeta),
        vencimiento: formatearFechaVencimiento(t.fechaExpiracion),
        banco: t.banco,
        asignadoA: getNombreCompletoEmpleado(t.empleado),
        colorClass: getRandomColorClass(),
        idPais: t.idPais,
        nombrePais: t.nombrePais,
      }));
      
      setTarjetas(tarjetasTransformadas);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar tarjetas";
      setError(errorMsg);
      console.error("Error cargando tarjetas:", err);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha ISO a MM/YY
  const formatearFechaVencimiento = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = String(fecha.getFullYear()).slice(-2);
    return `${mes}/${anio}`;
  };

  const handleDeleteCard = async (id: number) => {
    const tarjeta = tarjetas.find((t) => t.id === id);
    if (!tarjeta) return;
    
    setTarjetaAEliminar(tarjeta);
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!tarjetaAEliminar) return;

    try {
      setEliminando(true);
      await eliminarTarjeta(tarjetaAEliminar.id);
      await cargarTarjetas();
      setShowDeleteModal(false);
      setTarjetaAEliminar(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al eliminar tarjeta";
      alert(errorMsg);
      console.error("Error eliminando tarjeta:", err);
    } finally {
      setEliminando(false);
    }
  };

  const cancelarEliminacion = () => {
    setShowDeleteModal(false);
    setTarjetaAEliminar(null);
  };

  const filteredTarjetas = tarjetas.filter((tarjeta) => {
    if (filterAsignadas === "asignadas") return tarjeta.asignadoA !== null && tarjeta.asignadoA !== "Sin asignar";
    if (filterAsignadas === "disponibles") return tarjeta.asignadoA === null || tarjeta.asignadoA === "Sin asignar";
    return true;
  });

  const stats = {
    total: tarjetas.length,
    asignadas: tarjetas.filter((t) => t.asignadoA !== null && t.asignadoA !== "Sin asignar").length,
    disponibles: tarjetas.filter((t) => t.asignadoA === null || t.asignadoA === "Sin asignar").length,
  };

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Volver al Dashboard</span>
          </button>

          <h1 className="text-xl font-bold text-white">Gestión de Tarjetas Corporativas</h1>

          <button
            onClick={() => navigate("/admin/tarjetas/nueva")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
          >
            <Plus className="h-5 w-5" />
            Nueva Tarjeta
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={cargarTarjetas}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-600">Cargando tarjetas...</p>
              </div>
            </div>
          )}

          {/* Content when not loading */}
          {!loading && (
            <>
              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total de Tarjetas</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Asignadas</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.asignadas}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Disponibles</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.disponibles}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Filtrar:</span>
              <button
                onClick={() => setFilterAsignadas("todas")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterAsignadas === "todas"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterAsignadas("asignadas")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterAsignadas === "asignadas"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Asignadas
              </button>
              <button
                onClick={() => setFilterAsignadas("disponibles")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterAsignadas === "disponibles"
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Disponibles
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTarjetas.map((tarjeta) => (
              <div key={tarjeta.id} className="relative group">
                <div
                  className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${tarjeta.colorClass} text-white min-h-[240px] flex flex-col justify-between`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium opacity-80">Tarjeta Corporativa</p>
                        <p className="text-sm font-semibold capitalize">{tarjeta.tipo}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {(tarjeta.asignadoA === null || tarjeta.asignadoA === "Sin asignar") && (
                        <button
                          onClick={() =>
                            navigate(`/admin/tarjetas/${tarjeta.id}/asignar`)
                          }
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition"
                          title="Asignar a usuario"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCard(tarjeta.id)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition"
                        title="Eliminar tarjeta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chip */}
                  <div className="my-4">
                    <div className="h-10 w-14 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-90"></div>
                  </div>

                  {/* Número */}
                  <div className="mb-4">
                    <p className="text-xl font-mono tracking-wider">{formatearNumeroTarjeta(tarjeta.numero)}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs opacity-70 mb-1">Vence</p>
                      <p className="text-sm font-semibold">{tarjeta.vencimiento}</p>
                    </div>
                    <div className="text-right">
                      {tarjeta.asignadoA && tarjeta.asignadoA !== "Sin asignar" ? (
                        <>
                          <p className="text-xs opacity-70 mb-1">Asignada a</p>
                          <p className="text-sm font-semibold">{tarjeta.asignadoA}</p>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTarjetas.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No hay tarjetas con este filtro</p>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && tarjetaAEliminar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Eliminar Tarjeta
                </h3>
                <p className="text-sm text-slate-600">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            {/* Información de la tarjeta */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Número:</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatearNumeroTarjeta(tarjetaAEliminar.numero)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Banco:</span>
                  <span className="font-medium text-slate-900">
                    {tarjetaAEliminar.banco}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Asignada a:</span>
                  <span className="font-medium text-slate-900">
                    {tarjetaAEliminar.asignadoA || "Sin asignar"}
                  </span>
                </div>
              </div>
            </div>

            {/* Advertencia */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Al eliminar esta tarjeta, se perderá toda la información asociada.
                </span>
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={cancelarEliminacion}
                disabled={eliminando}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                disabled={eliminando}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {eliminando ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
