const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const rolesRoutes = require('./routes/roles');
const deptosRoutes = require('./routes/departamentos');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

// Uso de rutas modulares
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/deptos', deptosRoutes);

app.get('/departamentos', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/departamentos.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log("Servidor activo en puerto " + PORT);
});