const express = require('express');
const router = express.Router();
const db = require('../database');

// Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => {
    const { nombre, pass } = req.body;

    if (!nombre || !pass) {
        return res.status(400).json({
            success: false,
            message: "Campos incompletos."
        });
    }

    try {
        const [rows] = await db.query(
            'SELECT Nombre, Roles_ID_roles FROM Usuarios WHERE Nombre = ? AND Pass = ?',
            [nombre, pass]
        );

        if (rows.length > 0) {
            res.json({
                success: true,
                message: "Acceso concedido.",
                user: rows[0]
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Credenciales invalidas."
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;