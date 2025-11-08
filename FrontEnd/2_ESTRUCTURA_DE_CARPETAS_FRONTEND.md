# Estructura de Carpetas del Frontend - Datum Travels

## 📁 Árbol de Directorios `src/`

```
src/
├── assets/          → Recursos estáticos (imágenes, logos)
├── components/      → Componentes reutilizables UI
├── config/          → Configuración central de la app
├── context/         → Contextos de React (estado global)
├── hooks/           → Custom Hooks reutilizables
├── layout/          → Plantillas de diseño (headers, sidebars)
├── pages/           → Vistas completas (rutas principales)
│   └── Admin/       → Páginas exclusivas para administradores
├── router/          → Configuración de React Router
├── services/        → Lógica de comunicación con APIs
├── types/           → Definiciones de tipos TypeScript
└── utils/           → Funciones auxiliares reutilizables
```

---

## 📂 Detalle de Cada Carpeta

### 1️⃣ `/components` - Componentes Reutilizables

**Propósito**: Piezas de UI que se usan en múltiples páginas.

**Ejemplo**: `RoleGuard.tsx`

```tsx
// Componente que ENVUELVE contenido protegido por roles
export default function RoleGuard({ 
  children, 
  allowedRoles 
}) {
  const { user } = useAuth();
  
  const hasRequiredRole = user?.roles.some(role => 
    allowedRoles.includes(role)
  );

  if (!hasRequiredRole) {
    return <Navigate to="/home" />; // Redirige si no tiene permiso
  }

  return <>{children}</>; // Muestra el contenido si tiene permiso
}
```

**Uso Real**:
```tsx
// En el router
<RoleGuard allowedRoles={['admin']}>
  <AdminDashboard />
</RoleGuard>
```

**Otros Componentes**:
- `ProtectedRoute.tsx` → Protege rutas requiriendo autenticación
- `UserNav.tsx` → Menú de navegación con avatar del usuario
- `CreateEventModal.tsx` → Modal para crear eventos
- `EnviarReporteModal.tsx` → Modal para enviar reportes de gastos

**Concepto Clave**: Los componentes son como LEGO blocks que armas en diferentes páginas.

---

### 2️⃣ `/pages` - Vistas Completas

**Propósito**: Páginas completas que corresponden a rutas URL.

**Ejemplo**: `Home.tsx`

```tsx
// Página principal: lista de eventos del empleado
export default function HomePage() {
  const [eventos, setEventos] = useState<EventoBackend[]>([]);
  const navigate = useNavigate();

  // Cargar eventos al montar la página
  useEffect(() => {
    async function cargarEventos() {
      const data = await eventosService.listarEventos();
      setEventos(data);
    }
    cargarEventos();
  }, []);

  return (
    <main>
      <h1>Lista de eventos</h1>
      {eventos.map(evento => (
        <EventButton 
          key={evento.idEvento}
          label={evento.nombreEvento}
          onClick={() => navigate(`/event/${evento.nombreEvento}`)}
        />
      ))}
      <button onClick={() => setIsModalOpen(true)}>
        + Nuevo Evento
      </button>
    </main>
  );
}
```

**Flujo de Funcionamiento**:
1. Usuario entra a `/home`
2. `useEffect` carga eventos desde la API
3. Se mapea cada evento como un botón clickeable
4. Al hacer click → Navega a `/event/:eventName` (página de detalle)

**Otras Páginas**:
- `Login.tsx` → Formulario de autenticación con Keycloak
- `EventDetail.tsx` → Detalle de un evento (lista de gastos)
- `GastoForm.tsx` → Formulario para registrar un gasto con OCR
- `Tarjetas.tsx` → Lista de tarjetas corporativas del usuario
- `profile.tsx` → Información del perfil del empleado

**Subcarpeta `/Admin`**:
- `Dashboard.tsx` → Panel de control de administrador
- `Usuarios.tsx` → Gestión de empleados
- `Tarjetas.tsx` → Gestión de tarjetas corporativas
- `NuevoUsuario.tsx` → Formulario para crear empleados
- `AsignarTarjeta.tsx` → Asignar/desasignar tarjetas a empleados

**Concepto Clave**: Cada página = 1 ruta URL = 1 vista completa en el navegador.

---

