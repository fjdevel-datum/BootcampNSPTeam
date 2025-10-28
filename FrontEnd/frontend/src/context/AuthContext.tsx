/**
 * Contexto de Autenticación
 * Provee estado global de autenticación y métodos para login/logout
 */

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthState, LoginCredentials } from '../types/auth';
import * as authService from '../services/authService';

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Inicializar estado desde localStorage al montar
  useEffect(() => {
    const initAuth = () => {
      const isAuth = authService.isAuthenticated();
      
      if (isAuth) {
        const user = authService.getUserFromToken();
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      const user = authService.getUserFromToken();

      // 🔍 DEBUG: Ver información del usuario
      console.log('🔍 Login exitoso - Usuario obtenido:', user);
      console.log('🔍 Roles del usuario:', user?.roles);

      setAuthState({
        user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  };

  const logout = async () => {
    // Primero limpiar tokens del servicio (esto limpia localStorage)
    await authService.logout();
    
    // Luego actualizar el estado
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    // Verificar que realmente se limpiaron los tokens
    console.log('🔍 Tokens después del logout:', {
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
    });
  };

  const hasRole = (role: string): boolean => {
    return authState.user?.roles.includes(role) || false;
  };

  const isAdmin = (): boolean => {
    const result = hasRole('admin') || hasRole('administrador');
    console.log('🔍 isAdmin() check:', {
      userRoles: authState.user?.roles,
      hasAdmin: hasRole('admin'),
      hasAdministrador: hasRole('administrador'),
      result
    });
    return result;
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    hasRole,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
