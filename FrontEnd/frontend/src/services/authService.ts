/**
 * Servicio de autenticaciÃ³n con Keycloak
 * Maneja login, logout, refresh de tokens y comunicaciÃ³n con Keycloak
 */

import type { 
  LoginCredentials, 
  KeycloakTokenResponse, 
  User 
} from '../types/auth';
import { decodeJWT, isTokenExpired } from '../utils/jwtDecoder';
import { API_BASE_URL, KEYCLOAK_CONFIG, STORAGE_KEYS } from '../config/constants';

// ConfiguraciÃ³n de Keycloak
const { url: KEYCLOAK_URL, realm: REALM, clientId: CLIENT_ID } = KEYCLOAK_CONFIG;
const TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
const LOGOUT_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`;

// Claves para localStorage
const { accessToken: ACCESS_TOKEN_KEY, refreshToken: REFRESH_TOKEN_KEY } = STORAGE_KEYS;

/**
 * Sincroniza el usuario de Keycloak con el backend
 * Vincula el keycloak_id con el registro de Usuario en BD
 */
async function syncUserWithBackend(accessToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('âœ… Usuario sincronizado con backend:', data);
    } else {
      console.warn('âš ï¸ No se pudo sincronizar usuario con backend');
    }
  } catch (error) {
    console.error('âŒ Error al sincronizar usuario:', error);
    // No bloquear el login si falla la sincronizaciÃ³n
  }
}

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
      throw new Error(error.error_description || 'Credenciales invÃ¡lidas');
    }

    const data: KeycloakTokenResponse = await response.json();
    
    // Guardar tokens en localStorage
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

    // âœ¨ NUEVO: Sincronizar con backend (vincular keycloak_id)
    await syncUserWithBackend(data.access_token);

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Cierra sesiÃ³n del usuario
 */
export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  console.log('ðŸšª [authService.logout] Iniciando logout...');
  console.log('ðŸšª [authService.logout] Tokens ANTES de limpiar:', {
    access_token: localStorage.getItem(ACCESS_TOKEN_KEY)?.substring(0, 50) + '...',
    refresh_token: refreshToken?.substring(0, 50) + '...',
  });

  // PRIMERO limpiar tokens locales INMEDIATAMENTE
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  console.log('ðŸ§¹ [authService.logout] Tokens DESPUÃ‰S de limpiar:', {
    access_token: localStorage.getItem(ACCESS_TOKEN_KEY),
    refresh_token: localStorage.getItem(REFRESH_TOKEN_KEY),
  });

  // LUEGO intentar hacer logout en Keycloak (en background)
  try {
    if (refreshToken) {
      console.log('ðŸŒ [authService.logout] Haciendo logout en Keycloak...');
      await fetch(LOGOUT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          refresh_token: refreshToken,
        }),
      });
      console.log('âœ… [authService.logout] Logout en Keycloak exitoso');
    }
  } catch (error) {
    console.error('âŒ [authService.logout] Error al hacer logout en Keycloak:', error);
    // No importa si falla, los tokens ya estÃ¡n eliminados localmente
  }
  
  console.log('ðŸ [authService.logout] Logout completado');
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
      // Refresh token invÃ¡lido o expirado
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

  // Verificar si el token estÃ¡ expirado
  if (isTokenExpired(accessToken)) {
    // Intentar refrescar
    accessToken = await refreshAccessToken();
  }

  return accessToken;
}

/**
 * Obtiene la informaciÃ³n del usuario desde el token
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
 * Verifica si hay una sesiÃ³n activa vÃ¡lida
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}

/**
 * Verifica si el usuario actual tiene un rol especÃ­fico
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
