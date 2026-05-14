const express = require('express');
const router = express.Router();
const db = require('../database');

// Listar - Solo ACTIVOS
router.get('/listar', async (req, res) => {
    try {
        const [roles] = await db.query('SELECT ID_roles, Nombre FROM Roles WHERE Estatus_ID_Estatus = 1');
        res.json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Crear
router.post('/crear', async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: "El nombre es obligatorio" });

    try {
        await db.query('INSERT INTO Roles (Nombre, Estatus_ID_Estatus) VALUES (?, 1)', [nombre]);
        res.json({ success: true, message: "Rol creado con éxito" });
    } catch (error) {
        if (error.errno === 1062) return res.status(400).json({ success: false, message: "Este rol ya existe." });
        res.status(500).json({ success: false, message: error.message });
    }
});

// Actualizar
router.put('/actualizar/:id', async (req, res) => {
    const { nombre } = req.body;
    try {
        await db.query('UPDATE Roles SET Nombre = ? WHERE ID_roles = ?', [nombre, req.params.id]);
        res.json({ success: true, message: "Rol actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Borrado Lógico con validación de Usuarios
router.delete('/eliminar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Validar si hay usuarios vinculados (Respetando Estatus_id_Estatus de Usuarios)
        const [usuarios] = await db.query(
            'SELECT COUNT(*) as total FROM Usuarios WHERE Roles_ID_roles = ? AND Estatus_id_Estatus = 1', 
            [id]
        );

        if (usuarios[0].total > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `No se puede dar de baja: hay ${usuarios[0].total} usuario(s) activos con este rol.` 
            });
        }

        await db.query('UPDATE Roles SET Estatus_ID_Estatus = 2 WHERE ID_roles = ?', [id]);
        res.json({ success: true, message: "Rol dado de baja exitosamente" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;