# 🔗 Integración Completa de Keycloak con API Quarkus

## 📊 Estado Actual

### ✅ Lo que YA tienes funcionando:

| Componente | Estado | Descripción |
|------------|--------|-------------|
| **Keycloak** | ✅ Funcionando | Docker, realm, client, usuario de prueba |
| **Backend Quarkus** | ⚠️ Parcial | Tiene JWT simple, NO usa Keycloak aún |
| **LoginUseCase** | ✅ Implementado | Usa `JwtService` simple (no Keycloak) |
| **AuthController** | ✅ Implementado | REST endpoint `/api/auth/login` |
| **application.properties** | ⚠️ Parcial | Keycloak configurado pero **NO habilitado** |

### ❌ Lo que FALTA implementar:

1. **Habilitar OIDC en Quarkus** (`quarkus.oidc.enabled=true`)
2. **Crear KeycloakAuthenticationService** (implementación real del puerto)
3. **Modificar LoginUseCase** para usar Keycloak en lugar de JWT simple
4. **Proteger endpoints** con `@RolesAllowed`
5. **Validar tokens JWT de Keycloak** en lugar de generarlos localmente

---

## 🎯 Plan de Integración (5 Pasos)

```
PASO 1: Habilitar OIDC en application.properties
   ↓
PASO 2: Crear KeycloakAuthenticationService (implementa puerto)
   ↓
PASO 3: Modificar LoginUseCase (ya no genera JWT, obtiene de Keycloak)
   ↓
PASO 4: Proteger endpoints con @RolesAllowed
   ↓
PASO 5: Probar integración completa
```

---

## 📝 PASO 1: Habilitar OIDC en application.properties

### 1.1 Archivo: `BackEnd/quarkus-api/src/main/resources/application.properties`

**Cambiar:**
```properties
# ⚠️ CAMBIAR A TRUE cuando Keycloak esté configurado
quarkus.oidc.enabled=false
```

**Por:**
```properties
# ✅ OIDC HABILITADO - Keycloak integrado
quarkus.oidc.enabled=true
```

### 1.2 Agregar configuración completa de OIDC

**Agregar después de las configuraciones de Keycloak existentes:**

```properties
# ════════════════════════════════════════════════════════════
# OIDC CONFIGURATION (Quarkus ↔ Keycloak)
# ════════════════════════════════════════════════════════════

# URL del servidor de autorización (Keycloak)
quarkus.oidc.auth-server-url=http://localhost:8180/realms/datum-travels

# Client ID configurado en Keycloak
quarkus.oidc.client-id=datum-travels-backend

# Client Secret obtenido de Keycloak
quarkus.oidc.credentials.secret=tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT

# Tipo de aplicación (service = backend API sin UI)
quarkus.oidc.application-type=service

# Habilitar verificación de tokens JWT de Keycloak
quarkus.oidc.token.issuer=http://localhost:8180/realms/datum-travels
quarkus.oidc.token.audience=account

# Configuración de roles (mapeo de realm_access.roles)
quarkus.oidc.roles.source=accesstoken
quarkus.oidc.roles.role-claim-path=realm_access/roles

# Timeout de conexión con Keycloak
quarkus.oidc.connection-timeout=10s
```

**Explicación:**
- `auth-server-url`: Donde Quarkus buscará el OIDC discovery endpoint
- `application-type=service`: Backend API sin login redirect (Direct Access Grants)
- `roles.source=accesstoken`: Los roles vienen del token JWT
- `roles.role-claim-path`: Donde buscar los roles en el token (realm_access.roles)

---

## 🏗️ PASO 2: Crear KeycloakAuthenticationService

### 2.1 Entender la arquitectura actual

**Arquitectura actual (JWT Simple):**
```
AuthController → LoginUseCase → JwtService (genera token local)
                                     ↓
                              Usuario en BD Oracle
```

**Arquitectura nueva (con Keycloak):**
```
AuthController → LoginUseCase → KeycloakAuthService → Keycloak
                      ↓                                   ↓
                Usuario en BD                    Token JWT firmado
```

### 2.2 Crear el adapter de Keycloak

**Archivo:** `BackEnd/quarkus-api/src/main/java/datum/travels/infrastructure/adapter/keycloak/KeycloakAuthenticationService.java`

