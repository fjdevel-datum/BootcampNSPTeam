# ✅ Configuración de Email Completada

## 📧 Cuenta de Email Configurada

**Email:** `12.hectorcarlos.777@gmail.com`  
**App Password:** `iglx ddrg bthf rell` *(sin espacios)*  
**SMTP:** `smtp.gmail.com:587` (TLS)

---

## 🌎 Destinatarios por País

Todos los países ahora envían al mismo correo:

| País | Código | Email |
|------|--------|-------|
| **El Salvador** | SV | `12.hectorcarlos.777@gmail.com` |
| **Guatemala** | GT | `12.hectorcarlos.777@gmail.com` |
| **Honduras** | HN | `12.hectorcarlos.777@gmail.com` |
| **Panamá** | PA | `12.hectorcarlos.777@gmail.com` |
| **Costa Rica** | CR | `12.hectorcarlos.777@gmail.com` |

---

## 📁 Archivos Actualizados

### ✅ `.env`
```bash
SMTP_FROM=12.hectorcarlos.777@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=12.hectorcarlos.777@gmail.com
SMTP_PASSWORD=iglxddrgbthfrell
MAILER_MOCK=false  # ⚠️ Enviará correos REALES
```

### ✅ `application.properties`
```properties
app.email.proveedores.sv=12.hectorcarlos.777@gmail.com
app.email.proveedores.gt=12.hectorcarlos.777@gmail.com
app.email.proveedores.hn=12.hectorcarlos.777@gmail.com
app.email.proveedores.pa=12.hectorcarlos.777@gmail.com
app.email.proveedores.cr=12.hectorcarlos.777@gmail.com

quarkus.mailer.from=${SMTP_FROM:noreply@datumredsoft.com}
quarkus.mailer.host=${SMTP_HOST:smtp.gmail.com}
quarkus.mailer.port=${SMTP_PORT:587}
quarkus.mailer.start-tls=true
quarkus.mailer.username=${SMTP_USERNAME:}
quarkus.mailer.password=${SMTP_PASSWORD:}
```

---

## 🧪 Próximos Pasos

### 1️⃣ **Reiniciar el Backend**
```powershell
cd BackEnd\quarkus-api
.\mvnw compile quarkus:dev
```

### 2️⃣ **Probar Envío de Reporte**
```powershell
.\test-enviar-reporte.ps1
```

**Ejemplo de request:**
```json
{
  "codigoPais": "SV",
  "nombreProveedor": "PIZZA HUT SAN SALVADOR"
}
```

**Endpoint:** `POST http://localhost:8081/api/eventos/{idEvento}/enviar-reporte`

### 3️⃣ **Verificar Email**
- Revisa la bandeja de entrada de `12.hectorcarlos.777@gmail.com`
- El asunto será: `SV-PIZZA HUT SAN SALVADOR`
- Debe incluir archivo Excel adjunto con los gastos

---

## 📊 Formato del Email

### **Asunto:**
```
{CODIGO_PAIS}-{NOMBRE_PROVEEDOR}
```
*Ejemplos:* `SV-PIZZA HUT`, `GT-SUBWAY DE GUATEMALA`

### **Cuerpo (HTML):**
```html
<h2>Reporte de Gastos - Evento #{ID}</h2>
<p><strong>Empleado:</strong> Carlos Henríquez</p>
<p><strong>Evento:</strong> Viaje a San Salvador</p>
<p><strong>Período:</strong> 15/01/2025 - 20/01/2025</p>
<p><strong>Total Gastos:</strong> USD 250.75</p>
<p>Adjunto encontrará el reporte detallado en formato Excel.</p>
```

### **Adjunto:**
- **Nombre:** `Reporte_Gastos_Evento_{ID}.xlsx`
- **Formato:** Excel (.xlsx)
- **Contenido:**
  - Información del evento
  - Tabla de gastos con totales
  - Columnas: ID, Fecha, Categoría, Descripción, Lugar, Monto, Moneda, Monto USD, Tarjeta

---

## ⚙️ Configuración Técnica

### **Quarkus Mailer (SMTP)**
- **Extensión:** `quarkus-mailer`
- **Implementación:** `QuarkusMailerAdapter.java`
- **Port:** `EmailSenderPort.java` (Clean Architecture)

### **Seguridad Gmail**
- Requiere **App Password** (no contraseña normal)
- 2FA debe estar activado en la cuenta
- TLS en puerto 587

### **Estados del Evento**
Cuando se envía el reporte:
```
activo → completado ✅
```

Si falla el envío:
```
(mantiene estado actual) ⚠️
```

---

## 🐛 Troubleshooting

### ❌ Error: "Authentication failed"
- Verifica que el App Password no tenga espacios
- Confirma que 2FA esté activo en Gmail

### ❌ Error: "Connection timeout"
- Verifica que puerto 587 esté abierto
- Intenta cambiar a puerto 465 (SSL)

### ❌ Email no llega
- Revisa spam/correo no deseado
- Verifica que `MAILER_MOCK=false` en `.env`
- Revisa logs del backend en la consola

---

## 📚 Documentación Relacionada

- **Feature:** `FEATURE_ENVIO_REPORTES.md`
- **Integración Frontend:** `INTEGRACION_ENVIO_REPORTES.md`
- **Script de prueba:** `test-enviar-reporte.ps1`
