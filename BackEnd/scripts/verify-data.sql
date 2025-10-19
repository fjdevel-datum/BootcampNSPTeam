SELECT COUNT(*) AS total_empleados FROM Empleado;
SELECT COUNT(*) AS total_usuarios FROM Usuario;
SELECT COUNT(*) AS total_eventos FROM Evento;

SELECT e.id_empleado, e.nombre, e.apellido, c.nombre AS cargo, d.nombre_depart
FROM Empleado e
LEFT JOIN Cargo c ON e.id_cargo = c.id_cargo
LEFT JOIN Departamento d ON e.id_departamento = d.id_departamento;

EXIT;
