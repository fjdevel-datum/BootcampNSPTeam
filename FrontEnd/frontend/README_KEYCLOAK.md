# 🔐 Integración Keycloak Frontend - Datum Travels

## ✅ Implementación Completada

La integración de Keycloak en el frontend está **100% completa** y lista para usar.

## 🎯 ¿Qué se implementó?

### 1. Autenticación JWT directa con Keycloak
- ✅ Login con usuario/contraseña
- ✅ Logout con invalidación de sesión
- ✅ Refresh automático de tokens
- ✅ Decodificación JWT manual (sin dependencias externas)

### 2. Control de Acceso por Roles
- ✅ Rol **admin**: Acceso total (usuario + admin)
- ✅ Rol **user**: Solo páginas de usuario
- ✅ Bloqueo automático de rutas `/admin/*` para usuarios normales

### 3. Componentes de Protección
- ✅ `ProtectedRoute`: Requiere autenticación
- ✅ `RoleGuard`: Requiere rol específico
- ✅ `UserNav`: Información del usuario + logout

### 4. Estado Global de Autenticación
- ✅ `AuthContext`: Maneja sesión, usuario, tokens
- ✅ `useAuth` hook: Acceso fácil en cualquier componente

## 📁 Archivos Creados/Modificados

```
FrontEnd/frontend/
├── src/
│   ├── config/
│   │   └── constants.ts              # ✨ NUEVO - Configuración centralizada
│   │
│   ├── context/
│   │   └── AuthContext.tsx           # ✨ NUEVO - Estado global de auth
│   │
│   ├── hooks/
│   │   └── useAuth.ts                # ✨ NUEVO - Hook personalizado
│   │
│   ├── components/
│   │   ├── ProtectedRoute.tsx        # ✨ NUEVO - Protección de rutas
│   │   ├── RoleGuard.tsx             # ✨ NUEVO - Control por roles
│   │   └── UserNav.tsx               # ✨ NUEVO - Navegación usuario
│   │
│   ├── layout/
│   │   └── MainLayout.tsx            # ✨ NUEVO - Layout con header
│   │
│   ├── services/
│   │   └── authService.ts            # ♻️ ACTUALIZADO - Integración Keycloak
│   │
│   ├── types/
│   │   └── auth.ts                   # ✨ NUEVO - Tipos TypeScript
│   │
│   ├── utils/
│   │   └── jwtDecoder.ts             # ✨ NUEVO - Decodificador JWT
│   │
│   ├── pages/
│   │   └── Login.tsx                 # ♻️ ACTUALIZADO - Usa AuthContext
│   │
│   ├── router/
│   │   └── index.tsx                 # ♻️ ACTUALIZADO - Rutas protegidas
│   │
│   └── main.tsx                      # ♻️ ACTUALIZADO - AuthProvider
│
├── .env.example                      # ✨ NUEVO - Variables de entorno
├── setup-keycloak.ps1                # ✨ NUEVO - Script de instalación
│
└── 📚 Documentación:
    ├── KEYCLOAK_FRONTEND_INTEGRATION.md   # Guía completa
    ├── KEYCLOAK_QUICK_START.md            # Inicio rápido
    └── RESUMEN_VISUAL_KEYCLOAK.md         # Diagramas y flujos
```

## 🚀 Inicio Rápido

### Paso 1: Instalar Dependencias

**Opción A: Usar script automatizado (PowerShell)**
```powershell
cd FrontEnd/frontend
.\setup-keycloak.ps1
```

**Opción B: Manual**
```bash
cd FrontEnd/frontend
npm install
cp .env.example .env
```

### Paso 2: Configurar Keycloak

Seguir la guía: **`KEYCLOAK_QUICK_START.md`**

Resumen:
1. Crear client: `datum-travels-frontend`
2. Crear roles: `admin`, `user`
3. Crear usuarios:
   - `admin.test` / `admin123` (rol: admin)
   - `usuario.test` / `usuario123` (rol: user)

### Paso 3: Iniciar Frontend

```bash
npm run dev
```

Abrir: **http://localhost:5173**

## 🧪 Probar la Integración

### Test 1: Login como Administrador
```
Usuario: admin.test
Password: admin123

✅ Debe redirigir a /admin
✅ Puede acceder a todas las rutas
```

### Test 2: Login como Usuario Normal
```
Usuario: usuario.test
Password: usuario123

✅ Debe redirigir a /home
❌ NO puede acceder a /admin/* (bloqueo automático)
```

### Test 3: Protección de Rutas
```
1. Sin login, intentar acceder a /home
   → Redirige a / (login)

2. Login como usuario, intentar acceder a /admin
   → Redirige a /home (sin permisos)
```

## 🔑 Uso del Hook `useAuth`

En cualquier componente:

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { 
    user,              // { username, email, name, roles }
    isAuthenticated,   // true/false
    login,             // (credentials) => Promise
    logout,            // () => Promise
    isAdmin,           // () => boolean
    hasRole            // (role: string) => boolean
  } = useAuth();

  return (
    <div>
      {isAuthenticated && (
        <p>Bienvenido {user?.name}</p>
      )}
      
      {isAdmin() && (
        <button onClick={() => navigate('/admin')}>
          Panel Admin
        </button>
      )}
    </div>
  );
}
```

## 🛡️ Protección de Rutas

### Rutas Públicas (sin autenticación)
```tsx
{
  path: "/",
  element: <LoginPage />
}
```

### Rutas Protegidas (requiere login)
```tsx
{
  path: "/home",
  element: (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  )
}
```

### Rutas con Control de Roles (solo admin)
```tsx
{
  path: "/admin",
  element: (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['admin', 'administrador']}>
        <AdminDashboard />
      </RoleGuard>
    </ProtectedRoute>
  )
}
```

## 🎨 Componente UserNav

Agregar al header para mostrar usuario y botón de logout:

```tsx
import UserNav from '../components/UserNav';

