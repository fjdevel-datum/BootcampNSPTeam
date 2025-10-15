# 📘 Guía 02: Capa APPLICATION (Casos de Uso)

> **Tiempo de lectura:** 15 minutos  
> **Dificultad:** ⭐⭐⭐ Intermedia  
> **Objetivo:** Entender cómo orquestar la lógica de negocio

---

## 🎯 ¿Qué es la Capa de Aplicación?

La capa **APPLICATION** es la **orquestadora**. Coordina:
- **Qué** hacer (casos de uso)
- **Cómo** transferir datos (DTOs)
- **Qué servicios externos** necesita (Ports)

### 🔑 Característica Principal

**ORQUESTACIÓN**: No tiene lógica de negocio propia, solo coordina el Domain con el mundo exterior.

---

## 🏗️ Estructura de la Capa APPLICATION

```
application/
├── dto/             # 📦 Data Transfer Objects (transferir datos)
├── port/            # 🔌 Ports (contratos para servicios externos)
└── usecase/         # 📋 Use Cases (casos de uso)
    ├── auth/        # Autenticación
    ├── evento/      # Gestión de eventos
    └── gasto/       # Gestión de gastos
```

**✨ SIMPLIFICACIÓN:** Ya NO tienes `application/usecases/` separado. Todo está en `usecase/`.

---

## 1️⃣ APPLICATION/DTO - Data Transfer Objects

### 📦 ¿Qué son los DTOs?

Los **DTOs** son objetos simples para **transferir datos** entre el frontend y backend.

**Función Principal:**
- **Desacoplar** el API REST del Domain
- **Validar** datos de entrada
- **Controlar** qué datos se exponen

### 📂 Tu Estructura de DTOs

```
dto/
├── auth/              # Autenticación
│   ├── LoginRequestDTO.java
│   └── LoginResponseDTO.java
├── categoria/         # Categorías de gasto
│   └── CategoriaGastoDTO.java
├── empleado/          # Empleados
│   └── EmpleadoDTO.java
├── evento/            # Eventos (viajes)
│   ├── CrearEventoDTO.java          # Para crear
│   ├── EventoDetalleDTO.java        # Vista detallada
│   ├── EventoResponseDTO.java       # Respuesta general
│   └── EventoResumenDTO.java        # Para listados
├── gasto/             # Gastos
│   ├── CrearGastoDTO.java
│   ├── GastoResponseDTO.java
│   ├── GastoResumenDTO.java
│   └── OCRResponseDTO.java          # Datos del OCR
└── tarjeta/           # Tarjetas corporativas
    └── TarjetaDTO.java
```

### 💡 Ejemplo Práctico: CrearEventoDTO.java

```java
package datum.travels.application.dto.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para crear un nuevo evento desde el modal en HOME
 */
public class CrearEventoDTO {

    @NotBlank(message = "El nombre del evento es requerido")
    private String nombreEvento;

    @NotNull(message = "El ID del empleado es requerido")
    private Long idEmpleado;

    // OPCIONAL: Para eventos con más datos
    private String descripcion;
    private Long paisId;

    // ========================
    // GETTERS Y SETTERS
    // ========================
    public String getNombreEvento() {
        return nombreEvento;
    }

    public void setNombreEvento(String nombreEvento) {
        this.nombreEvento = nombreEvento;
    }

    public Long getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Long idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getPaisId() {
        return paisId;
    }

    public void setPaisId(Long paisId) {
        this.paisId = paisId;
    }
}
```

### 💡 Ejemplo: EventoResponseDTO.java

