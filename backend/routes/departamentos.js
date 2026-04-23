const express = require('express');
const router = express.Router();
const db = require('../database');

// A. Listar departamentos ACTIVOS
router.get('/listar', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT ID_Departamentos AS id, Nombre FROM Departamentos WHERE Estatus_id_Estatus = 1'
        );
        res.json({ success: true, departamentos: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// B. Crear con validación de duplicados
router.post('/guardar', async (req, res) => {
    const { nombre } = req.body;
    try {
        // Validación de duplicados
        const [existe] = await db.query('SELECT * FROM Departamentos WHERE Nombre = ?', [nombre]);
        if (existe.length > 0) return res.json({ success: false, message: "Ya existe este departamento" });

        await db.query('INSERT INTO Departamentos (Nombre, Estatus_id_Estatus) VALUES (?, 1)', [nombre]);
        res.json({ success: true, message: "Departamento guardado" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
// backend/routes/deptos.js

// Ruta para actualizar por nombre
router.put('/actualizar-por-nombre', async (req, res) => {
    const { nombreNuevo, nombreAnterior } = req.body;
    try {
        await db.query(
            'UPDATE Departamentos SET Nombre = ? WHERE Nombre = ?', 
            [nombreNuevo, nombreAnterior]
        );
        res.json({ success: true, message: "Cambios guardados en la base de datos" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// C. Borrado lógico por NOMBRE
router.put('/borrar-por-nombre', async (req, res) => {
    const { nombre } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE Departamentos SET Estatus_id_Estatus = 2 WHERE Nombre = ?', 
            [nombre]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Departamento no encontrado" });
        }
        res.json({ success: true, message: "Departamento dado de baja correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;