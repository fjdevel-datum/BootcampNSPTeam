-- =============================================
-- Script: ELIMINAR columna keycloak_id de Empleado
-- =============================================
-- ⚠️ IMPORTANTE: Esta columna NO es necesaria
-- La vinculación Keycloak ↔ Empleado se hace mediante:
--   Keycloak → Usuario.keycloak_id → Usuario.id_empleado → Empleado
-- =============================================

-- 1. Verificar si existe la columna
SELECT 
    table_name,
    column_name, 
    data_type
FROM 
    user_tab_columns
WHERE 
    table_name = 'EMPLEADO'
    AND column_name = 'KEYCLOAK_ID';

-- 2. Eliminar índice si existe
BEGIN
    EXECUTE IMMEDIATE 'DROP INDEX idx_empleado_keycloak_id';
    DBMS_OUTPUT.PUT_LINE('✓ Índice eliminado');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1418 THEN -- ORA-01418: specified index does not exist
            RAISE;
        END IF;
        DBMS_OUTPUT.PUT_LINE('ℹ Índice no existía');
END;
/

-- 3. Eliminar columna keycloak_id de Empleado
ALTER TABLE Empleado DROP COLUMN keycloak_id;

COMMIT;

-- 4. Verificar que se eliminó
SELECT 
    column_name
FROM 
    user_tab_columns
WHERE 
    table_name = 'EMPLEADO'
    AND column_name = 'KEYCLOAK_ID';

-- Debería retornar 0 filas

-- 5. Confirmar estructura correcta de Empleado
SELECT 
    column_name, 
    data_type,
    data_length
FROM 
    user_tab_columns
WHERE 
    table_name = 'EMPLEADO'
ORDER BY 
    column_id;

EXIT;
