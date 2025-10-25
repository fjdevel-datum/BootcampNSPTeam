# 🔐 Keycloak - Datum Travels

## 📖 ¿Qué es Keycloak?

**Keycloak** es un servidor de autenticación y autorización open-source que provee:
- ✅ Autenticación de usuarios (login/logout)
- ✅ Generación y validación de tokens JWT
- ✅ Single Sign-On (SSO)
- ✅ Social Login (Google, Facebook, GitHub, etc.)
- ✅ Autenticación de dos factores (2FA)
- ✅ Gestión de usuarios y permisos

---

## 🚀 Inicio Rápido

### 1. Levantar Keycloak con Docker Compose

Desde la raíz del proyecto:

```powershell
docker-compose -f docker-compose-dev.yml up -d datum-keycloak
```

O levantar todo el stack (Oracle + Keycloak):

```powershell
docker-compose -f docker-compose-dev.yml up -d
```

### 2. Verificar que Keycloak está corriendo

```powershell
# Ver logs
docker logs -f datum-keycloak-dev

# Verificar salud
docker ps | Select-String keycloak
```

### 3. Acceder a la consola de administración

```
URL:      http://localhost:8180
Usuario:  admin
Password: admin123
```

---

## ⚙️ Configuración Inicial del Realm

### Paso 1: Crear el Realm "datum-travels"

1. Accede a http://localhost:8180
2. Login con `admin / admin123`
3. En el dropdown superior izquierdo (donde dice "Keycloak" o "master"), click en **Create Realm**
4. En **Realm name**, escribe: `datum-travels`
5. Click en **Create**

✅ **Listo!** Ahora tienes el realm `datum-travels` creado.

---

### Paso 2: Crear el Client "datum-travels-backend"

1. En el menú lateral, ve a **Clients**
2. Click en **Create client**
3. **General Settings:**
   - Client type: `OpenID Connect`
   - Client ID: `datum-travels-backend`
   - Click **Next**

4. **Capability config:**
   - ✅ **Client authentication:** ON (importante)
   - ❌ **Authorization:** OFF
   - **Authentication flow:**
     - ❌ Standard flow: OFF
     - ✅ **Direct access grants:** ON ← **MUY IMPORTANTE**
     - ❌ Implicit flow: OFF
     - ❌ Service accounts roles: OFF
   - Click **Next**

5. **Login settings:**
   - Root URL: `http://localhost:8080`
   - Home URL: `http://localhost:8080`
   - Valid redirect URIs: `http://localhost:8080/*`
   - Valid post logout redirect URIs: `http://localhost:8080/*`
   - Web origins: `http://localhost:8080`
   - Click **Save**

---

### Paso 3: Obtener el Client Secret

1. En el menú de tu client `datum-travels-backend`, ve a la pestaña **Credentials**
2. Verás el **Client Secret** generado automáticamente
3. **Copia ese valor** (ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

4. **Actualiza** el archivo `application.properties`:

```properties
# En BackEnd/quarkus-api/src/main/resources/application.properties
keycloak.client-secret=TU_CLIENT_SECRET_AQUI
```

---

### Paso 4: Crear un Usuario de Prueba

1. En el menú lateral, ve a **Users**
2. Click en **Add user**
3. Configurar:
   - Username: `carlos.test`
   - Email: `carlos@datum.com`
   - First name: `Carlos`
   - Last name: `Test`
   - ✅ Email verified: ON
   - Click **Create**

4. Ir a la pestaña **Credentials**
5. Click en **Set password**
   - Password: `test123`
   - Password confirmation: `test123`
   - ❌ Temporary: OFF (importante)
   - Click **Save**

6. Confirmar en el diálogo que aparece

✅ **Usuario creado!** Ahora puedes hacer login con `carlos.test / test123`

---

## 🧪 Probar la Autenticación

### Opción 1: Con cURL

```powershell
curl -X POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "grant_type=password" `
  -d "client_id=datum-travels-backend" `
  -d "client_secret=TU_CLIENT_SECRET" `
  -d "username=carlos.test" `
  -d "password=test123"
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_expires_in": 1800
}
```

### Opción 2: Con PowerShell

```powershell
$body = @{
    grant_type = "password"
    client_id = "datum-travels-backend"
    client_secret = "TU_CLIENT_SECRET"
    username = "carlos.test"
    password = "test123"
}

$response = Invoke-RestMethod -Uri "http://localhost:8180/realms/datum-travels/protocol/openid-connect/token" `
    -Method Post `
    -Body $body `
    -ContentType "application/x-www-form-urlencoded"

$response.access_token
```

---

## 🔗 Integración con Quarkus

### 1. Verificar configuración en `application.properties`

```properties
# KEYCLOAK CONFIGURATION
keycloak.server-url=http://localhost:8180
keycloak.realm=datum-travels
keycloak.client-id=datum-travels-backend
keycloak.client-secret=TU_CLIENT_SECRET_REAL
```

### 2. Probar login desde la API de Quarkus

```powershell
# Login a través de tu API (que internamente llama a Keycloak)
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "usuarioApp": "carlos.test",
    "contrasena": "test123"
  }'
