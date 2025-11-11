# 🚀 Guía de Configuración Inicial - Datum Travels

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Clonar el Repositorio](#clonar-el-repositorio)
3. [Configuración de Base de Datos Oracle](#configuración-de-base-de-datos-oracle)
4. [Configuración del Backend (Quarkus)](#configuración-del-backend-quarkus)
5. [Configuración del OCR Service](#configuración-del-ocr-service)
6. [Configuración del Frontend (React)](#configuración-del-frontend-react)
7. [Levantar Servicios con Docker](#levantar-servicios-con-docker)
8. [Ejecutar la Aplicación](#ejecutar-la-aplicación)
9. [Verificación Final](#verificación-final)
10. [Problemas Comunes](#problemas-comunes)

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### Software Obligatorio
- ✅ **Git** (2.x o superior)
- ✅ **Docker Desktop** (con Docker Compose)
- ✅ **Java 21** (JDK - Amazon Corretto, Eclipse Temurin, u Oracle JDK)
- ✅ **Maven 3.8+** (o usar los wrappers incluidos: `mvnw`)
- ✅ **Node.js 20+** (LTS) y **npm 10+**

### Software Recomendado
- 🔧 **IDE:** IntelliJ IDEA, VS Code o Eclipse
- 🔧 **SQL Developer** o **DBeaver** (para gestión de Oracle)
- 🔧 **Postman** o **Thunder Client** (para testing de APIs)

### Verificar Instalaciones

```powershell
# Verificar versiones instaladas
git --version          # Git version 2.x
docker --version       # Docker version 24.x+
docker-compose --version
java -version          # Java 21
mvn -version           # Apache Maven 3.8+
node -v                # v20.x+
npm -v                 # 10.x+
```

---

## 📥 Clonar el Repositorio

```powershell
# 1. Navegar a tu carpeta de proyectos
cd C:\Users\TU_USUARIO\Documents\Proyectos

# 2. Clonar el repositorio
git clone https://github.com/fjdevel-datum/BootcampNSPTeam.git

# 3. Ingresar al directorio
cd BootcampNSPTeam

# 4. Cambiar a la rama de desarrollo
git checkout carlos

# 5. Verificar la estructura
dir
```

Deberías ver esta estructura:
```
BootcampNSPTeam/
├── BackEnd/
├── FrontEnd/
├── keycloak/
├── ocr-quarkus/
├── scripts/
├── docker-compose-dev.yml
├── BD DATUM FINAL.sql
└── README.md
```

---

## 🗄️ Configuración de Base de Datos Oracle

### Paso 1: Levantar Oracle con Docker

```powershell
# Desde la raíz del proyecto
docker-compose -f docker-compose-dev.yml up -d datum-db

# Esperar 2-3 minutos para que Oracle termine de inicializarse
docker logs -f datum-oracle-dev
```

**✅ Oracle está listo cuando veas:**
```
DATABASE IS READY TO USE!
```

### Paso 2: Conectar y Crear el Usuario

```powershell
# Conectar al contenedor Oracle
docker exec -it datum-oracle-dev sqlplus sys/oracle2025@XEPDB1 as sysdba
```

Dentro de SQLPlus, ejecutar:

```sql
-- Crear el usuario de la aplicación
CREATE USER datum_user IDENTIFIED BY datum2025
  DEFAULT TABLESPACE users
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON users;

-- Otorgar permisos necesarios
GRANT CONNECT, RESOURCE TO datum_user;
GRANT CREATE SESSION TO datum_user;
GRANT CREATE TABLE TO datum_user;
GRANT CREATE VIEW TO datum_user;
GRANT CREATE SEQUENCE TO datum_user;

-- Verificar usuario creado
SELECT username FROM dba_users WHERE username = 'DATUM_USER';

-- Salir
EXIT;
```

### Paso 3: Crear las Tablas del Sistema

```powershell
# Conectar como datum_user
docker exec -it datum-oracle-dev sqlplus datum_user/datum2025@XEPDB1
```

```sql
-- Copiar y pegar el contenido completo del archivo BD DATUM FINAL.sql
-- (Ubicado en la raíz del proyecto)

-- El archivo contiene las siguientes tablas:
-- ✓ Departamento
-- ✓ Cargo
-- ✓ Pais
-- ✓ Empresa
-- ✓ Empleado
-- ✓ Usuario
-- ✓ Tarjeta
-- ✓ Evento
-- ✓ Adelanto_Viatico
-- ✓ Liquidacion_Viatico
-- ✓ Categoria_Gasto
-- ✓ Gasto

-- Verificar tablas creadas
SELECT table_name FROM user_tables ORDER BY table_name;

EXIT;
```

### Paso 4: Verificar Conexión desde SQL Developer (Opcional)

Si usas SQL Developer:
- **Host:** `localhost`
- **Puerto:** `1522`
- **Service Name:** `XEPDB1`
- **Usuario:** `datum_user`
- **Contraseña:** `datum2025`

---

## 🔧 Configuración del Backend (Quarkus)

### Paso 1: Configurar Variables de Entorno

```powershell
# Navegar a la carpeta del backend
cd BackEnd\quarkus-api
```

**Crear archivo `.env`** copiando desde `.env.example`:

```powershell
# Windows PowerShell
Copy-Item .env.example .env

# Editar el archivo .env con tu editor favorito
notepad .env
```

**Contenido del archivo `.env`** (completar con tus credenciales):

```env
# ============================================================================
# KEYCLOAK - Autenticación
# ============================================================================
KEYCLOAK_ADMIN_URL=http://localhost:8180
KEYCLOAK_ADMIN_REALM=datum-travels
KEYCLOAK_ADMIN_AUTH_REALM=datum-travels
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
KEYCLOAK_ADMIN_DEFAULT_ROLE=usuario

# ============================================================================
# API de Conversión de Monedas (exchangerate-api.com)
# ============================================================================
# Registrarse gratis en: https://www.exchangerate-api.com/
# Plan gratuito: 1,500 requests/mes
EXCHANGERATE_API_KEY=TU_API_KEY_AQUI
EXCHANGERATE_API_URL=https://v6.exchangerate-api.com/v6

# ============================================================================
# SMTP - Configuración de Email para Reportes
# ============================================================================
# Para Gmail: Generar App Password en https://myaccount.google.com/apppasswords
SMTP_FROM=tu-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=TU_APP_PASSWORD_AQUI

# Mock Mode: true = no envía correos reales (recomendado para desarrollo)
MAILER_MOCK=true

# ============================================================================
# AZURE STORAGE - Para almacenar imágenes de comprobantes
# ============================================================================
# Obtener en Azure Portal → Storage Account → Access Keys
AZURE_STORAGE_ACCOUNT_NAME=storageocr2025
AZURE_STORAGE_ACCOUNT_KEY=TU_AZURE_KEY_AQUI
AZURE_STORAGE_CONTAINER_NAME=ocr-files
```

### Paso 2: Compilar el Backend

```powershell
# Windows (usando el wrapper incluido)
.\mvnw.cmd clean package -DskipTests

# O con Maven instalado globalmente
mvn clean package -DskipTests
```

**⏳ Tiempo estimado:** 3-5 minutos en la primera compilación (descarga dependencias).

**✅ Compilación exitosa si ves:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX:XX min
```

---

## 🔍 Configuración del OCR Service

### Paso 1: Configurar Variables de Entorno

```powershell
# Navegar a la carpeta del OCR
cd ..\..\ocr-quarkus
```

**Crear archivo `.env`** (o editar `application-dev.properties`):

```powershell
# Opción 1: Usar application-dev.properties (recomendado)
notepad src\main\resources\application-dev.properties
```

**Contenido de `application-dev.properties`:**

```properties
# ============================================================================
# Azure Document Intelligence (OCR)
# ============================================================================
# Obtener en Azure Portal → Document Intelligence → Keys and Endpoint
azure.docintel.key=TU_AZURE_DOCINTEL_KEY_AQUI

# ============================================================================
# Hugging Face (Modelo de IA para procesamiento de texto)
# ============================================================================
# Registrarse gratis en: https://huggingface.co/settings/tokens
hf.token=TU_HUGGING_FACE_TOKEN_AQUI

# ============================================================================
# Base de datos Oracle (mismas credenciales)
# ============================================================================
quarkus.datasource.password=datum2025

# ============================================================================
# Azure Storage (mismas credenciales que el backend)
# ============================================================================
azure.storage.account-key=TU_AZURE_KEY_AQUI
```

### Paso 2: Compilar el OCR Service

```powershell
# Compilar
.\mvnw.cmd clean package -DskipTests
```

---

## 🎨 Configuración del Frontend (React)

### Paso 1: Instalar Dependencias

```powershell
# Navegar a la carpeta del frontend
cd ..\FrontEnd\frontend

# Instalar paquetes de Node.js
npm install
```

**⏳ Tiempo estimado:** 2-4 minutos.

### Paso 2: Configurar Variables de Entorno

**Crear archivo `.env`** copiando desde `.env.example`:

```powershell
Copy-Item .env.example .env

# Editar el archivo
notepad .env
```

**Contenido del archivo `.env`:**

```env
# ============================================================================
# Backend API URLs
# ============================================================================
# URL del backend principal (Quarkus - puerto 8081)
VITE_API_URL=http://localhost:8081/api

# URL del servicio OCR (Quarkus OCR - puerto 8080)
VITE_OCR_API_URL=http://localhost:8080/api

# ============================================================================
# Keycloak - Autenticación
# ============================================================================
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=datum-travels
VITE_KEYCLOAK_CLIENT_ID=datum-travels-frontend

# ============================================================================
# Configuración de Proxy para Desarrollo
# ============================================================================
# Estas variables las usa vite.config.ts para configurar el proxy
VITE_PROXY_BACKEND=http://localhost:8081
VITE_PROXY_OCR=http://localhost:8080
```

---

## 🐳 Levantar Servicios con Docker

### Paso 1: Levantar Todos los Servicios

```powershell
# Volver a la raíz del proyecto
cd ..\..

# Levantar Oracle, OpenKM y Keycloak
docker-compose -f docker-compose-dev.yml up -d
```

### Paso 2: Verificar Estado de Contenedores

```powershell
# Ver todos los contenedores corriendo
docker-compose -f docker-compose-dev.yml ps
```

**✅ Deberías ver estos servicios:**
```
NAME                    STATUS          PORTS
datum-oracle-dev        Up (healthy)    0.0.0.0:1522->1521/tcp
datum-keycloak-dev      Up (healthy)    0.0.0.0:8180->8080/tcp
datum-openkm-db         Up (healthy)    0.0.0.0:1523->1521/tcp
datum-openkm            Up              0.0.0.0:8087->8080/tcp
```

### Paso 3: Verificar Keycloak

```powershell
# Esperar 90 segundos para que Keycloak termine de configurarse
Start-Sleep -Seconds 90

# Abrir navegador
Start-Process http://localhost:8180
```

**Credenciales de Keycloak:**
- **URL:** http://localhost:8180
- **Username:** `admin`
- **Password:** `admin123`

**✅ Verificar que existe el Realm `datum-travels`:**
1. Hacer clic en el dropdown (arriba izquierda)
2. Debe aparecer **"datum-travels"**
3. Dentro del realm, verificar:
   - Roles: `admin`, `usuario`
   - Client: `datum-travels-frontend`

---

## ▶️ Ejecutar la Aplicación

### Terminal 1: Backend Principal (Puerto 8081)

```powershell
# Abrir PowerShell/Terminal
cd BackEnd\quarkus-api

# Ejecutar en modo desarrollo
.\mvnw.cmd quarkus:dev
```

**✅ Backend listo cuando veas:**
```
Listening on: http://0.0.0.0:8081
```

**URLs disponibles:**
- API: http://localhost:8081/api
- Swagger UI: http://localhost:8081/swagger-ui

---

### Terminal 2: OCR Service (Puerto 8080)

```powershell
# Abrir OTRA PowerShell/Terminal
cd ocr-quarkus

# Ejecutar en modo desarrollo
.\mvnw.cmd quarkus:dev
```

**✅ OCR listo cuando veas:**
```
Listening on: http://0.0.0.0:8080
```

---

### Terminal 3: Frontend (Puerto 5173)

```powershell
# Abrir OTRA PowerShell/Terminal
cd FrontEnd\frontend

# Ejecutar servidor de desarrollo
npm run dev
```

**✅ Frontend listo cuando veas:**
```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.X.X:5173/
```

**Abrir navegador:**
```powershell
Start-Process http://localhost:5173
```

---

## ✅ Verificación Final

### 1. Verificar Servicios Docker

```powershell
docker-compose -f docker-compose-dev.yml ps
```

**Todos deben estar `Up (healthy)` excepto `openkm-bootstrap` que es `Exit 0`.**

### 2. Verificar Aplicaciones

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:5173 | (Se crean desde la UI) |
| **Backend API** | http://localhost:8081/api | - |
| **OCR Service** | http://localhost:8080/api | - |
| **Swagger Backend** | http://localhost:8081/swagger-ui | - |
| **Keycloak Admin** | http://localhost:8180 | admin / admin123 |
| **OpenKM** | http://localhost:8087/OpenKM | okmAdmin / admin |
| **Oracle DB** | localhost:1522/XEPDB1 | datum_user / datum2025 |

### 3. Crear Usuario de Prueba (Opcional)

Desde el Frontend:
1. Ir a http://localhost:5173
2. Si hay pantalla de Login, crear usuario desde la UI de Administrador
3. O usar Keycloak Admin Console para crear usuarios manualmente

---

## 🆘 Problemas Comunes

### ❌ Error: "Cannot connect to Oracle database"

**Solución:**
```powershell
# Verificar que Oracle esté corriendo
docker logs datum-oracle-dev

# Reiniciar Oracle
docker-compose -f docker-compose-dev.yml restart datum-db

# Esperar 2 minutos y verificar
docker exec -it datum-oracle-dev sqlplus datum_user/datum2025@XEPDB1
```

---

### ❌ Error: "Port 8081 already in use"

**Solución:**
```powershell
# Buscar proceso usando el puerto
netstat -ano | findstr :8081

# Matar proceso (reemplazar PID)
taskkill /PID NUMERO_PID /F

# O cambiar el puerto en application.properties
# quarkus.http.port=8082
```

---

### ❌ Error: "Keycloak realm datum-travels not found"

**Solución:**
```powershell
# Borrar datos de Keycloak y empezar limpio
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d datum-keycloak

# Esperar 90 segundos
Start-Sleep -Seconds 90

# Verificar en http://localhost:8180
```

---

### ❌ Error: "CORS policy error" en Frontend

**Solución:**

Verificar que el Backend tenga habilitado CORS en `application.properties`:

```properties
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:5173
```

Reiniciar el Backend:
```powershell
# Ctrl+C en la terminal del backend
.\mvnw.cmd quarkus:dev
```

---

### ❌ Error: "npm install fails"

**Solución:**
```powershell
# Limpiar caché y reinstalar
cd FrontEnd\frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install
```

---

### ❌ Error: "Maven dependencies not downloading"

**Solución:**
```powershell
# Limpiar repositorio local de Maven
cd BackEnd\quarkus-api
.\mvnw.cmd clean
Remove-Item -Recurse -Force target
.\mvnw.cmd dependency:purge-local-repository
.\mvnw.cmd clean package -DskipTests
```

---

## 📚 Recursos Adicionales

### Documentación del Proyecto
- **Keycloak Quick Setup:** `keycloak/QUICK_SETUP.md`
- **Keycloak Guía para Devs:** `keycloak/GUIA_DEVS_NUEVOS.md`
- **Backend README:** `BackEnd/quarkus-api/README.md`
- **Frontend README:** `FrontEnd/frontend/README.md`

### Documentación Externa
- [Quarkus Guides](https://quarkus.io/guides/)
- [React Documentation](https://react.dev/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Oracle XE Documentation](https://docs.oracle.com/en/database/oracle/oracle-database/21/index.html)

---

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. ✅ **Familiarízate con la arquitectura:**
   - Lee `.github/copilot-instructions.md`
   - Revisa la estructura de carpetas de Backend y Frontend

2. ✅ **Prueba las funcionalidades:**
   - Crear un Evento de viaje
   - Agregar gastos con comprobantes
   - Generar reportes Excel

3. ✅ **Configura tu IDE:**
   - Importa los proyectos Maven (Backend y OCR)
   - Configura ESLint y Prettier para Frontend

4. ✅ **Únete al flujo de trabajo:**
   - Crea una nueva rama desde `carlos`
   - Sigue las convenciones de commit del equipo

---

## 📞 Soporte

Si encuentras problemas que no están documentados aquí:

1. Revisa los logs de Docker: `docker logs NOMBRE_CONTENEDOR`
2. Revisa los logs de Quarkus en la terminal
3. Consulta con el equipo de desarrollo
4. Crea un issue en el repositorio con:
   - Descripción del error
   - Logs relevantes
   - Pasos para reproducir

---

**¡Bienvenido al equipo! 🚀**

*Última actualización: Noviembre 2025*
