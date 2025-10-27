# 🧪 Guía Paso a Paso - Probar Endpoints en Swagger

## ✅ **Paso 1: Token Obtenido** 

Ya tienes el token copiado en el portapapeles. Es un token de **ADMIN** (usuario: carlos.martinez).

---

## 🌐 **Paso 2: Abrir Swagger UI**

1. Abre tu navegador
2. Ve a: **http://localhost:8081/swagger-ui**

---

## 🔐 **Paso 3: Autorizarte en Swagger**

### **3.1 Buscar el botón Authorize**
- En la parte superior derecha de Swagger UI verás un botón verde que dice **"Authorize"**
- Haz click en él

### **3.2 Configurar la autenticación**
Se abrirá un modal con diferentes opciones de autenticación.

**Busca la sección que dice:** `SecurityScheme (http, bearer)`

**Ahí verás un campo que dice:**
```
Value: *****
```

### **3.3 Pegar el token**
1. Haz click en el campo de texto
2. **Pega el token** que tienes en el portapapeles (Ctrl + V)
3. El token debe verse algo así:
   ```
   eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJHTmtp...
   ```

### **3.4 Confirmar**
1. Haz click en el botón **"Authorize"** (dentro del modal)
2. Haz click en **"Close"**

---

## 🎯 **Paso 4: Probar los Endpoints**

Ahora todos tus requests incluirán automáticamente el token en el header `Authorization: Bearer ...`

### **Endpoints disponibles para probar:**

#### **1. Endpoint Público (sin autenticación requerida)**
- **Endpoint**: `GET /api/auth/test/public`
- **Descripción**: No requiere autenticación
- **Cómo probar**:
  1. Busca la sección `auth-test-controller`
  2. Expande `GET /api/auth/test/public`
  3. Click en **"Try it out"**
  4. Click en **"Execute"**
  5. Deberías ver respuesta `200 OK` con mensaje: `"Endpoint público - Accesible sin autenticación"`

---

#### **2. Endpoint para Usuarios (USER + ADMIN)**
- **Endpoint**: `GET /api/auth/test/user`
- **Descripción**: Requiere rol USER o ADMIN
- **Cómo probar**:
  1. Expande `GET /api/auth/test/user`
  2. Click en **"Try it out"**
  3. Click en **"Execute"**
  4. Deberías ver respuesta `200 OK` con:
     ```json
     {
       "message": "Endpoint para usuarios normales",
       "username": "carlos.martinez",
       "idEmpleado": 1,
       "isAdmin": true
     }
     ```

---

#### **3. Endpoint Solo ADMIN**
- **Endpoint**: `GET /api/auth/test/admin`
- **Descripción**: Solo accesible para ADMIN
- **Cómo probar**:
  1. Expande `GET /api/auth/test/admin`
  2. Click en **"Try it out"**
  3. Click en **"Execute"**
  4. Deberías ver respuesta `200 OK` con:
     ```json
     {
       "message": "Endpoint solo para administradores",
       "username": "carlos.martinez",
       "idEmpleado": 1,
       "idCargo": 1
     }
     ```

---

#### **4. Información del Usuario Actual**
- **Endpoint**: `GET /api/auth/test/me`
- **Descripción**: Devuelve información del usuario autenticado
- **Cómo probar**:
  1. Expande `GET /api/auth/test/me`
  2. Click en **"Try it out"**
  3. Click en **"Execute"**
  4. Deberías ver respuesta `200 OK` con todos los datos del JWT:
     ```json
     {
       "username": "carlos.martinez",
       "email": "cmartinez@datumtravels.com",
       "idEmpleado": 1,
       "idCargo": 1,
       "roles": ["ADMIN", "USER", "default-roles-datum-travels", ...],
       "isAdmin": true,
       "claims": { ... }
     }
     ```

---

#### **5. Validar Acceso a Recurso**
- **Endpoint**: `GET /api/auth/test/check-access/{idEmpleado}`
- **Descripción**: Verifica si el usuario puede acceder a recursos de un empleado específico
- **Cómo probar**:
  1. Expande `GET /api/auth/test/check-access/{idEmpleado}`
  2. Click en **"Try it out"**
  3. En el campo `idEmpleado` ingresa: **1** (tu propio ID)
  4. Click en **"Execute"**
  5. Deberías ver respuesta `200 OK` con:
     ```json
     {
       "idEmpleado": 1,
       "puedeAcceder": true,
       "mensaje": "Acceso permitido",
       "esAdmin": true
     }
     ```

**Probar con ID diferente:**
- Ingresa `idEmpleado`: **2** (otro empleado)
- Como eres ADMIN, también deberías tener acceso (`puedeAcceder: true`)

---

## 🧪 **Paso 5: Probar con Usuario Normal (NO ADMIN)**

### **Obtener token de usuario normal:**

Ejecuta este comando en PowerShell para obtener token de Ana (USER):

```powershell
$response = Invoke-RestMethod -Method Post -Uri "http://localhost:8180/realms/datum-travels/protocol/openid-connect/token" -ContentType "application/x-www-form-urlencoded" -Body @{grant_type="password"; client_id="datum-travels-backend"; username="ana.rodriguez"; password="user123"}; $token = $response.access_token; Write-Host "TOKEN USER OBTENIDO:" -ForegroundColor Green; Write-Host $token; $token | clip
```

### **Repetir el Paso 3:**
1. Click en **"Authorize"** de nuevo
2. Borra el token anterior
3. Pega el nuevo token de Ana
4. Click en **"Authorize"** y luego **"Close"**

### **Probar endpoint de ADMIN:**
1. Intenta acceder a `GET /api/auth/test/admin`
2. Deberías recibir `403 Forbidden` (Ana no es ADMIN)

### **Probar endpoint de USER:**
1. Accede a `GET /api/auth/test/user`
2. Deberías recibir `200 OK` (Ana es USER)

---

## ❌ **Errores Comunes y Soluciones**

### **Error 401 Unauthorized**
- **Causa**: No hay token o el token expiró (5 minutos de validez)
- **Solución**: Obtener un nuevo token y volver a autorizar

### **Error 403 Forbidden**
- **Causa**: Tu usuario no tiene el rol necesario
- **Solución**: Usa un token con el rol correcto (ADMIN para `/admin`, USER para `/user`)

### **Error 404 Not Found**
- **Causa**: El endpoint no existe o el backend no está corriendo
- **Solución**: Verifica que el backend esté corriendo en http://localhost:8081

---

## 📋 **Resumen de Usuarios de Prueba**

| Usuario | Password | Rol | ID Empleado | ID Cargo |
|---------|----------|-----|-------------|----------|
| carlos.martinez | admin123 | ADMIN | 1 | 1 |
| ana.rodriguez | user123 | USER | 2 | 2 |
| luis.gonzalez | user123 | USER | 3 | 3 |

---

## 🎉 **¡Listo!**

Ahora puedes probar todos los endpoints protegidos en Swagger UI y ver cómo funciona la autenticación con Keycloak.

**Recuerda:**
- Los tokens expiran en **5 minutos**
- Siempre puedes obtener un nuevo token con los comandos de PowerShell
- ADMIN tiene acceso a TODO
- USER solo tiene acceso a endpoints USER y sus propios recursos

---

**Próximos pasos:**
1. ✅ Probar endpoints en Swagger (lo que estamos haciendo ahora)
2. 🔜 Proteger endpoints de negocio (`EventoController`, `GastoController`, etc.)
3. 🔜 Implementar login en el Frontend React
