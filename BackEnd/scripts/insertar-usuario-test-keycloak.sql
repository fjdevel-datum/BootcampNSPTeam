-- ════════════════════════════════════════════════════════════════════════════
-- SCRIPT: Insertar Usuario de Prueba para Keycloak (SIN sobrescribir datos)
-- ════════════════════════════════════════════════════════════════════════════
-- Fecha: 2025-10-25
-- Propósito: Crear usuario 'carlos.test' para integración con Keycloak
-- 
-- CARACTERÍSTICAS:
-- ✅ Verifica si el usuario ya existe antes de insertar
-- ✅ Usa IDs automáticos (SELECT MAX + 1) para no pisar datos existentes
-- ✅ Inserta solo si NO existe
-- ✅ Muestra mensajes informativos
-- 
-- USO:
-- Desde SQL Developer o sqlplus ejecutar todo el script
-- ════════════════════════════════════════════════════════════════════════════

SET SERVEROUTPUT ON;

DECLARE
    v_existe_empleado NUMBER;
    v_existe_usuario NUMBER;
    v_nuevo_id_empleado NUMBER;
    v_nuevo_id_usuario NUMBER;
BEGIN
    -- ════════════════════════════════════════════════════════════════════════
    -- PASO 1: Verificar si ya existe el empleado
    -- ════════════════════════════════════════════════════════════════════════
    SELECT COUNT(*) INTO v_existe_empleado
    FROM Empleado
    WHERE correo = 'carlos.test@datum.com';
    
    IF v_existe_empleado > 0 THEN
        DBMS_OUTPUT.PUT_LINE('⚠️  El empleado carlos.test@datum.com YA EXISTE. Saltando inserción de empleado.');
    ELSE
        -- Calcular el siguiente ID disponible
        SELECT NVL(MAX(id_empleado), 0) + 1 INTO v_nuevo_id_empleado FROM Empleado;
        
        -- Insertar nuevo empleado
        INSERT INTO Empleado (id_empleado, nombre, apellido, correo, telefono)
        VALUES (
            v_nuevo_id_empleado,
            'Carlos',
            'Test',
            'carlos.test@datum.com',
            '9999-0000'
        );
        
        DBMS_OUTPUT.PUT_LINE('✅ Empleado insertado con ID: ' || v_nuevo_id_empleado);
    END IF;
    
    -- ════════════════════════════════════════════════════════════════════════
    -- PASO 2: Verificar si ya existe el usuario
    -- ════════════════════════════════════════════════════════════════════════
    SELECT COUNT(*) INTO v_existe_usuario
    FROM Usuario
    WHERE usuario_app = 'carlos.test';
    
    IF v_existe_usuario > 0 THEN
        DBMS_OUTPUT.PUT_LINE('⚠️  El usuario carlos.test YA EXISTE. Saltando inserción de usuario.');
    ELSE
        -- Obtener el ID del empleado (recién creado o existente)
        SELECT id_empleado INTO v_nuevo_id_empleado
        FROM Empleado
        WHERE correo = 'carlos.test@datum.com';
        
        -- Calcular el siguiente ID de usuario disponible
        SELECT NVL(MAX(id_usuario), 0) + 1 INTO v_nuevo_id_usuario FROM Usuario;
        
        -- Insertar nuevo usuario
        INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado)
        VALUES (
            v_nuevo_id_usuario,
            'carlos.test',
            'KEYCLOAK_AUTH',  -- Contraseña dummy (no se usa, Keycloak la valida)
            v_nuevo_id_empleado
        );
        
        DBMS_OUTPUT.PUT_LINE('✅ Usuario insertado con ID: ' || v_nuevo_id_usuario || ' vinculado al empleado ID: ' || v_nuevo_id_empleado);
    END IF;
    
    -- ════════════════════════════════════════════════════════════════════════
    -- PASO 3: Confirmar cambios
    -- ════════════════════════════════════════════════════════════════════════
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('✅ COMMIT ejecutado correctamente.');
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('❌ ERROR: ' || SQLERRM);
        DBMS_OUTPUT.PUT_LINE('❌ ROLLBACK ejecutado. No se insertaron datos.');
        RAISE;
END;
/

-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN FINAL: Mostrar datos insertados
-- ════════════════════════════════════════════════════════════════════════════

PROMPT
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT 📊 VERIFICACIÓN DE DATOS INSERTADOS
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT

SELECT 
    'Empleado' AS TIPO,
    TO_CHAR(id_empleado) AS ID,
    nombre || ' ' || apellido AS NOMBRE_COMPLETO,
    correo AS INFO
FROM Empleado
WHERE correo = 'carlos.test@datum.com'
UNION ALL
SELECT 
    'Usuario' AS TIPO,
    TO_CHAR(u.id_usuario) AS ID,
    u.usuario_app AS NOMBRE_COMPLETO,
    'Vinculado a empleado ID: ' || u.id_empleado AS INFO
FROM Usuario u
WHERE u.usuario_app = 'carlos.test';

PROMPT
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT ✅ SCRIPT COMPLETADO
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT
PROMPT 🔑 Credenciales de prueba:
PROMPT    Usuario: carlos.test
PROMPT    Password: test123 (configurado en Keycloak)
PROMPT
PROMPT 🧪 Probar login:
PROMPT    POST http://localhost:8081/api/auth/login
PROMPT    Body: {"usuarioApp":"carlos.test","contrasena":"test123"}
PROMPT
PROMPT ════════════════════════════════════════════════════════════════════════
