# Herramientas y Tecnologías - Backend Datum Travels

## 📚 Análisis Completo del Stack Tecnológico

---

## 🔧 Tecnologías Principales (pom.xml)

### 1. **Quarkus 3.27.0** - Framework Principal
```xml
<quarkus.platform.version>3.27.0</quarkus.platform.version>
```

**¿Qué es?**
Framework de Java moderno optimizado para cloud, Kubernetes y GraalVM.

**¿Para qué sirve?**
- Proporciona la base del servidor HTTP
- Maneja inyección de dependencias (CDI)
- Facilita hot-reload en desarrollo
- Permite compilar a binario nativo (súper rápido)

**¿Por qué es la mejor opción?**
- ✅ **Arranque ultra rápido:** 0.042s vs 9s de Spring Boot
- ✅ **Bajo consumo de memoria:** 12 MB vs 70 MB de Spring Boot
- ✅ **Hot Reload automático:** Cambias código y se recarga al instante
- ✅ **Optimizado para contenedores:** Ideal para Docker/Kubernetes
- ✅ **Developer Joy:** Experiencia de desarrollo excelente

**Configuración en el proyecto:**
```properties
quarkus.http.port=8081                    # Puerto del servidor
quarkus.live-reload.instrumentation=true   # Hot reload activado
quarkus.log.level=INFO                    # Nivel de logs
```

---

### 2. **Hibernate ORM + Panache** - Persistencia de Datos
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm-panache</artifactId>
</dependency>
```

**¿Qué es?**
- **Hibernate:** ORM (Object-Relational Mapping) para mapear objetos Java a tablas
- **Panache:** Capa de Quarkus que simplifica Hibernate (menos código)

**¿Para qué sirve?**
- Convertir entidades Java (`Evento.java`) en tablas de Oracle
- Ejecutar queries sin escribir SQL manualmente
- Maneja relaciones (`@ManyToOne`, `@OneToMany`)

**¿Por qué es la mejor opción?**
- ✅ **Menos código:** `find("estado", "activo")` vs escribir SQL completo
- ✅ **Type-safe:** Detecta errores en compilación, no en runtime
- ✅ **Active Record + Repository:** Soporta ambos patrones
- ✅ **Migraciones automáticas:** `quarkus.hibernate-orm.database.generation=update`

**Ejemplo en el proyecto:**
```java
// Sin Panache (JPA tradicional)
EntityManager em;
em.createQuery("SELECT e FROM Evento e WHERE e.estado = :estado")
  .setParameter("estado", "activo")
  .getResultList();

// ✅ Con Panache (Datum Travels)
list("estado", "activo");  // ← Mucho más simple
```

**Configuración:**
```properties
quarkus.hibernate-orm.database.generation=update  # Actualiza esquema automáticamente
quarkus.hibernate-orm.log.sql=true               # Muestra SQL en consola
```

---

### 3. **Oracle JDBC Driver** - Conexión a Base de Datos
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-jdbc-oracle</artifactId>
</dependency>
```

**¿Qué es?**
Driver oficial de Oracle para conectar Java con la base de datos.

**¿Para qué sirve?**
- Establece conexión TCP/IP con Oracle Database XE
- Ejecuta comandos SQL (INSERT, UPDATE, SELECT)
- Maneja transacciones y pooling de conexiones

**¿Por qué es la mejor opción?**
- ✅ **Driver oficial:** Soportado por Oracle directamente
- ✅ **Alto rendimiento:** Optimizado para Oracle Database
- ✅ **Connection pooling:** Reutiliza conexiones (más rápido)

**Configuración:**
```properties
quarkus.datasource.db-kind=oracle
quarkus.datasource.username=datum_user
quarkus.datasource.password=datum2025
quarkus.datasource.jdbc.url=jdbc:oracle:thin:@localhost:1522/XEPDB1
```

---

