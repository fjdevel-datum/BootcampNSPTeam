# 🚀 Datum Travels - Sistema de Gestión de Gastos Corporativos

Aplicación web para automatizar el registro, control y reporte de gastos de empleados durante viajes de negocios y gastos de representación.

## 🏗️ Arquitectura

- **Backend:** Quarkus (Java 21) + Oracle Database
- **Frontend:** React + TypeScript + Vite
- **Autenticación:** Keycloak (OAuth2 + OIDC)
- **Infraestructura:** Docker Compose

## ⚡ Setup Rápido (Nuevo Desarrollador)

### Prerequisitos

- **Docker Desktop** - Instalado y corriendo
- **Java 21** - JDK 21.0.8 o superior
- **Node.js 18+** - Para el frontend
- **PowerShell** - 5.1 o superior (Windows)

### Opción 1: Setup Automático (Recomendado) ⭐

```powershell
# 1. Clonar el repositorio
git clone <url-del-repo>
cd BootcampNSPTeam
git checkout celso

# 2. Ejecutar script de setup completo
.\setup-completo-automatico.ps1

# ⏱️ Tiempo: ~5 minutos
```

Este script configura automáticamente:
- ✅ Contenedores Docker (Oracle + Keycloak)
- ✅ Base de datos con esquema y datos de prueba
- ✅ Keycloak con realm, usuarios y roles
- ✅ 4 usuarios de prueba listos para usar

### Opción 2: Setup Manual

Ver guía completa en: **[SETUP_COMPLETO.md](./SETUP_COMPLETO.md)**

## 👥 Usuarios de Prueba

Después del setup, tendrás 4 usuarios configurados:

| Usuario | Contraseña | Rol | Uso |
|---------|-----------|-----|-----|
| `carlos.test` | `test123` | Empleado | Testing funcionalidad base |
| `maria.contador` | `contador123` | contador | Testing reportes financieros |
| `juan.gerente` | `gerente123` | gerente | Testing autorizaciones |
| `admin.datum` | `admin123` | admin | Testing administración |

Ver más en: **[USUARIOS_PRUEBA.md](./USUARIOS_PRUEBA.md)**

## 🚀 Levantar el Proyecto

### Backend (Quarkus)

```powershell
cd BackEnd/quarkus-api
.\mvnw quarkus:dev

# Backend corriendo en: http://localhost:8081
```

### Frontend (React + Vite)

```powershell
cd FrontEnd/frontend
npm install
npm run dev

# Frontend corriendo en: http://localhost:5173
```

## 🧪 Probar el Login

```powershell
# Endpoint de login
POST http://localhost:8081/api/auth/login

# Body (ejemplo con admin)
{
  "usuarioApp": "admin.datum",
  "contrasena": "admin123"
}

# Respuesta
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cC...",
  "tipo": "Bearer",
  "usuario": {
    "idUsuario": 4,
    "usuarioApp": "admin.datum",
    "empleado": {
      "nombre": "Admin",
      "apellido": "Datum"
    }
  }
}
```

## 📚 Documentación

- **[SETUP_COMPLETO.md](./SETUP_COMPLETO.md)** - Guía paso a paso para configurar el entorno
- **[USUARIOS_PRUEBA.md](./USUARIOS_PRUEBA.md)** - Credenciales y casos de uso de usuarios de prueba
- **[BackEnd/keycloak/README_REALM_IMPORT.md](./BackEnd/keycloak/README_REALM_IMPORT.md)** - Documentación del realm de Keycloak
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Instrucciones del proyecto para GitHub Copilot

## 🐳 Servicios Docker

| Servicio | Puerto | Credenciales | URL |
|----------|--------|--------------|-----|
| **Keycloak** | 8180 | admin / admin123 | http://localhost:8180 |
| **Oracle XE** | 1522 | datum_user / datum2025 | localhost:1522/XEPDB1 |

```powershell
# Ver estado de servicios
docker ps --filter "name=datum"

# Ver logs
docker logs datum-keycloak-dev
docker logs datum-oracle-dev

# Detener servicios
docker-compose -f docker-compose-dev.yml down
```

## 🛠️ Scripts Útiles

| Script | Descripción | Uso |
|--------|-------------|-----|
| `setup-completo-automatico.ps1` | Setup completo automatizado | `.\setup-completo-automatico.ps1` |
| `crear-usuarios-keycloak.ps1` | Crea usuarios en Keycloak con roles | `.\crear-usuarios-keycloak.ps1` |
| `setup-keycloak-passwords.ps1` | Configura contraseñas de 4 usuarios | `.\setup-keycloak-passwords.ps1` |
| `setup-keycloak-password.ps1` | Configura solo carlos.test | `.\setup-keycloak-password.ps1` |

## 🏛️ Estructura del Proyecto

```
BootcampNSPTeam/
├── BackEnd/
│   ├── quarkus-api/              # API REST Quarkus
│   │   └── src/
│   │       └── main/
│   │           └── java/datum/travels/
│   │               ├── application/      # Use Cases + DTOs
│   │               ├── domain/           # Entidades + Repositorios
│   │               └── infrastructure/   # Adapters + REST
│   ├── keycloak/
│   │   ├── realm-export.json     # Configuración de Keycloak
│   │   └── README_REALM_IMPORT.md
│   └── scripts/
│       └── insertar-usuarios-prueba-completo.sql
├── FrontEnd/
│   └── frontend/                 # React + TypeScript + Vite
├── BD DATUM FINAL.sql            # Esquema de base de datos
├── docker-compose-dev.yml        # Configuración Docker
├── setup-completo-automatico.ps1 # Setup automático
└── README.md                     # Este archivo
```

## 🔐 Integración Keycloak

El proyecto usa Keycloak para autenticación y autorización:

- **Realm:** `datum-travels`
- **Client:** `datum-travels-backend`
- **Client Secret:** `tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT`
- **Roles:** Empleado, contador, gerente, admin

### Flujo de Login

```
Usuario → Frontend → Backend → Keycloak
                        ↓
                    Valida en Oracle
                        ↓
                    Obtiene JWT de Keycloak
                        ↓
                    Retorna JWT + datos usuario
```

## 🤝 Contribuir

1. Hacer checkout a una nueva rama desde `celso`
2. Realizar cambios
3. Probar localmente
4. Crear Pull Request

## 📋 Troubleshooting

### "Keycloak no responde"
```powershell
# Verificar que el contenedor esté corriendo
docker ps | Select-String keycloak

# Reiniciar Keycloak
docker restart datum-keycloak-dev

# Esperar ~60 segundos
```

### "Oracle no acepta conexiones"
```powershell
# Verificar estado
docker ps | Select-String oracle

# Ver logs
docker logs datum-oracle-dev

# Reiniciar
docker restart datum-oracle-dev
```

### "Backend no compila"
```powershell
# Limpiar y recompilar
cd BackEnd/quarkus-api
.\mvnw clean compile
```

## 📞 Soporte

Para más información, consulta la documentación en la carpeta `BackEnd/keycloak/` o contacta al equipo de desarrollo.

---

**Proyecto Datum Travels** - Bootcamp NSP Team © 2025
