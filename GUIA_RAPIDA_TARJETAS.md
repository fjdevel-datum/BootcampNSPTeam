# 🚀 Guía Rápida - Sistema de Tarjetas Corporativas

## ✅ Para Empezar

### **Paso 1: Iniciar el Backend**
```powershell
cd BackEnd\quarkus-api
.\mvnw quarkus:dev
```
El backend estará en: `http://localhost:8081`

### **Paso 2: Iniciar el Frontend**
```powershell
cd FrontEnd\frontend
npm run dev
```
El frontend estará en: `http://localhost:5173`

---

## 📌 Acceso al Sistema de Tarjetas

1. **Login** en `http://localhost:5173`
2. Usar credenciales de **administrador**
3. Navegar a: **Panel Admin** → **Tarjetas Corporativas**

---

## 🎯 Funcionalidades Principales

### **1️⃣ Ver Todas las Tarjetas**
📍 Ruta: `/admin/tarjetas`

**Qué verás:**
- ✅ Tarjetas en diseño 3D realista
- ✅ Información: Número, Banco, Vencimiento, Empleado asignado
- ✅ Filtros: Todas / Asignadas / Disponibles
- ✅ Estadísticas en tiempo real

**Acciones disponibles:**
- 🟢 **Crear nueva tarjeta** (botón superior derecho)
- 🔵 **Asignar a empleado** (icono de usuario en tarjetas disponibles)
- 🔴 **Eliminar tarjeta** (icono de papelera)

---

### **2️⃣ Crear Nueva Tarjeta**
📍 Ruta: `/admin/tarjetas/nueva`

**Formulario interactivo con preview en vivo:**

1. **Banco Emisor**: Ej. "Banco Agrícola"
2. **Número de Tarjeta**: 16 dígitos (se autodetecta tipo)
   - Empieza con 4 → Visa (azul)
   - Empieza con 5 → Mastercard (gris)
   - Empieza con 3 → Amex (verde)
3. **Fecha de Expiración**: Debe ser futura
4. **País**: Seleccionar de lista (cargados desde BD)
5. **Empleado (Opcional)**: Asignar al crear o después

**Preview en Tiempo Real:**
- Ver cómo queda la tarjeta mientras escribes
- Cambio de color según tipo detectado
- Muestra chip, número formateado, vencimiento

**Validaciones:**
- ✅ Número único (no duplicados)
- ✅ Mínimo 15 dígitos
- ✅ Fecha futura
- ✅ País válido

---

### **3️⃣ Asignar Tarjeta a Empleado**
📍 Ruta: `/admin/tarjetas/:id/asignar`

**Dos formas de llegar aquí:**
1. Desde listado de tarjetas → Click en icono "Asignar"
2. Después de crear una tarjeta sin asignar

**Proceso:**
1. Ver preview de la tarjeta a asignar
2. Seleccionar empleado del dropdown
3. Ver información del empleado:
   - Nombre completo
   - Email
   - Cargo y departamento
   - Cantidad de tarjetas actuales
4. Confirmar asignación

**Validaciones:**
- ✅ Solo tarjetas disponibles (sin asignar)
- ✅ Empleado debe existir en BD

---

## 🎨 Preview de Tarjeta Interactivo

### **Características del Preview:**
```
┌─────────────────────────────┐
│  💳 Tarjeta Corporativa     │
│  Visa / Mastercard / Amex   │ ← Auto-detectado
│                             │
│     [CHIP]                  │ ← Chip EMV simulado
│                             │
│  4532 1234 5678 9010       │ ← Formato automático
│                             │
│  Vence: 12/26  Banco: BAC  │
└─────────────────────────────┘
```

### **Colores según Tipo:**
- 🔵 **Visa** → Azul
- ⚫ **Mastercard** → Gris oscuro
- 🟢 **Amex** → Verde esmeralda
- 🟣 **Otros** → Morado

---

## 📋 Casos de Uso Comunes

