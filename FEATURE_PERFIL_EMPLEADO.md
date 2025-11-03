# 👤 Feature: Gestión de Perfil del Empleado

## 📋 Descripción General

Funcionalidad que permite a cada empleado ver y actualizar su información personal desde la página de perfil (`/profile`). Los datos se cargan automáticamente desde la base de datos al iniciar sesión y se pueden modificar directamente desde la interfaz.

---

## 🎯 Funcionalidades Implementadas

### 1️⃣ **Ver Perfil del Empleado Autenticado**
- **Endpoint**: `GET /api/empleados/perfil`
- **Autenticación**: Requerida (Bearer Token)
- **Descripción**: Obtiene los datos completos del empleado autenticado usando su Keycloak ID

**Response Example:**
```json
{
  "idEmpleado": 1,
  "nombre": "Carlos",
  "apellido": "Martínez",
  "correo": "carlos.martinez@datum.com",
  "telefono": "+503 7123 4567",
  "cargo": "Desarrollador Senior",
  "departamento": "Tecnología",
  "empresa": "Datum Travels"
}
```

### 2️⃣ **Actualizar Perfil del Empleado**
- **Endpoint**: `PUT /api/empleados/perfil`
- **Autenticación**: Requerida (Bearer Token)
- **Descripción**: Actualiza los datos personales del empleado autenticado

**Request Example:**
```json
{
  "nombre": "Carlos",
  "apellido": "Martínez",
  "correo": "carlos.martinez@datum.com",
  "telefono": "+503 7123 4567"
}
```

**Validaciones:**
- ✅ Nombre y apellido son obligatorios
- ✅ Correo debe ser válido y único
- ✅ No se permite usar un correo ya asignado a otro empleado

---

## 🏗️ Arquitectura Backend

### **Capa Application**

#### DTOs Creados:
```
application/dto/empleado/
├── PerfilEmpleadoResponse.java      # Respuesta con datos completos del perfil
└── ActualizarPerfilRequest.java     # Request para actualizar perfil
```

#### Use Cases Creados:
```
application/usecase/empleado/
├── ObtenerPerfilEmpleadoUseCase.java    # Obtener perfil del usuario autenticado
└── ActualizarPerfilEmpleadoUseCase.java # Actualizar perfil del usuario autenticado
```

**Flujo de ObtenerPerfilEmpleadoUseCase:**
1. Extrae el ID del empleado desde el JWT (usando `CurrentUserProvider`)
2. Busca el empleado en la BD con sus relaciones (Cargo, Departamento, Empresa)
3. Mapea los datos a `PerfilEmpleadoResponse`

**Flujo de ActualizarPerfilEmpleadoUseCase:**
1. Valida que el empleado existe
2. Valida que el correo no esté en uso por otro empleado
3. Actualiza solo los campos editables: nombre, apellido, correo, teléfono
4. Retorna los datos actualizados

### **Capa Domain**

#### Repositorio Actualizado:
```java
// EmpleadoRepository.java
Optional<Empleado> buscarPorId(Long idEmpleado);
Empleado update(Empleado empleado);
```

#### Entidades Involucradas:
- `Empleado` (entidad principal)
- `Cargo` (relación ManyToOne)
- `Departamento` (relación ManyToOne)
- `Empresa` (relación ManyToOne)

### **Capa Infrastructure**

#### Endpoints Agregados a EmpleadoController:
```java
GET  /api/empleados/perfil        # Obtener mi perfil
PUT  /api/empleados/perfil        # Actualizar mi perfil
```

---

## 💻 Implementación Frontend

### **Servicios Creados**

**Archivo**: `src/services/empleados.ts`

```typescript
// Obtener perfil del empleado autenticado
export async function obtenerPerfil(): Promise<PerfilEmpleado>

// Actualizar perfil del empleado autenticado
export async function actualizarPerfil(
  payload: ActualizarPerfilPayload
): Promise<PerfilEmpleado>
```

### **Tipos TypeScript**

**Archivo**: `src/types/empleado.ts`

```typescript
export interface PerfilEmpleado {
  idEmpleado: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
  cargo?: string | null;
  departamento?: string | null;
  empresa?: string | null;
}

export interface ActualizarPerfilPayload {
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
}
```

