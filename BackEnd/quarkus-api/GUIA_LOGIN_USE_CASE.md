# 📋 Guía: LoginUseCase - Autenticación con Keycloak

## 📖 Descripción General

El `LoginUseCase` es el caso de uso responsable de orquestar todo el proceso de autenticación en el sistema Datum Travels. Este componente sigue la arquitectura hexagonal y se ubica en la capa de **Application**.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA APPLICATION                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │        LoginUseCaseImpl (Implementación)           │ │
│  │                                                     │ │
│  │  1. Valida datos de entrada                        │ │
│  │  2. Busca usuario en BD (Oracle)                   │ │
│  │  3. Autentica con Keycloak (via puerto)            │ │
│  │  4. Obtiene datos del empleado                     │ │
│  │  5. Construye respuesta con JWT                    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    CAPA DOMAIN                           │
│  • Repositorios: UsuarioRepository, EmpleadoRepository   │
│  • Excepciones: BusinessValidationException             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 PUERTO (Interface)                       │
│           AuthenticationService (Port)                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              CAPA INFRASTRUCTURE                         │
│        KeycloakAuthAdapter (Implementación)              │
│             (Pendiente de crear)                         │
└─────────────────────────────────────────────────────────┘
```

## 📂 Archivos Involucrados

### ✅ Ya Implementados

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `LoginUseCase.java` | `application/usecase/auth/` | Interface del caso de uso |
| `LoginUseCaseImpl.java` | `application/usecase/auth/` | **Implementación (COMPLETA)** |
| `LoginRequestDTO.java` | `application/dto/auth/` | DTO de entrada |
| `LoginResponseDTO.java` | `application/dto/auth/` | DTO de salida |
| `AuthenticationService.java` | `application/port/` | Puerto de autenticación |

### ⏳ Pendientes de Implementar

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `KeycloakAuthAdapter.java` | `infrastructure/adapter/security/` | Implementación Keycloak |
| `AuthResource.java` | `infrastructure/adapter/input/rest/` | Endpoint REST |

## 🔄 Flujo de Ejecución Detallado

### 1️⃣ Validación de Entrada
```java
validarDatosLogin(loginRequest);
```
**Validaciones:**
- ✅ LoginRequest no es null
- ✅ `usuarioApp` no está vacío
- ✅ `contrasena` no está vacía
- ✅ Contraseña tiene mínimo 6 caracteres

**Excepciones:** `BusinessValidationException`

---

### 2️⃣ Búsqueda de Usuario en BD Local
```java
Optional<Usuario> usuarioOpt = usuarioRepository
    .buscarPorUsername(loginRequest.getUsuarioApp());
