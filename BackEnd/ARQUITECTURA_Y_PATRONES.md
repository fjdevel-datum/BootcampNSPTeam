# Arquitectura y Patrones de Diseño - Backend Datum Travels

## 📐 Tipo de Arquitectura

### **Clean Architecture (Arquitectura Limpia) - Adaptación Pragmática**

El backend de Datum Travels implementa **Clean Architecture**, una arquitectura moderna propuesta por Robert C. Martin (Uncle Bob) que separa el código en capas con responsabilidades bien definidas.

---

## 🎯 ¿Por qué es considerada la MEJOR arquitectura?

### 1️⃣ **Independencia de Frameworks**
- La lógica de negocio NO depende de Quarkus, Hibernate o JPA
- Los Use Cases pueden probarse sin levantar el servidor
- Podríamos cambiar de Quarkus a Spring Boot sin tocar el dominio

**Ejemplo en el proyecto:**
```java
// ✅ CrearEventoUseCase NO conoce REST, JPA ni Quarkus
@ApplicationScoped
public class CrearEventoUseCase {
    @Inject
    EventoRepository eventoRepository; // ← Interface, no implementación
    
    @Transactional
    public EventoResponse execute(CrearEventoRequest request) {
        Evento evento = new Evento(request.nombreEvento(), request.idEmpleado());
        return EventoResponse.from(eventoRepository.save(evento));
    }
}
```

### 2️⃣ **Testeable al 100%**
- La lógica de negocio se puede probar sin base de datos real
- Los Use Cases aceptan mocks de repositorios
- No necesitas Docker corriendo para hacer pruebas unitarias

### 3️⃣ **Facilita el Trabajo en Equipo**
- Cada capa tiene un propósito claro
- Desarrolladores junior pueden trabajar en `infrastructure` sin romper el `domain`
- Los cambios en base de datos NO afectan la lógica de negocio

### 4️⃣ **Mantenible a Largo Plazo**
- Código organizado por **funcionalidad** (eventos, gastos, empleados)
- Fácil encontrar dónde está cada cosa
- Los cambios en UI/BD no afectan la lógica central

### 5️⃣ **Preparada para Escalar**
- Si mañana necesitamos microservicios, el `domain` se reutiliza
- Podemos agregar nuevos adaptadores (GraphQL, gRPC) sin cambiar la lógica
- Soporta integración con servicios externos (Keycloak, Azure, OCR)

---

## 🏗️ Estructura de Capas en Datum Travels

```
BackEnd/quarkus-api/src/main/java/datum/travels/
│
├── 📦 domain/              ← CAPA DE DOMINIO (Corazón del Sistema)
│   ├── model/              → Entidades de negocio (Evento, Gasto, Empleado)
│   ├── repository/         → Interfaces de repositorios (PUERTOS)
│   ├── exception/          → Excepciones del dominio
│   └── valueobject/        → Objetos de valor (MonedaEnum)
│
├── 📦 application/         ← CAPA DE APLICACIÓN (Casos de Uso)
│   ├── usecase/            → Lógica de negocio (CrearEventoUseCase)
│   ├── dto/                → Objetos de transferencia de datos
│   ├── port/               → Interfaces para servicios externos
│   └── mapper/             → Conversión entre DTOs y Entidades
│
├── 📦 infrastructure/      ← CAPA DE INFRAESTRUCTURA (Detalles Técnicos)
│   ├── adapter/
│   │   ├── rest/           → Controllers REST (EventoController)
│   │   ├── persistence/    → Implementación JPA (EventoRepositoryImpl)
│   │   ├── email/          → Envío de correos (QuarkusMailerAdapter)
│   │   ├── external/       → Clientes HTTP (KeycloakAdminClient)
│   │   └── reporte/        → Generación Excel (ExcelReporteGenerator)
│   ├── config/             → Configuración de Quarkus
│   └── security/           → Filtros de autenticación
│
└── 📦 shared/              ← CÓDIGO COMPARTIDO (Utilidades)
    ├── constant/           → Constantes globales
    ├── exception/          → Manejador global de errores
    ├── util/               → Funciones auxiliares
    └── security/           → Utilidades de seguridad
```

