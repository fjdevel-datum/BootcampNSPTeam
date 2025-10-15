# 📘 Guía Completa: Capa APPLICATION en Clean Architecture

## 🎯 Introducción

La capa **APPLICATION** es el corazón de la **orquestación** de tu sistema. Es la capa intermedia que conecta el mundo exterior (REST APIs, interfaces de usuario) con tu lógica de negocio pura (Domain).

---

## 🏗️ Estructura de la Capa APPLICATION

```
application/
├── dto/              # 📦 Data Transfer Objects (transferencia de datos)
├── port/             # 🔌 Ports (contratos para servicios externos)
├── usecase/          # 📋 Use Case Interfaces (contratos de casos de uso)
└── usecases/         # ⚙️ Use Case Implementations (implementaciones)
```

---

## 1️⃣ APPLICATION/DTO - Data Transfer Objects

### 📦 ¿Qué son los DTOs?

Los **DTOs** (Data Transfer Objects) son objetos simples cuyo único propósito es **transportar datos** entre capas.

### 🎯 Propósito Principal

- **Desacoplar** la capa de presentación (REST) de la capa de dominio
- **Controlar** qué datos se exponen al exterior
- **Validar** datos de entrada antes de llegar al dominio
- **Transformar** datos para el frontend

### 📂 Estructura Actual

```
dto/
├── auth/              # DTOs de autenticación
│   ├── LoginRequestDTO.java
│   └── LoginResponseDTO.java
├── categoria/         # DTOs de categorías
│   └── CategoriaGastoDTO.java
├── empleado/          # DTOs de empleados
│   └── EmpleadoDTO.java
├── evento/            # DTOs de eventos
│   ├── CrearEventoDTO.java
│   ├── EventoDetalleDTO.java
│   ├── EventoResponseDTO.java
│   └── EventoResumenDTO.java
├── gasto/             # DTOs de gastos
│   ├── CrearGastoDTO.java
│   ├── GastoResponseDTO.java
│   ├── GastoResumenDTO.java
│   └── OCRResponseDTO.java
└── tarjeta/           # DTOs de tarjetas
    └── TarjetaDTO.java
```

### 💡 Ejemplo Práctico: CrearEventoDTO

```java
package datum.travels.application.dto.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para crear un nuevo evento desde el modal en el HOME
 * Solo requiere el nombre del evento, el resto se asigna automáticamente
 */
public class CrearEventoDTO {

    @NotBlank(message = "El nombre del evento es requerido")
    private String nombreEvento;

    @NotNull(message = "El ID del empleado es requerido")
    private Long idEmpleado;

    // Getters y Setters
    public String getNombreEvento() { return nombreEvento; }
    public void setNombreEvento(String nombreEvento) { this.nombreEvento = nombreEvento; }
    
    public Long getIdEmpleado() { return idEmpleado; }
    public void setIdEmpleado(Long idEmpleado) { this.idEmpleado = idEmpleado; }
}
```

### 🔑 Características Clave de los DTOs

1. **Validaciones con Jakarta Validation:**
   ```java
   @NotBlank  // No puede ser null ni vacío
   @NotNull   // No puede ser null
   @Email     // Debe ser un email válido
   @Size      // Tamaño mínimo/máximo
   @Pattern   // Expresión regular
   ```

2. **Sin lógica de negocio:** Solo getters, setters y validaciones
3. **Inmutables (opcional):** Pueden ser final para mayor seguridad
4. **Diferentes DTOs para diferentes casos:**
   - `CrearEventoDTO` → Crear (solo nombre e idEmpleado)
   - `EventoResponseDTO` → Respuesta completa (todos los datos)
   - `EventoResumenDTO` → Listado (datos resumidos)
   - `EventoDetalleDTO` → Vista detallada (con relaciones)

### 🔄 Flujo de Datos con DTOs

```
Cliente → CrearEventoDTO → Mapper → Evento (Domain) → Use Case
                                                           ↓
Cliente ← EventoResponseDTO ← Mapper ← Evento (Domain) ←──┘
```

---

## 2️⃣ APPLICATION/PORT - Ports (Hexagonal Architecture)

