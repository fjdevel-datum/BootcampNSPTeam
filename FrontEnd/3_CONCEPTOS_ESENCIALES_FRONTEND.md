# Conceptos Esenciales del Frontend - Datum Travels

## 📌 Información General

**Stack Tecnológico**:
- **React 19** → Librería UI (componentes, hooks)
- **TypeScript 5.8** → JavaScript con tipos (seguridad)
- **Vite 7** → Build tool moderno (desarrollo rápido)
- **Tailwind CSS 4** → Framework CSS utility-first
- **React Router 7** → Navegación SPA (Single Page Application)

**Arquitectura**: Clean Architecture pragmática para juniors  
**Autenticación**: Keycloak (OAuth2 + JWT)  
**Backend**: Quarkus (Java) + Oracle Database  
**OCR**: Servicio separado para procesar facturas  

---

## 🔥 1. Progressive Web App (PWA) - Aplicación Instalable

### ¿Qué es una PWA?
Una aplicación web que **se comporta como app nativa**:
- ✅ Se puede instalar en el dispositivo (móvil, escritorio)
- ✅ Funciona parcialmente sin internet (modo offline)
- ✅ Puede enviar notificaciones push
- ✅ Se ve en pantalla completa (sin barra del navegador)

### Configuración en `vite.config.ts`

```typescript
VitePWA({
  registerType: 'autoUpdate', // Actualiza automáticamente
  manifest: {
    name: 'ViaticosDatum',
    short_name: 'ViaticosDatum',
    description: 'Gestiona tus viaticos y gastos corporativos',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone', // Se ve como app nativa
    start_url: '/',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192' },
      { src: '/pwa-512x512.png', sizes: '512x512' }
    ]
  }
})
```

### Service Worker - Caché Inteligente

El Service Worker intercepta peticiones HTTP y las almacena en caché:

```typescript
// Estrategia para eventos (NetworkFirst)
{
  urlPattern: /\/api\/eventos/,
  handler: 'NetworkFirst', // Intenta red, si falla usa caché
  options: {
    networkTimeoutSeconds: 8,
    expiration: {
      maxEntries: 40,
      maxAgeSeconds: 30 * 60 // 30 minutos
    }
  }
}
```

**Estrategias de Caché**:
1. **NetworkFirst**: Intenta red, si falla usa caché (datos dinámicos)
2. **CacheFirst**: Usa caché primero, si falla intenta red (imágenes, fuentes)
3. **NetworkOnly**: Siempre red, nunca caché (POST, PUT, DELETE)

**Background Sync**:
```typescript
// Si el usuario registra un gasto sin internet...
{
  urlPattern: /\/api\/gastos/,
  handler: 'NetworkOnly',
  method: 'POST',
  options: {
    backgroundSync: {
      name: 'gastos-post-queue',
      maxRetentionTime: 24 * 60 // Reintenta por 24 horas
    }
  }
}
```

Cuando el dispositivo recupere conexión, el Service Worker enviará automáticamente las peticiones pendientes.

---

## 🌐 2. Sistema de Proxy para Desarrollo

### Problema
Tu frontend corre en `localhost:5173` (Vite)  
Tu backend corre en `localhost:8081` (Quarkus)  
Tu OCR corre en `localhost:8080` (Quarkus)

Si haces `fetch('http://localhost:8081/api/eventos')` desde el frontend:
- ❌ **CORS Error**: Navegador bloquea peticiones entre dominios distintos

### Solución: Proxy de Vite

```typescript
server: {
  host: '0.0.0.0', // Permite acceso desde red local
  port: 5173,
  proxy: {
    // Ruta 1: OCR para análisis de imágenes
    '/api/ocr': {
      target: 'http://localhost:8080',
      changeOrigin: true // Cambia el header 'Origin'
    },
    
    // Ruta 2: Archivos de gastos (van al OCR)
    '/api/gastos': {
      target: 'http://localhost:8080',
      bypass: (req) => {
        // Solo usa este proxy si la URL incluye '/archivo'
        if (req.url?.includes('/archivo')) {
          return null; // Usa este proxy
        }
        return req.url; // Pasa al siguiente proxy
      }
    },
    
    // Ruta 3: Resto de API (backend principal)
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true
    }
  }
}
```

