const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const rolesRoutes = require('./routes/roles');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Uso de rutas modulares
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log("Servidor activo en puerto " + PORT);
});