# ✅ Integración POST /api/eventos - Crear Evento

## 📝 Resumen
Se ha integrado exitosamente el endpoint **POST /api/eventos** entre Backend (Quarkus) y Frontend (React), permitiendo crear nuevos eventos desde la interfaz web.

---

## 🔧 Cambios Realizados

### Backend (Quarkus)

#### 1️⃣ `CrearEventoRequest.java` - DTO Modificado
**Archivo:** `BackEnd/quarkus-api/src/main/java/datum/travels/application/dto/evento/CrearEventoRequest.java`

**Cambio:** El campo `idEmpleado` ahora es **opcional** (sin `@NotNull`)

```java
public record CrearEventoRequest(
    @NotBlank(message = "El nombre del evento es obligatorio")
    String nombreEvento,
    
    // ⚠️ TEMPORAL: idEmpleado es opcional mientras no existe login
    // Si es null, se usa AuthSimulation.ID_EMPLEADO_SIMULADO
    Long idEmpleado
) {}
```

**Razón:** Permitir que el frontend envíe solo el nombre del evento, y el backend use automáticamente el ID del empleado simulado.

---

#### 2️⃣ `CrearEventoUseCase.java` - Lógica de Simulación
**Archivo:** `BackEnd/quarkus-api/src/main/java/datum/travels/application/usecase/evento/CrearEventoUseCase.java`

**Cambio:** Se agregó lógica para usar `AuthSimulation.ID_EMPLEADO_SIMULADO` cuando no se proporciona `idEmpleado`

```java
@Transactional
public EventoResponse execute(CrearEventoRequest request) {
    
    // ⚠️ SIMULACIÓN: Si no se proporciona idEmpleado, usa el valor simulado
    Long idEmpleado = (request.idEmpleado() != null) 
        ? request.idEmpleado() 
        : AuthSimulation.ID_EMPLEADO_SIMULADO;
    
    // Crear entidad Evento
    Evento evento = new Evento(
            request.nombreEvento(),
            idEmpleado
    );

    // Persistir
    Evento eventoGuardado = eventoRepository.save(evento);

    // Retornar DTO
    return EventoResponse.from(eventoGuardado);
}
```

**Razón:** Simular autenticación usando el empleado configurado en `AuthSimulation.java` (actualmente ID = 1).

---

#### 3️⃣ Formato de Fecha
El backend ya estaba configurado correctamente en `EventoResponse.java`:

```java
private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
```

✅ **Formato de salida:** `24/10/2025` (Día/Mes/Año)

---

### Frontend (React + TypeScript)

#### 1️⃣ `eventos.ts` - Servicio Actualizado
**Archivo:** `FrontEnd/frontend/src/services/eventos.ts`

**Cambio:** El método `crearEvento` ahora construye el request body dinámicamente

