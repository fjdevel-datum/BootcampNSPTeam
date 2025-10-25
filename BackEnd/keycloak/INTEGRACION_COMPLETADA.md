# 🎉 Integración Keycloak Completada

## ✅ Cambios Realizados

### 1. application.properties ✅
**Archivo:** `BackEnd/quarkus-api/src/main/resources/application.properties`

**Cambios:**
- ✅ `quarkus.oidc.enabled=true` (habilitado)
- ✅ Agregada configuración completa de OIDC:
  ```properties
  quarkus.oidc.auth-server-url=http://localhost:8180/realms/datum-travels
  quarkus.oidc.client-id=datum-travels-backend
  quarkus.oidc.credentials.secret=tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT
  quarkus.oidc.application-type=service
  quarkus.oidc.token.issuer=http://localhost:8180/realms/datum-travels
  quarkus.oidc.roles.source=accesstoken
  quarkus.oidc.roles.role-claim-path=realm_access/roles
  ```

---

### 2. KeycloakAuthenticationService ✅
**Archivo:** `infrastructure/adapter/keycloak/KeycloakAuthenticationService.java`

**Responsabilidades:**
- Conectar con Keycloak Token Endpoint
- Enviar credenciales usando OAuth2 Password Grant
- Obtener JWT firmado por Keycloak
- Manejar errores de autenticación

**Método principal:**
```java
public String authenticate(String username, String password)
```

---

### 3. LoginUseCase (Modificado) ✅
**Archivo:** `application/usecase/auth/LoginUseCase.java`

**Cambios:**
- ❌ **Eliminado:** `JwtService` (ya no genera JWT local)
- ❌ **Eliminado:** `PasswordHasher` (Keycloak valida contraseñas)
- ✅ **Agregado:** `KeycloakAuthenticationService`
- ✅ **Flujo nuevo:**
  1. Buscar usuario en BD local (para datos del empleado)
  2. Autenticar con Keycloak
  3. Obtener JWT firmado por Keycloak
  4. Retornar respuesta con token de Keycloak

---

### 4. EventoController (Protegido) ✅
**Archivo:** `infrastructure/adapter/rest/EventoController.java`

**Cambios:**
- ✅ Importado `jakarta.annotation.security.RolesAllowed`
- ✅ Agregado `@RolesAllowed` en endpoints:
  ```java
  @GET
  @RolesAllowed({"empleado", "gerente", "admin"})
  public Response listarEventos(...)
  
  @POST
  @RolesAllowed({"empleado", "admin"})
  public Response crearEvento(...)
  ```

---

### 5. CurrentUserService (Nuevo) ✅
**Archivo:** `infrastructure/adapter/security/CurrentUserService.java`

**Helper para obtener información del usuario actual:**
```java
@Inject
CurrentUserService currentUser;

String username = currentUser.getUsername();
String email = currentUser.getEmail();
Set<String> roles = currentUser.getRoles();
boolean isAdmin = currentUser.isAdmin();
```

**Métodos disponibles:**
- `getUsername()` - carlos.test
- `getEmail()` - carlos@datum.com
- `getFullName()` - Carlos Test
- `getRoles()` - [empleado, ...]
- `hasRole(String role)` - Verifica si tiene un rol
- `isAdmin()` - Verifica si es administrador
- `isAuthenticated()` - Verifica si está autenticado

---

## 🚀 Cómo Probar

### Paso 1: Iniciar Quarkus

**Opción A: Desde la terminal (manual)**
```powershell
cd E:\Pro_da\BootcampNSPTeam\BackEnd\quarkus-api
.\mvnw.cmd quarkus:dev
```

**Opción B: Si hay problemas, detener procesos y reintentar**
```powershell
# Verificar procesos Java
Get-Process java

# Matar proceso si es necesario (reemplaza PID)
Stop-Process -Id PID -Force
```

---

### Paso 2: Probar Login (con Keycloak)

```powershell
# Login con usuario carlos.test
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "usuarioApp": "carlos.test",
    "contrasena": "test123"
  }'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6IC...",
  "type": "Bearer",
  "expiresIn": 300,
  "usuario": {
    "idUsuario": 1,
    "idEmpleado": 1,
    "usuarioApp": "carlos.test",
    "nombreCompleto": "Carlos Test",
    "correo": "carlos@datum.com"
  }
}
```

✅ **El token ahora viene de Keycloak** (firmado con RS256, no HS256)

---

### Paso 3: Probar Endpoint Protegido

```powershell
# Copiar el token de la respuesta anterior
$token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6IC..."

# Llamar endpoint protegido
curl -X GET "http://localhost:8080/api/eventos?idEmpleado=1" `
  -H "Authorization: Bearer $token"
