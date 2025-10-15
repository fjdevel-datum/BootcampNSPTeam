# 🎯 TUTORIAL: Capa APPLICATION - Ejemplo Paso a Paso

## 📖 Introducción

Este tutorial te muestra cómo funciona la capa **APPLICATION** usando un ejemplo real: **Crear un Evento**.

---

## 🚀 Escenario Completo: Crear un Evento

### Requisito de Usuario
> "Como empleado, quiero crear un evento de viaje desde el HOME para poder gestionar mis gastos"

---

## PASO 1: Definir el DTO (Data Transfer Object)

### 📍 Ubicación
`application/dto/evento/CrearEventoDTO.java`

### 💡 ¿Para qué sirve?
Recibir los datos desde el frontend (React) de forma segura y validada.

### 📝 Código

```java
package datum.travels.application.dto.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para crear un evento desde el modal del HOME
 */
public class CrearEventoDTO {

    // ✅ Validación: No puede ser vacío
    @NotBlank(message = "El nombre del evento es requerido")
    private String nombreEvento;

    // ✅ Validación: No puede ser null
    @NotNull(message = "El ID del empleado es requerido")
    private Long idEmpleado;

    // Constructores
    public CrearEventoDTO() {}

    public CrearEventoDTO(String nombreEvento, Long idEmpleado) {
        this.nombreEvento = nombreEvento;
        this.idEmpleado = idEmpleado;
    }

    // Getters y Setters
    public String getNombreEvento() { return nombreEvento; }
    public void setNombreEvento(String nombreEvento) { 
        this.nombreEvento = nombreEvento; 
    }

    public Long getIdEmpleado() { return idEmpleado; }
    public void setIdEmpleado(Long idEmpleado) { 
        this.idEmpleado = idEmpleado; 
    }
}
```

### 🔑 Puntos Clave
- ✅ Solo tiene los datos necesarios (nombre e idEmpleado)
- ✅ Validaciones con Jakarta Validation (`@NotBlank`, `@NotNull`)
- ✅ Sin lógica de negocio, solo getters/setters
- ✅ Fácil de serializar a JSON

### 📤 JSON que recibirá el backend
```json
{
  "nombreEvento": "Viaje a Guatemala",
  "idEmpleado": 5
}
```

---

## PASO 2: Definir el Port (si es necesario)

### 📍 Ubicación
`application/port/EventoNotificationService.java` (ejemplo)

### 💡 ¿Para qué sirve?
Si necesitamos notificar cuando se crea un evento, definimos un contrato (interface).

### 📝 Código (Opcional para este ejemplo)

```java
package datum.travels.application.port;

/**
 * Puerto para notificaciones de eventos
 */
public interface EventoNotificationService {
    
    /**
     * Notifica que se creó un evento
     */
    void notificarEventoCreado(Long eventoId, String nombreEvento);
}
```

### 🔑 Puntos Clave
- ✅ Es una **interface** (contrato)
- ✅ No tiene implementación (eso va en infrastructure)
- ✅ Permite cambiar el servicio de notificación sin tocar la lógica

---

## PASO 3: Definir el Use Case (Interface)

### 📍 Ubicación
`application/usecase/evento/CrearEventoUseCase.java`

### 💡 ¿Para qué sirve?
Define **QUÉ** hace el sistema, no **CÓMO** lo hace.

### 📝 Código

```java
package datum.travels.application.usecase.evento;

import datum.travels.domain.model.Evento;

/**
 * Caso de uso: Crear un nuevo evento
 */
public interface CrearEventoUseCase {
    
    /**
     * Crea un nuevo evento
     * @param evento Datos del evento (objeto de dominio)
     * @return Evento creado con ID asignado
     */
    Evento ejecutar(Evento evento);
}
```

### 🔑 Puntos Clave
- ✅ Una sola responsabilidad: **Crear** evento
- ✅ Recibe un objeto de **dominio** (no DTO)
- ✅ Retorna un objeto de **dominio** (no DTO)
- ✅ Método `ejecutar()` por convención

