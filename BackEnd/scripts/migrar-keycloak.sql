-- Agregar columna keycloak_id
ALTER TABLE Usuario ADD keycloak_id VARCHAR2(100);

-- Agregar constraint de unicidad
ALTER TABLE Usuario ADD CONSTRAINT unique_keycloak_id UNIQUE (keycloak_id);

-- Verificar estructura
SELECT column_name, data_type, data_length, nullable 
FROM user_tab_columns 
WHERE table_name = 'Usuario'
ORDER BY column_id;

EXIT;
