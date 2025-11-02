# Resumen: Visualización de Tarjetas por Empleado

## 🎯 Objetivo
Permitir que cada empleado vea únicamente sus tarjetas corporativas asignadas al acceder a `/tarjetas`, mostrando un mensaje si no tiene tarjetas.

## ✅ Cambios Implementados

### Backend

#### 1. **Nuevo Use Case**: `ObtenerTarjetasEmpleadoUseCase.java`
- **Ubicación**: `application/usecase/tarjeta/`
- **Funcionalidad**: 
  - Extrae el `keycloakId` del token JWT del usuario autenticado
  - Busca el empleado asociado a ese `keycloakId`
  - Obtiene las tarjetas asignadas a ese empleado
  - Mapea a DTOs `TarjetaResponse`
- **Manejo de errores**: Lanza `BusinessException` si el empleado no existe

#### 2. **Nuevo Endpoint**: `/api/tarjetas/mis-tarjetas`
- **Ubicación**: `TarjetaController.java`
- **Método**: `GET`
- **Seguridad**: `@RolesAllowed({"admin", "administrador", "usuario"})`
- **Respuesta**: Lista de `TarjetaResponse` con las tarjetas del empleado autenticado

#### 3. **Nuevo Método en Repositorio**: `buscarPorKeycloakId()`
- **Interfaces**:
  - `EmpleadoRepository.java`: Definición del método
  - `EmpleadoRepositoryImpl.java`: Implementación con Panache
- **Query**: `find("keycloakId", keycloakId).firstResultOptional()`
- **Retorno**: `Optional<Empleado>`

### Frontend

#### 4. **Nueva Función de Servicio**: `obtenerMisTarjetas()`
- **Ubicación**: `services/tarjetas.ts`
- **Endpoint**: `GET /api/tarjetas/mis-tarjetas`
- **Autenticación**: Incluye Bearer token

#### 5. **Refactorización Completa**: `Tarjetas.tsx`
- **Antes**: Datos hardcodeados
- **Ahora**: 
  - Carga dinámica de tarjetas del empleado autenticado
  - Estados de carga: Loading, Error, Empty, Success
  - Mensaje personalizado: "Usted no posee tarjeta corporativa" cuando no hay tarjetas
  - Formateo de números de tarjeta con guiones
  - Identificación de tipo de tarjeta (Visa/Mastercard) por primer dígito

## 📊 Flujo de Datos

```
Usuario autenticado → JWT con keycloakId
                      ↓
               Tarjetas.tsx
                      ↓
           obtenerMisTarjetas()
                      ↓
     GET /api/tarjetas/mis-tarjetas
                      ↓
   ObtenerTarjetasEmpleadoUseCase
                      ↓
      jwt.getSubject() → keycloakId
                      ↓
    buscarPorKeycloakId(keycloakId)
                      ↓
 buscarPorEmpleado(empleado.idEmpleado)
                      ↓
     Lista de TarjetaResponse
                      ↓
         Renderizado en UI
```

## 🔐 Seguridad
- Autenticación por JWT obligatoria
- Cada usuario solo ve sus propias tarjetas
- No requiere ID de empleado en la URL (se obtiene del token)
- Roles permitidos: admin, administrador, usuario

## 🎨 Estados de UI

### Estado: Cargando
```tsx
<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
"Cargando tarjetas..."
```

### Estado: Sin Tarjetas
```tsx
<CreditCard className="w-16 h-16 text-gray-400" />
"Usted no posee tarjeta corporativa"
```

### Estado: Con Tarjetas
- Tarjetas en grid responsivo (1-3 columnas)
- Formateo: `4111-1111-1111-2345`
- Identificación de tipo por primer dígito
- Fecha de expiración formateada
- País de emisión

### Estado: Error
```tsx
<AlertCircle className="w-16 h-16 text-red-500" />
"Error al cargar las tarjetas"
```

## 🔧 Requisitos Técnicos

### Base de Datos
- Tabla `Empleado` debe tener columna `keycloak_id`
- Relación `Tarjeta.empleado` → `Empleado.idEmpleado`
- Usuarios deben estar sincronizados con Keycloak

### Dependencias
- Backend: SmallRye JWT, Hibernate ORM
- Frontend: React 19, TypeScript, Lucide Icons

## 📝 Próximos Pasos (si aplica)
1. ✅ Verificar que todos los empleados tienen `keycloak_id` en BD
2. ✅ Probar con usuarios que tienen 0, 1 y múltiples tarjetas
3. ✅ Validar permisos de roles
4. ⏳ Agregar paginación si un empleado tiene muchas tarjetas (opcional)

## 🐛 Solución de Problemas Comunes

### Error: "Empleado no encontrado"
- Verificar que el usuario tiene `keycloak_id` en la tabla `Empleado`
- Ejecutar script de sincronización: `vincular-manual-usuarios.sql`

### No se muestran tarjetas
- Verificar en BD que las tarjetas tienen `id_empleado` asignado
- Revisar que no sean tarjetas con `id_empleado = 1` (Sin Asignar)

### Error de autenticación
- Verificar que el token JWT es válido
- Revisar configuración de Keycloak
- Confirmar que el usuario tiene rol permitido

---

**Fecha de implementación**: 2025
**Autor**: Copilot + Usuario
**Estado**: ✅ Completado y listo para pruebas
