# 🔧 Solución: Persistencia de Datos en Oracle Docker

## ❌ Problema Original

Cada vez que levantabas el backend de Quarkus:
1. Se **borraban TODAS las tablas** (`drop-and-create`)
2. Se **insertaban datos de prueba** desde `import.sql`
3. **Perdías todos los eventos** creados desde el frontend

---

## ✅ Solución Implementada

### Cambios en `application.properties`

**ANTES:**
```properties
quarkus.hibernate-orm.database.generation=drop-and-create
quarkus.hibernate-orm.sql-load-script=import.sql
```

**AHORA:**
```properties
quarkus.hibernate-orm.database.generation=update
quarkus.hibernate-orm.sql-load-script=no-file
```

---

## 📋 ¿Qué hace cada configuración?

### `database.generation=update`
✅ **Ventajas:**
- Mantiene los datos existentes
- Crea tablas nuevas si no existen
- Agrega columnas nuevas si modificas entidades
- **Los eventos que crees desde el frontend SE MANTIENEN**

⚠️ **Limitaciones:**
- No elimina columnas obsoletas (debes hacerlo manualmente)
- No modifica tipos de datos de columnas existentes

### `sql-load-script=no-file`
✅ **Ventajas:**
- No ejecuta `import.sql` al iniciar
- No inserta datos duplicados

---

## 🚀 Comportamiento Actual

### Primera vez que levantas el backend:
1. Crea las tablas si no existen
2. **NO** inserta datos automáticamente
3. La BD queda **VACÍA** (lista para tus pruebas)

### Reinicios posteriores:
1. **Mantiene todas las tablas**
2. **Mantiene todos los datos**
3. Solo agrega nuevas tablas/columnas si cambiaste el código

---

## 🧪 Escenarios de Uso

### ✅ Escenario 1: Primera vez (BD vacía)
```bash
# 1. Levantar Docker
docker-compose -f docker-compose-dev.yml up -d

# 2. Levantar Backend
cd BackEnd/quarkus-api
./mvnw compile quarkus:dev

# 3. Resultado:
# - Tablas creadas ✅
# - Sin datos ✅
# - Listo para insertar desde frontend
```

### ✅ Escenario 2: Reiniciar backend (con datos)
```bash
# 1. Crear eventos desde frontend
# 2. Detener backend (Ctrl+C)
# 3. Volver a levantar backend
./mvnw compile quarkus:dev

# 4. Resultado:
# - Datos anteriores SE MANTIENEN ✅
# - Puedes seguir creando eventos ✅
```

### ✅ Escenario 3: Reiniciar Docker (con datos)
```bash
# 1. Detener Docker
docker-compose -f docker-compose-dev.yml down

# 2. Levantar Docker de nuevo
docker-compose -f docker-compose-dev.yml up -d

# 3. Levantar backend
cd BackEnd/quarkus-api
./mvnw compile quarkus:dev

# 4. Resultado:
# - Datos SE MANTIENEN (gracias al volumen de Docker) ✅
```

---

## 🗑️ ¿Cómo eliminar datos si quiero empezar limpio?

### Opción 1: Borrar volumen de Docker (MÁS LIMPIO)
```powershell
# Detener y eliminar volúmenes
docker-compose -f docker-compose-dev.yml down -v

# Levantar de nuevo (BD completamente vacía)
docker-compose -f docker-compose-dev.yml up -d
```

### Opción 2: Ejecutar SQL manualmente
```sql
-- Conectar a Oracle
-- Usuario: datum_user
-- Password: datum2025

-- Borrar datos de todas las tablas
DELETE FROM Gasto;
DELETE FROM Evento;
DELETE FROM Empleado;
-- ... otras tablas

COMMIT;
```

### Opción 3: Cambiar temporalmente a `drop-and-create`
```properties
# En application.properties (SOLO UNA VEZ)
quarkus.hibernate-orm.database.generation=drop-and-create

# Levantar backend (borra y recrea)
# Luego VOLVER a cambiar a:
quarkus.hibernate-orm.database.generation=update
```

