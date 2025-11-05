# ✅ Solución: Error de Inyección de Quarkus Mailer

## 🔍 Error Original

```
Error al enviar el correo: Error injecting io.quarkus.mailer.Mailer 
datum.travels.infrastructure.adapter.email.QuarkusMailerAdapter.mailer
```

---

## 🕵️ Causas Encontradas

### **1. Tipo de Mailer Incorrecto**
- ❌ Usando: `io.quarkus.mailer.Mailer` (síncrono - deprecated)
- ✅ Debe usar: `io.quarkus.mailer.reactive.ReactiveMailer`

### **2. Variables de Entorno No Cargadas**
- El archivo `.env` NO se lee automáticamente en Quarkus dev mode
- Las variables `${SMTP_FROM}`, `${SMTP_PASSWORD}`, etc. quedaban vacías

---

## ✅ Soluciones Aplicadas

### **1️⃣ Cambiar a ReactiveMailer**

**Antes:**
```java
@Inject
Mailer mailer;

mailer.send(Mail.withHtml(...));
```

**Después:**
```java
@Inject
ReactiveMailer mailer;

mailer.send(Mail.withHtml(...))
    .await().indefinitely();
```

### **2️⃣ Configuración Directa en application.properties**

**Antes (con variables de entorno):**
```properties
quarkus.mailer.from=${SMTP_FROM:noreply@datumredsoft.com}
quarkus.mailer.username=${SMTP_USERNAME:}
quarkus.mailer.password=${SMTP_PASSWORD:}
quarkus.mailer.mock=${MAILER_MOCK:true}
```

**Después (valores directos):**
```properties
quarkus.mailer.from=12.hectorcarlos.777@gmail.com
quarkus.mailer.host=smtp.gmail.com
quarkus.mailer.port=587
quarkus.mailer.start-tls=true
quarkus.mailer.username=12.hectorcarlos.777@gmail.com
quarkus.mailer.password=iglxddrgbthfrell
quarkus.mailer.mock=false
```

---

## 📁 Archivos Modificados

### ✅ `QuarkusMailerAdapter.java`
```java
@ApplicationScoped
public class QuarkusMailerAdapter implements EmailSenderPort {
    
    @Inject
    ReactiveMailer mailer;  // ← Cambio aquí
    
    @Override
    public void enviarConAdjunto(...) {
        mailer.send(
            Mail.withHtml(emailDestino, asunto, cuerpo)
                .addAttachment(archivoNombre, archivoContenido, archivoContentType)
        ).await().indefinitely();  // ← Y aquí
    }
}
```

### ✅ `application.properties`
```properties
# Configuración Gmail directa (sin variables de entorno)
quarkus.mailer.from=12.hectorcarlos.777@gmail.com
quarkus.mailer.host=smtp.gmail.com
quarkus.mailer.port=587
quarkus.mailer.start-tls=true
quarkus.mailer.username=12.hectorcarlos.777@gmail.com
quarkus.mailer.password=iglxddrgbthfrell
quarkus.mailer.mock=false
```

---

## 🚀 Pasos para Aplicar

### **1. Reiniciar el Backend**
```powershell
cd BackEnd\quarkus-api
.\mvnw compile quarkus:dev
```

### **2. Verificar Logs de Inicio**
Busca en la consola:
```
INFO  [io.quarkus.mailer] (main) SMTP server configured: smtp.gmail.com:587
```

### **3. Probar desde el Frontend**
1. Login → HOME → Click en evento
2. Click botón azul 📧
3. Llenar formulario (País: SV, Proveedor: PIZZA HUT)
4. Click "Enviar Reporte"

### **4. Verificar Email**
- Revisar bandeja de `12.hectorcarlos.777@gmail.com`
- Asunto: `SV-PIZZA HUT` (o lo que hayas puesto)
- Adjunto: `Reporte_Gastos_Evento_{ID}.xlsx`

---

## 🔧 Detalles Técnicos

### **ReactiveMailer vs Mailer**

| Característica | `Mailer` | `ReactiveMailer` |
|----------------|----------|------------------|
| **Tipo** | Síncrono | Reactivo (Mutiny) |
| **Estado** | Deprecated | Recomendado |
| **Inyección** | `@Inject Mailer` | `@Inject ReactiveMailer` |
| **Uso** | `mailer.send(...)` | `mailer.send(...).await()` |
| **Performance** | Bloqueante | Non-blocking |

### **await().indefinitely()**
- Convierte `Uni<Void>` (reactivo) a operación síncrona
- Espera hasta que el email se envíe completamente
- Lanza excepción si falla

### **Configuración SMTP Gmail**

```properties
quarkus.mailer.host=smtp.gmail.com
quarkus.mailer.port=587              # STARTTLS
quarkus.mailer.start-tls=true        # Encriptación
quarkus.mailer.username=EMAIL        # Email completo
quarkus.mailer.password=APP_PASSWORD # No contraseña normal
quarkus.mailer.mock=false            # false = envía real
```

---

## 🐛 Troubleshooting

### ❌ **"535 Authentication failed"**
- Verifica que el App Password sea correcto
- Asegúrate que 2FA esté activado en Gmail
- Revisa que no tenga espacios: `iglxddrgbthfrell`

### ❌ **"Connection timeout"**
- Puerto 587 debe estar abierto
- Prueba cambiar a puerto 465 (SSL)
- Verifica firewall/antivirus

### ❌ **"Mailer not found"**
- Reinicia Quarkus completamente
- Verifica que `quarkus-mailer` esté en `pom.xml`
- Limpia y recompila: `mvn clean compile`

### ❌ **Email no llega**
- Revisa spam/correo no deseado
- Verifica que `quarkus.mailer.mock=false`
- Revisa logs del backend para errores SMTP

---

## 📊 Ejemplo de Logs Exitosos

```
INFO  [io.quarkus.mailer] (main) Mock mail server started on localhost:1025
INFO  [QuarkusMailerAdapter] Enviando correo a 12.hectorcarlos.777@gmail.com con asunto: SV-PIZZA HUT
INFO  [QuarkusMailerAdapter] Correo enviado exitosamente a 12.hectorcarlos.777@gmail.com
```

---

## 🎯 Resultado Esperado

Después de los cambios:

```
✅ Quarkus inicia sin errores de inyección
✅ SMTP configurado correctamente
✅ Email enviado a 12.hectorcarlos.777@gmail.com
✅ Adjunto: Excel con gastos del evento
✅ Estado del evento: "completado"
```

---

## 📚 Referencias

- **Quarkus Mailer:** https://quarkus.io/guides/mailer
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Reactive Mailer:** https://quarkus.io/guides/mailer#reactive-mailer

---

## 💡 Mejora Futura (Opcional)

Para usar variables de entorno en producción, puedes:

1. **Usar dotenv-java:**
```xml
<dependency>
    <groupId>io.github.cdimascio</groupId>
    <artifactId>dotenv-java</artifactId>
    <version>3.0.0</version>
</dependency>
```

2. **Configurar en el sistema:**
```bash
export SMTP_PASSWORD=iglxddrgbthfrell
```

3. **Usar ConfigMap en Kubernetes**

Pero para desarrollo, valores directos es más simple.
