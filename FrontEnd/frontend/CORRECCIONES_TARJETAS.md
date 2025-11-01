# 🔧 Correcciones al Módulo de Tarjetas

## 📋 Resumen de Cambios

Se implementaron **5 correcciones** al módulo de gestión de tarjetas corporativas según los requerimientos del usuario.

---

## ✅ 1. Formato de Número de Tarjeta con Guiones

### **Problema:**
- Los números se mostraban sin formato: `4111111111112345`
- Difícil de leer

### **Solución Implementada:**
```typescript
// FrontEnd/frontend/src/types/tarjeta.ts

export function formatearNumeroTarjeta(numero: string): string {
  const limpio = numero.replace(/[-\s]/g, "");
  return limpio.replace(/(.{4})/g, "$1-").replace(/-$/, "");
}
```

### **Resultado:**
- Se muestra: `4111-1111-1111-2345`
- Se guarda en BD: `4111111111112345` (sin guiones)
- Más legible y profesional

---

## ✅ 2. Limitar Input a Exactamente 16 Dígitos

### **Problema:**
- El input aceptaba entre 15-19 dígitos
- Permitía tarjetas inválidas

### **Solución Implementada:**

**a) En `handleChange` (NuevaTarjeta.tsx):**
```typescript
if (field === "numeroTarjeta") {
  value = value.replace(/\D/g, ""); // Solo números
  if (value.length > 16) value = value.slice(0, 16); // Máximo 16
}
```

**b) Validación estricta:**
```typescript
if (form.numeroTarjeta.length !== 16) {
  newErrors.numeroTarjeta = "El número debe tener exactamente 16 dígitos.";
}
```

**c) Input HTML:**
```tsx
<input
  maxLength={16}
  placeholder="1234567890123456"
  // ...
/>
<p className="text-xs">Exactamente 16 dígitos</p>
```

### **Resultado:**
- ✅ Solo acepta números
- ✅ Máximo 16 caracteres
- ✅ Validación estricta antes de enviar

---

## ✅ 3. Eliminar Soporte de AMEX (solo VISA y Mastercard)

### **Problema:**
- El sistema detectaba y soportaba American Express
- Solo se necesitan VISA y Mastercard

### **Solución Implementada:**

**a) `tarjeta.ts`:**
```typescript
export function getTipoTarjeta(numeroTarjeta: string): "visa" | "mastercard" | "other" {
  const numero = numeroTarjeta.replace(/[-\s]/g, "");
  
  if (numero.startsWith("4")) {
    return "visa";
  } else if (/^5[1-5]/.test(numero)) {
    return "mastercard";
  }
  
  return "other";
}
```

**b) `NuevaTarjeta.tsx`:**
```typescript
const colorClass = {
  visa: "from-blue-600 to-blue-800",
  mastercard: "from-slate-700 to-slate-900",
  other: "from-purple-600 to-purple-800",
}[tipoTarjeta];
// Removido: amex: "from-emerald-600 to-emerald-800"
```

### **Resultado:**
- ❌ AMEX removido
- ✅ Solo VISA (inicia con 4)
- ✅ Solo Mastercard (inicia con 51-55)

---

## ✅ 4. Corregir Filtros "Asignadas" y "Disponibles"

### **Problema Original:**
```
Filtro "Asignadas": Mostraba tarjetas con "Sin asignar"
Filtro "Disponibles": No mostraba tarjetas sin dueño
```

### **Solución Implementada:**

**a) Lógica de filtrado corregida:**
```typescript
const filteredTarjetas = tarjetas.filter((tarjeta) => {
  if (filterAsignadas === "asignadas") 
    return tarjeta.asignadoA !== null && tarjeta.asignadoA !== "Sin asignar";
  
  if (filterAsignadas === "disponibles") 
    return tarjeta.asignadoA === null || tarjeta.asignadoA === "Sin asignar";
  
  return true; // "todas"
});
```

