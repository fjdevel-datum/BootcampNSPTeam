# 📘 Guía 01: Capa DOMAIN (Dominio)

> **Tiempo de lectura:** 15 minutos  
> **Dificultad:** ⭐⭐ Básica-Intermedia  
> **Objetivo:** Entender el corazón de tu aplicación - la lógica de negocio pura

---

## 🎯 ¿Qué es la Capa de Dominio?

La capa **DOMAIN** es el **corazón** de tu aplicación. Contiene:
- **Tus entidades de negocio** (Evento, Gasto, Empleado)
- **Las reglas de negocio** (validaciones, cálculos)
- **Conceptos del mundo real** (Estados, Categorías, Países)

### 🔑 Característica Principal

**INDEPENDIENTE**: No conoce bases de datos, REST APIs, ni frameworks. Solo conoce el negocio.

---

## 🏗️ Estructura de la Capa DOMAIN

```
domain/
├── model/              # 📦 Entidades del negocio (con JPA)
├── valueobject/        # 💎 Objetos de valor inmutables
├── repository/         # 🔌 Interfaces de repositorios (contratos)
└── exception/          # ⚠️ Excepciones del dominio
```

---

## 1️⃣ DOMAIN/MODEL - Entidades del Negocio

### 📦 ¿Qué son las Entidades?

Las **entidades** son los objetos principales de tu negocio que tienen **identidad única** (ID).

### 📂 Tus Entidades Actuales

```
model/
├── Evento.java                    # 🎯 Evento de viaje
├── Gasto.java                     # 💰 Gasto individual
├── Empleado.java                  # 👤 Empleado que viaja
├── Usuario.java                   # 🔐 Usuario del sistema
├── Tarjeta.java                   # 💳 Tarjeta de crédito corporativa
├── CategoriaGasto.java            # 📁 Categoría (transporte, comida)
├── Pais.java                      # 🌎 País (SV, GT, HN, PA)
├── AdelantoViatico.java           # 💵 Adelanto antes del viaje
├── Cargo.java                     # 👔 Cargo del empleado
├── Departamento.java              # 🏢 Departamento
├── Empresa.java                   # 🏛️ Empresa
├── LiquidacionViatico.java        # 📊 Liquidación final
└── EstadoEvento.java              # ⚡ Estados (ACTIVO, COMPLETADO)
```

### 💡 Ejemplo Práctico: Evento.java

```java
package datum.travels.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ENTIDAD: Evento de Viaje
 * 
 * Un evento representa un viaje corporativo donde se registran gastos.
 * Ejemplo: "Viaje a Guatemala - Reunión de Clientes"
 */
@Entity
@Table(name = "eventos")
public class Evento {

    // ========================
    // IDENTIDAD
    // ========================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================
    // DATOS BÁSICOS
    // ========================
    @Column(name = "nombre_evento", nullable = false, length = 200)
    private String nombre;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    // ========================
    // FECHAS
    // ========================
    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    // ========================
    // RELACIONES
    // ========================
    @ManyToOne
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;

    @ManyToOne
    @JoinColumn(name = "pais_id")
    private Pais pais;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoEvento estado;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL)
    private List<Gasto> gastos = new ArrayList<>();

    // ========================
    // CONSTRUCTORES
    // ========================
    public Evento() {
        this.fechaCreacion = LocalDateTime.now();
        this.estado = EstadoEvento.ACTIVO;
    }

    public Evento(String nombre, Empleado empleado) {
        this();
        this.nombre = nombre;
        this.empleado = empleado;
    }

    // ========================
    // LÓGICA DE NEGOCIO
    // ========================
    
    /**
     * Completa el evento (cambia estado a COMPLETADO)
     * Regla de negocio: No se puede completar si no hay gastos
     */
    public void completar() {
        if (this.gastos.isEmpty()) {
            throw new IllegalStateException("No se puede completar un evento sin gastos");
        }
        this.estado = EstadoEvento.COMPLETADO;
        this.fechaFin = LocalDateTime.now();
    }

    /**
     * Cancela el evento
     * Regla de negocio: No se puede cancelar si ya está completado
     */
    public void cancelar() {
        if (this.estado == EstadoEvento.COMPLETADO) {
            throw new IllegalStateException("No se puede cancelar un evento completado");
        }
        this.estado = EstadoEvento.CANCELADO;
    }

    /**
     * Calcula el total de gastos del evento
     */
    public Double calcularTotalGastos() {
        return gastos.stream()
                .mapToDouble(Gasto::getMonto)
                .sum();
    }

    /**
     * Verifica si el evento está activo
     */
    public boolean estaActivo() {
        return this.estado == EstadoEvento.ACTIVO;
    }

    /**
     * Agrega un gasto al evento
     * Regla: Solo se pueden agregar gastos a eventos activos
     */
    public void agregarGasto(Gasto gasto) {
        if (!estaActivo()) {
            throw new IllegalStateException("No se pueden agregar gastos a un evento no activo");
        }
        this.gastos.add(gasto);
        gasto.setEvento(this);
    }

    // ========================
    // GETTERS Y SETTERS
    // ========================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }

    public Pais getPais() { return pais; }
    public void setPais(Pais pais) { this.pais = pais; }

    public EstadoEvento getEstado() { return estado; }
    public void setEstado(EstadoEvento estado) { this.estado = estado; }

    public List<Gasto> getGastos() { return gastos; }
    public void setGastos(List<Gasto> gastos) { this.gastos = gastos; }
}
```

