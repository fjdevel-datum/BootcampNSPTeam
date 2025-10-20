CREATE USER datum_user IDENTIFIED BY datum2025;
GRANT CONNECT, RESOURCE TO datum_user;
GRANT CREATE SESSION TO datum_user;
GRANT CREATE TABLE TO datum_user;
GRANT CREATE VIEW TO datum_user;
GRANT CREATE SEQUENCE TO datum_user;
GRANT UNLIMITED TABLESPACE TO datum_user;
SELECT username, account_status FROM dba_users WHERE username = 'DATUM_USER';
