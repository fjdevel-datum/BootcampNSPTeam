-- ════════════════════════════════════════════════════════════
-- SCRIPT DE INICIALIZACIÓN - ORACLE XE
-- Este script se ejecuta automáticamente al iniciar el contenedor
-- ════════════════════════════════════════════════════════════
-- 
-- Ubicación: BackEnd/scripts/init-oracle.sql
--
-- ════════════════════════════════════════════════════════════

-- Conectar como SYSTEM
CONNECT system/datum2025@XEPDB1;

-- ════════════════════════════════════════════════════════════
-- CREAR USUARIO DE LA APLICACIÓN
-- ════════════════════════════════════════════════════════════

-- Verificar si el usuario ya existe y eliminarlo
DECLARE
    user_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM dba_users WHERE username = 'DATUM_USER';
    IF user_count > 0 THEN
        EXECUTE IMMEDIATE 'DROP USER datum_user CASCADE';
    END IF;
END;
/

-- Crear usuario
CREATE USER datum_user IDENTIFIED BY datum2025
    DEFAULT TABLESPACE users
    TEMPORARY TABLESPACE temp
    QUOTA UNLIMITED ON users;

-- Otorgar privilegios
GRANT CONNECT, RESOURCE TO datum_user;
GRANT CREATE SESSION TO datum_user;
GRANT CREATE TABLE TO datum_user;
GRANT CREATE VIEW TO datum_user;
GRANT CREATE SEQUENCE TO datum_user;
GRANT CREATE PROCEDURE TO datum_user;

-- Permisos adicionales para desarrollo
GRANT SELECT ANY TABLE TO datum_user;
GRANT INSERT ANY TABLE TO datum_user;
GRANT UPDATE ANY TABLE TO datum_user;
GRANT DELETE ANY TABLE TO datum_user;

-- ════════════════════════════════════════════════════════════
-- MENSAJE DE CONFIRMACIÓN
-- ════════════════════════════════════════════════════════════

BEGIN
    DBMS_OUTPUT.PUT_LINE('✅ Usuario datum_user creado exitosamente');
    DBMS_OUTPUT.PUT_LINE('📍 Conexión: jdbc:oracle:thin:@localhost:1521/XEPDB1');
    DBMS_OUTPUT.PUT_LINE('👤 Usuario: datum_user');
    DBMS_OUTPUT.PUT_LINE('🔑 Password: datum2025');
END;
/

EXIT;