### 3️⃣ `/services` - Comunicación con el Backend

**Propósito**: Funciones que hacen peticiones HTTP a las APIs (Backend Quarkus, Keycloak, OCR).

**Ejemplo**: `eventos.ts`

```typescript
// Servicio para gestión de eventos
export const eventosService = {
  // GET /api/eventos → Lista de eventos del empleado
  async listarEventos(): Promise<EventoBackend[]> {
    const token = await getValidAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/eventos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // JWT de Keycloak
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener eventos: ${response.status}`);
    }

    return await response.json();
  },

  // POST /api/eventos → Crear nuevo evento
  async crearEvento(nombreEvento: string): Promise<EventoBackend> {
    const token = await getValidAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/eventos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombreEvento }),
    });

    return await response.json();
  },

  // DELETE /api/eventos/:id → Eliminar evento
  async eliminarEvento(idEvento: number): Promise<void> {
    const token = await getValidAccessToken();
    
    await fetch(`${API_BASE_URL}/eventos/${idEvento}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
```

**Uso desde una Página**:
```tsx
import { eventosService } from '../services/eventos';

function MiComponente() {
  const [eventos, setEventos] = useState([]);

  async function cargar() {
    const data = await eventosService.listarEventos();
    setEventos(data);
  }

  return <button onClick={cargar}>Cargar Eventos</button>;
}
```

**Otros Servicios**:
- `authService.ts` → Login, logout, refresh tokens (Keycloak)
- `gastos.ts` → CRUD de gastos vinculados a eventos
- `ocr.ts` → Procesamiento de imágenes de facturas con OCR
- `tarjetas.ts` → Gestión de tarjetas corporativas
- `empleados.ts` → Gestión de empleados (admin)
- `reportes.ts` → Generación y envío de reportes Excel por correo

**Concepto Clave**: Los services son la "puerta de entrada" al backend. Separan la lógica de red de la UI.

---

### 4️⃣ `/types` - Definiciones de Tipos TypeScript

**Propósito**: Contratos de datos entre Frontend y Backend. Define la forma de los objetos.

**Ejemplo**: `auth.ts`

```typescript
// Información del usuario autenticado
export interface User {
  username: string;      // "carlos.hernandez"
  email: string;         // "carlos@datum.com"
  name: string;          // "Carlos Hernández"
  roles: string[];       // ["admin", "user"]
}

// Estado de autenticación global
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Credenciales para login
export interface LoginCredentials {
  username: string;
  password: string;
}

// Token JWT decodificado
export interface DecodedToken {
  sub: string;           // ID del usuario
  preferred_username: string;
  email?: string;
  exp: number;           // Timestamp de expiración
  realm_access?: {
    roles: string[];     // Roles desde Keycloak
  };
}
```

**Ejemplo**: `event.ts`

```typescript
// Evento que viene del backend
export interface EventoBackend {
  idEvento: number;
  nombreEvento: string;
  fechaRegistro: string;  // "2025-01-15"
  estado: 'activo' | 'completado' | 'cancelado';
  idEmpleado: number;
}
```

**Uso en Componentes**:
```tsx
import type { EventoBackend } from '../types/event';

function EventList({ eventos }: { eventos: EventoBackend[] }) {
  // TypeScript SABE que cada evento tiene idEvento, nombreEvento, etc.
  return (
    <ul>
      {eventos.map(evento => (
        <li key={evento.idEvento}>{evento.nombreEvento}</li>
      ))}
    </ul>
  );
}
```

**Otros Types**:
- `gasto.ts` → GastoBackend, CategoriaGasto, TipoPago
- `tarjeta.ts` → TarjetaCorporativa, TipoTarjeta
- `empleado.ts` → EmpleadoBackend, DepartamentoEmpleado
- `reporte.ts` → ReporteGasto, ConfiguracionReporte

**Concepto Clave**: Los types son como "contratos" que garantizan que los datos tengan la forma esperada.

---

### 5️⃣ `/context` - Estado Global (React Context)

**Propósito**: Compartir datos entre TODOS los componentes sin pasar props manualmente.

**Ejemplo**: `AuthContext.tsx`

```tsx
// 1️⃣ Crear el contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2️⃣ Provider que envuelve la app
export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 3️⃣ Métodos para modificar el estado
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const user = authService.getUserFromToken();
    
    setAuthState({
      user,
      accessToken: response.access_token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    await authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
  };

  // 4️⃣ Proveer el estado a toda la app
  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Uso en Componentes**:
```tsx
import { useAuth } from '../hooks/useAuth';

function MiComponente() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>No has iniciado sesión</p>;
  }

  return (
    <div>
      <p>Hola, {user.name}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

**Concepto Clave**: El contexto evita "prop drilling" (pasar props por 10 niveles de componentes). Cualquier componente puede acceder al estado global.

---

### 6️⃣ `/hooks` - Custom Hooks Reutilizables

**Propósito**: Extraer lógica reutilizable de componentes.

**Ejemplo**: `useAuth.ts`

```typescript
// Hook para acceder al contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}
```

**Uso**:
```tsx
function Navbar() {
  const { user, isAdmin } = useAuth(); // ← Hook personalizado
  
  return (
    <nav>
      <p>Bienvenido, {user?.name}</p>
      {isAdmin() && <a href="/admin">Panel Admin</a>}
    </nav>
  );
}
```

**Concepto Clave**: Los hooks son funciones que usan React Hooks internamente. Siguen la convención `use*`.

---

### 7️⃣ `/layout` - Plantillas de Diseño

**Propósito**: Estructuras comunes de páginas (header, sidebar, footer).

**Ejemplo**: `MainLayout.tsx`

```tsx
// Layout con navegación superior
export default function MainLayout({ children }) {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-[#1b2024]">
      {/* Header fijo en la parte superior */}
      <header className="sticky top-0 z-50 bg-[#1b2024] border-b">
        <nav>
          <Link to="/home">Inicio</Link>
          <Link to="/tarjetas">Tarjetas</Link>
          <Link to="/profile">Perfil</Link>
          {isAdmin() && <Link to="/admin">Admin</Link>}
        </nav>
        <UserNav /> {/* Avatar + dropdown */}
      </header>

      {/* Contenido principal de la página */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

**Uso en Páginas**:
```tsx
function HomePage() {
  return (
    <MainLayout>
      <h1>Mis Eventos</h1>
      {/* ... contenido específico de Home */}
    </MainLayout>
  );
}
```

**Concepto Clave**: Los layouts evitan duplicar headers/footers en cada página.

---

### 8️⃣ `/router` - Configuración de Rutas

**Propósito**: Definir qué componente se muestra para cada URL.

**Ejemplo**: `index.tsx`

```tsx
const router = createBrowserRouter([
  // Ruta pública
  { path: "/", element: <LoginPage /> },
  
  // Rutas protegidas (requieren autenticación)
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  
  // Rutas de admin (requieren autenticación + rol admin)
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['admin']}>
          <AdminDashboard />
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
]);

export default router;
```

**Concepto Clave**: El router es como un "mapa" que dice "si estás en /home, muestra HomePage".

---

### 9️⃣ `/config` - Configuración Central

**Propósito**: Constantes y configuraciones globales de la aplicación.

**Ejemplo**: `constants.ts`

```typescript
// URL del backend (varía según entorno)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  'http://localhost:8081/api';

// Configuración de Keycloak
export const KEYCLOAK_CONFIG = {
  url: 'http://localhost:8180',
  realm: 'datum-travels',
  clientId: 'datum-travels-frontend',
} as const;

// Claves para localStorage
export const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
} as const;

