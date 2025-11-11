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
  "nombre_empresa" VARCHAR2(50) NOT NULL
);

CREATE TABLE "Empleado" (
  "id_empleado" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_departamento" NUMBER(5),
  "id_cargo" NUMBER(5),
  "id_empresa" NUMBER(5),
  "nombre" VARCHAR2(50),
  "apellido" VARCHAR2(50) NOT NULL,
  "correo" VARCHAR2(50) NOT NULL,
  "telefono" VARCHAR2(50)
);

CREATE TABLE "Usuario" (
  "id_usuario" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_empleado" NUMBER(5),
  "usuario_app" VARCHAR2(50) NOT NULL,
  "contraseña" VARCHAR2(50) NOT NULL
);

CREATE TABLE "Tarjeta" (
  "id_tarjeta" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_empleado" NUMBER(5),
  "id_pais" NUMBER(5),
  "banco" VARCHAR2(100) NOT NULL,
  "numero_tarjeta" VARCHAR2(25) NOT NULL,
  "fecha_expiracion" DATE
);

CREATE TABLE "Evento" (
  "id_evento" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_empleado" NUMBER(5),
  "nombre_evento" VARCHAR2(50),
  "fecha_registro" DATE,
  "estado" VARCHAR2(50)
);

CREATE TABLE "Adelanto_Viatico" (
  "id_adelanto" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_evento" NUMBER NOT NULL,
  "id_empleado" NUMBER NOT NULL,
  "monto" NUMBER(10,2) NOT NULL,
  "fecha" DATE DEFAULT SYSDATE
);

CREATE TABLE "Liquidacion_Viatico" (
  "id_liquidacion" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_evento" NUMBER NOT NULL,
  "id_empleado" NUMBER NOT NULL,
  "total_adelanto" NUMBER(10,2) DEFAULT 0,
  "total_gastado" NUMBER(10,2) DEFAULT 0,
  "diferencia" NUMBER(10,2),
  "fecha" DATE DEFAULT SYSDATE,
  "estado" VARCHAR2(20)
);

CREATE TABLE "Categoria_Gasto" (
  "id_categoria" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "nombre_categoria" VARCHAR2(50)
);

CREATE TABLE "Gasto" (
  "id_gasto" NUMBER GENERATED AS IDENTITY PRIMARY KEY,
  "id_evento" NUMBER(5),
  "id_tarjeta" NUMBER(5),
  "id_categoria" NUMBER(5),
  "lugar" VARCHAR2(150),
  "descripcion" VARCHAR(75),
  "fecha" DATE,
  "monto" NUMBER(10,2),
  "captura_comprobante" VARCHAR2(200)
);

CREATE UNIQUE INDEX "unique_correo" ON "Empleado" ("correo");

CREATE UNIQUE INDEX "unique_usuario" ON "Usuario" ("usuario_app");

CREATE UNIQUE INDEX "unique_numero_tarjeta" ON "Tarjeta" ("numero_tarjeta");

ALTER TABLE "Empresa" ADD CONSTRAINT "fk_empresa_pais" FOREIGN KEY ("id_pais") REFERENCES "Pais" ("id_pais");

ALTER TABLE "Empleado" ADD CONSTRAINT "fk_empleado_departamento" FOREIGN KEY ("id_departamento") REFERENCES "Departamento" ("id_departamento");

ALTER TABLE "Empleado" ADD CONSTRAINT "fk_empleado_cargo" FOREIGN KEY ("id_cargo") REFERENCES "Cargo" ("id_cargo");

ALTER TABLE "Empleado" ADD CONSTRAINT "fk_empleado_empresa" FOREIGN KEY ("id_empresa") REFERENCES "Empresa" ("id_empresa");

ALTER TABLE "Usuario" ADD CONSTRAINT "fk_usuario_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado");

ALTER TABLE "Tarjeta" ADD CONSTRAINT "fk_tarjeta_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado");

ALTER TABLE "Tarjeta" ADD CONSTRAINT "fk_tarjeta_pais" FOREIGN KEY ("id_pais") REFERENCES "Pais" ("id_pais");

ALTER TABLE "Evento" ADD CONSTRAINT "fk_evento_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado");

ALTER TABLE "Adelanto_Viatico" ADD CONSTRAINT "fk_adelanto_evento" FOREIGN KEY ("id_evento") REFERENCES "Evento" ("id_evento");

ALTER TABLE "Adelanto_Viatico" ADD CONSTRAINT "fk_adelanto_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado");

ALTER TABLE "Liquidacion_Viatico" ADD CONSTRAINT "fk_liquidacion_evento" FOREIGN KEY ("id_evento") REFERENCES "Evento" ("id_evento");

ALTER TABLE "Liquidacion_Viatico" ADD CONSTRAINT "fk_liquidacion_empleado" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado");

ALTER TABLE "Gasto" ADD CONSTRAINT "fk_gasto_evento" FOREIGN KEY ("id_evento") REFERENCES "Evento" ("id_evento");

ALTER TABLE "Gasto" ADD CONSTRAINT "fk_gasto_tarjeta" FOREIGN KEY ("id_tarjeta") REFERENCES "Tarjeta" ("id_tarjeta");

ALTER TABLE "Gasto" ADD CONSTRAINT "fk_gasto_categoria" FOREIGN KEY ("id_categoria") REFERENCES "Categoria_Gasto" ("id_categoria");