```java
package datum.travels.application.dto.evento;

import java.time.LocalDateTime;

/**
 * DTO para devolver un evento completo al frontend
 */
public class EventoResponseDTO {

    private Long id;
    private String nombreEvento;
    private String descripcion;
    private String estado;              // "ACTIVO", "COMPLETADO"
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    
    // Datos del empleado (evita lazy loading)
    private Long empleadoId;
    private String empleadoNombre;
    
    // Datos del país
    private String paisNombre;
    private String paisCodigo;
    
    // Estadísticas
    private Integer totalGastos;
    private Double montoTotal;

    // ========================
    // CONSTRUCTOR VACÍO (requerido por Jackson)
    // ========================
    public EventoResponseDTO() {}

    // ========================
    // CONSTRUCTOR COMPLETO
    // ========================
    public EventoResponseDTO(Long id, String nombreEvento, String estado, 
                            LocalDateTime fechaCreacion, String empleadoNombre) {
        this.id = id;
        this.nombreEvento = nombreEvento;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.empleadoNombre = empleadoNombre;
    }

    // ========================
    // GETTERS Y SETTERS
    // ========================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreEvento() { return nombreEvento; }
    public void setNombreEvento(String nombreEvento) { this.nombreEvento = nombreEvento; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { 
        this.fechaCreacion = fechaCreacion; 
    }

    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { 
        this.fechaInicio = fechaInicio; 
    }

    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }

    public Long getEmpleadoId() { return empleadoId; }
    public void setEmpleadoId(Long empleadoId) { this.empleadoId = empleadoId; }

    public String getEmpleadoNombre() { return empleadoNombre; }
    public void setEmpleadoNombre(String empleadoNombre) { 
        this.empleadoNombre = empleadoNombre; 
    }

    public String getPaisNombre() { return paisNombre; }
    public void setPaisNombre(String paisNombre) { this.paisNombre = paisNombre; }

    public String getPaisCodigo() { return paisCodigo; }
    public void setPaisCodigo(String paisCodigo) { this.paisCodigo = paisCodigo; }

    public Integer getTotalGastos() { return totalGastos; }
    public void setTotalGastos(Integer totalGastos) { this.totalGastos = totalGastos; }

    public Double getMontoTotal() { return montoTotal; }
    public void setMontoTotal(Double montoTotal) { this.montoTotal = montoTotal; }
}
```

### 🔑 Puntos Clave de los DTOs

#### 1. **Validaciones Jakarta**
```java
@NotBlank(message = "El nombre es requerido")
@NotNull(message = "El ID es requerido")
@Email(message = "Email inválido")
@Size(min = 3, max = 100, message = "Entre 3 y 100 caracteres")
@Pattern(regexp = "^[A-Z]{2}$", message = "Código de país inválido")
```

#### 2. **Diferentes DTOs para Diferentes Casos**
```java
CrearEventoDTO       // Para crear (solo campos necesarios)
EventoResponseDTO    // Para devolver (todos los datos)
EventoResumenDTO     // Para listar (datos mínimos)
EventoDetalleDTO     // Para ver detalle (con relaciones)
```

#### 3. **Sin Lógica de Negocio**
```java
// ✅ BIEN: Solo datos
public class CrearEventoDTO {
    private String nombreEvento;
    private Long idEmpleado;
    // Solo getters/setters
}

// ❌ MAL: Con lógica
public class CrearEventoDTO {
    private String nombreEvento;
    
    public void guardarEnBaseDatos() {  // ← NO!
        // ...
    }
}
```

### 🔄 Flujo de DTOs

```
┌──────────────┐
│   Frontend   │
│   (React)    │
└──────┬───────┘
       │ POST /api/eventos
       │ { "nombreEvento": "Viaje", "idEmpleado": 1 }
       ▼
┌────────────────────────────────────┐
│   REST Controller                  │
│   crearEvento(CrearEventoDTO dto)  │
└──────┬─────────────────────────────┘
       │ Mapper: DTO → Domain
       ▼
┌────────────────────────────────────┐
│   Domain                           │
│   Evento evento = new Evento(...)  │
└──────┬─────────────────────────────┘
       │ Use Case procesa
       ▼
┌────────────────────────────────────┐
│   Domain (guardado)                │
│   Evento evento = repository...    │
└──────┬─────────────────────────────┘
       │ Mapper: Domain → DTO
       ▼
┌────────────────────────────────────┐
│   REST Controller                  │
│   EventoResponseDTO response       │
└──────┬─────────────────────────────┘
       │ JSON Response
       ▼
┌──────────────┐
│   Frontend   │
│   (React)    │
└──────────────┘
```

---

## 2️⃣ APPLICATION/PORT - Ports (Servicios Externos)

### 🔌 ¿Qué son los Ports?

Los **Ports** son **interfaces** para comunicarte con servicios externos:
- OCR (extraer texto de imágenes)
- Storage (guardar archivos)
- Email (enviar reportes)
- Reportes (generar Excel/PDF)

**Importante:** Son SOLO interfaces. La implementación está en `infrastructure/adapter/output/`.

### 📂 Tus Ports Actuales

```
port/
├── OCRService.java                 # Procesar imágenes con OCR
├── FileStorageService.java         # Guardar/recuperar archivos
├── EmailService.java               # Enviar emails
├── ReportGeneratorService.java     # Generar Excel/PDF
└── MessageQueueService.java        # Mensajería asíncrona (JMS)
```

### 💡 Ejemplo Práctico: OCRService.java

