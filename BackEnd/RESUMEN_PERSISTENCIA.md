# ✅ SOLUCIÓN APLICADA - Persistencia de Datos

## 📋 Resumen

Se modificó la configuración de Hibernate para que **los datos persistan** entre reinicios del backend y Docker.

---

## 🔧 Cambios Realizados

### 1. **application.properties** (MODIFICADO)

**Archivo:** `BackEnd/quarkus-api/src/main/resources/application.properties`

#### ANTES:
```properties
quarkus.hibernate-orm.database.generation=drop-and-create  # ❌ Borraba datos
quarkus.hibernate-orm.sql-load-script=import.sql           # ❌ Insertaba siempre
```

#### AHORA:
```properties
quarkus.hibernate-orm.database.generation=update    # ✅ Mantiene datos
quarkus.hibernate-orm.sql-load-script=no-file       # ✅ No inserta automáticamente
```

---

### 2. **import.sql** (RENOMBRADO)

**Archivo original:** `import.sql`  
**Nuevo nombre:** `import.sql.backup`

**Motivo:** Evitar que se ejecute automáticamente

---

## ✨ Resultado

### ✅ Ahora:
- Los datos **NO se borran** al reiniciar backend
- Los datos **NO se borran** al reiniciar Docker
- Los eventos creados desde frontend **SE MANTIENEN**
- NO se insertan datos automáticamente
- BD empieza **vacía** (lista para tus pruebas)

### ❌ Antes:
- Se borraban TODOS los datos al reiniciar
- Se insertaban datos de prueba siempre
- Perdías eventos creados desde frontend

---

## 📂 Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `SOLUCION_PERSISTENCIA_DATOS.md` | Documentación completa de la solución |
| `README_IMPORT_SQL.md` | Explicación de datos originales |
| `datos-minimos-prueba.sql` | Script para insertar datos mínimos manualmente |
| `RESUMEN_PERSISTENCIA.md` | Este archivo - resumen ejecutivo |

---

## 🚀 Cómo Usar

### Primera Vez (BD Vacía)

```powershell
# 1. Levantar Docker
docker-compose -f docker-compose-dev.yml up -d

# 2. Levantar Backend
cd BackEnd/quarkus-api
./mvnw compile quarkus:dev

# 3. (OPCIONAL) Insertar datos mínimos
# Conectar a Oracle y ejecutar: scripts/datos-minimos-prueba.sql

# 4. Ir al frontend
# http://localhost:5173
```

---

### Reinicios Posteriores

```powershell
# 1. Reiniciar backend
cd BackEnd/quarkus-api
./mvnw compile quarkus:dev

# ✅ Tus datos siguen ahí!
```

---

## 🗑️ Empezar Limpio

Si quieres borrar TODO y empezar de cero:

```powershell
# Opción 1: Borrar volumen de Docker (RECOMENDADO)
docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml up -d

# Opción 2: Borrar tablas manualmente en SQL
# DELETE FROM Gasto;
# DELETE FROM Evento;
# DELETE FROM Empleado;
# COMMIT;
```

---

## 📊 Comparación

| Aspecto | ANTES (drop-and-create) | AHORA (update) |
|---------|-------------------------|----------------|
| Mantiene datos | ❌ No | ✅ Sí |
| Inserta automáticamente | ✅ Sí (import.sql) | ❌ No |
| Crea tablas nuevas | ✅ Sí | ✅ Sí |
| Eventos del frontend | ❌ Se pierden | ✅ Persisten |
| Requiere datos iniciales | ❌ No (automático) | ⚠️ Opcional (manual) |

---

## 🎯 Datos Mínimos para Probar

Si necesitas datos básicos, ejecuta manualmente:

**Archivo:** `BackEnd/scripts/datos-minimos-prueba.sql`

**Inserta:**
- ✅ 1 Empleado (Carlos Martínez - ID=1)
- ✅ 1 Usuario (cmartinez / admin123)
- ✅ 4 Categorías de Gasto

**NO inserta:**
- ❌ Eventos (créalos desde frontend)
- ❌ Gastos (créalos después)

---

## 🔍 Verificar Persistencia

### Test Rápido:

1. Levantar backend
2. Ir a frontend → Crear evento "PRUEBA PERSISTENCIA"
3. **Detener backend** (Ctrl+C)
4. Volver a levantar backend
5. Ir a frontend → **Debería aparecer "PRUEBA PERSISTENCIA"** ✅

---

## 🆘 Troubleshooting

### ❌ "Tablas no existen"
**Solución:** Verifica que tengas:
```properties
quarkus.hibernate-orm.database.generation=update
```

### ❌ "Sigue borrando datos"
**Solución:** 
1. Verifica que NO diga `drop-and-create`
2. Reinicia completamente el backend
3. Revisa los logs al iniciar

### ❌ "No hay datos iniciales"
**Solución:**
1. Ejecuta `scripts/datos-minimos-prueba.sql` manualmente
2. O crea datos desde el frontend

---

## 📝 Próximos Pasos

1. ✅ Levantar backend con nueva configuración
2. ✅ Verificar que no se insertan datos automáticamente
3. ✅ (Opcional) Ejecutar `datos-minimos-prueba.sql`
4. ✅ Crear eventos desde frontend
5. ✅ Reiniciar backend y verificar persistencia

---

## 📚 Documentación Relacionada

- **Guía completa:** `SOLUCION_PERSISTENCIA_DATOS.md`
- **Datos originales:** `README_IMPORT_SQL.md`
- **Script de datos:** `scripts/datos-minimos-prueba.sql`
- **Backup de datos:** `src/main/resources/import.sql.backup`

---

## ✅ Checklist de Verificación

- [x] `database.generation=update` en application.properties
- [x] `sql-load-script=no-file` en application.properties
- [x] `import.sql` renombrado a `import.sql.backup`
- [x] Scripts de datos mínimos creados
- [x] Documentación completa
- [ ] Probar reinicio de backend (datos persisten)
- [ ] Probar crear evento desde frontend
- [ ] Probar reinicio de Docker (datos persisten)

---

**✨ Configuración completada! Tus datos ahora persisten entre reinicios.**

**Fecha:** 23 de octubre de 2025  
**Branch:** carlos
