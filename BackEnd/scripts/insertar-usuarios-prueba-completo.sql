-- ════════════════════════════════════════════════════════════════════════════
-- SCRIPT: Insertar Usuarios de Prueba Completos (Oracle + Keycloak)
-- ════════════════════════════════════════════════════════════════════════════
-- Fecha: 2025-10-25
-- Propósito: Crear conjunto completo de usuarios de prueba para desarrollo
-- 
-- USUARIOS CREADOS:
-- ┌──────────────────┬──────────────────┬──────────┬─────────────────────┐
-- │ Usuario          │ Contraseña       │ Rol      │ Descripción         │
-- ├──────────────────┼──────────────────┼──────────┼─────────────────────┤
-- │ carlos.test      │ test123          │ Empleado │ Usuario básico      │
-- │ maria.contador   │ contador123      │ contador │ Personal contable   │
-- │ juan.gerente     │ gerente123       │ gerente  │ Gerente de área     │
-- │ admin.datum      │ admin123         │ admin    │ Administrador total │
-- └──────────────────┴──────────────────┴──────────┴─────────────────────┘
--
-- CARACTERÍSTICAS:
-- ✅ Verifica si cada usuario ya existe antes de insertar
-- ✅ Usa IDs automáticos (SELECT MAX + 1)
-- ✅ Inserta Empleado + Usuario vinculados
-- ✅ Manejo de errores con ROLLBACK
-- ✅ Mensajes informativos de progreso
-- 
-- USO:
-- Get-Content "BackEnd/scripts/insertar-usuarios-prueba-completo.sql" | 
--   docker exec -i datum-oracle-dev sqlplus -S datum_user/datum2025@XEPDB1
-- ════════════════════════════════════════════════════════════════════════════

SET SERVEROUTPUT ON;
SET FEEDBACK OFF;

DECLARE
    v_existe_empleado NUMBER;
    v_existe_usuario NUMBER;
    v_id_empleado NUMBER;
    v_id_usuario NUMBER;
    v_nombre VARCHAR2(100);
    v_apellido VARCHAR2(100);
    v_correo VARCHAR2(100);
    v_telefono VARCHAR2(20);
    v_usuario_app VARCHAR2(50);
    
    -- Procedimiento para insertar un usuario completo
    PROCEDURE insertar_usuario_completo(
        p_nombre VARCHAR2,
        p_apellido VARCHAR2,
        p_correo VARCHAR2,
        p_telefono VARCHAR2,
        p_usuario_app VARCHAR2
    ) IS
        v_nuevo_id_empleado NUMBER;
        v_nuevo_id_usuario NUMBER;
        v_existe_emp NUMBER;
        v_existe_usr NUMBER;
    BEGIN
        -- Verificar si el empleado ya existe
        SELECT COUNT(*) INTO v_existe_emp
        FROM Empleado
        WHERE correo = p_correo;
        
        IF v_existe_emp > 0 THEN
            DBMS_OUTPUT.PUT_LINE('   ⚠️  Empleado ' || p_correo || ' ya existe');
            
            -- Obtener el ID del empleado existente
            SELECT id_empleado INTO v_nuevo_id_empleado
            FROM Empleado
            WHERE correo = p_correo;
        ELSE
            -- Calcular siguiente ID de empleado
            SELECT NVL(MAX(id_empleado), 0) + 1 INTO v_nuevo_id_empleado FROM Empleado;
            
            -- Insertar empleado
            INSERT INTO Empleado (id_empleado, nombre, apellido, correo, telefono)
            VALUES (v_nuevo_id_empleado, p_nombre, p_apellido, p_correo, p_telefono);
            
            DBMS_OUTPUT.PUT_LINE('   ✅ Empleado creado: ' || p_nombre || ' ' || p_apellido || ' (ID: ' || v_nuevo_id_empleado || ')');
        END IF;
        
        -- Verificar si el usuario ya existe
        SELECT COUNT(*) INTO v_existe_usr
        FROM Usuario
        WHERE usuario_app = p_usuario_app;
        
        IF v_existe_usr > 0 THEN
            DBMS_OUTPUT.PUT_LINE('   ⚠️  Usuario ' || p_usuario_app || ' ya existe');
        ELSE
            -- Calcular siguiente ID de usuario
            SELECT NVL(MAX(id_usuario), 0) + 1 INTO v_nuevo_id_usuario FROM Usuario;
            
            -- Insertar usuario
            INSERT INTO Usuario (id_usuario, usuario_app, contraseña, id_empleado)
            VALUES (v_nuevo_id_usuario, p_usuario_app, 'KEYCLOAK_AUTH', v_nuevo_id_empleado);
            
            DBMS_OUTPUT.PUT_LINE('   ✅ Usuario creado: ' || p_usuario_app || ' (ID: ' || v_nuevo_id_usuario || ')');
        END IF;
        
        DBMS_OUTPUT.PUT_LINE('');
        
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('   ❌ ERROR al crear usuario ' || p_usuario_app || ': ' || SQLERRM);
            RAISE;
    END insertar_usuario_completo;