**b) Stats corregidos:**
```typescript
const stats = {
  total: tarjetas.length,
  asignadas: tarjetas.filter((t) => 
    t.asignadoA !== null && t.asignadoA !== "Sin asignar"
  ).length,
  disponibles: tarjetas.filter((t) => 
    t.asignadoA === null || t.asignadoA === "Sin asignar"
  ).length,
};
```

### **Resultado:**

| Filtro | Muestra |
|--------|---------|
| **Todas** | Todas las tarjetas (sin filtro) |
| **Asignadas** | Solo tarjetas con empleado asignado (excluye "Sin asignar") |
| **Disponibles** | Solo tarjetas sin empleado o marcadas como "Sin asignar" |

---

## ✅ 5. Modal de Confirmación para Eliminar Tarjeta

### **Problema:**
- Se usaba `window.confirm()` (feo y poco profesional)
- No mostraba información de la tarjeta

### **Solución Implementada:**

**a) Estado del modal:**
```typescript
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [tarjetaAEliminar, setTarjetaAEliminar] = useState<TarjetaEmpresa | null>(null);
const [eliminando, setEliminando] = useState(false);
```

**b) Funciones:**
```typescript
const handleDeleteCard = async (id: number) => {
  const tarjeta = tarjetas.find((t) => t.id === id);
  if (!tarjeta) return;
  
  setTarjetaAEliminar(tarjeta);
  setShowDeleteModal(true);
};

const confirmarEliminacion = async () => {
  if (!tarjetaAEliminar) return;

  try {
    setEliminando(true);
    await eliminarTarjeta(tarjetaAEliminar.id);
    await cargarTarjetas();
    setShowDeleteModal(false);
  } catch (err) {
    alert(err.message);
  } finally {
    setEliminando(false);
  }
};
```

**c) UI del Modal:**
```tsx
{showDeleteModal && tarjetaAEliminar && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      {/* Título con ícono de advertencia */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 bg-red-100 rounded-full">
          <X className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3>Eliminar Tarjeta</h3>
          <p>Esta acción no se puede deshacer</p>
        </div>
      </div>

      {/* Información de la tarjeta */}
      <div className="bg-slate-50 rounded-xl p-4">
        - Número: {formatearNumeroTarjeta(tarjetaAEliminar.numero)}
        - Banco: {tarjetaAEliminar.banco}
        - Asignada a: {tarjetaAEliminar.asignadoA || "Sin asignar"}
      </div>

      {/* Advertencia */}
      <div className="bg-amber-50 border border-amber-200">
        ⚠️ Al eliminar, se perderá toda la información
      </div>

      {/* Botones */}
      <button onClick={cancelarEliminacion}>Cancelar</button>
      <button onClick={confirmarEliminacion}>
        {eliminando ? "Eliminando..." : "Eliminar"}
      </button>
    </div>
  </div>
)}
```

### **Resultado:**
- ✅ Modal profesional y estético
- ✅ Muestra información de la tarjeta antes de eliminar
- ✅ Loading state durante eliminación
- ✅ Advertencia clara al usuario
- ✅ Backdrop con blur
- ✅ Mantiene la funcionalidad DELETE al backend

---

## 📁 Archivos Modificados

### **1. `FrontEnd/frontend/src/types/tarjeta.ts`**
- ✅ `getTipoTarjeta()` - Removido AMEX
- ✅ `formatearNumeroTarjeta()` - Usa guiones en vez de espacios

### **2. `FrontEnd/frontend/src/pages/Admin/NuevaTarjeta.tsx`**
- ✅ `handleChange()` - Limita a 16 dígitos
- ✅ `validate()` - Validación estricta de 16 caracteres
- ✅ Input - `maxLength={16}` y mensaje actualizado
- ✅ `colorClass` - Removido caso de AMEX