```java
package datum.travels.infrastructure.adapter.keycloak;

import datum.travels.domain.exception.AuthenticationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.Form;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.Map;

/**
 * Implementación del servicio de autenticación con Keycloak
 * 
 * Responsabilidades:
 * - Conectar con Keycloak Token Endpoint
 * - Enviar credenciales con OAuth2 Password Grant
 * - Obtener JWT de Keycloak
 * - Manejar errores de autenticación
 */
@ApplicationScoped
public class KeycloakAuthenticationService {

    private static final Logger LOG = Logger.getLogger(KeycloakAuthenticationService.class);

    @ConfigProperty(name = "keycloak.server-url")
    String keycloakServerUrl;

    @ConfigProperty(name = "keycloak.realm")
    String realm;

    @ConfigProperty(name = "keycloak.client-id")
    String clientId;

    @ConfigProperty(name = "keycloak.client-secret")
    String clientSecret;

    /**
     * Autentica un usuario con Keycloak usando OAuth2 Password Grant
     *
     * @param username Usuario
     * @param password Contraseña
     * @return Token JWT firmado por Keycloak
     * @throws AuthenticationException Si las credenciales son inválidas
     */
    public String authenticate(String username, String password) {
        LOG.infof("Autenticando usuario '%s' con Keycloak", username);

        String tokenEndpoint = String.format(
            "%s/realms/%s/protocol/openid-connect/token",
            keycloakServerUrl,
            realm
        );

        // Construir formulario OAuth2
        Form form = new Form()
            .param("grant_type", "password")
            .param("client_id", clientId)
            .param("client_secret", clientSecret)
            .param("username", username)
            .param("password", password);

        // Crear cliente HTTP
        Client client = ClientBuilder.newClient();
        
        try {
            // Hacer POST a Keycloak
            Response response = client.target(tokenEndpoint)
                .request(MediaType.APPLICATION_JSON)
                .post(Entity.form(form));

            // Verificar respuesta
            if (response.getStatus() == 200) {
                Map<String, Object> tokenResponse = response.readEntity(Map.class);
                String accessToken = (String) tokenResponse.get("access_token");
                
                LOG.infof("Autenticación exitosa para usuario '%s'", username);
                return accessToken;
                
            } else if (response.getStatus() == 401) {
                LOG.warnf("Credenciales inválidas para usuario '%s'", username);
                throw new AuthenticationException("Credenciales inválidas");
                
            } else {
                LOG.errorf("Error inesperado de Keycloak: Status %d", response.getStatus());
                throw new AuthenticationException("Error al autenticar con el servidor");
            }
            
        } catch (Exception e) {
            LOG.errorf(e, "Error al conectar con Keycloak para usuario '%s'", username);
            throw new AuthenticationException("Error de conexión con el servidor de autenticación", e);
            
        } finally {
            client.close();
        }
    }

    /**
     * Valida un token JWT con Keycloak (introspection endpoint)
     * 
     * @param token Token JWT a validar
     * @return true si el token es válido
     */
    public boolean validateToken(String token) {
        // TODO: Implementar validación con Keycloak introspection endpoint
        // Por ahora Quarkus valida automáticamente con OIDC
        return true;
    }
}
```

**¿Qué hace este código?**
1. **Inyecta configuración** de Keycloak desde `application.properties`
2. **Construye el endpoint** de token: `http://localhost:8180/realms/datum-travels/protocol/openid-connect/token`
3. **Envía credenciales** usando OAuth2 Password Grant (igual que tu prueba con curl)
4. **Obtiene el JWT** de Keycloak
5. **Maneja errores** (401 = credenciales inválidas, otros = error de servidor)

---

## 🔄 PASO 3: Modificar LoginUseCase para usar Keycloak

### 3.1 Estado actual del LoginUseCase

Tu `LoginUseCase` actual:
```java
@ApplicationScoped
public class LoginUseCase {
    @Inject UsuarioRepository usuarioRepository;
    @Inject JwtService jwtService;          // ← Genera JWT local
    @Inject PasswordHasher passwordHasher;  // ← Verifica contraseña local

    public LoginResponse execute(LoginRequest request) {
        // 1. Buscar usuario en BD
        // 2. Verificar contraseña con BCrypt
        // 3. Generar JWT local
        // 4. Retornar respuesta
    }
}
```

