# 📊 Diagrama Visual: Conversión Multi-Moneda

## 🎨 Interfaz de Usuario

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRAR GASTO                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📸 [Foto del Comprobante]                                      │
│      ┌────────────────────────┐                                │
│      │   FACTURA              │                                │
│      │   Restaurante Portal   │                                │
│      │   Q 390.00             │                                │
│      └────────────────────────┘                                │
│                                                                  │
│  📝 Datos del Gasto                                             │
│                                                                  │
│  Nombre Empresa                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │ Restaurante El Portal                  │                    │
│  └────────────────────────────────────────┘                    │
│                                                                  │
│  Descripción                                                    │
│  ┌────────────────────────────────────────┐                    │
│  │ Almuerzo con cliente                   │                    │
│  └────────────────────────────────────────┘                    │
│                                                                  │
│  Monto Total                                                    │
│  ┌────────────────────────────────────────┐                    │
│  │ 390.00                                 │                    │
│  └────────────────────────────────────────┘                    │
│                                                                  │
│  💱 Moneda *                           ← ✨ NUEVO              │
│  ┌────────────────────────────────────────┐                    │
│  │ 🇬🇹 Quetzal guatemalteco (GTQ)  ▼     │                    │
│  └────────────────────────────────────────┘                    │
│     ├─ 🇺🇸 Dólar estadounidense (USD)                          │
│     ├─ 🇬🇹 Quetzal guatemalteco (GTQ)     ← Seleccionado      │
│     ├─ 🇭🇳 Lempira hondureño (HNL)                            │
│     ├─ 🇵🇦 Balboa panameño (PAB)                              │
│     └─ 🇪🇺 Euro (EUR)                                          │
│                                                                  │
│  Fecha                                                          │
│  ┌────────────────────────────────────────┐                    │
│  │ 2025-11-03                 📅          │                    │
│  └────────────────────────────────────────┘                    │
│                                                                  │
│  Categoría *                                                    │
│  ┌────────────────────────────────────────┐                    │
│  │ Alimentación                       ▼   │                    │
│  └────────────────────────────────────────┘                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │   Cancelar   │  │   Guardar    │                           │
│  └──────────────┘  └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos Detallado

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: Captura y Procesamiento OCR                             │
└─────────────────────────────────────────────────────────────────┘

Usuario toma foto 📸
        │
        ├─ Frontend envía imagen a OCR Service
        │
        ▼
┌───────────────────────────────┐
│  OCR Service (Puerto 8080)    │
│  POST /api/ocr                │
│                               │
│  1. Azure OCR extrae texto    │
│  2. LLM procesa y parsea      │
│  3. Devuelve JSON             │
└───────────────────────────────┘
        │
        ▼
JSON Extraído:
{
  "NombreEmpresa": "Restaurante El Portal, Guatemala City",
  "MontoTotal": "390.00",
  "Moneda": "GTQ",    ← Detectado por LLM
  "Fecha": "2025-11-03"
}
        │
        ▼
Frontend muestra formulario pre-rellenado

┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: Confirmación y Envío                                    │
└─────────────────────────────────────────────────────────────────┘

Usuario revisa datos → Confirma moneda (GTQ) → Click "Guardar"
        │
        ▼
