# 🎨 Diagrama Visual - Arquitectura Clean

## 📊 Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                    http://localhost:5173                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST API
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 INFRASTRUCTURE LAYER                       │
│                     (Adapters & Controllers)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📡 REST Controllers (adapter/rest/)                             │
│  ├── AuthController         → POST /api/auth/login              │
│  ├── EventoController       → GET/POST /api/eventos             │
│  ├── GastoController        → POST /api/gastos                  │
│  ├── CategoriaController    → GET /api/categorias               │
│  └── ReporteController      → POST /api/reportes                │
│                                                                  │
│  🔌 External Adapters (adapter/external/)                        │
│  ├── SimpleJwtAdapter       → Autenticación JWT                 │
│  ├── KeycloakAdapter        → Keycloak (futuro)                 │
│  ├── AzureOCRAdapter        → OCR Azure                         │
│  ├── GmailAdapter           → Envío de emails                   │
│  ├── LocalFileStorageAdapter→ Guardar archivos                  │
│  └── ExcelReportAdapter     → Generar Excel                     │
│                                                                  │
│  💾 Persistence Adapters (adapter/persistence/)                  │
│  ├── UsuarioRepositoryImpl                                      │
│  ├── EmpleadoRepositoryImpl                                     │
│  ├── EventoRepositoryImpl                                       │
│  ├── GastoRepositoryImpl                                        │
│  └── CategoriaGastoRepositoryImpl                               │
│                                                                  │
│  ⚙️ Configuration (config/ & security/)                          │
│  ├── DatabaseConfig         → Oracle DB                         │
│  ├── CorsConfig             → CORS para React                   │
│  ├── JwtConfig              → Config JWT                        │
│  ├── JwtTokenProvider       → Tokens                            │
│  └── SecurityExceptionHandler → Errores auth                    │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     💼 APPLICATION LAYER                         │
│                   (Use Cases & Business Logic)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 Use Cases (usecase/)                                         │
│  ├── auth/                                                      │
│  │   ├── LoginUseCase                                           │
│  │   └── ValidateTokenUseCase                                   │
│  │                                                               │
│  ├── evento/                                                    │
│  │   ├── CrearEventoUseCase                                     │
│  │   ├── ListarEventosUseCase                                   │
│  │   └── ObtenerDetalleEventoUseCase                            │
│  │                                                               │
│  ├── gasto/                                                     │
│  │   ├── ProcesarFacturaUseCase    ← OCR + Guardar             │
│  │   ├── ListarGastosUseCase                                    │
│  │   └── EliminarGastoUseCase                                   │
│  │                                                               │
│  └── reporte/                                                   │
│      └── GenerarReporteUseCase     ← Excel/PDF + Email         │
│                                                                  │
│  📦 DTOs (dto/)                                                  │
│  ├── auth/      → LoginRequestDTO, LoginResponseDTO            │
│  ├── evento/    → CrearEventoDTO, EventoResumenDTO             │
│  ├── gasto/     → CrearGastoDTO, GastoResumenDTO               │
│  ├── categoria/ → CategoriaGastoDTO                            │
│  └── reporte/   → ReporteRequestDTO                            │
│                                                                  │
│  🔌 Ports (Interfaces para servicios externos)                   │
│  ├── AuthenticationService                                      │
│  ├── JwtService                                                 │
│  ├── OCRService                                                 │
│  ├── EmailService                                               │
│  ├── FileStorageService                                         │
│  └── ReportGeneratorService                                     │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       🏛️ DOMAIN LAYER                            │
│                   (Core Business Entities)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 Entities (model/) - ✋ NO TOCAR                              │
│  ├── Usuario             → Usuarios del sistema                │
│  ├── Empleado            → Empleados de la empresa             │
│  ├── Evento              → Viajes / Gastos representación      │
│  ├── Gasto               → Cada gasto individual               │
│  ├── CategoriaGasto      → Transporte, comida, etc.            │
│  ├── Tarjeta             → Tarjetas corporativas               │
│  ├── Departamento        → Departamentos (seed)                │
│  ├── Cargo               → Cargos (seed)                        │
│  ├── Empresa             → Empresas (seed)                      │
│  ├── Pais                → SV, GT, HN, PA                       │
│  ├── AdelantoViatico     → Adelantos                            │
│  └── LiquidacionViatico  → Liquidaciones                        │
│                                                                  │
│  📝 Repository Contracts (repository/)                           │
│  ├── UsuarioRepository                                          │
│  ├── EmpleadoRepository                                         │
│  ├── EventoRepository                                           │
│  ├── GastoRepository                                            │
│  └── CategoriaGastoRepository                                   │
│                                                                  │
│  ⚠️ Domain Exceptions (exception/)                               │
│  ├── DomainException                 ← Base                     │
│  ├── AuthenticationException                                    │
│  ├── EventoNotFoundException                                    │
│  ├── GastoInvalidoException                                     │
│  └── BusinessValidationException                                │
│                                                                  │
│  💎 Value Objects (valueobject/)                                 │
│  └── MontoGasto                      ← Monto + moneda           │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      🔧 SHARED LAYER                             │
│                  (Common Code & Utilities)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📌 Constants (constant/)                                        │
│  ├── EstadoEvento        → ACTIVO, COMPLETADO, CANCELADO       │
│  ├── TipoCategoria       → TRANSPORTE, COMIDA, HOTEL           │
│  ├── PaisCode            → SV, GT, HN, PA                       │
│  └── EmailConfig         → Emails por país                      │
│                                                                  │
│  ⚠️ Shared Exceptions (exception/)                               │
│  ├── TechnicalException          → Errores técnicos            │
│  ├── BusinessException            → Errores de negocio         │
│  └── GlobalExceptionHandler       → Manejo global              │
│                                                                  │
│  🛠️ Utilities (util/)                                            │
│  ├── DateUtils               → Formatear fechas                │
│  ├── CurrencyUtils           → Manejar montos                  │
│  └── ValidationUtils         → Validaciones comunes            │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
                    ┌────────────────┐
                    │  Oracle DB      │
                    │  (Docker)       │
                    └────────────────┘