// Roles de usuario
export const USER_ROLES = {
  admin: 'admin',
  administrador: 'administrador',
  user: 'user',
} as const;
```

**Uso**:
```tsx
import { API_BASE_URL, KEYCLOAK_CONFIG } from '../config/constants';

const response = await fetch(`${API_BASE_URL}/eventos`);
```

**Concepto Clave**: Centralizar configuraciones facilita cambios en un solo lugar.

---

### 🔟 `/utils` - Funciones Auxiliares

**Propósito**: Funciones reutilizables que NO usan React Hooks.

**Ejemplo**: `jwtDecoder.ts`

```typescript
// Decodifica un token JWT manualmente
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    const payload = parts[1]; // Parte del token con los datos
    const decoded = base64UrlDecode(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
}

// Verifica si un token ha expirado
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime; // exp es timestamp de expiración
}

// Extrae los roles del token
export function getRolesFromToken(token: string): string[] {
  const decoded = decodeJWT(token);
  return decoded?.realm_access?.roles || [];
}
```

**Uso**:
```tsx
import { isTokenExpired } from '../utils/jwtDecoder';

if (isTokenExpired(token)) {
  // Token expirado → Refrescar o hacer logout
  await refreshAccessToken();
}
```

**Concepto Clave**: Utils son funciones puras (reciben input, devuelven output, sin efectos secundarios).

---

## 🔄 Flujo de Datos Completo (Ejemplo Real)

### **Caso: Cargar lista de eventos en Home**

```
1. Usuario navega a /home
   ↓
