# 🏗️ Arquitectura Clean Refactorizada - Datum Travels

## 📋 Resumen
Este proyecto ahora sigue una **Arquitectura Clean simplificada** diseñada para programadores primerizos, con separación clara de responsabilidades en 4 capas principales.

---

## 📁 Estructura Completa

```
src/main/java/datum/travels/
│
├── application/                              [CAPA APLICACIÓN]
│   │
│   ├── dto/                                  [Transferencia de datos]
│   │   ├── auth/
│   │   │   ├── LoginRequestDTO.java
│   │   │   ├── LoginResponseDTO.java
│   │   │   ├── SesionActivaDTO.java
│   │   │   └── ValidateTokenResponseDTO.java
│   │   │
│   │   ├── evento/
│   │   │   ├── CrearEventoDTO.java          ← Modal Home
│   │   │   ├── EventoResumenDTO.java        ← Lista Home
│   │   │   ├── EventoDetalleDTO.java        ← Vista detalle
│   │   │   └── EventoResponseDTO.java
│   │   │
│   │   ├── gasto/
│   │   │   ├── CrearGastoDTO.java           ← Formulario OCR
│   │   │   ├── GastoResumenDTO.java         ← Lista gastos
│   │   │   ├── GastoRequestDTO.java
│   │   │   ├── GastoResponseDTO.java
│   │   │   └── OCRResponseDTO.java          ← Datos extraídos
│   │   │
│   │   ├── categoria/
│   │   │   ├── CategoriaGastoDTO.java       ← Dropdown categorías
│   │   │   └── CategoriaResponseDTO.java
│   │   │
│   │   ├── empleado/
│   │   │   └── EmpleadoDTO.java
│   │   │
│   │   ├── tarjeta/
│   │   │   └── TarjetaDTO.java
│   │   │
│   │   └── reporte/
│   │       └── ReporteRequestDTO.java       ← Generar reporte
│   │
│   ├── port/                                 [Servicios externos]
│   │   ├── AuthenticationService.java       ← JWT/Keycloak
│   │   ├── JwtService.java                  ← Generación JWT
│   │   ├── OCRService.java                  ← Procesar facturas
│   │   ├── EmailService.java                ← Enviar reportes
│   │   ├── FileStorageService.java          ← Guardar imágenes
│   │   ├── ReportGeneratorService.java      ← Excel/PDF
│   │   └── MessageQueueService.java         ← Mensajería
│   │
│   └── usecase/                              [Casos de uso]
│       │
│       ├── auth/
│       │   ├── LoginUseCase.java            ✅ NUEVO
│       │   └── ValidateTokenUseCase.java    ✅ NUEVO
│       │
│       ├── evento/
│       │   ├── CrearEventoUseCase.java      ✅ NUEVO
│       │   ├── ListarEventosUseCase.java    ✅ NUEVO
│       │   └── ObtenerDetalleEventoUseCase.java ✅ NUEVO
│       │
│       ├── gasto/
│       │   ├── ProcesarFacturaUseCase.java  ✅ NUEVO (OCR + Guardar)
│       │   ├── ListarGastosUseCase.java     ✅ NUEVO
│       │   └── EliminarGastoUseCase.java    ✅ NUEVO
│       │
│       ├── reporte/
│       │   └── GenerarReporteUseCase.java   ✅ NUEVO (Excel/PDF + Email)
│       │
│       └── mapper/
│           └── EventoMapper.java
│
├── domain/                                   [CAPA DOMINIO]
│   │
│   ├── model/                                [Entidades - NO TOCAR ✋]
│   │   ├── Usuario.java
│   │   ├── Empleado.java
│   │   ├── Evento.java                      ← Viaje/Gasto representación
│   │   ├── Gasto.java                       ← Cada transacción
│   │   ├── CategoriaGasto.java              ← Transporte, comida, etc.
│   │   ├── Tarjeta.java                     ← Tarjetas corporativas
│   │   ├── Departamento.java                ← Seeds
│   │   ├── Cargo.java                       ← Seeds
│   │   ├── Empresa.java                     ← Seeds
│   │   ├── Pais.java                        ← SV, GT, HN, PA
│   │   ├── AdelantoViatico.java
│   │   └── LiquidacionViatico.java
│   │
│   ├── repository/                           [Contratos persistencia]
│   │   ├── UsuarioRepository.java           ✅ NUEVO
│   │   ├── EmpleadoRepository.java          ✅ NUEVO
│   │   ├── EventoRepository.java            ✅ NUEVO
│   │   ├── GastoRepository.java             ✅ NUEVO
│   │   └── CategoriaGastoRepository.java    ✅ NUEVO
│   │
│   ├── exception/                            [Excepciones negocio]
│   │   ├── DomainException.java             ✅ NUEVO (Base)
│   │   ├── AuthenticationException.java     ✅ NUEVO
│   │   ├── EventoNotFoundException.java     ✅ NUEVO
│   │   ├── GastoInvalidoException.java      ✅ NUEVO
│   │   └── BusinessValidationException.java ✅ NUEVO
│   │
│   └── valueobject/                          [Objetos valor]
│       └── MontoGasto.java                   ✅ NUEVO (Monto + moneda)
│
├── infrastructure/                           [CAPA INFRAESTRUCTURA]
│   │
│   ├── adapter/
│   │   │
│   │   ├── rest/                             [Entrada REST]
│   │   │   ├── AuthController.java          ✅ NUEVO (POST /api/auth/login)
│   │   │   ├── EventoController.java        ✅ NUEVO (GET/POST /api/eventos)
│   │   │   ├── GastoController.java         ✅ NUEVO (POST /api/gastos)
│   │   │   ├── CategoriaController.java     ✅ NUEVO (GET /api/categorias)
│   │   │   └── ReporteController.java       ✅ NUEVO (POST /api/reportes)
│   │   │
│   │   ├── persistence/                      [Salida BD]
│   │   │   ├── UsuarioRepositoryImpl.java   ✅ NUEVO
│   │   │   ├── EmpleadoRepositoryImpl.java  ✅ NUEVO
│   │   │   ├── EventoRepositoryImpl.java    ✅ NUEVO
│   │   │   ├── GastoRepositoryImpl.java     ✅ NUEVO
│   │   │   └── CategoriaGastoRepositoryImpl.java ✅ NUEVO
│   │   │
│   │   └── external/                         [Servicios externos]
│   │       ├── SimpleJwtAdapter.java         ✅ NUEVO (JWT ahora)
│   │       ├── KeycloakAdapter.java          ✅ NUEVO (Keycloak después)
│   │       ├── AzureOCRAdapter.java          ✅ NUEVO (OCR Azure)
│   │       ├── GmailAdapter.java             ✅ NUEVO (Email)
│   │       ├── LocalFileStorageAdapter.java  ✅ NUEVO (Guardar imgs)
│   │       └── ExcelReportAdapter.java       ✅ NUEVO (Generar Excel)
│   │
│   ├── config/
│   │   ├── DatabaseConfig.java               ✅ NUEVO (Config Oracle)
│   │   ├── CorsConfig.java                   ✅ NUEVO (CORS React)
│   │   ├── JwtConfig.java                    ✅ NUEVO (Config JWT)
│   │   └── KeycloakConfig.java               (Ya existía)
│   │
│   └── security/
│       ├── JwtTokenProvider.java             ✅ NUEVO (Generar/validar tokens)
│       └── SecurityExceptionHandler.java     ✅ NUEVO (Manejo errores auth)
│
└── shared/                                   [CÓDIGO COMPARTIDO]
    │
    ├── constant/
    │   ├── EstadoEvento.java                 ← ACTIVO, COMPLETADO
    │   ├── TipoCategoria.java                ← TRANSPORTE, COMIDA
    │   ├── PaisCode.java                     ← SV, GT, HN, PA
    │   └── EmailConfig.java                  ✅ NUEVO (Emails por país)
    │
    ├── exception/
    │   ├── TechnicalException.java           ← Errores técnicos
    │   ├── BusinessException.java            ← Errores de negocio
    │   └── GlobalExceptionHandler.java       ✅ NUEVO (Manejo global)
    │
    └── util/
        ├── DateUtils.java                    ← Formatear fechas
        ├── CurrencyUtils.java                ← Manejar montos
        └── ValidationUtils.java              ← Validaciones comunes
```

