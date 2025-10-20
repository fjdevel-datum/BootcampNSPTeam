# 🔐 Keycloak - Guía Completa

## 📖 ¿Qué es Keycloak?

**Keycloak** es un servidor de autenticación y autorización de código abierto desarrollado por Red Hat. Es como tener un "guardia de seguridad" profesional para tu aplicación.

### 🎯 ¿Para qué sirve?

En lugar de que TÚ programes:
- ❌ Sistema de login
- ❌ Validación de contraseñas
- ❌ Generación de tokens JWT
- ❌ Manejo de sesiones
- ❌ Recuperación de contraseñas
- ❌ Autenticación de dos factores
- ❌ OAuth2, OpenID Connect

Keycloak lo hace **TODO automáticamente** ✅

---

## 🏰 ¿Qué es un REALM?

Un **Realm** es como un "mundo aislado" o "inquilino" dentro de Keycloak.

### 🌍 Analogía del mundo real:

Imagina un edificio de apartamentos:
- **Edificio** = Keycloak (el servidor)
- **Apartamento 1** = Realm "datum-travels" (tu proyecto)
- **Apartamento 2** = Realm "otro-proyecto" (otro sistema)
- **Apartamento 3** = Realm "produccion" (versión en producción)

Cada realm es **completamente independiente**:
- Tiene sus propios usuarios
- Tiene sus propios clientes (aplicaciones)
- Tiene su propia configuración
- No se mezclan entre sí

### 📝 En tu caso:

```
Keycloak Server
├── Realm: master (viene por defecto, NO lo uses)
│   └── Solo para administrar Keycloak
│
└── Realm: datum-travels (el que crearemos)
    ├── Usuarios: carlos.test, juan.perez, etc.
    ├── Clientes: datum-travels-backend, datum-travels-frontend
    └── Configuración específica de tu proyecto
```

### ✅ Ventajas de usar Realms:

1. **Desarrollo/Producción separados**
   - Realm: `datum-travels-dev` (pruebas)
   - Realm: `datum-travels-prod` (producción)

2. **Múltiples proyectos en un solo Keycloak**
   - Realm: `proyecto-a`
   - Realm: `proyecto-b`

3. **Datos aislados**
   - Los usuarios de un realm NO pueden acceder a otro

---

## 🖥️ ¿Qué es un CLIENT?

Un **Client** es una aplicación que usa Keycloak para autenticar usuarios.

### 🎭 Analogía del mundo real:

Imagina un club nocturno:
- **Keycloak** = El sistema de seguridad del club
- **Client** = Cada entrada al club (puerta principal, VIP, empleados)
- **Usuario** = Persona que quiere entrar

Cada "entrada" (client) tiene reglas diferentes:
- Puerta principal: necesita ID y boleto
- Entrada VIP: necesita invitación especial
- Entrada empleados: necesita credencial de trabajo

### 📝 Tipos de Clients en tu proyecto:

```
Realm: datum-travels
├── Client: datum-travels-backend (API Quarkus)
│   ├── Tipo: Confidencial
│   ├── Tiene Client Secret (contraseña secreta)
│   ├── Permite: Direct Access Grants (usuario/contraseña directo)
│   └── Uso: Tu API valida tokens aquí
│
└── Client: datum-travels-frontend (React - futuro)
    ├── Tipo: Público
    ├── NO tiene Client Secret
    ├── Permite: Standard Flow (redirect login)
    └── Uso: Tu frontend redirige a Keycloak para login
```

### 🔑 Client Secret

Es como una **contraseña privada** que solo tu backend conoce.

```
Usuario hace login → Keycloak valida → Genera token JWT
Backend recibe token → Valida con Keycloak usando Client Secret → Permite acceso
```

**⚠️ Importante:** El Client Secret NUNCA se expone al frontend.

---

## 🔄 Flujo de Autenticación Completo

### Paso a paso:

```
1️⃣ Usuario abre tu app React
   └─> Ve formulario de login

2️⃣ Usuario ingresa: usuario + contraseña
   └─> React envía a tu API Quarkus

3️⃣ API Quarkus llama a Keycloak
   POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token
   └─> Envía: username, password, client_id, client_secret

4️⃣ Keycloak valida credenciales
   ├─> ✅ Correcto: Genera token JWT
   └─> ❌ Incorrecto: Error 401

5️⃣ Keycloak retorna token JWT
   {
     "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "Bearer",
     "expires_in": 300
   }

6️⃣ API Quarkus retorna token al frontend
   └─> React guarda en localStorage

7️⃣ Usuario hace peticiones
   └─> React envía token en header: Authorization: Bearer eyJh...

8️⃣ API valida token en cada request
   ├─> KeycloakAuthAdapter.validarToken()
   └─> Si válido → Procesa request
       Si inválido → Error 401
```

---

## 🔐 ¿Qué es un JWT (JSON Web Token)?

Un **JWT** es como un "pase VIP digital" que prueba quién eres.

### 📄 Estructura de un JWT:

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNhcmxvcyIsImV4cCI6MTYzODM2MDgwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Tiene 3 partes (separadas por puntos):

