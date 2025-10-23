# 🔗 Integración Backend-Frontend: Endpoint GET /api/eventos

## ✅ Implementación Completada

Se ha integrado exitosamente el endpoint `GET /api/eventos` entre el backend (Quarkus) y el frontend (React).

---

## 📋 Cambios Realizados

### 🔧 Backend (Quarkus)

#### 1. **AuthSimulation.java** (NUEVO)
**Ubicación:** `BackEnd/quarkus-api/src/main/java/datum/travels/shared/constant/AuthSimulation.java`

```java
public static final Long ID_EMPLEADO_SIMULADO = 1L;
```

**⚙️ PARA CAMBIAR EL USUARIO SIMULADO:**
1. Abre el archivo `AuthSimulation.java`
2. Modifica el valor de `ID_EMPLEADO_SIMULADO`
3. Asegúrate de que ese ID exista en la tabla `Empleado` de tu BD
4. Reinicia Quarkus (`mvnw compile quarkus:dev`)

**Ejemplo:**
```java
// Simular que el empleado con ID=2 está logueado
public static final Long ID_EMPLEADO_SIMULADO = 2L;
```

---

#### 2. **EventoResponse.java** (MODIFICADO)
**Ubicación:** `BackEnd/quarkus-api/src/main/java/datum/travels/application/dto/evento/EventoResponse.java`

**Cambios:**
- ✅ `fechaRegistro` ahora es `String` (antes era `LocalDate`)
- ✅ Se formatea con patrón `dd/MM/yyyy` (ej: `21/01/2025`)
- ✅ Usa `DateTimeFormatter` para la conversión

**Respuesta JSON:**
```json
{
  "idEvento": 1,
  "idEmpleado": 1,
  "nombreEvento": "CONFERENCIA TECH 2025",
  "fechaRegistro": "23/10/2025",
  "estado": "activo",
  "nombreEmpleado": "Carlos Martínez"
}
```

---

#### 3. **EventoController.java** (MODIFICADO)
**Ubicación:** `BackEnd/quarkus-api/src/main/java/datum/travels/infrastructure/adapter/rest/EventoController.java`

**Cambios:**
- ✅ Importa `AuthSimulation`
- ✅ Si no se envía `idEmpleado`, usa `AuthSimulation.ID_EMPLEADO_SIMULADO`
- ✅ Ya no retorna error 400 cuando falta el parámetro

**Comportamiento:**
```java
// Sin parámetro → usa simulación
GET /api/eventos

// Con parámetro → usa el ID especificado
GET /api/eventos?idEmpleado=2
```

---

### 🎨 Frontend (React + TypeScript)

#### 1. **event.ts** (MODIFICADO)
**Ubicación:** `FrontEnd/frontend/src/types/event.ts`

**Nuevo tipo agregado:**
```typescript
export interface EventoBackend {
  idEvento: number;
  idEmpleado: number;
  nombreEvento: string;
  fechaRegistro: string; // dd/MM/yyyy
  estado: string;
  nombreEmpleado: string;
}
```

---

#### 2. **eventos.ts** (NUEVO)
**Ubicación:** `FrontEnd/frontend/src/services/eventos.ts`

**Servicios disponibles:**
- ✅ `listarEventos(idEmpleado?)` - Obtiene eventos del empleado
- ✅ `obtenerEvento(idEvento)` - Obtiene detalle de un evento
- ✅ `crearEvento(nombreEvento, idEmpleado?)` - Crea nuevo evento

**⚙️ Configuración API:**
```typescript
const API_BASE_URL = "http://localhost:8081";
```

**Para cambiar en producción:**
1. Abre `eventos.ts`
2. Modifica `API_BASE_URL` con la URL del servidor
3. Ejemplo: `const API_BASE_URL = "https://api.datumtravels.com";`

---

#### 3. **Home.tsx** (MODIFICADO)
**Ubicación:** `FrontEnd/frontend/src/pages/Home.tsx`

**Cambios:**
- ✅ Usa `useEffect` para cargar eventos al montar
- ✅ Llama a `eventosService.listarEventos()` sin parámetros (usa simulación)
- ✅ Muestra estado de carga (`isLoading`)
- ✅ Maneja errores de conexión
- ✅ Al crear evento, hace POST al backend y recarga la lista
- ✅ Muestra fecha y estado en cada card de evento

---

## 🚀 Cómo Probar

### 1. **Preparar Base de Datos**
Asegúrate de tener datos de prueba:

```sql
-- Verificar que existe el empleado con ID=1
SELECT * FROM Empleado WHERE id_empleado = 1;

-- Verificar eventos del empleado
SELECT * FROM Evento WHERE id_empleado = 1;

-- Si no hay datos, insertar un evento de prueba:
INSERT INTO Evento (id_empleado, nombre_evento, fecha_registro, estado)
VALUES (1, 'CONFERENCIA TECH 2025', SYSDATE, 'activo');
```

---

### 2. **Iniciar Backend**
```powershell
cd "BackEnd/quarkus-api"
./mvnw compile quarkus:dev
```

Verifica que esté corriendo en: `http://localhost:8081`

---

### 3. **Iniciar Frontend**
```powershell
cd "FrontEnd/frontend"
npm run dev
```

Abre el navegador en: `http://localhost:5173`

---

### 4. **Pruebas**

#### ✅ Ver eventos
1. Inicia sesión en el frontend (página `/home`)
2. Deberías ver los eventos del empleado con `ID=1` automáticamente

#### ✅ Crear evento
1. Click en "Registrar Nuevo Evento"
2. Ingresa un nombre (ej: "VIAJE PANAMÁ")
3. Click en "Agregar"
4. El evento se crea y aparece en la lista

#### ✅ Cambiar usuario simulado
1. Edita `BackEnd/quarkus-api/.../AuthSimulation.java`
2. Cambia `ID_EMPLEADO_SIMULADO = 2L;`
3. Reinicia Quarkus
4. Recarga el frontend → Verás los eventos del empleado 2

---

## 🔍 Verificar en el Navegador

### Consola de Desarrollo (F12)

**Network Tab:**
```http
GET http://localhost:8081/api/eventos
Status: 200 OK
Response: [
  {
    "idEvento": 1,
    "idEmpleado": 1,
    "nombreEvento": "CONFERENCIA TECH 2025",
    "fechaRegistro": "23/10/2025",
    "estado": "activo",
    "nombreEmpleado": "Carlos Martínez"
  }
]
```

---

## 🛠️ Solución de Problemas

### ❌ Error: "No se pudieron cargar los eventos"

**Causas posibles:**
1. Backend no está corriendo
2. Puerto incorrecto en `API_BASE_URL`
3. CORS bloqueado

**Solución:**
1. Verifica que Quarkus esté en `http://localhost:8081`
2. Revisa la consola del navegador (F12)
3. Si hay error CORS, verifica la configuración de Quarkus

---

### ❌ Error: Lista vacía `[]`

**Causas:**
1. No hay eventos para ese empleado en la BD
2. El `ID_EMPLEADO_SIMULADO` no existe

**Solución:**
```sql
-- Verificar empleado
SELECT * FROM Empleado WHERE id_empleado = 1;

-- Insertar evento de prueba
INSERT INTO Evento (id_empleado, nombre_evento, fecha_registro, estado)
VALUES (1, 'EVENTO DE PRUEBA', SYSDATE, 'activo');
```

---

### ❌ Error al crear evento

**Causas:**
1. Falta validación en backend
2. Empleado no existe

**Verificar en consola del navegador:**
```javascript
// Error esperado
POST http://localhost:8081/api/eventos
Status: 400 Bad Request
```

---

## 📌 Próximos Pasos

1. ✅ Implementar autenticación real (JWT/Keycloak)
2. ⏳ Integrar endpoint `POST /api/gastos`
3. ⏳ Integrar endpoint `GET /api/eventos/{id}`
4. ⏳ Implementar actualización de estado del evento

---

## 📝 Notas Importantes

⚠️ **Simulación Temporal:**
- `AuthSimulation.java` debe ser **removido** cuando se implemente login real
- En producción, el `idEmpleado` vendrá del token JWT del usuario autenticado

🔒 **Seguridad:**
- Actualmente NO hay validación de permisos
- Cualquier usuario puede ver eventos de cualquier empleado
- Implementar autorización en el futuro

📅 **Formato de Fecha:**
- Backend: `dd/MM/yyyy` (String)
- Base de Datos: `DATE` (Oracle)
- Frontend: Muestra tal cual llega del backend

---

## 📂 Archivos Modificados

### Backend
```
✨ NUEVO:    AuthSimulation.java
📝 MODIFICADO: EventoResponse.java
📝 MODIFICADO: EventoController.java
```

### Frontend
```
✨ NUEVO:    eventos.ts
📝 MODIFICADO: event.ts
📝 MODIFICADO: Home.tsx
```

---

**🎉 Integración completada exitosamente!**