```

**¿Por qué buscamos en BD local?**
- Validar que el usuario existe en nuestro sistema
- Obtener `idEmpleado` para traer datos adicionales
- Separar la autenticación (Keycloak) de los datos de negocio (Oracle)

**Excepciones:**
- `BusinessValidationException` si el usuario no existe

---

### 3️⃣ Autenticación con Keycloak
```java
String jwtToken = authenticationService.autenticar(
    loginRequest.getUsuarioApp(),
    loginRequest.getContrasena()
);
```

**Responsabilidades del AuthenticationService:**
- Conectar con Keycloak
- Enviar credenciales
- Recibir token JWT si es válido
- Lanzar `AuthenticationException` si falla

**Ventajas del patrón Port/Adapter:**
- El Use Case **NO conoce** que es Keycloak
- Podríamos cambiar a Auth0, Okta, etc. sin modificar el Use Case
- Fácil de testear con un Mock del puerto

---

### 4️⃣ Obtención de Datos del Empleado
```java
Empleado empleado = obtenerEmpleadoDelUsuario(usuario.getIdEmpleado());
```

**Datos obtenidos:**
- Nombre y apellido
- Correo
- Cargo (si existe)
- Departamento (si existe)

---

### 5️⃣ Construcción de Respuesta
```java
LoginResponseDTO response = construirRespuestaExitosa(empleado, jwtToken);
```

**Estructura de la respuesta:**
```json
{
  "idEmpleado": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@datum.com",
  "cargo": "Desarrollador Senior",
  "departamento": "TI",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "mensaje": "Autenticación exitosa",
  "exitoso": true
}
```

---

## 🔐 Seguridad Implementada

### ✅ Validaciones de Negocio
- Usuario y contraseña obligatorios
- Longitud mínima de contraseña (6 caracteres)
- Usuario debe existir en BD local

### ✅ Autenticación Delegada
- No almacenamos contraseñas en el Use Case
- Keycloak se encarga de validar credenciales
- Token JWT firmado y con expiración

### ✅ Manejo de Errores
- Logs informativos en cada paso
- Excepciones específicas para cada caso
- No se exponen detalles técnicos al usuario

---

## 🧪 Manejo de Excepciones

| Excepción | Cuándo se lanza | HTTP Status (REST) |
|-----------|-----------------|---------------------|
| `BusinessValidationException` | Datos incompletos, usuario no existe | 400 Bad Request |
| `AuthenticationException` | Credenciales inválidas (Keycloak) | 401 Unauthorized |
| `Exception` genérica | Error inesperado en Keycloak | 500 Internal Error |

---

## 📊 Logging Implementado

El Use Case incluye logs en todos los pasos:

```java
LOG.infof("Iniciando proceso de autenticación para usuario: %s", ...)
LOG.debugf("Usuario encontrado en BD: ID=%d, IdEmpleado=%d", ...)
LOG.infof("Autenticación exitosa en Keycloak para usuario: %s", ...)
LOG.warnf("Usuario no encontrado en BD: %s", ...)
LOG.errorf(e, "Error al autenticar usuario %s en Keycloak", ...)
```

**Niveles de log:**
- `INFO`: Inicio/fin de proceso, éxitos
- `DEBUG`: Detalles de cada paso
- `WARN`: Usuario no encontrado
- `ERROR`: Fallos en autenticación

---

## 🎯 Próximos Pasos (Roadmap Día 2)

1. ✅ **LoginUseCase** (Completado)
2. ⏳ **ValidarSesionUseCase** (Siguiente)
3. ⏳ **KeycloakAuthAdapter** (Implementación del puerto)
4. ⏳ **AuthResource** (Endpoint REST)
5. ⏳ **Configurar Keycloak Realm y Client**

---

## 🔧 Configuración Necesaria (Próximamente)

### En `application.properties`:
```properties
# Keycloak
quarkus.oidc.auth-server-url=http://localhost:8180/realms/datum-travels
quarkus.oidc.client-id=datum-api
quarkus.oidc.credentials.secret=YOUR_CLIENT_SECRET
quarkus.oidc.token.issuer=http://localhost:8180/realms/datum-travels

# Token expiration
mp.jwt.verify.publickey.location=http://localhost:8180/realms/datum-travels/protocol/openid-connect/certs
mp.jwt.verify.issuer=http://localhost:8180/realms/datum-travels
```

---

## 🧪 Ejemplo de Uso desde REST (Futuro)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioApp": "juan.perez",
    "contrasena": "password123"
  }'
```

**Respuesta exitosa:**
```json
{
  "idEmpleado": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@datum.com",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "mensaje": "Autenticación exitosa",
  "exitoso": true
}
```

---

## 📝 Notas Importantes

### ✅ Ventajas de esta Implementación

1. **Desacoplamiento**: El Use Case no conoce Keycloak directamente
2. **Testeable**: Fácil de probar con mocks
3. **Flexible**: Cambiar el proveedor de autenticación es simple
4. **Trazable**: Logs completos en cada paso
5. **Robusto**: Manejo de excepciones en todos los casos

### ⚠️ Consideraciones

1. **Tiempo de expiración del token**: Actualmente hardcodeado a 3600 segundos (1 hora). Debe configurarse dinámicamente desde Keycloak.

2. **Relaciones Lazy**: Los campos `cargo` y `departamento` de `Empleado` usan `FetchType.LAZY`. Asegúrate de que la transacción esté activa al acceder a ellos.

3. **Sincronización de usuarios**: Los usuarios deben existir tanto en Keycloak como en la BD local. Considerar un proceso de sincronización.

---

## 🔗 Referencias

- [Arquitectura Hexagonal](./CLEAN_ARCHITECTURE.md)
- [Guía de la Capa Application](./GUIA_CAPA_APPLICATION.md)
- [Keycloak Documentation](https://www.keycloak.org/docs/latest/securing_apps/)
- [Quarkus OIDC](https://quarkus.io/guides/security-openid-connect)

---

**Autor:** Datum Travels Team  
**Fecha:** Octubre 2025  
**Versión:** 1.0