---

## 🎯 Flujo de Datos

### Ejemplo: Crear un Evento

```
1. [Frontend] → POST /api/eventos
                ↓
2. [EventoController] → recibe CrearEventoDTO
                ↓
3. [CrearEventoUseCase] → valida y procesa lógica de negocio
                ↓
4. [EventoRepository] → interface (contrato)
                ↓
5. [EventoRepositoryImpl] → guarda en BD
                ↓
6. [EventoController] → retorna EventoResponseDTO
```

---

## 📝 Convenciones

### Nombres de Archivos
- **Use Cases**: `[Verbo][Entidad]UseCase.java`
  - Ejemplo: `CrearEventoUseCase.java`, `ListarGastosUseCase.java`
  
- **Repositories (Interface)**: `[Entidad]Repository.java`
  - Ejemplo: `EventoRepository.java`
  
- **Repositories (Implementación)**: `[Entidad]RepositoryImpl.java`
  - Ejemplo: `EventoRepositoryImpl.java`
  
- **Controllers**: `[Entidad]Controller.java`
  - Ejemplo: `EventoController.java`
  
- **DTOs**: `[Acción][Entidad]DTO.java`
  - Ejemplo: `CrearEventoDTO.java`, `EventoResumenDTO.java`

### Organización de Carpetas
- ✅ Agrupación por **funcionalidad** (auth, evento, gasto, reporte)
- ✅ Separación por **tipo de archivo** (dto, usecase, repository)
- ✅ Clara distinción entre **contratos** (interfaces) e **implementaciones**

