# Instrucciones de Proyecto - Datum Travels

## Contexto del Proyecto
Aplicación Web: Datum Travels - Sistema de Gestión de Gastos Corporativos
Objetivo: Automatizar el registro, control y reporte de gastos de empleados durante viajes de negocios y gastos de representación, reemplazando el proceso manual actual (Excel/Word) con una solución web responsiva que utiliza OCR para captura automática de datos desde facturas/tickets.

Sistema de gestión de gastos de viaje empresarial con:
- Backend: Quarkus (Java 21) + Oracle
- Frontend: React + TypeScript + Vite
- Arquitectura Clean Architecture simple para juniors
- Producto final PWA para aplicacion web al final de todo

## Dominio del Negocio
Conceptos Principales

Evento: Representa un viaje de negocios o período de gastos de representación

Tipos: Viaje internacional, Gasto de representación local
Estados: activo, completado, pendiente, cancelado
Creado por el empleado desde la pantalla HOME


Gasto: Cada transacción individual dentro de un Evento

Categorías: Transporte, Alimentación, Hospedaje, Representación, Otros
Debe tener comprobante fiscal (foto) procesada por OCR
Vinculado a una tarjeta corporativa o viáticos en efectivo


Empleado: Usuario final del sistema

Puede tener o no tarjeta corporativa
Recibe viáticos según país de destino (ej: USD 60/día para Centroamérica)
Debe reportar todos sus gastos con comprobantes


Tarjeta Corporativa: Medio de pago asignado por la empresa

Algunos empleados tienen acceso, otros solo viáticos
ID 1 reservado para "No posee tarjeta"


País: Centroamérica (El Salvador, Guatemala, Honduras, Panamá)

Cada país tiene un correo de contabilidad distinto para reportes
Los viáticos varían según región

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
- ❌ NO exponer entidades JPA directamente en REST APIs (usar DTOs)
- ❌ NO generar resumenes .md de explicacion

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

## Cuando Sugerir Código
- Priorizar legibilidad sobre "cleverness"
- Incluir comentarios solo cuando la lógica sea compleja
- Sugerir nombres descriptivos en español para variables de negocio

## Base de Datos
- Usar JPA entities en `domain/model/`
- Columnas en snake_case (ej: `id_evento`)
- Tablas en PascalCase (ej: `Evento`)
- Siempre usar `@Column(name = "...")` explícito

## Arquitectura Clean (Pragmática)
application/     → Casos de Uso + DTOs + Puertos (interfaces)
domain/          → Entidades + Repositorios (interfaces) + Excepciones + Value Objects
infrastructure/  → Adaptadores REST + Persistencia + Servicios Externos + Configuración
shared/          → Constantes + Utilidades + Manejo Global de Errores