# 📧 Integración del Sistema de Envío de Reportes - Frontend

## ✅ Archivos Creados

### 1. Tipos TypeScript
- **`src/types/reporte.ts`**: Interfaces para destinatarios y envío de reportes

### 2. Servicios
- **`src/services/reportes.ts`**: Llamadas a API para reportes

### 3. Componentes
- **`src/components/EnviarReporteModal.tsx`**: Modal para enviar reportes

---

## 🔧 Cómo Integrar en EventDetail

### Paso 1: Importar el Modal

En `src/pages/EventDetail.tsx`, agregar:

```typescript
import { useState } from 'react';
import EnviarReporteModal from '../components/EnviarReporteModal';
```

### Paso 2: Agregar Estado

Dentro del componente, agregar:

```typescript
const [showReporteModal, setShowReporteModal] = useState(false);
```

### Paso 3: Agregar Botón

En la sección de acciones del evento (donde están los botones), agregar:

```tsx
{/* Botón para enviar reporte - Solo si el evento tiene gastos */}
{gastos.length > 0 && evento.estado === 'activo' && (
  <button
    onClick={() => setShowReporteModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
  >
    <Send size={20} />
    Finalizar y Enviar Reporte
  </button>
)}
```

### Paso 4: Renderizar el Modal

Al final del componente, antes del `</div>` final:

```tsx
{/* Modal de Enviar Reporte */}
{showReporteModal && (
  <EnviarReporteModal
    eventoId={evento.idEvento}
    nombreEvento={evento.nombreEvento}
    onClose={() => setShowReporteModal(false)}
    onSuccess={() => {
      // Recargar datos del evento para reflejar el cambio de estado
      window.location.reload();
    }}
  />
)}
```

---

