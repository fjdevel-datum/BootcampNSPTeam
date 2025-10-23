import { CreditCard, Users, Settings, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Panel de Administrador</h1>
              <p className="text-xs text-slate-400">Sistema de Gestión Datum Travels</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dropdown de perfil de admin */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                  AD
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-white">Admin</span>
                  <span className="text-xs text-slate-400">Administrador</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Overlay para cerrar al hacer click afuera */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  
                  {/* Menu dropdown */}
                  <div className="absolute right-0 top-full mt-2 z-20 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2">
                    <button
                      onClick={() => {
                        navigate('/admin/perfil');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 transition flex items-center gap-3"
                    >
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-orange-500 text-white text-xs font-semibold">
                        AD
                      </div>
                      <div>
                        <p className="font-medium">Ver Mi Perfil</p>
                        <p className="text-xs text-slate-500">Configuración</p>
                      </div>
                    </button>
                    
                    <hr className="my-2 border-slate-200" />
                    
                    <button
                      onClick={() => {
                        navigate('/');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition font-medium flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Bienvenido al Panel de Administración</h2>
            <p className="text-slate-300">
              Gestiona usuarios, tarjetas corporativas y configuraciones del sistema
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Usuarios */}
            <button
              onClick={() => navigate("/admin/usuarios")}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">12</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Usuarios</h3>
              <p className="text-sm text-slate-500">Gestionar empleados y perfiles</p>
            </button>

            {/* Tarjetas */}
            <button
              onClick={() => navigate("/admin/tarjetas")}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">8</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Tarjetas</h3>
              <p className="text-sm text-slate-500">Gestionar tarjetas corporativas</p>
            </button>

            {/* Perfil Admin */}
            <button
              onClick={() => navigate("/admin/perfil")}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Mi Perfil</h3>
              <p className="text-sm text-slate-500">Configuración de administrador</p>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Acciones Rápidas</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/admin/usuarios/nuevo")}
                className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition text-left"
              >
                + Agregar Nuevo Usuario
              </button>
              <button
                onClick={() => navigate("/admin/tarjetas/nueva")}
                className="px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-medium transition text-left"
              >
                + Agregar Nueva Tarjeta
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
