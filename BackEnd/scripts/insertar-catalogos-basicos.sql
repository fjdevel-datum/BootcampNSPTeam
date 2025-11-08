-- Script para insertar datos de ejemplo en Departamento, Cargo y Empresa
-- Ejecutar después de tener la estructura de BD creada

-- Insertar Departamentos
INSERT INTO Departamento (nombre_depart, descripcion) VALUES ('Tecnología', 'Departamento de TI y Desarrollo');
INSERT INTO Departamento (nombre_depart, descripcion) VALUES ('Recursos Humanos', 'Gestión de personal');
INSERT INTO Departamento (nombre_depart, descripcion) VALUES ('Finanzas', 'Contabilidad y finanzas');
INSERT INTO Departamento (nombre_depart, descripcion) VALUES ('Ventas', 'Equipo comercial');
INSERT INTO Departamento (nombre_depart, descripcion) VALUES ('Marketing', 'Publicidad y comunicación');

-- Insertar Cargos
INSERT INTO Cargo (nombre, descripcion) VALUES ('Desarrollador', 'Desarrollador de software');
INSERT INTO Cargo (nombre, descripcion) VALUES ('Gerente', 'Gerente de área');
INSERT INTO Cargo (nombre, descripcion) VALUES ('Analista', 'Analista funcional o técnico');
INSERT INTO Cargo (nombre, descripcion) VALUES ('Contador', 'Profesional contable');
INSERT INTO Cargo (nombre, descripcion) VALUES ('Vendedor', 'Ejecutivo de ventas');
INSERT INTO Cargo (nombre, descripcion) VALUES ('Asistente', 'Asistente administrativo');

COMMIT;
