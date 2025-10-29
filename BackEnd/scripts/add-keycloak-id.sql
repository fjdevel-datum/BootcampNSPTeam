-- ============================================
-- Script de Migración: Agregar keycloak_id
-- ============================================

-- 1. Agregar columna keycloak_id a la tabla Usuario
ALTER TABLE "Usuario" ADD "keycloak_id" VARCHAR2(100);

-- 2. Agregar constraint de unicidad (importante para evitar duplicados)
ALTER TABLE "Usuario" ADD CONSTRAINT "unique_keycloak_id" UNIQUE ("keycloak_id");

-- 3. Comentarios para documentación
COMMENT ON COLUMN "Usuario"."keycloak_id" IS 'UUID generado por Keycloak al crear el usuario (ej: 0b2f3672-f3a5-44d8-86b3-ca2d2610e5da)';

-- 4. Verificar la estructura
SELECT column_name, data_type, data_length, nullable 
FROM user_tab_columns 
WHERE table_name = 'Usuario'
ORDER BY column_id;

-- ============================================
-- Ejemplo de vinculación manual (OPCIONAL)
-- ============================================
-- Si ya tienes usuarios creados en Keycloak y quieres vincularlos manualmente:

-- UPDATE "Usuario" 
-- SET "keycloak_id" = '0b2f3672-f3a5-44d8-86b3-ca2d2610e5da'
-- WHERE "usuario_app" = 'carlos.lopez';

-- ============================================
-- Query para verificar usuarios vinculados
-- ============================================
SELECT 
    u.id_usuario,
    u.usuario_app,
    u.keycloak_id,
    e.nombre || ' ' || e.apellido as nombre_completo,
    e.correo
FROM "Usuario" u
LEFT JOIN "Empleado" e ON u.id_empleado = e.id_empleado
ORDER BY u.id_usuario;