## 📋 Ejemplo Completo de Integración

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Plus } from 'lucide-react';
import EnviarReporteModal from '../components/EnviarReporteModal';
// ... otros imports

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados existentes
  const [evento, setEvento] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Nuevo estado para el modal
  const [showReporteModal, setShowReporteModal] = useState(false);

  // useEffect para cargar datos...

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="flex gap-3">
          {/* Botón existente para agregar gasto */}
          {evento?.estado === 'activo' && (
            <button
              onClick={() => navigate('/gasto-form')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Agregar Gasto
            </button>
          )}

          {/* NUEVO: Botón para enviar reporte */}
          {gastos.length > 0 && evento?.estado === 'activo' && (
            <button
              onClick={() => setShowReporteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Send size={20} />
              Finalizar y Enviar Reporte
            </button>
          )}
        </div>
      </div>

      {/* Contenido del evento... */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{evento?.nombreEvento}</h1>
        {/* ... resto del contenido */}
      </div>

      {/* Lista de gastos... */}

      {/* NUEVO: Modal de Enviar Reporte */}
      {showReporteModal && (
        <EnviarReporteModal
          eventoId={Number(id)}
          nombreEvento={evento?.nombreEvento || 'Evento'}
          onClose={() => setShowReporteModal(false)}
          onSuccess={() => {
            // Recargar la página para reflejar el cambio de estado
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
```

---

## 🎨 Estilos del Botón

### Opción 1: Verde (Recomendado)
```tsx
className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
```

### Opción 2: Azul Secundario
```tsx
className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
```

### Opción 3: Naranja (Acción destacada)
```tsx
className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
```

---

## 🔍 Condiciones para Mostrar el Botón

El botón de "Finalizar y Enviar Reporte" debería mostrarse solo cuando:

1. ✅ El evento tiene al menos 1 gasto registrado
2. ✅ El estado del evento es "activo" (no completado/cancelado)

```tsx
{gastos.length > 0 && evento?.estado === 'activo' && (
  <button onClick={() => setShowReporteModal(true)}>
    Finalizar y Enviar Reporte
  </button>
)}
```

---

## 📱 Vista Responsive

El modal ya incluye clases responsive de Tailwind:

```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
```

Funciona correctamente en:
- 📱 Móvil (320px - 640px)
- 📱 Tablet (641px - 1024px)
- 💻 Desktop (1025px+)

---

## 🧪 Flujo de Usuario

```
1. Usuario está en EventDetail
   ↓
2. Click en "Finalizar y Enviar Reporte"
   ↓
3. Se abre modal con formulario:
   - Seleccionar país/destinatario (dropdown)
   - Ingresar nombre del proveedor (opcional)
   - Seleccionar formato (Excel/PDF)
   ↓
4. Usuario completa y hace click en "Enviar Reporte"
   ↓
5. Loading spinner mientras se procesa
   ↓
6. Backend:
   - Cambia estado del evento a "completado"
   - Genera reporte Excel/PDF
   - Envía correo con adjunto
   ↓
7. Éxito:
   - Alert con mensaje de confirmación
   - Modal se cierra
   - Página se recarga (evento ahora "completado")
   ↓
8. El usuario ya NO puede agregar más gastos
```

---

## ⚠️ Validaciones Frontend

El modal incluye estas validaciones:

1. **Email destino es obligatorio**: El dropdown debe tener un valor seleccionado
2. **Formato es obligatorio**: Por defecto es "EXCEL"
3. **Nombre del proveedor es opcional**: Se puede dejar en blanco

---

## 🎯 Ejemplo de Uso

### Caso 1: Enviar reporte a Guatemala (Excel)

```
1. Click en "Finalizar y Enviar Reporte"
2. Seleccionar: "Guatemala - proveedores.gt@datumredsoft.com"
3. Ingresar: "SUBWAY DE GUATEMALA"
4. Formato: Excel (ya seleccionado)
5. Click en "Enviar Reporte"
```

**Resultado**:
- Evento cambia a "completado"
- Correo enviado a proveedores.gt@datumredsoft.com
- Asunto: "GT-SUBWAY DE GUATEMALA"
- Adjunto: Reporte_Gastos_VIAJE_GUATEMALA_1.xlsx

---

### Caso 2: Enviar reporte a El Salvador (PDF)

```
1. Click en "Finalizar y Enviar Reporte"
2. Seleccionar: "El Salvador - proveedores.sv@datumredsoft.com"
3. Dejar nombre de proveedor vacío
4. Seleccionar formato: PDF
5. Click en "Enviar Reporte"
```

**Resultado**:
- Evento cambia a "completado"
- Correo enviado a proveedores.sv@datumredsoft.com
- Asunto: "SV-PROVEEDOR" (usa placeholder)
- Adjunto: Reporte_Gastos_VIAJE_SV_1.pdf

---

## 🐛 Manejo de Errores

El componente maneja estos casos de error:

### Error: No hay gastos
```json
{
  "exitoso": false,
  "mensaje": "No se puede enviar el reporte: el evento no tiene gastos registrados"
}
```

### Error: Evento no encontrado
```
Error 404: Evento no encontrado con ID: 123
```

### Error: Fallo en SMTP
```
Error al enviar correo: Connection refused
```

Todos se muestran en un banner rojo dentro del modal.

---

## 🔄 Actualización del Estado del Evento

Después de enviar el reporte exitosamente:

```typescript
onSuccess={() => {
  // Opción 1: Recargar toda la página
  window.location.reload();
  
  // Opción 2: Solo refrescar el evento (más elegante)
  // fetchEventoData();
}}
```

---

## ✅ Checklist de Integración

- [ ] Importar `EnviarReporteModal` en `EventDetail.tsx`
- [ ] Agregar estado `showReporteModal`
- [ ] Agregar botón "Finalizar y Enviar Reporte"
- [ ] Condicionar botón a: `gastos.length > 0 && evento.estado === 'activo'`
- [ ] Renderizar modal al final del componente
- [ ] Probar flujo completo
- [ ] Verificar que el evento cambia a "completado"
- [ ] Confirmar que no se pueden agregar más gastos después

---

## 🚀 ¡Listo para Integrar!

Una vez integrado, el flujo completo estará funcionando:

```
EventDetail → Botón → Modal → Backend → Email → Completado ✅
```
