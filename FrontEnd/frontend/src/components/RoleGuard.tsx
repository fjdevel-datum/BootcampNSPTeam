/**
 * Componente de protección por roles
 * Requiere un rol específico para acceder (ej: admin)
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles,
  redirectTo = '/home'
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1b2024]">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
          <p className="text-slate-300">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasRequiredRole = user?.roles.some(role => 
    allowedRoles.includes(role)
  );

  if (!hasRequiredRole) {
    // No tiene permisos - redirigir
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