### 🔑 Puntos Clave de las Entidades

#### 1. **Anotaciones JPA (Persistencia)**
```java
@Entity              // Marca la clase como entidad de BD
@Table(name = "...")  // Nombre de la tabla
@Id                  // Clave primaria
@GeneratedValue      // Auto-incremento
@Column              // Configuración de columna
@ManyToOne           // Relación muchos-a-uno
@OneToMany           // Relación uno-a-muchos
```

#### 2. **Lógica de Negocio (Métodos)**
```java
// ✅ BIEN: La lógica está en el dominio
public void completar() {
    if (this.gastos.isEmpty()) {
        throw new IllegalStateException("...");
    }
    this.estado = EstadoEvento.COMPLETADO;
}

// ❌ MAL: La lógica estaría en el servicio
// No hagas esto en Clean Architecture
```

#### 3. **Validaciones en el Constructor**
```java
public Evento(String nombre, Empleado empleado) {
    this();
    if (nombre == null || nombre.trim().isEmpty()) {
        throw new IllegalArgumentException("El nombre es obligatorio");
    }
    this.nombre = nombre;
    this.empleado = empleado;
}
```

---

## 2️⃣ DOMAIN/VALUEOBJECT - Objetos de Valor

### 💎 ¿Qué son los Value Objects?

Los **Value Objects** son objetos **inmutables** que representan **conceptos del dominio** pero NO tienen identidad propia.

