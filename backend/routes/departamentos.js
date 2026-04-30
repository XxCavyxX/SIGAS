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
// B. Crear con validación de duplicados
router.post('/guardar', async (req, res) => {
    const { nombre } = req.body;
    try {
        const [existe] = await db.query('SELECT * FROM Departamentos WHERE Nombre = ?', [nombre]);
        
        if (existe.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "departamento ya existente" 
            });
        }

        await db.query('INSERT INTO Departamentos (Nombre, Estatus_id_Estatus) VALUES (?, 1)', [nombre]);
        res.json({ success: true, message: "Departamento guardado" });
    } catch (error) { 
        if (error.errno === 1062) {
            return res.status(400).json({ success: false, message: "departamento ya existente" });
        }
        res.status(500).json({ success: false, message: error.message }); 
    }
});

// Ruta para actualizar por nombre
router.put('/actualizar-por-nombre', async (req, res) => {
    const { nombreNuevo, nombreAnterior } = req.body;
    try {
        await db.query(
            'UPDATE Departamentos SET Nombre = ? WHERE Nombre = ?', 
            [nombreNuevo, nombreAnterior]
        );
        res.json({ success: true, message: "Cambios guardados" });
    } catch (error) {
        if (error.errno === 1062) {
            return res.status(400).json({ success: false, message: "departamento ya existente" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// C. Borrado lógico por NOMBRE
router.put('/borrar-por-nombre', async (req, res) => {
    const { nombre } = req.body;
    try {
        await db.query(
            'UPDATE Departamentos SET Estatus_id_Estatus = 2 WHERE Nombre = ?', 
            [nombre]
        );
        res.json({ success: true, message: "Departamento dado de baja" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;