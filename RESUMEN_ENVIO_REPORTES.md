# 📧 SISTEMA DE ENVÍO DE REPORTES DE GASTOS - RESUMEN COMPLETO

## ✅ IMPLEMENTACIÓN COMPLETADA

### 🎯 Objetivo
Permitir a los usuarios finalizar un evento y enviar automáticamente el reporte de gastos por correo electrónico a los proveedores según el país, utilizando Clean Architecture.

---

## 📊 ARQUITECTURA IMPLEMENTADA

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  EnviarReporteModal.tsx                                     │
│  ├─ Formulario de selección de destinatario                 │
│  ├─ Input de nombre de proveedor                            │
│  └─ Selector de formato (Excel/PDF)                         │
└─────────────────────────────────────────────────────────────┘
                            ▼
                    POST /api/eventos/{id}/enviar-reporte
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA PRESENTACIÓN (REST)                 │
│  ReporteController.java                                     │
│  ├─ GET /api/reportes/destinatarios                         │
│  └─ POST /api/eventos/{id}/enviar-reporte                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA APLICACIÓN                          │
│  EnviarReporteGastosUseCase.java                            │
│  ├─ 1. Validar evento existe y tiene gastos                 │
│  ├─ 2. Cambiar estado → "completado"                        │
│  ├─ 3. Generar reporte (delegado a Puerto)                  │
│  └─ 4. Enviar correo (delegado a Puerto)                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DOMINIO                             │
│  Entities: Evento, Gasto, Empleado                          │
│  Repositories: EventoRepository, GastoRepository            │
│  Ports (Interfaces):                                        │
│  ├─ ReporteGeneratorPort                                    │
│  └─ EmailSenderPort                                         │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   CAPA INFRAESTRUCTURA                      │
│  Adaptadores (Implementaciones):                            │
│  ├─ ExcelReporteGenerator → Apache POI                      │
│  └─ QuarkusMailerAdapter → Quarkus Mailer (SMTP)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 ARCHIVOS CREADOS

### Backend (Quarkus)

#### ✅ DTOs (`application/dto/reporte/`)
```
DestinatarioReporteDTO.java       - Info de correos por país
EnviarReporteRequest.java         - Request para envío
EnviarReporteResponse.java        - Response con confirmación
```

#### ✅ Puertos (`application/port/output/`)
```
ReporteGeneratorPort.java         - Contrato para generación de reportes
EmailSenderPort.java              - Contrato para envío de correos
```

#### ✅ Use Cases (`application/usecase/reporte/`)
```
EnviarReporteGastosUseCase.java   - Lógica de negocio principal
```

#### ✅ Adaptadores (`infrastructure/adapter/`)
```
email/QuarkusMailerAdapter.java   - Envío SMTP con Quarkus
reporte/ExcelReporteGenerator.java - Generación Excel con Apache POI
rest/ReporteController.java       - Endpoints REST
```

#### ✅ Configuración
```
application.properties            - Correos por país + SMTP config
.env.example                      - Variables de entorno
```

### Frontend (React + TypeScript)

#### ✅ Types (`src/types/`)
```
reporte.ts                        - Interfaces TypeScript
```

#### ✅ Services (`src/services/`)
```
reportes.ts                       - Llamadas a API
```

#### ✅ Components (`src/components/`)
```
EnviarReporteModal.tsx            - Modal para enviar reportes
```

### Scripts de Prueba
```
test-enviar-reporte.ps1           - Script PowerShell para testing
```

### Documentación
```
BackEnd/FEATURE_ENVIO_REPORTES.md            - Guía completa backend
FrontEnd/INTEGRACION_ENVIO_REPORTES.md       - Guía integración frontend
```

---

## 🔧 CONFIGURACIÓN NECESARIA

### 1. Backend - application.properties

```properties
# Correos de proveedores
app.email.proveedores.sv=proveedores.sv@datumredsoft.com
app.email.proveedores.gt=proveedores.gt@datumredsoft.com
app.email.proveedores.hn=proveedores.hn@datumredsoft.com
app.email.proveedores.pa=proveedores.pn@datumredsoft.com
app.email.proveedores.cr=proveedores.cr@datumredsoft.com

# SMTP
quarkus.mailer.from=noreply@datumredsoft.com
quarkus.mailer.host=smtp.gmail.com
quarkus.mailer.port=587
quarkus.mailer.start-tls=true
quarkus.mailer.username=${SMTP_USERNAME:}
quarkus.mailer.password=${SMTP_PASSWORD:}
quarkus.mailer.mock=true  # Cambiar a false en producción
```

