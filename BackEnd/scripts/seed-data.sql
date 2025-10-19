-- ========================================
-- SEED DATA PARA DATUM TRAVELS
-- Base de datos: Oracle XE (datum_user/datum2025)
-- Conexión: jdbc:oracle:thin:@localhost:1521/XEPDB1
-- ========================================

-- Limpiar datos existentes (opcional, solo en desarrollo)
-- DELETE FROM Usuario;
-- DELETE FROM Empleado;
-- DELETE FROM Cargo;
-- DELETE FROM Departamento;
-- DELETE FROM Empresa;
-- DELETE FROM Pais;

-- ========================================
-- 1. PAÍSES
-- ========================================
INSERT INTO Pais (id_pais, nombre_pais) VALUES (1, 'El Salvador');
INSERT INTO Pais (id_pais, nombre_pais) VALUES (2, 'Guatemala');
INSERT INTO Pais (id_pais, nombre_pais) VALUES (3, 'Honduras');

-- ========================================
-- 2. EMPRESA
-- ========================================
INSERT INTO Empresa (id_empresa, nombre_empresa, num_registro_tributario, NRC, id_pais)
VALUES (1, 'DATUM El Salvador', '0614-010188-101-5', '123456-7', 1);

-- ========================================
-- 3. DEPARTAMENTOS
-- ========================================
INSERT INTO Departamento (id_departamento, nombre_depart, descripcion)
VALUES (1, 'Tecnología', 'Departamento de desarrollo de software');

INSERT INTO Departamento (id_departamento, nombre_depart, descripcion)
VALUES (2, 'Ventas', 'Departamento comercial');

INSERT INTO Departamento (id_departamento, nombre_depart, descripcion)
VALUES (3, 'Recursos Humanos', 'Gestión de talento humano');

-- ========================================
-- 4. CARGOS
-- ========================================
INSERT INTO Cargo (id_cargo, nombre, descripcion)
VALUES (1, 'Gerente de Tecnología', 'Responsable del área de TI');

INSERT INTO Cargo (id_cargo, nombre, descripcion)
VALUES (2, 'Desarrollador Senior', 'Programador con más de 5 años de experiencia');

INSERT INTO Cargo (id_cargo, nombre, descripcion)
VALUES (3, 'Analista de Ventas', 'Responsable de análisis comercial');

-- ========================================
-- 5. EMPLEADOS
-- ========================================
-- Empleado 1: Carlos (Gerente de TI)
INSERT INTO Empleado (id_empleado, nombre, apellido, correo, telefono, id_cargo, id_departamento, id_empresa)
VALUES (1, 'Carlos', 'Martínez', 'carlos.martinez@datum.com', '7890-1234', 1, 1, 1);

-- Empleado 2: Ana (Desarrolladora)
INSERT INTO Empleado (id_empleado, nombre, apellido, correo, telefono, id_cargo, id_departamento, id_empresa)
VALUES (2, 'Ana', 'Rodríguez', 'ana.rodriguez@datum.com', '7890-5678', 2, 1, 1);

-- Empleado 3: Luis (Analista de Ventas)
INSERT INTO Empleado (id_empleado, nombre, apellido, correo, telefono, id_cargo, id_departamento, id_empresa)
VALUES (3, 'Luis', 'González', 'luis.gonzalez@datum.com', '7890-9012', 3, 2, 1);

-- ========================================
-- 6. USUARIOS (para autenticación)
-- ========================================
-- Usuario para Carlos (contraseña: carlos123)
INSERT INTO Usuario (id_usuario, usuario_app, "contraseña", id_empleado)
VALUES (1, 'cmartinez', 'carlos123', 1);

-- Usuario para Ana (contraseña: ana123)
INSERT INTO Usuario (id_usuario, usuario_app, "contraseña", id_empleado)
VALUES (2, 'arodriguez', 'ana123', 2);

-- Usuario para Luis (contraseña: luis123)
INSERT INTO Usuario (id_usuario, usuario_app, "contraseña", id_empleado)
VALUES (3, 'lgonzalez', 'luis123', 3);

-- ========================================
-- 7. CATEGORÍAS DE GASTO
-- ========================================
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (1, 'Transporte');
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (2, 'Alojamiento');
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (3, 'Alimentación');
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (4, 'Representación');
INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) VALUES (5, 'Otros');

-- ========================================
-- 8. EVENTO DE PRUEBA (opcional)
-- ========================================
INSERT INTO Evento (id_evento, nombre_evento, fecha_registro, destino, estado, id_empleado)
VALUES (1, 'Conferencia Tecnológica 2025', SYSDATE, 'San Salvador', 'activo', 1);

COMMIT;

-- ========================================
-- VERIFICACIÓN DE DATOS
-- ========================================
-- SELECT * FROM Pais;
-- SELECT * FROM Empresa;
-- SELECT * FROM Departamento;
-- SELECT * FROM Cargo;
-- SELECT e.*, c.nombre AS cargo_nombre, d.nombre_depart FROM Empleado e
--   LEFT JOIN Cargo c ON e.id_cargo = c.id_cargo
--   LEFT JOIN Departamento d ON e.id_departamento = d.id_departamento;
-- SELECT u.*, e.nombre, e.apellido FROM Usuario u
--   LEFT JOIN Empleado e ON u.id_empleado = e.id_empleado;
-- SELECT * FROM Categoria_Gasto;
-- SELECT * FROM Evento;
