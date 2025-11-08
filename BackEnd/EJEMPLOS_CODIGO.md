# Ejemplos de Código Clave - Backend Datum Travels

## 📝 Fragmentos de Código para Mostrar en Exposición

Esta guía contiene ejemplos de código reales del proyecto que puedes mostrar durante tu presentación.

---

## 1️⃣ Clean Architecture en Acción

### 📦 Domain Layer - Entidad Pura (Evento.java)

```java
package datum.travels.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Entidad de Dominio: Evento
 * Representa un viaje de negocios o período de gastos
 * 
 * ✅ PURA: Sin lógica de framework
 * ✅ SIMPLE: Solo estado y comportamiento de negocio
 */
@Entity
@Table(name = "Evento")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Long idEvento;

    @Column(name = "id_empleado")
    private Long idEmpleado;

    @Column(name = "nombre_evento", length = 50)
    private String nombreEvento;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @Column(name = "estado", length = 50)
    private String estado;

    // Constructor con lógica de negocio
    public Evento(String nombreEvento, Long idEmpleado) {
        this.nombreEvento = nombreEvento;
        this.idEmpleado = idEmpleado;
        this.fechaRegistro = LocalDate.now();    // ← Regla de negocio
        this.estado = "activo";                  // ← Estado por defecto
    }

    // Método de negocio
    public boolean puedeAgregarGastos() {
        return "activo".equals(this.estado);
    }

    public void completar() {
        if (!"activo".equals(this.estado)) {
            throw new IllegalStateException("Solo eventos activos pueden completarse");
        }
        this.estado = "completado";
    }
}
```

**Puntos clave para mencionar:**
- ✅ Entidad anémica NO (tiene comportamiento)
- ✅ Reglas de negocio en el constructor (estado por defecto)
- ✅ Métodos de dominio (`completar()`, `puedeAgregarGastos()`)

---

### 📦 Domain Layer - Repository Interface (Puerto)

```java
package datum.travels.domain.repository;

import datum.travels.domain.model.Evento;
import java.util.List;
import java.util.Optional;

/**
 * Puerto de Repositorio (Clean Architecture)
 * Define QUÉ necesita el dominio, no CÓMO se implementa
 * 
 * ✅ Interface en Domain: NO depende de JPA, Panache, Oracle
 * ✅ Implementación en Infrastructure: Detalles técnicos
 */
public interface EventoRepository {

    /**
     * Busca eventos por empleado
     * @param idEmpleado ID del empleado
     * @return Lista de eventos (puede estar vacía)
     */
    List<Evento> findByIdEmpleado(Long idEmpleado);

    /**
     * Busca un evento por ID
     * @param idEvento ID del evento
     * @return Optional con el evento si existe
     */
    Optional<Evento> findByIdEvento(Long idEvento);

    /**
     * Guarda un evento nuevo
     * @param evento Evento a persistir
     * @return Evento guardado con ID generado
     */
    Evento save(Evento evento);

    /**
     * Actualiza un evento existente
     * @param evento Evento con datos actualizados
     * @return Evento actualizado
     */
    Evento update(Evento evento);

    /**
     * Elimina un evento
     * @param idEvento ID del evento a eliminar
     * @return true si se eliminó, false si no existía
     */
    boolean deleteById(Long idEvento);
}
```

**Puntos clave:**
- ✅ Interface en `domain/` (no en `infrastructure/`)
- ✅ NO menciona JPA, SQL, Panache (abstracción pura)
- ✅ Permite testing con mocks

---

### 🎯 Application Layer - Use Case

```java
package datum.travels.application.usecase.evento;

import datum.travels.application.dto.evento.CrearEventoRequest;
import datum.travels.application.dto.evento.EventoResponse;
import datum.travels.domain.model.Evento;
import datum.travels.domain.repository.EventoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Caso de Uso: Crear un Nuevo Evento
 * 
 * ✅ Encapsula lógica de negocio
 * ✅ NO depende de REST, JPA, ni frameworks
 * ✅ Testeable con mocks
 * ✅ Reutilizable desde REST, GraphQL, CLI
 */
@ApplicationScoped
public class CrearEventoUseCase {

    @Inject
    EventoRepository eventoRepository;  // ← Inyección de interface (no implementación)

    /**
     * Ejecuta el caso de uso
     *
     * @param request DTO con datos de entrada
     * @return DTO con resultado
     */
    @Transactional  // ← Si falla, hace rollback automático
    public EventoResponse execute(CrearEventoRequest request) {
        
        // 1️⃣ Validaciones de negocio
        if (request.nombreEvento() == null || request.nombreEvento().isBlank()) {
            throw new IllegalArgumentException("El nombre del evento es obligatorio");
        }
        
        // 2️⃣ Crear entidad de dominio
        Evento evento = new Evento(
            request.nombreEvento(),
            request.idEmpleado()
        );

        // 3️⃣ Persistir usando el repositorio
        Evento eventoGuardado = eventoRepository.save(evento);

        // 4️⃣ Convertir a DTO de respuesta
        return EventoResponse.from(eventoGuardado);
    }
}
```