```java
package datum.travels.application.port;

/**
 * PORT: Servicio de OCR (Optical Character Recognition)
 * 
 * Contrato para procesar imágenes y extraer datos
 * La implementación puede ser: Tesseract, Google Vision, AWS Textract, etc.
 */
public interface OCRService {

    /**
     * Procesa una imagen en Base64 y extrae datos
     * 
     * @param imagenBase64 Imagen codificada en Base64
     * @return Datos extraídos (monto, fecha, categoría)
     */
    OCRDataResponse procesarImagen(String imagenBase64);

    /**
     * Procesa una imagen desde una URL
     * 
     * @param imageUrl URL de la imagen
     * @return Datos extraídos
     */
    OCRDataResponse procesarImagenDesdeUrl(String imageUrl);
}
```

### 💡 Ejemplo: FileStorageService.java

```java
package datum.travels.application.port;

import java.io.InputStream;

/**
 * PORT: Servicio de Almacenamiento de Archivos
 * 
 * Contrato para guardar/recuperar archivos
 * La implementación puede ser: Local, AWS S3, Google Cloud Storage, etc.
 */
public interface FileStorageService {

    /**
     * Guarda un archivo
     * 
     * @param contenido Stream del archivo
     * @param nombreArchivo Nombre del archivo
     * @param carpeta Carpeta donde guardar
     * @return URL del archivo guardado
     */
    String guardarArchivo(InputStream contenido, String nombreArchivo, String carpeta);

    /**
     * Recupera un archivo
     * 
     * @param ruta Ruta del archivo
     * @return Stream del archivo
     */
    InputStream recuperarArchivo(String ruta);

    /**
     * Elimina un archivo
     * 
     * @param ruta Ruta del archivo
     */
    void eliminarArchivo(String ruta);

    /**
     * Verifica si un archivo existe
     * 
     * @param ruta Ruta del archivo
     * @return true si existe
     */
    boolean existeArchivo(String ruta);
}
```

### 🔑 ¿Por qué usar Ports?

#### 1. **Inversión de Dependencias**
```
┌─────────────────────────────────────────────────────────┐
│           APPLICATION LAYER                             │
│                                                         │
│  ┌──────────────────────────────────────────────┐       │
│  │ Use Case usa → OCRService (interface)        │       │
│  └──────────────────────────────────────────────┘       │
│                            ▲                            │
└────────────────────────────┼────────────────────────────┘
                             │ implementa
┌────────────────────────────┼────────────────────────────┐
│           INFRASTRUCTURE LAYER                          │
│                            │                            │
│  ┌─────────────────────────┴────────────────────────┐   │
│  │ TesseractOCRAdapter implements OCRService        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Se puede cambiar a:                                    │
│  - GoogleVisionOCRAdapter                               │
│  - AWSTextractAdapter                                   │
│  - AzureComputerVisionAdapter                           │
│  ← Sin cambiar el Use Case                              │
└─────────────────────────────────────────────────────────┘
```

#### 2. **Fácil Testing**
```java
@Test
void testProcesarImagenOCR() {
    // Mock del port
    OCRService mockOCR = mock(OCRService.class);
    when(mockOCR.procesarImagen(anyString()))
        .thenReturn(new OCRDataResponse(100.0, "TAXI", "2025-01-15"));
    
    // Crear use case con mock
    ProcesarImagenOCRUseCase useCase = new ProcesarImagenOCRUseCaseImpl(mockOCR);
    
    // Probar
    OCRResponseDTO result = useCase.ejecutar("base64...", 1L);
    
    assertEquals(100.0, result.getMonto());
}
```

#### 3. **Cambiar Implementación sin Afectar Lógica**
```java
// Antes: Tesseract (local)
@ApplicationScoped
public class TesseractOCRAdapter implements OCRService {
    // Implementación con Tesseract
}

// Después: Google Vision (cloud)
@ApplicationScoped
public class GoogleVisionOCRAdapter implements OCRService {
    // Implementación con Google Vision
}

// ← El Use Case NO cambia, solo se inyecta otra implementación
```

---

## 3️⃣ APPLICATION/USECASE - Casos de Uso

### 📋 ¿Qué son los Use Cases?

Los **Use Cases** son las **acciones** que tu sistema puede realizar.

**Cada carpeta = un módulo de negocio:**
- `auth/` → Autenticación y seguridad
- `evento/` → Gestión de eventos
- `gasto/` → Gestión de gastos

### 📂 Tu Estructura de Use Cases

```
usecase/
├── auth/
│   ├── LoginUseCase.java                # Interface
│   └── ValidarSesionUseCase.java        # Interface
├── evento/
│   ├── CrearEventoUseCase.java          # Interface
│   ├── ListarEventosActivosUseCase.java # Interface
│   └── EventoUseCaseImpl.java           # ✨ IMPLEMENTACIÓN
└── gasto/
    ├── RegistrarGastoUseCase.java       # Interface
    └── ProcesarImagenOCRUseCase.java    # Interface
```

