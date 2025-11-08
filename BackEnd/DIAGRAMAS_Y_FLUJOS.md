# Diagramas y Flujos - Backend Datum Travels

## 🎨 Representaciones Visuales para tu Exposición

Este documento contiene diagramas de flujo, secuencia y arquitectura que puedes dibujar en una pizarra o proyectar durante tu presentación.

---

## 1️⃣ Diagrama de Capas (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA EXTERNA                             │
│  (Frameworks, Drivers, UI, Database, Web)                   │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │           INFRASTRUCTURE LAYER                    │     │
│  │  (REST Controllers, JPA Impl, Adapters)           │     │
│  │                                                   │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │      APPLICATION LAYER                  │     │     │
│  │  │  (Use Cases, DTOs, Ports)               │     │     │
│  │  │                                         │     │     │
│  │  │  ┌───────────────────────────────┐     │     │     │
│  │  │  │    DOMAIN LAYER               │     │     │     │
│  │  │  │  (Entities, Business Rules)   │     │     │     │
│  │  │  │                               │     │     │     │
│  │  │  │   ┌─────────────────┐         │     │     │     │
│  │  │  │   │  Evento         │         │     │     │     │
│  │  │  │   │  Gasto          │         │     │     │     │
│  │  │  │   │  Empleado       │         │     │     │     │
│  │  │  │   └─────────────────┘         │     │     │     │
│  │  │  │                               │     │     │     │
│  │  │  └───────────────────────────────┘     │     │     │
│  │  │                                         │     │     │
│  │  └─────────────────────────────────────────┘     │     │
│  │                                                   │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

REGLA DE DEPENDENCIA: Las capas internas NO conocen las externas
→ Domain NO depende de Application
→ Application NO depende de Infrastructure
→ Infrastructure SÍ depende de todas (implementa interfaces)
```

---

## 2️⃣ Diagrama de Secuencia: Crear un Evento

```
Frontend          Controller         UseCase          Repository        Database
   │                  │                  │                  │               │
   │ POST /eventos    │                  │                  │               │
   ├─────────────────>│                  │                  │               │
   │  + JWT Token     │                  │                  │               │
   │                  │                  │                  │               │
   │              [Valida JWT]           │                  │               │
   │                  │                  │                  │               │
   │              [Valida DTO]           │                  │               │
   │                  │                  │                  │               │
   │                  │  execute(request)│                  │               │
   │                  ├─────────────────>│                  │               │
   │                  │                  │                  │               │
   │                  │              [Crea Evento]          │               │
   │                  │                  │                  │               │
   │                  │                  │  save(evento)    │               │
   │                  │                  ├─────────────────>│               │
   │                  │                  │                  │               │
   │                  │                  │                  │ INSERT INTO   │
   │                  │                  │                  ├──────────────>│
   │                  │                  │                  │               │
   │                  │                  │                  │  ID generado  │
   │                  │                  │                  │<──────────────┤
   │                  │                  │                  │               │
   │                  │                  │  Evento guardado │               │
   │                  │                  │<─────────────────┤               │
   │                  │                  │                  │               │
   │                  │  EventoResponse  │                  │               │
   │                  │<─────────────────┤                  │               │
   │                  │                  │                  │               │
   │  201 Created     │                  │                  │               │
   │<─────────────────┤                  │                  │               │
   │  EventoResponse  │                  │                  │               │
   │                  │                  │                  │               │
```

**Puntos clave:**
1. El Controller NO tiene lógica de negocio
2. El Use Case NO conoce HTTP ni JPA
3. El Repository es una interface (inyección de dependencias)
4. Cada capa tiene una responsabilidad única

---

## 3️⃣ Diagrama de Flujo: Autenticación con Keycloak

```
┌──────────────┐
│   Frontend   │
│  (React)     │
└──────┬───────┘
       │
       │ 1. POST /realms/datum-travels/protocol/openid-connect/token
       │    { username: "carlos@datum.com", password: "..." }
       │
       ▼