2. Router carga <HomePage />
   ↓
3. HomePage usa el hook useEffect al montar:
   useEffect(() => {
     cargarEventos();
   }, []);
   ↓
4. cargarEventos() llama al servicio:
   const data = await eventosService.listarEventos();
   ↓
5. eventosService.listarEventos() hace fetch:
   GET http://localhost:8081/api/eventos
   Headers: { Authorization: Bearer <token> }
   ↓
6. Backend responde con JSON:
   [
     { idEvento: 1, nombreEvento: "VIAJE PANAMA", ... },
     { idEvento: 2, nombreEvento: "GASTO REP JUL", ... }
   ]
   ↓
7. HomePage actualiza el estado:
   setEventos(data);
   ↓
8. React renderiza la lista de eventos en la UI
```

---

## 🎯 Arquitectura: Clean Architecture Simplificada

```
┌─────────────────────────────────────────┐
│          UI Layer (pages/)              │
│  ┌─────────────────────────────────┐   │
│  │   HomePage.tsx                  │   │
│  │   - useEffect → cargar datos    │   │
│  │   - useState → estado local     │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │ usa
                  ↓
┌─────────────────────────────────────────┐
│       Service Layer (services/)         │
│  ┌─────────────────────────────────┐   │
│  │   eventosService.ts             │   │
│  │   - fetch() a API REST          │   │
│  │   - manejo de errores           │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │ llama a
                  ↓
┌─────────────────────────────────────────┐
│       Backend (Quarkus API)             │
│  GET /api/eventos → EventoResource.java │
└─────────────────────────────────────────┘
```

---

## 📊 Resumen de Responsabilidades

| Carpeta | Responsabilidad | Ejemplo |
|---------|-----------------|---------|
| `/components` | UI reutilizable | `RoleGuard`, `UserNav` |
| `/pages` | Vistas completas | `Home`, `Login`, `Admin/Dashboard` |
| `/services` | Comunicación API | `eventosService.listarEventos()` |
| `/types` | Contratos de datos | `EventoBackend`, `User` |
| `/context` | Estado global | `AuthContext` (usuario, tokens) |
| `/hooks` | Lógica reutilizable | `useAuth()` |
| `/layout` | Estructuras comunes | `MainLayout` (header + contenido) |
| `/router` | Rutas y navegación | `createBrowserRouter()` |
| `/config` | Constantes globales | `API_BASE_URL`, `KEYCLOAK_CONFIG` |
| `/utils` | Funciones auxiliares | `decodeJWT()`, `isTokenExpired()` |

---

## 💡 Conceptos Clave para la Exposición

1. **Separación de Responsabilidades**:
   - UI (`pages`, `components`) no hace fetch directamente
   - Servicios (`services`) manejan toda la comunicación API
   - Tipos (`types`) garantizan seguridad de tipos

2. **Reutilización**:
   - Componentes (`RoleGuard`) usados en múltiples rutas
   - Services usados por múltiples páginas
   - Hooks (`useAuth`) usados por múltiples componentes

3. **Flujo Unidireccional**:
   - UI → Service → Backend → Service → UI
   - No hay comunicación directa UI ↔ Backend

4. **TypeScript para Seguridad**:
   - Cada objeto tiene un tipo definido
   - El compilador avisa si intentas acceder a propiedades inexistentes
   - Autocomplete en VSCode gracias a los types

Esta estructura sigue principios de **Clean Architecture pragmática** adaptada para juniors, facilitando el mantenimiento y escalabilidad del proyecto.
