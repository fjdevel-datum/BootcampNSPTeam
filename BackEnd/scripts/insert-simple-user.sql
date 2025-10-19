-- Script SUPER SIMPLE - Solo inserta el usuario de prueba
-- Sin dependencias de otras tablas

-- Primero verificamos si existe la tabla Usuario
SELECT 'Tabla Usuario existe' AS INFO FROM USER_TABLES WHERE TABLE_NAME = 'Usuario';

-- Eliminar usuario si existe
DELETE FROM "Usuario" WHERE "usuario_app" = 'cmartinez';

-- Insertar directamente (sin FK por ahora)
INSERT INTO "Usuario" ("usuario_app", "contraseña", "id_empleado") 
VALUES ('cmartinez', 'carlos123', NULL);

COMMIT;

-- Verificar
SELECT * FROM "Usuario";

EXIT;