┌──────────────────┐
│    Keycloak      │
│  (Auth Server)   │
└──────┬───────────┘
       │
       │ 2. Valida credenciales en base de datos
       │
       ▼
┌──────────────────┐
│  Genera JWT      │
│  {               │
│    "sub": "uuid",│
│    "preferred_   │
│     username":   │
│     "carlos",    │
│    "exp": 1730.. │
│  }               │
└──────┬───────────┘
       │
       │ 3. Retorna JWT firmado
       │
       ▼
┌──────────────┐
│   Frontend   │
│  Guarda JWT  │
│  en memoria  │
└──────┬───────┘
       │
       │ 4. Petición a backend con JWT
       │    Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
       │
       ▼
┌──────────────────────┐
│  Quarkus Backend     │
│  (Quarkus OIDC)      │
└──────┬───────────────┘
       │
       │ 5. Valida firma del JWT con clave pública de Keycloak
       │
       ▼
┌──────────────────────┐
│  ¿JWT válido?        │
│                      │
│  ✅ Sí:              │
│    - Extrae username │
│    - Busca empleado  │
│    - Ejecuta lógica  │
│                      │
│  ❌ No:              │
│    - 401 Unauthorized│
└──────────────────────┘
```

**Ventajas de este flujo:**
- ✅ El backend NUNCA maneja contraseñas
- ✅ Keycloak centraliza la autenticación
- ✅ Los tokens expiran automáticamente (seguridad)
- ✅ Fácil agregar 2FA, OAuth social, etc.

---

## 4️⃣ Patrón Repository en Acción

```
┌─────────────────────────────────────────────────────────┐
│               DOMAIN LAYER (Core)                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  interface EventoRepository {                   │   │
│  │    Evento save(Evento evento);                  │   │
│  │    Optional<Evento> findById(Long id);          │   │
│  │  }                                               │   │
│  └─────────────────────────────────────────────────┘   │
│                         ▲                               │
│                         │ implements                    │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│               INFRASTRUCTURE LAYER                      │
│                         │                               │
│  ┌──────────────────────┴──────────────────────────┐   │
│  │  @ApplicationScoped                             │   │
│  │  class EventoRepositoryImpl                     │   │
│  │       implements PanacheRepository<Evento>,     │   │
│  │                  EventoRepository {             │   │
│  │                                                 │   │
│  │    @Override                                    │   │
│  │    public Evento save(Evento evento) {          │   │
│  │      persist(evento);  // ← Panache             │   │
│  │      return evento;                             │   │
│  │    }                                            │   │
│  │                                                 │   │
│  │    @Override                                    │   │
│  │    public Optional<Evento> findById(Long id) {  │   │
│  │      return findByIdOptional(id);               │   │
│  │    }                                            │   │
│  │  }                                              │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│                   [Hibernate]                           │
│                         │                               │
│                         ▼                               │
│                 [Oracle Database]                       │
└─────────────────────────────────────────────────────────┘

VENTAJA: Si cambias de Oracle a PostgreSQL, solo modificas
         EventoRepositoryImpl. El Use Case sigue igual.
```

---

## 5️⃣ Patrón Adapter (Hexagonal Architecture)

```
┌─────────────────────────────────────────────────────────┐
│           APPLICATION LAYER (Core)                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  interface EmailSenderPort {                    │   │
│  │    void enviarConAdjunto(...);                  │   │
│  │  }                                               │   │
│  └─────────────────────────────────────────────────┘   │
│                         ▲                               │
│                         │ implements                    │
└─────────────────────────┼───────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    │                     │                     │
┌───┴────────┐    ┌───────┴──────┐    ┌────────┴──────┐
│  Quarkus   │    │   AWS SES    │    │  SendGrid     │
│  Mailer    │    │   Adapter    │    │   Adapter     │
│  Adapter   │    │   (Futuro)   │    │   (Futuro)    │
└────────────┘    └──────────────┘    └───────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  @ApplicationScoped                                      │
│  class QuarkusMailerAdapter implements EmailSenderPort { │
│                                                          │
│    @Inject                                               │
│    Mailer mailer;  // ← Quarkus Mailer                   │
│                                                          │
│    @Override                                             │
│    public void enviarConAdjunto(...) {                   │
│      mailer.send(                                        │
│        Mail.withHtml(...)                                │
│            .addAttachment(...)                           │
│      );                                                  │
│    }                                                     │
│  }                                                       │
└──────────────────────────────────────────────────────────┘

