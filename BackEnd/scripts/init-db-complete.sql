-- ════════════════════════════════════════════════════════════
-- SCRIPT COMPLETO DE INICIALIZACIÓN - DATUM TRAVELS
-- Basado en BD DATUM FINAL.sql
-- ════════════════════════════════════════════════════════════

-- Primero eliminamos las tablas si existen (orden inverso por FK)
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Gasto" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Liquidacion_Viatico" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Adelanto_Viatico" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Evento" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Tarjeta" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Usuario" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Empleado" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Empresa" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Categoria_Gasto" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Pais" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Cargo" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE "Departamento" CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- ════════════════════════════════════════════════════════════
-- CREAR TABLAS
-- ════════════════════════════════════════════════════════════

CREATE TABLE "Departamento" (
  "id_departamento" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "nombre_depart" VARCHAR2(50) NOT NULL,
  "descripcion" VARCHAR2(100)
);

CREATE TABLE "Cargo" (
  "id_cargo" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "nombre" VARCHAR2(50) UNIQUE NOT NULL,
  "descripcion" VARCHAR2(100)
);

CREATE TABLE "Pais" (
  "id_pais" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "nombre_pais" VARCHAR2(50) NOT NULL
);

CREATE TABLE "Empresa" (
  "id_empresa" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_pais" NUMBER(5),
  "NRC" varchar2(60),
  "num_registro_tributario" varchar2(50) NOT NULL,
  "nombre_empresa" VARCHAR2(50) NOT NULL,
  CONSTRAINT "fk_empresa_pais" FOREIGN KEY ("id_pais") REFERENCES "Pais" ("id_pais")
);

CREATE TABLE "Empleado" (
  "id_empleado" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_departamento" NUMBER(5),
  "id_cargo" NUMBER(5),
  "id_empresa" NUMBER(5),
  "nombre" VARCHAR2(50),
  "apellido" VARCHAR2(50) NOT NULL,
  "correo" VARCHAR2(50) NOT NULL,
  "telefono" VARCHAR2(50),
  CONSTRAINT "fk_empleado_departamento" FOREIGN KEY ("id_departamento") REFERENCES "Departamento" ("id_departamento"),
  CONSTRAINT "fk_empleado_cargo" FOREIGN KEY ("id_cargo") REFERENCES "Cargo" ("id_cargo"),
  CONSTRAINT "fk_empleado_empresa" FOREIGN KEY ("id_empresa") REFERENCES "Empresa" ("id_empresa")
);

CREATE UNIQUE INDEX "unique_correo" ON "Empleado" ("correo");

CREATE TABLE "Usuario" (
  "id_usuario" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_empleado" NUMBER(5),
  "usuario_app" VARCHAR2(50) NOT NULL,
  "contraseña" VARCHAR2(50) NOT NULL,
  CONSTRAINT "fk_usuario_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado")
);

CREATE UNIQUE INDEX "unique_usuario" ON "Usuario" ("usuario_app");

CREATE TABLE "Categoria_Gasto" (
  "id_categoria" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "nombre_categoria" VARCHAR2(50)
);

CREATE TABLE "Evento" (
  "id_evento" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_empleado" NUMBER(5),
  "nombre_evento" VARCHAR2(50),
  "fecha_registro" DATE,
  "estado" VARCHAR2(50),
  CONSTRAINT "fk_evento_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado")
);

CREATE TABLE "Tarjeta" (
  "id_tarjeta" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_empleado" NUMBER(5),
  "id_pais" NUMBER(5),
  "banco" VARCHAR2(100) NOT NULL,
  "numero_tarjeta" VARCHAR2(25) NOT NULL,
  "fecha_expiracion" DATE,
  CONSTRAINT "fk_tarjeta_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado"),
  CONSTRAINT "fk_tarjeta_pais" FOREIGN KEY ("id_pais") REFERENCES "Pais" ("id_pais")
);

CREATE UNIQUE INDEX "unique_numero_tarjeta" ON "Tarjeta" ("numero_tarjeta");

CREATE TABLE "Gasto" (
  "id_gasto" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_evento" NUMBER(5),
  "id_tarjeta" NUMBER(5),
  "id_categoria" NUMBER(5),
  "lugar" VARCHAR2(150),
  "descripcion" VARCHAR(75),
  "fecha" DATE,
  "monto" NUMBER(10,2),
  "captura_comprobante" VARCHAR2(200),
  CONSTRAINT "fk_gasto_evento" FOREIGN KEY ("id_evento") REFERENCES "Evento" ("id_evento"),
  CONSTRAINT "fk_gasto_tarjeta" FOREIGN KEY ("id_tarjeta") REFERENCES "Tarjeta" ("id_tarjeta"),
  CONSTRAINT "fk_gasto_categoria" FOREIGN KEY ("id_categoria") REFERENCES "Categoria_Gasto" ("id_categoria")
);

CREATE TABLE "Adelanto_Viatico" (
  "id_adelanto" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_evento" NUMBER NOT NULL,
  "id_empleado" NUMBER NOT NULL,
  "monto" NUMBER(10,2) NOT NULL,
  "fecha" DATE DEFAULT SYSDATE,
  CONSTRAINT "fk_adelanto_evento" FOREIGN KEY ("id_evento") REFERENCES "Evento" ("id_evento"),
  CONSTRAINT "fk_adelanto_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado")
);