BEGIN
    DBMS_OUTPUT.PUT_LINE('════════════════════════════════════════════════════════════════════════');
    DBMS_OUTPUT.PUT_LINE('🔧 CREANDO USUARIOS DE PRUEBA PARA KEYCLOAK');
    DBMS_OUTPUT.PUT_LINE('════════════════════════════════════════════════════════════════════════');
    DBMS_OUTPUT.PUT_LINE('');
    
    -- ════════════════════════════════════════════════════════════════════════
    -- USUARIO 1: carlos.test (Empleado básico)
    -- ════════════════════════════════════════════════════════════════════════
    DBMS_OUTPUT.PUT_LINE('1️⃣  Usuario: carlos.test (Rol: Empleado)');
    insertar_usuario_completo(
        p_nombre => 'Carlos',
        p_apellido => 'Test',
        p_correo => 'carlos.test@datum.com',
        p_telefono => '7777-0001',
        p_usuario_app => 'carlos.test'
    );
    
    -- ════════════════════════════════════════════════════════════════════════
    -- USUARIO 2: maria.contador (Personal de contabilidad)
    -- ════════════════════════════════════════════════════════════════════════
    DBMS_OUTPUT.PUT_LINE('2️⃣  Usuario: maria.contador (Rol: contador)');
    insertar_usuario_completo(
        p_nombre => 'María',
        p_apellido => 'Contador',
        p_correo => 'maria.contador@datum.com',
        p_telefono => '7777-0002',
        p_usuario_app => 'maria.contador'
    );
    
    -- ════════════════════════════════════════════════════════════════════════
    -- USUARIO 3: juan.gerente (Gerente de área)
    -- ════════════════════════════════════════════════════════════════════════
    DBMS_OUTPUT.PUT_LINE('3️⃣  Usuario: juan.gerente (Rol: gerente)');
    insertar_usuario_completo(
        p_nombre => 'Juan',
        p_apellido => 'Gerente',
        p_correo => 'juan.gerente@datum.com',
        p_telefono => '7777-0003',
        p_usuario_app => 'juan.gerente'
    );
    
    -- ════════════════════════════════════════════════════════════════════════
    -- USUARIO 4: admin.datum (Administrador total)
    -- ════════════════════════════════════════════════════════════════════════
    DBMS_OUTPUT.PUT_LINE('4️⃣  Usuario: admin.datum (Rol: admin)');
    insertar_usuario_completo(
        p_nombre => 'Admin',
        p_apellido => 'Datum',
        p_correo => 'admin.datum@datum.com',
        p_telefono => '7777-0000',
        p_usuario_app => 'admin.datum'
    );
    
    -- ════════════════════════════════════════════════════════════════════════
    -- Confirmar cambios
    -- ════════════════════════════════════════════════════════════════════════
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('════════════════════════════════════════════════════════════════════════');
    DBMS_OUTPUT.PUT_LINE('✅ PROCESO COMPLETADO - COMMIT EJECUTADO');
    DBMS_OUTPUT.PUT_LINE('════════════════════════════════════════════════════════════════════════');
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('');
        DBMS_OUTPUT.PUT_LINE('════════════════════════════════════════════════════════════════════════');
        DBMS_OUTPUT.PUT_LINE('❌ ERROR GENERAL: ' || SQLERRM);
        DBMS_OUTPUT.PUT_LINE('❌ ROLLBACK EJECUTADO - No se guardaron cambios');
        DBMS_OUTPUT.PUT_LINE('════════════════════════════════════════════════════════════════════════');
        RAISE;
END;
/

-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN FINAL: Mostrar todos los usuarios creados
-- ════════════════════════════════════════════════════════════════════════════

PROMPT
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT 📊 USUARIOS CREADOS EN LA BASE DE DATOS
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT

COLUMN USUARIO_APP FORMAT A20
COLUMN NOMBRE_COMPLETO FORMAT A30
COLUMN CORREO FORMAT A30
COLUMN TELEFONO FORMAT A15

SELECT 
    u.usuario_app AS "USUARIO_APP",
    e.nombre || ' ' || e.apellido AS "NOMBRE_COMPLETO",
    e.correo AS "CORREO",
    e.telefono AS "TELEFONO"
FROM Usuario u
INNER JOIN Empleado e ON u.id_empleado = e.id_empleado
WHERE u.usuario_app IN ('carlos.test', 'maria.contador', 'juan.gerente', 'admin.datum')
ORDER BY u.id_usuario;

PROMPT
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT 🔑 CREDENCIALES PARA KEYCLOAK (configurar con setup-keycloak-passwords.ps1)
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT
PROMPT Usuario          │ Contraseña    │ Rol        │ Uso
PROMPT ─────────────────┼───────────────┼────────────┼─────────────────────
PROMPT carlos.test      │ test123       │ Empleado   │ Usuario básico
PROMPT maria.contador   │ contador123   │ contador   │ Personal contable
PROMPT juan.gerente     │ gerente123    │ gerente    │ Gerente de área
PROMPT admin.datum      │ admin123      │ admin      │ Administrador
PROMPT
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT 📝 PRÓXIMOS PASOS:
PROMPT ════════════════════════════════════════════════════════════════════════
PROMPT
PROMPT 1. Ejecutar script de Keycloak para configurar contraseñas:
PROMPT    .\setup-keycloak-passwords.ps1
PROMPT
PROMPT 2. Probar login con cualquier usuario:
PROMPT    POST http://localhost:8081/api/auth/login
PROMPT    Body: {"usuarioApp":"carlos.test","contrasena":"test123"}
PROMPT
PROMPT ════════════════════════════════════════════════════════════════════════

SET FEEDBACK ON;
