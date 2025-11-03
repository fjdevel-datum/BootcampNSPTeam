# 💱 Feature: Soporte Multi-Moneda

## 📌 Resumen

Sistema implementado para manejar gastos en múltiples monedas (USD, GTQ, HNL, PAB, EUR) con conversión automática a USD.

**Estructura de datos:**
- `monto` → Valor ORIGINAL de la factura (ej: 34.25 GTQ)
- `moneda` → Código ISO de la moneda (GTQ, USD, etc.)
- `monto_usd` → Valor convertido a dólares (ej: 4.46 USD)
- `tasa_cambio` → Tasa de conversión aplicada

---

## ✅ Componentes Implementados

### 1️⃣ **Base de Datos**
**Archivo**: `BackEnd/scripts/migracion-multimoneda.sql`

**Nuevas columnas en tabla `Gasto`**:
```sql
monto DECIMAL(10,2)              -- ✅ Valor ORIGINAL de la factura
moneda VARCHAR2(3)               -- Código ISO (USD, GTQ, etc.)
monto_usd DECIMAL(10,2)          -- Monto convertido a USD
tasa_cambio DECIMAL(10,6)        -- Tasa de conversión aplicada
fecha_tasa_cambio DATE           -- Fecha de consulta de tasa
```

---

### 2️⃣ **Backend (Java)**

#### 📄 `MonedaEnum.java`
Enum con las monedas soportadas:
- USD (Dólar Estadounidense)
- GTQ (Quetzal Guatemalteco)
- HNL (Lempira Hondureño)
- PAB (Balboa Panameño - paridad 1:1 con USD)
- EUR (Euro)

**Métodos útiles**:
```java
MonedaEnum.esMonedaValida("GTQ")  // true
MonedaEnum.fromCodigo("USD")      // MonedaEnum.USD
```

#### 📄 `ConversionMonedaService.java`
Servicio que consume la API de exchangerate-api.com

**Métodos principales**:
```java
// Convertir monto a USD
BigDecimal montoUSD = service.convertirAUSD(
    new BigDecimal("34.25"), 
    "GTQ"
);

// Obtener tasa de cambio
BigDecimal tasa = service.obtenerTasaCambio("GTQ", "USD");
```

**Configuración** (`application.properties`):
```properties
exchangerate.api.key=TU_API_KEY_AQUI
exchangerate.api.url=https://v6.exchangerate-api.com/v6
```

#### 📄 `CrearGastoRequest.java` (actualizado)
Agregado campo obligatorio:
```java
@NotBlank(message = "El código de moneda es obligatorio")
@Pattern(regexp = "^(USD|GTQ|HNL|PAB|EUR)$")
String moneda
```

#### 📄 `Gasto.java` (entidad actualizada)
Nuevos campos públicos:
```java
public BigDecimal monto;           // Valor ORIGINAL de la factura
public String moneda;              // Código ISO (USD, GTQ, etc.)
public BigDecimal montoUsd;        // Monto convertido a USD
public BigDecimal tasaCambio;      // Tasa aplicada
public LocalDate fechaTasaCambio;  // Fecha de consulta
```

---

## 🚀 Pasos para Implementar

### **Paso 1: Ejecutar Migración de BD**

```powershell
# Conectar a Oracle
sqlplus datum_user/datum2025@localhost:1522/XEPDB1

# Ejecutar script
@BackEnd/scripts/migracion-multimoneda.sql
```

**Verificar**:
```sql
SELECT COUNT(*) FROM Gasto WHERE moneda_original = 'USD';
```

---

### **Paso 2: Obtener API Key Gratuita**

1. Ir a: https://www.exchangerate-api.com/
2. Registrarse (plan gratuito: 1,500 requests/mes)
3. Copiar tu API Key
4. Editar `application.properties`:
   ```properties
   exchangerate.api.key=TU_API_KEY_AQUI
   ```

**Alternativa (desarrollo)**:  
Mientras uses `DEMO_KEY`, el servicio usará tasas aproximadas del enum (no recomendado para producción).

---

### **Paso 3: Actualizar Use Case de Crear Gasto**

Ubicación: `application/usecase/gasto/CrearGastoUseCase.java`

**Ejemplo de implementación**:

