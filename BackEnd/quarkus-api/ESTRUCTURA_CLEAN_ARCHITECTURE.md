# 📐 Estructura Clean Architecture - Datum Travels

## 🎯 Resumen

Este documento describe la estructura de **Clean Architecture** implementada en el proyecto Datum Travels. La arquitectura sigue los principios de separación de responsabilidades y dependencias invertidas.

---

## 📂 Estructura de Capas

```
datum.travels/
├── 🔵 domain/              # Capa de Dominio (núcleo del negocio)
├── 🟢 application/         # Capa de Aplicación (casos de uso)
├── 🟡 infrastructure/      # Capa de Infraestructura (detalles técnicos)
└── ⚪ shared/              # Código compartido transversal
```

---

## 🔵 DOMAIN - Capa de Dominio

**Responsabilidad:** Contiene la lógica de negocio pura, independiente de frameworks o tecnologías.

### 📦 domain/model/
**Entidades del negocio** (12 entidades)
- `Evento.java` - Eventos de viaje
- `Gasto.java` - Gastos realizados
- `Empleado.java` - Empleados
- `Usuario.java` - Usuarios del sistema
- `Tarjeta.java` - Tarjetas de crédito
- `CategoriaGasto.java` - Categorías de gastos
- `Pais.java` - Países
- `AdelantoViatico.java` - Adelantos
- `Cargo.java` - Cargos/Posiciones
- `Departamento.java` - Departamentos
- `Empresa.java` - Empresas
- `LiquidacionViatico.java` - Liquidaciones

### 💎 domain/valueobject/
**Objetos de valor inmutables** con lógica de negocio
- `MontoGasto.java` - Representa un monto monetario con validaciones

### 🗂️ domain/repository/
**Interfaces de repositorios** (contratos sin implementación)
- `EventoRepository.java`
- `GastoRepository.java`
- `EmpleadoRepository.java`
- `UsuarioRepository.java`
- `TarjetaRepository.java`

### ⚠️ domain/exception/
**Excepciones de dominio**
- `EventoNoEncontradoException.java`
- `GastoInvalidoException.java`
- `EmpleadoNoAutorizadoException.java`

---

## 🟢 APPLICATION - Capa de Aplicación

**Responsabilidad:** Orquesta los casos de uso y coordina el flujo de datos.

### 📋 application/usecase/
**Casos de uso organizados por módulo**

#### auth/
- `LoginUseCase.java` - Autenticación
- `ValidarSesionUseCase.java` - Validación de sesiones

#### evento/
- `CrearEventoUseCase.java` - Crear eventos
- `ListarEventosActivosUseCase.java` - Listar eventos activos

#### gasto/
- `RegistrarGastoUseCase.java` - Registrar gastos
- `ProcesarImagenOCRUseCase.java` - Procesar imágenes con OCR

### 🔌 application/port/
**Interfaces de servicios externos** (Ports & Adapters)
- `OCRService.java` - Servicio de OCR
- `FileStorageService.java` - Almacenamiento de archivos
- `EmailService.java` - Envío de emails
- `ReportGeneratorService.java` - Generación de reportes
- `MessageQueueService.java` - Mensajería (JMS/Kafka)

### 📦 application/dto/
**Data Transfer Objects** organizados por módulo
- `auth/` - DTOs de autenticación
- `categoria/` - DTOs de categorías
- `empleado/` - DTOs de empleados
- `evento/` - DTOs de eventos
- `gasto/` - DTOs de gastos
- `tarjeta/` - DTOs de tarjetas

---

## 🟡 INFRASTRUCTURE - Capa de Infraestructura

**Responsabilidad:** Implementa detalles técnicos y se comunica con el mundo exterior.

### 🔄 infrastructure/adapter/
**Adaptadores de entrada y salida**

#### input/
- `rest/` - Controladores REST (JAX-RS)
- `mapper/` - Mappers de DTOs

