-- ════════════════════════════════════════════════════════════
-- INSERTAR DATOS DE PRUEBA
-- Script para insertar usuarios y empleados de prueba
-- ════════════════════════════════════════════════════════════

-- Limpiar datos existentes de Usuario (por si acaso)
DELETE FROM Usuario;

-- Insertar Usuarios
-- Nota: Las contraseñas están en texto plano por ahora (carlos123, ana123, luis123)
-- En producción deberían estar hasheadas con BCrypt
INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado) 
VALUES (1, 'cmartinez', 'carlos123', 1);

INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado) 
VALUES (2, 'arodriguez', 'ana123', 2);

INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado) 
VALUES (3, 'lgonzalez', 'luis123', 3);

-- Verificar datos insertados
SELECT COUNT(*) as "Total Empleados" FROM Empleado;
SELECT COUNT(*) as "Total Usuarios" FROM Usuario;

-- Mostrar usuario de prueba
SELECT u.id_usuario, u.usuario_app, u.contraseña, u.id_empleado, e.nombre, e.apellido
FROM Usuario u
JOIN Empleado e ON u.id_empleado = e.id_empleado
WHERE u.usuario_app = 'cmartinez';

COMMIT;
