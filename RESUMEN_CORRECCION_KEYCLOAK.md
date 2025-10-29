# 🔧 Resumen de Correcciones - Integración Keycloak

## ✅ Cambios Realizados

### 1. **Archivos Eliminados**
- ❌ `EventoResource.java` (ejemplo duplicado) → Eliminado
- ✅ Ahora solo existe `EventoController.java` (tu archivo original)

### 2. **EventoController.java** - Actualizado
**Ubicación**: `BackEnd/quarkus-api/src/main/java/datum/travels/infrastructure/adapter/rest/EventoController.java`

**Cambios**:
- ✅ Agregado `@Authenticated` a nivel de clase (requiere JWT)
- ✅ Inyectado `CurrentUserProvider`
- ✅ Método `listarEventos()`:
  - ❌ Antes: Usaba `AuthSimulation.ID_EMPLEADO_SIMULADO`
  - ✅ Ahora: Obtiene `idEmpleado` automáticamente desde el JWT
- ✅ Método `crearEvento()`:
  - ❌ Antes: Aceptaba cualquier `idEmpleado`
  - ✅ Ahora: Fuerza el `idEmpleado` del usuario autenticado

### 3. **AuthResource.java** - Path Corregido
**Ubicación**: `BackEnd/quarkus-api/src/main/java/datum/travels/infrastructure/adapter/rest/AuthResource.java`

**Cambios**:
- ❌ Antes: `@Path("/api/auth")` (conflicto con AuthController)
- ✅ Ahora: `@Path("/api/user")`
- ✅ Endpoint de sincronización: `POST /api/user/sync`

### 4. **authService.ts** - Frontend Actualizado
**Ubicación**: `FrontEnd/frontend/src/services/authService.ts`

**Cambios**:
- ❌ Antes: Llamaba a `http://localhost:8080/api/auth/sync`
- ✅ Ahora: Llama a `http://localhost:8080/api/user/sync`

---

## 🎯 Flujo Completo Actualizado

```
1. Usuario hace login en Frontend (React)
   ↓
2. Keycloak retorna JWT con keycloak_id
   ↓
3. Frontend llama a POST /api/user/sync
   ↓
4. Backend vincula keycloak_id con Usuario en BD
   ↓
5. Próximas requests usan CurrentUserProvider
   ↓
6. GET /api/eventos → Solo eventos del empleado autenticado
   POST /api/eventos → Crea evento para empleado autenticado
```

---

## 🧪 Pruebas a Realizar

### 1. **Compilar Backend**
```powershell
cd BackEnd\quarkus-api
.\mvnw clean compile
```

### 2. **Iniciar Backend** (modo desarrollo)
```powershell
.\mvnw quarkus:dev
```

### 3. **Iniciar Frontend**
```powershell
cd FrontEnd\frontend
npm run dev
```

### 4. **Hacer Login**
- Ir a: `http://localhost:5173`
- Login con usuario existente (ej: `carlos.martinez`)
- Verificar en consola del navegador:
  ```
  ✅ Usuario sincronizado con backend: {success: true, idEmpleado: 1}
  ```

### 5. **Verificar BD**
```sql
-- Ejecutar desde SQL Developer o SQLPlus
SELECT 
    u.id_usuario,
    u.usuario_app,
    u.keycloak_id,
    e.nombre || ' ' || e.apellido as empleado
FROM Usuario u
LEFT JOIN Empleado e ON u.id_empleado = e.id_empleado;
```

**Resultado esperado**: El usuario que hizo login ahora tiene `keycloak_id` != NULL

---

## 📍 Endpoints Actualizados

### Backend (Quarkus)

| Endpoint | Método | Requiere Auth | Descripción |
|----------|--------|---------------|-------------|
| `/api/user/sync` | POST | ✅ | Sincroniza keycloak_id con BD |
| `/api/eventos` | GET | ✅ | Lista eventos del usuario autenticado |
| `/api/eventos` | POST | ✅ | Crea evento para usuario autenticado |
| `/api/eventos/{id}` | GET | ✅ | Detalle de evento |
| `/api/eventos/{id}/estado` | PATCH | ✅ | Actualiza estado del evento |

### Frontend (React)

```typescript
// authService.ts
export async function login(credentials: LoginCredentials): Promise<KeycloakTokenResponse> {
  // 1. Login con Keycloak
  const data = await fetch(TOKEN_ENDPOINT, {...});
  
  // 2. Guardar tokens
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  
  // 3. Sincronizar con backend (AUTOMÁTICO)
  await syncUserWithBackend(data.access_token);
  
  return data;
}
```

---

## ⚠️ Importante

### Usuarios en Keycloak DEBEN coincidir con BD

Para que la sincronización funcione, asegúrate de que:

```
Keycloak Username = Usuario.usuario_app (en BD)
```

Ejemplo:
- **Keycloak**: Username = `carlos.martinez`
- **BD**: `SELECT * FROM Usuario WHERE usuario_app = 'carlos.martinez'` → DEBE existir

---

## 🐛 Troubleshooting

### Error: "Usuario no vinculado a un empleado"
**Causa**: El usuario hizo login pero no tiene `id_empleado` en la tabla Usuario
**Solución**: 
```sql
UPDATE Usuario SET id_empleado = 1 WHERE usuario_app = 'carlos.martinez';
```

### Error: "Usuario no encontrado"
**Causa**: El username de Keycloak no coincide con ningún `usuario_app` en BD
**Solución**: Crear el usuario en BD o corregir el username en Keycloak

### Error: 401 Unauthorized
**Causa**: El JWT expiró o no es válido
**Solución**: Hacer logout y login nuevamente

---

## ✅ Estado Actual

- ✅ BD tiene columna `keycloak_id`
- ✅ Entidad `Usuario.java` actualizada
- ✅ Repository con método `findByKeycloakId()`
- ✅ Use Case `SincronizarUsuarioKeycloakUseCase` creado
- ✅ `CurrentUserProvider` utility creada
- ✅ `EventoController` usa autenticación de Keycloak
- ✅ `AuthResource` tiene endpoint `/api/user/sync`
- ✅ Frontend sincroniza automáticamente en login
- ✅ Backend compila sin errores críticos

---

## 🚀 Próximo Paso

**Ejecuta el backend y haz una prueba de login completa:**

```powershell
# Terminal 1 - Backend
cd BackEnd\quarkus-api
.\mvnw quarkus:dev

# Terminal 2 - Frontend
cd FrontEnd\frontend
npm run dev

# Navegador
# http://localhost:5173 → Login → Ver consola (F12)
```