VENTAJA: Para cambiar de Quarkus Mailer a AWS SES:
         1. Crear AwsSesAdapter implements EmailSenderPort
         2. Cambiar @Inject en Use Cases
         3. ¡El Use Case NO cambia nada de código!
```

---

## 6️⃣ Flujo Completo: Enviar Reporte de Gastos

```
Frontend                                         Backend
   │                                                │
   │  POST /api/eventos/123/enviar-reporte         │
   ├──────────────────────────────────────────────>│
   │  {                                             │
   │    "emailDestino": "contabilidad.sv@datum.com" │
   │  }                                             │
   │                                                │
   │                                            EventoController
   │                                                │
   │                                                ▼
   │                                     EnviarReporteGastosUseCase
   │                                                │
   │                                     1. Buscar Evento
   │                                                ▼
   │                                     EventoRepository.findById(123)
   │                                                │
   │                                                ▼
   │                                     2. Buscar Gastos del Evento
   │                                                │
   │                                                ▼
   │                                     GastoRepository.findByIdEvento(123)
   │                                                │
   │                                                ▼
   │                                     3. Convertir Monedas a USD
   │                                                │
   │                                                ▼
   │                                     ConversionMonedaService.convertir(...)
   │                                                │
   │                                                ▼
   │                                     4. Generar Excel
   │                                                │
   │                                                ▼
   │                                     ExcelReporteGenerator.generar(evento, gastos)
   │                                                │
   │                                                ▼
   │                                     5. Determinar Email por País
   │                                                │
   │                                     País = "SV" → contabilidad.sv@datum.com
   │                                                │
   │                                                ▼
   │                                     6. Enviar Correo
   │                                                │
   │                                                ▼
   │                                     EmailSenderPort.enviarConAdjunto(...)
   │                                                │
   │                                                ▼
   │                                     QuarkusMailerAdapter
   │                                                │
   │                                                ▼
   │                                           Gmail SMTP
   │                                                │
   │  200 OK                                        │
   │  {                                             │
   │    "mensaje": "Reporte enviado exitosamente"   │
   │  }                                             │
   │<───────────────────────────────────────────────┤
```

**Componentes involucrados:**
1. **EventoController** - Recibe petición HTTP
2. **EnviarReporteGastosUseCase** - Orquesta todo el proceso
3. **EventoRepository** - Busca evento en BD
4. **GastoRepository** - Busca gastos asociados
5. **ConversionMonedaService** - Convierte monedas a USD
6. **ExcelReporteGenerator** - Genera archivo Excel
7. **EmailSenderPort** - Interface para envío
8. **QuarkusMailerAdapter** - Implementación con Quarkus Mailer
9. **Gmail SMTP** - Servicio externo de correo

---

## 7️⃣ Inyección de Dependencias (CDI)

```
┌─────────────────────────────────────────────────┐
│  CrearEventoUseCase                             │
│                                                 │
│  @Inject                                        │
│  EventoRepository eventoRepository; ───────┐    │
│                                            │    │
│  public EventoResponse execute(...) {      │    │
│    Evento evento = new Evento(...);        │    │
│    eventoRepository.save(evento);  ←───────┘    │
│  }                                              │
└─────────────────────────────────────────────────┘
                      ▲
                      │
                      │ Quarkus CDI inyecta
                      │ automáticamente
                      │
┌─────────────────────┴───────────────────────────┐
│  EventoRepositoryImpl                           │
│                                                 │
│  @ApplicationScoped                             │
│  class EventoRepositoryImpl                     │
│       implements EventoRepository {             │
│                                                 │
│    public Evento save(Evento evento) {          │
│      persist(evento);                           │
│      return evento;                             │
│    }                                            │
│  }                                              │
└─────────────────────────────────────────────────┘

