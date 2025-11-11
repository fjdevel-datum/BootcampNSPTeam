/**
 * Utilidad para decodificar tokens JWT
 * Implementación manual sin dependencias externas
 */

import type { DecodedToken } from '../types/auth';

/**
 * Decodifica un token JWT manualmente
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token JWT inválido');
      return null;
    }

    const payload = parts[1];
    const decoded = base64UrlDecode(payload);
    return JSON.parse(decoded) as DecodedToken;
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
}

/**
 * Decodifica una cadena Base64URL
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
    }
    base64 += new Array(5 - pad).join('=');
  }
  return atob(base64);
}

/**
 * Verifica si un token ha expirado
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Extrae los roles del token JWT
 */
export function getRolesFromToken(token: string): string[] {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return [];
  }

  // Intentar obtener roles del realm_access
  if (decoded.realm_access?.roles) {
    return decoded.realm_access.roles;
  }

  // Intentar obtener roles del resource_access
  if (decoded.resource_access) {
    const allRoles: string[] = [];
    Object.values(decoded.resource_access).forEach((resource) => {
      if (resource.roles) {
        allRoles.push(...resource.roles);
      }
    });
    return allRoles;
  }

  return [];
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export function hasRole(token: string, role: string): boolean {
  const roles = getRolesFromToken(token);
  return roles.includes(role);
}

/**
 * Verifica si el usuario es administrador
 */
export function isAdmin(token: string): boolean {
  return hasRole(token, 'admin') || hasRole(token, 'administrador');
}
