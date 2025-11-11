# 🚀 Datum Travels - Sistema de Gestión de Gastos Corporativos

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/)
[![Quarkus](https://img.shields.io/badge/Quarkus-3.27-blue)](https://quarkus.io/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Descripción

Aplicación Web para la **automatización del registro, control y reporte de gastos** de empleados durante viajes de negocios y gastos de representación corporativa.

Reemplaza el proceso manual tradicional (Excel/Word) con una solución web responsiva que utiliza:
- 🤖 **OCR (Optical Character Recognition)** para captura automática de datos desde facturas/tickets
- 🧠 **Modelos de IA** para procesamiento inteligente de comprobantes
- 📊 **Reportes Excel** automatizados
- 🔐 **Autenticación robusta** con Keycloak

---

## 🏗️ Arquitectura del Sistema

### Backend
- **Framework:** Quarkus 3.27 (Java 21)
- **Base de Datos:** Oracle XE 21c
- **Arquitectura:** Clean Architecture (simplificada para juniors)
- **Autenticación:** Keycloak + JWT

### Frontend
- **Framework:** React 19 + TypeScript 5.8
- **Build Tool:** Vite 7
- **Estilos:** Tailwind CSS 4
- **Router:** React Router 7
- **PWA:** Aplicación Web Progresiva (offline-ready)

### Servicios Adicionales
- **OCR Service:** Quarkus + Azure Document Intelligence
- **Gestión Documental:** OpenKM Community Edition
- **Autenticación:** Keycloak 26

---

## 🚀 Inicio Rápido

### Para Desarrolladores Nuevos

Si es tu **PRIMERA VEZ** con este proyecto:

📖 **[Lee la Guía de Configuración Inicial Completa](GUIA_CONFIGURACION_INICIAL.md)**

Esta guía te llevará paso a paso desde:
- ✅ Clonar el repositorio
- ✅ Configurar Oracle Database
- ✅ Configurar los 3 servicios (Backend, OCR, Frontend)
- ✅ Levantar Docker y servicios
- ✅ Verificar que todo funciona correctamente

---

### Inicio Rápido (Para quienes ya configuraron todo)

```powershell
# 1. Levantar servicios Docker (Oracle, Keycloak, OpenKM)
docker-compose -f docker-compose-dev.yml up -d

# 2. Backend Principal (Terminal 1)
cd BackEnd\quarkus-api
.\mvnw.cmd quarkus:dev

# 3. OCR Service (Terminal 2)
cd ocr-quarkus
.\mvnw.cmd quarkus:dev

# 4. Frontend (Terminal 3)
cd FrontEnd\frontend
npm run dev
```

**URLs:**
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:8081/api
- 🔍 OCR API: http://localhost:8080/api
- 🔐 Keycloak: http://localhost:8180

---

## 📁 Estructura del Proyecto

```
BootcampNSPTeam/
├── BackEnd/
│   └── quarkus-api/               # API principal (puerto 8081)
│       ├── src/main/java/datum/travels/
│       │   ├── application/       # Casos de Uso + DTOs
│       │   ├── domain/            # Entidades + Repositorios
│       │   ├── infrastructure/    # REST + JPA + Email
│       │   └── shared/            # Utilidades + Excepciones
│       └── .env.example           # Plantilla de configuración
│
├── FrontEnd/
│   └── frontend/                  # React App (puerto 5173)
│       ├── src/
│       │   ├── components/        # Componentes reutilizables
│       │   ├── pages/             # Páginas principales
│       │   ├── services/          # Llamadas a API
│       │   ├── types/             # TypeScript interfaces
│       │   └── hooks/             # Custom React Hooks
│       └── .env.example           # Plantilla de configuración
│
├── ocr-quarkus/                   # Servicio OCR (puerto 8080)
│   ├── src/main/java/org/acme/
│   └── src/main/resources/
│       └── application-dev.properties.example
│
├── keycloak/
│   ├── import/                    # Configuración auto-importada
│   ├── QUICK_SETUP.md             # Setup rápido
│   └── GUIA_DEVS_NUEVOS.md        # Guía detallada
│
├── docker-compose-dev.yml         # Orquestación de servicios
├── BD DATUM FINAL.sql             # Schema de base de datos
├── GUIA_CONFIGURACION_INICIAL.md  # 📖 GUÍA COMPLETA DE SETUP
└── README.md                      # Este archivo
```

---

## 🛠️ Tecnologías Utilizadas

### Backend (Java)
- **Quarkus 3.27** - Framework supersónico de Java
- **Hibernate ORM + Panache** - Persistencia simplificada
- **Jakarta Validation** - Validación de datos
- **Apache POI** - Generación de Excel
- **Azure Document Intelligence** - OCR
- **Mailer (SMTP)** - Envío de correos

### Frontend (TypeScript/React)
- **React 19** - UI Library
- **TypeScript 5.8** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **React Router 7** - Navegación
- **Lucide Icons** - Iconografía
- **Vite 7** - Build tool
- **PWA (vite-plugin-pwa)** - Progressive Web App

### Infraestructura
- **Oracle XE 21c** - Base de datos
- **Keycloak 26** - Identity & Access Management
- **OpenKM CE** - Document Management
- **Docker & Docker Compose** - Containerización

---

## 📚 Documentación Adicional

- 📖 **[Guía de Configuración Inicial](GUIA_CONFIGURACION_INICIAL.md)** - Setup completo para nuevos desarrolladores
- 🔐 **[Keycloak Quick Setup](keycloak/QUICK_SETUP.md)** - Configuración rápida de autenticación
- 🧑‍💻 **[Keycloak - Guía para Devs](keycloak/GUIA_DEVS_NUEVOS.md)** - Guía detallada de Keycloak
- 🏗️ **[Instrucciones de Arquitectura](.github/copilot-instructions.md)** - Convenciones y patrones del proyecto
- 🔌 **[Backend README](BackEnd/quarkus-api/README.md)** - Documentación del API
- 🎨 **[Frontend README](FrontEnd/frontend/README.md)** - Documentación del Frontend

---

## 🎯 Funcionalidades Principales

### Para Empleados
- ✅ Crear eventos de viaje o gastos de representación
- ✅ Registrar gastos con captura automática de comprobantes (OCR)
- ✅ Asociar tarjetas corporativas o viáticos en efectivo
- ✅ Ver historial de gastos y eventos
- ✅ Generar reportes en Excel para contabilidad

### Para Administradores
- ✅ Gestionar usuarios y asignación de roles
- ✅ Administrar tarjetas corporativas
- ✅ Visualizar dashboard de gastos y eventos
- ✅ Revisar y aprobar reportes
- ✅ Consultar estadísticas y métricas

### Características Técnicas
- ✅ OCR automático de facturas/tickets
- ✅ Conversión de monedas en tiempo real
- ✅ Cálculo automático de viáticos por país
- ✅ Envío de reportes por correo electrónico
- ✅ PWA (funciona offline)
- ✅ Responsive design (móvil y escritorio)

---

## 🤝 Contribuir

### Flujo de Trabajo

1. **Clonar y configurar:**
   ```powershell
   git clone https://github.com/fjdevel-datum/BootcampNSPTeam.git
   cd BootcampNSPTeam
   git checkout carlos
   ```

2. **Crear rama de feature:**
   ```powershell
   git checkout -b feature/nombre-funcionalidad
   ```

3. **Desarrollar y commitear:**
   ```powershell
   git add .
   git commit -m "feat: descripción del cambio"
   ```

4. **Push y Pull Request:**
   ```powershell
   git push origin feature/nombre-funcionalidad
   # Crear Pull Request en GitHub hacia la rama 'carlos'
   ```

### Convenciones de Commit
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `refactor:` Refactorización de código
- `style:` Cambios de formato (no afectan lógica)
- `test:` Agregar o modificar tests

---

## 📞 Soporte

Para problemas o dudas:

1. 📖 Consulta primero la [Guía de Configuración](GUIA_CONFIGURACION_INICIAL.md)
2. 🔍 Revisa la sección [Problemas Comunes](GUIA_CONFIGURACION_INICIAL.md#-problemas-comunes)
3. 🐛 Crea un issue en GitHub con:
   - Descripción del problema
   - Logs relevantes
   - Pasos para reproducir

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Equipo

Desarrollado por el equipo de **Datum Redsoft** - Bootcamp NSP Team

---

**¡Happy Coding! 🚀**

*Última actualización: Noviembre 2025*
