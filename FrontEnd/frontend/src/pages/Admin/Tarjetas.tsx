import { ArrowLeft, CreditCard, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TarjetaEmpresa {
  id: string;
  numero: string;
  tipo: "visa" | "mastercard" | "amex";
  vencimiento: string;
  asignadoA: string | null;
  colorClass: string;
}

const tarjetasMock: TarjetaEmpresa[] = [
  {
    id: "1",
    numero: "4532 1234 5678 9010",
    tipo: "visa",
    vencimiento: "12/26",
    asignadoA: "Ann Lee",
    colorClass: "from-blue-600 to-blue-800",
  },
  {
    id: "2",
    numero: "5425 2334 3010 9903",
    tipo: "mastercard",
    vencimiento: "08/27",
    asignadoA: "Ann Lee",
    colorClass: "from-slate-700 to-slate-900",
  },
  {
    id: "3",
    numero: "3782 822463 10005",
    tipo: "amex",
    vencimiento: "03/28",
    asignadoA: "Juan Pérez",
    colorClass: "from-emerald-600 to-emerald-800",
  },
  {
    id: "4",
    numero: "4916 7890 1234 5678",
    tipo: "visa",
    vencimiento: "11/27",
    asignadoA: null,
    colorClass: "from-purple-600 to-purple-800",
  },
  {
    id: "5",
    numero: "5123 4567 8901 2345",
    tipo: "mastercard",
    vencimiento: "05/29",
    asignadoA: null,
    colorClass: "from-orange-600 to-orange-800",
  },
  {
    id: "6",
    numero: "4111 1111 1111 1111",
    tipo: "visa",
    vencimiento: "09/26",
    asignadoA: "Carlos Ramírez",
    colorClass: "from-red-600 to-red-800",
  },
];

export default function AdminTarjetas() {
  const navigate = useNavigate();
  const [tarjetas, setTarjetas] = useState<TarjetaEmpresa[]>(tarjetasMock);
  const [filterAsignadas, setFilterAsignadas] = useState<"todas" | "asignadas" | "disponibles">("todas");

  const handleDeleteCard = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta tarjeta?")) {
      setTarjetas((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const filteredTarjetas = tarjetas.filter((tarjeta) => {
    if (filterAsignadas === "asignadas") return tarjeta.asignadoA !== null;
    if (filterAsignadas === "disponibles") return tarjeta.asignadoA === null;
    return true;
  });

  const stats = {
    total: tarjetas.length,
    asignadas: tarjetas.filter((t) => t.asignadoA !== null).length,
    disponibles: tarjetas.filter((t) => t.asignadoA === null).length,
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
                      {tarjeta.asignadoA === null && (
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
                    <p className="text-xl font-mono tracking-wider">{tarjeta.numero}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs opacity-70 mb-1">Vence</p>
                      <p className="text-sm font-semibold">{tarjeta.vencimiento}</p>
                    </div>
                    <div className="text-right">
                      {tarjeta.asignadoA ? (
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

          {filteredTarjetas.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No hay tarjetas con este filtro</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
