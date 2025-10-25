# 🧪 Usuarios de Prueba - Datum Travels

Esta guía documenta los usuarios de prueba disponibles para desarrollo y testing, con sus credenciales y roles asignados.

## 📋 Lista de Usuarios

| Usuario | Contraseña | Rol | Descripción | Uso |
|---------|-----------|-----|-------------|-----|
| `carlos.test` | `test123` | Empleado | Empleado básico | Testing de funcionalidad base |
| `maria.contador` | `contador123` | contador | Personal contable | Testing de reportes y aprobaciones |
| `juan.gerente` | `gerente123` | gerente | Gerente de área | Testing de autorización de gastos |
| `admin.datum` | `admin123` | admin | Administrador del sistema | Testing de funciones administrativas |

## 🔧 Configuración Automática

### 1. Base de Datos Oracle

**Script Completo (RECOMENDADO)** - Crea los 4 usuarios:
```sql
@BackEnd/scripts/insertar-usuarios-prueba-completo.sql
```

**Script Básico** - Solo crea carlos.test:
```sql
@BackEnd/scripts/insertar-usuario-test-keycloak.sql
```

### 2. Keycloak

**Script Completo (RECOMENDADO)** - Configura contraseñas de los 4 usuarios:
```powershell
.\setup-keycloak-passwords.ps1
```

**Script Básico** - Solo configura carlos.test:
```powershell
.\setup-keycloak-password.ps1
```

## 🧪 Pruebas de Login

### Carlos (Empleado)
```powershell
$body = @{usuarioApp="carlos.test"; contrasena="test123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### María (Contador)
```powershell
$body = @{usuarioApp="maria.contador"; contrasena="contador123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Juan (Gerente)
```powershell
$body = @{usuarioApp="juan.gerente"; contrasena="gerente123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Admin
```powershell
$body = @{usuarioApp="admin.datum"; contrasena="admin123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

## 🎯 Casos de Uso por Rol

### Empleado (carlos.test)
✅ Puede hacer:
- Crear eventos de viaje
- Registrar gastos personales
- Ver sus propios reportes
- Subir comprobantes

❌ No puede:
- Aprobar gastos de otros
- Ver reportes financieros
- Gestionar usuarios

### Contador (maria.contador)
✅ Puede hacer:
- Ver todos los eventos y gastos
- Generar reportes financieros
- Exportar a Excel
- Validar comprobantes

❌ No puede:
- Aprobar presupuestos
- Gestionar usuarios

### Gerente (juan.gerente)
✅ Puede hacer:
- Aprobar/rechazar gastos de su área
- Ver reportes de su equipo
- Gestionar eventos de su área

❌ No puede:
- Gestionar usuarios del sistema
- Ver gastos de otras áreas

### Administrador (admin.datum)
✅ Puede hacer:
- Todo lo anterior
- Gestionar usuarios
- Configurar sistema
- Ver toda la información

## 📊 Datos en Base de Datos

Después de ejecutar `insertar-usuarios-prueba-completo.sql`, tendrás:

```
Empleado (id_empleado, nombre, apellido, correo, telefono)
────────────────────────────────────────────────────────────
1, Carlos, Test, carlos@datum.com, 7777-0001
2, María, Contador, maria@datum.com, 7777-0002
3, Juan, Gerente, juan@datum.com, 7777-0003
4, Admin, Datum, admin@datum.com, 7777-0004

Usuario (id_usuario, usuario_app, empleado_id)
────────────────────────────────────────────────
1, carlos.test, 1
2, maria.contador, 2
3, juan.gerente, 3
4, admin.datum, 4
```

## 🔐 Seguridad

- ⚠️ **Estas credenciales son SOLO para desarrollo/testing**
- 🚫 **NUNCA uses estas contraseñas en producción**
- 🔒 **En producción:** Usar contraseñas generadas aleatoriamente
- 📝 **Realm export:** No incluye contraseñas (Keycloak security policy)

## 🔄 Workflow para Nuevos Desarrolladores

1. **Clonar repositorio**
   ```bash
   git clone <repo>
   cd BootcampNSPTeam
   ```

2. **Levantar Docker**
   ```powershell
   docker-compose -f docker-compose-dev.yml up -d
   ```

3. **Configurar BD**
   ```sql
   -- En SQL*Plus
   @BackEnd/scripts/insertar-usuarios-prueba-completo.sql
   ```

4. **Configurar Keycloak**
   ```powershell
   .\setup-keycloak-passwords.ps1
   ```

5. **¡Listo! 🎉** Todos los usuarios están disponibles para testing

**Tiempo total: ~3 minutos**

## 🧹 Limpieza de Datos de Prueba

Si necesitas limpiar los usuarios de prueba:

```sql
-- Eliminar usuarios (esto eliminará en cascada gracias a ON DELETE CASCADE)
DELETE FROM Usuario WHERE usuario_app IN ('carlos.test', 'maria.contador', 'juan.gerente', 'admin.datum');

-- Verificar
SELECT * FROM Usuario;
SELECT * FROM Empleado;
```

En Keycloak, eliminar manualmente desde Admin Console:
1. http://localhost:8180/admin
2. Realm: datum-travels
3. Users → seleccionar → Actions → Delete

## 📚 Referencias

- [SETUP_COMPLETO.md](./SETUP_COMPLETO.md) - Guía completa de setup
- [BackEnd/keycloak/README_REALM_IMPORT.md](./BackEnd/keycloak/README_REALM_IMPORT.md) - Documentación del realm
- [BackEnd/scripts/insertar-usuarios-prueba-completo.sql](./BackEnd/scripts/insertar-usuarios-prueba-completo.sql) - Script de creación de usuarios
