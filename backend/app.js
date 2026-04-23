const express = require('express');
const cors = require('cors');
const path = require('path');

// IMPORTANTE: Verifica que estos archivos existan en backend/routes/
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const rolesRoutes = require('./routes/roles');
const deptosRoutes = require('./routes/departamentos'); 
const equiposRoutes = require('./routes/equipos');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 1. RUTAS DE LA API (Deben ir antes que los estáticos)
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/deptos', deptosRoutes);
app.use('/api/equipos', equiposRoutes);

// 2. ARCHIVOS ESTÁTICOS (Sirve la carpeta frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// 3. RUTAS PARA SERVIR LOS HTML
app.get('/departamentos', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/departamentos.html'));
});

// Manejo de errores 404 para rutas de API no encontradas
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: "Ruta de API no encontrada" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`>>> Servidor activo en http://localhost:${PORT}`);
});