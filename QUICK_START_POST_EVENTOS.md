# 🚀 Quick Start: Integración POST /api/eventos

## ✅ Archivos Modificados

### Backend
1. **CrearEventoRequest.java** - `idEmpleado` ahora es opcional
2. **CrearEventoUseCase.java** - Usa `AuthSimulation.ID_EMPLEADO_SIMULADO` si no se envía `idEmpleado`

### Frontend
1. **eventos.ts** - Método `crearEvento()` mejorado para no enviar campos opcionales

---

## 🎯 Cómo Funciona

### 1️⃣ Frontend envía solo el nombre
```json
POST http://localhost:8081/api/eventos
{
  "nombreEvento": "VIAJE MARRUECOS"
}
```

### 2️⃣ Backend usa simulación
```java
Long idEmpleado = (request.idEmpleado() != null) 
    ? request.idEmpleado() 
    : AuthSimulation.ID_EMPLEADO_SIMULADO; // 1L
```

### 3️⃣ Backend responde con datos completos
```json
{
  "idEvento": 7,
  "idEmpleado": 1,
  "nombreEvento": "VIAJE MARRUECOS",
  "fechaRegistro": "24/10/2025",  ← Formato dd/MM/yyyy
  "estado": "activo",
  "nombreEmpleado": "Carlos Martínez"
}
```

---

## 🧪 Probar la Integración

### Opción 1: Con PowerShell
```powershell
# Ejecutar script de prueba
.\test-crear-evento.ps1
```

### Opción 2: Con el Frontend
1. Abrir http://localhost:5173
2. Clic en "Registrar Nuevo Evento"
3. Ingresar nombre
4. Verificar que aparece en la lista

### Opción 3: Con cURL (si prefieres)
```bash
curl -X POST http://localhost:8081/api/eventos \
  -H "Content-Type: application/json" \
  -d '{"nombreEvento": "VIAJE TEST"}'
```

---

## ⚙️ Cambiar Usuario Simulado

**Archivo:** `BackEnd/quarkus-api/src/main/java/datum/travels/shared/constant/AuthSimulation.java`

```java
public static final Long ID_EMPLEADO_SIMULADO = 1L; // ← Cambiar este valor
```

- **ID = 1:** Carlos Martínez
- **ID = 2:** Otro empleado (si existe en BD)

---

## 📊 Estado de Endpoints

| Método | Endpoint | Estado | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/eventos` | ✅ INTEGRADO | Listar eventos |
| POST | `/api/eventos` | ✅ INTEGRADO | Crear evento |
| GET | `/api/eventos/{id}` | 🔧 Backend OK | Detalle de evento |
| PATCH | `/api/eventos/{id}/estado` | 🔧 Backend OK | Actualizar estado |
| DELETE | `/api/eventos/{id}` | ⏳ Pendiente | Eliminar evento |

---

## 📝 Notas Importantes

✅ **Formato de fecha:** `dd/MM/yyyy` (24/10/2025)  
✅ **Estado por defecto:** `"activo"`  
✅ **Simulación:** Usa `ID_EMPLEADO_SIMULADO = 1L`  
✅ **Hot reload:** Quarkus detecta cambios automáticamente  
✅ **Validación:** Jakarta Validation en backend  

---

**Documentación completa:** Ver `INTEGRACION_POST_EVENTOS.md`
