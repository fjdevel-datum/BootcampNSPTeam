-- =============================================
-- Verificar si existe columna keycloak_id en Empleado
-- =============================================

SELECT 
    column_name, 
    data_type, 
    data_length,
    nullable
FROM 
    user_tab_columns
WHERE 
    table_name = 'EMPLEADO'
ORDER BY 
    column_id;

-- Si existe la columna keycloak_id, eliminarla:
-- ALTER TABLE Empleado DROP COLUMN keycloak_id;
-- COMMIT;

EXIT;