```

---

## 🔄 Flujo Completo: Crear Evento

```
┌─────────────┐
│  Frontend   │  1. Usuario crea evento
│   (React)   │     POST /api/eventos
└──────┬──────┘     { nombre: "Viaje Miami", ... }
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│  EventoController                                        │
│  ├── Recibe CrearEventoDTO                              │
│  ├── Valida datos básicos                               │
│  └── Llama al Use Case                                  │
└──────┬───────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│  CrearEventoUseCase                                      │
│  ├── Valida reglas de negocio                           │
│  │   • Fechas válidas                                   │
│  │   • País existe                                      │
│  │   • Empleado tiene permisos                          │
│  ├── Crea entidad Evento                                │
│  └── Llama al Repository                                │
└──────┬───────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│  EventoRepository (Interface)                            │
│  └── guardar(Evento evento): Evento                     │
└──────┬───────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│  EventoRepositoryImpl                                    │
│  ├── Persiste en Oracle DB                              │
│  ├── Maneja transacciones                               │
│  └── Retorna entidad guardada                           │
└──────┬───────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│  EventoController                                        │
│  ├── Mapea Evento → EventoResponseDTO                   │
│  └── Retorna JSON al frontend                           │
└──────┬───────────────────────────────────────────────────┘
       │
       ↓
┌─────────────┐
│  Frontend   │  Recibe respuesta:
│   (React)   │  { id: 1, nombre: "Viaje Miami", ... }
└─────────────┘  Actualiza UI
```

---

## 🎯 Dependencias entre Capas

```
┌───────────────────────────────────────────────────────────┐
│                    Regla de Dependencia                    │
│                                                            │
│  Infrastructure → Application → Domain → Shared           │
│                                                            │
│  ❌ Domain NO puede depender de Application               │
│  ❌ Application NO puede depender de Infrastructure       │
│  ✅ Infrastructure SÍ puede depender de Application       │
│  ✅ Todas las capas pueden usar Shared                    │
└───────────────────────────────────────────────────────────┘
```

---

## 📦 Ejemplo: Package de un Use Case

```java
package datum.travels.application.usecase.evento;

import datum.travels.domain.model.Evento;              // ✅ OK: Domain
import datum.travels.domain.repository.EventoRepository; // ✅ OK: Domain
import datum.travels.application.dto.evento.CrearEventoDTO; // ✅ OK: Mismo layer
import datum.travels.shared.util.ValidationUtils;      // ✅ OK: Shared
import datum.travels.infrastructure.adapter.rest.EventoController; // ❌ NO!

public class CrearEventoUseCase {
    // Implementación
}
```

---

## 🚦 Responsabilidades de Cada Capa

### 1️⃣ Domain Layer (Núcleo)
- Define **entidades** de negocio
- Define **contratos** (interfaces de repositorios)
- Contiene **excepciones de dominio**
- **NO TIENE** dependencias externas

### 2️⃣ Application Layer (Lógica de Negocio)
- Implementa **casos de uso**
- Define **DTOs** para transferencia de datos
- Define **ports** (interfaces para servicios externos)
- Orquesta el flujo de negocio

### 3️⃣ Infrastructure Layer (Detalles Técnicos)
- Implementa **REST Controllers**
- Implementa **Repositories** (JPA)
- Implementa **Adapters externos** (OCR, Email, etc.)
- Configuración de frameworks

### 4️⃣ Shared Layer (Común)
- **Constantes** compartidas
- **Utilidades** generales
- **Excepciones técnicas**
- Código usado por todas las capas

---

**Fecha**: 19 de Octubre, 2025  
**Proyecto**: Datum Travels - Sistema de Gastos de Viaje