### 3.2 LoginUseCase modificado (con Keycloak)

**Cambios necesarios:**

```java
package datum.travels.application.usecase.auth;

import datum.travels.application.dto.auth.LoginRequest;
import datum.travels.application.dto.auth.LoginResponse;
import datum.travels.domain.exception.AuthenticationException;
import datum.travels.domain.model.Empleado;
import datum.travels.domain.model.Usuario;
import datum.travels.domain.repository.UsuarioRepository;
import datum.travels.infrastructure.adapter.keycloak.KeycloakAuthenticationService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

/**
 * Caso de Uso: Login de Usuario con Keycloak
 * 
 * Responsabilidades:
 * 1. Validar que el usuario existe en BD local
 * 2. Autenticar con Keycloak (delega la verificación de contraseña)
 * 3. Obtener JWT firmado por Keycloak
 * 4. Retornar información del usuario logueado
 */
@ApplicationScoped
public class LoginUseCase {

    private static final Logger LOG = Logger.getLogger(LoginUseCase.class);

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    KeycloakAuthenticationService keycloakAuthService; // ← NUEVO: Servicio de Keycloak

    /**
     * Ejecuta el login del usuario
     *
     * @param request Credenciales del usuario
     * @return LoginResponse con el token JWT de Keycloak y datos del usuario
     * @throws AuthenticationException si las credenciales son inválidas
     */
    @Transactional
    public LoginResponse execute(LoginRequest request) {
        LOG.infof("Iniciando login para usuario: %s", request.usuarioApp());
        
        // 1. Buscar usuario en BD local (para obtener datos del empleado)
        Usuario usuario = usuarioRepository
                .findByUsuarioApp(request.usuarioApp())
                .orElseThrow(() -> {
                    LOG.warnf("Usuario no encontrado en BD local: %s", request.usuarioApp());
                    return new AuthenticationException("Credenciales inválidas");
                });

        LOG.debugf("Usuario encontrado en BD: ID=%d", usuario.getIdUsuario());

        // 2. Autenticar con Keycloak (obtiene JWT firmado)
        String jwtToken;
        try {
            jwtToken = keycloakAuthService.authenticate(
                request.usuarioApp(),
                request.contrasena()
            );
            
            LOG.infof("Autenticación exitosa en Keycloak para usuario: %s", request.usuarioApp());
            
        } catch (AuthenticationException e) {
            LOG.warnf("Fallo de autenticación en Keycloak para usuario: %s", request.usuarioApp());
            throw e;
        }

        // 3. Obtener información del empleado relacionado
        Empleado empleado = usuario.getEmpleado();
        
        LOG.debugf("Empleado asociado: ID=%d, Nombre=%s", 
            empleado != null ? empleado.getIdEmpleado() : null,
            empleado != null ? empleado.getNombreCompleto() : "Sin empleado");

        // 4. Construir respuesta
        LoginResponse.UsuarioInfo usuarioInfo = new LoginResponse.UsuarioInfo(
                usuario.getIdUsuario(),
                empleado != null ? empleado.getIdEmpleado() : null,
                usuario.getUsuarioApp(),
                empleado != null ? empleado.getNombreCompleto() : "Sin nombre",
                empleado != null ? empleado.getCorreo() : null
        );

        LOG.infof("Login completado exitosamente para usuario: %s", request.usuarioApp());

        // Token de Keycloak expira en 300 segundos (5 minutos) por defecto
        return LoginResponse.of(
                jwtToken,      // ← Token JWT de Keycloak (no generado localmente)
                300L,          // Expiración configurada en Keycloak
                usuarioInfo
        );
    }
}
```

**Cambios principales:**
1. ❌ **Eliminado:** `JwtService` (ya no generamos JWT local)
2. ❌ **Eliminado:** `PasswordHasher` (Keycloak valida la contraseña)
3. ✅ **Agregado:** `KeycloakAuthenticationService` (obtiene JWT de Keycloak)
4. ✅ **Simplificado:** Ya no validamos contraseña, Keycloak lo hace

---