### 4. **Hibernate Validator** - Validaciones
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-validator</artifactId>
</dependency>
```

**¿Qué es?**
Implementación de Jakarta Bean Validation para validar datos automáticamente.

**¿Para qué sirve?**
- Valida DTOs antes de procesarlos
- Retorna errores 400 Bad Request automáticamente
- Valida con anotaciones (`@NotNull`, `@Size`, `@Email`)

**¿Por qué es la mejor opción?**
- ✅ **Declarativo:** Validaciones directamente en el DTO
- ✅ **Reutilizable:** Mismas validaciones en múltiples endpoints
- ✅ **Mensajes personalizados:** Puedes customizar errores

**Ejemplo en el proyecto:**
```java
public record CrearEventoRequest(
    @NotBlank(message = "El nombre del evento es obligatorio")
    @Size(max = 50, message = "Máximo 50 caracteres")
    String nombreEvento,
    
    @NotNull(message = "El ID del empleado es obligatorio")
    Long idEmpleado
) {}

// ✅ Si envías JSON inválido:
{
  "nombreEvento": "",  ← Falla validación
  "idEmpleado": null   ← Falla validación
}

// Respuesta automática:
{
  "errors": [
    "El nombre del evento es obligatorio",
    "El ID del empleado es obligatorio"
  ]
}
```

---

### 5. **Quarkus OIDC** - Autenticación con Keycloak
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-oidc</artifactId>
</dependency>
```

**¿Qué es?**
Integración con OpenID Connect (protocolo de autenticación moderno).

**¿Para qué sirve?**
- Valida tokens JWT enviados por Keycloak
- Extrae información del usuario (`preferred_username`, roles)
- Protege endpoints con `@Authenticated`

**¿Por qué es la mejor opción?**
- ✅ **Estándar OAuth2/OIDC:** Usado por Google, Microsoft, GitHub
- ✅ **Sin gestionar contraseñas:** Keycloak lo hace por ti
- ✅ **Seguro por defecto:** Valida firma de JWT automáticamente
- ✅ **Integración nativa:** Quarkus + Keycloak = combo perfecto

**Configuración:**
```properties
quarkus.oidc.enabled=true
quarkus.oidc.auth-server-url=http://localhost:8180/realms/datum-travels
quarkus.oidc.client-id=datum-app
quarkus.oidc.token.issuer=any  # Acepta tokens de localhost y LAN
```

**Uso en el proyecto:**
```java
@GET
@Path("/api/eventos")
@Authenticated  // ← Solo usuarios con JWT válido
public Response listarEventos() {
    String username = jwt.getName();  // Del token JWT
    return Response.ok(...).build();
}
```

---

### 6. **SmallRye JWT** - Manejo de Tokens
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-jwt</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-jwt-build</artifactId>
</dependency>
```

**¿Qué es?**
Implementación de MicroProfile JWT para trabajar con tokens JWT.

**¿Para qué sirve?**
- Decodificar tokens JWT recibidos de Keycloak
- Extraer claims (usuario, roles, email)
- Validar firma y expiración de tokens

**¿Por qué es la mejor opción?**
- ✅ **Estándar MicroProfile:** Portable a otros frameworks
- ✅ **Type-safe:** `@Inject JsonWebToken jwt` (no strings manuales)
- ✅ **Claims automáticos:** `jwt.getClaim("email")` sin parsear JSON

**Ejemplo:**
```java
@Inject
JsonWebToken jwt;

public void procesarUsuario() {
    String username = jwt.getName();           // "carlos@datum.com"
    String email = jwt.getClaim("email");      // Claim personalizado
    Set<String> roles = jwt.getGroups();       // ["admin", "empleado"]
}
```

---

### 7. **JJWT (Java JWT)** - Librería JWT Adicional
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
```

**¿Qué es?**
Librería alternativa para crear y validar tokens JWT manualmente.

**¿Para qué sirve?**
- Crear tokens JWT desde cero (si no usas Keycloak)
- Validar tokens con llaves públicas
- Debugging de tokens (decodificar sin validar)

**¿Por qué se incluyó?**
- ✅ **Flexibilidad:** Por si Keycloak falla, podemos generar tokens manualmente
- ✅ **Testing:** Crear tokens de prueba sin Keycloak

---

### 8. **REST Client** - Llamadas HTTP Externas
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-client</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-client-jackson</artifactId>
</dependency>
```

**¿Qué es?**
Cliente HTTP declarativo para consumir APIs REST externas.

**¿Para qué sirve en el proyecto?**
- Llamar a API de conversión de monedas (exchangerate-api.com)
- Llamar a Keycloak Admin API (crear/editar usuarios)
- Llamar al servicio OCR

**¿Por qué es la mejor opción?**
- ✅ **Type-safe:** Defines interfaces Java en vez de escribir HTTP manualmente
- ✅ **Automático:** Serializa JSON automáticamente
- ✅ **Integrado:** Usa el mismo Jackson que los DTOs

**Ejemplo en el proyecto:**
```java
// KeycloakAdminClient.java
@RegisterRestClient(configKey = "keycloak-admin")
public interface KeycloakClient {
    @POST
    @Path("/users")
    Response crearUsuario(UserRepresentation user);
}

