/**
 * Servicio de autenticación con Keycloak
 * Maneja login, logout, refresh de tokens y comunicación con Keycloak
 */

import type { 
  LoginCredentials, 
  KeycloakTokenResponse, 
  User 
} from '../types/auth';
import { decodeJWT, isTokenExpired } from '../utils/jwtDecoder';
import { KEYCLOAK_CONFIG, STORAGE_KEYS } from '../config/constants';

// Configuración de Keycloak
const { url: KEYCLOAK_URL, realm: REALM, clientId: CLIENT_ID } = KEYCLOAK_CONFIG;
const TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
const LOGOUT_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`;

// Claves para localStorage
const { accessToken: ACCESS_TOKEN_KEY, refreshToken: REFRESH_TOKEN_KEY } = STORAGE_KEYS;

/**
 * Realiza login con Keycloak usando credenciales
 */
export async function login(credentials: LoginCredentials): Promise<KeycloakTokenResponse> {
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: CLIENT_ID,
        username: credentials.username,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Credenciales inválidas');
    }

    const data: KeycloakTokenResponse = await response.json();
    
    // Guardar tokens en localStorage
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Cierra sesión del usuario
 */
export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  console.log('🚪 [authService.logout] Iniciando logout...');
  console.log('🚪 [authService.logout] Tokens ANTES de limpiar:', {
    access_token: localStorage.getItem(ACCESS_TOKEN_KEY)?.substring(0, 50) + '...',
    refresh_token: refreshToken?.substring(0, 50) + '...',
  });

  // PRIMERO limpiar tokens locales INMEDIATAMENTE
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  console.log('🧹 [authService.logout] Tokens DESPUÉS de limpiar:', {
    access_token: localStorage.getItem(ACCESS_TOKEN_KEY),
    refresh_token: localStorage.getItem(REFRESH_TOKEN_KEY),
  });

  // LUEGO intentar hacer logout en Keycloak (en background)
  try {
    if (refreshToken) {
      console.log('🌐 [authService.logout] Haciendo logout en Keycloak...');
      await fetch(LOGOUT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          refresh_token: refreshToken,
        }),
      });
      console.log('✅ [authService.logout] Logout en Keycloak exitoso');
    }
  } catch (error) {
    console.error('❌ [authService.logout] Error al hacer logout en Keycloak:', error);
    // No importa si falla, los tokens ya están eliminados localmente
  }
  
  console.log('🏁 [authService.logout] Logout completado');
}

/**
 * Refresca el access token usando el refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      // Refresh token inválido o expirado
      await logout();
      return null;
    }

    const data: KeycloakTokenResponse = await response.json();
    
    // Actualizar tokens
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

    return data.access_token;
  } catch (error) {
    console.error('Error al refrescar token:', error);
    await logout();
    return null;
  }
}

/**
 * Obtiene el access token actual y lo refresca si es necesario
 */
export async function getValidAccessToken(): Promise<string | null> {
  let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!accessToken) {
    return null;
  }

  // Verificar si el token está expirado
  if (isTokenExpired(accessToken)) {
    // Intentar refrescar
    accessToken = await refreshAccessToken();
  }

  return accessToken;
}

/**
 * Obtiene la información del usuario desde el token
 */
export function getUserFromToken(): User | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    return null;
  }

  const decoded = decodeJWT(token);

  if (!decoded) {
    return null;
  }

  return {
    username: decoded.preferred_username || decoded.sub,
    email: decoded.email || '',
    name: decoded.name || decoded.preferred_username || '',
    roles: decoded.realm_access?.roles || [],
  };
}

/**
 * Verifica si hay una sesión activa válida
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}

/**
 * Verifica si el usuario actual tiene un rol específico
 */
export function hasRole(role: string): boolean {
  const user = getUserFromToken();
  return user?.roles.includes(role) || false;
}

/**
 * Verifica si el usuario actual es administrador
 */
export function isAdmin(): boolean {
  return hasRole('admin') || hasRole('administrador');
}