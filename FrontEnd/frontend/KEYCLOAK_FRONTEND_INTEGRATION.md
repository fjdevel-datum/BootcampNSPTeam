# 🔐 Integración Keycloak - Frontend

## 📋 Resumen

Este documento explica la integración de Keycloak en el frontend de **Datum Travels** usando comunicación directa JWT entre Frontend y Keycloak.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    KEYCLOAK SERVER                       │
│                  (Puerto 8180)                           │
│                                                          │
│  Realm: datum-travels                                    │
│  Client: datum-travels-frontend                          │
│  ├── Access Type: public                                 │
│  ├── Standard Flow Enabled: Yes                          │
│  ├── Direct Access Grants: Yes (para login directo)      │
│  └── Valid Redirect URIs: http://localhost:5173/*        │
└─────────────────────────────────────────────────────────┘
                          ↑↓ JWT
┌─────────────────────────────────────────────────────────┐
│              REACT FRONTEND (Puerto 5173)                │
│                                                          │
│  AuthContext → Maneja estado de autenticación            │
│  ├── login() → Obtiene JWT de Keycloak                  │
│  ├── logout() → Invalida sesión                         │
│  ├── hasRole() → Verifica roles                         │
│  └── isAdmin() → Verifica si es administrador           │
│                                                          │
│  ProtectedRoute → Requiere autenticación                 │
│  RoleGuard → Requiere rol específico (admin)             │
└─────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Archivos Creados

```
src/
├── context/
│   └── AuthContext.tsx         # Contexto global de autenticación
├── hooks/
│   └── useAuth.ts             # Hook para consumir AuthContext
├── components/
│   ├── ProtectedRoute.tsx     # HOC para rutas que requieren login
│   ├── RoleGuard.tsx          # HOC para rutas con roles específicos
│   └── UserNav.tsx            # Componente de navegación con logout
├── services/
│   └── authService.ts         # Servicios de autenticación con Keycloak
├── types/
│   └── auth.ts                # Tipos TypeScript para auth
└── utils/
    └── jwtDecoder.ts          # Decodificador JWT manual (sin dependencias)
```

## 🔑 Configuración de Keycloak

### 1. Crear Client en Keycloak

1. Acceder a Keycloak Admin Console: http://localhost:8180
2. Ir a **Clients** → **Create client**
3. Configurar:
   - **Client ID**: `datum-travels-frontend`
   - **Client Type**: OpenID Connect
   - **Standard Flow**: ✅ Enabled
   - **Direct Access Grants**: ✅ Enabled (para login con usuario/contraseña)
   - **Valid Redirect URIs**: `http://localhost:5173/*`
   - **Web Origins**: `http://localhost:5173`

### 2. Configurar Roles

1. Ir a **Realm roles** → **Create role**
2. Crear roles:
   - **admin** (para administradores)
   - **user** (para usuarios normales)

### 3. Asignar Roles a Usuarios

1. Ir a **Users** → Seleccionar usuario
2. Tab **Role mapping** → **Assign role**
3. Asignar `admin` o `user` según corresponda

## 🚀 Flujo de Autenticación

### Login

```typescript
// 1. Usuario ingresa credenciales en LoginPage
const { login } = useAuth();
await login({ username: 'usuario', password: 'contraseña' });

// 2. authService.login() hace POST a Keycloak
POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token
Body: {
  grant_type: 'password',
  client_id: 'datum-travels-frontend',
  username: 'usuario',
  password: 'contraseña'
}

// 3. Keycloak responde con tokens
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 300
}

// 4. Tokens se guardan en localStorage
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);

// 5. AuthContext actualiza estado
setAuthState({
  user: { username, email, name, roles },
  accessToken,
  refreshToken,
  isAuthenticated: true
});

// 6. Redirige según rol
if (isAdmin()) navigate('/admin');
else navigate('/home');
```

### Logout

```typescript
// 1. Usuario hace click en botón de salir
const { logout } = useAuth();
await logout();

// 2. authService.logout() notifica a Keycloak
POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/logout
Body: {
  client_id: 'datum-travels-frontend',
  refresh_token: '...'
}

// 3. Limpia localStorage
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');

// 4. Actualiza AuthContext
setAuthState({
  user: null,
  isAuthenticated: false
});

// 5. Redirige a login
navigate('/');
```

## 🛡️ Protección de Rutas

### Rutas que requieren login (cualquier usuario autenticado)

```tsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route
  path="/home"
  element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  }
/>
```

### Rutas que requieren rol específico (admin)