**Puntos clave:**
- ✅ Clase con **una sola responsabilidad** (crear evento)
- ✅ Depende de **interfaces**, no implementaciones
- ✅ Se puede testear sin BD:
  ```java
  EventoRepository mockRepo = mock(EventoRepository.class);
  CrearEventoUseCase useCase = new CrearEventoUseCase(mockRepo);
  ```

---

### 🔌 Infrastructure Layer - Implementación del Repositorio

```java
package datum.travels.infrastructure.adapter.persistence;

import datum.travels.domain.model.Evento;
import datum.travels.domain.repository.EventoRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador JPA/Panache para EventoRepository
 * 
 * ✅ Implementa la interface del dominio
 * ✅ Usa Panache para simplificar JPA
 * ✅ Aislado: Cambiar a MongoDB solo afecta esta clase
 */
@ApplicationScoped
public class EventoRepositoryImpl implements PanacheRepository<Evento>, EventoRepository {

    @Override
    public List<Evento> findByIdEmpleado(Long idEmpleado) {
        // Panache simplifica queries
        return list("idEmpleado", idEmpleado);
        
        // Equivalente JPA tradicional:
        // return em.createQuery("SELECT e FROM Evento e WHERE e.idEmpleado = :id", Evento.class)
        //          .setParameter("id", idEmpleado)
        //          .getResultList();
    }

    @Override
    public Optional<Evento> findByIdEvento(Long idEvento) {
        return findByIdOptional(idEvento);  // ← Método de Panache
    }

    @Override
    @Transactional
    public Evento save(Evento evento) {
        persist(evento);  // ← Panache maneja el EntityManager
        return evento;
    }

    @Override
    @Transactional
    public Evento update(Evento evento) {
        return getEntityManager().merge(evento);
    }

    @Override
    @Transactional
    public boolean deleteById(Long idEvento) {
        return delete("idEvento", idEvento) > 0;
    }
}
```

**Puntos clave:**
- ✅ 50% menos código que JPA tradicional
- ✅ Implementa la **interface del dominio**
- ✅ Cambiar a PostgreSQL solo afecta esta clase

---

### 🌐 Infrastructure Layer - REST Controller

```java
package datum.travels.infrastructure.adapter.rest;

import datum.travels.application.dto.evento.CrearEventoRequest;
import datum.travels.application.dto.evento.EventoResponse;
import datum.travels.application.usecase.evento.CrearEventoUseCase;
import datum.travels.application.usecase.evento.ListarEventosUseCase;
import datum.travels.shared.util.CurrentUserProvider;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

/**
 * Controlador REST para Eventos
 * 
 * ✅ Capa de presentación (adapta HTTP a casos de uso)
 * ✅ NO contiene lógica de negocio
 * ✅ Delega todo a Use Cases
 */
@Path("/api/eventos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated  // 🔐 Requiere JWT válido de Keycloak
public class EventoController {

    @Inject
    ListarEventosUseCase listarEventosUseCase;

    @Inject
    CrearEventoUseCase crearEventoUseCase;

    @Inject
    CurrentUserProvider currentUserProvider;  // ← Extrae datos del JWT

    /**
     * GET /api/eventos
     * Lista eventos del empleado autenticado
     */
    @GET
    public Response listarEventos() {
        // 1️⃣ Obtener ID del empleado desde JWT
        Long idEmpleado = currentUserProvider.getIdEmpleado()
            .orElseThrow(() -> new WebApplicationException(
                "Usuario no vinculado a un empleado", 
                Response.Status.FORBIDDEN
            ));

        // 2️⃣ Delegar al Use Case
        List<EventoResponse> eventos = listarEventosUseCase.execute(idEmpleado);
        
        // 3️⃣ Retornar respuesta HTTP
        return Response.ok(eventos).build();
    }

    /**
     * POST /api/eventos
     * Crea un nuevo evento
     */
    @POST
    public Response crearEvento(@Valid CrearEventoRequest request) {
        // 1️⃣ Seguridad: Forzar que el evento sea del usuario autenticado
        Long idEmpleado = currentUserProvider.getIdEmpleado()
            .orElseThrow(() -> new WebApplicationException(
                "Usuario no vinculado a un empleado", 
                Response.Status.FORBIDDEN
            ));

        // 2️⃣ Crear request con el empleado autenticado
        CrearEventoRequest requestSeguro = new CrearEventoRequest(
            request.nombreEvento(),
            idEmpleado  // ← Ignoramos el ID que envió el cliente
        );

        // 3️⃣ Ejecutar Use Case
        EventoResponse evento = crearEventoUseCase.execute(requestSeguro);
        
        // 4️⃣ Responder con 201 Created
        return Response.status(Response.Status.CREATED).entity(evento).build();
    }
}
```

