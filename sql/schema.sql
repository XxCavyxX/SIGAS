CREATE TABLE Departamentos (
  ID_Departamentos SERIAL PRIMARY KEY,
  Nombre VARCHAR(50) NULL
);

CREATE TABLE Estatus (
  id_Estatus SERIAL PRIMARY KEY,
  Estado VARCHAR(10) NULL
);

CREATE TABLE Roles (
  ID_roles SERIAL PRIMARY KEY,
  Nombre VARCHAR(50) NULL
);

CREATE TABLE Sexo (
  ID_Sexo SERIAL PRIMARY KEY,
  Nombre VARCHAR(50) NULL
);

CREATE TABLE Salones (
  ID_Salon SERIAL PRIMARY KEY,
  Departamentos_ID_Departamentos INT NOT NULL,
  Nombre_Salon VARCHAR(30) NULL
);
CREATE INDEX Salones_FKIndex1 ON Salones(Departamentos_ID_Departamentos);

CREATE TABLE Equipos (
  Id_equipo SERIAL PRIMARY KEY,
  Estatus_id_Estatus INT NOT NULL,
  Salones_ID_Salon INT NOT NULL,
  Nombre VARCHAR(50) NULL,
  Fecha_Entrada DATE NULL,
  Fecha_Salida DATE NULL,
  Tipo VARCHAR(50) NULL,
  ClaveUnicaEquipo VARCHAR(20) NULL
);
CREATE INDEX Equipos_FKIndex1 ON Equipos(Salones_ID_Salon);
CREATE INDEX Equipos_FKIndex2 ON Equipos(Estatus_id_Estatus);

CREATE TABLE Componentes (
  ID_Componentes SERIAL PRIMARY KEY,
  Equipos_Id_equipo INT NOT NULL,
  Nombre VARCHAR(50) NULL,
  Marca VARCHAR(50) NULL,
  Descripcion VARCHAR(100) NULL
);
CREATE INDEX Componentes_FKIndex1 ON Componentes(Equipos_Id_equipo);

CREATE TABLE Registro_fallas (
  ID_Falla SERIAL PRIMARY KEY,
  Equipos_Id_equipo INT NOT NULL,
  Fecha_falla DATE NULL,
  Descripcion_Falla VARCHAR(1000) NULL
);
CREATE INDEX Registro_fallas_FKIndex1 ON Registro_fallas(Equipos_Id_equipo);

CREATE TABLE Usuarios (
  ID_Usuarios SERIAL PRIMARY KEY,
  Estatus_id_Estatus INT NOT NULL,
  Sexo_ID_Sexo INT NOT NULL,
  Roles_ID_roles INT NOT NULL,
  Departamentos_ID_Departamentos INT NOT NULL,
  Pass VARCHAR(20) NULL,
  Nombre VARCHAR(50) NULL,
  Paterno VARCHAR(50) NULL,
  Materno VARCHAR(50) NULL,
  Correo VARCHAR(50) NULL,
  Telefono BIGINT NULL
);
CREATE INDEX Usuarios_FKIndex1 ON Usuarios(Roles_ID_roles);
CREATE INDEX Usuarios_FKIndex2 ON Usuarios(Departamentos_ID_Departamentos);
CREATE INDEX Usuarios_FKIndex3 ON Usuarios(Sexo_ID_Sexo);
CREATE INDEX Usuarios_FKIndex4 ON Usuarios(Estatus_id_Estatus);