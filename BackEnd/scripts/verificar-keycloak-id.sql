-- Verificar si la columna keycloak_id existe y tiene datos
SELECT 
    column_name, 
    data_type, 
    nullable
FROM 
    user_tab_columns
WHERE 
    table_name = 'EMPLEADO'
    AND column_name = 'KEYCLOAK_ID';

-- Ver empleados y sus keycloak_id
SELECT 
    id_empleado,
    nombre,
    apellido,
    correo,
    keycloak_id
FROM 
    Empleado
ORDER BY 
    id_empleado;