// Uso:
@Inject
@RestClient
KeycloakClient keycloakClient;

keycloakClient.crearUsuario(nuevoUsuario);  // ← Llamada HTTP automática
```

---

### 9. **SmallRye OpenAPI / Swagger** - Documentación API
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-openapi</artifactId>
</dependency>
```

**¿Qué es?**
Generador automático de documentación interactiva de la API REST.

**¿Para qué sirve?**
- Genera documentación OpenAPI 3.0 automáticamente
- Interfaz Swagger UI para probar endpoints desde el navegador
- Describe parámetros, respuestas, errores

**¿Por qué es la mejor opción?**
- ✅ **Automático:** Lee las anotaciones JAX-RS y genera docs
- ✅ **Interactivo:** Puedes hacer pruebas desde el navegador
- ✅ **Estándar:** OpenAPI es el estándar de la industria

**Acceso:**
```
http://localhost:8081/swagger-ui
```

**Configuración:**
```properties
quarkus.swagger-ui.always-include=true
quarkus.swagger-ui.path=/swagger-ui
```

---

### 10. **Apache POI** - Generación de Excel
```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

**¿Qué es?**
Librería Java para leer y escribir archivos Excel (.xlsx).

**¿Para qué sirve en el proyecto?**
- Generar reportes de gastos en formato Excel
- Enviarlos por correo como adjuntos
- Crear hojas con tabla de gastos, totales, etc.

**¿Por qué es la mejor opción?**
- ✅ **Estándar de facto:** Librería más usada para Excel en Java
- ✅ **Soporte completo:** Fórmulas, estilos, gráficos
- ✅ **Mantenida activamente:** Apache Foundation

**Uso en el proyecto:**
```java
// ExcelReporteGenerator.java
XSSFWorkbook workbook = new XSSFWorkbook();
XSSFSheet sheet = workbook.createSheet("Gastos");

Row header = sheet.createRow(0);
header.createCell(0).setCellValue("Fecha");
header.createCell(1).setCellValue("Concepto");
header.createCell(2).setCellValue("Monto");

// ... agregar datos de gastos

ByteArrayOutputStream out = new ByteArrayOutputStream();
workbook.write(out);
return out.toByteArray();  // Archivo Excel en memoria
```

---

### 11. **Azure Storage Blob** - Almacenamiento en la Nube
```xml
<dependency>
    <groupId>com.azure</groupId>
    <artifactId>azure-storage-blob</artifactId>
    <version>12.25.1</version>
</dependency>
```

**¿Qué es?**
SDK oficial de Microsoft Azure para acceder a Blob Storage (almacenamiento de archivos).

**¿Para qué sirve en el proyecto?**
- Generar URLs SAS (Shared Access Signature) para acceder a imágenes
- Permitir que el frontend descargue comprobantes desde Azure
- Validar acceso temporal a archivos

**¿Por qué es la mejor opción?**
- ✅ **Seguro:** URLs con token temporal (expiran en 1 hora)
- ✅ **Escalable:** Azure maneja millones de archivos
- ✅ **CDN integrado:** Imágenes se sirven rápido globalmente

**Configuración:**
```properties
azure.storage.account-name=storageocr2025
azure.storage.account-key=${AZURE_STORAGE_ACCOUNT_KEY}
azure.storage.container-name=ocr-files
```

---

### 12. **Quarkus Mailer** - Envío de Correos
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-mailer</artifactId>
</dependency>
```

**¿Qué es?**
Cliente SMTP integrado en Quarkus para enviar correos electrónicos.

**¿Para qué sirve en el proyecto?**
- Enviar reportes de gastos por correo a contabilidad
- Adjuntar archivos Excel generados con Apache POI
- Notificaciones a empleados

**¿Por qué es la mejor opción?**
- ✅ **Asíncrono:** Envía correos sin bloquear la aplicación
- ✅ **Integrado:** No necesitas librerías externas
- ✅ **Soporte Gmail:** Configuración con App Passwords