**Flujo Real**:
```
Frontend hace: fetch('/api/eventos')
      ↓
Vite intercepta y redirige a: http://localhost:8081/api/eventos
      ↓
Backend responde
      ↓
Vite devuelve la respuesta al frontend
```

**Ventaja**: No hay CORS porque el navegador cree que todo viene del mismo origen (`localhost:5173`).

---

## 🔐 3. Autenticación con JWT (JSON Web Tokens)

### ¿Qué es un JWT?

Un token firmado que contiene información del usuario:

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNhcmxvcyBIZXJuYW5kZXoiLCJyb2xlcyI6WyJhZG1pbiJdLCJleHAiOjE3MzY4MDAwMDB9.
[firma digital]
```

**Partes del Token**:
1. **Header**: Algoritmo de firma (RSA256)
2. **Payload**: Datos del usuario (username, roles, exp)
3. **Signature**: Firma para verificar autenticidad

### Decodificación Manual en `jwtDecoder.ts`

```typescript
export function decodeJWT(token: string): DecodedToken | null {
  const parts = token.split('.');
  const payload = parts[1]; // Parte 2 del token
  
  // Decodificar Base64URL
  const decoded = base64UrlDecode(payload);
  
  // Parsear JSON
  return JSON.parse(decoded);
}

// Resultado:
{
  sub: "e4b3a9c2-1234-5678-9abc-def012345678", // ID Keycloak
  preferred_username: "carlos.hernandez",
  email: "carlos@datum.com",
  name: "Carlos Hernández",
  exp: 1736800000, // Timestamp de expiración
  realm_access: {
    roles: ["admin", "user"]
  }
}
```

### Verificación de Expiración

```typescript
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  const currentTime = Math.floor(Date.now() / 1000); // Ahora en segundos
  return decoded.exp < currentTime; // ¿exp es menor que ahora?
}

// Ejemplo:
const token = "eyJhbGci...";
isTokenExpired(token); // false → Token válido
```

### Refresh Token - Renovación Automática

**Problema**: Los access tokens expiran en 5 minutos (seguridad).

**Solución**: Usar el refresh token para obtener uno nuevo.

```typescript
export async function getValidAccessToken(): Promise<string | null> {
  let accessToken = localStorage.getItem('access_token');

  if (!accessToken) return null;

  // Si el token está expirado...
  if (isTokenExpired(accessToken)) {
    // Renovarlo usando el refresh token
    accessToken = await refreshAccessToken();
  }

  return accessToken; // Token válido
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');

  const response = await fetch(KEYCLOAK_TOKEN_ENDPOINT, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: 'datum-travels-frontend',
      refresh_token: refreshToken
    })
  });

  const data = await response.json();
  
  // Guardar nuevos tokens
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  return data.access_token;
}
```

**Flujo Automático**:
```
Usuario hace petición → getValidAccessToken()
      ↓
¿Token expirado?
├─ NO → Usa token actual
└─ SÍ → refreshAccessToken() → Obtiene token nuevo
      ↓
Petición HTTP con token válido
```

---

## 🎨 4. Tailwind CSS - Utility-First Framework

### Concepto
En lugar de escribir CSS personalizado, usas clases utilitarias:

```tsx
// ❌ CSS tradicional
<button className="my-button">Click</button>
// CSS file: .my-button { background: blue; padding: 1rem; border-radius: 0.5rem; }

// ✅ Tailwind
<button className="bg-blue-500 px-4 py-2 rounded-lg">
  Click
