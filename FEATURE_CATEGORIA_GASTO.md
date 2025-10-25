# ✅ Feature: Selección de Categoría de Gasto

## 📋 Resumen
Se agregó un dropdown (select) en el formulario de gastos para que el usuario seleccione manualmente la categoría del gasto desde las opciones registradas en la tabla `Categoria_Gasto` de la base de datos.

---

## 🔧 Cambios Realizados

### 1️⃣ **Backend Principal (quarkus-api - Puerto 8081)**

#### ✅ DTO - `CategoriaGastoDTO.java`
**Ubicación:** `application/dto/categoria/CategoriaGastoDTO.java`

```java
public record CategoriaGastoDTO(
    Long idCategoria,
    String nombreCategoria
) {}
```

#### ✅ Repository Interface - `CategoriaGastoRepository.java`
**Ubicación:** `domain/repository/CategoriaGastoRepository.java`

```java
public interface CategoriaGastoRepository {
    List<CategoriaGasto> listarTodas();
}
```

#### ✅ Repository Implementation - `CategoriaGastoRepositoryImpl.java`
**Ubicación:** `infrastructure/adapter/persistence/CategoriaGastoRepositoryImpl.java`

```java
@ApplicationScoped
public class CategoriaGastoRepositoryImpl implements CategoriaGastoRepository, PanacheRepository<CategoriaGasto> {
    @Override
    public List<CategoriaGasto> listarTodas() {
        return listAll();
    }
}
```

#### ✅ Use Case - `ListarCategoriasGastoUseCase.java`
**Ubicación:** `application/usecase/categoria/ListarCategoriasGastoUseCase.java`

```java
@ApplicationScoped
public class ListarCategoriasGastoUseCase {
    @Inject
    CategoriaGastoRepository categoriaRepository;

    public List<CategoriaGastoDTO> ejecutar() {
        return categoriaRepository.listarTodas()
            .stream()
            .map(categoria -> new CategoriaGastoDTO(
                categoria.idCategoria,
                categoria.nombreCategoria
            ))
            .collect(Collectors.toList());
    }
}
```

#### ✅ Controller - `CategoriaController.java`
**Ubicación:** `infrastructure/adapter/rest/CategoriaController.java`

```java
@Path("/api/categorias")
@Produces(MediaType.APPLICATION_JSON)
public class CategoriaController {
    @Inject
    ListarCategoriasGastoUseCase listarCategoriasUseCase;

    @GET
    public Response listarCategorias() {
        List<CategoriaGastoDTO> categorias = listarCategoriasUseCase.ejecutar();
        return Response.ok(categorias).build();
    }
}
```

**Endpoint creado:** `GET http://localhost:8081/api/categorias`

---

### 2️⃣ **Microservicio OCR (ocr-quarkus - Puerto 8080)**

#### ✅ Entidad - `Gasto.java`
**Ubicación:** `org/acme/ocrquarkus/entity/Gasto.java`

Se agregó el campo `idCategoria`:

```java
@Column(name = "id_categoria")
public Long idCategoria;
```

#### ✅ Service - `GastoService.java`
**Ubicación:** `org/acme/ocrquarkus/service/GastoService.java`

Se actualizó el método `guardarGastoDesdeJson` para extraer y guardar el `idCategoria`:

```java
// Extraer ID de categoría (nuevo campo)
Long idCategoria = null;
if (json.has("IdCategoria") && !json.get("IdCategoria").isNull()) {
    idCategoria = json.get("IdCategoria").asLong();
}

gasto.idCategoria = idCategoria;
```

---

### 3️⃣ **Frontend (React + TypeScript)**

#### ✅ Servicio - `categorias.ts`
**Ubicación:** `src/services/categorias.ts`

Nuevo archivo para manejar las peticiones al backend:

```typescript
export interface CategoriaGasto {
  idCategoria: number;
  nombreCategoria: string;
}

export async function obtenerCategorias(): Promise<CategoriaGasto[]> {
  const response = await fetch(`${API_BASE_URL}/api/categorias`);
  if (!response.ok) {
    throw new Error(`Error al obtener categorías: ${response.status}`);
  }
  return response.json();
}
```

#### ✅ Tipo - `gasto.ts`
**Ubicación:** `src/types/gasto.ts`

Se agregó el campo `idCategoria` a la interfaz:

```typescript
export interface GastoFormData {
  nombreEmpresa: string;
  descripcion: string;
  montoTotal: string;
  fecha: string;
  idCategoria: string; // ⬅️ NUEVO CAMPO
}
```

#### ✅ Servicio OCR - `ocr.ts`
**Ubicación:** `src/services/ocr.ts`

Se actualizó `buildPayloadFromFormData` para incluir `IdCategoria`:

```typescript
export function buildPayloadFromFormData(formData: GastoFormData) {
  return {
    NombreEmpresa: formData.nombreEmpresa,
    Descripcion: formData.descripcion,
    MontoTotal: formData.montoTotal,
    Fecha: formData.fecha,
    IdCategoria: formData.idCategoria ? Number.parseInt(formData.idCategoria, 10) : undefined,
  };
}
```

#### ✅ Componente - `GastoForm.tsx`
**Ubicación:** `src/pages/GastoForm.tsx`

**Cambios realizados:**

1. **Import del servicio de categorías:**
```typescript
import { obtenerCategorias, type CategoriaGasto } from "../services/categorias";
```

2. **Estados agregados:**
```typescript
const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
const [isLoadingCategorias, setIsLoadingCategorias] = useState<boolean>(true);
```

