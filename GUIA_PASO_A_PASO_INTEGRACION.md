# 🎯 GUÍA PASO A PASO - Primera Prueba de Integración

## 📋 Pre-requisitos

- ✅ Oracle XE instalado y corriendo (puerto 1522)
- ✅ Java 21 instalado
- ✅ Node.js instalado
- ✅ Maven instalado (o usar `mvnw`)

---

## 🚀 PASO 1: Verificar Base de Datos

### 1.1 Conectar a Oracle
```sql
-- Conectar con SQL Developer o SQLcl
Usuario: datum_user
Password: datum2025
Host: localhost
Puerto: 1522
Servicio: XEPDB1
```

### 1.2 Ejecutar Script de Verificación
```sql
-- Ejecutar: BackEnd/scripts/verificar-eventos.sql
```

### 1.3 Resultado Esperado
```
idEvento | idEmpleado | nombreEvento          | fechaRegistro | estado
---------|------------|----------------------|---------------|--------
1        | 1          | CONFERENCIA TECH 2025 | 23/10/2025   | activo
```

**Si no hay datos:**
1. Abre el script `verificar-eventos.sql`
2. Descomenta las líneas INSERT (quita `/*` y `*/`)
3. Ejecuta los INSERT
4. Ejecuta `COMMIT;`

---

## 🔧 PASO 2: Configurar ID de Empleado Simulado

### 2.1 Abrir archivo
```
BackEnd/quarkus-api/src/main/java/datum/travels/shared/constant/AuthSimulation.java
```

### 2.2 Verificar/Cambiar ID
```java
public static final Long ID_EMPLEADO_SIMULADO = 1L; // ← Este es el empleado actual
```

**Ejemplos:**
- `1L` → Simula que Carlos Martínez está logueado
- `2L` → Simula otro empleado

### 2.3 Guardar
El archivo se guarda automáticamente.

---

## ⚙️ PASO 3: Iniciar Backend

### 3.1 Abrir Terminal
```powershell
cd "c:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final\BackEnd\quarkus-api"
```

### 3.2 Ejecutar Quarkus en modo desarrollo
```powershell
./mvnw compile quarkus:dev
```

**O si estás en PowerShell:**
```powershell
.\mvnw.cmd compile quarkus:dev
```

### 3.3 Esperar mensaje
```
Listening on: http://0.0.0.0:8081
```

### 3.4 Verificar en navegador
```
http://localhost:8081/q/health
```

**Respuesta esperada:**
```json
{
  "status": "UP",
  "checks": []
}
```

---

## 🧪 PASO 4: Probar Endpoint Manualmente

### Opción A: Swagger UI (Recomendado)
1. Abre: `http://localhost:8081/swagger-ui`
2. Expandir sección **"Eventos"**
3. Click en `GET /api/eventos`
4. Click botón **"Try it out"**
5. Dejar campo `idEmpleado` **VACÍO** (usará simulación)
6. Click **"Execute"**

**Resultado esperado:**
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

### Opción B: cURL
```powershell
curl http://localhost:8081/api/eventos
```

### Opción C: Navegador
```
http://localhost:8081/api/eventos
```

**✅ Si ves JSON con eventos, el backend funciona correctamente!**

---

## 🎨 PASO 5: Iniciar Frontend

### 5.1 Abrir NUEVA Terminal (dejar backend corriendo)
```powershell
cd "c:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final\FrontEnd\frontend"
```

### 5.2 Instalar dependencias (solo primera vez)
```powershell
npm install
```

### 5.3 Iniciar en modo desarrollo
```powershell
npm run dev
```

### 5.4 Esperar mensaje
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5.5 Abrir navegador
```
http://localhost:5173
```

---

## 👀 PASO 6: Verificar Integración en el Frontend

### 6.1 Iniciar sesión
- Usuario: (cualquiera, aún no hay validación real)
- Ir a la página **Home** (`/home`)

### 6.2 Verificar carga de eventos
Deberías ver:
- ✅ "Lista de eventos" como título
- ✅ Cards con los nombres de eventos de la BD
- ✅ Cada card muestra:
  - Nombre del evento
  - Fecha de registro (formato dd/MM/yyyy)
  - Estado (activo/completado/cancelado)

