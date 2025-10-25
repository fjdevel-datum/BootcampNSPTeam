# 🎯 Guía Paso a Paso - Configuración de Keycloak

Esta guía te llevará de la mano para configurar Keycloak desde cero.

---

## 📋 **Checklist de Configuración**

- [ ] 1. Levantar Keycloak en Docker
- [ ] 2. Acceder a la consola de administración
- [ ] 3. Crear Realm "datum-travels"
- [ ] 4. Crear Client "datum-travels-backend"
- [ ] 5. Obtener Client Secret
- [ ] 6. Actualizar application.properties
- [ ] 7. Crear usuario de prueba
- [ ] 8. Probar autenticación

---

## 🚀 **PASO 1: Levantar Keycloak**

### Opción A: Con todo el stack (recomendado)

```powershell
# Desde la raíz del proyecto
cd E:\Pro_da\BootcampNSPTeam
docker-compose -f docker-compose-dev.yml up -d
```

### Opción B: Solo Keycloak

```powershell
# Desde la carpeta BackEnd/keycloak
cd E:\Pro_da\BootcampNSPTeam\BackEnd\keycloak
docker-compose up -d
```

### ✅ Verificar que está corriendo

```powershell
# Ver logs
docker logs -f datum-keycloak-dev

# Espera a ver este mensaje:
# "Keycloak 23.0.7 on JVM (powered by Quarkus 3.x.x) started in X.XXXs"
```

**Tiempo de arranque:** ~60 segundos

---

## 🔑 **PASO 2: Acceder a la Consola**

1. Abre tu navegador
2. Ve a: **http://localhost:8180**
3. Click en **"Administration Console"**
4. Login:
   - **Username:** `admin`
   - **Password:** `admin123`

✅ **Deberías ver el dashboard de Keycloak**

---

## 🏰 **PASO 3: Crear Realm "datum-travels"**

### 3.1 Crear el Realm

1. En la esquina superior izquierda, verás un dropdown que dice **"Keycloak"** o **"master"**
2. Click en ese dropdown
3. Click en **"Create Realm"**
4. En el formulario:
   - **Realm name:** `datum-travels`
   - **Enabled:** ✅ ON
5. Click **"Create"**

✅ **El realm "datum-travels" fue creado**

### 3.2 Verificar

- El dropdown superior izquierdo ahora debe decir **"datum-travels"**
- Estás ahora trabajando en tu realm

---

## 🔌 **PASO 4: Crear Client "datum-travels-backend"**

### 4.1 Ir a Clients

1. En el menú lateral izquierdo, click en **"Clients"**
2. Click en el botón **"Create client"**

### 4.2 General Settings

En la pantalla "General Settings":

| Campo | Valor |
|-------|-------|
| **Client type** | OpenID Connect |
| **Client ID** | `datum-travels-backend` |

Click **"Next"**

### 4.3 Capability config

**MUY IMPORTANTE:** Configura exactamente así:

| Opción | Estado |
|--------|--------|
| **Client authentication** | ✅ **ON** |
| **Authorization** | ❌ OFF |
| **Authentication flow** | |
| - Standard flow | ❌ OFF |
| - **Direct access grants** | ✅ **ON** ← MUY IMPORTANTE |
| - Implicit flow | ❌ OFF |
| - Service accounts roles | ❌ OFF |

Click **"Next"**

### 4.4 Login settings

| Campo | Valor |
|-------|-------|
| **Root URL** | `http://localhost:8080` |
| **Home URL** | `http://localhost:8080` |
| **Valid redirect URIs** | `http://localhost:8080/*` |
| **Valid post logout redirect URIs** | `http://localhost:8080/*` |
| **Web origins** | `http://localhost:8080` |

Click **"Save"**

✅ **Client creado exitosamente!**

---

## 🔐 **PASO 5: Obtener Client Secret**

### 5.1 Ir a Credentials

