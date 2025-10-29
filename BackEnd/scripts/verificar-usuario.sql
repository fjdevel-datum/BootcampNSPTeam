-- Verificar estructura completa de la tabla Usuario
SET LINESIZE 200
SET PAGESIZE 100
COLUMN column_name FORMAT A20
COLUMN data_type FORMAT A15
COLUMN nullable FORMAT A8

SELECT 
    column_name, 
    data_type, 
    data_length,
    nullable
FROM user_tab_columns 
WHERE table_name = 'Usuario'
ORDER BY column_id;

-- Verificar constraints
SELECT constraint_name, constraint_type, search_condition
FROM user_constraints
WHERE table_name = 'Usuario';

-- Ver datos actuales
SELECT id_usuario, usuario_app, keycloak_id, id_empleado
FROM Usuario;

EXIT;
