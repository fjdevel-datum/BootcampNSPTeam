# ⚡ Comandos Rápidos - Keycloak

## 🚀 Inicio Rápido

### Levantar todo el stack (automático)
```powershell
.\start-keycloak.ps1
```

### O manualmente:
```powershell
docker-compose -f docker-compose-dev.yml up -d
```

---

## 📦 Docker - Gestión de Servicios

### Ver estado de contenedores
```powershell
docker ps
docker ps -a  # Incluye detenidos
```

### Ver logs
```powershell
# Keycloak
docker logs -f datum-keycloak-dev

# Oracle
docker logs -f datum-oracle-dev

# Ambos
docker-compose -f docker-compose-dev.yml logs -f
```

### Reiniciar servicios
```powershell
# Solo Keycloak
docker restart datum-keycloak-dev

# Solo Oracle
docker restart datum-oracle-dev

# Todo
docker-compose -f docker-compose-dev.yml restart
```

### Detener servicios (mantiene datos)
```powershell
docker-compose -f docker-compose-dev.yml stop
```

### Iniciar servicios detenidos
```powershell
docker-compose -f docker-compose-dev.yml start
```

### Eliminar contenedores (mantiene datos)
```powershell
docker-compose -f docker-compose-dev.yml down
```

### Eliminar TODO (incluye volúmenes)
```powershell
# ⚠️ CUIDADO: Borra TODOS los datos
docker-compose -f docker-compose-dev.yml down -v
```

---

## 🔐 Keycloak - Acceso

### Consola de administración
- URL: <http://localhost:8180>
- Usuario: `admin`
- Password: `admin123`

### Verificar salud
```powershell
# Health check
curl http://localhost:8180/health

# Health ready
curl http://localhost:8180/health/ready

# Health live
curl http://localhost:8180/health/live
```

### Obtener token de acceso (después de configurar)
```powershell
$body = @{
    grant_type = "password"
    client_id = "datum-travels-backend"
    client_secret = "TU_CLIENT_SECRET"
    username = "carlos.test"
    password = "test123"
}

$response = Invoke-RestMethod `
    -Uri "http://localhost:8180/realms/datum-travels/protocol/openid-connect/token" `
    -Method Post `
    -Body $body `
    -ContentType "application/x-www-form-urlencoded"

# Ver token
$response.access_token
```

### Con cURL
```powershell
curl -X POST http://localhost:8180/realms/datum-travels/protocol/openid-connect/token `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "grant_type=password" `
  -d "client_id=datum-travels-backend" `
  -d "client_secret=TU_CLIENT_SECRET" `
  -d "username=carlos.test" `
  -d "password=test123"
```

---

## 🗄️ Oracle - Conexión

### Verificar conectividad
```powershell
Test-NetConnection -ComputerName localhost -Port 1522
```

### Conectar con SQL*Plus (si lo tienes instalado)
```powershell
sqlplus datum_user/datum2025@localhost:1522/XEPDB1
```

### String de conexión JDBC
```
jdbc:oracle:thin:@localhost:1522/XEPDB1
```

---

## ☕ Backend (Quarkus)

### Iniciar en modo desarrollo
```powershell
cd BackEnd\quarkus-api
mvn quarkus:dev
```

### Compilar sin ejecutar
```powershell
mvn clean compile
```

### Ejecutar tests
```powershell
mvn test
```

### Limpiar y compilar
```powershell
mvn clean package
```

### Acceder a Dev UI
- URL: <http://localhost:8080/q/dev-ui>

### Swagger UI
- URL: <http://localhost:8080/q/swagger-ui>

### Health check
- URL: <http://localhost:8080/q/health>

---

## ⚛️ Frontend (React)

### Iniciar servidor de desarrollo
```powershell
cd FrontEnd\frontend
npm run dev
```

### Instalar dependencias
```powershell
npm install
```

### Build para producción
```powershell
npm run build
```

### Preview de producción
```powershell
npm run preview
```

---

## 🧪 Testing - API Endpoints

### Login (después de configurar Keycloak)
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "usuarioApp": "carlos.test",
    "contrasena": "test123"
  }'
```

### Listar eventos (con token)
```powershell
$token = "TU_ACCESS_TOKEN"

curl -X GET http://localhost:8080/api/eventos `
  -H "Authorization: Bearer $token"
```

---

## 🐛 Troubleshooting

### Ver puertos en uso
```powershell
# Todos los puertos
netstat -ano | Select-String "LISTENING"

# Puertos específicos
netstat -ano | Select-String "8080|8180|1522|5173"
```

### Verificar procesos Java
```powershell
Get-Process java | Select-Object Id, ProcessName, Path
```

### Verificar procesos Node
```powershell
Get-Process node | Select-Object Id, ProcessName, Path
```

### Limpiar Maven cache
```powershell
mvn clean
mvn dependency:purge-local-repository
```

### Limpiar node_modules
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Verificar versión de Java
```powershell
java -version
```

### Ver JAVA_HOME
```powershell
$env:JAVA_HOME
```

---

## 🔄 Workflow Completo

### Primera vez del día
```powershell
# 1. Levantar infraestructura
.\start-keycloak.ps1

# 2. Iniciar backend (terminal 1)
cd BackEnd\quarkus-api
mvn quarkus:dev

# 3. Iniciar frontend (terminal 2)
cd FrontEnd\frontend
npm run dev
```

### Al terminar
```powershell
# 1. Ctrl+C en ambas terminales (backend y frontend)

# 2. Detener Docker (opcional, mantiene datos)
docker-compose -f docker-compose-dev.yml stop
```

---

## 📚 Documentación

### Abrir guías
```powershell
# Guía de configuración paso a paso
code BackEnd\keycloak\GUIA_CONFIGURACION.md

# Documentación completa de Keycloak
code BackEnd\keycloak\README.md

# Resumen de implementación
code KEYCLOAK_IMPLEMENTACION.md
```

---

## 🎯 URLs de Acceso Rápido

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Keycloak Console** | <http://localhost:8180> | admin / admin123 |
| **Backend Dev UI** | <http://localhost:8080/q/dev-ui> | - |
| **Backend Swagger** | <http://localhost:8080/q/swagger-ui> | - |
| **Backend Health** | <http://localhost:8080/q/health> | - |
| **Frontend** | <http://localhost:5173> | - |

---

## 💡 Tips

### Ver todos los logs en tiempo real
```powershell
docker-compose -f docker-compose-dev.yml logs -f --tail=100
```

### Ejecutar comando dentro de contenedor
```powershell
# Keycloak
docker exec -it datum-keycloak-dev bash

# Oracle
docker exec -it datum-oracle-dev bash
```

### Exportar configuración de Keycloak
```powershell
docker exec -it datum-keycloak-dev /opt/keycloak/bin/kc.sh export --dir /tmp --realm datum-travels
docker cp datum-keycloak-dev:/tmp/datum-travels-realm.json ./BackEnd/keycloak/realm-config/
```

### Copiar Client Secret rápidamente
```powershell
# Desde Keycloak Console > Clients > datum-travels-backend > Credentials
# Copiar el valor y ejecutar:

$secret = "TU_CLIENT_SECRET_COPIADO"
(Get-Content BackEnd\quarkus-api\src\main\resources\application.properties) `
  -replace 'keycloak.client-secret=.*', "keycloak.client-secret=$secret" |
  Set-Content BackEnd\quarkus-api\src\main\resources\application.properties
```

---

**¡Todo lo que necesitas en un solo archivo!** ⚡