```typescript
async crearEvento(nombreEvento: string, idEmpleado?: number): Promise<EventoBackend> {
  try {
    // Construir request body
    // Si no se proporciona idEmpleado, el backend usará AuthSimulation.ID_EMPLEADO_SIMULADO
    const requestBody: { nombreEvento: string; idEmpleado?: number } = { nombreEvento };
    
    // Solo agregar idEmpleado si se proporciona explícitamente
    if (idEmpleado !== undefined) {
      requestBody.idEmpleado = idEmpleado;
    }

    const response = await fetch(`${API_BASE_URL}/api/eventos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear evento: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const evento: EventoBackend = await response.json();
    return evento;
  } catch (error) {
    console.error("Error en crearEvento:", error);
    throw error;
  }
}
```

**Ventajas:**
- ✅ No envía `idEmpleado: undefined` en el JSON
- ✅ El backend usa automáticamente el ID simulado
- ✅ Mejor manejo de errores con mensaje del servidor

---

#### 2️⃣ `Home.tsx` - Ya está integrado
El componente `Home.tsx` ya estaba llamando correctamente al servicio:

```typescript
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const trimmed = eventName.trim();
  if (!trimmed) return;

  try {
    // Crear evento en el backend (sin idEmpleado, usa simulación)
    await eventosService.crearEvento(trimmed.toUpperCase());
    
    // Recargar la lista de eventos
    await cargarEventos();
    
    setEventName("");
    setIsModalOpen(false);
  } catch (err) {
    console.error("Error al crear evento:", err);
    alert("No se pudo crear el evento. Intenta de nuevo.");
  }
}
```

---

## 🎯 Flujo Completo de la Integración

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Usuario hace clic en "Registrar Nuevo Evento"                │
│  2. Se abre modal                                                 │
│  3. Usuario ingresa: "VIAJE MARRUECOS"                           │
│  4. Usuario hace submit                                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐          │
│  │  Home.tsx → handleSubmit()                          │          │
│  │  - Llama: eventosService.crearEvento("VIAJE...")   │          │
│  └────────────────────┬───────────────────────────────┘          │
│                       │                                           │
│                       ▼                                           │
│  ┌────────────────────────────────────────────────────┐          │
│  │  eventos.ts → crearEvento()                         │          │
│  │  - Request: { nombreEvento: "VIAJE MARRUECOS" }    │          │
│  │  - POST http://localhost:8081/api/eventos          │          │
│  └────────────────────┬───────────────────────────────┘          │
└────────────────────────┼──────────────────────────────────────────┘
                         │
                         │ HTTP POST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Quarkus)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────┐          │
│  │  EventoController.java                              │          │
│  │  - Recibe: CrearEventoRequest                       │          │
│  │  - Valida con Jakarta Validation                    │          │
│  └────────────────────┬───────────────────────────────┘          │
│                       │                                           │
│                       ▼                                           │
│  ┌────────────────────────────────────────────────────┐          │
│  │  CrearEventoUseCase.java                            │          │
│  │  - Si idEmpleado es null → usa AuthSimulation      │          │
│  │  - idEmpleado = 1 (Carlos Martínez)                │          │
│  │  - Crea: new Evento("VIAJE MARRUECOS", 1)          │          │
│  │  - Estado: "activo" (por defecto)                   │          │
│  │  - Fecha: LocalDate.now() → 24/10/2025             │          │
│  └────────────────────┬───────────────────────────────┘          │
│                       │                                           │
│                       ▼                                           │
│  ┌────────────────────────────────────────────────────┐          │
│  │  EventoRepository.java                              │          │
│  │  - INSERT INTO Evento (...)                         │          │
│  │  - Retorna: Evento con ID generado                  │          │
│  └────────────────────┬───────────────────────────────┘          │
│                       │                                           │
│                       ▼                                           │
│  ┌────────────────────────────────────────────────────┐          │
│  │  EventoResponse.from(evento)                        │          │
│  │  - Formatea fecha: dd/MM/yyyy                       │          │
│  │  - Retorna JSON                                     │          │
│  └────────────────────┬───────────────────────────────┘          │
│                       │                                           │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        │ HTTP 201 Created
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE JSON                                 │
├─────────────────────────────────────────────────────────────────┤
│  {                                                                │
│    "idEvento": 7,                                                 │
│    "idEmpleado": 1,                                               │
│    "nombreEvento": "VIAJE MARRUECOS",                             │
│    "fechaRegistro": "24/10/2025",                                 │
│    "estado": "activo",                                            │
│    "nombreEmpleado": "Carlos Martínez"                            │
│  }                                                                │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐          │
│  │  eventos.ts                                         │          │
│  │  - Recibe EventoBackend                             │          │
│  │  - Retorna al componente                            │          │
│  └────────────────────┬───────────────────────────────┘          │
│                       │                                           │
│                       ▼                                           │
│  ┌────────────────────────────────────────────────────┐          │
│  │  Home.tsx                                           │          │
│  │  - Llama: cargarEventos()                           │          │
│  │  - Actualiza lista de eventos en UI                 │          │
│  │  - Cierra modal                                     │          │
│  │  - Usuario ve nuevo evento en pantalla              │          │
│  └────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Cómo Probar

### 1️⃣ Verificar que el Backend esté corriendo
```powershell
# En terminal PowerShell
cd "c:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final\BackEnd\quarkus-api"
./mvnw quarkus:dev
```

**Esperado:** Ver mensaje `Listening on: http://0.0.0.0:8081`

