-- =============================================
-- Script: Vincular Usuario con Keycloak
-- =============================================
-- Propósito: Agregar keycloak_id a usuarios existentes
-- 
-- PASOS PREVIOS:
-- 1. Obtener el keycloak_id desde Keycloak Admin Console
--    - Ir a: http://localhost:8080/admin/master/console/#/datum-travels/users
--    - Buscar el usuario
--    - Copiar el UUID desde la URL o detalles del usuario
-- 
-- 2. Ejecutar este script con el UUID correcto
-- =============================================

-- Ver estado actual de usuarios
SELECT 
    id_usuario,
    id_empleado,
    usuario_app,
    keycloak_id,
    CASE 
        WHEN keycloak_id IS NOT NULL THEN '✓ Vinculado'
        ELSE '✗ Sin vincular'
    END as estado
FROM Usuario
ORDER BY id_usuario;

-- =============================================
-- ACTUALIZACIÓN MANUAL (reemplaza con UUID real de Keycloak)
-- =============================================

-- Ejemplo: Usuario cmartinez
-- UPDATE Usuario 
-- SET keycloak_id = 'AQUI_VA_EL_UUID_COMPLETO_DE_KEYCLOAK'
-- WHERE usuario_app = 'cmartinez';

-- COMMIT;

-- =============================================
-- VERIFICAR DESPUÉS DE ACTUALIZAR
-- =============================================

-- SELECT 
--     u.id_usuario,
--     u.usuario_app,
--     u.keycloak_id,
--     e.nombre || ' ' || e.apellido as nombre_empleado,
--     e.correo
-- FROM Usuario u
-- LEFT JOIN Empleado e ON u.id_empleado = e.id_empleado
-- ORDER BY u.id_usuario;

EXIT;