Frontend construye payload:
{
  "NombreEmpresa": "Restaurante El Portal",
  "Descripcion": "Almuerzo con cliente",
  "MontoTotal": "390.00",
  "Moneda": "GTQ",           ← Campo clave
  "Fecha": "2025-11-03",
  "IdEvento": 15,
  "IdCategoria": 2,
  "IdTarjeta": 3
}
        │
        ├─ Vite Proxy rutea según path:
        │  • /api/ocr → puerto 8080 (OCR)
        │  • /api/*   → puerto 8081 (Backend)
        │
        ▼
POST http://localhost:8081/api/gastos/llm

┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: Conversión de Moneda (Backend Principal)                │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│ GastoController.java                                  │
│ → crearGastoDesdeLlm(CrearGastoFromLlmRequest)       │
│   └─ Valida campos (moneda, monto, fecha)            │
│   └─ Convierte a CrearGastoRequest                   │
└───────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────┐
│ CrearGastoUseCase.java                               │
│                                                       │
│ 1. Valida evento (ID 15)        ✓                   │
│ 2. Valida categoría (ID 2)      ✓                   │
│ 3. Valida tarjeta (ID 3)        ✓                   │
│                                                       │
│ 4. Llama a ConversionMonedaService:                 │
│    convertirAUSD(390.00, "GTQ")                     │
└───────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────┐
│ ConversionMonedaService.java                         │
│                                                       │
│ IF moneda == "USD":                                  │
│    return monto (sin conversión)                     │
│                                                       │
│ ELSE:                                                 │
│    ┌──────────────────────────────────────┐         │
│    │ Consulta ExchangeRate API            │         │
│    │ GET /v6/{API_KEY}/pair/GTQ/USD       │         │
│    └──────────────────────────────────────┘         │
│           │                                           │
│           ▼                                           │
│    Response:                                          │
│    {                                                  │
│      "result": "success",                            │
│      "conversion_rate": 0.128205,                    │
│      "time_last_update_utc": "Sun, 03 Nov 2025"     │
│    }                                                  │
│           │                                           │
│           ▼                                           │
│    Calcula:                                           │
│    montoUSD = 390.00 × 0.128205 = 50.00             │
│                                                       │
│    Retorna:                                           │
│    - montoUsd: 50.00                                 │
│    - tasaCambio: 0.128205                            │
│    - fechaTasa: 2025-11-03                           │
└───────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────┐
│ CrearGastoUseCase (continúa)                         │
│                                                       │
│ Crea entidad Gasto:                                  │
│   gasto.monto = 390.00              (original)       │
│   gasto.moneda = "GTQ"              (original)       │
│   gasto.montoUsd = 50.00            (convertido)     │
│   gasto.tasaCambio = 0.128205       (de API)         │
│   gasto.fechaTasaCambio = 2025-11-03 (de API)       │
│                                                       │
│ gastoRepository.save(gasto)                          │
└───────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 4: Persistencia en Base de Datos                           │
└─────────────────────────────────────────────────────────────────┘

Oracle Database (XEPDB1)

INSERT INTO Gasto (
    id_gasto,              → 127 (auto-generado)
    id_evento,             → 15
    id_categoria,          → 2
    id_tarjeta,            → 3
    descripcion,           → "Almuerzo con cliente - Reunion..."
    lugar,                 → "Restaurante El Portal"
    fecha,                 → 2025-11-03
    
    -- 💰 Campos Multi-Moneda (NUEVOS)
    monto,                 → 390.00    ✓
    moneda,                → "GTQ"     ✓
    monto_usd,             → 50.00     ✓
    tasa_cambio,           → 0.128205  ✓
    fecha_tasa_cambio      → 2025-11-03 ✓
)

        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 5: Respuesta al Frontend                                   │
└─────────────────────────────────────────────────────────────────┘

Backend retorna:
{
  "id": 127,
  "id_gasto": 127,
  "idGasto": 127
}
        │
        ▼
Frontend sube la imagen del comprobante:
POST /api/gastos/127/archivo
        │
        ▼
Archivo guardado en Azure Storage:
gastos/carlos/2025/Noviembre/127-factura-portal.jpg
        │
        ▼
✅ Gasto creado exitosamente
        │
        ▼
Frontend redirige al evento:
/event/Viaje-Guatemala
```

---

## 🗄️ Estructura de Datos en Base de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│ Tabla: Gasto                                                     │
├─────────────────────────────────────────────────────────────────┤
│ ID_GASTO (PK)            │ 127                                   │
├──────────────────────────┼───────────────────────────────────────┤
│ ID_EVENTO (FK)           │ 15  → Evento "Viaje Guatemala"        │
│ ID_CATEGORIA (FK)        │ 2   → Categoría "Alimentación"        │
│ ID_TARJETA (FK)          │ 3   → Tarjeta "Visa *4321"           │
├──────────────────────────┼───────────────────────────────────────┤
│ DESCRIPCION              │ "Almuerzo con cliente - Reunion..."   │
│ LUGAR                    │ "Restaurante El Portal"               │
│ FECHA                    │ 2025-11-03                            │
├──────────────────────────┴───────────────────────────────────────┤
│ 💰 CAMPOS MULTI-MONEDA (Implementados)                          │
├──────────────────────────┬───────────────────────────────────────┤
│ MONTO ✓                  │ 390.00                                │
│   └─ Valor ORIGINAL de la factura en moneda local               │
│                                                                   │
│ MONEDA ✓                 │ "GTQ"                                 │
│   └─ Código ISO 4217 (USD, GTQ, HNL, PAB, EUR)                  │
│                                                                   │
│ MONTO_USD ✓              │ 50.00                                 │
│   └─ Valor convertido a dólares (para reportes)                 │
│                                                                   │
│ TASA_CAMBIO ✓            │ 0.128205                              │
│   └─ Tasa de conversión usada (GTQ → USD)                       │
│                                                                   │
│ FECHA_TASA_CAMBIO ✓      │ 2025-11-03                            │
│   └─ Fecha de consulta de la tasa (para auditoría)              │
├──────────────────────────┴───────────────────────────────────────┤
│ 📎 Archivos Adjuntos                                             │
├──────────────────────────┬───────────────────────────────────────┤
│ BLOB_NAME                │ "gastos/carlos/.../127-factura.jpg"  │
│ BLOB_URL                 │ "https://datumstore.blob.core..."    │
│ FILE_CONTENT_TYPE        │ "image/jpeg"                          │
│ FILE_SIZE_BYTES          │ 245678                                │
└──────────────────────────┴───────────────────────────────────────┘
```

---

## 🧮 Ejemplo de Cálculo de Conversión

```
┌─────────────────────────────────────────────────────────────────┐
│ EJEMPLO: Gasto en Quetzales (GTQ) → USD                         │
└─────────────────────────────────────────────────────────────────┘

Factura Original:
┌──────────────────────┐
│ Restaurante Portal   │
│ Q 390.00             │  ← Monto en Quetzales
│ 03/11/2025           │
└──────────────────────┘

Paso 1: Consultar tasa de cambio
┌────────────────────────────────────────────────────────┐
│ ExchangeRate API                                        │
│ GET /v6/{KEY}/pair/GTQ/USD                             │
│                                                         │
│ Response:                                               │
│ {                                                       │
│   "conversion_rate": 0.128205,                         │
│   "time_last_update": "2025-11-03 00:00:01"           │
│ }                                                       │
└────────────────────────────────────────────────────────┘

Paso 2: Calcular monto en USD
┌────────────────────────────────────────────────────────┐
│ Fórmula:                                                │
│                                                         │
│   monto_usd = monto_original × tasa_cambio             │
│             = 390.00 GTQ × 0.128205                    │
│             = 50.00 USD                                │
│                                                         │
│ Redondeo: 2 decimales (HALF_UP)                        │
└────────────────────────────────────────────────────────┘

Paso 3: Guardar en BD
┌────────────────────────────────────────────────────────┐
│ Campo                 │ Valor                          │
├───────────────────────┼────────────────────────────────┤
│ monto                 │ 390.00   (original)            │
│ moneda                │ GTQ      (ISO 4217)            │
│ monto_usd             │ 50.00    (convertido)          │
│ tasa_cambio           │ 0.128205 (de API)              │
│ fecha_tasa_cambio     │ 2025-11-03 (de API)            │
└───────────────────────┴────────────────────────────────┘

Resultado:
✓ Usuario pagó Q 390.00 en Guatemala
✓ Sistema registra USD $50.00 para reportes corporativos
✓ Auditoría sabe que la tasa usada fue 0.128205 del 3-nov-2025
```

---

## 🌍 Casos de Uso por País

```
┌─────────────────────────────────────────────────────────────────┐
│ CENTROAMÉRICA: Monedas Soportadas                               │
└─────────────────────────────────────────────────────────────────┘

🇬🇹 GUATEMALA
   Moneda: Quetzal (GTQ)
   Ejemplo: Almuerzo Q 75.00 → USD $9.62
   Tasa aprox: 1 USD = 7.80 GTQ

🇭🇳 HONDURAS
   Moneda: Lempira (HNL)
   Ejemplo: Taxi L 50.00 → USD $2.04
   Tasa aprox: 1 USD = 24.50 HNL

🇵🇦 PANAMÁ
   Moneda: Balboa (PAB)
   Ejemplo: Hotel B/ 80.00 → USD $80.00
   Tasa: 1 USD = 1 PAB (paridad 1:1)

🇸🇻 EL SALVADOR
   Moneda: USD (dolarizado)
   Ejemplo: Gasolina $25.00 → USD $25.00
   Nota: No requiere conversión

🇪🇺 EUROPA (viajes internacionales)
   Moneda: Euro (EUR)
   Ejemplo: Cena € 45.00 → USD $48.91
   Tasa aprox: 1 USD = 0.92 EUR
```

---

## 🎯 Validaciones Implementadas

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (GastoForm.tsx)                                         │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Moneda es requerida                                           │
│ ✓ Monto > 0 y formato numérico                                  │
│ ✓ Fecha no puede ser futura                                     │
│ ✓ Categoría es requerida                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (CrearGastoFromLlmRequest.java)                         │
├─────────────────────────────────────────────────────────────────┤
│ @NotNull IdEvento                                                │
│ @NotBlank Moneda                                                 │
│ @Pattern Moneda: "^(USD|GTQ|HNL|PAB|EUR)$"                      │
│ @Pattern MontoTotal: "^\d+(\.\d{1,2})?$"                        │
│ @Pattern Fecha: "^\d{4}-\d{2}-\d{2}$"                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SERVICIO (ConversionMonedaService.java)                         │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Moneda existe en MonedaEnum                                   │
│ ✓ API responde "success"                                        │
│ ✓ Tasa de conversión > 0                                        │
│ ✓ Fallback si API falla (tasas aproximadas)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 Reportes y Auditoría

```
┌─────────────────────────────────────────────────────────────────┐
│ VENTAJAS DE GUARDAR MONTO ORIGINAL + CONVERTIDO                │
└─────────────────────────────────────────────────────────────────┘

1. REPORTE DE GASTOS POR PAÍS
   ┌──────────────────────────────────────────────┐
   │ País       │ Moneda Local │ Total USD       │
   ├────────────┼──────────────┼─────────────────┤
   │ Guatemala  │ Q 1,250.00   │ $ 160.26        │
   │ Honduras   │ L 850.00     │ $ 34.69         │
   │ Panamá     │ B/ 300.00    │ $ 300.00        │
   ├────────────┴──────────────┼─────────────────┤
   │ TOTAL                     │ $ 494.95        │
   └───────────────────────────┴─────────────────┘

2. AUDITORÍA DE TASAS DE CAMBIO
   ┌───────────┬────────┬──────────┬─────────────────┐
   │ Fecha     │ Moneda │ Tasa     │ Diferencia día  │
   ├───────────┼────────┼──────────┼─────────────────┤
   │ 2025-11-01│ GTQ    │ 0.128500 │ +0.30%          │
   │ 2025-11-03│ GTQ    │ 0.128205 │ -0.23%          │
   └───────────┴────────┴──────────┴─────────────────┘

3. VALIDACIÓN CONTABLE
   - Factura dice: Q 390.00
   - Sistema registró: Q 390.00 (monto)
   - Tasa usada: 0.128205 (tasa_cambio)
   - Fecha tasa: 2025-11-03 (fecha_tasa_cambio)
   - Conversión: $50.00 (monto_usd)
   
   ✓ Trazabilidad completa para auditoría
```

---

**Fecha**: 3 de noviembre de 2025  
**Versión**: 1.0  
**Estado**: ✅ Documentación Completa