```

**Si el token es válido y el usuario tiene el rol correcto:**
```json
[
  {
    "idEvento": 1,
    "nombreEvento": "Viaje a Guatemala",
    ...
  }
]
```

**Si NO tiene el rol requerido (ej: endpoint solo para admin):**
```json
{
  "error": "Forbidden",
  "message": "Access denied"
}
```

---

### Paso 4: Verificar Token en jwt.io

1. Copia el token JWT de la respuesta de login
2. Ve a **https://jwt.io**
3. Pega el token en el campo "Encoded"

**Deberías ver en el payload:**
```json
{
  "exp": 1761348381,
  "iat": 1761348081,
  "jti": "6d41edac-270f-40e3-8e76-68ab7e182ed9",
  "iss": "http://localhost:8180/realms/datum-travels",  ← Keycloak
  "aud": "account",
  "sub": "12a36818-3c2e-4de1-813c-ff5c1b11a394",
  "typ": "Bearer",
  "azp": "datum-travels-backend",
  "realm_access": {
    "roles": [
      "empleado",  ← Roles de Keycloak
      "default-roles-datum-travels",
      "offline_access",
      "uma_authorization"
    ]
  },
  "preferred_username": "carlos.test",
  "email": "carlos@datum.com",
  "name": "Carlos Test",
  "email_verified": true
}
```

✅ **Algoritmo:** RS256 (firma asimétrica de Keycloak)
✅ **Issuer:** Keycloak realm
✅ **Roles:** Incluidos en realm_access.roles

---

## 📊 Comparación: Antes vs Después

### ANTES (JWT Simple)
```
Usuario → LoginUseCase → PasswordHasher.verify() → JwtService.generate()
                             ↓                           ↓
                      BD Oracle (password)      JWT local (HS256)
```

### DESPUÉS (Keycloak)
```
Usuario → LoginUseCase → KeycloakAuthService → Keycloak
              ↓                                    ↓
      BD Oracle (datos empleado)         JWT firmado (RS256)
```

---

## 🔐 Ventajas de la Integración

1. ✅ **Seguridad mejorada**: Contraseñas gestionadas por Keycloak
2. ✅ **Tokens firmados con RS256**: Más seguros que HS256
3. ✅ **Gestión centralizada de usuarios**: Un solo lugar para usuarios
4. ✅ **Roles en el token**: No necesitas consultar BD para verificar roles
5. ✅ **Sesiones gestionadas**: Keycloak maneja refresh tokens
6. ✅ **Preparado para SSO**: Fácil agregar login social (Google, Facebook)
7. ✅ **Estándar OAuth2/OIDC**: Compatible con cualquier cliente OIDC

---

## 🧪 Próximos Pasos (Opcional)

### 1. Sincronizar Usuarios
Actualmente necesitas crear usuarios en:
- ✅ Keycloak (para autenticación)
- ✅ BD Oracle (tabla Usuario, para datos del empleado)

**Opciones:**
- Crear script de migración
- Implementar creación automática en LoginUseCase
- Usar Federation de Keycloak con LDAP/AD

### 2. Proteger Más Endpoints
Agregar `@RolesAllowed` en otros Controllers:
- GastoController
- TarjetaController
- EmpleadoController

### 3. Logout con Keycloak
Implementar logout que invalide el token en Keycloak:
```java
public void logout(String token) {
    // Llamar a logout endpoint de Keycloak
}
```

### 4. Refresh Token
Implementar endpoint para renovar tokens:
```java
POST /api/auth/refresh
Body: { "refreshToken": "..." }
```

### 5. Frontend
Integrar React con Keycloak usando:
- `@react-keycloak/web`
- `keycloak-js`

---

## 🐛 Troubleshooting

### Error: "Unable to find OidcProvider"
**Causa:** Keycloak no está corriendo
**Solución:**
```powershell
docker ps | Select-String keycloak
# Si no está corriendo:
docker-compose -f docker-compose-dev.yml up -d datum-keycloak
```

### Error: "Invalid token"
**Causa:** Token expirado o inválido
**Solución:**
- Hacer login nuevamente para obtener nuevo token
- Verificar que el token no esté corrupto

### Error: "Forbidden" con token válido
**Causa:** Usuario no tiene el rol requerido
**Solución:**
- Ir a Keycloak → Users → carlos.test → Role mapping
- Asignar el rol necesario (empleado, gerente, admin)

### Error: "Connection refused" al conectar con Keycloak
**Causa:** Keycloak no está accesible
**Solución:**
```powershell
# Verificar health de Keycloak
curl http://localhost:8180/health/ready

# Ver logs
docker logs datum-keycloak-dev
```

---

## 📚 Archivos de Documentación

- **INTEGRACION_KEYCLOAK_QUARKUS.md** - Guía detallada de integración
- **GUIA_ROLES.md** - Crear y asignar roles en Keycloak
- **GUIA_CONFIGURACION.md** - Setup inicial de Keycloak
- **README.md** - Documentación general de Keycloak

---

## ✅ Checklist de Verificación

- [x] ✅ application.properties actualizado con OIDC
- [x] ✅ KeycloakAuthenticationService creado
- [x] ✅ LoginUseCase modificado para usar Keycloak
- [x] ✅ EventoController protegido con @RolesAllowed
- [x] ✅ CurrentUserService creado para helpers
- [ ] ⏳ Quarkus ejecutándose en modo dev
- [ ] ⏳ Login probado exitosamente
- [ ] ⏳ Token JWT de Keycloak verificado
- [ ] ⏳ Endpoint protegido probado

---

## 🎉 ¡Integración Completada!

Tu aplicación ahora está completamente integrada con Keycloak:

1. ✅ Autenticación delegada a Keycloak
2. ✅ Tokens JWT firmados por Keycloak (RS256)
3. ✅ Roles incluidos en tokens
4. ✅ Endpoints protegidos por roles
5. ✅ Helper para obtener usuario actual

**¿Todo listo para producción?** Casi! Solo falta:
- Configurar variables de entorno para secrets
- Configurar HTTPS
- Ajustar timeouts de tokens
- Implementar refresh token
- Sincronizar usuarios entre sistemas