## 🔐 PASO 4: Proteger Endpoints con Roles

### 4.1 Ejemplo: Proteger EventoController

**Antes (sin protección):**
```java
@Path("/api/eventos")
@Produces(MediaType.APPLICATION_JSON)
public class EventoController {
    
    @POST
    public Response crearEvento(CrearEventoDTO dto) {
        // Cualquiera puede crear eventos
    }
}
```

**Después (con roles de Keycloak):**
```java
@Path("/api/eventos")
@Produces(MediaType.APPLICATION_JSON)
public class EventoController {
    
    @POST
    @RolesAllowed({"empleado", "admin"})  // ← Solo empleado o admin
    public Response crearEvento(CrearEventoDTO dto) {
        // Solo usuarios con rol empleado o admin pueden crear
    }
    
    @PUT
    @Path("/{id}/aprobar")
    @RolesAllowed({"gerente", "admin"})  // ← Solo gerente o admin
    public Response aprobarEvento(@PathParam("id") Long id) {
        // Solo gerente o admin pueden aprobar
    }
    
    @DELETE
    @Path("/{id}")
    @RolesAllowed("admin")  // ← Solo admin
    public Response eliminarEvento(@PathParam("id") Long id) {
        // Solo admin puede eliminar
    }
}
```

### 4.2 Obtener información del usuario actual en un Use Case

```java
@ApplicationScoped
public class CrearEventoUseCase {
    
    @Inject
    JsonWebToken jwt;  // ← Token JWT inyectado por Quarkus OIDC
    
    public EventoDTO ejecutar(CrearEventoDTO dto) {
        // Obtener datos del usuario logueado desde el token JWT
        String username = jwt.getName();                    // carlos.test
        String email = jwt.getClaim("email");               // carlos@datum.com
        Set<String> roles = jwt.getGroups();                // [empleado, ...]
        
        // Verificar si tiene rol específico
        if (roles.contains("admin")) {
            // Lógica especial para admin
        }
        
        LOG.infof("Usuario %s creando evento", username);
        
        // ... lógica de negocio
    }
}
```

---

## 🧪 PASO 5: Probar la Integración Completa

### 5.1 Reiniciar el backend Quarkus

```powershell
# Desde BackEnd/quarkus-api
cd E:\Pro_da\BootcampNSPTeam\BackEnd\quarkus-api

# Limpiar y compilar
.\mvnw clean package -DskipTests

# Ejecutar en modo dev
.\mvnw quarkus:dev
```

### 5.2 Probar login a través de la API

```powershell
# Probar con usuario carlos.test
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

### 5.3 Probar endpoint protegido

```powershell
# Copiar el token de la respuesta anterior
$token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6IC..."

# Llamar a un endpoint protegido
curl -X GET http://localhost:8080/api/eventos `
  -H "Authorization: Bearer $token"