### 🔌 ¿Qué son los Ports?

Los **Ports** son **interfaces** que definen contratos para comunicarse con servicios externos o infraestructura.

### 🎯 Propósito Principal

- **Abstraer** servicios externos (bases de datos, APIs, email, storage)
- **Invertir dependencias** (el dominio no conoce la infraestructura)
- **Facilitar testing** (fácil usar mocks)
- **Permitir cambiar implementaciones** sin afectar la lógica

### 📂 Estructura Actual

```
port/
├── OCRService.java                 # Servicio de OCR
├── FileStorageService.java         # Almacenamiento de archivos
├── EmailService.java               # Envío de emails
├── ReportGeneratorService.java     # Generación de reportes
└── MessageQueueService.java        # Mensajería (JMS/Kafka)
```

### 💡 Ejemplo Práctico: OCRService

```java
package datum.travels.application.port;

/**
 * Puerto para servicio de OCR (Optical Character Recognition)
 * Define el contrato para procesar imágenes y extraer texto
 */
public interface OCRService {
    
    /**
     * Procesa una imagen y extrae datos de texto
     * @param imagenBase64 Imagen codificada en Base64
     * @return Datos extraídos en formato estructurado
     */
    OCRDataResponse procesarImagen(String imagenBase64);
    
    /**
     * Procesa una imagen desde una URL
     * @param imageUrl URL de la imagen
     * @return Datos extraídos
     */
    OCRDataResponse procesarImagenDesdeUrl(String imageUrl);
}
```

### 🔑 Características de los Ports

1. **Son interfaces (contratos):** No contienen implementación
2. **Definen QUÉ se hace, no CÓMO:** La implementación está en Infrastructure
3. **Agnósticos de tecnología:** No mencionan AWS, Google Cloud, etc.
4. **Fácilmente testeable:** Se pueden mockear en tests

### 📋 Ports Disponibles

#### 1. **OCRService** - Procesamiento de Imágenes
```java
// Uso: Escanear facturas y extraer datos
OCRDataResponse datos = ocrService.procesarImagen(imagenBase64);
```

#### 2. **FileStorageService** - Almacenamiento
```java
// Uso: Guardar archivos (facturas, reportes)
String url = fileStorage.guardarArchivo(contenido, "factura.pdf", "gastos/");
```

#### 3. **EmailService** - Envío de Emails
```java
// Uso: Notificar usuarios
emailService.enviarCorreo("user@example.com", "Evento Creado", "Tu evento...");
```

#### 4. **ReportGeneratorService** - Reportes
```java
// Uso: Generar Excel/PDF de gastos
byte[] excel = reportGenerator.generarReporteExcel(eventoId);
```

#### 5. **MessageQueueService** - Mensajería
```java
// Uso: Enviar mensajes asincrónicos
messageQueue.enviarMensaje("evento-creado", jsonData);
```

### 🔄 Patrón de Puertos y Adaptadores

```
┌─────────────────────────────────────────────────────┐
│           APPLICATION LAYER                         │
│                                                     │
│  ┌──────────────┐         ┌──────────────┐        │
│  │  Use Case    │  usa →  │  OCRService  │ Port   │
│  │              │         │  (interface) │        │
│  └──────────────┘         └──────────────┘        │
│                                    ↑                │
└────────────────────────────────────┼────────────────┘
                                     │ implementa
┌────────────────────────────────────┼────────────────┐
│           INFRASTRUCTURE LAYER     │                │
│                                    │                │
│                          ┌─────────┴─────────┐      │
│                          │ GoogleVisionOCR   │      │
│                          │ (implementación)  │      │
│                          └───────────────────┘      │
│  Se puede cambiar a:                                │
│  - AWS Textract                                     │
│  - Azure Computer Vision                            │
│  - Tesseract OCR                                    │
└─────────────────────────────────────────────────────┘
```

---

## 3️⃣ APPLICATION/USECASE - Use Case Interfaces

### 📋 ¿Qué son los Use Cases (Interfaces)?

Los **Use Case Interfaces** son **contratos** que definen las operaciones de negocio disponibles.

