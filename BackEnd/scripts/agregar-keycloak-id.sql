-- =============================================
-- Script: Agregar columna keycloak_id a Empleado
-- Descripción: Agrega la columna para vincular empleados con usuarios de Keycloak
-- Fecha: 2025-11-02
-- =============================================

-- 1. Agregar la columna keycloak_id
ALTER TABLE Empleado ADD keycloak_id VARCHAR2(255);

-- 2. Crear índice único para mejorar rendimiento de búsquedas
CREATE UNIQUE INDEX idx_empleado_keycloak_id ON Empleado(keycloak_id);

-- 3. Verificar que la columna se agregó correctamente
SELECT column_name, data_type, nullable, data_length
FROM user_tab_columns
WHERE table_name = 'EMPLEADO'
  AND column_name = 'KEYCLOAK_ID';

-- 4. Ver estado actual de empleados (antes de sincronización)
SELECT 
    id_empleado,
    nombre,
    apellido,
    correo,
    keycloak_id
FROM Empleado
ORDER BY id_empleado;

COMMIT;