### 2. Variables de Entorno (.env)

```env
# SMTP (ejemplo con Gmail)
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
MAILER_MOCK=true
```

### 3. Maven Dependency

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-mailer</artifactId>
</dependency>
```

---

## 📡 API ENDPOINTS

### 1. Listar Destinatarios
```http
GET /api/reportes/destinatarios
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "codigoPais": "GT",
    "nombrePais": "Guatemala",
    "email": "proveedores.gt@datumredsoft.com",
    "asuntoEjemplo": "GT-[PROVEEDOR]"
  }
]
```

### 2. Enviar Reporte
```http
POST /api/eventos/{id}/enviar-reporte
Authorization: Bearer {token}
Content-Type: application/json

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

---

## 🔄 FLUJO COMPLETO

```
1. Usuario en EventDetail.tsx
   ↓
2. Click en "Finalizar y Enviar Reporte"
   ↓
3. EnviarReporteModal se abre
   ↓
4. GET /api/reportes/destinatarios → Carga países
   ↓
5. Usuario selecciona:
   - País/Destinatario: Guatemala
   - Proveedor: SUBWAY
   - Formato: Excel
   ↓
6. Click en "Enviar Reporte"
   ↓
7. POST /api/eventos/1/enviar-reporte
   ↓
8. Backend (EnviarReporteGastosUseCase):
   a. Busca evento y gastos
   b. Cambia estado → "completado"
   c. Genera Excel (ExcelReporteGenerator)
   d. Envía correo (QuarkusMailerAdapter)
   ↓
9. Response exitoso → Alert de confirmación
   ↓
10. Modal se cierra
   ↓
11. Página recarga → Evento ahora "completado"
   ↓
12. Botón "Agregar Gasto" desaparece ✅
```

---

## 📊 FORMATO DEL REPORTE EXCEL

```
┌──────────────────────────────────────────────────┐
│    REPORTE DE GASTOS - DATUM TRAVELS             │
├──────────────────────────────────────────────────┤
│ Evento: VIAJE GUATEMALA                          │
│ Empleado: Carlos Martínez                        │
│ Fecha Registro: 21/01/2025                       │
│ Estado: completado                               │
├────┬──────────┬──────────┬─────────┬───────────┤
│ ID │  Fecha   │Categoría │ Monto   │ Monto USD │
├────┼──────────┼──────────┼─────────┼───────────┤
│  1 │21/01/2025│ Alimento │ Q 34.25 │  $ 4.45   │
│  2 │21/01/2025│Transport │ Q 77.00 │  $ 10.01  │
├────┴──────────┴──────────┴─────────┴───────────┤
│                        TOTAL USD:    $ 125.50   │
└──────────────────────────────────────────────────┘
```

**Columnas incluidas:**
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

## 📧 FORMATO DEL CORREO

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
```
Reporte_Gastos_VIAJE_GUATEMALA_1.xlsx
```

---

## 🧪 TESTING

### Prueba con PowerShell

```powershell
cd "C:\...\Proyecto Final"
.\test-enviar-reporte.ps1
```

### Prueba con cURL

```bash
# 1. Listar destinatarios
curl -X GET http://localhost:8081/api/reportes/destinatarios

# 2. Enviar reporte
curl -X POST http://localhost:8081/api/eventos/1/enviar-reporte \
  -H "Content-Type: application/json" \
  -d '{
    "emailDestino": "proveedores.gt@datumredsoft.com",
    "codigoPais": "GT",
    "nombreProveedor": "SUBWAY",
    "formato": "EXCEL"
  }'
```

---

## 🚀 PRÓXIMOS PASOS PARA INTEGRACIÓN

### Backend (Ya Completado ✅)
- [x] DTOs creados
- [x] Use Case implementado
- [x] Puertos definidos
- [x] Adaptadores creados
- [x] Controller REST configurado
- [x] Dependencias agregadas
- [x] Configuración lista

### Frontend (Pendiente de Integración)
- [ ] Importar `EnviarReporteModal` en `EventDetail.tsx`
- [ ] Agregar estado `showReporteModal`
- [ ] Agregar botón "Finalizar y Enviar Reporte"
- [ ] Renderizar modal
- [ ] Probar flujo completo

**Ver guía detallada en**: `FrontEnd/INTEGRACION_ENVIO_REPORTES.md`

