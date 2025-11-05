# 📧 Sistema de Envío de Reportes de Gastos

## ✅ Implementación Completada

### 📋 Descripción General

Sistema para finalizar eventos y enviar reportes de gastos por correo electrónico a proveedores según el país. Sigue Clean Architecture y utiliza:

- **Quarkus Mailer**: Para envío de correos SMTP
- **Apache POI**: Para generación de reportes Excel
- **Clean Architecture**: Separación de responsabilidades

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA PRESENTACIÓN                        │
│  ReporteController                                          │
│  ├─ GET /api/reportes/destinatarios                         │
│  └─ POST /api/eventos/{id}/enviar-reporte                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA APLICACIÓN                          │
│  EnviarReporteGastosUseCase                                 │
│  ├─ Validar evento y gastos                                 │
│  ├─ Cambiar estado a "completado"                           │
│  ├─ Generar reporte (Excel/PDF)                             │
│  └─ Enviar correo con adjunto                               │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DOMINIO                             │
│  Entities: Evento, Gasto                                    │
│  Repositories: EventoRepository, GastoRepository            │
│  Ports: ReporteGeneratorPort, EmailSenderPort               │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   CAPA INFRAESTRUCTURA                      │
│  QuarkusMailerAdapter → Envío de correos                    │
│  ExcelReporteGenerator → Generación de reportes Excel       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos Creados

### ✅ DTOs (application/dto/reporte/)
- `DestinatarioReporteDTO.java` - Info de destinatarios por país
- `EnviarReporteRequest.java` - Request para envío de reporte
- `EnviarReporteResponse.java` - Response con confirmación

### ✅ Puertos (application/port/output/)
- `ReporteGeneratorPort.java` - Interfaz para generación de reportes
- `EmailSenderPort.java` - Interfaz para envío de correos

### ✅ Use Cases (application/usecase/reporte/)
- `EnviarReporteGastosUseCase.java` - Lógica de negocio principal

### ✅ Adaptadores (infrastructure/adapter/)
- `email/QuarkusMailerAdapter.java` - Implementación con Quarkus Mailer
- `reporte/ExcelReporteGenerator.java` - Generador de Excel con Apache POI
- `rest/ReporteController.java` - Endpoints REST

---

## 🔧 Configuración

### 1. Variables de Entorno (application.properties)

```properties
# Correos de proveedores por país
app.email.proveedores.sv=proveedores.sv@datumredsoft.com
app.email.proveedores.gt=proveedores.gt@datumredsoft.com
app.email.proveedores.hn=proveedores.hn@datumredsoft.com
app.email.proveedores.pa=proveedores.pn@datumredsoft.com
app.email.proveedores.cr=proveedores.cr@datumredsoft.com

# SMTP Configuration
quarkus.mailer.from=noreply@datumredsoft.com
quarkus.mailer.host=smtp.gmail.com
quarkus.mailer.port=587
quarkus.mailer.start-tls=true
quarkus.mailer.username=${SMTP_USERNAME:}
quarkus.mailer.password=${SMTP_PASSWORD:}
quarkus.mailer.mock=true  # Cambiar a false en producción
```

### 2. Configurar SMTP (Opciones)

#### Opción A: Gmail (Desarrollo)
1. Ir a https://myaccount.google.com/apppasswords
2. Generar contraseña de aplicación
3. Configurar en `.env`:
```env
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-generado
```

#### Opción B: Mailtrap (Testing)
```properties
quarkus.mailer.host=sandbox.smtp.mailtrap.io
quarkus.mailer.port=2525
quarkus.mailer.username=tu-usuario-mailtrap
quarkus.mailer.password=tu-password-mailtrap
```

#### Opción C: Servidor Corporativo
```properties
quarkus.mailer.host=smtp.empresa.com
quarkus.mailer.port=587
quarkus.mailer.username=usuario@empresa.com
quarkus.mailer.password=password-seguro
```

---

## 📡 API Endpoints

### 1. Listar Destinatarios

```http
GET /api/reportes/destinatarios
```

