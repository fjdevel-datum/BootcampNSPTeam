# RoleGuard y Protección de Rutas en Datum Travels

## 🎯 Objetivo
Implementar un sistema de autenticación y autorización robusto que controle el acceso a las diferentes páginas según:
1. **Autenticación**: ¿El usuario tiene sesión activa?
2. **Autorización**: ¿El usuario tiene los permisos (roles) necesarios?

---

## 🔐 Componentes del Sistema de Seguridad

### 1. **ProtectedRoute** - Guardia de Autenticación

**Ubicación**: `src/components/ProtectedRoute.tsx`

**Función**: Verifica que el usuario esté autenticado (tenga sesión activa).

**Flujo de Funcionamiento**:
```
Usuario intenta acceder a /home
      ↓
¿Está autenticado? (tiene token válido)
      ├─ SÍ → Permite acceso ✅
      └─ NO → Redirige a Login (/) ❌
```

**Código Simplificado**:
```tsx
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />; // Espera mientras verifica
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // ❌ No autenticado → Login
  }

  return <>{children}</>; // ✅ Autenticado → Muestra contenido
}
```

**Uso en el Router**:
```tsx
// Ruta accesible solo si estás logueado
{
  path: "/home",
  element: (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  ),
}
```

---

### 2. **RoleGuard** - Guardia de Autorización por Roles

**Ubicación**: `src/components/RoleGuard.tsx`

**Función**: Verifica que el usuario tenga los roles necesarios (ej: `admin`, `contador`).

**Flujo de Funcionamiento**:
```
Usuario con sesión activa intenta acceder a /admin
      ↓
¿Tiene rol 'admin' o 'administrador'?
      ├─ SÍ → Permite acceso ✅
      └─ NO → Redirige a /home ❌
```

**Código Simplificado**:
```tsx
export default function RoleGuard({ 
  children, 
  allowedRoles, // Ej: ['admin', 'administrador']
  redirectTo = '/home' 
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // ❌ Sin sesión → Login
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasRequiredRole = user?.roles.some(role => 
    allowedRoles.includes(role)
  );

  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} replace />; // ❌ Sin permisos → Home
  }

  return <>{children}</>; // ✅ Tiene permisos → Muestra contenido
}
```

**Uso en el Router**:
```tsx
// Ruta accesible SOLO para administradores
{
  path: "/admin",
  element: (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['admin', 'administrador']}>
        <AdminDashboard />
      </RoleGuard>
    </ProtectedRoute>
  ),
}
```

---

## 🛡️ Sistema de Doble Protección

### **Nivel 1: ProtectedRoute** (Autenticación)
- Verifica que haya sesión activa
- Valida que el token JWT no esté expirado
- Si falla → Redirige a Login

### **Nivel 2: RoleGuard** (Autorización)
- Verifica que el usuario tenga los roles necesarios
- Compara `user.roles` con `allowedRoles`
- Si falla → Redirige a /home o página personalizada

**Ejemplo Completo**:
```tsx
// ❌ Usuario SIN sesión → Bloqueado por ProtectedRoute
// ❌ Usuario CON sesión pero rol "user" → Bloqueado por RoleGuard
// ✅ Usuario CON sesión y rol "admin" → Acceso PERMITIDO

{
  path: "/admin/usuarios",
  element: (
    <ProtectedRoute>           {/* ← Nivel 1: ¿Tiene sesión? */}
      <RoleGuard allowedRoles={['admin']}>  {/* ← Nivel 2: ¿Es admin? */}
        <AdminUsuarios />
      </RoleGuard>
    </ProtectedRoute>
  ),
}
```

---

## 🔑 AuthContext - Gestor del Estado de Autenticación

**Ubicación**: `src/context/AuthContext.tsx`

**Función**: Provee el estado global de autenticación a toda la aplicación.

**Estado que Maneja**:
```tsx
{
  user: {
    username: "carlos.hernandez",
    email: "carlos@datum.com",
    name: "Carlos Hernández",
    roles: ["admin", "user"] // ← Roles desde Keycloak
  },
  accessToken: "eyJhbGciOiJSUzI1NiIs...",
  refreshToken: "eyJhbGciOiJIUzI1NiIs...",
  isAuthenticated: true,
  isLoading: false
}
```

**Métodos Principales**:

1. **`login(credentials)`**
   - Autentica con Keycloak
   - Guarda tokens en localStorage
   - Sincroniza usuario con backend (vincula keycloak_id)

2. **`logout()`**
   - Limpia tokens de localStorage
   - Cierra sesión en Keycloak
   - Resetea el estado global