### 💡 Ejemplo: CrearEventoUseCase.java (Interface)

```java
package datum.travels.application.usecase.evento;

import datum.travels.domain.model.Evento;

/**
 * CASO DE USO: Crear un nuevo evento
 */
public interface CrearEventoUseCase {

    /**
     * Ejecuta el caso de uso de crear evento
     * 
     * @param evento Datos del evento a crear
     * @return Evento creado con ID asignado
     */
    Evento ejecutar(Evento evento);
}
```

### 💡 Ejemplo: EventoUseCaseImpl.java (Implementación)

```java
package datum.travels.application.usecase.evento;

import datum.travels.domain.exception.EventoNoEncontradoException;
import datum.travels.domain.model.Evento;
import datum.travels.domain.model.EstadoEvento;
import datum.travels.domain.repository.EventoRepository;
import datum.travels.domain.repository.EmpleadoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;

/**
 * IMPLEMENTACIÓN: Casos de uso de Evento
 * 
 * Orquesta la lógica para gestionar eventos
 */
@ApplicationScoped  // ← CDI: Bean singleton
public class EventoUseCaseImpl implements CrearEventoUseCase, 
                                          ListarEventosActivosUseCase {

    // ========================
    // DEPENDENCIAS INYECTADAS
    // ========================
    @Inject
    EventoRepository eventoRepository;

    @Inject
    EmpleadoRepository empleadoRepository;

    // ========================
    // CASO DE USO: Crear Evento
    // ========================
    @Override
    @Transactional  // ← Maneja transacción automáticamente
    public Evento ejecutar(Evento evento) {
        // 1. Validaciones de negocio
        validarEvento(evento);

        // 2. Verificar que el empleado existe
        Long empleadoId = evento.getEmpleado().getId();
        if (!empleadoRepository.existePorId(empleadoId)) {
            throw new IllegalArgumentException(
                "Empleado no encontrado: " + empleadoId
            );
        }

        // 3. Establecer valores por defecto
        if (evento.getEstado() == null) {
            evento.setEstado(EstadoEvento.ACTIVO);
        }

        // 4. Guardar en base de datos
        return eventoRepository.guardar(evento);
    }

    // ========================
    // CASO DE USO: Listar Eventos Activos
    // ========================
    @Override
    public List<Evento> listarEventosActivos() {
        return eventoRepository.buscarPorEstado(EstadoEvento.ACTIVO);
    }

    // ========================
    // MÉTODOS PRIVADOS DE APOYO
    // ========================
    private void validarEvento(Evento evento) {
        if (evento == null) {
            throw new IllegalArgumentException("El evento no puede ser nulo");
        }

        if (evento.getNombre() == null || evento.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException(
                "El nombre del evento es obligatorio"
            );
        }

        if (evento.getEmpleado() == null || evento.getEmpleado().getId() == null) {
            throw new IllegalArgumentException(
                "El empleado es obligatorio"
            );
        }
    }
}
```

### 🔑 Puntos Clave de Use Cases

#### 1. **Anotaciones CDI**
```java
@ApplicationScoped  // Singleton por aplicación
@Inject            // Inyección de dependencias
@Transactional     // Manejo automático de transacciones
```

#### 2. **Orquestación, NO Lógica de Negocio**
```java
// ✅ BIEN: Orquesta, delega lógica al domain
@Override
@Transactional
public Evento completarEvento(Long eventoId) {
    // 1. Obtener
    Evento evento = obtenerPorId(eventoId);
    
    // 2. Lógica de dominio
    evento.completar();  // ← La lógica está en el Domain
    
    // 3. Persistir
    return eventoRepository.guardar(evento);
}

// ❌ MAL: Lógica de negocio en el use case
@Override
@Transactional
public Evento completarEvento(Long eventoId) {
    Evento evento = obtenerPorId(eventoId);
    
    // ← NO! La lógica debería estar en Evento.completar()
    if (evento.getGastos().isEmpty()) {
        throw new Exception("...");
    }
    evento.setEstado(EstadoEvento.COMPLETADO);
    
    return eventoRepository.guardar(evento);
}
```

#### 3. **Una Implementación Puede Tener Múltiples Interfaces**
```java
// Implementa varios use cases relacionados
public class EventoUseCaseImpl implements CrearEventoUseCase,
                                          ListarEventosActivosUseCase,
                                          CompletarEventoUseCase {
    // Todas las operaciones de eventos juntas
}
```

---