### 6.3 Abrir DevTools (F12)
**Console Tab:**
```javascript
// No debería haber errores
// Si hay logs, deberían ser del tipo:
"Cargando eventos..."
```

**Network Tab:**
```http
GET http://localhost:8081/api/eventos
Status: 200 OK
Type: xhr
Size: ~200 bytes
```

Click en la request → Tab "Response" → Deberías ver el JSON

---

## ✨ PASO 7: Probar Crear Evento

### 7.1 En el Home
Click en botón **"Registrar Nuevo Evento"** (botón azul inferior derecho)

### 7.2 En el modal
- Escribir: `VIAJE HONDURAS`
- Click **"Agregar"**

### 7.3 Verificar
- ✅ El modal se cierra
- ✅ La lista se recarga automáticamente
- ✅ Aparece el nuevo evento "VIAJE HONDURAS"

### 7.4 Verificar en BD
```sql
SELECT * FROM Evento WHERE nombre_evento = 'VIAJE HONDURAS';
```

**✅ Debería aparecer el registro!**

---

## 🔄 PASO 8: Cambiar Usuario Simulado

### 8.1 Parar Frontend
En la terminal del frontend, presiona `Ctrl + C`

### 8.2 Editar AuthSimulation.java
```java
// Cambiar de:
public static final Long ID_EMPLEADO_SIMULADO = 1L;

// A:
public static final Long ID_EMPLEADO_SIMULADO = 2L;
```

### 8.3 Guardar archivo
Quarkus detectará el cambio y recargará automáticamente (hot reload)

### 8.4 Verificar en Swagger
```
http://localhost:8081/swagger-ui
```
Ejecutar `GET /api/eventos` → Deberías ver eventos del empleado 2

### 8.5 Reiniciar Frontend
```powershell
npm run dev
```

### 8.6 Verificar Home
Ahora deberías ver los eventos del empleado con ID=2

---

## 🎯 Checklist de Verificación Final

- [ ] Backend corre en `http://localhost:8081`
- [ ] Frontend corre en `http://localhost:5173`
- [ ] Swagger UI muestra eventos correctamente
- [ ] Home carga eventos automáticamente
- [ ] Eventos muestran fecha en formato `dd/MM/yyyy`
- [ ] Eventos muestran estado (activo/completado/cancelado)
- [ ] Crear evento funciona y recarga la lista
- [ ] Cambiar `ID_EMPLEADO_SIMULADO` cambia los eventos mostrados

---

## 🆘 Troubleshooting

### ❌ Backend no inicia
```
Error: Could not find or load main class
```
**Solución:**
```powershell
./mvnw clean compile quarkus:dev
```

### ❌ Error de conexión a BD
```
ORA-12541: TNS:no listener
```
**Solución:**
1. Verifica Oracle esté corriendo
2. Verifica puerto sea 1522 (no 1521)
3. Verifica servicio sea XEPDB1

### ❌ Frontend no carga eventos
**Abrir DevTools (F12) → Console:**
```
Error al cargar eventos: Failed to fetch
```
**Solución:**
1. Verifica backend esté corriendo
2. Verifica puerto sea 8081 en `eventos.ts`
3. Verifica CORS en `application.properties`

### ❌ Lista vacía []
**Solución:**
1. Ejecuta `verificar-eventos.sql`
2. Verifica que existan eventos para el `ID_EMPLEADO_SIMULADO`
3. Inserta datos de prueba si necesario

---

## 🎊 ¡Integración Exitosa!

Si todos los pasos funcionaron:
- ✅ Backend y Frontend están integrados
- ✅ GET /api/eventos funciona correctamente
- ✅ La simulación de usuario funciona
- ✅ Puedes cambiar el usuario editando `AuthSimulation.java`

**Siguiente paso:** Integrar endpoints de Gastos (POST /api/gastos)

---

**Documentación completa:** `INTEGRACION_EVENTOS_README.md`
**Resumen rápido:** `RESUMEN_INTEGRACION.md`
