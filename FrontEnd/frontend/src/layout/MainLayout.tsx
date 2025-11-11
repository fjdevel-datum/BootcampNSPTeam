/**
 * Layout base para páginas autenticadas
 * Incluye navegación con información del usuario
 */

import { Link, useLocation } from 'react-router-dom';
import UserNav from '../components/UserNav';
import { useAuth } from '../hooks/useAuth';
import { Home, CreditCard, User, LayoutDashboard } from 'lucide-react';
import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#1b2024]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-[#1b2024]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <h1 className="text-xl font-bold text-white">
              Datum <span className="text-sky-400">Travels</span>
            </h1>

            {/* Navegación principal */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/home"
                icon={<Home className="h-4 w-4" />}
                label="Inicio"
                active={isActive('/home')}
              />
              
              <NavLink
                to="/tarjetas"
                icon={<CreditCard className="h-4 w-4" />}
                label="Tarjetas"
                active={isActive('/tarjetas')}
              />
              
              <NavLink
                to="/profile"
                icon={<User className="h-4 w-4" />}
                label="Perfil"
                active={isActive('/profile')}
              />

              {/* Enlace a Admin (solo para administradores) */}
              {isAdmin() && (
                <NavLink
                  to="/admin"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Admin"
                  active={location.pathname.startsWith('/admin')}
                />
              )}
            </nav>
          </div>

          {/* User navigation */}
          <UserNav />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}

// Componente NavLink
interface NavLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}

function NavLink({ to, icon, label, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition
        ${active 
          ? 'bg-sky-500/20 text-sky-400' 
          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
