 -- Ensures the default OpenKM admin user and required roles exist.
WHENEVER SQLERROR EXIT SQL.SQLCODE
SET SERVEROUTPUT ON

DECLARE
  v_table_count NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO v_table_count
    FROM user_tables
   WHERE table_name = 'OKM_USER';

  IF v_table_count = 0 THEN
    DBMS_OUTPUT.PUT_LINE('OKM tables are not ready yet; skipping bootstrap.');
  ELSE
    MERGE INTO okm_role tgt
    USING (SELECT 'ROLE_ADMIN' AS rol_id FROM dual) src
       ON (tgt.rol_id = src.rol_id)
    WHEN MATCHED THEN
      UPDATE SET tgt.rol_active = 'T'
    WHEN NOT MATCHED THEN
      INSERT (rol_id, rol_active) VALUES (src.rol_id, 'T');

    MERGE INTO okm_role tgt
    USING (SELECT 'ROLE_USER' AS rol_id FROM dual) src
       ON (tgt.rol_id = src.rol_id)
    WHEN MATCHED THEN
      UPDATE SET tgt.rol_active = 'T'
    WHEN NOT MATCHED THEN
      INSERT (rol_id, rol_active) VALUES (src.rol_id, 'T');

    MERGE INTO okm_user tgt
    USING (SELECT 'okmAdmin' AS usr_id FROM dual) src
       ON (tgt.usr_id = src.usr_id)
    WHEN MATCHED THEN
      UPDATE
         SET tgt.usr_name     = 'Administrator',
             tgt.usr_password = '21232f297a57a5a743894a0e4a801fc3',
             tgt.usr_email    = 'none@nomail.com',
             tgt.usr_active   = 'T'
    WHEN NOT MATCHED THEN
      INSERT (usr_id, usr_name, usr_password, usr_email, usr_active)
      VALUES ('okmAdmin',
              'Administrator',
              '21232f297a57a5a743894a0e4a801fc3',
              'none@nomail.com',
              'T');

    MERGE INTO okm_user_role tgt
    USING (SELECT 'okmAdmin' AS usr_id, 'ROLE_ADMIN' AS rol_id FROM dual) src
       ON (tgt.ur_user = src.usr_id AND tgt.ur_role = src.rol_id)
    WHEN NOT MATCHED THEN
      INSERT (ur_user, ur_role) VALUES (src.usr_id, src.rol_id);

    MERGE INTO okm_profile tgt
    USING (SELECT 1 AS prf_id FROM dual) src
       ON (tgt.prf_id = src.prf_id)
    WHEN MATCHED THEN
      UPDATE SET tgt.prf_name = 'Default', tgt.prf_active = 'T'
    WHEN NOT MATCHED THEN
      INSERT (prf_id, prf_name, prf_active)
      VALUES (1, 'Default', 'T');

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('OpenKM admin bootstrap applied.');
  END IF;
END;
/
EXIT;
