-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS SIGAS;
USE SIGAS;

-- 1. Tablas Maestras (Las que no dependen de nadie)
CREATE TABLE Departamentos (
  ID_Departamentos INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(50) NULL
);

CREATE TABLE Estatus (
  id_Estatus INT AUTO_INCREMENT PRIMARY KEY,
  Estado VARCHAR(10) NULL
);

CREATE TABLE Roles (
  ID_roles INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(50) NULL
);

CREATE TABLE Sexo (
  ID_Sexo INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(50) NULL
);

-- 2. Tablas con Dependencias (Foreign Keys)

CREATE TABLE Salones (
  ID_Salon INT AUTO_INCREMENT PRIMARY KEY,
  Departamentos_ID_Departamentos INT NOT NULL,
  Nombre_Salon VARCHAR(30) NULL,
  CONSTRAINT FK_Salones_Deptos FOREIGN KEY (Departamentos_ID_Departamentos) 
    REFERENCES Departamentos(ID_Departamentos)
);

CREATE TABLE Equipos (
  Id_equipo INT AUTO_INCREMENT PRIMARY KEY,
  Estatus_id_Estatus INT NOT NULL,
  Salones_ID_Salon INT NOT NULL,
  Nombre VARCHAR(50) NULL,
  Fecha_Entrada DATE NULL,
  Fecha_Salida DATE NULL,
  Tipo VARCHAR(50) NULL,
  ClaveUnicaEquipo VARCHAR(20) NULL,
  CONSTRAINT FK_Equipos_Estatus FOREIGN KEY (Estatus_id_Estatus) 
    REFERENCES Estatus(id_Estatus),
  CONSTRAINT FK_Equipos_Salones FOREIGN KEY (Salones_ID_Salon) 
    REFERENCES Salones(ID_Salon)
);

CREATE TABLE Componentes (
  ID_Componentes INT AUTO_INCREMENT PRIMARY KEY,
  Equipos_Id_equipo INT NOT NULL,
  Nombre VARCHAR(50) NULL,
  Marca VARCHAR(50) NULL,
  Descripcion VARCHAR(100) NULL,
  CONSTRAINT FK_Componentes_Equipos FOREIGN KEY (Equipos_Id_equipo) 
    REFERENCES Equipos(Id_equipo)
);

CREATE TABLE Registro_fallas (
  ID_Falla INT AUTO_INCREMENT PRIMARY KEY,
  Equipos_Id_equipo INT NOT NULL,
  Fecha_falla DATE NULL,
  Descripcion_Falla VARCHAR(1000) NULL,
  CONSTRAINT FK_Fallas_Equipos FOREIGN KEY (Equipos_Id_equipo) 
    REFERENCES Equipos(Id_equipo)
);

CREATE TABLE Usuarios (
  ID_Usuarios INT AUTO_INCREMENT PRIMARY KEY,
  Estatus_id_Estatus INT NOT NULL,
  Sexo_ID_Sexo INT NOT NULL,
  Roles_ID_roles INT NOT NULL,
  Departamentos_ID_Departamentos INT NOT NULL,
  Pass VARCHAR(20) NULL,
  Nombre VARCHAR(50) NULL,
  Paterno VARCHAR(50) NULL,
  Materno VARCHAR(50) NULL,
  Correo VARCHAR(50) NULL,
  Telefono BIGINT NULL,
  CONSTRAINT FK_Usuarios_Estatus FOREIGN KEY (Estatus_id_Estatus) REFERENCES Estatus(id_Estatus),
  CONSTRAINT FK_Usuarios_Sexo FOREIGN KEY (Sexo_ID_Sexo) REFERENCES Sexo(ID_Sexo),
  CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (Roles_ID_roles) REFERENCES Roles(ID_roles),
  CONSTRAINT FK_Usuarios_Deptos FOREIGN KEY (Departamentos_ID_Departamentos) REFERENCES Departamentos(ID_Departamentos)
);