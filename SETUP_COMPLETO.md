# 🚀 Setup Completo - Datum Travels (Rama: celso)

## ✅ Para que otro desarrollador pueda levantar el proyecto completo

Este documento te guía paso a paso para levantar **todo el stack** del proyecto después de clonar la rama `celso`.

---

## 📋 Prerequisitos

Antes de empezar, asegúrate de tener instalado:

- ✅ **Java 21.0.8** (OpenJDK o Oracle JDK)
- ✅ **Docker Desktop** (para Oracle y Keycloak)
- ✅ **Node.js 18+** (para el frontend)
- ✅ **Git** (para clonar el repo)

### Verificar versiones:

```powershell
java -version          # Debe decir "21.0.8"
docker --version       # Docker 20.10+
node --version         # Node 18+
```

---

## 🔧 Paso 1: Clonar y Cambiar a la Rama

```powershell
git clone https://github.com/fjdevel-datum/BootcampNSPTeam.git
cd BootcampNSPTeam
git checkout celso
```

---

## 🐳 Paso 2: Levantar Infraestructura (Docker)

### 2.1. Levantar Oracle XE + Keycloak

```powershell
# Desde la raíz del proyecto
docker-compose -f docker-compose-dev.yml up -d
```

### 2.2. Verificar que los contenedores estén corriendo

```powershell
docker ps
```

Deberías ver:
- ✅ `datum-oracle-dev` (puerto 1522)
- ✅ `datum-keycloak-dev` (puerto 8180)

### 2.3. Esperar a que Keycloak esté listo

```powershell
# Espera ~60 segundos
Start-Sleep -Seconds 60

# Verifica que Keycloak esté healthy
docker ps --filter "name=keycloak"
```

---

## 🔐 Paso 3: Configurar Keycloak (MANUAL - Solo la primera vez)

### 3.1. Acceder a Keycloak Admin Console

1. Abre tu navegador: **http://localhost:8180/admin**
2. Login con:
   - **Usuario:** `admin`
   - **Contraseña:** `admin`

### 3.2. Crear Realm "datum-travels"

1. En la esquina superior izquierda, donde dice **"master"**
2. Click en el dropdown → **"Create Realm"**
3. Nombre del Realm: **`datum-travels`**
4. Click **"Create"**

### 3.3. Crear Client "datum-travels-backend"

1. En el menú lateral: **Clients** → **"Create client"**
2. Configuración:
   - **Client ID:** `datum-travels-backend`
   - **Client Type:** `OpenID Connect`
   - Click **"Next"**
3. Capability config:
   - ✅ **Client authentication:** ON
   - ✅ **Authorization:** OFF
   - ✅ **Standard flow:** ON
   - ✅ **Direct access grants:** ON
   - Click **"Next"**
4. Login settings:
   - **Valid redirect URIs:** `http://localhost:8080/*`
   - **Web origins:** `http://localhost:8080`
   - Click **"Save"**

### 3.4. Obtener Client Secret

1. Ve a la pestaña **"Credentials"**
2. Copia el **Client Secret**
3. ⚠️ **IMPORTANTE:** El secret en el código es: `tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT`
   - Si el tuyo es diferente, actualiza `application.properties` línea 105 y 160

### 3.5. Crear Rol "Empleado"

1. En el menú lateral: **Realm roles** → **"Create role"**
2. **Role name:** `Empleado`
3. Click **"Save"**

### 3.6. Crear Usuario "carlos.test"

1. En el menú lateral: **Users** → **"Create new user"**
2. Configuración:
   - **Username:** `carlos.test`
   - **Email:** `carlos@datum.com`
   - **First name:** `Carlos`
   - **Last name:** `Test`
   - ✅ **Email verified:** ON
   - ✅ **Enabled:** ON
   - Click **"Create"**

### 3.7. Establecer Contraseña

1. Click en el usuario recién creado
2. Pestaña **"Credentials"** → **"Set password"**
3. Password: `test123`
4. Password confirmation: `test123`
5. ⚠️ **Temporary:** **OFF** (muy importante)
6. Click **"Save"** → Confirmar

### 3.8. Asignar Rol al Usuario

1. Pestaña **"Role mapping"**
2. Click **"Assign role"**
3. Buscar y seleccionar: **`Empleado`**
4. Click **"Assign"**

---

## 💾 Paso 4: Configurar Oracle Database

### 4.1. Crear Esquema y Tablas

```powershell
# Ejecutar script de creación de BD
Get-Content "BD DATUM FINAL.sql" | docker exec -i datum-oracle-dev sqlplus -S system/oracle@XEPDB1
```

