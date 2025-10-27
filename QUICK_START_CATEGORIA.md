# 🚀 Quick Start - Feature Categoría de Gasto

## 📦 Prerequisitos

1. **Base de Datos:** Asegúrate de tener los registros en la tabla `Categoria_Gasto`
   ```bash
   # Ejecutar el script SQL:
   sqlplus datum_user/datum2025@localhost:1522/XEPDB1 @BackEnd/scripts/insertar-categorias.sql
   ```

2. **Backend Principal (Puerto 8081):**
   ```bash
   cd BackEnd/quarkus-api
   ./mvnw quarkus:dev
   ```

3. **Microservicio OCR (Puerto 8080):**
   ```bash
   cd ocr-quarkus
   ./mvnw quarkus:dev
   ```

4. **Frontend:**
   ```bash
   cd FrontEnd/frontend
   npm run dev
   ```

---

## 🧪 Pruebas Rápidas

### 1. Probar el endpoint de categorías:
```powershell
./test-categorias.ps1
```

O manualmente:
```bash
curl http://localhost:8081/api/categorias
```

### 2. Probar el flujo completo:
1. Abre el frontend en http://localhost:5173
2. Inicia sesión
3. Ve a un evento existente
4. Captura o sube una factura
5. **Verifica que aparezca el dropdown de categorías**
6. Selecciona una categoría (campo obligatorio)
7. Completa el resto del formulario
8. Guarda el gasto
9. Verifica en la BD:
   ```sql
   SELECT id_gasto, descripcion, monto, id_categoria 
   FROM Gasto 
   ORDER BY id_gasto DESC 
   FETCH FIRST 5 ROWS ONLY;
   ```

---

## 📋 Endpoints Nuevos

### GET /api/categorias
**Backend:** http://localhost:8081/api/categorias  
**Descripción:** Lista todas las categorías de gasto disponibles  
**Response:**
```json
[
  { "idCategoria": 1, "nombreCategoria": "Transporte" },
  { "idCategoria": 2, "nombreCategoria": "Alimentación" },
  { "idCategoria": 3, "nombreCategoria": "Hospedaje" },
  { "idCategoria": 4, "nombreCategoria": "Representación" },
  { "idCategoria": 5, "nombreCategoria": "Otros" }
]
```

---

## 🔍 Verificación

### Verificar que el campo se guardó:
```sql
-- Ver el último gasto creado con su categoría
SELECT 
    g.id_gasto,
    g.descripcion,
    g.monto,
    g.id_categoria,
    cg.nombre_categoria
FROM Gasto g
LEFT JOIN Categoria_Gasto cg ON g.id_categoria = cg.id_categoria
ORDER BY g.id_gasto DESC
FETCH FIRST 1 ROWS ONLY;
```

---

## ⚠️ Troubleshooting

### El dropdown no carga categorías:
1. Verifica que el backend esté corriendo en el puerto 8081
2. Revisa la consola del navegador (F12) para ver errores
3. Verifica que existan registros en `Categoria_Gasto`:
   ```sql
   SELECT * FROM Categoria_Gasto;
   ```

### Error "Debes seleccionar una categoría":
- Es normal, el campo es obligatorio. Debes seleccionar una opción del dropdown.

### El campo `id_categoria` se guarda como NULL:
1. Verifica que el frontend esté enviando `IdCategoria` en el payload
2. Abre las DevTools del navegador → Network → Busca la petición POST a `/api/gastos/llm`
3. Verifica el payload enviado

---

## 📚 Documentación Completa

Ver: `FEATURE_CATEGORIA_GASTO.md`