### 🎯 Propósito Principal

- **Definir** las acciones que el sistema puede realizar
- **Documentar** los requisitos funcionales
- **Establecer** contratos claros entre capas
- **Guiar** la implementación

### 📂 Estructura Actual

```
usecase/
├── auth/              # Casos de uso de autenticación
│   ├── LoginUseCase.java
│   └── ValidarSesionUseCase.java
├── evento/            # Casos de uso de eventos
│   ├── CrearEventoUseCase.java
│   └── ListarEventosActivosUseCase.java
└── gasto/             # Casos de uso de gastos
    ├── RegistrarGastoUseCase.java
    └── ProcesarImagenOCRUseCase.java
```

### 💡 Ejemplo Práctico: CrearEventoUseCase

```java
package datum.travels.application.usecase.evento;

import datum.travels.domain.model.Evento;

/**
 * Caso de uso: Crear un nuevo evento
 */
public interface CrearEventoUseCase {
    
    /**
     * Crea un nuevo evento
     * @param evento Datos del evento
     * @return Evento creado
     */
    Evento ejecutar(Evento evento);
}
```

### 🔑 Características de Use Case Interfaces

1. **Una responsabilidad:** Cada interfaz hace UNA cosa
2. **Nombre descriptivo:** Describe la acción (Crear, Listar, Procesar, etc.)
3. **Método ejecutar():** Convención común para ejecutar el caso de uso
4. **Parámetros claros:** Especifica qué necesita para funcionar

### 📋 Use Cases Disponibles

#### Módulo: **auth/**

**LoginUseCase**
```java
String token = loginUseCase.autenticar(username, password);
```

**ValidarSesionUseCase**
```java
boolean valido = validarSesion.validar(token);
Long userId = validarSesion.obtenerUsuarioDesdeToken(token);
```

#### Módulo: **evento/**

**CrearEventoUseCase**
```java
Evento nuevo = crearEvento.ejecutar(evento);
```

**ListarEventosActivosUseCase**
```java
List<Evento> activos = listarActivos.ejecutar();
```

#### Módulo: **gasto/**

**RegistrarGastoUseCase**
```java
Gasto registrado = registrarGasto.ejecutar(gasto);
```

**ProcesarImagenOCRUseCase**
```java
DatosExtraidosDTO datos = procesarOCR.ejecutar(imagenBase64, gastoId);
```

### 🎭 Principio Single Responsibility

Cada Use Case hace **UNA SOLA COSA**:

❌ **Mal diseño:**
```java
interface EventoUseCase {
    Evento crear(...);
    List<Evento> listar(...);
    Evento actualizar(...);
    void eliminar(...);
    Evento completar(...);
    Evento cancelar(...);
}
```

✅ **Buen diseño:**
```java
interface CrearEventoUseCase { ... }
interface ListarEventosUseCase { ... }
interface ActualizarEventoUseCase { ... }
interface EliminarEventoUseCase { ... }
interface CompletarEventoUseCase { ... }
interface CancelarEventoUseCase { ... }
```

---

## 4️⃣ APPLICATION/USECASES - Use Case Implementations

### ⚙️ ¿Qué son las Implementaciones de Use Cases?

Son las **clases concretas** que implementan la lógica de los casos de uso definidos en las interfaces.

### 🎯 Propósito Principal

- **Orquestar** la lógica de negocio
- **Coordinar** entre domain y ports
- **Validar** reglas de negocio
- **Gestionar** transacciones

### 📂 Estructura Actual

```
usecases/
└── evento/
    └── EventoUseCaseImpl.java
```

### 💡 Ejemplo Práctico: EventoUseCaseImpl

