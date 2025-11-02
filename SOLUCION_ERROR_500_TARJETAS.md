# 🔧 Solución: Error 500 en /api/tarjetas/mis-tarjetas

## 🐛 Problema Identificado

Error HTTP 500 al intentar obtener las tarjetas del empleado autenticado.

### Causa Raíz
El `ObtenerTarjetasEmpleadoUseCase` intentaba buscar directamente en la tabla `Empleado` por `keycloakId`, pero:
- ❌ La entidad `Empleado` NO tiene el campo `keycloakId`
- ✅ La entidad `Usuario` SÍ tiene el campo `keycloakId`
- ✅ `Usuario` tiene relación con `Empleado` vía `id_empleado`

## ✅ Solución Implementada

### 1. Cambio en el Use Case
**Archivo**: `ObtenerTarjetasEmpleadoUseCase.java`

**Antes**:
```java
@Inject
EmpleadoRepository empleadoRepository;

public List<TarjetaResponse> execute() {
    String keycloakId = jwt.getSubject();
    Empleado empleado = empleadoRepository.buscarPorKeycloakId(keycloakId) // ❌ No existe
        .orElseThrow(...);
    // ...
}
```

**Ahora**:
```java
@Inject
UsuarioRepository usuarioRepository;

public List<TarjetaResponse> execute() {
    String keycloakId = jwt.getSubject();
    
    // 1. Buscar usuario por keycloak_id
    Usuario usuario = usuarioRepository.findByKeycloakId(keycloakId)
        .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
    
    // 2. Validar que tiene empleado asociado
    if (usuario.getIdEmpleado() == null) {
        throw new BusinessException("Usuario sin empleado asociado");
    }
    
    // 3. Obtener tarjetas del empleado
    List<Tarjeta> tarjetas = tarjetaRepository.buscarPorEmpleado(usuario.getIdEmpleado());
    
    return tarjetas.stream().map(this::mapToResponse).toList();
}
```

### 2. Flujo Correcto de Datos

```
JWT Token → keycloak_id (subject)
              ↓
    UsuarioRepository.findByKeycloakId()
              ↓
    Usuario.id_empleado
              ↓
    TarjetaRepository.buscarPorEmpleado()
              ↓
    List<Tarjeta> → List<TarjetaResponse>
```

### 3. Sincronización de Keycloak IDs

**Script creado**: `sincronizar-keycloak.ps1`

**Funcionalidad**:
1. ✅ Conecta con Keycloak Admin API
2. ✅ Obtiene todos los usuarios y sus UUIDs
3. ✅ Genera SQL automático para actualizar tabla `Usuario`
4. ✅ Opcionalmente ejecuta el SQL en Oracle

**Ejecución**:
```powershell
cd "Proyecto Final"
.\BackEnd\scripts\sincronizar-keycloak.ps1
```

**Output esperado**:
```
👥 Usuarios encontrados:
═══════════════════════════════════════════════════
Usuario: cmartinez
  └─ Keycloak ID: 123e4567-e89b-12d3-a456-426614174000
  └─ Email: cmartinez@datum.com

Usuario: arodrguez
  └─ Keycloak ID: 789e4567-e89b-12d3-a456-426614174111
  └─ Email: arodriguez@datum.com
═══════════════════════════════════════════════════
```

### 4. Estructura de Base de Datos

```sql
-- Tabla Usuario (vincula Keycloak con Empleado)
CREATE TABLE Usuario (
    id_usuario NUMBER PRIMARY KEY,
    id_empleado NUMBER,              -- FK a Empleado
    usuario_app VARCHAR2(50),
    contraseña VARCHAR2(50),
    keycloak_id VARCHAR2(100) UNIQUE -- UUID de Keycloak
);

-- Tabla Empleado
CREATE TABLE Empleado (
    id_empleado NUMBER PRIMARY KEY,
    nombre VARCHAR2(50),
    apellido VARCHAR2(50),
    correo VARCHAR2(50),
    -- NO tiene keycloak_id
);

-- Tabla Tarjeta
CREATE TABLE Tarjeta (
    id_tarjeta NUMBER PRIMARY KEY,
    id_empleado NUMBER,              -- FK a Empleado
    banco VARCHAR2(100),
    numero_tarjeta VARCHAR2(25),
    fecha_expiracion DATE
);
```

### 5. Entidades JPA Usadas

```
Usuario (tiene keycloak_id)
   ↓ (id_empleado)
Empleado
   ↑ (id_empleado)
Tarjeta
```

## 🧪 Pruebas

### Caso 1: Usuario con tarjetas
```bash
# Request
GET /api/tarjetas/mis-tarjetas
Authorization: Bearer <jwt_token>

# Response 200
[
  {
    "idTarjeta": 5,
    "banco": "Banco Agrícola",
    "numeroTarjeta": "4111111111111234",
    "fechaExpiracion": "2026-12-31",
    "idPais": 1,
    "nombrePais": "El Salvador",
    "empleado": {
      "idEmpleado": 1,
      "nombre": "Carlos",
      "apellido": "Martínez",
      "correo": "cmartinez@datum.com"
    }
  }
]
```

### Caso 2: Usuario sin tarjetas
```bash
# Response 200
[]
```

### Caso 3: Usuario sin keycloak_id en BD
```bash
# Response 400
{
  "message": "Usuario no encontrado para el keycloak_id: 123e..."
}
```

## 📋 Checklist de Requisitos

- [x] Tabla `Usuario` tiene columna `keycloak_id`
- [ ] **Ejecutar**: `sincronizar-keycloak.ps1` para poblar keycloak_id
- [x] `UsuarioRepository.findByKeycloakId()` implementado
- [x] `ObtenerTarjetasEmpleadoUseCase` refactorizado
- [x] Frontend llama a `/api/tarjetas/mis-tarjetas`
- [ ] **Reiniciar** backend para aplicar cambios

## 🚀 Próximos Pasos

### PASO 1: Sincronizar Keycloak IDs
```powershell
cd "c:\Users\ialva\Desktop\UDB CICLOS\TRABAJO DOCUMENTOS\DATUM REDSOFT\Proyecto Final"
.\BackEnd\scripts\sincronizar-keycloak.ps1
```

### PASO 2: Verificar en Oracle
```sql
SELECT 
    u.usuario_app,
    u.keycloak_id,
    e.nombre || ' ' || e.apellido as empleado
FROM Usuario u
LEFT JOIN Empleado e ON u.id_empleado = e.id_empleado;
```

### PASO 3: Reiniciar Backend
```bash
# Detener Quarkus (Ctrl+C en terminal)
# Iniciar nuevamente
cd BackEnd/quarkus-api
./mvnw quarkus:dev
```

### PASO 4: Probar desde Frontend
```
1. Login en http://localhost:5173/login
2. Ir a http://localhost:5173/tarjetas
3. Verificar que se muestren las tarjetas o mensaje "No posee tarjeta"
```

## 🔍 Debugging

Si sigue fallando, revisar logs del backend:
```bash
# Buscar excepciones
grep -i "exception\|error" BackEnd/quarkus-api/target/quarkus.log

# Ver última request fallida
tail -f BackEnd/quarkus-api/target/quarkus.log
```

---

**Fecha**: 2025-11-02  
**Estado**: ✅ Código refactorizado, pendiente sincronización BD