### 4.2. Crear Usuario datum_user

```powershell
Get-Content "BackEnd/scripts/create-datum-user.sql" | docker exec -i datum-oracle-dev sqlplus -S system/oracle@XEPDB1
```

### 4.3. Crear Datos de Prueba (Empleado + Usuario)

```powershell
Get-Content "BackEnd/scripts/insertar-usuario-test-keycloak.sql" | docker exec -i datum-oracle-dev sqlplus -S datum_user/datum2025@XEPDB1
```

### 4.4. Verificar Datos

```powershell
$sql = "SELECT * FROM Usuario WHERE usuario_app='carlos.test';"
$sql | docker exec -i datum-oracle-dev sqlplus -S datum_user/datum2025@XEPDB1
```

Deberías ver:
- **ID_USUARIO:** 1
- **USUARIO_APP:** carlos.test
- **ID_EMPLEADO:** 1

---

## ☕ Paso 5: Levantar Backend (Quarkus)

### 5.1. Navegar al directorio del backend

```powershell
cd BackEnd/quarkus-api
```

### 5.2. Iniciar en modo desarrollo

```powershell
.\mvnw quarkus:dev
```

### 5.3. Esperar a que inicie (~60 segundos)

Deberías ver en la consola:
```
Listening on: http://0.0.0.0:8081
```

---

## ⚛️ Paso 6: Levantar Frontend (React + Vite)

### 6.1. Abrir una NUEVA terminal

```powershell
cd FrontEnd/frontend
```

### 6.2. Instalar dependencias (solo la primera vez)

```powershell
npm install
```

### 6.3. Iniciar el servidor de desarrollo

```powershell
npm run dev
```

### 6.4. Verificar

Frontend corriendo en: **http://localhost:5173**

---

## 🧪 Paso 7: Probar que Todo Funciona

### 7.1. Test de Login (desde PowerShell)

```powershell
$body = @{usuarioApp="carlos.test"; contrasena="test123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expiresIn": 300,
  "usuario": {
    "idUsuario": 1,
    "idEmpleado": 1,
    "usuarioApp": "carlos.test",
    "nombreCompleto": "Carlos Test",
    "correo": "carlos.test@datum.com"
  }
}
```

### 7.2. Test desde el Frontend

1. Abre **http://localhost:5173** en tu navegador
2. Ve a la página de Login
3. Ingresa:
   - **Usuario:** `carlos.test`
   - **Contraseña:** `test123`
4. Deberías poder iniciar sesión exitosamente

---

## 🎯 Resumen de Servicios

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:5173 | - |
| **Backend API** | http://localhost:8081 | - |
| **Keycloak Admin** | http://localhost:8180/admin | admin / admin |
| **Oracle XE** | localhost:1522/XEPDB1 | datum_user / datum2025 |

---

## 📚 Documentación Adicional

- **Integración Keycloak:** `BackEnd/keycloak/INTEGRACION_KEYCLOAK_QUARKUS.md`
- **Guía de Roles:** `BackEnd/keycloak/GUIA_ROLES.md`
- **Troubleshooting:** `BackEnd/keycloak/RESUMEN_FINAL_INTEGRACION.md`

---

## 🐛 Troubleshooting Común

### Backend no inicia - Error de Java Version

```powershell
# Configurar Java 21
.\set-java21.ps1
```

### Keycloak devuelve "Invalid client credentials"

- Verifica que el `client-secret` en `application.properties` (línea 105 y 160) coincida con el de Keycloak

### Error "Usuario no encontrado en BD local"

- Ejecuta el script: `BackEnd/scripts/insertar-usuario-test-keycloak.sql`

### Puerto 8081 ya en uso

```powershell
# Ver qué está usando el puerto
netstat -ano | Select-String ":8081"

# Matar el proceso Java anterior
Get-Process -Name java | Stop-Process -Force
```

---

## ✅ Checklist Final

Antes de empezar a trabajar, verifica que todo esté OK:

- [ ] Docker: Oracle + Keycloak corriendo
- [ ] Keycloak: Realm creado + Client configurado + Usuario creado
- [ ] Oracle: Tablas creadas + Usuario de prueba insertado
- [ ] Backend: Corriendo en puerto 8081
- [ ] Frontend: Corriendo en puerto 5173
- [ ] Login: Funciona con carlos.test / test123

---

**Si algo falla, consulta:** `BackEnd/keycloak/RESUMEN_FINAL_INTEGRACION.md`