```

---

## 🛠️ Comandos Útiles

### Ver logs de Keycloak
```powershell
docker logs -f datum-keycloak-dev
```

### Reiniciar Keycloak
```powershell
docker restart datum-keycloak-dev
```

### Detener Keycloak
```powershell
docker-compose -f docker-compose-dev.yml stop datum-keycloak
```

### Eliminar Keycloak (mantiene datos)
```powershell
docker-compose -f docker-compose-dev.yml down
```

### Eliminar TODO (incluye datos)
```powershell
docker-compose -f docker-compose-dev.yml down -v
```

### Verificar salud de Keycloak
```powershell
curl http://localhost:8180/health
```

---

## 📁 Estructura de Archivos

```
BackEnd/
├── keycloak/
│   ├── README.md                    ← Este archivo
│   ├── docker-compose.yml           ← Configuración standalone (opcional)
│   └── realm-config/                ← Configuración del realm (para importar)
│       └── datum-travels-realm.json ← Exportación del realm (futuro)
└── quarkus-api/
    └── src/main/resources/
        └── application.properties   ← Configuración de Keycloak
```

---

## 🔐 Endpoints de Keycloak

| Endpoint | URL |
|----------|-----|
| **Admin Console** | http://localhost:8180 |
| **Realm Info** | http://localhost:8180/realms/datum-travels |
| **Token Endpoint** | http://localhost:8180/realms/datum-travels/protocol/openid-connect/token |
| **UserInfo** | http://localhost:8180/realms/datum-travels/protocol/openid-connect/userinfo |
| **Logout** | http://localhost:8180/realms/datum-travels/protocol/openid-connect/logout |
| **Health** | http://localhost:8180/health |

---

## 🎯 Conceptos Clave

### **Realm**
Un "espacio aislado" para tu aplicación. Como un inquilino en un edificio.
- Realm: `datum-travels` → Tu aplicación
- Realm: `master` → Administración de Keycloak (NO usar para tu app)

### **Client**
Una aplicación que usa Keycloak para autenticación.
- Client: `datum-travels-backend` → Tu API Quarkus
- Client: `datum-travels-frontend` → Tu app React (futuro)

### **Client Secret**
Una contraseña secreta que solo tu backend conoce. Es como una API key privada.

### **Access Token (JWT)**
Un "pase VIP digital" que prueba quién eres. Expira en 5 minutos (por defecto).

### **Refresh Token**
Un token para renovar el Access Token sin volver a pedir usuario/contraseña. Expira en 30 minutos (por defecto).

---

## ⚠️ Notas Importantes

### ⚠️ **Solo para Desarrollo**

La configuración actual es **SOLO PARA DESARROLLO**:
- Base de datos H2 en memoria
- HTTP sin HTTPS
- Configuraciones de seguridad relajadas

### 🔒 **Para Producción**

Para producción necesitas:
- Base de datos persistente (PostgreSQL, MySQL)
- HTTPS con certificados SSL
- Configuración de seguridad estricta
- Variables de entorno para secrets

---

## 🚀 Próximos Pasos

1. ✅ Levantar Keycloak
2. ✅ Crear Realm `datum-travels`
3. ✅ Crear Client `datum-travels-backend`
4. ✅ Copiar Client Secret
5. ✅ Actualizar `application.properties`
6. ✅ Crear usuario de prueba
7. ✅ Probar autenticación
8. ⏳ (Futuro) Crear roles y permisos
9. ⏳ (Futuro) Integrar con React frontend
10. ⏳ (Futuro) Importar usuarios desde BD

---

## 📚 Referencias

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Getting Started Guide](https://www.keycloak.org/guides)
- [Securing Applications](https://www.keycloak.org/docs/latest/securing_apps/)
- [Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/)

---

## 💡 Troubleshooting

### Keycloak no arranca
```powershell
# Ver logs
docker logs datum-keycloak-dev

# Verificar que Oracle arrancó primero
docker ps | Select-String oracle
```

### No puedo acceder a http://localhost:8180
```powershell
# Verificar que el puerto está libre
netstat -ano | Select-String 8180

# Verificar que el contenedor está corriendo
docker ps | Select-String keycloak
```

### Error "Invalid client credentials"
- Verifica que el `client-secret` en `application.properties` sea correcto
- Verifica que "Client authentication" esté en ON
- Verifica que "Direct access grants" esté en ON

---

**¡Listo para empezar!** 🎉