1. En el menú del client `datum-travels-backend`, click en la pestaña **"Credentials"**
2. Verás el **Client Secret** (algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
3. **COPIA ESE VALOR** completo

### 5.2 Guardar temporalmente

Guárdalo en un archivo de texto temporal, lo necesitarás en el siguiente paso.

Ejemplo:
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## ⚙️ **PASO 6: Actualizar application.properties**

### 6.1 Abrir el archivo

Ruta: `BackEnd/quarkus-api/src/main/resources/application.properties`

### 6.2 Buscar la sección de Keycloak

Busca estas líneas (alrededor de la línea 100):

```properties
# KEYCLOAK CONFIGURATION
keycloak.server-url=http://localhost:8180
keycloak.realm=datum-travels
keycloak.client-id=datum-travels-backend
keycloak.client-secret=your-client-secret-here  ← CAMBIAR ESTA LÍNEA
```

### 6.3 Actualizar el secret

Reemplaza `your-client-secret-here` con el valor que copiaste:

```properties
keycloak.client-secret=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### 6.4 Guardar el archivo

Guarda los cambios (Ctrl+S)

✅ **Configuración actualizada!**

---

## 👤 **PASO 7: Crear Usuario de Prueba**

### 7.1 Ir a Users

1. En el menú lateral, click en **"Users"**
2. Click en **"Add user"**

### 7.2 Configurar el usuario

| Campo | Valor |
|-------|-------|
| **Username** | `carlos.test` |
| **Email** | `carlos@datum.com` |
| **First name** | `Carlos` |
| **Last name** | `Test` |
| **Email verified** | ✅ ON |
| **Enabled** | ✅ ON |

Click **"Create"**

### 7.3 Establecer contraseña

1. Una vez creado el usuario, ve a la pestaña **"Credentials"**
2. Click en **"Set password"**
3. En el formulario:
   - **Password:** `test123`
   - **Password confirmation:** `test123`
   - **Temporary:** ❌ OFF (importante)
4. Click **"Save"**
5. Confirma en el diálogo que aparece

✅ **Usuario creado: `carlos.test / test123`**

---

## 🧪 **PASO 8: Probar Autenticación**

### 8.1 Probar directamente con Keycloak

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
  ...
}
```

✅ Si ves el `access_token`, **¡Keycloak está funcionando!**

### 8.2 Probar a través de tu API Quarkus

**IMPORTANTE:** Primero asegúrate de que tu backend Quarkus esté corriendo en `http://localhost:8080`

```powershell
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
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 300,
  "usuario": {
    "idUsuario": 1,
    "usuarioApp": "carlos.test",
    ...
  }
}
```

✅ **¡Integración completa funcionando!**

---

## 🎉 **¡CONFIGURACIÓN COMPLETADA!**

Has completado exitosamente:

- ✅ Keycloak corriendo en Docker
- ✅ Realm "datum-travels" creado
- ✅ Client configurado correctamente
- ✅ Client Secret actualizado en Quarkus
- ✅ Usuario de prueba creado
- ✅ Autenticación funcionando

---

## 🔄 **Próximos Pasos (Opcional)**

### Crear más usuarios

Repite el PASO 7 para crear más usuarios de prueba.

### Crear roles

1. Ve a **Realm roles**
2. Create role: `admin`, `user`, `contador`
3. Asigna roles a usuarios

### Exportar configuración del realm

Para guardar tu configuración:

```powershell
docker exec -it datum-keycloak-dev /opt/keycloak/bin/kc.sh export --dir /tmp --realm datum-travels
docker cp datum-keycloak-dev:/tmp/datum-travels-realm.json ./BackEnd/keycloak/realm-config/
```

---

## 🐛 **Troubleshooting**

### Error: "Invalid client credentials"

- Verifica que el `client-secret` en `application.properties` sea correcto
- Verifica que "Client authentication" esté en ON
- Verifica que "Direct access grants" esté en ON

### Error: "Invalid user credentials"

- Verifica que el usuario existe
- Verifica que la contraseña NO sea temporal
- Verifica que el usuario esté habilitado

### Keycloak no arranca

```powershell
# Ver logs
docker logs datum-keycloak-dev

# Verificar salud
docker ps | Select-String keycloak
```

---

**¿Necesitas ayuda?** Consulta el archivo README.md principal en esta carpeta.