</button>
```

### Ejemplo Real del Proyecto

```tsx
<div className="
  min-h-screen        {/* altura mínima 100vh */}
  bg-[#1b2024]        {/* color de fondo personalizado */}
  text-slate-300      {/* color de texto gris claro */}
  px-4                {/* padding horizontal 1rem */}
  py-8                {/* padding vertical 2rem */}
  rounded-2xl         {/* border-radius 1rem */}
  shadow-lg           {/* box-shadow grande */}
  hover:bg-sky-500    {/* fondo azul al pasar mouse */}
  transition          {/* transiciones suaves */}
">
  Contenido
</div>
```

### Responsive Design

```tsx
<div className="
  w-full              {/* width: 100% en móvil */}
  md:w-1/2            {/* width: 50% en tablet+ */}
  lg:w-1/3            {/* width: 33% en desktop+ */}
">
```

**Breakpoints**:
- `sm:` → 640px+
- `md:` → 768px+
- `lg:` → 1024px+
- `xl:` → 1280px+

---

## 🧩 5. TypeScript - Seguridad de Tipos

### ¿Por qué TypeScript?

**Problema (JavaScript)**:
```javascript
function listarEventos() {
  return fetch('/api/eventos').then(res => res.json());
}

const eventos = await listarEventos();
eventos[0].nombreEvent; // ❌ Typo! Debería ser 'nombreEvento'
// JavaScript NO avisa, falla en runtime
```

**Solución (TypeScript)**:
```typescript
interface EventoBackend {
  idEvento: number;
  nombreEvento: string; // ← Definido el nombre correcto
  fechaRegistro: string;
}

async function listarEventos(): Promise<EventoBackend[]> {
  const res = await fetch('/api/eventos');
  return await res.json();
}

const eventos = await listarEventos();
eventos[0].nombreEvent; // ❌ ERROR EN COMPILACIÓN
// Property 'nombreEvent' does not exist on type 'EventoBackend'
```

**Ventajas**:
- Autocomplete en VSCode
- Errores detectados ANTES de ejecutar
- Refactoring seguro (renombrar variables actualiza todos los usos)

### Tipos Literales para Estados

```typescript
type EstadoEvento = 'activo' | 'completado' | 'cancelado';

const estado: EstadoEvento = 'activo'; // ✅ Válido
const estado2: EstadoEvento = 'pendiente'; // ❌ Error
// Type '"pendiente"' is not assignable to type 'EstadoEvento'
```

---

## 🚀 6. React Hooks Esenciales

### useState - Estado Local

```tsx
const [eventos, setEventos] = useState<EventoBackend[]>([]);

// Actualizar estado
setEventos([...nuevosEventos]);
```

### useEffect - Efectos Secundarios

```tsx
useEffect(() => {
  // Código que se ejecuta al montar el componente
  cargarEventos();
}, []); // Array vacío = solo se ejecuta una vez
```

**Casos de Uso**:
- Cargar datos al montar
- Suscribirse a eventos
- Actualizar título de la página

### useContext - Estado Global

```tsx
// En AuthContext.tsx
export const AuthContext = createContext<AuthContextType>(undefined);

// En cualquier componente
const { user, logout } = useContext(AuthContext);
```

### Custom Hook `useAuth`

```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  
  return context;
}

// Uso
const { isAuthenticated, user, logout } = useAuth();
```

---

## 📦 7. Variables de Entorno

### Archivo `.env`

```bash
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_API_BASE_URL=http://localhost:8081/api
```

### Uso en Código

```typescript
const API_URL = import.meta.env.VITE_API_BASE_URL || 
  'http://localhost:8081/api';
```

**Importante**: Variables deben empezar con `VITE_` para ser accesibles.

---

## 🔄 8. Flujo de Datos Completo (Caso Real)

### Caso: Registrar un Gasto con OCR

```
1. Usuario sube foto de factura en GastoForm.tsx
   ↓
2. FormData con la imagen → POST /api/ocr/process
   ↓
3. Vite proxy redirige a http://localhost:8080/api/ocr/process
   ↓
4. OCR Service (Tesseract + Google Vision API) extrae:
   - Monto: $45.00
   - Fecha: 2025-11-05
   - Descripción: "Almuerzo cliente Panama"
   ↓
5. Frontend recibe JSON con datos extraídos
   ↓
6. Usuario confirma/edita datos
   ↓
7. POST /api/gastos con:
   - Datos del gasto
   - Archivo adjunto (factura.jpg)
   - idEvento (evento asociado)
   ↓
8. Backend Quarkus valida y guarda en BD
   ↓
9. Frontend muestra gasto en la lista ✅
```

---

## 🔒 9. Seguridad en Frontend

### 1. Tokens en localStorage (NO en cookies)

```typescript
// Guardar tokens
localStorage.setItem('access_token', data.access_token);

// Leer tokens
const token = localStorage.getItem('access_token');