3. **`hasRole(role: string)`**
   - Verifica si el usuario tiene un rol específico
   - Ejemplo: `hasRole('admin')` → `true/false`

4. **`isAdmin()`**
   - Atajo para verificar si es administrador
   - Verifica roles: `'admin'` o `'administrador'`

---

## 🔄 Flujo Completo de Protección

```
1. Usuario escribe en el navegador: /admin/usuarios

2. React Router carga la ruta configurada

3. ProtectedRoute se ejecuta primero:
   ├─ ¿isLoading? → Muestra spinner
   ├─ ¿isAuthenticated? → NO → Redirige a /
   └─ SÍ → Continúa

4. RoleGuard se ejecuta después:
   ├─ ¿user.roles incluye 'admin'? → NO → Redirige a /home
   └─ SÍ → Permite acceso

5. Se renderiza <AdminUsuarios />
```

---

## 📦 Integración con Keycloak

**Roles en JWT Token**:
```json
{
  "preferred_username": "carlos.hernandez",
  "realm_access": {
    "roles": [
      "admin",
      "user",
      "offline_access",
      "uma_authorization"
    ]
  }
}
```

**Extracción de Roles**:
- El servicio `authService.getUserFromToken()` decodifica el JWT
- Extrae `realm_access.roles`
- Los almacena en `user.roles` del AuthContext
- RoleGuard los compara con `allowedRoles`

---

## 🎨 Estados de Loading

Ambos guards muestran un spinner mientras verifican:
```tsx
if (isLoading) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="spinner"></div>
      <p>Verificando sesión...</p>
    </div>
  );
}
```

Esto evita "parpadeos" donde el usuario ve la página antes de ser redirigido.

---

## 🚨 Casos de Uso Reales

### ✅ Caso 1: Empleado Normal Accede a /home
```
ProtectedRoute: ✅ (tiene sesión)
→ Muestra HomePage (eventos y gastos)
```

### ❌ Caso 2: Empleado Normal Intenta Acceder a /admin
```
ProtectedRoute: ✅ (tiene sesión)
RoleGuard: ❌ (rol "user" != "admin")
→ Redirige a /home
```

### ✅ Caso 3: Administrador Accede a /admin/usuarios
```
ProtectedRoute: ✅ (tiene sesión)
RoleGuard: ✅ (rol "admin" está en allowedRoles)
→ Muestra AdminUsuarios
```

### ❌ Caso 4: Usuario Sin Sesión Intenta Acceder a Cualquier Ruta
```
ProtectedRoute: ❌ (no tiene token válido)
→ Redirige a / (Login)
```

---

## 📁 Archivos Relacionados

| Archivo | Responsabilidad |
|---------|----------------|
| `components/ProtectedRoute.tsx` | Verifica autenticación (sesión activa) |
| `components/RoleGuard.tsx` | Verifica autorización (roles específicos) |
| `context/AuthContext.tsx` | Maneja estado global de autenticación |
| `services/authService.ts` | Lógica de login/logout con Keycloak |
| `utils/jwtDecoder.ts` | Decodifica JWT y extrae roles |
| `router/index.tsx` | Configuración de rutas protegidas |

---

## 💡 Conceptos Clave para la Exposición

1. **Autenticación vs Autorización**:
   - **Autenticación**: ¿Quién eres? (Login con Keycloak)
   - **Autorización**: ¿Qué puedes hacer? (Roles: admin, user)

2. **JWT (JSON Web Token)**:
   - Token firmado que contiene información del usuario
   - Incluye roles, email, username, fecha de expiración
   - Se envía en cada petición al backend: `Authorization: Bearer <token>`

3. **Guards en React**:
   - Componentes que "envuelven" rutas
   - Verifican condiciones antes de renderizar
   - Similar a middlewares en Express.js

4. **Doble Capa de Seguridad**:
   - Frontend: Guards de React (UX)
   - Backend: Validación de JWT (Seguridad real)
   - **Nunca confiar solo en frontend** → Siempre validar en backend

---

## ⚠️ Importante para Producción

El frontend **NO es seguro por sí solo**. Un usuario podría:
- Modificar localStorage y falsificar tokens
- Deshabilitar JavaScript y saltarse los guards
- Usar herramientas de desarrollador para manipular el DOM

**Por eso el backend SIEMPRE valida**:
```java
// Backend (Quarkus)
@RolesAllowed("admin")
@Path("/admin/usuarios")
public Response listarUsuarios() {
  // Solo se ejecuta si el token tiene rol 'admin'
}
```

**Los guards de React son para UX**, no seguridad real.