**Response:**
```json
[
  {
    "codigoPais": "SV",
    "nombrePais": "El Salvador",
    "email": "proveedores.sv@datumredsoft.com",
    "asuntoEjemplo": "SV-[PROVEEDOR]"
  },
  {
    "codigoPais": "GT",
    "nombrePais": "Guatemala",
    "email": "proveedores.gt@datumredsoft.com",
    "asuntoEjemplo": "GT-[PROVEEDOR]"
  }
]
```

### 2. Enviar Reporte de Gastos

```http
POST /api/eventos/{id}/enviar-reporte
Content-Type: application/json
```

**Request Body:**
```json
{
  "emailDestino": "proveedores.gt@datumredsoft.com",
  "codigoPais": "GT",
  "nombreProveedor": "SUBWAY DE GUATEMALA",
  "formato": "EXCEL"
}
```

**Response (Éxito):**
```json
{
  "exitoso": true,
  "mensaje": "Reporte enviado exitosamente a proveedores.gt@datumredsoft.com",
  "emailDestino": "proveedores.gt@datumredsoft.com",
  "asunto": "GT-SUBWAY DE GUATEMALA",
  "formato": "EXCEL",
  "cantidadGastos": 5
}
```

**Response (Error):**
```json
{
  "exitoso": false,
  "mensaje": "No se puede enviar el reporte: el evento no tiene gastos registrados"
}
```

---

## 🧪 Testing

### Prueba Manual con cURL

```bash
# 1. Listar destinatarios
curl -X GET http://localhost:8081/api/reportes/destinatarios

# 2. Enviar reporte (Excel)
curl -X POST http://localhost:8081/api/eventos/1/enviar-reporte \
  -H "Content-Type: application/json" \
  -d '{
    "emailDestino": "proveedores.gt@datumredsoft.com",
    "codigoPais": "GT",
    "nombreProveedor": "SUBWAY",
    "formato": "EXCEL"
  }'

# 3. Enviar reporte (PDF - usa Excel temporalmente)
curl -X POST http://localhost:8081/api/eventos/1/enviar-reporte \
  -H "Content-Type: application/json" \
  -d '{
    "emailDestino": "proveedores.sv@datumredsoft.com",
    "codigoPais": "SV",
    "nombreProveedor": "PROVEEDOR TEST",
    "formato": "PDF"
  }'
```

### Script PowerShell de Prueba

Crear `test-enviar-reporte.ps1`:

```powershell
$baseUrl = "http://localhost:8081"
$eventoId = 1

# Request body
$body = @{
    emailDestino = "proveedores.gt@datumredsoft.com"
    codigoPais = "GT"
    nombreProveedor = "SUBWAY DE GUATEMALA"
    formato = "EXCEL"
} | ConvertTo-Json

# Enviar solicitud
Write-Host "Enviando reporte para evento $eventoId..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri "$baseUrl/api/eventos/$eventoId/enviar-reporte" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Mostrar resultado
Write-Host "`nResultado:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 5

if ($response.exitoso) {
    Write-Host "`n✅ Reporte enviado exitosamente!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error: $($response.mensaje)" -ForegroundColor Red
}
```

---

## 🎨 Formato del Correo

El correo generado incluye:

### Asunto
```
GT-SUBWAY DE GUATEMALA
```

### Cuerpo (HTML)
```html
Reporte de Gastos - VIAJE GUATEMALA

País: GT
Empleado: Carlos Martínez
Fecha de Registro: 21/01/2025
Cantidad de Gastos: 5

─────────────────────────────────
Adjunto encontrará el detalle completo de los gastos registrados.