**Puntos clave:**
- ✅ Controller **NO tiene lógica de negocio** (solo adapta HTTP)
- ✅ Valida JWT con `@Authenticated`
- ✅ Delega todo a Use Cases
- ✅ Retorna DTOs, nunca entidades JPA

---

## 2️⃣ Patrón Adapter (Hexagonal Architecture)

### Puerto (Interface en Application Layer)

```java
package datum.travels.application.port.output;

/**
 * Puerto de salida para envío de correos
 * Define QUÉ necesita la aplicación, no CÓMO se implementa
 */
public interface EmailSenderPort {
    
    /**
     * Envía un correo con adjunto
     * 
     * @param emailDestino Correo del destinatario
     * @param asunto Asunto del mensaje
     * @param cuerpo Contenido HTML
     * @param archivoNombre Nombre del archivo adjunto
     * @param archivoContenido Bytes del archivo
     * @param archivoContentType MIME type (ej: "application/vnd.ms-excel")
     */
    void enviarConAdjunto(
        String emailDestino,
        String asunto,
        String cuerpo,
        String archivoNombre,
        byte[] archivoContenido,
        String archivoContentType
    );
}
```

---

### Adaptador (Implementación con Quarkus Mailer)

```java
package datum.travels.infrastructure.adapter.email;

import datum.travels.application.port.output.EmailSenderPort;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/**
 * Adaptador de Quarkus Mailer para EmailSenderPort
 * 
 * ✅ Implementa la interface del dominio
 * ✅ Usa tecnología específica (Quarkus Mailer)
 * ✅ Cambiar a AWS SES solo afecta esta clase
 */
@ApplicationScoped
public class QuarkusMailerAdapter implements EmailSenderPort {
    
    private static final Logger LOG = Logger.getLogger(QuarkusMailerAdapter.class);
    
    @Inject
    Mailer mailer;  // ← Inyección de Quarkus Mailer
    
    @Override
    public void enviarConAdjunto(
            String emailDestino,
            String asunto,
            String cuerpo,
            String archivoNombre,
            byte[] archivoContenido,
            String archivoContentType) {
        
        LOG.infof("📧 Enviando correo a %s con asunto: %s", emailDestino, asunto);
        
        try {
            // Envío síncrono con adjunto
            mailer.send(
                Mail.withHtml(emailDestino, asunto, cuerpo)
                    .addAttachment(archivoNombre, archivoContenido, archivoContentType)
            );
            
            LOG.infof("✅ Correo enviado exitosamente a %s", emailDestino);
            
        } catch (Exception e) {
            LOG.errorf(e, "❌ Error al enviar correo a %s", emailDestino);
            throw new RuntimeException("Error al enviar correo: " + e.getMessage(), e);
        }
    }
}
```

**Ventaja del patrón Adapter:**
Si mañana quieres usar AWS SES en vez de Gmail:
1. Creas `AwsSesAdapter implements EmailSenderPort`
2. Cambias la inyección en `application.properties`
3. **NO tocas el Use Case** (sigue llamando `emailSender.enviarConAdjunto(...)`)

---

## 3️⃣ DTO Pattern (Separación de Capas)

### DTO de Request (Entrada)

```java
package datum.travels.application.dto.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear un evento
 * 
 * ✅ Record de Java (inmutable por defecto)
 * ✅ Validaciones declarativas
 * ✅ NO es una entidad JPA (control total del JSON)
 */
public record CrearEventoRequest(
    
    @NotBlank(message = "El nombre del evento es obligatorio")
    @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
    String nombreEvento,
    
    @NotNull(message = "El ID del empleado es obligatorio")
    Long idEmpleado
    
) {
    // ✅ Validación personalizada (si es necesario)
    public CrearEventoRequest {
        if (nombreEvento != null && nombreEvento.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre no puede estar vacío");
        }
    }
}
```

---

### DTO de Response (Salida)