```java
package datum.travels.application.usecases.evento;

import datum.travels.domain.exception.BusinessValidationException;
import datum.travels.domain.exception.EventoNotFoundException;
import datum.travels.domain.model.Evento;
import datum.travels.domain.model.EstadoEvento;
import datum.travels.domain.ports.in.EventoUseCase;
import datum.travels.domain.ports.out.EventoRepositoryPort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Implementación de los casos de uso para gestión de eventos
 */
@ApplicationScoped  // ← CDI: Una instancia por aplicación
public class EventoUseCaseImpl implements EventoUseCase {

    @Inject  // ← Inyección de dependencias
    EventoRepositoryPort eventoRepository;

    @Override
    @Transactional  // ← Gestión automática de transacciones
    public Evento crearEvento(Evento evento) {
        // 1. Validaciones de negocio
        if (evento.getNombre() == null || evento.getNombre().trim().isEmpty()) {
            throw new BusinessValidationException("El nombre del evento es obligatorio");
        }

        if (evento.getEmpleadoId() == null) {
            throw new BusinessValidationException("El ID del empleado es obligatorio");
        }

        // 2. Guardar el evento (delegado al repositorio)
        return eventoRepository.save(evento);
    }

    @Override
    public List<Evento> obtenerEventosPorEmpleado(Long empleadoId) {
        // 1. Validar entrada
        if (empleadoId == null) {
            throw new BusinessValidationException("El ID del empleado es obligatorio");
        }

        // 2. Delegar al repositorio
        return eventoRepository.findByEmpleadoId(empleadoId);
    }

    @Override
    @Transactional
    public Evento completarEvento(Long eventoId) {
        // 1. Obtener el evento
        Evento evento = obtenerEventoPorId(eventoId);
        
        // 2. Cambiar estado (lógica de dominio)
        evento.completar();  // ← Método del dominio
        
        // 3. Persistir cambios
        return eventoRepository.save(evento);
    }
}
```

### 🔑 Características Clave

#### 1. **Anotaciones CDI (Context and Dependency Injection)**

```java
@ApplicationScoped  // Singleton por aplicación
@Inject            // Inyectar dependencias
@Transactional     // Gestión de transacciones
```

#### 2. **Orquestación de Lógica**

```java
public Evento completarEvento(Long eventoId) {
    // Paso 1: Obtener datos
    Evento evento = obtenerEventoPorId(eventoId);
    
    // Paso 2: Aplicar lógica de dominio
    evento.completar();  // ← Delega al dominio
    
    // Paso 3: Persistir
    return eventoRepository.save(evento);  // ← Delega al repositorio
}
```

#### 3. **Validaciones de Negocio**

```java
if (evento.getNombre() == null || evento.getNombre().trim().isEmpty()) {
    throw new BusinessValidationException("El nombre del evento es obligatorio");
}
```

#### 4. **Manejo de Excepciones**

```java
return eventoRepository.findByEventoId(eventoId)
    .orElseThrow(() -> new EventoNotFoundException(eventoId));
```

### 📊 Flujo Completo de un Use Case

```
┌──────────────────────────────────────────────────────────┐
│  1. REST Controller recibe petición                      │
│     POST /api/eventos { "nombreEvento": "Viaje" }       │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  2. Mapper convierte DTO → Domain                        │
│     CrearEventoDTO → Evento (domain object)              │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  3. Use Case ejecuta lógica                              │
│     EventoUseCaseImpl.crearEvento(evento)                │
│     - Valida reglas de negocio                           │
│     - Coordina con repositorio                           │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  4. Repositorio (Port) persiste                          │
│     EventoRepositoryPort.save(evento)                    │
│     - Implementado en Infrastructure                     │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  5. Respuesta convertida a DTO                           │
│     Evento → EventoResponseDTO                           │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  6. REST Controller devuelve JSON                        │
│     { "id": 1, "nombre": "Viaje", "estado": "ACTIVO" }  │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Completo entre las 4 Carpetas

### Escenario: Crear un Evento

```
┌─────────────┐
│  1. Cliente │ Envía POST /api/eventos
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Infrastructure: REST Controller                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ @POST                                            │  │
│  │ public Response crearEvento(CrearEventoDTO dto)  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────────────┘
              │ usa DTO
              ▼
┌─────────────────────────────────────────────────────────┐
│  APPLICATION: DTO                                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ CrearEventoDTO                                   │  │
│  │ - nombreEvento: String                           │  │
│  │ - idEmpleado: Long                               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────────────┘
              │ mapea a Domain
              ▼
