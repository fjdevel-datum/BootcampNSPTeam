# 🔄 Guía de Reinicio Rápido del Backend

## ¿Cuándo necesito reiniciar?

✅ **SÍ necesitas reiniciar** cuando cambias:
- Constantes `static final` (como `AuthSimulation.ID_EMPLEADO_SIMULADO`)
- Configuración en `application.properties`
- Dependencias en `pom.xml`
- Anotaciones de Quarkus (`@ApplicationScoped`, `@Path`, etc.)

❌ **NO necesitas reiniciar** cuando cambias:
- Lógica de métodos normales
- Clases de negocio sin anotaciones CDI
- Archivos `.sql` (esos se cargan solo al inicio)

---

## Cómo Reiniciar Quarkus en Dev Mode

### Si ejecutas con Maven (`./mvnw quarkus:dev`)

**Opción A: Reinicio rápido desde la terminal de Quarkus**
1. En la terminal donde está corriendo Quarkus, presiona `Ctrl+C`
2. Ejecuta de nuevo:
   ```powershell
   cd "c:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final\BackEnd\quarkus-api"
   ./mvnw quarkus:dev
   ```

**Opción B: Desde PowerShell (sin entrar a la carpeta)**
```powershell
# Ir a la carpeta del backend
cd "c:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final\BackEnd\quarkus-api"

# Reiniciar (Ctrl+C primero si está corriendo)
./mvnw quarkus:dev
```

---

## Verificar que el cambio se aplicó

Después de reiniciar, verifica con:

```powershell
# Obtener eventos sin parámetros (usa AuthSimulation)
Invoke-WebRequest -Uri "http://localhost:8081/api/eventos" -Method GET -ContentType "application/json" | Select-Object -ExpandProperty Content

# Verificar empleado específico
Invoke-WebRequest -Uri "http://localhost:8081/api/eventos?idEmpleado=1" -Method GET -ContentType "application/json" | Select-Object -ExpandProperty Content
Invoke-WebRequest -Uri "http://localhost:8081/api/eventos?idEmpleado=2" -Method GET -ContentType "application/json" | Select-Object -ExpandProperty Content
```

---

## Solución al Problema de "Hot Reload"

### ¿Por qué no funcionó el hot reload?

**Quarkus NO puede hacer hot reload de:**
- `public static final` variables → Son "inlined" en compilación
- Configuración de CDI beans (`@ApplicationScoped`, `@Singleton`)
- Configuración de `application.properties`

**Quarkus SÍ puede hacer hot reload de:**
- Métodos de instancia
- Lógica de negocio
- Endpoints REST (si no cambiaste `@Path`)

### Alternativa para evitar reiniciar constantemente

Si vas a cambiar frecuentemente el `ID_EMPLEADO_SIMULADO`, considera:

**Opción 1: Usar variable de entorno**
```java
// En AuthSimulation.java
public static Long getIdEmpleadoSimulado() {
    String envId = System.getenv("ID_EMPLEADO_SIMULADO");
    return (envId != null) ? Long.parseLong(envId) : 1L;
}
```

Luego ejecutas:
```powershell
$env:ID_EMPLEADO_SIMULADO="2"; ./mvnw quarkus:dev
```

**Opción 2: Usar query parameter siempre**
```typescript
// En el frontend, siempre especifica el ID
await eventosService.listarEventos(1); // Empleado ID=1
await eventosService.listarEventos(2); // Empleado ID=2
```

---

## Comandos Útiles

```powershell
# Verificar si Quarkus está ejecutándose
netstat -ano | findstr :8081

# Matar proceso en puerto 8081 si está bloqueado
$processId = (netstat -ano | findstr :8081 | Select-String -Pattern '\d+$').Matches.Value
Stop-Process -Id $processId -Force

# Limpiar target/ y recompilar desde cero
./mvnw clean compile quarkus:dev
```

---

## Para el Frontend

Recuerda que **después de reiniciar el backend**, el frontend NO se actualiza solo:

1. **Backend reiniciado** → Ahora devuelve eventos del nuevo empleado
2. **Frontend NO sabe del cambio** → Sigue mostrando datos antiguos en caché
3. **Solución:** Recargar la página del navegador (`F5` o `Ctrl+R`)

---

## Resumen de Workflow

```
1. Editas AuthSimulation.java → Cambias ID_EMPLEADO_SIMULADO = 2L
2. Guardas (Ctrl+S)
3. Reinicias Quarkus (Ctrl+C → ./mvnw quarkus:dev)
4. Esperas que levante (~10 segundos)
5. Refrescas el navegador (F5)
6. ✅ Ahora ves eventos del empleado ID=2
```
