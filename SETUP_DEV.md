# 🚀 Setup Rápido - Datum Travels DEV

## ✅ Estado Actual

- ✅ **Oracle XE 21c** levantado en puerto **1522**
- ✅ **docker-compose-dev.yml** creado
- ⏳ Esperando que Oracle esté completamente listo (~1-2 minutos)

---

## 📋 Instrucciones de Uso

### 1️⃣ Levantar Oracle (Ya hecho ✅)

```powershell
docker-compose -f docker-compose-dev.yml up -d
```

### 2️⃣ Verificar que Oracle está listo

```powershell
# Ver estado del contenedor
docker ps | Select-String "datum-oracle"

# Ver logs en tiempo real
docker-compose -f docker-compose-dev.yml logs -f datum-db

# Verificar health status (debe decir "healthy")
docker inspect --format='{{.State.Health.Status}}' datum-oracle-dev
```

### 3️⃣ Iniciar Quarkus en modo DEV

```powershell
cd BackEnd\quarkus-api
.\mvnw quarkus:dev
```

Verás logs como:
```
Hibernate: create table Empleado (...)
Quarkus started on port 8080
```

### 4️⃣ Acceder a Swagger UI

```
http://localhost:8080/swagger-ui
```

---

## 🔌 Información de Conexión

### JDBC (para Quarkus)
```
URL: jdbc:oracle:thin:@localhost:1522/XEPDB1
Usuario: datum_user
Password: datum2025
```

### SQL Developer / DBeaver
```
Host: localhost
Port: 1522
Service: XEPDB1
Usuario: datum_user
Password: datum2025
```

### Conexión desde contenedor
```powershell
docker exec -it datum-oracle-dev sqlplus datum_user/datum2025@XEPDB1
```

---

## 🛠️ Comandos Útiles

### Docker Compose

```powershell
# Ver logs
docker-compose -f docker-compose-dev.yml logs -f

# Detener (mantiene datos)
docker-compose -f docker-compose-dev.yml down

# Detener y borrar datos
docker-compose -f docker-compose-dev.yml down -v

# Reiniciar
docker-compose -f docker-compose-dev.yml restart

# Ver estado
docker-compose -f docker-compose-dev.yml ps
```

### Quarkus

```powershell
# Modo desarrollo (hot reload)
.\mvnw quarkus:dev

# Compilar
.\mvnw clean package

# Tests
.\mvnw test

# Limpiar y recompilar
.\mvnw clean compile
```

---

## 📊 Arquitectura Actual

```
┌─────────────────────────────────────────────┐
│         Entorno de Desarrollo               │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │      Quarkus API (Puerto 8080)       │  │
│  │                                      │  │
│  │  - Endpoints REST                    │  │
│  │  - JWT Simple (sin Keycloak)         │  │
│  │  - Swagger UI                        │  │
│  └──────────┬───────────────────────────┘  │
│             │                               │
│             ↓                               │
│  ┌──────────────────────────────────────┐  │
│  │   Oracle XE 21c (Puerto 1522)        │  │
│  │                                      │  │
│  │  - Usuario: datum_user               │  │
│  │  - Database: XEPDB1                  │  │
│  │  - Tablas: Empleado, Evento, etc.    │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Próximos Pasos

### FASE 1 - Autenticación (En progreso 🔄)

Una vez Oracle esté listo:

1. ✅ Crear endpoints de autenticación
   - `POST /api/auth/login`
   - `POST /api/auth/logout`
   - `GET /api/auth/validate`

2. ✅ Implementar JWT Service
3. ✅ Crear DTOs de Request/Response
4. ✅ Probar con Swagger

### FASE 2 - Eventos
- Endpoints CRUD de eventos

### FASE 3 - Gastos
- Endpoints de gastos con comprobantes

### FASE 4 - OCR
- Integración con servicio OCR

---

## ⚠️ Troubleshooting

### Oracle no arranca

```powershell
# Ver logs detallados
docker-compose -f docker-compose-dev.yml logs datum-db

# Recrear contenedor
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d
```

### Puerto 1522 ocupado

```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :1522

# Cambiar puerto en docker-compose-dev.yml
ports:
  - "1523:1521"  # Usar 1523 en lugar de 1522

# Actualizar application.properties
quarkus.datasource.jdbc.url=jdbc:oracle:thin:@localhost:1523/XEPDB1
```

### Quarkus no conecta

1. Verificar que Oracle esté `healthy`:
   ```powershell
   docker inspect --format='{{.State.Health.Status}}' datum-oracle-dev
   ```

2. Verificar credenciales en `application.properties`

3. Ver logs de Quarkus para ver error específico

---

## 📝 Notas

- **JWT Secret**: Configurado en `application.properties` (cambiar en producción)
- **Hibernate**: Configurado en modo `drop-and-create` (borra y recrea tablas en cada inicio)
- **CORS**: Habilitado para puertos 5173 y 3000 (React/Vite)
- **Hot Reload**: Activado en Quarkus para desarrollo rápido

---

## 🔗 Links Útiles

- Swagger UI: http://localhost:8080/swagger-ui
- Health Check: http://localhost:8080/q/health
- Metrics: http://localhost:8080/q/metrics

---

**Creado el:** 19 de Octubre, 2025
**Estado:** Oracle levantándose... ⏳