```

**Si el usuario NO tiene el rol requerido:**
```json
{
  "error": "Forbidden",
  "message": "Access denied"
}
```

---

## 📊 Comparación: Antes vs Después

### Flujo de Autenticación ANTES (JWT Simple)

```
1. Usuario → POST /api/auth/login
2. LoginUseCase busca usuario en BD Oracle
3. LoginUseCase verifica contraseña con BCrypt
4. JwtService genera JWT firmado localmente
5. Respuesta con JWT generado por Quarkus
```

**Problemas:**
- ❌ Contraseñas almacenadas en Oracle (riesgo de seguridad)
- ❌ Gestión de usuarios duplicada (Oracle + manual)
- ❌ No hay gestión de sesiones
- ❌ No hay refresh tokens
- ❌ No hay SSO (Single Sign-On)

### Flujo de Autenticación DESPUÉS (con Keycloak)

```
1. Usuario → POST /api/auth/login
2. LoginUseCase busca usuario en BD Oracle (solo para datos del empleado)
3. KeycloakAuthService envía credenciales a Keycloak
4. Keycloak valida contraseña (almacenada en Keycloak)
5. Keycloak genera JWT firmado con RS256
6. Respuesta con JWT de Keycloak
```

**Ventajas:**
- ✅ Contraseñas gestionadas por Keycloak (más seguro)
- ✅ Gestión centralizada de usuarios
- ✅ Sesiones gestionadas por Keycloak
- ✅ Refresh tokens automáticos
- ✅ Soporte para SSO futuro
- ✅ Roles gestionados en Keycloak
- ✅ Tokens firmados con RS256 (más seguro que HS256)

---

## 🎯 Checklist de Integración

- [ ] **PASO 1:** Cambiar `quarkus.oidc.enabled=true` en application.properties
- [ ] **PASO 1:** Agregar configuración completa de OIDC
- [ ] **PASO 2:** Crear `KeycloakAuthenticationService.java`
- [ ] **PASO 3:** Modificar `LoginUseCase.java` para usar Keycloak
- [ ] **PASO 3:** Eliminar dependencias de `JwtService` y `PasswordHasher` del LoginUseCase
- [ ] **PASO 4:** Agregar `@RolesAllowed` en Controllers que lo necesiten
- [ ] **PASO 5:** Compilar proyecto (`mvnw clean package`)
- [ ] **PASO 5:** Ejecutar Quarkus (`mvnw quarkus:dev`)
- [ ] **PASO 5:** Probar login con curl
- [ ] **PASO 5:** Verificar que el token es de Keycloak (decodificar en jwt.io)
- [ ] **PASO 5:** Probar endpoint protegido con rol

---

## 🔄 Migración de Usuarios (Opcional)

Si ya tienes usuarios en Oracle con contraseñas hasheadas:

### Opción 1: Migración Manual
1. Crear usuarios en Keycloak manualmente
2. Establecer contraseñas nuevas
3. Notificar a usuarios del cambio

### Opción 2: Migración Automática
1. Implementar un script que:
   - Lee usuarios de Oracle
   - Los crea en Keycloak vía Admin API
   - Establece contraseña temporal
   - Usuario debe cambiar en primer login

### Opción 3: Doble Autenticación (Transitorio)
1. Intentar autenticar con Keycloak
2. Si falla, intentar con BD Oracle (legacy)
3. Si funciona con Oracle, crear usuario en Keycloak automáticamente
4. Próximo login ya usará Keycloak

---

## 🚨 Troubleshooting

### Error: "Unable to find OidcProvider"

**Causa:** `quarkus.oidc.enabled=false` o Keycloak no está corriendo

**Solución:**
```powershell
# Verificar que Keycloak está corriendo
docker ps | Select-String keycloak

# Verificar configuración
cat src/main/resources/application.properties | Select-String oidc.enabled
```

### Error: "Invalid client credentials"

**Causa:** `client-secret` incorrecto en application.properties

**Solución:**
1. Ir a Keycloak → datum-travels realm → Clients → datum-travels-backend → Credentials
2. Copiar Client Secret
3. Actualizar en `application.properties`

### Error: "User not found" pero el usuario existe en Keycloak

**Causa:** El usuario está en Keycloak pero NO en la tabla `Usuario` de Oracle

**Solución:**
- Crear el usuario en ambos lugares
- O modificar `LoginUseCase` para crear usuario en Oracle automáticamente si existe en Keycloak

### Token JWT no contiene roles

**Causa:** Configuración incorrecta del role claim path

**Solución:**
```properties
# Verificar en application.properties
quarkus.oidc.roles.role-claim-path=realm_access/roles
```

---

## 📚 Documentos Relacionados

- **GUIA_CONFIGURACION.md** - Setup inicial de Keycloak
- **GUIA_ROLES.md** - Crear y asignar roles
- **README.md** - Documentación general de Keycloak
- **AUTH_ENDPOINTS.md** - Documentación de endpoints de autenticación

---

## 🎉 Resumen

**Para integrar completamente Keycloak con tu API Quarkus necesitas:**

1. ✅ Habilitar OIDC (`quarkus.oidc.enabled=true`)
2. ✅ Crear `KeycloakAuthenticationService` (conecta con Keycloak)
3. ✅ Modificar `LoginUseCase` (usa Keycloak en lugar de JWT local)
4. ✅ Proteger endpoints con `@RolesAllowed`
5. ✅ Probar todo el flujo

**Tiempo estimado:** 1-2 horas de implementación + pruebas

**¿Quieres que te ayude a implementar alguno de estos pasos?**