VENTAJA: NO necesitas hacer:
  EventoRepository repo = new EventoRepositoryImpl();
  
Quarkus lo hace automáticamente al ver @Inject
```

---

## 8️⃣ Arquitectura de Alto Nivel con Integraciones

```
┌──────────────────────────────────────────────────────────────┐
│                     DATUM TRAVELS                            │
│                   Backend Ecosystem                          │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌─────────────────────────────────────┐
│   React     │  HTTP   │       Quarkus Backend               │
│  Frontend   ├────────>│  (Clean Architecture)               │
│  Port 5173  │  REST   │  Port 8081                          │
└─────────────┘         └────────┬────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌─────────┐ ┌──────────────┐
              │ Keycloak │ │ Oracle  │ │    Azure     │
              │  Auth    │ │Database │ │   Storage    │
              │ Port 8180│ │Port 1522│ │  (Blobs)     │
              └──────────┘ └─────────┘ └──────────────┘
                    ▲
                    │
              ┌─────┴──────┐
              │            │
              ▼            ▼
        ┌─────────┐  ┌────────────────┐
        │  Gmail  │  │ ExchangeRate   │
        │  SMTP   │  │     API        │
        │ Port 587│  │ (Conversión $) │
        └─────────┘  └────────────────┘

FLUJO DE DATOS:
1. Frontend → Backend: Peticiones REST con JWT
2. Backend → Keycloak: Validación de tokens
3. Backend → Oracle: Persistencia de datos
4. Backend → Azure: Acceso a imágenes de comprobantes
5. Backend → Gmail: Envío de reportes
6. Backend → ExchangeRate: Conversión de monedas
```

---

## 9️⃣ Comparación: Con y Sin Clean Architecture

### ❌ SIN Clean Architecture (Código Acoplado)

```java
@Path("/api/eventos")
public class EventoController {
    
    @PersistenceContext
    EntityManager em;  // ← Acoplado a JPA
    
    @POST
    public Response crearEvento(EventoRequest req) {
        // ❌ Validación en controller
        if (req.nombre == null) {
            return Response.status(400).build();
        }
        
        // ❌ Lógica de negocio en controller
        Evento evento = new Evento();
        evento.setNombre(req.nombre);
        evento.setFecha(LocalDate.now());
        evento.setEstado("activo");
        
        // ❌ Persistencia directa
        em.persist(evento);  // ← SQL directo
        
        // ❌ Envío de correo aquí mismo
        Mail.send("admin@datum.com", "Nuevo evento", "...");
        
        return Response.ok(evento).build();
    }
}
```

**Problemas:**
- ❌ Lógica de negocio en controller (difícil de testear)
- ❌ Acoplado a JPA (no se puede testear sin BD)
- ❌ Expone entidad JPA directamente (lazy loading issues)
- ❌ Mezcla responsabilidades (HTTP + lógica + BD + email)

---

### ✅ CON Clean Architecture

```java
// ═══════════════════════════════════════════════════════════
// Controller (Infrastructure) - Solo adapta HTTP
// ═══════════════════════════════════════════════════════════
@Path("/api/eventos")
public class EventoController {
    
    @Inject
    CrearEventoUseCase crearEventoUseCase;  // ← Inyección de interface
    
    @POST
    public Response crearEvento(@Valid CrearEventoRequest req) {
        // ✅ Solo delega al Use Case
        EventoResponse evento = crearEventoUseCase.execute(req);
        return Response.status(201).entity(evento).build();
    }
}

// ═══════════════════════════════════════════════════════════
// Use Case (Application) - Lógica de negocio
// ═══════════════════════════════════════════════════════════
@ApplicationScoped
public class CrearEventoUseCase {
    
    @Inject
    EventoRepository eventoRepository;  // ← Interface, no JPA
    
    @Inject
    EmailSenderPort emailSender;  // ← Interface, no SMTP
    
