# Clean Architecture - Quarkus Travels API

## 📁 Estructura del Proyecto

Este proyecto sigue los principios de **Clean Architecture** (Arquitectura Limpia) propuesta por Robert C. Martin (Uncle Bob).

```
datum.travels/
├── domain/                      # 🏛️ CAPA DE DOMINIO (Lógica de Negocio)
│   ├── model/                  # Entidades de negocio (sin dependencias de frameworks)
│   │   ├── Evento.java
│   │   └── EstadoEvento.java
│   ├── ports/                  # Interfaces (contratos)
│   │   ├── in/                # Puertos de entrada (Use Cases)
│   │   │   └── EventoUseCase.java
│   │   └── out/               # Puertos de salida (Repositories)
│   │       └── EventoRepositoryPort.java
│   └── exception/              # Excepciones de dominio
│       ├── DomainException.java
│       ├── EventoNotFoundException.java
│       └── BusinessValidationException.java
│
├── application/                 # 🎯 CAPA DE APLICACIÓN (Casos de Uso)
│   ├── usecases/               # Implementación de casos de uso
│   │   └── evento/
│   │       └── EventoUseCaseImpl.java
│   └── dto/                    # DTOs de entrada/salida
│       ├── evento/
│       ├── gasto/
│       ├── empleado/
│       └── ...
│
├── infrastructure/              # 🔧 CAPA DE INFRAESTRUCTURA (Detalles Técnicos)
│   ├── persistence/            # Implementación de persistencia
│   │   ├── entity/            # Entidades JPA (con anotaciones)
│   │   │   ├── EventoEntity.java
│   │   │   └── EmpleadoEntity.java
│   │   └── adapter/           # Adaptadores de repositorio
│   │       └── EventoRepositoryAdapter.java
│   ├── web/                    # Adaptadores web
│   │   └── rest/              # Controllers REST
│   │       └── EventoRestController.java
│   └── mapper/                 # Mappers entre capas
│       ├── EventoDomainMapper.java  # Domain <-> Entity
│       └── EventoDTOMapper.java     # Domain <-> DTO
│
└── shared/                      # 📦 CÓDIGO COMPARTIDO
    └── config/                 # Configuraciones globales
```

## 🎯 Principios de Clean Architecture

### 1. Independencia de Frameworks
- El dominio no depende de frameworks como Quarkus, JPA o JAX-RS
- Los frameworks están en la capa de infraestructura

### 2. Independencia de UI
- La lógica de negocio no conoce si es REST, GraphQL o CLI
- Los controllers son adaptadores intercambiables

### 3. Independencia de Base de Datos
- El dominio no sabe si usas Oracle, PostgreSQL o MongoDB
- Los repositorios son puertos con implementaciones intercambiables

### 4. Testeable
- La lógica de negocio se puede probar sin BD, sin web server, sin frameworks
- Los casos de uso son POJO con inyección de dependencias por interfaces

### 5. Regla de Dependencia
```
Infraestructura → Application → Domain
        ↓              ↓           ↑
    (depende)      (depende)   (independiente)
```

## 📝 Flujo de una Petición

```
1. HTTP Request → EventoRestController (Infrastructure/Web)
                    ↓
2. Controller llama → EventoUseCase (Application)
                    ↓
3. UseCase ejecuta lógica de negocio con → Evento (Domain/Model)
                    ↓
4. UseCase usa → EventoRepositoryPort (Domain/Ports)
                    ↓
5. Puerto implementado por → EventoRepositoryAdapter (Infrastructure/Persistence)
                    ↓
6. Adapter usa → EventoEntity (Infrastructure/Entity) con JPA/Panache
                    ↓
7. Response ← Controller convierte Domain → DTO
```

## 🔄 Mappers

### EventoDomainMapper
Convierte entre el modelo de dominio puro y las entidades JPA:
- `Evento` (domain) ↔️ `EventoEntity` (JPA)

### EventoDTOMapper
Convierte entre el modelo de dominio y los DTOs de la API:
- `Evento` (domain) ↔️ `EventoResumenDTO`, `CrearEventoDTO`, etc.

## 🚀 Ventajas de esta Arquitectura

1. **Mantenibilidad**: Cada capa tiene una responsabilidad clara
2. **Testabilidad**: Puedes testear la lógica de negocio sin frameworks
3. **Flexibilidad**: Cambiar la BD o el framework web no afecta al dominio
4. **Escalabilidad**: Fácil agregar nuevos casos de uso sin tocar infraestructura
5. **Legibilidad**: La estructura es clara y autodocumentada

## 📦 Dependencias entre Capas

```
Domain (0 dependencias externas)
  ↑
Application (depende solo de Domain)
  ↑
Infrastructure (depende de Application y Domain)
```

## 🛠️ Tecnologías por Capa

### Domain
- Java puro (POJO)
- Sin anotaciones de frameworks

### Application
- Java + Jakarta CDI para inyección
- DTOs con Jakarta Validation

### Infrastructure
- Quarkus
- Hibernate ORM + Panache
- JAX-RS (REST)
- Jakarta Persistence (JPA)

## 📖 Ejemplo de Uso

### Crear un nuevo evento:

```java
// 1. Request llega al Controller
@POST
public Response crearEvento(@Valid CrearEventoDTO dto) {
    // 2. Controller convierte DTO a Domain
    Evento evento = dtoMapper.toDomain(dto);
    
    // 3. Controller delega al Use Case
    Evento eventoCreado = eventoUseCase.crearEvento(evento);
    
    // 4. Use Case ejecuta validaciones y llama al repositorio
    // 5. Repositorio persiste usando JPA
    // 6. Response se convierte de Domain a DTO
    EventoResponseDTO response = dtoMapper.toResponseDTO(eventoCreado);
    
    return Response.status(201).entity(response).build();
}
```

## 🎓 Próximos Pasos

Para aplicar esta arquitectura a otros módulos:

1. Crear el modelo de dominio en `domain/model/`
2. Definir los puertos en `domain/ports/in` y `domain/ports/out`
3. Implementar casos de uso en `application/usecases/`
4. Crear entidades JPA en `infrastructure/persistence/entity/`
5. Implementar adaptadores en `infrastructure/persistence/adapter/`
6. Crear controllers REST en `infrastructure/web/rest/`
7. Crear mappers en `infrastructure/mapper/`

## 📚 Referencias

- [The Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Ports and Adapters Pattern](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)