### 📊 Flujo de datos
```
DTO → (Mapper) → Domain → UseCase.ejecutar() → Domain
```

---

## PASO 4: Implementar el Use Case

### 📍 Ubicación
`application/usecases/evento/CrearEventoUseCaseImpl.java`

### 💡 ¿Para qué sirve?
Implementa la **lógica de orquestación**: validaciones, coordinación con repositorio, manejo de transacciones.

### 📝 Código Completo

```java
package datum.travels.application.usecases.evento;

import datum.travels.application.usecase.evento.CrearEventoUseCase;
import datum.travels.domain.exception.BusinessValidationException;
import datum.travels.domain.model.Evento;
import datum.travels.domain.model.EstadoEvento;
import datum.travels.domain.repository.EventoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;

/**
 * Implementación: Crear un evento
 */
@ApplicationScoped  // ← Singleton manejado por CDI
public class CrearEventoUseCaseImpl implements CrearEventoUseCase {

    // ────────────────────────────────────────────────────────
    // DEPENDENCIAS (inyectadas automáticamente)
    // ────────────────────────────────────────────────────────
    
    @Inject
    EventoRepository eventoRepository;  // ← Puerto para persistencia

    // Opcional: Si quisiéramos notificar
    // @Inject
    // EventoNotificationService notificationService;

    // ────────────────────────────────────────────────────────
    // MÉTODO PRINCIPAL
    // ────────────────────────────────────────────────────────
    
    @Override
    @Transactional  // ← Si algo falla, hace rollback automático
    public Evento ejecutar(Evento evento) {
        
        // ═══════════════════════════════════════════════════
        // PASO 1: VALIDACIONES DE NEGOCIO
        // ═══════════════════════════════════════════════════
        
        validarDatosEvento(evento);
        
        // ═══════════════════════════════════════════════════
        // PASO 2: ESTABLECER VALORES POR DEFECTO
        // ═══════════════════════════════════════════════════
        
        if (evento.getEstado() == null) {
            evento.setEstado(EstadoEvento.ACTIVO);
        }
        
        if (evento.getFechaInicio() == null) {
            evento.setFechaInicio(LocalDate.now());
        }
        
        // ═══════════════════════════════════════════════════
        // PASO 3: PERSISTIR EN BASE DE DATOS
        // ═══════════════════════════════════════════════════
        
        Evento eventoGuardado = eventoRepository.guardar(evento);
        
        // ═══════════════════════════════════════════════════
        // PASO 4: NOTIFICACIONES (Opcional)
        // ═══════════════════════════════════════════════════
        
        // Si tuviéramos un servicio de notificaciones:
        // notificationService.notificarEventoCreado(
        //     eventoGuardado.getId(), 
        //     eventoGuardado.getNombre()
        // );
        
        // ═══════════════════════════════════════════════════
        // PASO 5: RETORNAR EVENTO CREADO
        // ═══════════════════════════════════════════════════
        
        return eventoGuardado;
    }

    // ────────────────────────────────────────────────────────
    // MÉTODOS PRIVADOS DE VALIDACIÓN
    // ────────────────────────────────────────────────────────
    
    private void validarDatosEvento(Evento evento) {
        // Validar nombre
        if (evento.getNombre() == null || evento.getNombre().trim().isEmpty()) {
            throw new BusinessValidationException(
                "El nombre del evento es obligatorio"
            );
        }
        
        // Validar longitud del nombre
        if (evento.getNombre().length() > 255) {
            throw new BusinessValidationException(
                "El nombre del evento no puede exceder 255 caracteres"
            );
        }
        
        // Validar empleado
        if (evento.getEmpleadoId() == null) {
            throw new BusinessValidationException(
                "El ID del empleado es obligatorio"
            );
        }
        
        // Otras validaciones según reglas de negocio...
    }
}
```

### 🔑 Puntos Clave Explicados

#### 1. **@ApplicationScoped**
```java
@ApplicationScoped
```
- Crea **UNA SOLA instancia** para toda la aplicación
- Gestionada por CDI (Context and Dependency Injection)
- Thread-safe y eficiente