### **Caso 1: Empleado Nuevo con Tarjeta**
1. Primero crear empleado en `/admin/usuarios/nuevo`
2. Luego crear tarjeta en `/admin/tarjetas/nueva`
3. Seleccionar el empleado en el formulario
4. Tarjeta queda asignada al crear

### **Caso 2: Asignar Tarjeta Existente**
1. Ir a `/admin/tarjetas`
2. Filtrar por "Disponibles"
3. Click en icono de asignar (UserPlus)
4. Seleccionar empleado
5. Confirmar

### **Caso 3: Crear Banco de Tarjetas**
1. Crear múltiples tarjetas sin asignar
2. Dejar campo "Empleado" vacío
3. Asignarlas después según necesidad

---

## 🔍 Filtros de Tarjetas

En `/admin/tarjetas` puedes filtrar:

| Filtro | Muestra |
|--------|---------|
| **Todas** | Todas las tarjetas sin filtro |
| **Asignadas** | Solo tarjetas con empleado asignado |
| **Disponibles** | Solo tarjetas sin asignar |

---

## ⚠️ Mensajes de Error Comunes

### **Backend**
```
❌ "Ya existe una tarjeta con el número: XXXX"
→ El número de tarjeta está duplicado. Verifica.

❌ "País no encontrado con ID: X"
→ El país seleccionado no existe. Recarga la página.

❌ "Empleado no encontrado con ID: X"
→ El empleado fue eliminado. Selecciona otro.
```

### **Frontend**
```
❌ "El número debe tener al menos 15 dígitos"
→ Completa el número de tarjeta.

❌ "La fecha debe ser futura"
→ Selecciona una fecha de expiración válida.

❌ "Debes seleccionar un empleado"
→ En asignación, selecciona un empleado del dropdown.
```

---

## 🎯 Tips & Trucos

### **Detección de Tipo Automática**
Al escribir el número de tarjeta, el sistema detecta:
- `4xxx xxxx xxxx xxxx` → Visa
- `51xx xxxx xxxx xxxx` → Mastercard  
- `37xx xxxx xxxx xxxx` → Amex

### **Formato Automático**
El número se formatea automáticamente:
- Entrada: `4532123456789010`
- Muestra: `4532 1234 5678 9010`

### **Preview en Vivo**
Todo cambio en el formulario se refleja instantáneamente en el preview de tarjeta.

---

## 🧪 Datos de Prueba

### **Números de Tarjeta de Prueba**
```
Visa:       4532 1234 5678 9010
Mastercard: 5425 2334 3010 9903
Amex:       3782 822463 10005
```

### **Bancos Sugeridos**
- Banco Agrícola
- BAC Credomatic
- Scotiabank
- Davivienda
- Banesco

---

## 📱 Acceso Móvil

El diseño es responsive. Funciona en:
- ✅ Desktop (recomendado)
- ✅ Tablet
- ✅ Mobile (cards se ajustan automáticamente)

---

## 🆘 Troubleshooting

### **No veo tarjetas en el listado**
1. Verificar que el backend esté corriendo
2. Abrir DevTools → Network → Buscar llamada a `/api/tarjetas`
3. Verificar que hay tarjetas en la BD

### **El preview no cambia**
1. Revisar que estás escribiendo en los inputs
2. La detección de tipo funciona solo con números válidos

### **Error al crear tarjeta**
1. Verificar que todos los campos están llenos
2. Revisar que el número no esté duplicado
3. Verificar que la fecha sea futura

---

## 📊 Endpoints API Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/tarjetas` | Listar todas |
| `POST` | `/api/tarjetas` | Crear nueva |
| `PUT` | `/api/tarjetas/asignar` | Asignar a empleado |
| `DELETE` | `/api/tarjetas/{id}` | Eliminar |
| `GET` | `/api/paises` | Listar países |

---

## 🎉 ¡Listo para Usar!

El sistema está completamente funcional. Disfruta creando y gestionando tarjetas corporativas con:
- ✅ Preview interactivo en 3D
- ✅ Validaciones en tiempo real
- ✅ Asignación flexible a empleados
- ✅ Diseño moderno y responsive

**¡Happy Coding! 🚀**
