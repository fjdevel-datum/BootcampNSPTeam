# 🎭 Guía de Creación de Roles en Keycloak

## 📋 Introducción

En el contexto de **Datum Travels**, necesitamos definir diferentes roles para controlar el acceso:

- **`admin`**: Administrador del sistema (acceso total)
- **`empleado`**: Empleado estándar (crear eventos, gastos)
- **`contador`**: Personal de contabilidad (revisar/aprobar reportes)
- **`gerente`**: Gerente de área (aprobar viajes)

---

## 🚀 PASO 1: Crear Realm Roles

### 1.1 Acceder a Realm Roles

1. Ve a **http://localhost:8180**
2. Login como admin (admin/admin123)
3. Asegúrate de estar en el realm **"datum-travels"** (dropdown superior izquierdo)
4. En el menú lateral, click en **"Realm roles"**

### 1.2 Crear el rol "admin"

1. Click en el botón **"Create role"**
2. En el formulario:

| Campo | Valor |
|-------|-------|
| **Role name** | `admin` |
| **Description** | `Administrador del sistema con acceso total` |

3. Click **"Save"**

✅ **Rol "admin" creado**

### 1.3 Crear el rol "empleado"

1. Click en **"Create role"** nuevamente
2. En el formulario:

| Campo | Valor |
|-------|-------|
| **Role name** | `empleado` |
| **Description** | `Empleado estándar - puede crear eventos y gastos` |

3. Click **"Save"**

✅ **Rol "empleado" creado**

### 1.4 Crear el rol "contador"

1. Click en **"Create role"**
2. En el formulario:

| Campo | Valor |
|-------|-------|
| **Role name** | `contador` |
| **Description** | `Personal de contabilidad - revisa y aprueba reportes` |

3. Click **"Save"**

✅ **Rol "contador" creado**

### 1.5 Crear el rol "gerente"

1. Click en **"Create role"**
2. En el formulario:

| Campo | Valor |
|-------|-------|
| **Role name** | `gerente` |
| **Description** | `Gerente de área - aprueba viajes y gastos de representación` |

3. Click **"Save"**

✅ **Rol "gerente" creado**

### 1.6 Verificar los roles

En la lista de **Realm roles** deberías ver:

- ✅ admin
- ✅ empleado
- ✅ contador
- ✅ gerente
- default-roles-datum-travels (rol por defecto de Keycloak)
- offline_access (rol por defecto de Keycloak)
- uma_authorization (rol por defecto de Keycloak)

---

## 👤 PASO 2: Asignar Roles a Usuarios

### 2.1 Asignar rol "empleado" a carlos.test

1. En el menú lateral, click en **"Users"**
2. Busca y click en **"carlos.test"**
3. Ve a la pestaña **"Role mapping"**
4. Click en **"Assign role"**
5. En el diálogo que aparece:
   - Filtra por **"Filter by realm roles"** (debe estar seleccionado por defecto)
   - Selecciona la checkbox de **"empleado"**
   - Click en **"Assign"**

✅ **carlos.test ahora tiene el rol "empleado"**

### 2.2 Verificar asignación

En la pestaña **"Role mapping"** de carlos.test deberías ver:

**Assigned roles:**
- ✅ empleado
- default-roles-datum-travels
- offline_access
- uma_authorization

---

## 🧪 PASO 3: Crear Usuarios Adicionales con Roles

### 3.1 Crear usuario "admin"

1. Ve a **Users** → **"Add user"**
2. Configuración:

| Campo | Valor |
|-------|-------|
| **Username** | `admin.datum` |
| **Email** | `admin@datum.com` |
| **First name** | `Admin` |
| **Last name** | `Datum` |
| **Email verified** | ✅ ON |
| **Enabled** | ✅ ON |

3. Click **"Create"**
4. Ve a **Credentials** → **"Set password"**:
   - Password: `admin123`
   - Temporary: ❌ OFF
   - Click **"Save"**
5. Ve a **Role mapping** → **"Assign role"**
   - Selecciona **"admin"**
   - Click **"Assign"**

✅ **Usuario admin.datum creado con rol admin**

### 3.2 Crear usuario "contador"

1. **Add user**:

| Campo | Valor |
|-------|-------|
| **Username** | `contador.datum` |
| **Email** | `contador@datum.com` |
| **First name** | `María` |
| **Last name** | `López` |
| **Email verified** | ✅ ON |

2. **Set password**: `contador123` (Temporary: OFF)
3. **Assign role**: `contador`

✅ **Usuario contador.datum creado**

### 3.3 Crear usuario "gerente"

1. **Add user**:

| Campo | Valor |
|-------|-------|
| **Username** | `gerente.datum` |
| **Email** | `gerente@datum.com` |
| **First name** | `Roberto` |
| **Last name** | `Martínez` |
| **Email verified** | ✅ ON |

2. **Set password**: `gerente123` (Temporary: OFF)
3. **Assign role**: `gerente`

✅ **Usuario gerente.datum creado**

---

## 🧪 PASO 4: Probar Roles en los Tokens

### 4.1 Probar con usuario empleado (carlos.test)

```powershell
curl -X POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "grant_type=password" `
  -d "client_id=datum-travels-backend" `
  -d "client_secret=tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT" `
  -d "username=carlos.test" `
  -d "password=test123"
```

