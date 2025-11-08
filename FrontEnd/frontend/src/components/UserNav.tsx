/**
 * Componente de navegación con información del usuario y logout
 */

import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// 🔥 LOG INMEDIATO AL CARGAR EL MÓDULO
console.log('🔥🔥🔥 UserNav.tsx CARGADO - VERSIÓN NUEVA 🔥🔥🔥');

export default function UserNav() {
  const { user, logout, isAdmin } = useAuth();
  
  console.log('🔵 UserNav renderizado - usuario:', user?.username);

  const handleLogout = async () => {
    // DEBUG ULTRA VISIBLE
    alert('🚪 LOGOUT INICIADO - Revisa la consola');
    console.log('═══════════════════════════════════════');
    console.log('👋 [UserNav] Botón logout clickeado');
    console.log('═══════════════════════════════════════');
    
    // Primero limpiar tokens y estado
    await logout();
    
    console.log('═══════════════════════════════════════');
    console.log('🔄 [UserNav] Redirigiendo a /...');
    console.log('═══════════════════════════════════════');
    
    // Forzar recarga completa para limpiar cualquier estado en memoria
    window.location.href = '/';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {/* Información del usuario */}
      <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-4 py-2 text-sm">
        {isAdmin() ? (
          <Shield className="h-5 w-5 text-orange-400" aria-hidden />
        ) : (
          <UserIcon className="h-5 w-5 text-sky-400" aria-hidden />
        )}
        <div>
          <p className="font-medium text-white">{user.name || user.username}</p>
          <p className="text-xs text-slate-400">
            {isAdmin() ? 'Administrador' : 'Usuario'}
          </p>
        </div>
      </div>

      {/* Botón de logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-600/30"
        aria-label="Cerrar sesión"
      >
        <LogOut className="h-5 w-5" aria-hidden />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}
