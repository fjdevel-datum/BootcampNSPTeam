-- ============================================
-- Script: Datos de Prueba - Categorías de Gasto
-- Descripción: Inserta las categorías predeterminadas
-- ============================================

-- Verificar si ya existen registros
SELECT COUNT(*) as "Total Categorias" FROM Categoria_Gasto;

-- Insertar categorías básicas
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Transporte');
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Alimentación');
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Hospedaje');
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Representación');
INSERT INTO Categoria_Gasto (nombre_categoria) VALUES ('Otros');

COMMIT;

-- Verificar que se insertaron correctamente
SELECT * FROM Categoria_Gasto ORDER BY id_categoria;
