# 🔐 Integración Keycloak con Usuario Local

## Resumen

Este documento explica cómo se integra Keycloak (proveedor de autenticación) con la tabla `Usuario` existente en Oracle.

---

## 🎯 Arquitectura

```
┌─────────────────┐
│   KEYCLOAK      │
│  (Auth Server)  │
│                 │
│  UUID generado: │
│  0b2f3672-...   │
└────────┬────────┘
         │
         │ JWT Token
         ▼
┌─────────────────┐
│   FRONTEND      │
│  (React App)    │
└────────┬────────┘
         │
         │ HTTP + Bearer Token
         ▼
┌─────────────────┐
│   BACKEND       │
│  (Quarkus API)  │
│                 │
│  1. Valida JWT  │
│  2. Extrae UUID │
│  3. Busca en BD │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   ORACLE DATABASE       │
│                         │
│  Usuario Table:         │
│  ┌──────────────────┐   │
│  │ id_usuario    ←PK│   │
│  │ usuario_app      │   │
│  │ keycloak_id   ←UK│   │
│  │ id_empleado   ←FK│   │
│  └──────────────────┘   │
└─────────────────────────┘
```

---

## 🗂️ Modelo de Datos

### Tabla Usuario (ANTES)
```sql
CREATE TABLE "Usuario" (
  "id_usuario" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_empleado" NUMBER(5),
  "usuario_app" VARCHAR2(50) NOT NULL UNIQUE,
  "contraseña" VARCHAR2(50) NOT NULL
);
```

### Tabla Usuario (DESPUÉS)
```sql
CREATE TABLE "Usuario" (
  "id_usuario" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_empleado" NUMBER(5),
  "usuario_app" VARCHAR2(50) NOT NULL UNIQUE,
  "contraseña" VARCHAR2(50) NOT NULL,
  "keycloak_id" VARCHAR2(100) UNIQUE  -- ✨ NUEVO
);
```

---

## 🔄 Flujo de Autenticación

### 1. Login (Frontend)
```typescript
// Login.tsx
const handleLogin = async (credentials) => {
  // 1. Autentica con Keycloak
  const tokens = await login(credentials);
  
  // 2. Automáticamente sincroniza con backend
  // (ya incluido en authService.ts)
};
```

### 2. Sincronización (Backend)
```java
// AuthResource.java
@POST
@Path("/sync")
@Authenticated
public Response sincronizarUsuario() {
    String keycloakId = jwt.getSubject(); // UUID de Keycloak
    String username = jwt.getName();       // usuario_app
    
    // Actualiza keycloak_id en la BD
    sincronizarUsuarioUseCase.vincularKeycloakId(username, keycloakId);
}
```

### 3. Uso en Endpoints Protegidos
```java
@GET
@Path("/mis-eventos")
@Authenticated
public Response getMisEventos() {
    // Obtiene automáticamente el empleado del usuario autenticado
    Long idEmpleado = currentUserProvider.getIdEmpleado()
        .orElseThrow(() -> new WebApplicationException(403));
    
    // Solo retorna eventos de ESE empleado
    return eventosRepository.findByEmpleado(idEmpleado);
}
```

---

## 🛠️ Componentes Clave

### Backend

| Componente | Responsabilidad |
|------------|-----------------|
| `Usuario.java` | Entidad con campo `keycloak_id` |
| `UsuarioRepository` | Query por `keycloak_id` |
| `SincronizarUsuarioKeycloakUseCase` | Vincula UUID con usuario |
| `CurrentUserProvider` | Obtiene usuario desde JWT |
| `UsuarioContextFilter` | Extrae info del JWT |
| `AuthResource` | Endpoint `/api/auth/sync` |

### Frontend

| Archivo | Responsabilidad |
|---------|-----------------|
| `authService.ts` | Login + sincronización automática |
| `AuthContext.tsx` | Manejo de estado de autenticación |
| `ProtectedRoute.tsx` | Rutas que requieren login |

---

## 📋 Pasos de Implementación

### 1️⃣ Base de Datos
```bash
sqlplus usuario/password@xe @scripts/add-keycloak-id.sql
```

### 2️⃣ Backend
- ✅ Entidad `Usuario` actualizada
- ✅ Repository con `findByKeycloakId()`
- ✅ Use Case `SincronizarUsuarioKeycloakUseCase`
- ✅ Utility `CurrentUserProvider`
- ✅ Endpoint `/api/auth/sync`

### 3️⃣ Frontend
- ✅ `authService.ts` con sincronización automática
- ✅ Llamada a `/api/auth/sync` después de login

### 4️⃣ Keycloak
1. Crear usuario en Admin Console
2. Asignar roles (`user` o `admin`)
3. El UUID se genera automáticamente

---

## 🎯 Casos de Uso

### ✅ Usuario Normal
1. Login → Keycloak valida credenciales
2. Backend vincula `keycloak_id` con `id_usuario`
3. Endpoints retornan SOLO datos del `id_empleado` asociado

### ✅ Administrador
1. Login → Keycloak retorna rol `admin`
2. Backend permite acceso a endpoints `/admin/*`
3. Puede ver/gestionar datos de todos los empleados

---

## 🔍 Queries Útiles

### Ver usuarios vinculados
```sql
SELECT 
    u.id_usuario,
    u.usuario_app,
    u.keycloak_id,
    e.nombre || ' ' || e.apellido as empleado
FROM "Usuario" u
LEFT JOIN "Empleado" e ON u.id_empleado = e.id_empleado;
```

### Verificar sincronización
```sql
-- Usuarios SIN keycloak_id (no han hecho login desde Keycloak)
SELECT usuario_app 
FROM "Usuario" 
WHERE keycloak_id IS NULL;
```

### Buscar por Keycloak ID
```sql
SELECT * 
FROM "Usuario" 
WHERE keycloak_id = '0b2f3672-f3a5-44d8-86b3-ca2d2610e5da';
```

---

## ⚠️ Consideraciones Importantes

### ✅ Ventajas de este enfoque
- Separación de responsabilidades (Auth vs Data)
- Sin romper relaciones existentes (FK siguen igual)
- Migración gradual (usuarios viejos siguen funcionando)
- Flexibilidad para cambiar de proveedor de auth

### ⚠️ Puntos a tener en cuenta
- `id_usuario` sigue siendo PK (no cambiar)
- `keycloak_id` es único (constraint)
- Primer login sincroniza automáticamente
- Si usuario no existe en BD → retorna 404

---

## 🧪 Testing

### Test 1: Login + Sincronización
```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "carlos.lopez", "password": "pass123"}'

# Respuesta incluye access_token

# 2. Verificar sincronización
curl -X POST http://localhost:8080/api/auth/sync \
  -H "Authorization: Bearer {access_token}"

# Respuesta: {"success": true, "idEmpleado": 1}
```

### Test 2: Endpoint Protegido
```bash
curl -X GET http://localhost:8080/api/eventos \
  -H "Authorization: Bearer {access_token}"

# Retorna SOLO eventos del empleado autenticado
```

---

## 📞 Soporte

Para dudas sobre:
- **Keycloak**: Ver `KEYCLOAK_GUIA.md`
- **Clean Architecture**: Ver `CLEAN_ARCHITECTURE.md`
- **Frontend Auth**: Ver `KEYCLOAK_FRONTEND_INTEGRATION.md`