---

## 🔄 Flujo de Datos (Ejemplo: Crear un Evento)

```
1️⃣ Cliente Frontend
    ↓ POST /api/eventos (JSON)
    
2️⃣ EventoController (REST Adapter)
    ↓ Valida JWT con Keycloak
    ↓ Convierte JSON → CrearEventoRequest (DTO)
    
3️⃣ CrearEventoUseCase (Application Layer)
    ↓ Aplica reglas de negocio
    ↓ Crea Evento (entidad de dominio)
    
4️⃣ EventoRepository (Domain Interface)
    ↓ Define CONTRATO de persistencia
    
5️⃣ EventoRepositoryImpl (Infrastructure)
    ↓ Guarda en Oracle con JPA/Panache
    
6️⃣ Respuesta
    ↓ EventoResponse (DTO) → JSON → Cliente
```

### **Ventaja de este flujo:**
- Si cambiamos de Oracle a PostgreSQL, solo tocamos `EventoRepositoryImpl`
- Si cambiamos de REST a GraphQL, solo cambiamos el Controller
- La lógica en `CrearEventoUseCase` **permanece intacta**

---

## 🎨 Patrones de Diseño Implementados

### 1. **Repository Pattern** (Patrón Repositorio)
**Ubicación:** `domain/repository/` + `infrastructure/adapter/persistence/`

**Propósito:** Abstrae el acceso a datos, separando la lógica de negocio de la persistencia.

**Implementación:**
```java
// ✅ Interface en Domain (PUERTO)
public interface EventoRepository {
    List<Evento> findByIdEmpleado(Long idEmpleado);
    Evento save(Evento evento);
}

// ✅ Implementación en Infrastructure (ADAPTADOR)
@ApplicationScoped
public class EventoRepositoryImpl implements PanacheRepository<Evento>, EventoRepository {
    @Override
    public List<Evento> findByIdEmpleado(Long idEmpleado) {
        return list("idEmpleado", idEmpleado);
    }
}
```

**Ventaja:**
- El Use Case NO conoce JPA, solo llama `eventoRepository.save()`
- Podríamos cambiar a MongoDB sin tocar la lógica de negocio

---

### 2. **Use Case Pattern** (Patrón de Caso de Uso)
**Ubicación:** `application/usecase/`

**Propósito:** Encapsula la lógica de negocio en operaciones atómicas y reutilizables.

**Implementación:**
```java
@ApplicationScoped
public class CrearEventoUseCase {
    @Inject EventoRepository eventoRepository;
    
    @Transactional
    public EventoResponse execute(CrearEventoRequest request) {
        // 1. Validar
        // 2. Crear entidad
        // 3. Persistir
        // 4. Retornar DTO
    }
}
```

**Ventaja:**
- Cada caso de uso es una **clase independiente** (fácil de testear)
- Nomenclatura clara: `CrearEventoUseCase`, `ListarGastosUseCase`
- Reutilizable desde REST, GraphQL, CLI, etc.

---

### 3. **DTO Pattern** (Data Transfer Object)
**Ubicación:** `application/dto/`

**Propósito:** Transportar datos entre capas sin exponer entidades JPA.

**Implementación:**
```java
// ❌ MAL: Exponer entidad JPA directamente
@GET
public Evento obtenerEvento() { ... } // ← Entidad con @Entity expuesta

// ✅ BIEN: Usar DTO
public record EventoResponse(
    Long id,
    String nombre,
    LocalDate fecha,
    String estado
) {
    public static EventoResponse from(Evento evento) {
        return new EventoResponse(
            evento.getIdEvento(),
            evento.getNombreEvento(),
            evento.getFechaRegistro(),
            evento.getEstado()
        );
    }
}
```

**Ventaja:**
- Control total sobre qué datos se exponen
- Evita problemas de lazy loading en JSON
- Los cambios en entidades NO rompen la API

---

### 4. **Adapter Pattern** (Patrón Adaptador / Hexagonal Architecture)
**Ubicación:** `infrastructure/adapter/`

**Propósito:** Convertir interfaces externas a las interfaces que necesita el dominio.