#### 2. **@Inject**
```java
@Inject
EventoRepository eventoRepository;
```
- Inyección automática de dependencias
- No necesitas hacer `new EventoRepository()`
- Quarkus/CDI lo gestiona por ti

#### 3. **@Transactional**
```java
@Transactional
public Evento ejecutar(Evento evento) { ... }
```
- Inicia una transacción de base de datos
- Si todo va bien → **commit** automático
- Si hay excepción → **rollback** automático
- No necesitas manejar `begin()`, `commit()`, `rollback()`

#### 4. **Validaciones**
```java
if (evento.getNombre() == null || evento.getNombre().trim().isEmpty()) {
    throw new BusinessValidationException("...");
}
```
- Reglas de negocio específicas
- Lanza excepciones personalizadas
- Se pueden testear fácilmente

#### 5. **Delegación al Repository**
```java
Evento eventoGuardado = eventoRepository.guardar(evento);
```
- El Use Case **NO sabe** cómo se persiste (JPA, MongoDB, archivo)
- Solo usa la interface `EventoRepository`
- Implementación real está en `infrastructure/`

---

## PASO 5: Usar el Use Case desde un REST Controller

### 📍 Ubicación
`infrastructure/adapter/input/rest/EventoRestController.java`

### 📝 Código

```java
package datum.travels.infrastructure.adapter.input.rest;

import datum.travels.application.dto.evento.CrearEventoDTO;
import datum.travels.application.dto.evento.EventoResponseDTO;
import datum.travels.application.usecase.evento.CrearEventoUseCase;
import datum.travels.domain.model.Evento;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/eventos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EventoRestController {

    // ────────────────────────────────────────────────────────
    // DEPENDENCIAS
    // ────────────────────────────────────────────────────────
    
    @Inject
    CrearEventoUseCase crearEventoUseCase;  // ← Use Case inyectado

    // Mappers (conversores)
    @Inject
    EventoDTOMapper dtoMapper;  // DTO ↔ Domain

    // ────────────────────────────────────────────────────────
    // ENDPOINT: POST /api/eventos
    // ────────────────────────────────────────────────────────
    
    @POST
    public Response crearEvento(@Valid CrearEventoDTO dto) {
        
        // ══════════════════════════════════════════════════
        // PASO 1: Convertir DTO → Domain
        // ══════════════════════════════════════════════════
        
        Evento evento = new Evento();
        evento.setNombre(dto.getNombreEvento());
        evento.setEmpleadoId(dto.getIdEmpleado());
        
        // ══════════════════════════════════════════════════
        // PASO 2: Ejecutar Use Case
        // ══════════════════════════════════════════════════
        
        Evento eventoCreado = crearEventoUseCase.ejecutar(evento);
        
        // ══════════════════════════════════════════════════
        // PASO 3: Convertir Domain → DTO de respuesta
        // ══════════════════════════════════════════════════
        
        EventoResponseDTO response = dtoMapper.toResponseDTO(eventoCreado);
        
        // ══════════════════════════════════════════════════
        // PASO 4: Retornar respuesta HTTP 201 Created
        // ══════════════════════════════════════════════════
        
        return Response
            .status(Response.Status.CREATED)
            .entity(response)
            .build();
    }
}
```

---

## 📊 FLUJO COMPLETO VISUAL

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React)                                           │
│  POST /api/eventos                                          │
│  {                                                          │
│    "nombreEvento": "Viaje a Guatemala",                     │
│    "idEmpleado": 5                                          │
│  }                                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE: REST Controller                            │
│  EventoRestController.crearEvento(CrearEventoDTO dto)       │
│                                                             │
│  1. Recibe CrearEventoDTO                                   │
│  2. Valida con Jakarta Validation (@Valid)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION: DTO                                           │
│  CrearEventoDTO                                             │
│  - nombreEvento: "Viaje a Guatemala"                        │
│  - idEmpleado: 5                                            │
│                                                             │
│  ✅ Validaciones pasan (@NotBlank, @NotNull)                │
└──────────────────┬──────────────────────────────────────────┘
                   │ Mapper (DTO → Domain)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN: Evento (objeto puro)                               │
