-- ════════════════════════════════════════════════════════════════════════════
-- Script para crear usuario datum_user en Oracle XE
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Verificar si el usuario existe
SELECT username FROM dba_users WHERE username = 'DATUM_USER';

-- 2. Crear usuario si no existe (ejecutar solo si el paso 1 no retorna nada)
CREATE USER datum_user IDENTIFIED BY datum2025;

-- 3. Otorgar permisos necesarios
GRANT CONNECT, RESOURCE TO datum_user;
GRANT CREATE SESSION TO datum_user;
GRANT CREATE TABLE TO datum_user;
GRANT CREATE VIEW TO datum_user;
GRANT CREATE SEQUENCE TO datum_user;
GRANT UNLIMITED TABLESPACE TO datum_user;

-- 4. Verificar que se creó correctamente
SELECT username, account_status FROM dba_users WHERE username = 'DATUM_USER';

-- 5. Salir
EXIT;