CREATE TABLE "Liquidacion_Viatico" (
  "id_liquidacion" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_evento" NUMBER NOT NULL,
  "id_empleado" NUMBER NOT NULL,
  "total_adelanto" NUMBER(10,2) DEFAULT 0,
  "total_gastado" NUMBER(10,2) DEFAULT 0,
  "diferencia" NUMBER(10,2),
  "fecha" DATE DEFAULT SYSDATE,
  "estado" VARCHAR2(20),
  CONSTRAINT "fk_liquidacion_evento" FOREIGN KEY ("id_evento") REFERENCES "Evento" ("id_evento"),
  CONSTRAINT "fk_liquidacion_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado")
);

-- ════════════════════════════════════════════════════════════
-- INSERTAR DATOS DE PRUEBA
-- ════════════════════════════════════════════════════════════

-- País por defecto
INSERT INTO "Pais" ("nombre_pais") VALUES ('El Salvador');
INSERT INTO "Pais" ("nombre_pais") VALUES ('Guatemala');
INSERT INTO "Pais" ("nombre_pais") VALUES ('Honduras');

-- Empresa por defecto
INSERT INTO "Empresa" ("id_pais", "NRC", "num_registro_tributario", "nombre_empresa") 
VALUES (1, '123456-7', '0614-123456-001-1', 'Datum Red Soft');

-- Departamentos
INSERT INTO "Departamento" ("nombre_depart", "descripcion") 
VALUES ('Tecnología', 'Departamento de TI');

INSERT INTO "Departamento" ("nombre_depart", "descripcion") 
VALUES ('Recursos Humanos', 'Gestión de personal');

INSERT INTO "Departamento" ("nombre_depart", "descripcion") 
VALUES ('Finanzas', 'Control financiero');

-- Cargos
INSERT INTO "Cargo" ("nombre", "descripcion") 
VALUES ('Gerente de Tecnología', 'Responsable del área de tecnología');

INSERT INTO "Cargo" ("nombre", "descripcion") 
VALUES ('Analista de RRHH', 'Gestión de recursos humanos');

INSERT INTO "Cargo" ("nombre", "descripcion") 
VALUES ('Contador Senior', 'Responsable contable');

-- Empleados
INSERT INTO "Empleado" ("nombre", "apellido", "correo", "id_cargo", "id_departamento", "id_empresa", "telefono") 
VALUES ('Carlos', 'Martínez', 'cmartinez@datumtravels.com', 1, 1, 1, '2222-1111');

INSERT INTO "Empleado" ("nombre", "apellido", "correo", "id_cargo", "id_departamento", "id_empresa", "telefono") 
VALUES ('Ana', 'Rodríguez', 'arodriguez@datumtravels.com', 2, 2, 1, '2222-2222');

INSERT INTO "Empleado" ("nombre", "apellido", "correo", "id_cargo", "id_departamento", "id_empresa", "telefono") 
VALUES ('Luis', 'González', 'lgonzalez@datumtravels.com', 3, 3, 1, '2222-3333');

-- Usuarios (contraseñas en texto plano por ahora)
INSERT INTO "Usuario" ("usuario_app", "contraseña", "id_empleado") 
VALUES ('cmartinez', 'carlos123', 1);

INSERT INTO "Usuario" ("usuario_app", "contraseña", "id_empleado") 
VALUES ('arodriguez', 'ana123', 2);

INSERT INTO "Usuario" ("usuario_app", "contraseña", "id_empleado") 
VALUES ('lgonzalez', 'luis123', 3);

-- Categorías de Gasto
INSERT INTO "Categoria_Gasto" ("nombre_categoria") VALUES ('Transporte');
INSERT INTO "Categoria_Gasto" ("nombre_categoria") VALUES ('Alimentación');
INSERT INTO "Categoria_Gasto" ("nombre_categoria") VALUES ('Hospedaje');
INSERT INTO "Categoria_Gasto" ("nombre_categoria") VALUES ('Representación');

-- Evento de prueba
INSERT INTO "Evento" ("id_empleado", "nombre_evento", "fecha_registro", "estado") 
VALUES (1, 'Conferencia Tech 2025', SYSDATE, 'activo');

COMMIT;

-- ════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ════════════════════════════════════════════════════════════

SELECT '=== RESUMEN DE DATOS ===' AS INFO FROM DUAL;
SELECT 'Países: ' || COUNT(*) AS INFO FROM "Pais";
SELECT 'Empresas: ' || COUNT(*) AS INFO FROM "Empresa";
SELECT 'Departamentos: ' || COUNT(*) AS INFO FROM "Departamento";
SELECT 'Cargos: ' || COUNT(*) AS INFO FROM "Cargo";
SELECT 'Empleados: ' || COUNT(*) AS INFO FROM "Empleado";
SELECT 'Usuarios: ' || COUNT(*) AS INFO FROM "Usuario";
SELECT 'Categorías: ' || COUNT(*) AS INFO FROM "Categoria_Gasto";
SELECT 'Eventos: ' || COUNT(*) AS INFO FROM "Evento";

SELECT '=== USUARIO DE PRUEBA ===' AS INFO FROM DUAL;
SELECT u."usuario_app", u."contraseña", e."nombre", e."apellido", e."correo"
FROM "Usuario" u
JOIN "Empleado" e ON u."id_empleado" = e."id_empleado"
WHERE u."usuario_app" = 'cmartinez';