Este es un correo automático generado por Datum Travels.
```

### Adjunto
- **Excel**: `Reporte_Gastos_VIAJE_GUATEMALA_1.xlsx`
- **PDF**: `Reporte_Gastos_VIAJE_GUATEMALA_1.pdf` (temporalmente usa Excel)

---

## 📊 Formato del Reporte Excel

### Estructura

```
┌─────────────────────────────────────────────────────┐
│     REPORTE DE GASTOS - DATUM TRAVELS              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Evento: VIAJE GUATEMALA                             │
│ Empleado: Carlos Martínez                           │
│ Fecha Registro: 21/01/2025                          │
│ Estado: completado                                  │
│                                                     │
├────┬──────────┬───────────┬─────────────┬──────────┤
│ ID │  Fecha   │ Categoría │ Descripción │  Lugar   │
│    │          │           │             │          │
├────┼──────────┼───────────┼─────────────┼──────────┤
│  1 │ 21/01/25 │ Alimento  │ Almuerzo    │ Subway   │
│  2 │ 21/01/25 │ Transporte│ Taxi        │ Zona 10  │
│    │          │           │             │          │
├────┴──────────┴───────────┴─────────────┴──────────┤
│                            TOTAL USD:    $  125.50 │
└─────────────────────────────────────────────────────┘
```

### Columnas Incluidas
1. ID del gasto
2. Fecha
3. Categoría
4. Descripción
5. Lugar
6. Monto original
7. Moneda
8. Monto USD (convertido)
9. Tarjeta utilizada

---

## 🔄 Flujo Completo

```
Usuario en EventDetail
        ↓
Botón "Finalizar y Enviar Reporte"
        ↓
Modal: Seleccionar destinatario
        ↓
GET /api/reportes/destinatarios
        ↓
Usuario completa formulario:
  - Selecciona país/email
  - Ingresa nombre proveedor
  - Selecciona formato (Excel/PDF)
        ↓
POST /api/eventos/{id}/enviar-reporte
        ↓
Backend:
  1. Valida evento existe
  2. Verifica tiene gastos
  3. Cambia estado → "completado"
  4. Genera reporte Excel/PDF
  5. Envía correo con adjunto
        ↓
Frontend: Notificación de éxito/error
```

---

## ⚙️ Dependencias Agregadas

### Maven (pom.xml)

```xml
<!-- Mailer para envío de correos -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-mailer</artifactId>
</dependency>
```

> **Nota**: Apache POI ya estaba incluido para generación de Excel

---

## 🚀 Próximos Pasos

### Frontend (React)

1. **Agregar botón en EventDetail.tsx**:
```tsx
<button onClick={() => setShowReporteModal(true)}>
  📧 Finalizar y Enviar Reporte
</button>
```

2. **Crear componente EnviarReporteModal.tsx**:
- Selector de destinatario (país)
- Input para nombre de proveedor
- Radio buttons para formato (Excel/PDF)
- Botón "Enviar Reporte"

3. **Servicios (services/reportes.ts)**:
```typescript
export const listarDestinatarios = async () => {
  return api.get('/reportes/destinatarios');
};

export const enviarReporte = async (
  eventoId: number, 
  data: EnviarReporteRequest
) => {
  return api.post(`/eventos/${eventoId}/enviar-reporte`, data);
};
```

### Mejoras Futuras

1. **PDF Real**: Integrar librería como iText o Flying Saucer
2. **Plantillas**: Personalizar diseño de reportes
3. **Múltiples adjuntos**: Incluir comprobantes fiscales
4. **Firma digital**: Agregar firma del empleado
5. **Historial de envíos**: Registrar envíos en BD

---

## ❓ Troubleshooting

### Problema: Correos no se envían

**Solución**:
1. Verificar `quarkus.mailer.mock=false` en producción
2. Validar credenciales SMTP
3. Revisar logs: `quarkus.log.category."io.quarkus.mailer".level=DEBUG`

### Problema: Error al generar Excel

**Solución**:
1. Verificar Apache POI en `pom.xml`
2. Ejecutar: `./mvnw clean package`
3. Revisar logs de ExcelReporteGenerator

### Problema: Evento sin gastos

**Respuesta**:
```json
{
  "exitoso": false,
  "mensaje": "No se puede enviar el reporte: el evento no tiene gastos registrados"
}
```
El usuario debe agregar gastos antes de finalizar.

---

## 📞 Contacto y Soporte

Para dudas sobre la implementación, revisa:
- `/swagger-ui` - Documentación interactiva de API
- Logs en consola del backend
- Este archivo de documentación

---

**✅ Implementación completada y lista para integración con el frontend.**
