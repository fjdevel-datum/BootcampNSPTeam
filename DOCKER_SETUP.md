# 🐳 Guía de Docker - Datum Travels

## 📦 Servicios Dockerizados

- **PostgreSQL** - Base de datos para Keycloak
- **Keycloak** - Servidor de autenticación

**Nota:** Oracle XE corre **localmente** en tu máquina para mejor rendimiento.

---

## 🚀 Inicio Rápido

### 1️⃣ Iniciar servicios

```powershell
# Desde la raíz del proyecto
cd "c:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final"

# Iniciar servicios en background
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f keycloak
```

### 2️⃣ Verificar que estén corriendo

```powershell
# Ver estado de contenedores
docker-compose ps

# Deberías ver:
# - datum-postgres-keycloak (healthy)
# - datum-keycloak (healthy)
```

### 3️⃣ Acceder a Keycloak Admin Console

**URL:** http://localhost:8180

**Credenciales:**
- Usuario: `admin`
- Password: `admin123`

---

## ⚙️ Comandos Útiles

### Ver logs
```powershell
# Logs de todos los servicios
docker-compose logs

# Logs de Keycloak en tiempo real
docker-compose logs -f keycloak

# Logs de PostgreSQL
docker-compose logs -f postgres-keycloak

# Últimas 100 líneas
docker-compose logs --tail=100 keycloak
```

### Reiniciar servicios
```powershell
# Reiniciar todo
docker-compose restart

# Reiniciar solo Keycloak
docker-compose restart keycloak

# Reiniciar solo PostgreSQL
docker-compose restart postgres-keycloak
```

### Detener servicios
```powershell
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores (mantiene datos)
docker-compose down

# Detener y eliminar TODO (incluye datos)
docker-compose down -v
```

### Estado y diagnóstico
```powershell
# Ver contenedores activos
docker-compose ps

# Ver uso de recursos
docker stats

# Inspeccionar un contenedor
docker inspect datum-keycloak
```

---

## 🔧 Solución de Problemas

### ❌ Error: "Puerto 8180 ya en uso"

```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8180

# Matar el proceso (reemplaza PID)
taskkill /PID <número> /F

# O cambiar el puerto en docker-compose.yml:
# ports:
#   - "8181:8080"  # Usar puerto 8181 en vez de 8180
```

### ❌ Error: "Puerto 5432 ya en uso"

Si tienes PostgreSQL local instalado:

```yaml
# Cambiar puerto en docker-compose.yml:
postgres-keycloak:
  ports:
    - "5433:5432"  # Usar puerto 5433
```

### ❌ Keycloak no inicia / Se queda cargando

```powershell
# Ver los logs detallados
docker-compose logs keycloak

# Reiniciar desde cero
docker-compose down
docker-compose up -d

# Esperar 1-2 minutos (es normal que tarde)
```

### ❌ Error de conexión a PostgreSQL

```powershell
# Verificar que PostgreSQL esté healthy
docker-compose ps

# Si no está healthy, reiniciar
docker-compose restart postgres-keycloak

# Esperar 10 segundos y verificar
docker-compose ps
```

### 🔄 Empezar desde cero (limpiar todo)

```powershell
# Detener y eliminar contenedores + volúmenes + redes
docker-compose down -v

# Limpiar imágenes huérfanas (opcional)
docker image prune -f

# Iniciar nuevamente
docker-compose up -d
```

---

## 📊 Recursos del Sistema

### Consumo esperado:
- **PostgreSQL:** ~50 MB RAM
- **Keycloak:** ~500-700 MB RAM
- **Disco:** ~800 MB
- **Total:** ~800 MB RAM

### Comparación con Oracle en Docker:
| Servicio | RAM | Disco |
|----------|-----|-------|
| Oracle XE (Docker) | 2-4 GB | 8 GB |
| Keycloak + PostgreSQL | 800 MB | 800 MB |
| **Ahorro** | **70-80%** | **90%** |

---

## 🎯 Próximos Pasos

Después de levantar los servicios:

1. ✅ Acceder a Keycloak Admin Console
2. ⏳ Crear Realm "datum-travels"
3. ⏳ Crear Client "datum-travels-backend"
4. ⏳ Crear usuarios de prueba
5. ⏳ Probar autenticación desde Quarkus

---

## 📝 Notas Importantes

### Oracle XE Local
- **NO** está en Docker
- Corre localmente en `localhost:1521`
- Connection: `jdbc:oracle:thin:@localhost:1521/XEPDB1`
- Usuario: `datum_user` / `datum2025`

### PostgreSQL de Keycloak
- **SOLO** para Keycloak
- Tu aplicación Quarkus **NO** se conecta aquí
- Puerto: `5432` (o `5433` si cambiaste)

### Keycloak
- Admin Console: http://localhost:8180
- URL de autenticación: http://localhost:8180/realms/datum-travels
- Usuarios admin: `admin` / `admin123`

---

## 🐛 Depuración Avanzada

### Entrar al contenedor de Keycloak
```powershell
docker exec -it datum-keycloak bash

# Dentro del contenedor:
cd /opt/keycloak
ls -la
```

### Entrar al contenedor de PostgreSQL
```powershell
docker exec -it datum-postgres-keycloak psql -U keycloak -d keycloak

# Dentro de PostgreSQL:
\dt  # Ver tablas
\l   # Ver bases de datos
\q   # Salir
```

### Ver variables de entorno
```powershell
docker exec datum-keycloak env
```

---

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Keycloak Docker Guide](https://www.keycloak.org/server/containers)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

---

**¿Problemas?** Revisa los logs: `docker-compose logs -f keycloak`
