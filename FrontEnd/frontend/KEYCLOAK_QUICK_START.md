# ⚡ Quick Start - Configuración Keycloak para Frontend

## 🎯 Pasos Rápidos

### 1️⃣ Crear Client en Keycloak (5 minutos)

1. Accede a Keycloak Admin: **http://localhost:8180**
2. Login con admin/admin
3. Selecciona realm: **datum-travels**
4. Click **Clients** → **Create client**

**Configuración:**
```yaml
Client ID: datum-travels-frontend
Client Protocol: openid-connect
Root URL: http://localhost:5173
```

Click **Next**

**Capability config:**
```yaml
Client authentication: OFF (Public client)
Authorization: OFF
Authentication flow:
  ✅ Standard flow
  ✅ Direct access grants
  ❌ Implicit flow
  ❌ Service accounts roles
```

Click **Next**

**Login settings:**
```yaml
Valid redirect URIs: http://localhost:5173/*
Valid post logout redirect URIs: http://localhost:5173
Web origins: http://localhost:5173
```

Click **Save**

### 2️⃣ Configurar Roles (2 minutos)

1. Click **Realm roles** → **Create role**
2. Crear rol **admin**:
   ```
   Role name: admin
   Description: Administrador del sistema
   ```
   Click **Save**

3. Crear rol **user**:
   ```
   Role name: user
   Description: Usuario normal
   ```
   Click **Save**

### 3️⃣ Crear Usuarios de Prueba (3 minutos)

#### Usuario Administrador

1. Click **Users** → **Add user**
   ```yaml
   Username: admin.test
   Email: admin@datum.com
   First name: Admin
   Last name: Test
   Email verified: ON
   ```
   Click **Create**

2. Tab **Credentials** → **Set password**
   ```yaml
   Password: admin123
   Password confirmation: admin123
   Temporary: OFF
   ```
   Click **Save**

3. Tab **Role mapping** → **Assign role**
   - Seleccionar: `admin` y `user`
   - Click **Assign**

#### Usuario Normal

1. Click **Users** → **Add user**
   ```yaml
   Username: usuario.test
   Email: usuario@datum.com
   First name: Usuario
   Last name: Test
   Email verified: ON
   ```
   Click **Create**

2. Tab **Credentials** → **Set password**
   ```yaml
   Password: usuario123
   Password confirmation: usuario123
   Temporary: OFF
   ```
   Click **Save**

3. Tab **Role mapping** → **Assign role**
   - Seleccionar: `user`
   - Click **Assign**

### 4️⃣ Verificar Configuración

Probar endpoint de token:

```bash
# Probar login de admin
curl -X POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=datum-travels-frontend" \
  -d "username=admin.test" \
  -d "password=admin123"
```

Debe retornar:
```json
{
  "access_token": "eyJhbGc...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer"
}
```

### 5️⃣ Iniciar Frontend

```bash
cd FrontEnd/frontend
npm install
npm run dev
```

Abrir: **http://localhost:5173**

## 🧪 Pruebas

### Test 1: Login como Admin

1. Usuario: `admin.test`
2. Password: `admin123`
3. **Resultado esperado**: Redirige a `/admin`
4. Puede acceder a todas las rutas

### Test 2: Login como Usuario

1. Usuario: `usuario.test`
2. Password: `usuario123`
3. **Resultado esperado**: Redirige a `/home`
4. **NO** puede acceder a `/admin/*`

### Test 3: Protección de Rutas

1. Sin login, intentar acceder a `/home`
2. **Resultado esperado**: Redirige a `/` (login)

### Test 4: Logout

1. Hacer login
2. Click en botón "Salir"
3. **Resultado esperado**: Redirige a `/` y limpia sesión

## 🐛 Troubleshooting

### Error: "CORS policy"

Verificar en Keycloak:
- Client → `datum-travels-frontend` → **Web origins**: `http://localhost:5173`

### Error: "Invalid credentials"

Verificar:
1. Usuario existe en Keycloak
2. Password es correcto (no es temporal)
3. Client ID es `datum-travels-frontend`

### Error: "Unauthorized" en rutas admin

Verificar:
1. Usuario tiene rol `admin` asignado
2. Token JWT incluye roles en `realm_access.roles`

### Frontend no carga

```bash
# Verificar puerto 5173 libre
netstat -ano | findstr :5173

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📋 Checklist de Configuración

- [ ] Client `datum-travels-frontend` creado
- [ ] Direct Access Grants habilitado
- [ ] Valid Redirect URIs configurado
- [ ] Rol `admin` creado
- [ ] Rol `user` creado
- [ ] Usuario `admin.test` creado con rol admin
- [ ] Usuario `usuario.test` creado con rol user
- [ ] Endpoint de token probado exitosamente
- [ ] Frontend iniciado en puerto 5173
- [ ] Login funciona correctamente

## 🎉 ¡Listo!

Ahora tu frontend está integrado con Keycloak usando JWT.

**Credenciales de prueba:**
- Admin: `admin.test` / `admin123`
- Usuario: `usuario.test` / `usuario123`
