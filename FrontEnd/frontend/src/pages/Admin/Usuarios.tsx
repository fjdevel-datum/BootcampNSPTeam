import { ArrowLeft, Search, Mail, Phone, User, Briefcase, CreditCard, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  posicion: string;
  departamento: string;
  tarjetasAsignadas: number;
}

const usuariosMock: Usuario[] = [
  {
    id: "1",
    nombre: "Ann Lee",
    email: "ann.lee@datum.com",
    telefono: "+503 7889 9999",
    posicion: "Coordinadora",
    departamento: "Operaciones",
    tarjetasAsignadas: 2,
  },
  {
    id: "2",
    nombre: "Juan Pérez",
    email: "juan.perez@datum.com",
    telefono: "+503 7123 4567",
    posicion: "Gerente de Ventas",
    departamento: "Ventas",
    tarjetasAsignadas: 1,
  },
  {
    id: "3",
    nombre: "María González",
    email: "maria.gonzalez@datum.com",
    telefono: "+503 7456 7890",
    posicion: "Analista",
    departamento: "Finanzas",
    tarjetasAsignadas: 0,
  },
  {
    id: "4",
    nombre: "Carlos Ramírez",
    email: "carlos.ramirez@datum.com",
    telefono: "+503 7890 1234",
    posicion: "Director",
    departamento: "TI",
    tarjetasAsignadas: 3,
  },
];

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [usuarios] = useState<Usuario[]>(usuariosMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  const filteredUsuarios = usuarios.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredUsuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {usuario.nombre.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {usuario.nombre}
                      </h3>
                      <p className="text-sm text-slate-500">{usuario.posicion}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(usuario)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition"
                  >
                    Ver Detalles
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{usuario.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{usuario.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{usuario.departamento}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">
                      {usuario.tarjetasAsignadas} tarjeta(s) asignada(s)
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => navigate(`/admin/usuarios/${usuario.id}/asignar-tarjeta`)}
                    className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-sm font-medium transition"
                  >
                    Asignar Tarjeta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.nombre.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedUser.nombre}
                  </h2>
                  <p className="text-slate-500">{selectedUser.posicion}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-700">Correo Electrónico</span>
                </div>
                <p className="text-slate-900 ml-8">{selectedUser.email}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-700">Teléfono</span>
                </div>
                <p className="text-slate-900 ml-8">{selectedUser.telefono}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-700">Posición</span>
                </div>
                <p className="text-slate-900 ml-8">{selectedUser.posicion}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-700">Departamento</span>
                </div>
                <p className="text-slate-900 ml-8">{selectedUser.departamento}</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-700">Tarjetas Asignadas</span>
                </div>
                <p className="text-orange-900 ml-8 text-lg font-semibold">
                  {selectedUser.tarjetasAsignadas} tarjeta(s)
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  navigate(`/admin/usuarios/${selectedUser.id}/asignar-tarjeta`);
                  setSelectedUser(null);
                }}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
              >
                Asignar Tarjeta
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition"
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