**Decodifica el token JWT en:** https://jwt.io

En el payload deberías ver:
```json
{
  "realm_access": {
    "roles": [
      "empleado",  ← NUEVO ROL
      "default-roles-datum-travels",
      "offline_access",
      "uma_authorization"
    ]
  },
  "preferred_username": "carlos.test"
}
```

### 4.2 Probar con usuario admin

```powershell
curl -X POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "grant_type=password" `
  -d "client_id=datum-travels-backend" `
  -d "client_secret=tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT" `
  -d "username=admin.datum" `
  -d "password=admin123"
```

Deberías ver:
```json
{
  "realm_access": {
    "roles": [
      "admin",  ← ROL ADMIN
      "default-roles-datum-travels",
      ...
    ]
  }
}
```

---

## 🔧 PASO 5: Configurar Roles por Defecto (Opcional)

Si quieres que todos los nuevos usuarios tengan automáticamente el rol "empleado":

### 5.1 Configurar Default Roles

1. En el menú lateral, click en **"Realm roles"**
2. Click en **"default-roles-datum-travels"**
3. Ve a la pestaña **"Action"** → **"Add associated roles"**
4. Selecciona **"empleado"**
5. Click **"Add"**

✅ **Ahora todos los usuarios nuevos tendrán automáticamente el rol "empleado"**

---

## 📝 PASO 6: Usar Roles en tu Backend Quarkus

### 6.1 Decorar endpoints con roles

En tus Controllers REST, puedes usar:

```java
@Path("/api/admin")
@RolesAllowed("admin")  // Solo usuarios con rol "admin"
public class AdminController {
    
    @GET
    @Path("/reportes")
    public Response getReportesGlobales() {
        // Solo accesible por admin
    }
}
```

```java
@Path("/api/eventos")
public class EventoController {
    
    @POST
    @RolesAllowed({"empleado", "admin"})  // Empleado o Admin
    public Response crearEvento(CrearEventoDTO dto) {
        // Accesible por empleado o admin
    }
    
    @PUT
    @Path("/{id}/aprobar")
    @RolesAllowed({"gerente", "admin"})  // Solo Gerente o Admin
    public Response aprobarEvento(@PathParam("id") Long id) {
        // Solo gerente o admin pueden aprobar
    }
}
```

### 6.2 Obtener roles del usuario actual

```java
@Inject
JsonWebToken jwt;

public Response miMetodo() {
    Set<String> roles = jwt.getGroups(); // Obtener roles
    
    if (roles.contains("admin")) {
        // Lógica especial para admin
    }
    
    String username = jwt.getName(); // carlos.test
    String email = jwt.getClaim("email"); // carlos@datum.com
}
```

---

## 📊 Resumen de Roles Creados

| Rol | Usuario de Prueba | Contraseña | Permisos |
|-----|------------------|------------|----------|
| **admin** | admin.datum | admin123 | Acceso total al sistema |
| **empleado** | carlos.test | test123 | Crear eventos y gastos |
| **contador** | contador.datum | contador123 | Revisar/aprobar reportes |
| **gerente** | gerente.datum | gerente123 | Aprobar viajes y gastos |

---

## ✅ Checklist Final

- [ ] ✅ Roles creados en Keycloak (admin, empleado, contador, gerente)
- [ ] ✅ carlos.test tiene rol "empleado"
- [ ] ✅ admin.datum tiene rol "admin"
- [ ] ✅ contador.datum tiene rol "contador"
- [ ] ✅ gerente.datum tiene rol "gerente"
- [ ] ✅ Tokens JWT contienen los roles correctos
- [ ] ⏳ Backend usa @RolesAllowed en endpoints (siguiente paso)

---

## 🔄 Próximos Pasos

### Paso 1: Habilitar OIDC en Quarkus

En `application.properties`:

```properties
# Cambiar de false a true
quarkus.oidc.enabled=true
```

### Paso 2: Modificar LoginUseCase

Adaptar el código para validar el token de Keycloak en lugar de generar uno propio.

### Paso 3: Proteger endpoints

Agregar `@RolesAllowed` en los Controllers REST según la matriz de permisos.

---

## 🐛 Troubleshooting

### No veo el rol en el token JWT

**Solución:**
1. Verifica que el rol esté asignado al usuario en **Role mapping**
2. Genera un nuevo token (los cambios no afectan tokens ya emitidos)
3. Verifica en jwt.io que el campo `realm_access.roles` contenga tu rol

### Error "Forbidden" al llamar endpoint con @RolesAllowed

**Solución:**
1. Asegúrate de que `quarkus.oidc.enabled=true`
2. Verifica que el token JWT se esté enviando en el header: `Authorization: Bearer {token}`
3. Verifica que el usuario tenga el rol requerido

### Usuario no tiene el rol que le asigné

**Solución:**
1. Ve a Users → {usuario} → Role mapping
2. Verifica en **"Assigned roles"** que el rol esté presente
3. Si no está, usa **"Assign role"** nuevamente

---

**¿Listo para continuar?** Una vez hayas creado y probado los roles, el siguiente paso es integrarlos en tu código Quarkus.