## 📊 Flujo Completo de un Caso de Uso

```
┌──────────────────────────────────────────────────────────┐
│  1. Usuario hace clic en "Crear Evento"                 │
│     Frontend envía: POST /api/eventos                   │
│     { "nombreEvento": "Viaje GT", "idEmpleado": 1 }    │
└─────────────────┬────────────────────────────────────────┘
                  ▼
┌──────────────────────────────────────────────────────────┐
│  2. REST Controller (Infrastructure)                    │
│     EventoResource.crearEvento(CrearEventoDTO dto)      │
└─────────────────┬────────────────────────────────────────┘
                  │ Mapper: DTO → Domain
                  ▼
┌──────────────────────────────────────────────────────────┐
│  3. USE CASE (Application)                              │
│     EventoUseCaseImpl.ejecutar(evento)                  │
│     - Validar datos                                     │
│     - Verificar empleado existe                         │
│     - Establecer defaults                               │
│     - Llamar repositorio                                │
└─────────────────┬────────────────────────────────────────┘
                  │ Port: Repository
                  ▼
┌──────────────────────────────────────────────────────────┐
│  4. REPOSITORY (Domain → Infrastructure)                │
│     EventoRepository.guardar(evento)                    │
└─────────────────┬────────────────────────────────────────┘
                  │ JPA/Hibernate
                  ▼
┌──────────────────────────────────────────────────────────┐
│  5. BASE DE DATOS                                       │
│     INSERT INTO eventos (...)                           │
└─────────────────┬────────────────────────────────────────┘
                  │ Retorna entidad con ID
                  ▼
┌──────────────────────────────────────────────────────────┐
│  6. Mapper: Domain → DTO                                │
│     Evento → EventoResponseDTO                          │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  7. REST Controller devuelve JSON                       │
│     { "id": 123, "nombreEvento": "Viaje GT", ... }     │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  8. Frontend muestra el evento creado                   │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Principios de la Capa APPLICATION

### 1. **Sin Lógica de Negocio**
```java
// ✅ BIEN: Delega al dominio
public Evento completar(Long id) {
    Evento evento = repository.buscarPorId(id).orElseThrow(...);
    evento.completar();  // ← Lógica en el dominio
    return repository.guardar(evento);
}

// ❌ MAL: Lógica en el use case
public Evento completar(Long id) {
    Evento evento = repository.buscarPorId(id).orElseThrow(...);
    if (evento.getGastos().isEmpty()) { ... }  // ← NO!
    evento.setEstado(EstadoEvento.COMPLETADO);
    return repository.guardar(evento);
}
```

### 2. **DTOs para Entrada/Salida**
```java
// ✅ BIEN: Usa DTOs
@POST
public Response crearEvento(CrearEventoDTO dto) {
    Evento evento = mapper.toEntity(dto);
    evento = useCase.ejecutar(evento);
    EventoResponseDTO response = mapper.toDTO(evento);
    return Response.ok(response).build();
}

// ❌ MAL: Expone entidades directamente
@POST
public Response crearEvento(Evento evento) {  // ← NO!
    evento = useCase.ejecutar(evento);
    return Response.ok(evento).build();  // ← Expone estructura interna
}
```

### 3. **Ports para Servicios Externos**
```java
// ✅ BIEN: Usa Port (interface)
@Inject
OCRService ocrService;  // ← Interface

public void procesar(String imagen) {
    OCRDataResponse data = ocrService.procesarImagen(imagen);
}

// ❌ MAL: Depende de implementación concreta
@Inject
TesseractOCRAdapter tesseract;  // ← Implementación específica

public void procesar(String imagen) {
    OCRDataResponse data = tesseract.procesarImagen(imagen);
}
```

---

## 🎓 Resumen Ejecutivo

| Carpeta | Propósito | Características |
|---------|-----------|-----------------|
| **dto/** | Transferir datos | - Validaciones Jakarta<br>- Sin lógica<br>- Diferentes para cada caso |
| **port/** | Contratos externos | - Solo interfaces<br>- Inversión de dependencias<br>- Fácil testing |
| **usecase/** | Orquestar lógica | - Interfaces + Implementaciones<br>- CDI (@ApplicationScoped)<br>- @Transactional |

---

## 🚀 Próximo Paso

**Siguiente guía:** `GUIA_03_INFRASTRUCTURE.md`

Aprenderás cómo la capa **INFRASTRUCTURE** implementa los ports y conecta con REST, bases de datos, y servicios externos.

---

**📖 Documentación creada:** Enero 2025  
**📌 Carpeta:** `application/`  
**✅ Estado:** Estructura simplificada (sin `usecases/` separado)
