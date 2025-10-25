# 🔐 Importación Automática del Realm de Keycloak

## ✅ Configuración Automática

El archivo `realm-export.json` contiene **toda la configuración** del Realm `datum-travels`:

### Lo que SE importa automáticamente:

- ✅ **Realm** `datum-travels` con todas las configuraciones
- ✅ **Client** `datum-travels-backend` con el client secret correcto
- ✅ **Roles:**
  - `Empleado`
  - `contador`
  - `gerente`
  - `admin`
- ✅ **Usuario** `carlos.test` (sin contraseña por seguridad)
- ✅ **Configuraciones de tokens, sesiones, etc.**

---

## 🚀 Cómo Funciona

Cuando ejecutas:

```powershell
docker-compose -f docker-compose-dev.yml up -d
```

**Keycloak automáticamente:**
1. Lee el archivo `realm-export.json`
2. Importa el Realm completo
3. Crea todos los clients, roles y usuarios
4. ⚠️ **PERO:** Las contraseñas NO se importan (por seguridad de Keycloak)

---

## 🔑 Configuración ÚNICA necesaria (1 minuto)

### Opción 1: Establecer contraseña para el usuario de prueba

Después de levantar Docker:

1. Abre: **http://localhost:8180/admin**
2. Login: `admin` / `admin123`
3. Cambiar a Realm: **datum-travels**
4. Ir a: **Users** → Buscar `carlos.test`
5. Pestaña **Credentials** → **Set password**
   - Password: `test123`
   - Password confirmation: `test123`
   - **Temporary:** OFF ⚠️
   - Click **Save**

### Opción 2: Script PowerShell (Automatizado)

Ejecuta este script después de levantar Docker:

```powershell
# Esperar a que Keycloak esté listo
Start-Sleep -Seconds 30

Write-Host "Configurando contraseña de usuario carlos.test..." -ForegroundColor Cyan

# Obtener token de admin
$adminToken = (Invoke-RestMethod -Uri "http://localhost:8180/realms/master/protocol/openid-connect/token" `
    -Method POST `
    -Body "grant_type=password&client_id=admin-cli&username=admin&password=admin123" `
    -ContentType "application/x-www-form-urlencoded").access_token

# Obtener ID del usuario carlos.test
$userId = (Invoke-RestMethod -Uri "http://localhost:8180/admin/realms/datum-travels/users?username=carlos.test" `
    -Headers @{Authorization="Bearer $adminToken"}).id

# Establecer contraseña
Invoke-RestMethod -Uri "http://localhost:8180/admin/realms/datum-travels/users/$userId/reset-password" `
    -Method PUT `
    -Headers @{Authorization="Bearer $adminToken"; "Content-Type"="application/json"} `
    -Body '{"type":"password","value":"test123","temporary":false}'

Write-Host "✅ Contraseña configurada correctamente" -ForegroundColor Green
```

---

## 🎯 Verificación

Después de configurar la contraseña, prueba el login:

```powershell
$body = @{usuarioApp="carlos.test"; contrasena="test123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 300,
  "usuario": {
    "idUsuario": 1,
    "usuarioApp": "carlos.test",
    "nombreCompleto": "Carlos Test"
  }
}
```

---

## 📊 ¿Qué se guardó en el realm-export.json?

El archivo contiene **1,924 líneas** con:

### Configuraciones del Realm:
- Access token lifespan: 300 segundos (5 minutos)
- SSO session timeout: 1800 segundos (30 minutos)
- Refresh token settings
- Signature algorithm: RS256

### Clients:
```json
{
  "clientId": "datum-travels-backend",
  "secret": "tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT",
  "directAccessGrantsEnabled": true,
  "publicClient": false,
  "protocol": "openid-connect"
}
```

### Roles:
- `Empleado` - Rol por defecto para empleados
- `contador` - Personal de contabilidad
- `gerente` - Gerentes
- `admin` - Administradores

### Usuarios:
```json
{
  "username": "carlos.test",
  "email": "carlos@datum.com",
  "firstName": "Carlos",
  "lastName": "Test",
  "enabled": true,
  "emailVerified": true,
  "realmRoles": ["Empleado"]
}
```

⚠️ **Nota:** La contraseña NO está incluida por razones de seguridad.

---

## 🔄 Re-exportar el Realm (si haces cambios)

Si modificas la configuración de Keycloak y quieres exportarla:

```powershell
# 1. Exportar desde el contenedor
docker exec datum-keycloak-dev /opt/keycloak/bin/kc.sh export `
  --dir /tmp/export `
  --realm datum-travels `
  --users realm_file

# 2. Copiar al proyecto
docker cp datum-keycloak-dev:/tmp/export/datum-travels-realm.json `
  BackEnd/keycloak/realm-export.json

# 3. Guardar en Git
git add BackEnd/keycloak/realm-export.json
git commit -m "chore: Actualizar exportación del realm de Keycloak"
```

---

## 💡 Ventajas de este Enfoque

### Antes (Manual):
1. ❌ Crear realm manualmente
2. ❌ Configurar client y copiar secret
3. ❌ Crear roles uno por uno
4. ❌ Crear usuario y asignar roles
5. ❌ ~10 minutos de configuración

### Después (Automático):
1. ✅ `docker-compose up -d`
2. ✅ Establecer contraseña del usuario (1 minuto)
3. ✅ ¡Listo!

**Tiempo ahorrado: ~9 minutos por desarrollador** 🎉

---

## 🐛 Troubleshooting

### El realm no se importó

**Solución:**
```powershell
# Ver logs de Keycloak
docker logs datum-keycloak-dev | Select-String -Pattern "import"

# Si dice "realm already exists", elimina el volumen y vuelve a levantar
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d
```

### Error "Invalid client credentials"

El client secret en `application.properties` debe coincidir con el del realm exportado.

**Verificar:**
1. En `realm-export.json` buscar `"clientId": "datum-travels-backend"`
2. Verificar que `"secret"` sea `tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT`
3. En `application.properties` líneas 105 y 160, debe tener el mismo valor

---

## 📚 Referencias

- **Keycloak Export/Import:** https://www.keycloak.org/server/importExport
- **Documentación del proyecto:** `SETUP_COMPLETO.md`
- **Troubleshooting:** `RESUMEN_FINAL_INTEGRACION.md`