```tsx
import ProtectedRoute from '../components/ProtectedRoute';
import RoleGuard from '../components/RoleGuard';

<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={['admin', 'administrador']}>
        <AdminDashboard />
      </RoleGuard>
    </ProtectedRoute>
  }
/>
```

## 🎯 Uso del Hook `useAuth`

### En cualquier componente

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { 
    user,              // Información del usuario
    isAuthenticated,   // ¿Está logueado?
    isLoading,         // ¿Cargando?
    login,             // Función de login
    logout,            // Función de logout
    hasRole,           // Verificar rol específico
    isAdmin            // ¿Es administrador?
  } = useAuth();

  return (
    <div>
      {isAuthenticated && (
        <p>Bienvenido {user?.name}</p>
      )}
      
      {isAdmin() && (
        <button>Panel de Admin</button>
      )}
      
      {hasRole('contador') && (
        <button>Reportes Contables</button>
      )}
    </div>
  );
}
```

## 🔄 Refresh de Tokens

El sistema automáticamente refresca el `access_token` cuando expira usando el `refresh_token`:

```typescript
// authService.ts - función getValidAccessToken()
export async function getValidAccessToken(): Promise<string | null> {
  let accessToken = localStorage.getItem('access_token');

  if (!accessToken) return null;

  // Verificar si expiró
  if (isTokenExpired(accessToken)) {
    // Refrescar automáticamente
    accessToken = await refreshAccessToken();
  }

  return accessToken;
}
```

## 📦 Decodificación de JWT

Implementación **manual** sin dependencias externas:

```typescript
// utils/jwtDecoder.ts
export function decodeJWT(token: string): DecodedToken | null {
  const parts = token.split('.');
  const payload = parts[1];
  const decoded = base64UrlDecode(payload);
  return JSON.parse(decoded);
}
```

### Estructura del Token Decodificado

```json
{
  "sub": "usuario123",
  "email": "usuario@datum.com",
  "name": "Juan Pérez",
  "preferred_username": "juan.perez",
  "exp": 1729224000,
  "iat": 1729223700,
  "realm_access": {
    "roles": ["user", "admin"]
  }
}
```

## 🎨 Componente UserNav

Para mostrar información del usuario y botón de logout:

```tsx
import UserNav from '../components/UserNav';

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Datum Travels</h1>
      <UserNav />
    </header>
  );
}
```

## ⚙️ Variables de Configuración

En `authService.ts`:

```typescript
const KEYCLOAK_URL = 'http://localhost:8180';
const REALM = 'datum-travels';
const CLIENT_ID = 'datum-travels-frontend';
```

Para producción, usar variables de entorno:

```typescript
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
const REALM = import.meta.env.VITE_KEYCLOAK_REALM;
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
```

## 🧪 Testing

### Usuarios de Prueba

Crear en Keycloak:

1. **Admin**
   - Username: `admin.test`
   - Password: `admin123`
   - Roles: `admin`, `user`

2. **Usuario Normal**
   - Username: `usuario.test`
   - Password: `usuario123`
   - Roles: `user`

### Probar Flujos

1. **Login como Admin**
   - Debe redirigir a `/admin`
   - Puede acceder a todas las rutas

2. **Login como Usuario**
   - Debe redirigir a `/home`
   - NO puede acceder a `/admin/*` (RoleGuard lo bloquea)

3. **Token Expirado**
   - Debe refrescar automáticamente
   - Si refresh token expiró, redirige a login

## 🚨 Manejo de Errores

### Credenciales Inválidas

```tsx
try {
  await login({ username, password });
} catch (error) {
  // Mostrar error al usuario
  setError('Credenciales inválidas');
}
```

### Token Expirado y Refresh Fallido

El sistema automáticamente hace logout y redirige a login.

## 📝 Ventajas de esta Implementación

✅ **Sin dependencias externas pesadas** (keycloak-js)  
✅ **Control total del flujo de autenticación**  
✅ **Decodificación JWT manual** (sin jwt-decode)  
✅ **Refresh automático de tokens**  
✅ **Protección de rutas por rol**  
✅ **TypeScript type-safe**  
✅ **Clean Architecture**  

## 🔮 Mejoras Futuras

- [ ] Implementar Google Sign-In (Social Login)
- [ ] Agregar autenticación de 2 factores (2FA)
- [ ] Implementar Remember Me (refresh token de larga duración)
- [ ] Agregar más roles (contador, empleado, supervisor)
- [ ] Implementar permisos granulares

## 📖 Referencias

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OpenID Connect](https://openid.net/connect/)
- [JWT.io](https://jwt.io/) - Para debuggear tokens

---

**¡Integración completa!** 🎉
