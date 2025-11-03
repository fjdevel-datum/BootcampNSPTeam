# 📊 Estructura Multi-Moneda - Resumen Visual

## ✅ Decisión Final: Estructura de Datos

```
╔══════════════════════════════════════════════════════════════╗
║  TABLA: Gasto                                               ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────┬──────────────────────────────────────┐
│ Campo                │ Descripción                          │
├──────────────────────┼──────────────────────────────────────┤
│ monto                │ ✅ Valor ORIGINAL del OCR            │
│                      │    Ejemplo: 34.25 (GTQ)              │
├──────────────────────┼──────────────────────────────────────┤
│ moneda               │ ✅ Código ISO 4217                   │
│                      │    Ejemplo: "GTQ", "USD", "HNL"      │
├──────────────────────┼──────────────────────────────────────┤
│ monto_usd            │ ✅ Monto convertido a USD            │
│                      │    Ejemplo: 4.45                     │
├──────────────────────┼──────────────────────────────────────┤
│ tasa_cambio          │ ✅ Tasa de conversión aplicada       │
│                      │    Ejemplo: 0.13 (GTQ->USD)          │
├──────────────────────┼──────────────────────────────────────┤
│ fecha_tasa_cambio    │ ✅ Fecha de consulta de tasa         │
│                      │    Ejemplo: 2025-11-02               │
└──────────────────────┴──────────────────────────────────────┘
```

---

## 🔄 Comparación: Opción Descartada vs Opción Final

### ❌ Opción 1 (DESCARTADA)
```java
Gasto {
  monto: 4.45,                    // USD convertido
  monedaOriginal: "GTQ",          // Moneda de factura
  montoMonedaOriginal: 34.25,     // Monto original
  tasaCambio: 0.13
}
```
**Problema**: `monto` no guarda el valor puro del OCR

---

### ✅ Opción 2 (IMPLEMENTADA)
```java
Gasto {
  monto: 34.25,        // ✅ Valor PURO del OCR
  moneda: "GTQ",       // ✅ Moneda de factura
  montoUsd: 4.45,      // ✅ Convertido a USD
  tasaCambio: 0.13     // ✅ Tasa aplicada
}
```
**Ventaja**: `monto` mantiene el valor original del OCR

---

## 📝 Ejemplo Real: Gasto en Guatemala

### 1. OCR detecta la factura
```
Factura: Q 34.25
```

### 2. Frontend envía al backend
```json
{
  "monto": 34.25,
  "moneda": "GTQ",
  "descripcion": "Almuerzo cliente",
  "lugar": "Guatemala City"
}
```

### 3. Backend procesa
```java
// 1. Recibe monto original
BigDecimal montoOriginal = request.monto(); // 34.25

// 2. Convierte a USD
BigDecimal montoUSD = conversionService.convertirAUSD(
    montoOriginal, 
    "GTQ"
); // Resultado: 4.45

// 3. Obtiene tasa
BigDecimal tasa = conversionService.obtenerTasaCambio(
    "GTQ", 
    "USD"
); // Resultado: 0.13

// 4. Guarda en BD
gasto.monto = montoOriginal;           // 34.25
gasto.moneda = "GTQ";
gasto.montoUsd = montoUSD;             // 4.45
gasto.tasaCambio = tasa;               // 0.13
gasto.fechaTasaCambio = LocalDate.now();
```

### 4. Resultado en Base de Datos
```sql
INSERT INTO Gasto (
    descripcion, lugar, fecha,
    monto, moneda, monto_usd, tasa_cambio, fecha_tasa_cambio
) VALUES (
    'Almuerzo cliente', 'Guatemala City', SYSDATE,
    34.25, 'GTQ', 4.45, 0.13, SYSDATE
);
```

### 5. Consulta de datos
```sql
SELECT 
    descripcion,
    monto || ' ' || moneda as gasto_original,  -- "34.25 GTQ"
    monto_usd as gasto_dolares,                -- 4.45
    tasa_cambio                                -- 0.13
FROM Gasto;
```

**Resultado:**
```
DESCRIPCION          GASTO_ORIGINAL   GASTO_DOLARES   TASA_CAMBIO
─────────────────────────────────────────────────────────────────
Almuerzo cliente     34.25 GTQ        4.45            0.13
```

---

## 🎯 Ventajas de esta Estructura

| Ventaja | Descripción |
|---------|-------------|
| ✅ **OCR limpio** | `monto` guarda exactamente lo que OCR detectó |
| ✅ **Auditable** | Se guarda moneda original, tasa y fecha |
| ✅ **Flexible** | Reportes pueden usar monto original o USD |
| ✅ **Compatible** | No rompe código existente |
| ✅ **Estándar contable** | Cumple con normas de auditoría |

---

## 🚀 Archivos Modificados

```
BackEnd/
├── quarkus-api/src/main/java/datum/travels/
│   ├── domain/model/
│   │   ├── Gasto.java               ✅ Actualizado
│   │   └── MonedaEnum.java          ✅ Nuevo
│   ├── infrastructure/adapter/external/
│   │   └── ConversionMonedaService.java  ✅ Nuevo
│   └── application/dto/gasto/
│       └── CrearGastoRequest.java   ✅ Actualizado
├── scripts/
│   └── migracion-multimoneda.sql    ✅ Nuevo
└── quarkus-api/src/main/resources/
    └── application.properties       ✅ Actualizado

FEATURE_MULTI_MONEDA.md              ✅ Documentación completa
```

---

## 📋 Próximos Pasos

1. ✅ Ejecutar `migracion-multimoneda.sql`
2. ✅ Obtener API Key de exchangerate-api.com
3. ✅ Actualizar `CrearGastoUseCase`
4. ✅ Agregar dropdown de monedas en frontend

Ver documentación completa en: [`FEATURE_MULTI_MONEDA.md`](./FEATURE_MULTI_MONEDA.md)