---

## 🚀 Próximos Pasos

### Para Desarrolladores Primerizos:

1. **Empezar por Domain**: Entender las entidades (ya están hechas ✅)
2. **Crear DTOs**: Definir qué datos viajan entre capas
3. **Implementar Use Cases**: Lógica de negocio paso a paso
4. **Crear Repositories**: Acceso a base de datos
5. **Exponer REST APIs**: Controllers para el frontend

### Orden Sugerido de Implementación:

#### Fase 1: Autenticación
- `LoginUseCase`
- `ValidateTokenUseCase`
- `SimpleJwtAdapter`
- `AuthController`

#### Fase 2: Eventos
- `CrearEventoUseCase`
- `ListarEventosUseCase`
- `EventoRepositoryImpl`
- `EventoController`

#### Fase 3: Gastos
- `ProcesarFacturaUseCase` (sin OCR primero)
- `ListarGastosUseCase`
- `GastoRepositoryImpl`
- `GastoController`

#### Fase 4: Reportes
- `GenerarReporteUseCase`
- `ExcelReportAdapter`
- `GmailAdapter`
- `ReporteController`

---

## 📚 Recursos de Apoyo

- **GUIA_01_DOMAIN.md**: Entender capa de dominio
- **GUIA_02_APPLICATION.md**: Casos de uso y DTOs
- **CLEAN_ARCHITECTURE.md**: Fundamentos de Clean Architecture
- **TUTORIAL_APPLICATION_PASO_A_PASO.md**: Guía práctica paso a paso

---

## ⚠️ Importante

- ✋ **NO MODIFICAR** los archivos en `domain/model/` (entidades ya completas)
- ✅ Todos los archivos nuevos están marcados con comentarios `TODO`
- 🔍 Cada archivo tiene su package correcto
- 📦 La estructura está lista para comenzar a implementar

---

## 🎓 Ventajas de Esta Arquitectura

### Para Primerizos:
1. **Separación clara**: Cada capa tiene una responsabilidad única
2. **Fácil navegación**: Todo está organizado por funcionalidad
3. **Testeable**: Cada pieza se puede probar por separado
4. **Escalable**: Agregar nuevas features es sencillo

### Principios Aplicados:
- **Single Responsibility**: Cada clase tiene una única razón para cambiar
- **Dependency Inversion**: Dependencias apuntan hacia abstracciones
- **Separation of Concerns**: Cada capa tiene su propósito definido

---

**Última actualización**: 19 de Octubre, 2025  
**Versión**: 1.0 - Refactorización Clean Architecture Ligera
