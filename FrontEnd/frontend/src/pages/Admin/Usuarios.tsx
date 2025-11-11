import {
  ArrowLeft,
  Search,
  Mail,
  Phone,
  Briefcase,
  Building2,
  UserPlus,
  CreditCard,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { listarEmpleados } from "../../services/empleados";
import type { UsuarioAdmin } from "../../types/empleado";

interface FetchState {
  loading: boolean;
  error: string | null;
}

function getInitials(usuario: UsuarioAdmin): string {
  const nombre = usuario.nombre ?? "";
  const apellido = usuario.apellido ?? "";
  const fuente = `${nombre} ${apellido}`.trim() || usuario.usuarioApp;
  return fuente
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UsuarioAdmin | null>(null);
  const [{ loading, error }, setFetchState] = useState<FetchState>({
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    const fetchUsuarios = async () => {
      setFetchState({ loading: true, error: null });
      try {
        const data = await listarEmpleados();
        if (active) {
          setUsuarios(data);
          setFetchState({ loading: false, error: null });
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error ? err.message : "No se pudieron cargar los usuarios.";
          setFetchState({ loading: false, error: message });
        }
      }
    };

    fetchUsuarios();
    return () => {
      active = false;
    };
  }, []);

  const filteredUsuarios = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {
      const nombre = `${usuario.nombre ?? ""} ${usuario.apellido ?? ""}`.toLowerCase();
      return (
        nombre.includes(term) ||
        (usuario.correo ?? "").toLowerCase().includes(term) ||
        usuario.usuarioApp.toLowerCase().includes(term)
      );
    });
  }, [usuarios, searchTerm]);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Volver al Dashboard</span>
          </button>

          <h1 className="text-xl font-bold text-white">Gestión de Usuarios</h1>

          <button
            onClick={() => navigate("/admin/usuarios/nuevo")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nuevo usuario</span>
          </button>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, usuario o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl p-6 shadow text-center text-slate-500">
              Cargando usuarios...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
              {error}
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow text-center text-slate-500">
              No se encontraron usuarios con ese criterio.
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredUsuarios.map((usuario) => (
                <article
                  key={usuario.idUsuario}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer border border-slate-200"
                  onClick={() => setSelectedUser(usuario)}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {getInitials(usuario)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {(usuario.nombre ?? "") + (usuario.apellido ? ` ${usuario.apellido}` : "")}
                        </h3>
                        <p className="text-sm text-slate-500">@{usuario.usuarioApp}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(usuario);
                      }}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition"
                    >
                      Ver detalles
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <InfoRow
                      icon={<Mail className="h-4 w-4 text-slate-400" />}
                      value={usuario.correo ?? "Sin correo registrado"}
                    />
                    <InfoRow
                      icon={<Phone className="h-4 w-4 text-slate-400" />}
                      value={usuario.telefono ?? "Sin telefono"}
                    />
                    <InfoRow
                      icon={<Briefcase className="h-4 w-4 text-slate-400" />}
                      value={usuario.cargo ?? "Sin cargo asignado"}
                    />
                    <InfoRow
                      icon={<Building2 className="h-4 w-4 text-slate-400" />}
                      value={usuario.departamento ?? "Sin departamento"}
                    />
                    <InfoRow
                      icon={<CreditCard className="h-4 w-4 text-slate-400" />}
                      value={
                        usuario.totalTarjetas > 0
                          ? `${usuario.totalTarjetas} tarjeta(s) corporativa(s)`
                          : "No posee tarjeta corporativa"
                      }
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-blue-500 text-white text-2xl font-bold flex items-center justify-center shadow-md">
                  {getInitials(selectedUser)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    {(selectedUser.nombre ?? "Sin nombre") +
                      (selectedUser.apellido ? ` ${selectedUser.apellido}` : "")}
                  </h2>
                  <p className="text-sm text-slate-500">@{selectedUser.usuarioApp}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoTile
                icon={<Mail className="h-5 w-5 text-slate-500" />}
                label="Correo electronico"
                value={selectedUser.correo ?? "No registrado"}
              />
              <InfoTile
                icon={<Phone className="h-5 w-5 text-slate-500" />}
                label="Telefono"
                value={selectedUser.telefono ?? "No registrado"}
              />
              <InfoTile
                icon={<Briefcase className="h-5 w-5 text-slate-500" />}
                label="Cargo"
                value={selectedUser.cargo ?? "Sin asignar"}
              />
              <InfoTile
                icon={<Building2 className="h-5 w-5 text-slate-500" />}
                label="Departamento"
                value={selectedUser.departamento ?? "Sin asignar"}
              />
              <InfoTile
                icon={<CreditCard className="h-5 w-5 text-slate-500" />}
                label="Tarjetas corporativas"
                value={
                  selectedUser.totalTarjetas > 0
                    ? `${selectedUser.totalTarjetas} tarjeta(s) asociada(s)`
                    : "No posee tarjeta corporativa"
                }
                highlight={selectedUser.totalTarjetas > 0}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

interface InfoTileProps {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoTile({ icon, label, value, highlight = false }: InfoTileProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <p className="text-slate-900 ml-8">{value}</p>
    </div>
  );
}

interface InfoRowProps {
  icon: ReactNode;
  value: string;
}

function InfoRow({ icon, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{value}</span>
    </div>
  );
}