**Implementación:**
```java
// ✅ PUERTO (interface en application)
public interface EmailSenderPort {
    void enviarConAdjunto(String email, String asunto, String cuerpo, ...);
}

// ✅ ADAPTADOR (implementación con Quarkus Mailer)
@ApplicationScoped
public class QuarkusMailerAdapter implements EmailSenderPort {
    @Inject Mailer mailer;
    
    @Override
    public void enviarConAdjunto(...) {
        mailer.send(Mail.withHtml(...).addAttachment(...));
    }
}
```

**Ventaja:**
- Si cambiamos de Quarkus Mailer a SendGrid, solo cambiamos el adaptador
- El Use Case sigue llamando `emailSender.enviarConAdjunto(...)` sin cambios

---

### 5. **Dependency Injection (IoC)** ✅
**Ubicación:** Toda la aplicación

**Propósito:** Quarkus inyecta dependencias automáticamente con `@Inject`.

**Implementación:**
```java
@ApplicationScoped
public class CrearGastoUseCase {
    @Inject GastoRepository gastoRepository;      // ← Inyectado por Quarkus
    @Inject EmailSenderPort emailSender;          // ← Inyectado por Quarkus
    @Inject ConversionMonedaService conversion;   // ← Inyectado por Quarkus
}
```

**Ventaja:**
- NO necesitas `new EventoRepositoryImpl()` manualmente
- Facilita testing con mocks
- Promueve bajo acoplamiento

---

### 6. **Mapper Pattern** ✅
**Ubicación:** `application/usecase/mapper/`

**Propósito:** Convertir entre entidades de dominio y DTOs.

**Implementación:**
```java
@ApplicationScoped
public class EventoMapper {
    public EventoResponse toResponseDTO(Evento evento) {
        return new EventoResponse(
            evento.getIdEvento(),
            evento.getNombreEvento(),
            evento.getFechaRegistro(),
            evento.getEstado()
        );
    }
}
```

---

### 7. **Exception Handler Pattern** ✅
**Ubicación:** `shared/exception/GlobalExceptionHandler.java`

**Propósito:** Manejo centralizado de errores HTTP.

**Implementación:**
```java
@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {
    @Override
    public Response toResponse(Exception ex) {
        if (ex instanceof ResourceNotFoundException) {
            return Response.status(404).entity(new ErrorDTO(ex.getMessage())).build();
        }
        return Response.status(500).entity(new ErrorDTO("Error interno")).build();
    }
}
```

---

## 📊 Comparación con otras arquitecturas

| Aspecto | Clean Architecture | Arquitectura en Capas | MVC Tradicional |
|---------|-------------------|----------------------|----------------|
| **Testeable** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Independiente de BD** | ✅ Sí | ❌ No | ❌ No |
| **Escalable** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Curva de aprendizaje** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Mantenible** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

---

## 🎓 Ventajas para el Proyecto Datum Travels

1. **Facilita Integraciones Complejas:**
   - Keycloak (autenticación)
   - Azure Storage (imágenes)
   - OCR externo
   - Conversión de monedas

2. **Preparado para Crecer:**
   - Reportes en Excel hoy, PDF mañana → Solo agregar otro adaptador
   - API REST hoy, GraphQL mañana → Reutilizar Use Cases

3. **Ideal para Equipos Junior:**
   - Cada desarrollador puede trabajar en su capa sin romper el sistema
   - La estructura es predecible y fácil de navegar

4. **Cumple Estándares Enterprise:**
   - Arquitectura profesional reconocida internacionalmente
   - Aplicable a sistemas bancarios, médicos, financieros

---

## 🚀 Conclusión

Clean Architecture + Patrones de Diseño hacen que Datum Travels sea:
- ✅ **Profesional** (estándar de la industria)
- ✅ **Mantenible** (código organizado y claro)
- ✅ **Escalable** (fácil agregar funcionalidades)
- ✅ **Testeable** (sin dependencias de frameworks)
- ✅ **Preparado para el futuro** (microservicios, nuevas tecnologías)

**Es la mejor arquitectura porque prioriza la lógica de negocio sobre los detalles técnicos**, garantizando que el sistema pueda evolucionar sin reescrituras completas.
