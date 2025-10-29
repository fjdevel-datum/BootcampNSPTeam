-- ============================================
-- Vinculación Manual de Usuarios (OPCIONAL)
-- Solo usar si necesitas migrar usuarios existentes
-- ============================================

-- PASO 1: Obtener los Keycloak IDs desde Keycloak Admin Console
-- PASO 2: Ejecutar estos UPDATEs (ajusta los UUIDs correctos)

-- Ejemplo para carlos.martinez
-- UPDATE Usuario 
-- SET keycloak_id = 'AQUI_VA_EL_UUID_DE_KEYCLOAK'
-- WHERE usuario_app = 'carlos.martinez';

-- Ejemplo para ana.rodriguez
-- UPDATE Usuario 
-- SET keycloak_id = 'AQUI_VA_EL_UUID_DE_KEYCLOAK'
-- WHERE usuario_app = 'ana.rodriguez';

-- COMMIT;

-- ============================================
-- Verificar después de actualizar
-- ============================================
SELECT 
    usuario_app,
    keycloak_id,
    CASE 
        WHEN keycloak_id IS NOT NULL THEN '✓ Vinculado'
        ELSE '✗ Pendiente'
    END as estado
FROM Usuario
ORDER BY id_usuario;

EXIT;
