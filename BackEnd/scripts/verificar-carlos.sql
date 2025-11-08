-- Verificar si el usuario carlos.martinez existe
SELECT 
    id_usuario,
    usuario_app,
    keycloak_id,
    id_empleado
FROM Usuario
WHERE usuario_app = 'carlos.martinez';

EXIT;
