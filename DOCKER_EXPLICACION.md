# 🐋 Docker en Datum Travels - Guía Completa

## 📋 Índice
1. [¿Por qué usar Docker?](#por-qué-usar-docker)
2. [Arquitectura de Servicios](#arquitectura-de-servicios)
3. [Los 4 Servicios Dockerizados](#los-4-servicios-dockerizados)
4. [Ventajas en el Proyecto](#ventajas-en-el-proyecto)
5. [Comandos Útiles](#comandos-útiles)

---

## 🎯 ¿Por qué usar Docker?

### Problema Sin Docker
Imagina que cada desarrollador del equipo tiene que:

```
❌ Instalar Oracle Database (5GB+)
❌ Configurar Keycloak manualmente
❌ Instalar OpenKM y dependencias
❌ Asegurar que todos usen las MISMAS versiones
❌ Configurar puertos, usuarios, contraseñas
❌ Resolver conflictos entre servicios
```

**Resultado**: Días de configuración, errores de "en mi máquina funciona" 😫

### Solución Con Docker

```
✅ docker-compose up -d
✅ Esperar 2 minutos
✅ ¡Listo para desarrollar!
```

**Resultado**: Todo el equipo trabaja con el **mismo ambiente**, sin importar si usan Windows, Mac o Linux.

---

## 🏗️ Arquitectura de Servicios

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATUM TRAVELS APPLICATION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Frontend   │    │   Backend    │    │  OCR Service │      │
│  │  React+Vite  │───▶│   Quarkus    │───▶│   Quarkus    │      │
│  │  Port: 5173  │    │  Port: 8080  │    │  Port: 8081  │      │
│  └──────────────┘    └──────┬───────┘    └──────┬───────┘      │
│                             │                    │              │
│                             ▼                    ▼              │
├─────────────────────────────────────────────────────────────────┤
│                    🐋 DOCKER COMPOSE LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ datum-db     │  │ openkm-db    │  │ datum-       │          │
│  │ Oracle XE    │  │ Oracle XE    │  │ keycloak     │          │
│  │ Port: 1522   │  │ Port: 1523   │  │ Port: 8180   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                    Network: datum-network                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  openkm      │  │ openkm-      │                             │
│  │  Port: 8087  │◀─│ bootstrap    │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Los 4 Servicios Dockerizados

### 1️⃣ **datum-db** - Base de Datos Principal Oracle

```yaml
imagen: gvenzl/oracle-xe:21-slim
puerto: 1522 → 1521 (interno)
```

#### ¿Para qué sirve?
Es la **base de datos principal** de Datum Travels. Aquí se almacena:

- ✅ **Empleados**: Usuarios del sistema, sus tarjetas corporativas
- ✅ **Eventos**: Viajes de negocios y gastos de representación
- ✅ **Gastos**: Cada transacción con su comprobante
- ✅ **Países y Catálogos**: Configuraciones de viáticos, correos de contabilidad
- ✅ **Reportes**: Histórico de reportes generados en PDF/Excel

#### Configuración Clave
```yaml
ORACLE_PASSWORD: oracle2025        # Contraseña del SYSTEM/SYS
APP_USER: datum_user               # Usuario de aplicación
APP_USER_PASSWORD: datum2025       # Contraseña de datum_user
ORACLE_DATABASE: XEPDB1            # Nombre del Pluggable Database
```

#### ¿Por qué Oracle?
- Requerimiento empresarial (muchas empresas usan Oracle)
- Robustez para transacciones financieras
- Soporte para grandes volúmenes de datos
- Funciones avanzadas de reporting

#### Conexión desde el Backend
```properties
# application.properties (Quarkus)
quarkus.datasource.jdbc.url=jdbc:oracle:thin:@localhost:1522/XEPDB1
quarkus.datasource.username=datum_user
quarkus.datasource.password=datum2025
```

---

### 2️⃣ **openkm-db** - Base de Datos de OpenKM

```yaml
imagen: gvenzl/oracle-xe:21-slim
puerto: 1523 → 1521 (interno)
```

#### ¿Para qué sirve?
Es la base de datos **exclusiva para OpenKM** (el gestor documental). Almacena:

- ✅ **Metadatos** de documentos (nombre, tamaño, tipo MIME)
- ✅ **Estructura de carpetas** del repositorio
- ✅ **Versiones** de documentos
- ✅ **Índices de búsqueda** para OCR

#### ¿Por qué una BD separada?
```
📂 Separación de Responsabilidades:
   ├─ datum-db      → Datos de negocio (Eventos, Gastos, Empleados)
   └─ openkm-db     → Datos documentales (Facturas, Tickets escaneados)

💡 Ventajas:
   ✓ Backups independientes
   ✓ No mezclar lógica de negocio con lógica documental
   ✓ Escalabilidad: si OpenKM crece, no afecta a datum-db
```

---

### 3️⃣ **datum-keycloak** - Servidor de Autenticación

```yaml
imagen: quay.io/keycloak/keycloak:26.0.7
puerto: 8180 → 8080 (interno)
```

#### ¿Para qué sirve?
Es el **guardián de seguridad** de Datum Travels. Gestiona:

- ✅ **Autenticación** (Login/Logout)
- ✅ **Autorización** (Roles: empleado, administrador, contabilidad)
- ✅ **Tokens JWT** para comunicación segura Frontend ↔ Backend
- ✅ **Single Sign-On (SSO)**: Un login para toda la aplicación

#### Roles en Datum Travels
```
┌─────────────────────────────────────────────────────────┐
│ KEYCLOAK REALM: datum-travels                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  👤 empleado          → Crear eventos, registrar gastos │
│  👨‍💼 administrador     → Gestión completa del sistema    │
│  📊 contabilidad      → Ver reportes, aprobar gastos    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Flujo de Autenticación
```
1. Usuario ingresa credenciales en React
   │
   ▼
2. Frontend envía a Keycloak (http://localhost:8180)
   │
   ▼
3. Keycloak valida y devuelve JWT
   │
   ▼
4. React guarda JWT en memoria
   │
   ▼
5. Cada petición al Backend incluye JWT en header
   │
   ▼
6. Quarkus valida JWT contra Keycloak
   │
   ▼
7. Si es válido, procesa la petición
```

#### Configuración Importante
```yaml
KEYCLOAK_ADMIN: admin
KEYCLOAK_ADMIN_PASSWORD: admin2025
KC_HTTP_ENABLED: "true"              # ⚠️ Solo para DEV
KC_PROXY: "edge"                     # Para usar detrás de proxy
--import-realm                       # Importa datum-travels-realm.json
```

#### ¿Por qué NO hacer autenticación manual?
```
❌ SIN Keycloak:
   - Programar login/logout
   - Crear sistema de roles
   - Gestionar sesiones
   - Encriptar contraseñas
   - Implementar refresh tokens
   - Seguridad = tu responsabilidad 😰

✅ CON Keycloak:
   - Todo lo anterior YA HECHO
   - Estándar industrial (OAuth 2.0 / OIDC)
   - Auditado por miles de empresas
   - Actualizaciones de seguridad automáticas
```

---

### 4️⃣ **openkm + openkm-bootstrap** - Gestor Documental

```yaml
imagen: openkm/openkm-ce:latest
puerto: 8087 → 8080 (interno)
```

#### ¿Para qué sirve?
Es el **almacén de documentos** de Datum Travels. Funciona como un Google Drive empresarial que:

- ✅ **Almacena fotos** de facturas/tickets que suben los empleados
- ✅ **Ejecuta OCR** (Optical Character Recognition) para extraer texto de imágenes
- ✅ **Indexa documentos** para búsqueda rápida
- ✅ **Versionado** de archivos (si un comprobante se reemplaza, se guarda la versión anterior)

#### Flujo de Carga de Comprobante
```
1. Empleado toma foto de factura desde su celular
   │
   ▼
2. Frontend (React) envía imagen a OCR Service (Quarkus)
   │
   ▼
3. OCR Service sube imagen a OpenKM vía API REST
   │
   ▼
4. OpenKM ejecuta OCR (Tesseract) y extrae:
   - NIT
   - Monto
   - Fecha
   - Establecimiento
   │
   ▼
5. OCR Service devuelve JSON al Frontend
   {
     "nit": "0614-123456-001-2",
     "total": 15.50,
     "fecha": "2025-11-06",
     "establecimiento": "Restaurante La Pampa"
   }
   │
   ▼
6. Frontend pre-llena el formulario de gasto
   │
   ▼
7. Empleado confirma y Backend guarda en datum-db
```

#### openkm-bootstrap: El Inicializador
Este servicio **se ejecuta una sola vez** para:
- Crear carpetas base en OpenKM (`/okm:root/datum-travels/comprobantes`)
- Insertar configuraciones iniciales
- Configurar permisos de acceso
- Luego se detiene automáticamente (`restart: "no"`)

#### ¿Por qué NO guardar imágenes en Oracle?
```
❌ Guardar PDFs/JPGs en Oracle (BLOB):
   - Degrada performance de consultas
   - Backups lentos y pesados
   - Difícil de escalar
   - Oracle cobra por tamaño de BD

✅ Guardar en OpenKM:
   - Optimizado para documentos
   - OCR integrado
   - Búsqueda full-text
   - Gestión de versiones
   - Oracle solo guarda la URL: 
     /okm:root/datum-travels/comprobantes/2025/11/factura-123.jpg
```

---

## 💎 Ventajas en el Proyecto

### 1. **Portabilidad Total**
```bash
# Desarrollador nuevo en el equipo:
git clone https://github.com/fjdevel-datum/BootcampNSPTeam
cd "Proyecto Final"
docker-compose -f docker-compose-dev.yml up -d

# ¡Listo! En 3 minutos tiene todo funcionando
```

### 2. **Ambientes Idénticos**
```
👨‍💻 Carlos (Windows) → Oracle 21c + Keycloak 26.0.7
👩‍💻 María (MacOS)   → Oracle 21c + Keycloak 26.0.7
👨‍💻 Pedro (Linux)   → Oracle 21c + Keycloak 26.0.7

= Cero errores de "en mi máquina funciona"
```

### 3. **Aislamiento de Servicios**
```
Si Oracle falla → Solo se cae datum-db
Si Keycloak falla → Solo autenticación no funciona
Si OpenKM falla → Solo carga de documentos afectada

= El resto de la app sigue corriendo
```

### 4. **Fácil Reseteo**
```bash
# Borrar TODO y empezar de cero:
docker-compose -f docker-compose-dev.yml down -v

# Volver a levantar:
docker-compose -f docker-compose-dev.yml up -d

# ¡Como nuevo en 2 minutos!
```

### 5. **Persistencia de Datos**
```yaml
volumes:
  datum_db_data:           # Los datos de Oracle sobreviven a reinicios
  datum_keycloak_data:     # Los usuarios de Keycloak se mantienen
```

Aunque pares los contenedores con `docker-compose down`, los datos **NO se pierden**.

### 6. **Networking Automático**
```yaml
networks:
  datum-network:
```

Todos los servicios pueden comunicarse entre sí:
- `openkm` puede hablar con `openkm-db`
- `datum-keycloak` puede ser consultado por Quarkus
- Sin configurar rutas complejas

---

## 🎮 Comandos Útiles

### Levantar Servicios
```bash
# Levantar TODO en background
docker-compose -f docker-compose-dev.yml up -d

# Levantar solo Oracle
docker-compose -f docker-compose-dev.yml up -d datum-db

# Levantar con logs en tiempo real
docker-compose -f docker-compose-dev.yml up
```

### Ver Estado
```bash
# Ver qué está corriendo
docker-compose -f docker-compose-dev.yml ps

# Ver logs de un servicio
docker-compose -f docker-compose-dev.yml logs -f datum-db
docker-compose -f docker-compose-dev.yml logs -f datum-keycloak

# Ver logs de todos
docker-compose -f docker-compose-dev.yml logs -f
```

### Detener/Reiniciar
```bash
# Detener TODO (los datos se mantienen)
docker-compose -f docker-compose-dev.yml down

# Detener y BORRAR datos (volúmenes)
docker-compose -f docker-compose-dev.yml down -v

# Reiniciar un servicio
docker-compose -f docker-compose-dev.yml restart datum-keycloak
```

### Acceder a Contenedores
```bash
# Entrar al contenedor de Oracle
docker exec -it datum-oracle-dev bash

# Conectarse con SQLPlus
docker exec -it datum-oracle-dev sqlplus datum_user/datum2025@XEPDB1

# Entrar a Keycloak
docker exec -it datum-keycloak-dev bash
```

### Verificar Salud
```bash
# Ver health checks
docker inspect datum-oracle-dev | grep -A 10 Health
docker inspect datum-keycloak-dev | grep -A 10 Health
```

---

## 🔗 URLs de Acceso

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Keycloak Admin** | http://localhost:8180 | admin / admin2025 |
| **OpenKM** | http://localhost:8087/OpenKM | okmAdmin / admin |
| **Oracle (datum-db)** | localhost:1522/XEPDB1 | datum_user / datum2025 |
| **Oracle (openkm-db)** | localhost:1523/XEPDB1 | OKM / okm |

---

## 📊 Resumen Visual

```
┌────────────────────────────────────────────────────────────────┐
│                   ¿QUÉ HACE CADA SERVICIO?                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  datum-db          → Guarda empleados, eventos, gastos         │
│  openkm-db         → Guarda metadatos de documentos            │
│  datum-keycloak    → Autentica usuarios y genera tokens        │
│  openkm            → Almacena PDFs/JPGs y ejecuta OCR          │
│  openkm-bootstrap  → Inicializa OpenKM (corre 1 sola vez)      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Conclusión

**Docker transforma** el caos de instalar y configurar 4 tecnologías diferentes en:

```bash
docker-compose up -d
```

Un solo comando que:
- ✅ Instala Oracle Database (2 instancias)
- ✅ Configura Keycloak con realm importado
- ✅ Levanta OpenKM con OCR
- ✅ Crea la red para que todo se comunique
- ✅ Persiste los datos
- ✅ Funciona igual en Windows, Mac y Linux

**Sin Docker**, configurar este ambiente tomaría **2-3 días**.  
**Con Docker**, toma **2-3 minutos**.

---

**¿Preguntas?** Revisa los logs con:
```bash
docker-compose -f docker-compose-dev.yml logs -f
```

**¿Problemas?** Reinicia limpio con:
```bash
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d
```

---

> 💡 **Tip**: Guarda este archivo como referencia. Cuando alguien nuevo llegue al equipo, solo compártele este README y el comando `docker-compose up -d`. ¡Listo para programar! 🎉