---

### 2️⃣ Verificar que el Frontend esté corriendo
```powershell
# En terminal PowerShell
cd "c:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final\FrontEnd\frontend"
npm run dev
```

**Esperado:** Ver mensaje `Local: http://localhost:5173/`

---

### 3️⃣ Probar en el Navegador

1. **Abrir:** http://localhost:5173/
2. **Hacer clic en:** Botón azul "Registrar Nuevo Evento"
3. **Ingresar:** `VIAJE MARRUECOS`
4. **Hacer clic en:** "Agregar"
5. **Verificar:**
   - ✅ Modal se cierra
   - ✅ Aparece tarjeta del nuevo evento
   - ✅ Muestra fecha actual (ej: `24/10/2025`)
   - ✅ Muestra estado `activo`

---

### 4️⃣ Verificar en Base de Datos

```sql
-- Conectarse a Oracle Database
SELECT * FROM Evento ORDER BY fecha_registro DESC;
```

**Esperado:**
```
ID_EVENTO | ID_EMPLEADO | NOMBRE_EVENTO      | FECHA_REGISTRO | ESTADO
----------------------------------------------------------------------
7         | 1           | VIAJE MARRUECOS    | 24-OCT-2025    | activo
```

---

## 🔍 Cambiar el Empleado Simulado

Mientras no exista login real, se puede cambiar el empleado simulado:

**Archivo:** `BackEnd/quarkus-api/src/main/java/datum/travels/shared/constant/AuthSimulation.java`

```java
// Cambiar este valor:
public static final Long ID_EMPLEADO_SIMULADO = 1L;  // Carlos Martínez

// Por ejemplo, para otro empleado:
public static final Long ID_EMPLEADO_SIMULADO = 2L;
```

**Nota:** El ID debe existir en la tabla `Empleado` de la BD.

---

## 📊 Request/Response Detallado

### Request (Frontend → Backend)
```json
POST http://localhost:8081/api/eventos
Content-Type: application/json

{
  "nombreEvento": "VIAJE MARRUECOS"
}
```

**Nota:** `idEmpleado` NO se envía, el backend usa `AuthSimulation.ID_EMPLEADO_SIMULADO`

---

### Response (Backend → Frontend)
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "idEvento": 7,
  "idEmpleado": 1,
  "nombreEvento": "VIAJE MARRUECOS",
  "fechaRegistro": "24/10/2025",
  "estado": "activo",
  "nombreEmpleado": "Carlos Martínez"
}
```

---

## 🎯 Estado Actual

✅ **GET /api/eventos** - Listar eventos (YA INTEGRADO)  
✅ **POST /api/eventos** - Crear evento (INTEGRADO EN ESTE COMMIT)  
⏳ **GET /api/eventos/{id}** - Detalle de evento (POR INTEGRAR)  
⏳ **PATCH /api/eventos/{id}/estado** - Actualizar estado (POR INTEGRAR)  
⏳ **DELETE /api/eventos/{id}** - Eliminar evento (POR INTEGRAR)

---

## 🚀 Próximos Pasos

1. Implementar sistema de login real (reemplazar `AuthSimulation.java`)
2. Integrar endpoints restantes de eventos
3. Integrar módulo de gastos
4. Integrar OCR para comprobantes

---

## ⚠️ Notas Importantes

- **Simulación de Login:** Se está usando `AuthSimulation.ID_EMPLEADO_SIMULADO = 1L`
- **Hot Reload:** Quarkus detecta cambios automáticamente, no necesitas reiniciar
- **Formato de Fecha:** Siempre `dd/MM/yyyy` (24/10/2025)
- **Estado por Defecto:** Los eventos nuevos siempre se crean con estado `"activo"`
- **Nombre en Mayúsculas:** El frontend envía el nombre en mayúsculas con `.toUpperCase()`

---

**Fecha de Integración:** 24/10/2025  
**Desarrollador:** Team Datum Travels  
**Estado:** ✅ COMPLETADO