│  - nombre: "Viaje a Guatemala"                              │
│  - empleadoId: 5                                            │
│  - estado: null (se asignará después)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION: Use Case Implementation                       │
│  CrearEventoUseCaseImpl.ejecutar(evento)                    │
│                                                             │
│  1. validarDatosEvento(evento)                              │
│     ✅ Nombre válido                                        │
│     ✅ EmpleadoId válido                                    │
│                                                             │
│  2. Asignar valores por defecto                             │
│     → estado = ACTIVO                                       │
│     → fechaInicio = hoy                                     │
│                                                             │
│  3. eventoRepository.guardar(evento)  ← Usa el PORT         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN: Repository (Interface/Port)                        │
│  EventoRepository.guardar(evento)                           │
│  (solo define el contrato)                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ Implementado en Infrastructure
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE: Repository Adapter                         │
│  EventoRepositoryAdapter.guardar(evento)                    │
│                                                             │
│  1. Convertir Domain → Entity (JPA)                         │
│  2. entityManager.persist(entity)                           │
│  3. Convertir Entity → Domain                               │
│  4. Retornar Evento con ID asignado                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE                                                   │
│  INSERT INTO Evento (...)                                   │
│  → ID generado: 123                                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN: Evento (con ID)                                    │
│  - id: 123                                                  │
│  - nombre: "Viaje a Guatemala"                              │
│  - empleadoId: 5                                            │
│  - estado: ACTIVO                                           │
│  - fechaInicio: 2025-01-14                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ Mapper (Domain → DTO)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION: DTO Response                                  │
│  EventoResponseDTO                                          │
│  - id: 123                                                  │
│  - nombre: "Viaje a Guatemala"                              │
│  - estado: "ACTIVO"                                         │
│  - fechaInicio: "2025-01-14"                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE: REST Response                              │
│  HTTP 201 Created                                           │
│  {                                                          │
│    "id": 123,                                               │
│    "nombre": "Viaje a Guatemala",                           │
│    "estado": "ACTIVO",                                      │
│    "fechaInicio": "2025-01-14"                              │
│  }                                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React)                                           │
│  Recibe respuesta y actualiza UI                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Resumen de la Capa APPLICATION

| Componente | Ubicación | Responsabilidad | Ejemplo |
|------------|-----------|----------------|---------|
| **DTO** | `application/dto/evento/` | Transferir datos | `CrearEventoDTO` |
| **Port** | `application/port/` | Contrato para servicios | `OCRService` |
| **UseCase (Interface)** | `application/usecase/evento/` | Definir operación | `CrearEventoUseCase` |
| **UseCase (Impl)** | `application/usecases/evento/` | Orquestar lógica | `CrearEventoUseCaseImpl` |

---

## ✅ Beneficios Concretos

### 1. **Fácil de Testear**
```java
@Test
void testCrearEvento() {
    // Mock del repository
    EventoRepository mockRepo = mock(EventoRepository.class);
    
    // Crear use case con mock
    CrearEventoUseCaseImpl useCase = new CrearEventoUseCaseImpl();
    useCase.eventoRepository = mockRepo;
    
    // Crear evento de prueba
    Evento evento = new Evento();
    evento.setNombre("Test");
    evento.setEmpleadoId(1L);
    
    // Ejecutar
    useCase.ejecutar(evento);
    
    // Verificar que se llamó al repository
    verify(mockRepo).guardar(any(Evento.class));
}
```

### 2. **Fácil de Cambiar**
Si cambias de base de datos (Oracle → PostgreSQL), solo cambias la implementación del repository. El Use Case NO cambia.

### 3. **Reutilizable**
El mismo Use Case puede usarse desde:
- REST API
- GraphQL
- WebSocket
- CLI
- Tests

---

**📖 Creado:** Enero 2025  
**🎯 Nivel:** Tutorial Paso a Paso
