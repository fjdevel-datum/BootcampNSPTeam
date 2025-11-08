-- ============================================================
-- SCRIPT: Migración Multi-Moneda para tabla Gasto
-- Fecha: 2025-11-02
-- Descripción: Agrega soporte para múltiples monedas
--              monto = Valor original de la factura
--              monto_usd = Valor convertido a USD
-- ============================================================

-- Paso 1: Agregar nuevas columnas para multi-moneda
ALTER TABLE Gasto ADD (
    moneda VARCHAR2(3) DEFAULT 'USD' NOT NULL,          -- ISO 4217 (USD, GTQ, HNL, PAB, EUR)
    monto_usd DECIMAL(10, 2),                           -- Monto convertido a USD
    tasa_cambio DECIMAL(10, 6) DEFAULT 1.0,             -- Tasa de conversión aplicada
    fecha_tasa_cambio DATE DEFAULT SYSDATE              -- Fecha de la tasa de cambio
);

-- Paso 2: Agregar constraint para validar códigos de moneda válidos
ALTER TABLE Gasto ADD CONSTRAINT chk_moneda_valida 
    CHECK (moneda IN ('USD', 'GTQ', 'HNL', 'ARS', 'EUR','BOB', 'BRL', 'CLP', 'COP', 'PYG','PEN', 'UYU', 'DOP', 'JMD', 'CAD','MXN', 'BZD', 'CRC','NIO','PAB'));

-- Paso 3: Migrar datos existentes (asumir que todo es USD)
-- Como 'monto' ya tiene el valor original, solo copiamos a monto_usd
UPDATE Gasto 
SET 
    moneda = 'USD',
    monto_usd = monto,
    tasa_cambio = 1.0,
    fecha_tasa_cambio = NVL(fecha, SYSDATE)
WHERE monto_usd IS NULL;

-- Paso 4: Hacer obligatorios los campos después de la migración
ALTER TABLE Gasto MODIFY (
    monto_usd DECIMAL(10, 2) NOT NULL,
    tasa_cambio DECIMAL(10, 6) NOT NULL,
    fecha_tasa_cambio DATE NOT NULL
);

-- Paso 5: Crear índice para búsquedas por moneda (opcional, para reportes)
CREATE INDEX idx_gasto_moneda ON Gasto(moneda);

-- Paso 6: Agregar comentarios a las columnas (documentación)
COMMENT ON COLUMN Gasto.monto IS 'Monto ORIGINAL de la factura (en la moneda especificada)';
COMMENT ON COLUMN Gasto.moneda IS 'Código ISO 4217 de la moneda del gasto';
COMMENT ON COLUMN Gasto.monto_usd IS 'Monto convertido a USD (calculado automáticamente)';
COMMENT ON COLUMN Gasto.tasa_cambio IS 'Tasa de cambio aplicada para convertir a USD';
COMMENT ON COLUMN Gasto.fecha_tasa_cambio IS 'Fecha en que se consultó la tasa de cambio';

-- Paso 7: Verificar migración
SELECT 
    COUNT(*) as total_gastos,
    COUNT(CASE WHEN moneda = 'USD' THEN 1 END) as gastos_usd,
    COUNT(CASE WHEN moneda != 'USD' THEN 1 END) as gastos_otras_monedas
FROM Gasto;

-- Rollback (si algo sale mal, ejecutar esto):
/*
ALTER TABLE Gasto DROP CONSTRAINT chk_moneda_valida;
DROP INDEX idx_gasto_moneda;
ALTER TABLE Gasto DROP COLUMN moneda;
ALTER TABLE Gasto DROP COLUMN monto_usd;
ALTER TABLE Gasto DROP COLUMN tasa_cambio;
ALTER TABLE Gasto DROP COLUMN fecha_tasa_cambio;
*/

COMMIT;

-- ============================================================
-- EJEMPLO DE USO POST-MIGRACIÓN
-- ============================================================

/*
-- Insertar un gasto en Quetzales (Guatemala)
INSERT INTO Gasto (
    id_evento, id_categoria, id_tarjeta,
    descripcion, lugar, fecha,
    monto,                          -- Monto ORIGINAL de la factura
    moneda,                         -- Moneda de la factura
    monto_usd,                      -- Monto convertido a USD
    tasa_cambio,                    -- Tasa usada
    fecha_tasa_cambio               -- Fecha de tasa
) VALUES (
    1, 2, 1,
    'Almuerzo cliente', 'Guatemala City', SYSDATE,
    34.25,                          -- Monto en Quetzales (ORIGINAL)
    'GTQ',                          -- Factura en Quetzales
    4.46,                           -- Convertido a USD
    0.13,                           -- Tasa GTQ->USD
    SYSDATE                         -- Fecha de hoy
);

-- Consultar gastos mostrando ambos montos
SELECT 
    descripcion,
    monto || ' ' || moneda as monto_original,
    monto_usd as monto_dolares,
    tasa_cambio,
    fecha_tasa_cambio
FROM Gasto
WHERE id_evento = 1;
*/