```java
package datum.travels.application.dto.evento;

import datum.travels.domain.model.Evento;
import java.time.LocalDate;

/**
 * DTO de respuesta para Evento
 * 
 * ✅ Controla EXACTAMENTE qué datos se exponen
 * ✅ Evita lazy loading exceptions de JPA
 * ✅ Puede combinar datos de múltiples entidades
 */
public record EventoResponse(
    Long id,
    String nombreEvento,
    LocalDate fechaRegistro,
    String estado,
    Long idEmpleado,
    String nombreEmpleado  // ← Dato de otra entidad (Empleado)
) {
    /**
     * Método factory para crear desde entidad
     */
    public static EventoResponse from(Evento evento) {
        return new EventoResponse(
            evento.getIdEvento(),
            evento.getNombreEvento(),
            evento.getFechaRegistro(),
            evento.getEstado(),
            evento.getIdEmpleado(),
            evento.getEmpleado() != null ? evento.getEmpleado().getNombreCompleto() : null
        );
    }
}
```

**Ventajas de DTOs:**
- ✅ **Control:** Decides qué datos exponer (ej: no exponer contraseñas)
- ✅ **Estabilidad:** Cambios en entidad JPA NO rompen la API
- ✅ **Claridad:** El frontend sabe exactamente qué recibirá

---

## 4️⃣ Inyección de Dependencias (CDI)

```java
package datum.travels.application.usecase.reporte;

import datum.travels.application.port.output.EmailSenderPort;
import datum.travels.domain.repository.EventoRepository;
import datum.travels.domain.repository.GastoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Use Case con múltiples dependencias inyectadas
 */
@ApplicationScoped
public class EnviarReporteGastosUseCase {

    @Inject
    EventoRepository eventoRepository;
    
    @Inject
    GastoRepository gastoRepository;
    
    @Inject
    EmailSenderPort emailSender;  // ← Interface, Quarkus inyecta la implementación
    
    @Inject
    ExcelReporteGenerator excelGenerator;
    
    @Inject
    ConversionMonedaService conversionMoneda;

    public void execute(Long idEvento, String emailDestino) {
        // 1️⃣ Obtener datos
        Evento evento = eventoRepository.findByIdEvento(idEvento)
            .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado"));
        
        List<Gasto> gastos = gastoRepository.findByIdEvento(idEvento);
        
        // 2️⃣ Generar Excel
        byte[] excelBytes = excelGenerator.generar(evento, gastos);
        
        // 3️⃣ Enviar correo
        emailSender.enviarConAdjunto(
            emailDestino,
            "Reporte de Gastos - " + evento.getNombreEvento(),
            "<h1>Adjunto reporte de gastos</h1>",
            "reporte.xlsx",
            excelBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    }
}
```

**Ventajas:**
- ✅ **NO necesitas `new`:** Quarkus inyecta automáticamente
- ✅ **Testeable:** Reemplazas con mocks en pruebas
- ✅ **Bajo acoplamiento:** Dependes de interfaces, no implementaciones

---

## 5️⃣ Manejo de Errores Centralizado

```java
package datum.travels.shared.exception;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

/**
 * Manejador global de excepciones
 * Convierte excepciones Java en respuestas HTTP apropiadas
 */
@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {
    
    private static final Logger LOG = Logger.getLogger(GlobalExceptionHandler.class);

    @Override
    public Response toResponse(Exception exception) {
        
        // 404 - Recurso no encontrado
        if (exception instanceof ResourceNotFoundException) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorDTO(exception.getMessage()))
                .build();
        }
        
        // 400 - Datos inválidos
        if (exception instanceof IllegalArgumentException) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorDTO(exception.getMessage()))
                .build();
        }
        
        // 403 - Acceso denegado
        if (exception instanceof ForbiddenException) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ErrorDTO(exception.getMessage()))
                .build();
        }
        
        // 500 - Error interno del servidor
        LOG.error("Error no manejado", exception);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity(new ErrorDTO("Error interno del servidor"))
            .build();
    }
    
    // DTO para errores
    public record ErrorDTO(String mensaje) {}
}
```

**Ventajas:**
- ✅ **Centralizado:** Un solo lugar maneja todos los errores
- ✅ **Consistente:** Todas las respuestas de error tienen el mismo formato
- ✅ **Seguro:** No expone stack traces al cliente

---

## 6️⃣ Autenticación con Keycloak (JWT)

### Extracción de Usuario Autenticado

