/**
 * Configuración centralizada de la aplicación
 */

// Configuración de Keycloak
export const KEYCLOAK_CONFIG = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'datum-travels',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'datum-travels-frontend',
} as const;

// Configuración de API Backend (para futuro uso)
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
} as const;

// Claves de localStorage
export const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
} as const;

// Roles de usuario
export const USER_ROLES = {
  admin: 'admin',
  administrador: 'administrador',
  user: 'user',
  contador: 'contador',
} as const;

// Rutas de la aplicación
export const APP_ROUTES = {
  login: '/',
  home: '/home',
  profile: '/profile',
  tarjetas: '/tarjetas',
  admin: '/admin',
  adminUsuarios: '/admin/usuarios',
  adminTarjetas: '/admin/tarjetas',
  adminPerfil: '/admin/perfil',
} as const;