#### output/
- `persistence/` - Implementaciones de repositorios (JPA/Panache)
- `ocr/dto/` - Integración con servicio OCR
- `storage/` - Almacenamiento de archivos (S3, local, etc.)
- `email/config/` - Configuración de emails por país
- `report/` - Generación de reportes Excel/PDF
- `messaging/` - Implementación de colas JMS

### ⚙️ infrastructure/config/
**Configuraciones técnicas**
- Configuración de beans
- Configuración de base de datos
- Configuración de seguridad

### 🔒 infrastructure/security/
**Seguridad y autenticación**
- Integración con Keycloak
- Manejo de JWT
- Filtros de seguridad

---

## ⚪ SHARED - Código Compartido

**Responsabilidad:** Código reutilizable en todas las capas.

### 🔧 shared/constant/
**Constantes y enumeraciones**
- `EstadoEvento.java` - Estados de eventos (ACTIVO, COMPLETADO, etc.)
- `TipoCategoria.java` - Tipos de categorías de gastos
- `PaisCode.java` - Códigos de países

### 🛠️ shared/util/
**Utilidades generales**
- `DateUtils.java` - Utilidades de fechas
- `CurrencyUtils.java` - Utilidades de moneda
- `ValidationUtils.java` - Validaciones comunes

### ⚠️ shared/exception/
**Jerarquía de excepciones base**
- `BusinessException.java` - Excepciones de negocio
- `TechnicalException.java` - Excepciones técnicas

---

## 🔄 Flujo de Dependencias

```
┌─────────────────────┐
│   Infrastructure    │ ◄─── Depende de Application y Domain
│  (REST, DB, OCR)    │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│    Application      │ ◄─── Depende solo de Domain
│   (Use Cases)       │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│      Domain         │ ◄─── No depende de nadie
│  (Business Logic)   │
└─────────────────────┘
```

**Regla clave:** Las dependencias apuntan **hacia adentro** (hacia el dominio).

---

## 🚀 Cómo Agregar Nueva Funcionalidad

### Ejemplo: Agregar módulo "Viaje"

1. **Capa Domain:**
   ```java
   // domain/model/Viaje.java
   public class Viaje { ... }
   
   // domain/repository/ViajeRepository.java
   public interface ViajeRepository { ... }
   
   // domain/exception/ViajeNoEncontradoException.java
   public class ViajeNoEncontradoException extends BusinessException { ... }
   ```

2. **Capa Application:**
   ```java
   // application/usecase/viaje/CrearViajeUseCase.java
   public interface CrearViajeUseCase { ... }
   
   // application/dto/viaje/ViajeDTO.java
   public class ViajeDTO { ... }
   ```

3. **Capa Infrastructure:**
   ```java
   // infrastructure/adapter/output/persistence/ViajeRepositoryImpl.java
   public class ViajeRepositoryImpl implements ViajeRepository { ... }
   
   // infrastructure/adapter/input/rest/ViajeResource.java
   @Path("/api/viajes")
   public class ViajeResource { ... }
   ```

---

## ✅ Beneficios de Esta Arquitectura

1. **Testeable:** Lógica de negocio independiente
2. **Mantenible:** Separación clara de responsabilidades
3. **Flexible:** Fácil cambiar frameworks o tecnologías
4. **Escalable:** Estructura organizada para crecimiento
5. **SOLID:** Cumple principios de diseño orientado a objetos

---

## 📝 Próximos Pasos

- [ ] Actualizar paquetes en archivos movidos (`domain/model`, `application/dto`)
- [ ] Implementar casos de uso con lógica de negocio
- [ ] Crear adaptadores de infraestructura (REST, persistencia)
- [ ] Configurar inyección de dependencias
- [ ] Agregar tests unitarios por capa
- [ ] Documentar APIs REST

---

## 📚 Referencias

- Clean Architecture por Robert C. Martin
- Hexagonal Architecture (Ports & Adapters)
- Domain-Driven Design (DDD)

---

**Última actualización:** Enero 2025
**Versión:** 1.0