1. Header (información del token)
2. Payload (datos del usuario)
3. Signature (firma para verificar que es legítimo)
```

### 🔍 Ejemplo de Payload decodificado:

```json
{
  "sub": "carlos.test",           // Username
  "email": "carlos@datum.com",    // Email
  "name": "Carlos Test",          // Nombre completo
  "preferred_username": "carlos.test",
  "exp": 1729224000,              // Cuándo expira
  "iat": 1729223700,              // Cuándo se creó
  "roles": ["user", "admin"]      // Roles del usuario
}
```

**🔒 Lo importante:** El token está **firmado digitalmente** por Keycloak, así que nadie puede falsificarlo.

---

## 🎯 Conceptos Clave de Keycloak

### 1. **Realm** 
- Contenedor principal
- Tu "mundo" aislado
- Ejemplo: `datum-travels`

### 2. **Client**
- Aplicación que usa Keycloak
- Ejemplo: `datum-travels-backend`

### 3. **User**
- Persona que usa tu sistema
- Ejemplo: `carlos.test`

### 4. **Role**
- Permiso o función del usuario
- Ejemplo: `admin`, `user`, `contador`

### 5. **Client Secret**
- Contraseña del cliente
- Solo el backend la conoce

### 6. **Access Token (JWT)**
- Pase que prueba identidad
- Tiene tiempo de expiración

### 7. **Refresh Token**
- Token para renovar el Access Token
- Dura más tiempo

---

## 🏗️ Arquitectura en tu Proyecto

```
┌─────────────────────────────────────────────────────────┐
│                    KEYCLOAK SERVER                       │
│                  (Puerto 8180)                           │
│                                                          │
│  Realm: datum-travels                                    │
│  ├── Client: datum-travels-backend                       │
│  │   └── Secret: a1b2c3d4-e5f6...                       │
│  │                                                       │
│  └── Users:                                              │
│      ├── carlos.test / test123                           │
│      └── (más usuarios aquí)                             │
└─────────────────────────────────────────────────────────┘
                          ↓
                    Genera JWT
                          ↓
┌─────────────────────────────────────────────────────────┐
│              QUARKUS API (Puerto 8081)                   │
│                                                          │
│  KeycloakAuthAdapter                                     │
│  ├── autenticar() → Obtiene JWT de Keycloak             │
│  ├── validarToken() → Verifica JWT                      │
│  └── obtenerUsernameDesdeToken() → Lee datos del JWT    │
│                                                          │
│  LoginUseCaseImpl                                        │
│  └── Orquesta autenticación                             │
└─────────────────────────────────────────────────────────┘
                          ↓
                    Retorna JWT
                          ↓
┌─────────────────────────────────────────────────────────┐
│              REACT FRONTEND (Puerto 5173)                │
│                                                          │
│  ├── Envía: username + password                         │
│  ├── Recibe: JWT                                         │
│  ├── Guarda: localStorage.setItem('token', jwt)          │
│  └── Usa: Authorization: Bearer {jwt}                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Glosario Rápido

| Término | Significado |
|---------|-------------|
| **Keycloak** | Servidor de autenticación |
| **Realm** | Contenedor/mundo aislado |
| **Client** | Aplicación que usa Keycloak |
| **User** | Usuario del sistema |
| **JWT** | Token de autenticación |
| **Client Secret** | Contraseña del cliente |
| **Access Token** | Token para acceder a recursos |
| **Refresh Token** | Token para renovar access token |
| **OIDC** | OpenID Connect (protocolo) |
| **OAuth2** | Protocolo de autorización |

---

## ✅ Ventajas de usar Keycloak

### 🎯 Para Desarrolladores:
- ✅ No programas login desde cero
- ✅ Seguridad probada (usado por Google, Red Hat)
- ✅ Estándares de industria (OAuth2, OIDC)
- ✅ Single Sign-On (un login para varias apps)
- ✅ Social Login (Google, Facebook, GitHub)

### 🎯 Para tu Proyecto:
- ✅ Autenticación profesional
- ✅ Tokens JWT seguros
- ✅ Manejo de sesiones
- ✅ Fácil de escalar
- ✅ Interfaz de administración
- ✅ Logs de auditoría

### 🎯 Para Usuarios:
- ✅ Recuperar contraseña
- ✅ Cambiar contraseña
- ✅ Autenticación de 2 factores (2FA)
- ✅ Recordar sesión
- ✅ Cerrar sesión remota

---

## 🚀 Lo que configuraremos HOY

```
1. ✅ Realm: datum-travels
   └─> Tu espacio aislado

2. ✅ Client: datum-travels-backend
   └─> Para tu API Quarkus

3. ✅ User: carlos.test / test123
   └─> Usuario de prueba

4. ✅ Probar autenticación
   └─> Obtener token JWT
```

---

## 🔮 Configuración Futura (cuando lo necesites)

```
⏳ Roles y permisos
   └─> admin, contador, empleado

⏳ Client: datum-travels-frontend
   └─> Para React

⏳ Usuarios reales
   └─> Importar desde base de datos

⏳ Social Login
   └─> Login con Google

⏳ Autenticación de 2 factores
   └─> Más seguridad

⏳ Realm production
   └─> Separar dev y prod
```

---

## 📖 Referencias Oficiales

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Getting Started](https://www.keycloak.org/guides)
- [Securing Applications](https://www.keycloak.org/docs/latest/securing_apps/)

---

**¡Listo!** Ahora sabes qué es Keycloak y para qué sirve cada concepto. Vamos a configurarlo 🚀
