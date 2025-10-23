-- ════════════════════════════════════════════════════════════════════════════
-- Script de Datos Mínimos para Pruebas
-- ════════════════════════════════════════════════════════════════════════════
-- Propósito: Insertar SOLO los datos esenciales para probar la aplicación
-- 
-- Uso:
--   1. Conectar a Oracle con datum_user/datum2025
--   2. Ejecutar este script completo
--   3. Ejecutar COMMIT;
-- 
-- ⚠️ IMPORTANTE: Este script NO se ejecuta automáticamente
--    Debes ejecutarlo MANUALMENTE cuando lo necesites
-- ════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- 1. EMPLEADO DE PRUEBA (ID=1 - Carlos Martínez)
-- ═══════════════════════════════════════════════════════════════════════
-- Este es el empleado usado por AuthSimulation.ID_EMPLEADO_SIMULADO
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO Empleado (id_empleado, nombre, apellido, correo, telefono)
VALUES (1, 'Carlos', 'Martínez', 'cmartinez@datum.com', '2222-1111');

-- ═══════════════════════════════════════════════════════════════════════
-- 2. USUARIO DE PRUEBA (para futuro login)
-- ═══════════════════════════════════════════════════════════════════════
-- Usuario: cmartinez
-- Password: admin123 (hasheado con SHA-256)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado)
VALUES (1, 'cmartinez', 'JAvlGPq9JyTdtvBO6x2llnRI1+gxwIyPqCKAn3THIKk=', 1);

-- ═══════════════════════════════════════════════════════════════════════
-- 3. CATEGORÍAS DE GASTOS (obligatorias para crear gastos)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) 
VALUES (1, 'Transporte');

INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) 
VALUES (2, 'Alimentación');

INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) 
VALUES (3, 'Hospedaje');

INSERT INTO Categoria_Gasto (id_categoria, nombre_categoria) 
VALUES (4, 'Representación');

-- ═══════════════════════════════════════════════════════════════════════
-- 4. EVENTO DE EJEMPLO (OPCIONAL - comentar si no lo necesitas)
-- ═══════════════════════════════════════════════════════════════════════

-- INSERT INTO Evento (id_empleado, nombre_evento, fecha_registro, estado)
-- VALUES (1, 'CONFERENCIA TECH 2025', SYSDATE, 'activo');

-- ═══════════════════════════════════════════════════════════════════════
-- 5. CONFIRMAR CAMBIOS
-- ═══════════════════════════════════════════════════════════════════════

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICAR DATOS INSERTADOS
-- ════════════════════════════════════════════════════════════════════════════

SELECT 'Empleados insertados:' AS descripcion, COUNT(*) AS total FROM Empleado;
SELECT 'Usuarios insertados:' AS descripcion, COUNT(*) AS total FROM Usuario;
SELECT 'Categorías insertadas:' AS descripcion, COUNT(*) AS total FROM Categoria_Gasto;
SELECT 'Eventos insertados:' AS descripcion, COUNT(*) AS total FROM Evento;

-- ════════════════════════════════════════════════════════════════════════════
-- RESULTADO ESPERADO:
-- ════════════════════════════════════════════════════════════════════════════
-- Empleados insertados: 1
-- Usuarios insertados: 1
-- Categorías insertadas: 4
-- Eventos insertados: 0 (o 1 si descomentaste el INSERT)
-- ════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- DATOS INSERTADOS - RESUMEN
-- ═══════════════════════════════════════════════════════════════════════
--
-- ✅ Empleado:
--    - ID: 1
--    - Nombre: Carlos Martínez
--    - Email: cmartinez@datum.com
--
-- ✅ Usuario:
--    - Usuario: cmartinez
--    - Password: admin123
--
-- ✅ Categorías:
--    - Transporte, Alimentación, Hospedaje, Representación
--
-- ═══════════════════════════════════════════════════════════════════════