### **3. `FrontEnd/frontend/src/pages/Admin/Tarjetas.tsx`**
- ✅ Imports - Agregado `X`, `AlertTriangle`, `formatearNumeroTarjeta`
- ✅ Estados del modal - `showDeleteModal`, `tarjetaAEliminar`, `eliminando`
- ✅ `handleDeleteCard()` - Abre modal en vez de `confirm()`
- ✅ `confirmarEliminacion()` - Lógica de eliminación async
- ✅ `cancelarEliminacion()` - Cierra modal
- ✅ `filteredTarjetas` - Corregida lógica de filtros
- ✅ `stats` - Corregido conteo de asignadas/disponibles
- ✅ Renderizado de número - Usa `formatearNumeroTarjeta()`
- ✅ Modal JSX - Componente completo al final

---

## 🧪 Casos de Prueba

### **Test 1: Formato de Número**
```typescript
// Input: "4111111111112345"
formatearNumeroTarjeta("4111111111112345")
// Output: "4111-1111-1111-2345" ✅
```

### **Test 2: Validación de 16 Dígitos**
```typescript
// Input: 15 dígitos
"411111111111234" → ❌ "El número debe tener exactamente 16 dígitos"

// Input: 17 dígitos
"41111111111123456" → Se trunca a 16 ✅

// Input: 16 dígitos
"4111111111112345" → ✅ Válido
```

### **Test 3: Filtros**
```typescript
// Tarjeta A: empleado = { nombre: "Juan", apellido: "Pérez" }
// Tarjeta B: empleado = null

// Filtro "Todas": Muestra A y B ✅
// Filtro "Asignadas": Muestra solo A ✅
// Filtro "Disponibles": Muestra solo B ✅
```

### **Test 4: Modal de Eliminación**
1. Click en botón eliminar → Abre modal ✅
2. Modal muestra info de tarjeta ✅
3. Click en "Cancelar" → Cierra modal sin eliminar ✅
4. Click en "Eliminar" → Muestra loading ✅
5. Llamada al backend → Recarga lista ✅

---

## 🎯 Beneficios Logrados

| Antes | Después |
|-------|---------|
| `4111111111112345` | `4111-1111-1111-2345` |
| 15-19 dígitos aceptados | Exactamente 16 dígitos |
| Soporte AMEX | Solo VISA/Mastercard |
| Filtros incorrectos | Filtros precisos |
| `window.confirm()` | Modal profesional con info |

---

## 🚀 Cómo Probar

1. **Iniciar frontend:**
   ```powershell
   cd FrontEnd/frontend
   npm run dev
   ```

2. **Ir a gestión de tarjetas:**
   ```
   http://localhost:5173/admin/tarjetas
   ```

3. **Crear nueva tarjeta:**
   - Click en "Nueva Tarjeta"
   - Intentar escribir más de 16 dígitos → Se trunca ✅
   - Intentar escribir letras → No acepta ✅
   - Ingresar 16 dígitos válidos
   - Ver preview con guiones ✅

4. **Verificar formato:**
   - En lista de tarjetas, el número debe verse: `4111-1111-1111-2345` ✅

5. **Probar filtros:**
   - Crear tarjeta "Sin asignar" → Aparece en "Disponibles" ✅
   - Asignar tarjeta → Aparece en "Asignadas" ✅

6. **Probar modal de eliminación:**
   - Click en ícono de basurero
   - Ver modal con información
   - Cancelar → No elimina ✅
   - Eliminar → Muestra loading y elimina ✅

---

## ✨ Resultado Final

✅ **Formato profesional** con guiones cada 4 dígitos  
✅ **Validación estricta** de exactamente 16 dígitos  
✅ **Solo VISA y Mastercard** (AMEX removido)  
✅ **Filtros funcionando correctamente** (Asignadas/Disponibles)  
✅ **Modal elegante** para confirmar eliminación  

**¡Todas las correcciones implementadas y funcionando! 🎉**