┌─────────────────────────────────────────────────────────┐
│  APPLICATION: UseCase Implementation                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ EventoUseCaseImpl.crearEvento(Evento evento)     │  │
│  │ 1. Validar reglas de negocio                     │  │
│  │ 2. Llamar al repository port                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────────────┘
              │ usa Port
              ▼
┌─────────────────────────────────────────────────────────┐
│  APPLICATION: Port (Interface)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ EventoRepositoryPort.save(evento)                │  │
│  │ (solo define el contrato)                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────────────┘
              │ implementado en Infrastructure
              ▼
┌─────────────────────────────────────────────────────────┐
│  Infrastructure: Repository Adapter                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ EventoRepositoryAdapter.save(evento)             │  │
│  │ - Convierte Domain → Entity (JPA)                │  │
│  │ - persist() con Hibernate                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
        Base de Datos
```

---

## 📚 Resumen de Responsabilidades

| Carpeta | Responsabilidad | Ejemplo |
|---------|----------------|---------|
| **dto/** | Transferir datos entre capas | `CrearEventoDTO` |
| **port/** | Definir contratos para servicios externos | `OCRService.java` |
| **usecase/** | Definir operaciones de negocio (contratos) | `CrearEventoUseCase.java` |
| **usecases/** | Implementar la lógica de orquestación | `EventoUseCaseImpl.java` |

---

## ✅ Beneficios de Esta Arquitectura

### 1. **Separación de Responsabilidades**
- DTOs → Solo transferir datos
- Ports → Solo definir contratos
- Use Cases → Solo orquestar lógica

### 2. **Testabilidad**
```java
@Test
void testCrearEvento() {
    // Mock del port
    EventoRepositoryPort mockRepo = mock(EventoRepositoryPort.class);
    
    // Crear use case con mock
    EventoUseCaseImpl useCase = new EventoUseCaseImpl(mockRepo);
    
    // Probar lógica aislada
    Evento evento = useCase.crearEvento(eventoTest);
}
```

### 3. **Flexibilidad**
Cambiar implementación sin afectar lógica:
```java
// Antes: AWS S3
FileStorageService → AWSS3StorageAdapter

// Después: Google Cloud
FileStorageService → GoogleCloudStorageAdapter
// ← Use Case NO cambia
```

### 4. **Mantenibilidad**
- Código organizado por funcionalidad
- Fácil encontrar dónde hacer cambios
- Cada clase tiene un propósito claro

---

## 🎓 Convenciones de Nombres

### DTOs
- **Request:** `CrearEventoDTO`, `LoginRequestDTO`
- **Response:** `EventoResponseDTO`, `LoginResponseDTO`
- **Resumen:** `EventoResumenDTO` (para listados)
- **Detalle:** `EventoDetalleDTO` (con relaciones)

### Ports
- **Sufijo:** `Service`
- **Ejemplos:** `OCRService`, `EmailService`, `FileStorageService`

### Use Cases (Interfaces)
- **Patrón:** `[Verbo][Sustantivo]UseCase`
- **Ejemplos:** `CrearEventoUseCase`, `ListarGastosUseCase`

### Use Cases (Implementaciones)
- **Patrón:** `[Nombre]UseCaseImpl`
- **Ejemplos:** `EventoUseCaseImpl`, `GastoUseCaseImpl`

---

## 🚀 Próximos Pasos para Implementar

1. **Completar todas las interfaces de Use Cases:**
   - `ActualizarEventoUseCase`
   - `EliminarEventoUseCase`
   - `ListarGastosPorEventoUseCase`

2. **Implementar los Use Cases:**
   - Crear clases `*UseCaseImpl` con la lógica

3. **Implementar los Ports:**
   - Crear adaptadores en `infrastructure/adapter/output/`
   - Ejemplo: `GoogleVisionOCRAdapter implements OCRService`

4. **Crear REST Controllers:**
   - En `infrastructure/adapter/input/rest/`
   - Usar los Use Cases inyectados

---

**📖 Documentación creada:** Enero 2025  
**📌 Estado:** Capa Application completamente estructurada