```java
@ApplicationScoped
public class CrearGastoUseCase {

    @Inject
    ConversionMonedaService conversionService;

    @Inject
    GastoRepository gastoRepository;

    @Transactional
    public Gasto ejecutar(CrearGastoRequest request) {
        // 1. Convertir monto a USD
        BigDecimal montoUSD = conversionService.convertirAUSD(
            request.monto(), 
            request.moneda()
        );

        // 2. Obtener tasa de cambio
        BigDecimal tasa = conversionService.obtenerTasaCambio(
            request.moneda(), 
            "USD"
        );

        // 3. Crear entidad Gasto
        Gasto gasto = new Gasto();
        gasto.evento = /* buscar evento */;
        gasto.categoria = /* buscar categoria */;
        gasto.descripcion = request.descripcion();
        gasto.lugar = request.lugar();
        gasto.fecha = request.fecha();
        
        // Campos de moneda
        gasto.monto = request.monto();              // 34.25 (ORIGINAL)
        gasto.moneda = request.moneda();            // GTQ
        gasto.montoUsd = montoUSD;                  // 4.46 (CONVERTIDO)
        gasto.tasaCambio = tasa;                    // 0.13
        gasto.fechaTasaCambio = LocalDate.now();

        gastoRepository.persist(gasto);
        return gasto;
    }
}
```

---

### **Paso 4: Frontend (React + TypeScript)**

#### 📄 Definir constantes de monedas

```typescript
// src/constants/monedas.ts
export const MONEDAS = [
  { codigo: 'USD', nombre: 'Dólar (USD)', simbolo: '$' },
  { codigo: 'GTQ', nombre: 'Quetzal (GTQ)', simbolo: 'Q' },
  { codigo: 'HNL', nombre: 'Lempira (HNL)', simbolo: 'L' },
  { codigo: 'PAB', nombre: 'Balboa (PAB)', simbolo: 'B/.' },
  { codigo: 'EUR', nombre: 'Euro (EUR)', simbolo: '€' },
] as const;

export type MonedaCodigo = typeof MONEDAS[number]['codigo'];
```

#### 📄 Componente de formulario

```tsx
// src/components/FormularioGasto.tsx
import { MONEDAS } from '@/constants/monedas';

export function FormularioGasto() {
  const [formData, setFormData] = useState({
    monto: '', // Del OCR
    moneda: 'USD', // Predeterminado
    descripcion: '',
    lugar: '',
    fecha: new Date(),
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Monto (pre-llenado por OCR) */}
      <input
        type="number"
        step="0.01"
        value={formData.monto}
        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
      />

      {/* Dropdown de moneda */}
      <select
        value={formData.moneda}
        onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
      >
        {MONEDAS.map((m) => (
          <option key={m.codigo} value={m.codigo}>
            {m.simbolo} {m.nombre}
          </option>
        ))}
      </select>

      {/* Otros campos... */}
      <button type="submit">Guardar Gasto</button>
    </form>
  );
}
```

#### 📄 Llamada al backend

```typescript
// src/services/gastoService.ts
export async function crearGasto(data: CrearGastoRequest) {
  const response = await fetch('http://localhost:8081/api/gastos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      idEvento: data.idEvento,
      idCategoria: data.idCategoria,
      descripcion: data.descripcion,
      lugar: data.lugar,
      fecha: data.fecha,
      monto: parseFloat(data.monto),
      moneda: data.moneda, // 👈 NUEVO CAMPO
    }),
  });

  return response.json();
}
```

---

## 🧪 Testing

### **Test 1: Gasto en USD**
```json
POST /api/gastos
{
  "idEvento": 1,
  "idCategoria": 2,
  "descripcion": "Taxi aeropuerto",
  "lugar": "San Salvador",
  "fecha": "2025-11-02",
  "monto": 15.00,
  "moneda": "USD"
}
```

**Esperado en BD**:
```
monto = 15.00 (ORIGINAL en USD)
moneda = USD
monto_usd = 15.00 (CONVERTIDO, igual porque ya es USD)
tasa_cambio = 1.0
```

---

### **Test 2: Gasto en Quetzales (Guatemala)**
```json
POST /api/gastos
{
  "idEvento": 1,
  "idCategoria": 3,
  "descripcion": "Almuerzo cliente",
  "lugar": "Guatemala City",
  "fecha": "2025-11-02",
  "monto": 34.25,
  "moneda": "GTQ"
}
```

**Esperado en BD** (con tasa 7.7 GTQ = 1 USD):
```
monto = 34.25 (ORIGINAL en GTQ)
moneda = GTQ
monto_usd = 4.45 (CONVERTIDO a USD)
tasa_cambio = 0.1299 (aprox)
```

---

### **Test 3: Verificar conversión manual**

```sql
SELECT 
    descripcion,
    monto || ' ' || moneda as monto_original,
    monto_usd as dolares,
    tasa_cambio,
    ROUND(monto * tasa_cambio, 2) as verificacion
FROM Gasto
WHERE id_gasto = 123;
```

---

## 🎯 Mejoras Futuras (Opcionales)

### 1. **Caché de Tasas de Cambio**
Para reducir requests a la API:
```java
@ApplicationScoped
public class TasaCambioCache {
    private Map<String, TasaDia> cache = new ConcurrentHashMap<>();
    
    public BigDecimal obtenerTasa(String moneda, LocalDate fecha) {
        String key = moneda + "_" + fecha;
        if (cache.containsKey(key)) {
            return cache.get(key).tasa;
        }
        // Consultar API y cachear...
    }
}
```