// Enviar en peticiones
fetch('/api/eventos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Riesgo**: XSS (Cross-Site Scripting) podría robar tokens.  
**Mitigación**: Validar inputs, sanitizar datos, HTTPS en producción.

### 2. Verificación de Roles (UX, NO Seguridad)

```tsx
{isAdmin() && <Link to="/admin">Panel Admin</Link>}
```

**Importante**: El backend SIEMPRE valida roles en cada endpoint.

```java
// Backend (Quarkus)
@RolesAllowed("admin")
@GET
@Path("/admin/usuarios")
public Response listarUsuarios() { ... }
```

---

## 📱 10. Responsive Design - Mobile First

### Estrategia
Diseñar primero para móvil, luego escalar a desktop:

```tsx
<div className="
  flex flex-col        {/* Columna en móvil */}
  md:flex-row          {/* Fila en tablet+ */}
  gap-4                {/* Espaciado entre elementos */}
">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Contenido</div>
</div>
```

---

## 🚨 11. Manejo de Errores

### Try-Catch en Services

```typescript
export const eventosService = {
  async listarEventos(): Promise<EventoBackend[]> {
    try {
      const token = await getValidAccessToken();
      
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${API_BASE_URL}/eventos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en listarEventos:', error);
      throw error; // Re-lanzar para que el componente lo maneje
    }
  }
};
```

### En Componentes

```tsx
async function cargarEventos() {
  try {
    setIsLoading(true);
    const data = await eventosService.listarEventos();
    setEventos(data);
  } catch (err) {
    setError('No se pudieron cargar los eventos');
  } finally {
    setIsLoading(false);
  }
}
```

---

## 🎯 12. Conceptos Clave para la Exposición

### ✅ Lo que Debes Explicar

1. **PWA**: Aplicación instalable que funciona offline
2. **JWT**: Tokens para autenticación sin sesiones en servidor
3. **Proxy**: Solución para CORS en desarrollo
4. **TypeScript**: Seguridad de tipos en JavaScript
5. **Service Workers**: Caché inteligente y Background Sync
6. **Clean Architecture**: Separación de UI, Services, Types
7. **React Router**: Navegación SPA con guards de autenticación
8. **Tailwind**: CSS utility-first para estilos rápidos
9. **Keycloak**: OAuth2 para autenticación centralizada
10. **Roles**: Guards de frontend para UX, validación de backend para seguridad

### 🔥 Puntos de Diferenciación

1. **OCR Integrado**: Captura automática de datos desde facturas
2. **PWA Offline**: Funciona sin internet (caché + Background Sync)
3. **Multi-Servicio**: 3 backends (Quarkus API, OCR, Keycloak)
4. **Mobile-First**: Diseñado primero para móviles
5. **TypeScript Full**: Seguridad de tipos en todo el proyecto

### ⚠️ Lo que NO Debes Decir

- ❌ "Frontend es seguro porque tiene guards" → ✅ "Frontend valida para UX, backend para seguridad"
- ❌ "Tailwind es mejor que CSS" → ✅ "Tailwind acelera desarrollo, CSS puro tiene su lugar"
- ❌ "PWA funciona 100% offline" → ✅ "PWA cachea datos, pero login requiere internet"

---

## 📚 Dependencias del Proyecto

```json
{
  "dependencies": {
    "react": "^19.1.1",              // Librería UI
    "react-dom": "^19.1.1",          // React para web
    "react-router-dom": "^7.9.1",    // Navegación SPA
    "lucide-react": "^0.544.0"       // Iconos modernos
  },
  "devDependencies": {
    "vite": "^7.1.6",                      // Build tool
    "typescript": "~5.8.3",                // Compilador TS
    "tailwindcss": "^4.1.13",              // Framework CSS
    "@vitejs/plugin-react-swc": "^4.0.1",  // Compilador rápido
    "vite-plugin-pwa": "^1.1.0"            // PWA support
  }
}
```

---

## 🛠️ Comandos Esenciales

```bash
# Instalar dependencias
npm install

# Desarrollo (con proxy y hot reload)
npm run dev

# Build para producción
npm run build

# Preview build local
npm run preview

# Linting
npm run lint
```

---

Esta documentación cubre los conceptos ESENCIALES que necesitas dominar para defender el proyecto. Enfócate en entender el **flujo completo**: usuario hace click → componente → service → proxy → backend → respuesta → UI actualizada.
