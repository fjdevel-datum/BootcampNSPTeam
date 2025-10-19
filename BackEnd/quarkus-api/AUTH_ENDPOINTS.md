# 🔐 Endpoints de Autenticación - Datum Travels

Documentación de los endpoints de autenticación implementados en la **Fase #1** del proyecto.

## 📋 Tabla de Contenidos

- [Overview](#overview)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Datos de Prueba](#datos-de-prueba)
- [Cómo Probar](#cómo-probar)
- [Arquitectura](#arquitectura)

---

## Overview

Sistema de autenticación JWT simple para el MVP de Datum Travels.

**Características:**
- ✅ Login con validación contra Oracle DB
- ✅ Generación de tokens JWT (HS512)
- ✅ Validación de tokens
- ✅ Logout con blacklist en memoria
- ✅ Clean Architecture (pragmática)

**Stack Técnico:**
- Quarkus 3.27.0
- Java 21
- JWT (io.jsonwebtoken 0.12.5)
- Oracle XE

---

## Endpoints Disponibles

### 1. 🔑 POST `/api/auth/login`

Valida credenciales contra la BD y retorna un token JWT.

**Request Body:**
```json
{
  "usuarioApp": "cmartinez",
  "contrasena": "carlos123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "idEmpleado": 1,
  "nombreCompleto": "Carlos Martínez",
  "correo": "cmartinez@datumtravels.com"
}
```

**Errores:**
- `401 Unauthorized` - Credenciales inválidas
- `500 Internal Server Error` - Error del servidor

---

### 2. 🚪 POST `/api/auth/logout`

Invalida el token actual (lo agrega a una blacklist).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "mensaje": "Logout exitoso",
  "success": true
}
```

**Errores:**
- `400 Bad Request` - Token no proporcionado
- `500 Internal Server Error` - Error del servidor

---

### 3. ✔️ GET `/api/auth/validate`

Verifica si un token JWT es válido y no ha expirado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "idEmpleado": 1,
  "usuarioApp": "cmartinez",
  "mensaje": "Token válido"
}
```

**Response (401 Unauthorized):**
```json
{
  "valid": false,
  "idEmpleado": null,
  "usuarioApp": null,
  "mensaje": "Token expirado"
}
```

---

### 4. 📋 GET `/api/auth/health`

Health check del servicio de autenticación.

**Response (200 OK):**
```json
{
  "status": "OK",
  "service": "auth",
  "mensaje": "Servicio de autenticación funcionando correctamente"
}
```

---

## Datos de Prueba

Los siguientes usuarios están disponibles en `import.sql`:

| Usuario     | Contraseña | Nombre            | ID Empleado |
|-------------|------------|-------------------|-------------|
| `cmartinez` | `carlos123` | Carlos Martínez  | 1           |
| `arodriguez`| `ana123`    | Ana Rodríguez    | 2           |
| `lgonzalez` | `luis123`   | Luis González    | 3           |

---

## Cómo Probar

### Opción 1: Script PowerShell Automatizado

Ejecuta el script de prueba completo:

```powershell
cd BackEnd\scripts
.\test-auth-endpoints.ps1
```

Este script realiza las siguientes pruebas:
1. ✅ Health check
2. ✅ Login exitoso
3. ✅ Validación de token
4. ✅ Logout
5. ✅ Validación después de logout (debe fallar)
6. ✅ Login con credenciales incorrectas (debe fallar)

---

### Opción 2: cURL Manual

#### 1. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioApp": "cmartinez",
    "contrasena": "carlos123"
  }'
```

#### 2. Validate (reemplaza `<TOKEN>` con el token recibido)
```bash
curl -X GET http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer <TOKEN>"
```

#### 3. Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer <TOKEN>"
```

---

### Opción 3: Swagger UI

Accede a la documentación interactiva:

```
http://localhost:8080/swagger-ui
```

---

## Arquitectura

### Estructura de Capas

```
domain/
  ├── model/
  │   ├── Usuario.java         # Entidad JPA
  │   └── Empleado.java        # Entidad JPA
  └── repository/
      └── UsuarioRepository.java  # Interface del repositorio

application/
  ├── dto/
  │   ├── LoginRequestDTO.java
  │   ├── LoginResponseDTO.java
  │   └── ValidateTokenResponseDTO.java
  ├── port/
  │   └── JwtService.java      # Interface para JWT
  └── usecase/
      ├── LoginUseCase.java
      ├── LogoutUseCase.java
      └── ValidateTokenUseCase.java

infrastructure/
  ├── adapter/
  │   ├── rest/
  │   │   └── AuthController.java     # REST endpoints
  │   └── persistence/
  │       └── UsuarioRepositoryImpl.java
  └── security/
      └── JwtServiceImpl.java         # Implementación JWT
```

---

### Flujo de Login

```
1. Cliente → AuthController.login()
2. AuthController → LoginUseCase.ejecutar()
3. LoginUseCase → UsuarioRepository.buscarPorUsuarioApp()
4. LoginUseCase → JwtService.generateToken()
5. JwtService → Retorna JWT
6. LoginUseCase → Retorna LoginResponseDTO
7. AuthController → Retorna Response 200 OK
```

---

### Flujo de Validación

```
1. Cliente → AuthController.validate() [con header Authorization]
2. AuthController → Extrae token del header
3. AuthController → ValidateTokenUseCase.ejecutar()
4. ValidateTokenUseCase → LogoutUseCase.isTokenBlacklisted()
5. ValidateTokenUseCase → JwtService.validateToken()
6. ValidateTokenUseCase → JwtService.getIdEmpleado() / getUsuarioApp()
7. ValidateTokenUseCase → Retorna ValidateTokenResponseDTO
8. AuthController → Retorna Response
```

---

## Configuración JWT

Las propiedades JWT están en `application.properties`:

```properties
# Clave secreta (256 bits mínimo para HS512)
jwt.secret=datum-travels-super-secret-key-2025-must-be-at-least-256-bits-long-for-hs512-algorithm

# Expiración en segundos (1 hora)
jwt.expiration=3600

# Issuer del token
jwt.issuer=datum-travels-api
```

⚠️ **IMPORTANTE:** En producción, la clave secreta debe estar en variables de entorno.

---

## Próximos Pasos - Fase #2

- [ ] Endpoints de Eventos (`/api/eventos`)
- [ ] Endpoints de Gastos (`/api/gastos`)
- [ ] Filtro de autenticación global (interceptor)
- [ ] Manejo de roles y permisos

---

## Notas de Seguridad

### ⚠️ Implementación MVP (No apto para producción)

1. **Contraseñas en texto plano**: Actualmente las contraseñas se almacenan sin hash. En producción usar **BCrypt**.

2. **Blacklist en memoria**: Los tokens invalidados se guardan en memoria. En producción usar **Redis**.

3. **JWT Secret hardcodeado**: La clave está en el código. En producción usar **variables de entorno**.

4. **Sin refresh tokens**: Solo se implementan access tokens. En producción agregar **refresh tokens**.

5. **CORS abierto**: CORS está configurado para desarrollo. En producción restringir orígenes.

---

## Troubleshooting

### Error: "Token no proporcionado"
- Asegúrate de enviar el header `Authorization: Bearer <token>`

### Error: "Credenciales inválidas"
- Verifica que el usuario y contraseña sean correctos
- Revisa que los datos de `import.sql` se hayan insertado

### Error: "Cannot connect to database"
- Verifica que Oracle XE esté corriendo en puerto 1522
- Revisa las credenciales en `application.properties`

### Error de compilación con jjwt
- Asegúrate de tener las 3 dependencias: `jjwt-api`, `jjwt-impl`, `jjwt-jackson`

---

## Contacto

**Equipo:** Datum Travels Development Team  
**Fecha:** Enero 2025  
**Versión:** 1.0.0 (MVP - Fase #1)
