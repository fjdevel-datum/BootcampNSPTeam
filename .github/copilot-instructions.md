# Instrucciones de Proyecto - Datum Travels

## Contexto del Proyecto
Sistema de gestión de gastos de viaje empresarial con:
- Backend: Quarkus (Java 21) + Oracle
- Frontend: React + TypeScript + Vite
- Arquitectura Clean Architecture simple para juniors
- Producto final PWA para aplicacion web al final de todo

## Convenciones de Código

### Backend (Quarkus)
- Usar Arquitectura Clean simple:
  - `domain/`: Entidades puras sin dependencias externas
  - `application/`: Use Cases y DTOs
  - `infrastructure/`: Adapters JPA, REST, etc.
- Nombrar repositorios como: `[Entidad]Repository` (interface)
- Nombrar use cases como: `[Accion][Entidad]UseCase` (ej: `CrearEventoUseCase`)
- Siempre usar `@Transactional` en métodos que modifican BD
- Preferir `Optional<T>` en lugar de retornar `null`
- Usar `BigDecimal` para manejo de montos monetarios

### Frontend (React + TS)
- Componentes en PascalCase (ej: `EventCard.tsx`)
- Hooks personalizados con prefijo `use` (ej: `useEventData.ts`)
- Props siempre con interfaces (ej: `interface EventCardProps`)
- Preferir `const` sobre `let`
- Usar Tailwind CSS v4 (no clases arbitrarias)

## Reglas de Negocio Importantes
1. Un Evento puede tener múltiples Gastos
2. Los gastos deben tener una foto de comprobante
3. El estado de un Evento puede ser: activo, completado, cancelado
4. Los viáticos se calculan por país y días
5. Solo empleados con tarjeta corporativa pueden hacer gastos de representación

## Patrones Preferidos
- **Backend**: Repository Pattern, Use Case Pattern, DTO Pattern
- **Frontend**: Custom Hooks, Compound Components
- **Validaciones**: Jakarta Validation en DTOs, Zod en Frontend
- **Manejo de errores**: Excepciones personalizadas que extienden de `DomainException`

## NO hacer
- ❌ NO usar Panache Entity (solo Panache Repository)
- ❌ NO mezclar lógica de negocio en Controllers REST
- ❌ NO usar `any` en TypeScript
- ❌ NO hardcodear strings (usar constantes o enums)
- ❌ NO exponer entidades JPA directamente en REST APIs (usar DTOs)

## Librerías Disponibles
### Backend
- Quarkus 3.27.0
- Hibernate ORM
- Jakarta Validation
- SmallRye JWT
- Apache POI (Excel)

### Frontend
- React 19
- TypeScript 5.8
- Tailwind CSS 4
- React Router 7
- Lucide Icons
- Vite 7

## Ejemplos de Código

### Crear un Use Case (Backend)
```java
@ApplicationScoped
public class CrearEventoUseCaseImpl implements CrearEventoUseCase {
    @Inject EventoRepository repository;
    
    @Override
    @Transactional
    public Evento ejecutar(Evento evento) {
        // Validaciones
        // Lógica de negocio
        return repository.guardar(evento);
    }
}
```

### Crear un Componente (Frontend)
```tsx
interface EventCardProps {
  event: Event;
  onSelect: (id: string) => void;
}

export function EventCard({ event, onSelect }: EventCardProps) {
  return (
    <button onClick={() => onSelect(event.id)}>
      {event.name}
    </button>
  );
}
```

## Cuando Sugerir Código
- Priorizar legibilidad sobre "cleverness"
- Incluir comentarios solo cuando la lógica sea compleja
- Sugerir nombres descriptivos en español para variables de negocio
- Usar nombres en inglés para código técnico

## Base de Datos
- Usar JPA entities en `domain/model/`
- Columnas en snake_case (ej: `id_evento`)
- Tablas en PascalCase (ej: `Evento`)
- Siempre usar `@Column(name = "...")` explícito