### **Componente Actualizado**

**Archivo**: `src/pages/profile.tsx`

**Funcionalidades:**
- ✅ Carga automática del perfil al montar el componente
- ✅ Modo de visualización (solo lectura)
- ✅ Modo de edición con validación
- ✅ Manejo de estados de carga y error
- ✅ Actualización en tiempo real tras guardar cambios
- ✅ Cancelación de edición sin perder datos originales

**Estados del Componente:**
```typescript
const [profile, setProfile] = useState<PerfilEmpleado | null>(null);
const [isEditMode, setIsEditMode] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [saveError, setSaveError] = useState<string | null>(null);
```

---

## 🔐 Seguridad

### **Autenticación y Autorización**
- ✅ Endpoints protegidos con `@Authenticated`
- ✅ Token JWT requerido en todas las peticiones
- ✅ Validación automática del token en el frontend (refresh si es necesario)

### **Validación de Negocio**
- ✅ El empleado solo puede editar su propio perfil
- ✅ No puede cambiar cargo, departamento ni empresa
- ✅ Validación de unicidad de correo electrónico

---

## 🧪 Pruebas Recomendadas

### **Backend**
```bash
# 1. Obtener perfil (requiere token válido)
curl -X GET http://localhost:8081/api/empleados/perfil \
  -H "Authorization: Bearer {token}"

# 2. Actualizar perfil
curl -X PUT http://localhost:8081/api/empleados/perfil \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "apellido": "Martínez",
    "correo": "carlos.martinez@datum.com",
    "telefono": "+503 7123 4567"
  }'
```

### **Frontend**
1. Iniciar sesión con un usuario válido
2. Navegar a `/profile`
3. Verificar que se carga la información correcta
4. Hacer clic en "Editar Perfil"
5. Modificar nombre, apellido, correo o teléfono
6. Hacer clic en "Guardar Cambios"
7. Verificar que los cambios se reflejan inmediatamente
8. Recargar la página y verificar persistencia

---

## 📊 Datos de Ejemplo

Para probar la funcionalidad, asegúrate de tener empleados con datos completos:

```sql
-- Verificar empleado con relaciones
SELECT 
  e.id_empleado,
  e.nombre,
  e.apellido,
  e.correo,
  e.telefono,
  c.nombre as cargo,
  d.nombre_depart as departamento,
  emp.nombre_empresa as empresa
FROM Empleado e
LEFT JOIN Cargo c ON e.id_cargo = c.id_cargo
LEFT JOIN Departamento d ON e.id_departamento = d.id_departamento
LEFT JOIN Empresa emp ON e.id_empresa = emp.id_empresa
WHERE e.id_empleado = 1;
```

---

## 🚀 Próximas Mejoras

- [ ] Subir y actualizar foto de perfil (almacenamiento en servidor)
- [ ] Historial de cambios del perfil
- [ ] Notificación por correo al cambiar información sensible
- [ ] Cambio de contraseña desde el perfil
- [ ] Verificación de correo electrónico al cambiar

---

## 📝 Notas Importantes

1. **Campos de Solo Lectura**: Cargo, Departamento y Empresa no se pueden editar desde el perfil. Estos deben ser modificados por un administrador.

2. **Sincronización con Keycloak**: El cambio de correo solo afecta la base de datos local. Si se requiere sincronizar con Keycloak, se debe implementar esa lógica adicional.

3. **Validación de Correo**: El sistema valida que el correo sea único dentro de la tabla `Empleado`.

4. **Foto de Perfil**: Actualmente solo se maneja en el frontend como URL temporal. Para persistir, se requiere implementar almacenamiento de archivos.

---

## 🛠️ Comandos Útiles

### Compilar Backend:
```bash
cd BackEnd/quarkus-api
./mvnw clean compile
```

### Ejecutar Backend:
```bash
./mvnw quarkus:dev
```

### Ejecutar Frontend:
```bash
cd FrontEnd/frontend
npm run dev
```

---

**Fecha de Implementación**: Noviembre 2, 2025  
**Desarrollado por**: GitHub Copilot  
**Versión**: 1.0
