-- Verificar usuarios sincronizados con Keycloak
SET LINESIZE 200
SET PAGESIZE 100
COLUMN usuario_app FORMAT A20
COLUMN keycloak_id FORMAT A40
COLUMN nombre_completo FORMAT A25
COLUMN correo FORMAT A30

SELECT 
    u.id_usuario,
    u.usuario_app,
    u.keycloak_id,
    e.nombre || ' ' || e.apellido as nombre_completo,
    e.correo,
    CASE 
        WHEN u.keycloak_id IS NOT NULL THEN 'SINCRONIZADO'
        ELSE 'PENDIENTE'
    END as estado
FROM Usuario u
LEFT JOIN Empleado e ON u.id_empleado = e.id_empleado
ORDER BY u.id_usuario;

EXIT;
