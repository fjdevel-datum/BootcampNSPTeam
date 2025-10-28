# 🧪 Guía para Probar Keycloak con Bruno

## ❌ Error Común: "Missing form parameter: grant_type"

Este error ocurre cuando los parámetros no se envían correctamente en el formato `application/x-www-form-urlencoded`.

---

## ✅ Configuración Correcta en Bruno

### 📝 Paso 1: Crear Nueva Request

1. **Abrir Bruno**
2. **Nueva Request** → Tipo: `POST`
3. **URL:** 
   ```
   http://localhost:8180/realms/datum-travels/protocol/openid-connect/token
   ```

---

### 📝 Paso 2: Configurar Headers

**Headers Tab:**

```
Content-Type: application/x-www-form-urlencoded
```

**⚠️ IMPORTANTE:** Este header es OBLIGATORIO para este tipo de peticiones.

---

### 📝 Paso 3: Configurar Body

1. **Click en la pestaña "Body"**
2. **Seleccionar:** `Form URL Encoded` (que ya tienes ✅)
3. **Agregar los siguientes campos:**

| Key         | Value                      | ✅ Enabled |
|-------------|----------------------------|-----------|
| grant_type  | password                   | ✅        |
| client_id   | datum-travels-frontend     | ✅        |
| username    | admin.test                 | ✅        |
| password    | admin123                   | ✅        |

**⚠️ CRÍTICO:** 
- Los nombres deben ser **exactamente** como aparecen arriba
- `grant_type` debe ser `password` (sin mayúsculas)
- No debe haber espacios extra

---

### 📝 Paso 4: NO usar Query Params

**❌ NO agregar nada en la pestaña "Query"**

Los parámetros deben estar en **Body** solamente.

---

## 🎯 Screenshot de Configuración Correcta en Bruno

```
┌─────────────────────────────────────────────────────────┐
│ POST http://localhost:8180/realms/datum-travels/proto... │
├─────────────────────────────────────────────────────────┤
│ Headers │ Body │ Auth │ Query │ Script │                │
├─────────────────────────────────────────────────────────┤
│ Body Type: [Form URL Encoded ▼]                         │
│                                                          │
│ ┌─────────────┬────────────────────────┬───┬───┐        │
│ │ Key         │ Value                  │ ✓ │ × │        │
│ ├─────────────┼────────────────────────┼───┼───┤        │
│ │ grant_type  │ password               │ ✓ │   │        │
│ │ client_id   │ datum-travels-frontend │ ✓ │   │        │
│ │ username    │ admin.test             │ ✓ │   │        │
│ │ password    │ admin123               │ ✓ │   │        │
│ └─────────────┴────────────────────────┴───┴───┘        │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Respuesta Esperada (Exitosa)

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJxxx...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyyy...",
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "abc123...",
  "scope": "profile email"
}
```

**Status Code:** `200 OK`

---

## ❌ Errores Comunes y Soluciones

### Error 1: "Missing form parameter: grant_type"

**Causa:** Los parámetros están en Query en lugar de Body

**Solución:** 
1. Ir a pestaña "Body"
2. Seleccionar "Form URL Encoded"
3. Mover todos los parámetros a Body
4. Limpiar Query Params

---

### Error 2: "invalid_grant" o "Invalid user credentials"

**Causa:** Usuario o contraseña incorrectos

**Solución:**
1. Verificar que el usuario existe en Keycloak:
   - Admin Console → Users
   - Buscar `admin.test`
2. Verificar que la contraseña sea `admin123`
3. Verificar que "Temporary password" esté en OFF

---

### Error 3: "Client not found"

**Causa:** El client_id no existe o está mal escrito

**Solución:**
1. Verificar en Keycloak:
   - Clients → Buscar `datum-travels-frontend`
2. Verificar que el nombre sea exacto (case-sensitive)

---

### Error 4: "unauthorized_client"

**Causa:** Direct Access Grants no está habilitado

**Solución:**
1. Keycloak → Clients → datum-travels-frontend
2. Settings tab
3. **Direct Access Grants Enabled:** ON
4. Click "Save"

---

## 🧪 Verificación Paso a Paso

### ✅ Checklist Pre-Request

Antes de enviar la petición, verificar:

- [ ] Keycloak corriendo (http://localhost:8180 accesible)
- [ ] Realm `datum-travels` existe
- [ ] Client `datum-travels-frontend` existe
- [ ] Client tiene "Direct Access Grants Enabled" = ON
- [ ] Usuario `admin.test` existe
- [ ] Usuario tiene contraseña `admin123` (no temporal)
- [ ] Usuario tiene roles asignados

### ✅ Checklist en Bruno

- [ ] Method: POST
- [ ] URL correcta (sin /token duplicado)
- [ ] Headers tiene `Content-Type: application/x-www-form-urlencoded`
- [ ] Body Type: Form URL Encoded
- [ ] Parámetros en Body (NO en Query)
- [ ] Todos los checkboxes ✓ habilitados
- [ ] Sin espacios extra en los valores

---

## 🔧 Alternativa: Probar con cURL

Si Bruno sigue dando problemas, probar con cURL desde la terminal:

```bash
curl -X POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=datum-travels-frontend" \
  -d "username=admin.test" \
  -d "password=admin123"
```

**Si cURL funciona pero Bruno no:**
- El problema es la configuración de Bruno
- Revisar que Body esté en modo "Form URL Encoded"
- Asegurar que no haya parámetros duplicados

---

## 🎯 Debugging: Ver Request Raw

En Bruno, activar "Show Raw Request" para ver exactamente qué se está enviando:

```http
POST /realms/datum-travels/protocol/openid-connect/token HTTP/1.1
Host: localhost:8180
Content-Type: application/x-www-form-urlencoded
Content-Length: 94

grant_type=password&client_id=datum-travels-frontend&username=admin.test&password=admin123
```

**Debe verse así ☝️**

Si en lugar se ve así:
```http
POST /realms/datum-travels/protocol/openid-connect/token?grant_type=password&client_id=...
```

**Significa que los parámetros están en Query (❌ MAL)**

---

## 📝 Información del Token Recibido

Una vez que recibas el `access_token`, puedes decodificarlo en:

🔗 **https://jwt.io**

Pegar el `access_token` y verificar:

```json
{
  "exp": 1730000000,
  "iat": 1730000000,
  "auth_time": 1730000000,
  "jti": "abc123...",
  "iss": "http://localhost:8180/realms/datum-travels",
  "aud": "account",
  "sub": "user-id-here",
  "typ": "Bearer",
  "azp": "datum-travels-frontend",
  "session_state": "session-id",
  "realm_access": {
    "roles": [
      "admin",
      "user"
    ]
  },
  "scope": "profile email",
  "email_verified": true,
  "name": "Admin Test",
  "preferred_username": "admin.test",
  "given_name": "Admin",
  "family_name": "Test",
  "email": "admin@datum.com"
}
```

**Verificar que:**
- ✅ `realm_access.roles` contiene `["admin", "user"]`
- ✅ `preferred_username` es `admin.test`
- ✅ `iss` apunta a tu Keycloak

---

## 🚀 Siguiente Paso

Una vez que obtengas el token exitosamente:

1. Copiar el `access_token`
2. Ir a **CHECKLIST_VERIFICACION.md** línea 257
3. Continuar con las pruebas del frontend

---

**Última actualización:** Octubre 27, 2025
