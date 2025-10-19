-- Insertar usuarios con comillas en columna contraseña
INSERT INTO Usuario (id_usuario, usuario_app, "contraseña", id_empleado) VALUES (1, 'cmartinez', 'carlos123', 1);
INSERT INTO Usuario (id_usuario, usuario_app, "contraseña", id_empleado) VALUES (2, 'arodriguez', 'ana123', 2);
INSERT INTO Usuario (id_usuario, usuario_app, "contraseña", id_empleado) VALUES (3, 'lgonzalez', 'luis123', 3);
COMMIT;
EXIT;
