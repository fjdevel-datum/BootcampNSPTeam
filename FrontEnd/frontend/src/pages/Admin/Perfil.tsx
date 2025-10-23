import { ArrowLeft, Mail, Phone, Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminPerfil() {
  const navigate = useNavigate();

  const adminInfo = {
    nombre: "Administrador Sistema",
    email: "admin@datum.com",
    telefono: "+503 2222 3333",
    rol: "Super Administrador",
    departamento: "Sistemas",
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

          <h1 className="text-xl font-bold text-white">Mi Perfil de Administrador</h1>

          <div className="w-40"></div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
              <div className="h-24 w-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                AD
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{adminInfo.nombre}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-600 font-medium">{adminInfo.rol}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                  <User className="h-4 w-4" />
                  Nombre Completo
                </label>
                <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                  {adminInfo.nombre}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                  <Mail className="h-4 w-4" />
                  Correo Electrónico
                </label>
                <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                  {adminInfo.email}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </label>
                <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                  {adminInfo.telefono}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                  <Shield className="h-4 w-4" />
                  Rol
                </label>
                <p className="px-4 py-3 bg-orange-50 rounded-lg text-orange-900 font-medium">
                  {adminInfo.rol}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                  <User className="h-4 w-4" />
                  Departamento
                </label>
                <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                  {adminInfo.departamento}
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Permisos de Administrador</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Gestión completa de usuarios</li>
                <li>✓ Administración de tarjetas corporativas</li>
                <li>✓ Asignación de tarjetas a empleados</li>
                <li>✓ Visualización de reportes del sistema</li>
                <li>✓ Configuración general del sistema</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
