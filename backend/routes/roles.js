const express = require('express');
const router = express.Router();
const db = require('../database');

// Listar
router.get('/listar', async (req, res) => {
    try {
        const [roles] = await db.query('SELECT ID_roles, Nombre FROM Roles');
        res.json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Crear
router.post('/crear', async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ success: false, message: "El nombre del rol es necesario" });
        }

        const query = `INSERT INTO Roles (Nombre) VALUES (?)`;
        await db.query(query, [nombre]);
        
        res.json({ success: true, message: "Rol creado con éxito" });
    } catch (error) {
        // Código 1062 es el error de MySQL para entradas duplicadas
        if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Este rol ya está dado de alta y no se puede repetir." 
            });
        }
        console.error(error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

// Actualizar
router.put('/actualizar/:id', async (req, res) => {
    try {
        const { nombre } = req.body;
        await db.query('UPDATE Roles SET Nombre = ? WHERE ID_roles = ?', [nombre, req.params.id]);
        res.json({ success: true, message: "Rol actualizado" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// Eliminar
router.delete('/eliminar/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Roles WHERE ID_roles = ?', [req.params.id]);
        res.json({ success: true, message: "Rol eliminado correctamente" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;