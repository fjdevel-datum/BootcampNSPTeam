/**
 * Configuración centralizada de la aplicación
 */

const isBrowser = typeof window !== 'undefined'
const runtimeProtocol = isBrowser ? window.location.protocol : 'http:'
const runtimeHostname = isBrowser ? window.location.hostname : 'localhost'
const normalizedProtocol = runtimeProtocol === 'https:' ? 'https:' : 'http:'

const fallbackApiPort = import.meta.env.VITE_API_PORT ?? '8081'
const fallbackKeycloakPort = import.meta.env.VITE_KEYCLOAK_PORT ?? '8180'

const defaultApiOrigin = `${normalizedProtocol}//${runtimeHostname}:${fallbackApiPort}`
const keycloakHostOverride = import.meta.env.VITE_KEYCLOAK_HOST?.trim()
const defaultKeycloakHost =
  keycloakHostOverride && keycloakHostOverride.length > 0
    ? keycloakHostOverride
    : runtimeHostname
const defaultKeycloakOrigin = `${normalizedProtocol}//${defaultKeycloakHost}:${fallbackKeycloakPort}`
const defaultApiBasePath = import.meta.env.VITE_API_BASE_PATH ?? '/api'

const normalizePath = (value: string): string => {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return ''
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeading.replace(/\/+$/, '')
}

let apiOrigin = defaultApiOrigin
let apiBasePath = normalizePath(defaultApiBasePath)
const apiEnvUrl = import.meta.env.VITE_API_BASE_URL

if (typeof apiEnvUrl === 'string' && apiEnvUrl.trim().length > 0) {
  try {
    const parsed = new URL(apiEnvUrl)
    apiOrigin = `${parsed.protocol}//${parsed.host}`
    apiBasePath = normalizePath(parsed.pathname) || apiBasePath
  } catch {
    apiOrigin = apiEnvUrl
    apiBasePath = normalizePath(defaultApiBasePath)
  }
}

export const API_CONFIG = {
  origin: apiOrigin,
  basePath: apiBasePath,
} as const

export const API_BASE_URL = `${API_CONFIG.origin}${API_CONFIG.basePath}`

// Configuración de Keycloak
const keycloakEnvUrl = import.meta.env.VITE_KEYCLOAK_URL
const resolvedKeycloakUrl =
  typeof keycloakEnvUrl === 'string' && keycloakEnvUrl.trim().length > 0
    ? keycloakEnvUrl
    : defaultKeycloakOrigin

export const KEYCLOAK_CONFIG = {
  url: resolvedKeycloakUrl,
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'datum-travels',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'datum-travels-frontend',
} as const

// Claves de localStorage
export const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
} as const

// Roles de usuario
export const USER_ROLES = {
  admin: 'admin',
  administrador: 'administrador',
  user: 'user',
  contador: 'contador',
} as const

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
} as const
