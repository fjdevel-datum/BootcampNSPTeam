-- ════════════════════════════════════════════════════════════════════════
-- Script de Verificación y Datos de Prueba
-- Para: Integración GET /api/eventos
-- ════════════════════════════════════════════════════════════════════════

-- 1. VERIFICAR EMPLEADO CON ID=1
SELECT 
    id_empleado,
    nombre_completo,
    email,
    departamento
FROM Empleado
WHERE id_empleado = 1;

-- Si no existe, crear un empleado de prueba:
-- INSERT INTO Empleado (id_empleado, nombre_completo, email, departamento, password_hash)
-- VALUES (1, 'Carlos Martínez', 'carlos.martinez@datum.com', 'IT', 'hash_temporal');

-- ═══════════════════════════════════════════════════════════════════════

-- 2. VERIFICAR EVENTOS DEL EMPLEADO ID=1
SELECT 
    id_evento,
    id_empleado,
    nombre_evento,
    TO_CHAR(fecha_registro, 'DD/MM/YYYY') AS fecha_registro,
    estado
FROM Evento
WHERE id_empleado = 1
ORDER BY fecha_registro DESC;

-- ═══════════════════════════════════════════════════════════════════════

-- 3. SI NO HAY EVENTOS, INSERTAR DATOS DE PRUEBA
-- Descomenta las siguientes líneas si necesitas datos de prueba:

/*
INSERT INTO Evento (id_empleado, nombre_evento, fecha_registro, estado)
VALUES (1, 'CONFERENCIA TECH 2025', SYSDATE, 'activo');

INSERT INTO Evento (id_empleado, nombre_evento, fecha_registro, estado)
VALUES (1, 'VIAJE PANAMA', SYSDATE - 5, 'completado');

INSERT INTO Evento (id_empleado, nombre_evento, fecha_registro, estado)
VALUES (1, 'REUNION GUATEMALA', SYSDATE - 10, 'activo');

COMMIT;
*/

-- ═══════════════════════════════════════════════════════════════════════

-- 4. VERIFICAR OTROS EMPLEADOS (para probar cambio de ID_EMPLEADO_SIMULADO)
SELECT 
    id_empleado,
    nombre_completo,
    COUNT(*) AS total_eventos
FROM Empleado e
LEFT JOIN Evento ev ON e.id_empleado = ev.id_empleado
GROUP BY e.id_empleado, e.nombre_completo
ORDER BY e.id_empleado;

-- ═══════════════════════════════════════════════════════════════════════

-- 5. FORMATO ESPERADO POR EL FRONTEND
-- Esta consulta muestra exactamente lo que retorna el backend:
SELECT 
    e.id_evento AS "idEvento",
    e.id_empleado AS "idEmpleado",
    e.nombre_evento AS "nombreEvento",
    TO_CHAR(e.fecha_registro, 'DD/MM/YYYY') AS "fechaRegistro",
    e.estado AS "estado",
    emp.nombre_completo AS "nombreEmpleado"
FROM Evento e
LEFT JOIN Empleado emp ON e.id_empleado = emp.id_empleado
WHERE e.id_empleado = 1
ORDER BY e.fecha_registro DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- RESULTADO ESPERADO (ejemplo):
-- ═══════════════════════════════════════════════════════════════════════
-- idEvento | idEmpleado | nombreEvento          | fechaRegistro | estado | nombreEmpleado
-- ---------|------------|----------------------|---------------|--------|------------------
-- 1        | 1          | CONFERENCIA TECH 2025 | 23/10/2025    | activo | Carlos Martínez
-- 2        | 1          | VIAJE PANAMA          | 18/10/2025    | completado | Carlos Martínez
-- ═══════════════════════════════════════════════════════════════════════
