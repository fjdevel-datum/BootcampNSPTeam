-- ═══════════════════════════════════════════════════════════
-- DATOS DE PRUEBA - Se ejecuta automáticamente al iniciar
-- ═══════════════════════════════════════════════════════════

-- País
INSERT INTO Pais (id_pais, nombre_pais) VALUES (1, 'El Salvador');
INSERT INTO Pais (id_pais, nombre_pais) VALUES (2, 'Guatemala');
INSERT INTO Pais (id_pais, nombre_pais) VALUES (3, 'Honduras');

-- Empresa
INSERT INTO Empresa (id_empresa, id_pais, NRC, num_registro_tributario, nombre_empresa) VALUES (1, 1, '123456-7', '0614-123456-001-1', 'Datum Red Soft');

-- Departamento
INSERT INTO Departamento (id_departamento, nombre_depart, descripcion) VALUES (1, 'Tecnología', 'Departamento de TI');
INSERT INTO Departamento (id_departamento, nombre_depart, descripcion) VALUES (2, 'Recursos Humanos', 'Gestión de personal');
INSERT INTO Departamento (id_departamento, nombre_depart, descripcion) VALUES (3, 'Finanzas', 'Control financiero');

-- Cargo
INSERT INTO Cargo (id_cargo, nombre, descripcion) VALUES (1, 'Gerente de Tecnología', 'Responsable del área de tecnología');
INSERT INTO Cargo (id_cargo, nombre, descripcion) VALUES (2, 'Analista de RRHH', 'Gestión de recursos humanos');
INSERT INTO Cargo (id_cargo, nombre, descripcion) VALUES (3, 'Contador Senior', 'Responsable contable');

-- Empleado
INSERT INTO Empleado (id_empleado, nombre, apellido, correo, id_cargo, id_departamento, id_empresa, telefono) VALUES (1, 'Carlos', 'Martínez', 'cmartinez@datumtravels.com', 1, 1, 1, '2222-1111');
INSERT INTO Empleado (id_empleado, nombre, apellido, correo, id_cargo, id_departamento, id_empresa, telefono) VALUES (2, 'Ana', 'Rodríguez', 'arodriguez@datumtravels.com', 2, 2, 1, '2222-2222');
INSERT INTO Empleado (id_empleado, nombre, apellido, correo, id_cargo, id_departamento, id_empresa, telefono) VALUES (3, 'Luis', 'González', 'lgonzalez@datumtravels.com', 3, 3, 1, '2222-3333');

-- Usuario (LO MÁS IMPORTANTE)
INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado) VALUES (1, 'cmartinez', 'carlos123', 1);
INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado) VALUES (2, 'arodriguez', 'ana123', 2);
INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado) VALUES (3, 'lgonzalez', 'luis123', 3);

-- Categoria_Gasto
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (1, 'Transporte');
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (2, 'Alimentación');
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (3, 'Hospedaje');
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (4, 'Representación');

-- Evento de prueba
INSERT INTO Evento (id_evento, id_empleado, nombre_evento, fecha_registro, estado) VALUES (1, 1, 'Conferencia Tech 2025', SYSDATE, 'activo');