---

## 📊 Comparación de Configuraciones

| Configuración | Mantiene Datos | Crea Tablas | Modifica Esquema | Uso |
|---------------|----------------|-------------|------------------|-----|
| `drop-and-create` | ❌ No | ✅ Sí | ✅ Sí | Solo desarrollo inicial |
| `update` | ✅ Sí | ✅ Sí | ⚠️ Parcial | **Desarrollo** (ACTUAL) |
| `validate` | ✅ Sí | ❌ No | ❌ No | Producción |
| `none` | ✅ Sí | ❌ No | ❌ No | Producción con migraciones |

---

## 🎯 Insertar Datos Iniciales (Solo Primera Vez)

Si necesitas datos de prueba **una sola vez**:

### Opción A: Ejecutar SQL manualmente
```sql
-- Conectar a Oracle y ejecutar:
INSERT INTO Empleado (id_empleado, nombre_completo, email, departamento, password_hash)
VALUES (1, 'Carlos Martínez', 'carlos@datum.com', 'IT', '$2a$10$...');

INSERT INTO Evento (id_empleado, nombre_evento, fecha_registro, estado)
VALUES (1, 'CONFERENCIA TECH 2025', SYSDATE, 'activo');

COMMIT;
```

### Opción B: Usar import.sql temporalmente
```properties
# En application.properties, cambiar temporalmente:
quarkus.hibernate-orm.sql-load-script=import.sql

# Levantar backend UNA VEZ (inserta datos)
# Luego VOLVER a:
quarkus.hibernate-orm.sql-load-script=no-file
```

---

## ⚠️ Advertencias Importantes

### 1. No uses `drop-and-create` en producción
```properties
# ❌ NUNCA en producción
quarkus.hibernate-orm.database.generation=drop-and-create

# ✅ En producción usar:
quarkus.hibernate-orm.database.generation=validate
```

### 2. `update` no es perfecto
- No elimina columnas antiguas
- No modifica tipos de datos
- Para cambios grandes, usa migraciones (Flyway/Liquibase)

### 3. Docker volumes persisten datos
```yaml
# En docker-compose-dev.yml
volumes:
  datum_db_data:  # ← Este volumen PERSISTE entre reinicios
```

Para **borrar completamente**:
```powershell
docker-compose -f docker-compose-dev.yml down -v
```

---

## 🔍 Verificar Persistencia

### Test de persistencia:
1. Levantar backend
2. Crear un evento desde frontend: "EVENTO DE PRUEBA"
3. Detener backend (Ctrl+C)
4. Levantar backend de nuevo
5. Ir al frontend → **Debería aparecer "EVENTO DE PRUEBA"** ✅

### Verificar en BD:
```sql
SELECT * FROM Evento ORDER BY fecha_registro DESC;
```

---

## 📝 Resumen de Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `application.properties` | `drop-and-create` → `update` |
| `application.properties` | `import.sql` → `no-file` |

---

## ✅ Checklist de Verificación

- [x] `database.generation=update`
- [x] `sql-load-script=no-file`
- [ ] Reiniciar backend y verificar que mantiene datos
- [ ] Crear evento desde frontend
- [ ] Reiniciar backend
- [ ] Verificar que el evento sigue ahí

---

## 🆘 Si tienes problemas

### Problema: "Tablas no existen"
**Solución:**
```properties
# Asegúrate de tener:
quarkus.hibernate-orm.database.generation=update
```

### Problema: "Sigue borrando datos"
**Solución:**
1. Verifica que NO diga `drop-and-create`
2. Reinicia Quarkus completamente
3. Verifica logs al iniciar

### Problema: "Quiero empezar limpio"
**Solución:**
```powershell
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d
```

---

**✨ Ahora tus datos persisten entre reinicios!**