    @Transactional
    public EventoResponse execute(CrearEventoRequest request) {
        // ✅ Lógica de negocio centralizada
        Evento evento = new Evento(request.nombre(), request.idEmpleado());
        Evento guardado = eventoRepository.save(evento);
        
        // ✅ Notificar (opcional)
        emailSender.enviar("admin@datum.com", "Nuevo evento creado");
        
        return EventoResponse.from(guardado);
    }
}

// ═══════════════════════════════════════════════════════════
// Repository (Infrastructure) - Implementación JPA
// ═══════════════════════════════════════════════════════════
@ApplicationScoped
public class EventoRepositoryImpl implements EventoRepository {
    
    @Override
    public Evento save(Evento evento) {
        persist(evento);  // ← Panache
        return evento;
    }
}
```

**Ventajas:**
- ✅ Controller NO tiene lógica de negocio (fácil testear)
- ✅ Use Case NO conoce HTTP ni JPA (totalmente testeable)
- ✅ Se puede cambiar de Oracle a MongoDB sin tocar Use Case
- ✅ Separación de responsabilidades (cada clase hace UNA cosa)

---

## 🔟 Testing con Clean Architecture

```
┌──────────────────────────────────────────────────────┐
│  TEST UNITARIO (Sin BD, sin frameworks)              │
└──────────────────────────────────────────────────────┘

@Test
void testCrearEvento() {
    // 1. Mock del repositorio (NO usa BD real)
    EventoRepository mockRepo = mock(EventoRepository.class);
    when(mockRepo.save(any())).thenAnswer(i -> {
        Evento e = i.getArgument(0);
        e.setIdEvento(123L);  // Simula ID generado
        return e;
    });
    
    // 2. Instanciar Use Case con mock
    CrearEventoUseCase useCase = new CrearEventoUseCase(mockRepo);
    
    // 3. Ejecutar
    CrearEventoRequest request = new CrearEventoRequest(
        "Viaje Guatemala", 
        5L
    );
    EventoResponse response = useCase.execute(request);
    
    // 4. Verificar
    assertEquals(123L, response.id());
    assertEquals("activo", response.estado());
    assertEquals("Viaje Guatemala", response.nombreEvento());
    
    // 5. Verificar que se llamó al repositorio
    verify(mockRepo, times(1)).save(any(Evento.class));
}

VENTAJA: Este test corre en milisegundos (no necesita BD)
```

---

## 📊 Métricas de Performance Comparadas

```
┌───────────────────────────────────────────────────────────┐
│  SPRING BOOT vs QUARKUS (Arranque + Memoria)             │
└───────────────────────────────────────────────────────────┘

Spring Boot:
  [████████████████████████████████████████] 9.0s
  [████████████████████████████████████████████████████████████████████] 70 MB

Quarkus (JVM):
  [█] 0.042s
  [████████████] 12 MB

Quarkus (Native):
  [·] 0.008s
  [████] 4 MB

CONCLUSIÓN:
- Arranque: Quarkus es 214x más rápido
- Memoria: Quarkus usa 6x menos RAM
- Ideal para: Kubernetes, serverless, microservicios
```

---

## 🎯 Puntos Clave para Mencionar

### Durante la Explicación de Arquitectura:
1. **"Clean Architecture garantiza que la lógica de negocio es independiente de frameworks"**
2. **"Podemos cambiar de Oracle a PostgreSQL tocando solo una clase"**
3. **"Los Use Cases se pueden testear sin levantar el servidor"**

### Durante la Explicación de Tecnologías:
4. **"Quarkus arranca en 0.042 segundos vs 9 segundos de Spring Boot"**
5. **"Panache reduce el código JPA en 50%"**
6. **"Keycloak maneja toda la autenticación, el backend solo valida tokens"**

### Durante la Demo de Código:
7. **"Este Use Case NO conoce HTTP, JPA ni Quarkus"**
8. **"El patrón Repository permite cambiar la BD sin tocar la lógica"**
9. **"Los DTOs protegen de exponer entidades JPA al frontend"**

---

**Usa estos diagramas para explicar visualmente tu arquitectura. Una imagen vale más que mil líneas de código. 📊**