---

## 🎨 EJEMPLO DE BOTÓN PARA EventDetail.tsx

```tsx
import { useState } from 'react';
import { Send } from 'lucide-react';
import EnviarReporteModal from '../components/EnviarReporteModal';

// Dentro del componente EventDetail:
const [showReporteModal, setShowReporteModal] = useState(false);

// En el JSX (sección de botones):
{gastos.length > 0 && evento?.estado === 'activo' && (
  <button
    onClick={() => setShowReporteModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
  >
    <Send size={20} />
    Finalizar y Enviar Reporte
  </button>
)}

// Al final del JSX:
{showReporteModal && (
  <EnviarReporteModal
    eventoId={Number(id)}
    nombreEvento={evento.nombreEvento}
    onClose={() => setShowReporteModal(false)}
    onSuccess={() => window.location.reload()}
  />
)}
```

---

## ⚙️ CONFIGURACIÓN DE SMTP

### Opción 1: Gmail (Desarrollo)
1. Ir a https://myaccount.google.com/apppasswords
2. Generar contraseña de aplicación
3. Agregar al `.env`:
```env
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
MAILER_MOCK=false
```

### Opción 2: Mailtrap (Testing)
```properties
quarkus.mailer.host=sandbox.smtp.mailtrap.io
quarkus.mailer.port=2525
quarkus.mailer.username=tu-usuario
quarkus.mailer.password=tu-password
quarkus.mailer.mock=false
```

### Opción 3: Modo Mock (Sin Envío Real)
```env
MAILER_MOCK=true
```
Los correos se loguean en consola pero NO se envían.

---

## ✅ VALIDACIONES IMPLEMENTADAS

### Backend
- ✅ Evento existe
- ✅ Evento tiene gastos (mínimo 1)
- ✅ Email destino válido
- ✅ Código de país válido (SV, GT, HN, PA, CR)
- ✅ Formato válido (EXCEL o PDF)

### Frontend
- ✅ Destinatario seleccionado (obligatorio)
- ✅ Formato seleccionado (obligatorio)
- ✅ Nombre proveedor opcional
- ✅ Solo muestra botón si evento activo
- ✅ Solo muestra botón si hay gastos

---

## 🐛 ERRORES COMUNES Y SOLUCIONES

### 1. "Evento no tiene gastos"
**Causa**: Intentar enviar reporte de evento vacío  
**Solución**: Agregar al menos 1 gasto antes de finalizar

### 2. "Connection refused" en SMTP
**Causa**: Credenciales incorrectas o SMTP bloqueado  
**Solución**: Usar `MAILER_MOCK=true` para testing

### 3. "Evento no encontrado"
**Causa**: ID incorrecto en el request  
**Solución**: Verificar que el evento existe en BD

---

## 📖 DOCUMENTACIÓN COMPLETA

### Para Desarrolladores Backend
📄 `BackEnd/FEATURE_ENVIO_REPORTES.md`
- Arquitectura detallada
- API Endpoints
- Configuración SMTP
- Testing

### Para Desarrolladores Frontend
📄 `FrontEnd/INTEGRACION_ENVIO_REPORTES.md`
- Guía de integración paso a paso
- Ejemplos de código
- Estilos y responsive
- Flujo de usuario

---

## 🎯 BENEFICIOS DE LA IMPLEMENTACIÓN

✅ **Clean Architecture**: Separación clara de responsabilidades  
✅ **Testeable**: Puertos permiten fácil mocking  
✅ **Extensible**: Fácil agregar nuevos formatos (PDF real)  
✅ **Mantenible**: Código organizado y documentado  
✅ **Reusable**: Servicios pueden usarse en otros contextos  

---

## 🚀 LISTO PARA PRODUCCIÓN

### Antes de Desplegar:

1. **Configurar SMTP real**:
   ```env
   MAILER_MOCK=false
   SMTP_USERNAME=correo-corporativo
   SMTP_PASSWORD=password-seguro
   ```

2. **Actualizar correos de proveedores** en `application.properties`

3. **Probar envío real** con destinatarios de prueba

4. **Monitorear logs** durante primeros envíos

---

**✅ IMPLEMENTACIÓN COMPLETADA Y LISTA PARA INTEGRACIÓN**

El sistema está funcional y sigue las mejores prácticas de Clean Architecture.
Solo falta integrar el componente `EnviarReporteModal` en `EventDetail.tsx`.
