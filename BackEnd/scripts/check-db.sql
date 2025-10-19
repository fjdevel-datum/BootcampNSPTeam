-- Verificar datos en la base de datos
SET PAGESIZE 100
SET LINESIZE 200

SELECT '=== USUARIOS ===' AS INFO FROM DUAL;
SELECT * FROM "Usuario";

SELECT '=== EMPLEADOS ===' AS INFO FROM DUAL;
SELECT * FROM "Empleado";

EXIT;
