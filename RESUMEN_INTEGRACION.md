# 🎯 RESUMEN RÁPIDO - Integración GET /api/eventos

## ✅ Implementación Completada

---

## 📍 Cambiar Usuario Simulado

**Archivo:** `BackEnd/quarkus-api/src/main/java/datum/travels/shared/constant/AuthSimulation.java`

```java
public static final Long ID_EMPLEADO_SIMULADO = 1L; // ← EDITA AQUÍ
```

**Pasos:**
1. Cambia el número (ej: `2L` para otro empleado)
2. Guarda el archivo
3. Quarkus recargará automáticamente (hot reload)

---

## 🔗 Flujo de Integración

```
┌─────────────┐
│  FRONTEND   │
│  Home.tsx   │
└──────┬──────┘
       │ useEffect()
       ↓
┌──────────────────┐
│  eventos.ts      │
│  listarEventos() │
└──────┬───────────┘
       │ fetch()
       ↓
┌────────────────────────────┐
│  GET /api/eventos          │
│  http://localhost:8081     │
└────────┬───────────────────┘
         │
         ↓
┌────────────────────────┐
│  EventoController.java │
│  @GET listarEventos()  │
└────────┬───────────────┘
         │ usa AuthSimulation.ID_EMPLEADO_SIMULADO
         ↓
┌──────────────────────────┐
│  ListarEventosUseCase    │
│  execute(idEmpleado)     │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  EventoRepository        │
│  findByIdEmpleado(1L)    │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Base de Datos Oracle    │
│  SELECT * FROM Evento    │
│  WHERE id_empleado = 1   │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  EventoResponse.java     │
│  Formatea fecha          │
│  dd/MM/yyyy              │
└────────┬─────────────────┘
         │
         ↓ JSON
┌──────────────────────────┐
│  FRONTEND                │
│  Muestra eventos en UI   │
└──────────────────────────┘
```

---

## 📦 Response del Backend

```json
[
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

## 🚀 Comandos para Iniciar

### Backend
```powershell
cd BackEnd/quarkus-api
./mvnw compile quarkus:dev
```
✅ Corriendo en: http://localhost:8081

### Frontend
```powershell
cd FrontEnd/frontend
npm run dev
```
✅ Corriendo en: http://localhost:5173

---

## 🧪 Probar Manualmente

### Opción 1: Swagger UI
```
http://localhost:8081/swagger-ui
```
1. Expandir "Eventos"
2. Click en `GET /api/eventos`
3. Click "Try it out"
4. Dejar `idEmpleado` vacío (usará simulación)
5. Click "Execute"

### Opción 2: cURL
```powershell
curl http://localhost:8081/api/eventos
```

### Opción 3: Navegador
```
http://localhost:8081/api/eventos
```

---

## 📂 Archivos Creados/Modificados

### ✨ NUEVOS
```
Backend:
  └── AuthSimulation.java

Frontend:
  └── eventos.ts
  
Documentación:
  └── INTEGRACION_EVENTOS_README.md
  └── RESUMEN_INTEGRACION.md (este archivo)
```

### 📝 MODIFICADOS
```
Backend:
  ├── EventoResponse.java (fecha → String dd/MM/yyyy)
  └── EventoController.java (usa AuthSimulation)

Frontend:
  ├── event.ts (+ EventoBackend interface)
  └── Home.tsx (consume API real)
```

---

## ⚙️ Configuración Actual

| Configuración | Valor |
|--------------|-------|
| Backend Puerto | `8081` |
| Frontend Puerto | `5173` |
| CORS Habilitado | ✅ Sí |
| ID Empleado Simulado | `1` |
| Formato Fecha | `dd/MM/yyyy` |
| Base de Datos | Oracle XE (puerto 1522) |

---

## 🔧 Editar Configuración

### Cambiar Puerto Backend
**Archivo:** `BackEnd/quarkus-api/src/main/resources/application.properties`
```properties
quarkus.http.port=8081  # ← Cambiar aquí
```

### Cambiar URL en Frontend
**Archivo:** `FrontEnd/frontend/src/services/eventos.ts`
```typescript
const API_BASE_URL = "http://localhost:8081";  // ← Cambiar aquí
```

### Cambiar Usuario Simulado
**Archivo:** `BackEnd/quarkus-api/.../AuthSimulation.java`
```java
public static final Long ID_EMPLEADO_SIMULADO = 1L;  // ← Cambiar aquí
```

---

## ✅ Checklist de Verificación

- [ ] Backend corriendo en puerto 8081
- [ ] Frontend corriendo en puerto 5173
- [ ] Base de datos Oracle XE accesible
- [ ] Existe empleado con ID=1 en tabla Empleado
- [ ] Existe al menos 1 evento en tabla Evento con id_empleado=1
- [ ] CORS configurado correctamente
- [ ] AuthSimulation.java creado con ID_EMPLEADO_SIMULADO
- [ ] eventos.ts apunta a puerto 8081
- [ ] Home.tsx carga eventos automáticamente

---

## 🆘 Si algo no funciona

1. **Lista vacía en frontend:**
   - Verifica que existan eventos en BD: `SELECT * FROM Evento WHERE id_empleado = 1;`
   - Cambia `ID_EMPLEADO_SIMULADO` si necesario

2. **Error de conexión:**
   - Verifica puerto en `eventos.ts` sea `8081`
   - Verifica backend esté corriendo: `http://localhost:8081/q/health`

3. **Error CORS:**
   - Verifica `application.properties` tenga CORS habilitado
   - Verifica `quarkus.http.cors.origins` incluya `http://localhost:5173`

---

**✨ La integración está lista para usar!**

Para más detalles, consulta: `INTEGRACION_EVENTOS_README.md`