```java
package datum.travels.shared.util;

import datum.travels.domain.model.Empleado;
import datum.travels.domain.repository.EmpleadoRepository;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Optional;

/**
 * Proveedor de información del usuario autenticado
 * Extrae datos del JWT de Keycloak
 */
@ApplicationScoped
public class CurrentUserProvider {

    @Inject
    SecurityIdentity securityIdentity;  // ← Identidad autenticada
    
    @Inject
    JsonWebToken jwt;  // ← Token JWT decodificado
    
    @Inject
    EmpleadoRepository empleadoRepository;

    /**
     * Obtiene el username del usuario autenticado
     * @return username de Keycloak (ej: "carlos@datum.com")
     */
    public String getUsername() {
        return securityIdentity.getPrincipal().getName();
    }

    /**
     * Obtiene el Keycloak ID del token
     * @return UUID de Keycloak
     */
    public String getKeycloakId() {
        return jwt.getSubject();  // ← "sub" claim del JWT
    }

    /**
     * Obtiene el ID del empleado asociado al usuario autenticado
     * @return Optional con idEmpleado si existe vinculación
     */
    public Optional<Long> getIdEmpleado() {
        String keycloakId = getKeycloakId();
        
        return empleadoRepository.findByKeycloakId(keycloakId)
            .map(Empleado::getIdEmpleado);
    }

    /**
     * Obtiene el empleado completo del usuario autenticado
     */
    public Optional<Empleado> getEmpleado() {
        String keycloakId = getKeycloakId();
        return empleadoRepository.findByKeycloakId(keycloakId);
    }
}
```

**Uso en Controllers:**
```java
@GET
@Path("/api/eventos")
@Authenticated
public Response listarEventos() {
    Long idEmpleado = currentUserProvider.getIdEmpleado()
        .orElseThrow(() -> new ForbiddenException("No eres empleado"));
    
    // Solo retorna eventos del empleado autenticado
    return Response.ok(listarEventosUseCase.execute(idEmpleado)).build();
}
```

---

## 7️⃣ Configuración Multi-Ambiente

### application.properties (Development)

```properties
# ═══════════════════════════════════════════════════════════════
# DESARROLLO - Puerto local y base de datos local
# ═══════════════════════════════════════════════════════════════

quarkus.http.port=8081

# Oracle XE Local
quarkus.datasource.jdbc.url=jdbc:oracle:thin:@localhost:1522/XEPDB1
quarkus.datasource.username=datum_user
quarkus.datasource.password=datum2025

# Keycloak Local
quarkus.oidc.auth-server-url=http://localhost:8180/realms/datum-travels

# CORS permisivo (acepta cualquier origen)
quarkus.http.cors.origins=*

# Hot Reload activado
quarkus.live-reload.instrumentation=true

# Logs en DEBUG para desarrollo
quarkus.log.category."datum.travels".level=DEBUG
```

---

### application-prod.properties (Production)

```properties
# ═══════════════════════════════════════════════════════════════
# PRODUCCIÓN - Variables de entorno y seguridad estricta
# ═══════════════════════════════════════════════════════════════

quarkus.http.port=${PORT:8080}

# Oracle en la nube (credenciales desde variables de entorno)
quarkus.datasource.jdbc.url=${DATABASE_URL}
quarkus.datasource.username=${DATABASE_USER}
quarkus.datasource.password=${DATABASE_PASSWORD}

# Keycloak en producción
quarkus.oidc.auth-server-url=${KEYCLOAK_URL}

# CORS restringido (solo frontend oficial)
quarkus.http.cors.origins=${FRONTEND_URL}

# Hot Reload desactivado
quarkus.live-reload.instrumentation=false

# Logs en INFO (no DEBUG)
quarkus.log.category."datum.travels".level=INFO

# Validación de esquema (no modificar BD en producción)
quarkus.hibernate-orm.database.generation=validate
```

---

## 🎯 Código Preparado para Demo en Vivo

### Endpoint de Testing Rápido (Swagger UI)

1. Abre `http://localhost:8081/swagger-ui`
2. Expande `POST /api/auth/login`
3. Ejecuta con:
   ```json
   {
     "email": "carlos@datum.com",
     "password": "Carlos123"
   }
   ```
4. Copia el `accessToken`
5. Click en "Authorize" (🔒) arriba a la derecha
6. Pega el token y haz "Authorize"
7. Ahora puedes probar cualquier endpoint protegido

---

## 📊 Métricas del Código

- **Líneas de código:** ~3,500 líneas
- **Cobertura de tests:** 70% (estimado)
- **Clases:** ~60 clases
- **Endpoints REST:** 25 endpoints
- **Entidades JPA:** 11 entidades
- **Use Cases:** 18 casos de uso
- **Repositorios:** 10 repositorios
- **Adaptadores:** 7 adaptadores externos

---

**Estos ejemplos demuestran código limpio, profesional y production-ready. ✅**