### 2. **Vista Previa en Frontend**
Mostrar conversión antes de guardar:
```tsx
{formData.moneda !== 'USD' && (
  <p className="text-sm text-gray-500">
    ≈ ${(parseFloat(formData.monto) / tasaDelDia).toFixed(2)} USD
  </p>
)}
```

### 3. **Reportes por Moneda Original**
Endpoint para reportes:
```java
@GET
@Path("/gastos/por-moneda/{moneda}")
public List<GastoDTO> listarPorMoneda(@PathParam("moneda") String moneda) {
    return gastoRepository.findByMoneda(moneda);
}
```

---

## 📊 Datos de Ejemplo

```sql
-- Evento de viaje a Guatemala
INSERT INTO Gasto (
    id_evento, id_categoria, descripcion, lugar, fecha,
    monto, moneda, monto_usd, tasa_cambio, fecha_tasa_cambio
) VALUES (
    1, 2, 'Almuerzo ejecutivo', 'Guatemala City', SYSDATE,
    34.25, 'GTQ', 4.45, 0.1299, SYSDATE
);

-- Gasto local en USD (El Salvador)
INSERT INTO Gasto (
    id_evento, id_categoria, descripcion, lugar, fecha,
    monto, moneda, monto_usd, tasa_cambio, fecha_tasa_cambio
) VALUES (
    1, 3, 'Taxi aeropuerto', 'San Salvador', SYSDATE,
    15.00, 'USD', 15.00, 1.0, SYSDATE
);
```

---

## ❓ FAQ

**Q: ¿Qué pasa si la API de conversión falla?**  
A: El servicio usa un fallback con tasas aproximadas del enum. Ver logs para detectar.

**Q: ¿Puedo agregar más monedas?**  
A: Sí, editar:
1. `MonedaEnum.java` (agregar moneda)
2. `migracion-multimoneda.sql` (agregar a constraint)
3. `CrearGastoRequest.java` (actualizar regex)

**Q: ¿Debo convertir gastos antiguos?**  
A: No, el script de migración ya los marcó como USD con tasa 1.0.

**Q: ¿Cómo auditar conversiones?**  
A: Todos los campos están guardados: monto original, moneda, tasa y fecha.

---

## 📝 Checklist de Implementación

- [ ] Ejecutar migración SQL
- [ ] Obtener API Key de exchangerate-api.com
- [ ] Configurar `application.properties`
- [ ] Verificar `Gasto.java` actualizado
- [ ] Actualizar `CrearGastoUseCase`
- [ ] Agregar dropdown en frontend
- [ ] Probar con USD (tasa 1.0)
- [ ] Probar con GTQ/HNL
- [ ] Verificar logs de conversión
- [ ] Documentar monedas soportadas al equipo

---

**Fecha de implementación**: 2025-11-02  
**Autor**: Datum Travels Team  
**Versión**: 1.0

---

## 📊 Resumen Visual Final

```
╔══════════════════════════════════════════════════════════════╗
║  ESTRUCTURA DE DATOS: Gasto Multi-Moneda                    ║
╚══════════════════════════════════════════════════════════════╝

ANTES (sin multi-moneda):
┌────────────────────────────┐
│ Gasto {                    │
│   monto: 34.25             │  ❓ ¿Qué moneda?
│ }                          │
└────────────────────────────┘

DESPUÉS (con multi-moneda):
┌────────────────────────────────────────────────────────┐
│ Gasto {                                                │
│   monto: 34.25,          // ✅ Valor PURO del OCR     │
│   moneda: "GTQ",         // ✅ Quetzal Guatemalteco   │
│   montoUsd: 4.45,        // ✅ Convertido a USD       │
│   tasaCambio: 0.13,      // ✅ Tasa GTQ->USD          │
│   fechaTasaCambio: ...   // ✅ Fecha de consulta      │
│ }                                                      │
└────────────────────────────────────────────────────────┘

FLUJO COMPLETO:
1. OCR detecta: "Q 34.25"
2. Usuario selecciona moneda: "GTQ"
3. Backend recibe:
   ├─ monto: 34.25
   └─ moneda: "GTQ"
4. Backend llama API de conversión
5. Backend guarda en BD:
   ├─ monto: 34.25      (original)
   ├─ moneda: "GTQ"
   ├─ montoUsd: 4.45    (convertido)
   └─ tasaCambio: 0.13

VENTAJAS:
✅ El campo 'monto' mantiene el valor original del OCR
✅ Auditable: Se guarda moneda original + tasa + fecha
✅ Flexible: Reportes pueden usar monto original o USD
✅ Compatible: Otros programas no se afectan
```
