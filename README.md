Pre-requisitos para Instalación
Para clonar y ejecutar este proyecto localmente, asegúrate de tener instalado lo siguiente:

1. Entorno de Desarrollo
Git: Necesario para clonar el repositorio y gestionar versiones.

Visual Studio Code: Recomendado para editar el código (con la extensión de MySQL y Node.js instaladas).

2. Backend (Node.js)
Node.js (v18 o superior): El motor de ejecución para JavaScript fuera del navegador.

npm (incluido con Node.js): Para gestionar las librerías del proyecto.

3. Base de Datos (MySQL)
MySQL Server (v8.0+): Motor de base de datos relacional.

Herramienta de gestión: MySQL Workbench, XAMPP (phpMyAdmin) o DBeaver para ejecutar el script schema.sql.

Pasos para el primer inicio
Clonar el repositorio:

Bash
git clone https://github.com/XxCavyxX/SIGAS.git
Instalar dependencias del Backend:
Ve a la carpeta del proyecto y entra en backend:

Bash
cd SIGAS/backend
npm install
Configurar la Base de Datos:

Crea una base de datos llamada SIGAS en tu servidor local de MySQL.

Ejecuta el archivo sql/schema.sql para crear las tablas y las relaciones.

Importante: Actualiza el archivo database.js con tu usuario y contraseña local de MySQL.

Correr el servidor:

Bash
node app.js