**Diferencia con Entidad:**
- **Entidad:** Se identifica por su ID (Evento #123 ≠ Evento #456)
- **Value Object:** Se identifica por sus valores (MontoGasto(100.0) == MontoGasto(100.0))

### 📂 Tu Value Object Actual

```
valueobject/
└── MontoGasto.java       # Monto de dinero con validaciones
```

### 💡 Ejemplo Práctico: MontoGasto.java

```java
package datum.travels.domain.valueobject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * VALUE OBJECT: Monto de Gasto
 * 
 * Representa una cantidad de dinero con validaciones de negocio
 * INMUTABLE: No se puede modificar después de creado
 */
public class MontoGasto {

    private final BigDecimal valor;
    private final String moneda;

    // ========================
    // CONSTANTES DE NEGOCIO
    // ========================
    private static final BigDecimal MONTO_MINIMO = new BigDecimal("0.01");
    private static final BigDecimal MONTO_MAXIMO = new BigDecimal("50000.00");
    private static final String MONEDA_DEFAULT = "USD";

    // ========================
    // CONSTRUCTOR
    // ========================
    public MontoGasto(BigDecimal valor, String moneda) {
        validarMonto(valor);
        this.valor = valor.setScale(2, RoundingMode.HALF_UP);
        this.moneda = moneda != null ? moneda : MONEDA_DEFAULT;
    }

    public MontoGasto(Double valor) {
        this(BigDecimal.valueOf(valor), MONEDA_DEFAULT);
    }

    // ========================
    // VALIDACIONES DE NEGOCIO
    // ========================
    private void validarMonto(BigDecimal valor) {
        if (valor == null) {
            throw new IllegalArgumentException("El monto no puede ser nulo");
        }
        if (valor.compareTo(MONTO_MINIMO) < 0) {
            throw new IllegalArgumentException(
                "El monto debe ser mayor o igual a " + MONTO_MINIMO
            );
        }
        if (valor.compareTo(MONTO_MAXIMO) > 0) {
            throw new IllegalArgumentException(
                "El monto no puede exceder " + MONTO_MAXIMO
            );
        }
    }

    // ========================
    // OPERACIONES DE NEGOCIO
    // ========================
    
    /**
     * Suma dos montos
     * Regla: Solo se pueden sumar montos de la misma moneda
     */
    public MontoGasto sumar(MontoGasto otro) {
        if (!this.moneda.equals(otro.moneda)) {
            throw new IllegalArgumentException(
                "No se pueden sumar montos de diferentes monedas"
            );
        }
        return new MontoGasto(this.valor.add(otro.valor), this.moneda);
    }

    /**
     * Resta dos montos
     */
    public MontoGasto restar(MontoGasto otro) {
        if (!this.moneda.equals(otro.moneda)) {
            throw new IllegalArgumentException(
                "No se pueden restar montos de diferentes monedas"
            );
        }
        BigDecimal resultado = this.valor.subtract(otro.valor);
        return new MontoGasto(resultado, this.moneda);
    }

    /**
     * Multiplica el monto por un porcentaje
     * Ejemplo: calcular IVA (13%)
     */
    public MontoGasto multiplicarPorPorcentaje(double porcentaje) {
        BigDecimal factor = BigDecimal.valueOf(porcentaje / 100);
        BigDecimal resultado = this.valor.multiply(factor);
        return new MontoGasto(resultado, this.moneda);
    }

    /**
     * Verifica si el monto excede un límite
     */
    public boolean excede(MontoGasto limite) {
        return this.valor.compareTo(limite.valor) > 0;
    }

    /**
     * Formatea el monto para mostrar
     */
    public String formatear() {
        return String.format("%s %.2f", moneda, valor);
    }

    // ========================
    // GETTERS (Solo lectura)
    // ========================
    public BigDecimal getValor() {
        return valor;
    }

    public String getMoneda() {
        return moneda;
    }

    // ========================
    // EQUALS & HASHCODE
    // Dos montos son iguales si tienen el mismo valor y moneda
    // ========================
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MontoGasto that = (MontoGasto) o;
        return Objects.equals(valor, that.valor) &&
               Objects.equals(moneda, that.moneda);
    }

    @Override
    public int hashCode() {
        return Objects.hash(valor, moneda);
    }

    @Override
    public String toString() {
        return formatear();
    }
}
```

### 🔑 Puntos Clave de Value Objects

#### 1. **Inmutabilidad**
```java
private final BigDecimal valor;  // ← final, no se puede cambiar
private final String moneda;     // ← final, no se puede cambiar

// No hay setters
// Solo getters
```

#### 2. **Validaciones en Constructor**
```java
public MontoGasto(BigDecimal valor, String moneda) {
    validarMonto(valor);  // ← Valida antes de crear
    this.valor = valor.setScale(2, RoundingMode.HALF_UP);
    this.moneda = moneda != null ? moneda : MONEDA_DEFAULT;
}
```

#### 3. **Operaciones Retornan Nuevas Instancias**
```java
// ✅ BIEN: Retorna un NUEVO MontoGasto
public MontoGasto sumar(MontoGasto otro) {
    return new MontoGasto(this.valor.add(otro.valor), this.moneda);
}

// ❌ MAL: Modificaría el objeto actual
// public void sumar(MontoGasto otro) {
//     this.valor = this.valor.add(otro.valor); // ← ERROR: valor es final
// }
```

#### 4. **Equals basado en Valores, no en Identidad**
```java
MontoGasto monto1 = new MontoGasto(100.0);
MontoGasto monto2 = new MontoGasto(100.0);

monto1 == monto2;        // false (diferentes objetos)
monto1.equals(monto2);   // true (mismo valor)
```

---

## 3️⃣ DOMAIN/REPOSITORY - Interfaces de Repositorios

### 🔌 ¿Qué son los Repositorios?

Los **repositorios** son **interfaces** (contratos) que definen cómo acceder a las entidades.

**Importante:** Son SOLO interfaces. La implementación está en `infrastructure/`.

### 📂 Tus Repositorios Actuales

```
repository/
├── EventoRepository.java          # Acceso a Eventos
├── GastoRepository.java           # Acceso a Gastos
├── EmpleadoRepository.java        # Acceso a Empleados
├── UsuarioRepository.java         # Acceso a Usuarios
└── TarjetaRepository.java         # Acceso a Tarjetas
```

### 💡 Ejemplo Práctico: EventoRepository.java

```java
package datum.travels.domain.repository;

import datum.travels.domain.model.Evento;
import datum.travels.domain.model.EstadoEvento;
import java.util.List;
import java.util.Optional;

/**
 * REPOSITORIO: Contrato para acceso a Eventos
 * 
 * Define QUÉ operaciones están disponibles, NO CÓMO se implementan
 */
public interface EventoRepository {

    // ========================
    // OPERACIONES BÁSICAS (CRUD)
    // ========================
    
    /**
     * Guarda un evento (crear o actualizar)
     */
    Evento guardar(Evento evento);

    /**
     * Busca un evento por su ID
     */
    Optional<Evento> buscarPorId(Long id);

    /**
     * Lista todos los eventos
     */
    List<Evento> listarTodos();

    /**
     * Elimina un evento
     */
    void eliminar(Long id);

    /**
     * Verifica si existe un evento
     */
    boolean existePorId(Long id);

    // ========================
    // CONSULTAS DE NEGOCIO
    // ========================
    
    /**
     * Lista eventos de un empleado
     */
    List<Evento> buscarPorEmpleadoId(Long empleadoId);

    /**
     * Lista eventos por estado
     */
    List<Evento> buscarPorEstado(EstadoEvento estado);

    /**
     * Busca eventos activos de un empleado
     */
    List<Evento> buscarActivosPorEmpleado(Long empleadoId);

    /**
     * Cuenta eventos de un empleado
     */
    Long contarPorEmpleado(Long empleadoId);

    /**
     * Busca eventos por país
     */
    List<Evento> buscarPorPais(Long paisId);

    /**
     * Busca eventos completados en un rango de fechas
     */
    List<Evento> buscarCompletadosEntreFechas(
        LocalDateTime fechaInicio, 
        LocalDateTime fechaFin
    );
}
```

### 🔑 Puntos Clave de Repositorios

#### 1. **Solo Interfaz (Contrato)**
```java
public interface EventoRepository {
    // Solo firma de métodos, sin implementación
    Evento guardar(Evento evento);
    Optional<Evento> buscarPorId(Long id);
}
```

#### 2. **Usa Optional para Búsquedas**
```java
// ✅ BIEN: Retorna Optional (puede no existir)
Optional<Evento> buscarPorId(Long id);

// ❌ MAL: Retornar null es confuso
Evento buscarPorId(Long id);  // ¿Qué pasa si no existe?
```

#### 3. **Métodos con Nombres de Negocio**
```java
// ✅ BIEN: Nombre descriptivo del negocio
List<Evento> buscarActivosPorEmpleado(Long empleadoId);

// ❌ MAL: Nombre técnico de SQL
List<Evento> findByEstadoAndEmpleadoId(String estado, Long id);
```

---

## 4️⃣ DOMAIN/EXCEPTION - Excepciones del Dominio

### ⚠️ ¿Qué son las Excepciones de Dominio?

Son errores **específicos del negocio** que pueden ocurrir.

### 📂 Tus Excepciones Actuales

```
exception/
├── DomainException.java                    # Base para excepciones
├── BusinessValidationException.java        # Validaciones de negocio
├── EventoNoEncontradoException.java        # Evento no existe
├── EventoNotFoundException.java            # (Duplicado, eliminar)
├── GastoInvalidoException.java             # Gasto inválido
└── EmpleadoNoAutorizadoException.java      # Sin autorización
```

### 💡 Ejemplo Práctico: EventoNoEncontradoException.java

```java
package datum.travels.domain.exception;

/**
 * EXCEPCIÓN: Evento No Encontrado
 * 
 * Se lanza cuando se busca un evento que no existe
 */
public class EventoNoEncontradoException extends DomainException {

    public EventoNoEncontradoException(Long eventoId) {
        super("Evento no encontrado con ID: " + eventoId);
    }

    public EventoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
```

### 💡 Ejemplo: DomainException (Base)

```java
package datum.travels.domain.exception;

/**
 * EXCEPCIÓN BASE: Todas las excepciones de dominio heredan de aquí
 */
public class DomainException extends RuntimeException {

    public DomainException(String mensaje) {
        super(mensaje);
    }

    public DomainException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
```

### 🔑 Uso de Excepciones

```java
// En EventoUseCaseImpl
public Evento obtenerEventoPorId(Long id) {
    return eventoRepository.buscarPorId(id)
        .orElseThrow(() -> new EventoNoEncontradoException(id));
}

// En Evento (lógica de dominio)
public void completar() {
    if (this.gastos.isEmpty()) {
        throw new GastoInvalidoException(
            "No se puede completar un evento sin gastos"
        );
    }
    this.estado = EstadoEvento.COMPLETADO;
}
```

---

## 📊 Diagrama de Relaciones del Dominio

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DOMAIN                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   Evento     │ 1     * │    Gasto     │                │
│  │              ├─────────┤              │                │
│  │ - id         │         │ - monto      │                │
│  │ - nombre     │         │ - categoria  │                │
│  │ - estado     │         │ - imagen     │                │
│  └──────┬───────┘         └──────────────┘                │
│         │                                                   │
│         │ *                                                 │
│         │                                                   │
│  ┌──────┴───────┐                                          │
│  │   Empleado   │                                          │
│  │              │                                          │
│  │ - id         │                                          │
│  │ - nombre     │                                          │
│  │ - email      │                                          │
│  └──────────────┘                                          │
│                                                             │
│  ┌──────────────────────────────────────────────┐         │
│  │         MontoGasto (Value Object)            │         │
│  │  - Validaciones                              │         │
│  │  - Operaciones (sumar, restar)               │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
│  ┌──────────────────────────────────────────────┐         │
│  │    EventoRepository (Interface)              │         │
│  │  - guardar()                                 │         │
│  │  - buscarPorId()                             │         │
│  │  - buscarActivosPorEmpleado()                │         │
│  └──────────────────────────────────────────────┘         │
│           ▲                                                 │
│           │ implementado en Infrastructure                 │
└───────────┼─────────────────────────────────────────────────┘
            │
            │
┌───────────┴─────────────────────────────────────────────────┐
│              INFRASTRUCTURE LAYER                           │
│  ┌──────────────────────────────────────────────┐          │
│  │  EventoRepositoryAdapter (Implementación)    │          │
│  │  - Usa JPA/Hibernate                         │          │
│  │  - Conecta con Base de Datos                 │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Principios de la Capa DOMAIN

### 1. **Independencia Total**
```java
// ✅ BIEN: No depende de nada externo
public class Evento {
    private Long id;
    private String nombre;
    private EstadoEvento estado;
    
    public void completar() {
        this.estado = EstadoEvento.COMPLETADO;
    }
}

// ❌ MAL: Depende de framework o BD
public class Evento {
    @Autowired
    private EventoRepository repository;  // ← NO!
    
    public void guardar() {
        repository.save(this);  // ← La entidad NO se guarda sola
    }
}
```

### 2. **Lógica de Negocio en Entidades**
```java
// ✅ BIEN: La entidad conoce sus reglas
public void completar() {
    if (this.gastos.isEmpty()) {
        throw new GastoInvalidoException("...");
    }
    this.estado = EstadoEvento.COMPLETADO;
}

// ❌ MAL: La lógica en el servicio
// EventoService {
//     void completar(Evento evento) {
//         if (evento.getGastos().isEmpty()) { ... }
//     }
// }
```

### 3. **Value Objects Inmutables**
```java
// ✅ BIEN: Inmutable
public class MontoGasto {
    private final BigDecimal valor;  // final
    
    public MontoGasto sumar(MontoGasto otro) {
        return new MontoGasto(this.valor.add(otro.valor));
    }
}

// ❌ MAL: Mutable
public class MontoGasto {
    private BigDecimal valor;  // no final
    
    public void sumar(MontoGasto otro) {
        this.valor = this.valor.add(otro.valor);  // ← Modifica el objeto
    }
}
```

---

## 🎓 Resumen Ejecutivo

| Carpeta | Contiene | Ejemplo | Características |
|---------|----------|---------|-----------------|
| **model/** | Entidades con identidad | `Evento`, `Gasto` | - Tienen ID<br>- Lógica de negocio<br>- Relaciones JPA |
| **valueobject/** | Objetos sin identidad | `MontoGasto` | - Inmutables<br>- Equals por valor<br>- Validaciones |
| **repository/** | Interfaces de acceso | `EventoRepository` | - Solo contratos<br>- Uso de Optional<br>- Nombres de negocio |
| **exception/** | Errores de dominio | `EventoNoEncontradoException` | - Específicas<br>- Descriptivas<br>- Heredan de base |

---

## 🚀 Próximo Paso

**Siguiente guía:** `GUIA_02_APPLICATION.md`

Aprenderás cómo la capa **APPLICATION** usa estas entidades y repositorios para ejecutar los casos de uso del negocio.

---

**📖 Documentación creada:** Enero 2025  
**📌 Carpeta:** `domain/`  
**✅ Estado:** Estructura limpia y simplificada