3. **useEffect para cargar categorías al montar el componente:**
```typescript
useEffect(() => {
  let cancelled = false;
  const cargarCategorias = async () => {
    try {
      const categoriasObtenidas = await obtenerCategorias();
      if (!cancelled) {
        setCategorias(categoriasObtenidas);
      }
    } catch (err) {
      if (!cancelled) {
        console.error("Error al cargar categorías:", err);
        setError("No se pudieron cargar las categorías de gasto.");
      }
    } finally {
      if (!cancelled) {
        setIsLoadingCategorias(false);
      }
    }
  };
  cargarCategorias();
  return () => { cancelled = true; };
}, []);
```

4. **Validación agregada en `handleSaveClick`:**
```typescript
if (!formData.idCategoria) {
  setError("Debes seleccionar una categoría de gasto.");
  return;
}
```

5. **Dropdown HTML agregado en el formulario:**
```tsx
<div>
  <label className="block text-sm font-medium text-slate-700 mb-2">
    Categoría <span className="text-red-500">*</span>
  </label>
  {isLoadingCategorias ? (
    <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Cargando categorías...</span>
    </div>
  ) : (
    <select
      value={formData.idCategoria}
      onChange={handleChange("idCategoria")}
      disabled={isAnalyzing || isSaving}
      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
    >
      <option value="">-- Selecciona una categoría --</option>
      {categorias.map((categoria) => (
        <option key={categoria.idCategoria} value={categoria.idCategoria}>
          {categoria.nombreCategoria}
        </option>
      ))}
    </select>
  )}
</div>
```

6. **Actualización del `handleChange` para soportar selects:**
```typescript
const handleChange = (field: keyof GastoFormData) => (
  event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { value } = event.target;
  setFormData((prev) => ({ ...prev, [field]: value }));
};
```

---

## 🧪 Pruebas

### 1. Verificar que el endpoint funcione:
```bash
curl http://localhost:8081/api/categorias
```

**Respuesta esperada:**
```json
[
  { "idCategoria": 1, "nombreCategoria": "Transporte" },
  { "idCategoria": 2, "nombreCategoria": "Alimentación" },
  { "idCategoria": 3, "nombreCategoria": "Hospedaje" },
  { "idCategoria": 4, "nombreCategoria": "Representación" },
  { "idCategoria": 5, "nombreCategoria": "Otros" }
]
```

### 2. Probar el flujo completo:
1. Iniciar ambos backends (puerto 8080 y 8081)
2. Iniciar el frontend
3. Capturar una factura/ticket
4. Verificar que el dropdown cargue las categorías
5. Seleccionar una categoría manualmente
6. Guardar el gasto
7. Verificar en la BD que el campo `id_categoria` se guardó correctamente

---

## 📊 Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  GastoForm.tsx                                   │   │
│  │  - Dropdown de Categorías (campo obligatorio)   │   │
│  │  - useEffect para cargar categorías al inicio    │   │
│  │  - Validación antes de guardar                   │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Services                                        │   │
│  │  - categorias.ts → GET /api/categorias          │   │
│  │  - ocr.ts → POST /api/gastos/llm (con IdCateg)  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         BACKEND PRINCIPAL (Puerto 8081)                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  CategoriaController                             │   │
│  │  GET /api/categorias                             │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ListarCategoriasGastoUseCase                    │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  CategoriaGastoRepository                        │   │
│  │  → SELECT * FROM Categoria_Gasto                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         MICROSERVICIO OCR (Puerto 8080)                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  POST /api/gastos/llm                            │   │
│  │  { IdCategoria: 2, ... }                         │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  GastoService.guardarGastoDesdeJson()            │   │
│  │  - Extrae IdCategoria del JSON                   │   │
│  │  - Guarda en gasto.idCategoria                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
                    ┌──────────┐
                    │ Oracle DB │
                    │  Gasto    │
                    └──────────┘
```

---

## 📝 Notas Importantes

1. **Campo Obligatorio:** El campo categoría es obligatorio. El frontend valida que se haya seleccionado una categoría antes de permitir guardar el gasto.

2. **Carga Inicial:** Las categorías se cargan automáticamente cuando el componente `GastoForm` se monta.

3. **Estado de Carga:** Mientras se cargan las categorías, se muestra un spinner con el texto "Cargando categorías...".

4. **Clean Architecture:** Se siguió el patrón Clean Architecture del proyecto:
   - `domain/`: Entidades y contratos de repositorio
   - `application/`: DTOs y Use Cases
   - `infrastructure/`: Implementaciones de repositorios y controladores REST

5. **Compatibilidad:** Los cambios son retrocompatibles. Si el OCR no detecta una categoría o el campo viene vacío, se guarda como `null` en la BD.

---

## ✅ Checklist de Verificación

- [x] Endpoint `GET /api/categorias` creado en backend principal
- [x] DTO `CategoriaGastoDTO` implementado
- [x] Repository y Use Case implementados
- [x] Controller REST implementado
- [x] Servicio frontend `categorias.ts` creado
- [x] Tipo `GastoFormData` actualizado con campo `idCategoria`
- [x] Componente `GastoForm.tsx` actualizado con dropdown
- [x] Validación de campo obligatorio agregada
- [x] Campo `idCategoria` agregado a entidad `Gasto` en OCR
- [x] Servicio OCR actualizado para procesar `IdCategoria`
- [x] Payload del servicio `ocr.ts` actualizado

---

## 🚀 Próximos Pasos Sugeridos

1. Agregar datos de prueba en la tabla `Categoria_Gasto` si aún no existen:
```sql
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Transporte');
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Alimentación');
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Hospedaje');
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Representación');
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Otros');
COMMIT;
```

2. Probar el flujo completo end-to-end

3. Considerar agregar caché en el frontend para no recargar las categorías en cada render

4. Agregar manejo de errores más específico (ej: si no hay categorías en la BD)
