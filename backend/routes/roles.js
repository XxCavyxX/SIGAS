const express = require('express');
const router = express.Router();
const db = require('../database'); // Asegúrate de que la ruta a database.js sea correcta

// A. Obtener todos los roles para la tabla
router.get('/listar', async (req, res) => {
    try {
        const [roles] = await db.query('SELECT ID_roles, Nombre FROM Roles');
        res.json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// B. Crear un nuevo rol
router.post('/crear', async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ message: "El nombre del rol es necesario" });

        const query = `INSERT INTO Roles (Nombre) VALUES (?)`;
        await db.query(query, [nombre]);
        
        res.json({ success: true, message: "Rol creado con éxito" });
    } catch (error) {
        // Si el rol ya existe o hay error de SQL
        res.status(500).json({ success: false, message: error.sqlMessage });
    }
});

module.exports = router;