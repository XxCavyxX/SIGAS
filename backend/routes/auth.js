const express = require('express');
const router = express.Router();
const db = require('../database');

// Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => {
    const { correo, pass } = req.body;

    if (!correo || !pass) {
        return res.status(400).json({
            success: false,
            message: "Campos incompletos."
        });
    }

    try {
        const [rows] = await db.query(
            'SELECT Correo, Roles_ID_roles FROM Usuarios WHERE Correo = ? AND Pass = ?',
            [correo, pass]
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