**Configuración:**
```properties
quarkus.mailer.from=12.hectorcarlos.777@gmail.com
quarkus.mailer.host=smtp.gmail.com
quarkus.mailer.port=587
quarkus.mailer.start-tls=REQUIRED
quarkus.mailer.username=12.hectorcarlos.777@gmail.com
quarkus.mailer.password=iglxddrgbthfrell  # App Password de Gmail
quarkus.mailer.mock=false  # Enviar correos reales
```

**Uso:**
```java
@Inject
Mailer mailer;

mailer.send(
    Mail.withHtml("contabilidad@datum.com", "Reporte de Gastos", "<h1>Reporte</h1>")
        .addAttachment("reporte.xlsx", excelBytes, "application/vnd.ms-excel")
);
```

---

### 13. **REST Assured** - Testing de APIs
```xml
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <scope>test</scope>
</dependency>
```

**¿Qué es?**
Framework para testear APIs REST de forma declarativa.

**¿Para qué sirve?**
- Probar endpoints sin iniciar Postman
- Validar respuestas JSON automáticamente
- Testing automatizado de la API

**¿Por qué es la mejor opción?**
- ✅ **DSL fluido:** `given().when().then()` (fácil de leer)
- ✅ **Integrado con JUnit:** Pruebas automáticas
- ✅ **Validación de JSON:** `assertThat().body("id", notNullValue())`

---

## 📋 Configuraciones Clave (application.properties)

### 🔐 CORS - Comunicación Frontend/Backend
```properties
quarkus.http.cors=true
quarkus.http.cors.origins=*  # Acepta peticiones de cualquier origen (desarrollo)
quarkus.http.cors.methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
quarkus.http.cors.headers=accept,authorization,content-type
```

**¿Por qué?**
Sin CORS, el navegador bloquearía peticiones de React (puerto 5173) a Quarkus (puerto 8081).

---

### 📤 Multipart/Form-Data - Subida de Archivos
```properties
quarkus.http.body.handle-file-uploads=true
quarkus.http.limits.max-body-size=10M  # Máximo 10 MB por archivo
quarkus.http.body.uploads-directory=/tmp/datum-uploads
```

**¿Por qué?**
Permite subir imágenes de comprobantes desde el frontend.

---

### 🔄 Hot Reload - Desarrollo Rápido
```properties
quarkus.live-reload.instrumentation=true
```

**¿Por qué?**
Al guardar un archivo Java, Quarkus recarga automáticamente sin reiniciar.

---

### 📧 Correos por País - Lógica de Negocio
```properties
app.email.proveedores.sv=12.hectorcarlos.777@gmail.com
app.email.proveedores.gt=12.hectorcarlos.777@gmail.com
app.email.proveedores.hn=12.hectorcarlos.777@gmail.com
app.email.proveedores.pa=12.hectorcarlos.777@gmail.com
```

**¿Por qué?**
Cada país de Centroamérica tiene un departamento de contabilidad distinto.

---

### 💱 API de Conversión de Monedas
```properties
exchangerate.api.key=DEMO_KEY
exchangerate.api.url=https://v6.exchangerate-api.com/v6
```

**¿Por qué?**
Para convertir USD, GTQ, HNL, etc. a una moneda base (gastos multimoneda).

---

## 🎯 Conclusión: Stack Tecnológico Óptimo

| Herramienta | Alternativa | Ventaja de Nuestra Elección |
|-------------|------------|---------------------------|
| **Quarkus** | Spring Boot | 10x más rápido, menor memoria |
| **Panache** | JPA nativo | 50% menos código |
| **Oracle** | PostgreSQL | Requerimiento del bootcamp |
| **Keycloak** | Auth0 | Gratis, open source, control total |
| **Apache POI** | JExcel | Más maduro, mejor soporte |
| **Azure** | AWS S3 | SDK más simple, mejor docs |
| **Quarkus Mailer** | JavaMail | Integrado, async nativo |

**El stack elegido prioriza:**
- ✅ **Rendimiento** (Quarkus)
- ✅ **Developer Experience** (Panache, Hot Reload)
- ✅ **Escalabilidad** (Azure, Keycloak)
- ✅ **Estándares** (OpenAPI, OAuth2)
- ✅ **Facilidad de mantenimiento** (Clean Architecture)
