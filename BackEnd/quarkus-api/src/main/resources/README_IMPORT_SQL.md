# 📦 Datos de Prueba Originales (import.sql)

## ℹ️ Información

Este archivo fue renombrado de `import.sql` a `import.sql.backup` para **evitar que se inserten datos automáticamente** cada vez que se levanta el backend.

---

## 🗄️ Datos que se insertaban automáticamente

### 1. **Países** (3 registros)
```sql
- El Salvador (ID: 1)
- Guatemala (ID: 2)
- Honduras (ID: 3)
```

### 2. **Empresa** (1 registro)
```sql
- Datum Red Soft (ID: 1)
  - País: El Salvador
  - NRC: 123456-7
  - Registro Tributario: 0614-123456-001-1
```

### 3. **Departamentos** (3 registros)
```sql
- Tecnología (ID: 1)
- Recursos Humanos (ID: 2)
- Finanzas (ID: 3)
```

### 4. **Cargos** (3 registros)
```sql
- Gerente de Tecnología (ID: 1)
- Analista de RRHH (ID: 2)
- Contador Senior (ID: 3)
```

### 5. **Empleados** (3 registros)

| ID | Nombre | Email | Cargo | Departamento |
|----|--------|-------|-------|--------------|
| 1 | Carlos Martínez | cmartinez@datumtravels.com | Gerente TI | Tecnología |
| 2 | Ana Rodríguez | arodriguez@datumtravels.com | Analista RRHH | RRHH |
| 3 | Luis González | lgonzalez@datumtravels.com | Contador Senior | Finanzas |

### 6. **Usuarios** (3 registros)

| ID | Usuario | Password | Empleado |
|----|---------|----------|----------|
| 1 | cmartinez | admin123 | Carlos Martínez |
| 2 | arodriguez | admin123 | Ana Rodríguez |
| 3 | lgonzalez | admin123 | Luis González |

**Nota:** Todas las contraseñas son `admin123` (hasheadas en SHA-256)

### 7. **Categorías de Gasto** (4 registros)
```sql
- Transporte (ID: 1)
- Alimentación (ID: 2)
- Hospedaje (ID: 3)
- Representación (ID: 4)
```

### 8. **Tarjeta Corporativa** (1 registro)
```sql
- Empleado: Carlos Martínez (ID: 1)
- Banco: Banco Agrícola
- Número: 1234-5678-9012-3456
- Expiración: 31/12/2026
```

### 9. **Evento** (1 registro)
```sql
- Nombre: Conferencia Tech 2025
- Empleado: Carlos Martínez (ID: 1)
- Estado: activo
```

---

## 🔄 ¿Cómo restaurar estos datos?

### Opción A: Ejecutar manualmente en SQL Developer/SQLcl
1. Conectar a Oracle:
   - Usuario: `datum_user`
   - Password: `datum2025`
   - Puerto: `1522`
   - Servicio: `XEPDB1`

2. Abrir el archivo: `import.sql.backup`

3. Ejecutar el SQL completo

4. Hacer `COMMIT;`

---

### Opción B: Reactivar import.sql temporalmente

**1. Renombrar de nuevo:**
```powershell
cd BackEnd/quarkus-api/src/main/resources
mv import.sql.backup import.sql
```

**2. Configurar en `application.properties`:**
```properties
quarkus.hibernate-orm.database.generation=drop-and-create
quarkus.hibernate-orm.sql-load-script=import.sql
```

**3. Levantar backend UNA VEZ:**
```powershell
cd BackEnd/quarkus-api
./mvnw compile quarkus:dev
```

**4. VOLVER a la configuración persistente:**

En `application.properties`:
```properties
quarkus.hibernate-orm.database.generation=update
quarkus.hibernate-orm.sql-load-script=no-file
```

Renombrar de nuevo:
```powershell
mv import.sql import.sql.backup
```

---

## 🎯 Datos Mínimos Recomendados

Si solo necesitas datos básicos para probar:

```sql
-- 1. Empleado de prueba
INSERT INTO Empleado (id_empleado, nombre, apellido, correo, telefono)
VALUES (1, 'Carlos', 'Martínez', 'cmartinez@datum.com', '2222-1111');

-- 2. Usuario de prueba (password: admin123)
INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado)
VALUES (1, 'cmartinez', 'JAvlGPq9JyTdtvBO6x2llnRI1+gxwIyPqCKAn3THIKk=', 1);

-- 3. Categorías básicas
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (1, 'Transporte');
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (2, 'Alimentación');
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (3, 'Hospedaje');

-- 4. Evento de prueba (opcional)
INSERT INTO Evento (id_empleado, nombre_evento, fecha_registro, estado)
VALUES (1, 'EVENTO DE PRUEBA', SYSDATE, 'activo');

COMMIT;
```

---

## 📝 Estructura de Archivos

```
BackEnd/quarkus-api/src/main/resources/
├── application.properties          ← Configuración principal
├── import.sql.backup              ← Datos originales (INACTIVO)
└── README_IMPORT_SQL.md           ← Este archivo
```

---

## ⚠️ Notas Importantes

1. **No renombrar a `import.sql`** a menos que quieras que se ejecute automáticamente

2. **El archivo se ejecuta solo si:**
   - Se llama exactamente `import.sql`
   - `database.generation` != `none`
   - `sql-load-script` apunta a él

3. **Configuración actual:**
   ```properties
   sql-load-script=no-file  # ← No ejecuta ningún archivo
   ```

4. **Para datos permanentes:**
   - Mejor ejecutarlos manualmente en SQL
   - Usar scripts de migración (Flyway/Liquibase) en producción

---

## ✅ Estado Actual

- ✅ `import.sql` renombrado a `import.sql.backup`
- ✅ No se insertan datos automáticamente
- ✅ Los datos creados desde frontend persisten
- ✅ El archivo backup está disponible como referencia

---

**📌 Archivo de referencia:** `import.sql.backup`  
**📌 Documentación:** `SOLUCION_PERSISTENCIA_DATOS.md`