function Header() {
  return (
    <header>
      <h1>Datum Travels</h1>
      <UserNav />
    </header>
  );
}
```

O usar el `MainLayout` completo:

```tsx
import MainLayout from '../layout/MainLayout';

function HomePage() {
  return (
    <MainLayout>
      <h2>Dashboard</h2>
      {/* Contenido de la página */}
    </MainLayout>
  );
}
```

## 📊 Arquitectura

```
Frontend                    Keycloak
   │                           │
   │  1. Login (POST)          │
   ├──────────────────────────>│
   │                           │
   │  2. JWT Response          │
   │<──────────────────────────┤
   │                           │
   │  3. Decodifica JWT        │
   │     - Extrae roles        │
   │     - Actualiza estado    │
   │                           │
   │  4. Navegación según rol  │
   │     - admin → /admin      │
   │     - user → /home        │
```

## 🔄 Flujo de Autenticación Completo

1. Usuario ingresa credenciales en `LoginPage`
2. `AuthContext.login()` llama a `authService.login()`
3. `authService` hace POST a Keycloak
4. Keycloak valida y retorna JWT
5. Tokens se guardan en `localStorage`
6. JWT se decodifica para extraer usuario y roles
7. `AuthContext` actualiza estado: `isAuthenticated = true`
8. Redirección según rol:
   - Admin → `/admin`
   - Usuario → `/home`
9. Rutas protegidas verifican autenticación
10. `RoleGuard` bloquea `/admin/*` si no es admin

## ⚙️ Configuración

Archivo: `src/config/constants.ts`

```typescript
export const KEYCLOAK_CONFIG = {
  url: 'http://localhost:8180',
  realm: 'datum-travels',
  clientId: 'datum-travels-frontend',
};
```

Para producción, crear `.env`:

```env
VITE_KEYCLOAK_URL=https://keycloak.miempresa.com
VITE_KEYCLOAK_REALM=datum-travels
VITE_KEYCLOAK_CLIENT_ID=datum-travels-frontend
```

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| **KEYCLOAK_QUICK_START.md** | Configuración rápida de Keycloak (5-10 min) |
| **KEYCLOAK_FRONTEND_INTEGRATION.md** | Guía técnica completa de integración |
| **RESUMEN_VISUAL_KEYCLOAK.md** | Diagramas, flujos y casos de uso |

## 🎯 Características Implementadas

- ✅ **Login/Logout** con Keycloak
- ✅ **Manejo de JWT** (almacenamiento, decodificación, validación)
- ✅ **Refresh automático** de tokens expirados
- ✅ **Control de roles** (admin vs user)
- ✅ **Protección de rutas** (ProtectedRoute + RoleGuard)
- ✅ **Estado global** de autenticación (AuthContext)
- ✅ **TypeScript** completamente tipado
- ✅ **Sin dependencias externas** para JWT (implementación manual)
- ✅ **Clean Architecture** - Separación de responsabilidades
- ✅ **Documentación completa** con ejemplos

## 🔮 Próximos Pasos (Opcional)

### Mejoras Futuras
- [ ] Google Sign-In (Social Login)
- [ ] Autenticación de 2 factores (2FA)
- [ ] Remember Me (refresh token persistente)
- [ ] Más roles granulares (contador, supervisor, etc.)

### Integración con Backend
Cuando necesites hacer peticiones al backend:

```typescript
// Crear interceptor para agregar token a peticiones
import { getValidAccessToken } from './services/authService';

async function fetchWithAuth(url: string, options?: RequestInit) {
  const token = await getValidAccessToken();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// Uso:
const response = await fetchWithAuth('http://localhost:8081/api/eventos');
```

## 🚨 Troubleshooting

### Error: "CORS policy"
- Verificar en Keycloak: Client → `datum-travels-frontend` → Web Origins: `http://localhost:5173`

### Error: "Invalid credentials"
- Verificar usuario existe en Keycloak
- Password no es temporal
- Client ID correcto: `datum-travels-frontend`

### Error: Rutas admin accesibles por usuario normal
- Verificar roles asignados en Keycloak
- Verificar `RoleGuard` con `allowedRoles={['admin']}`

### Frontend no carga
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📞 Soporte

Para más información, consultar:
- 📖 Documentación en `/FrontEnd/frontend/*.md`
- 🌐 [Keycloak Docs](https://www.keycloak.org/documentation)
- 🔐 [OpenID Connect](https://openid.net/connect/)

---

## ✅ Checklist de Validación

Antes de usar en producción:

- [ ] Keycloak configurado correctamente
- [ ] Client `datum-travels-frontend` creado
- [ ] Roles `admin` y `user` definidos
- [ ] Usuarios de prueba creados
- [ ] Frontend inicia sin errores
- [ ] Login funciona correctamente
- [ ] Logout invalida sesión
- [ ] Rutas protegidas bloquean acceso sin login
- [ ] RoleGuard bloquea `/admin` para usuarios normales
- [ ] Refresh de tokens funciona automáticamente
- [ ] Variables de entorno configuradas para producción

---

**🎉 ¡Integración completa y funcional!**

La comunicación JWT entre Frontend y Keycloak está lista para usar.
