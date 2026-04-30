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
        const [existe] = await db.query('SELECT * FROM Departamentos WHERE Nombre = ? AND Estatus_id_Estatus = 1', [nombre]);
        
        if (existe.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "El departamento ya existe y está activo." 
            });
        }

        await db.query('INSERT INTO Departamentos (Nombre, Estatus_id_Estatus) VALUES (?, 1)', [nombre]);
        res.json({ success: true, message: "Departamento guardado con éxito" });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
});

// Ruta para actualizar
router.put('/actualizar-por-nombre', async (req, res) => {
    const { nombreNuevo, nombreAnterior } = req.body;
    try {
        await db.query(
            'UPDATE Departamentos SET Nombre = ? WHERE Nombre = ?', 
            [nombreNuevo, nombreAnterior]
        );
        res.json({ success: true, message: "Cambios guardados correctamente" });
    } catch (error) {
        if (error.errno === 1062) {
            return res.status(400).json({ success: false, message: "Ese nombre de departamento ya existe." });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// C. Borrado lógico con VALIDACIÓN DE USUARIOS
// C. Borrado lógico con VALIDACIÓN DE USUARIOS
router.put('/borrar-por-nombre', async (req, res) => {
    const { nombre } = req.body;
    try {
        // 1. Obtenemos el ID del departamento
        const [depto] = await db.query('SELECT ID_Departamentos FROM Departamentos WHERE Nombre = ?', [nombre]);
        
        if (depto.length === 0) {
            return res.status(404).json({ success: false, message: "Departamento no encontrado" });
        }

        const deptoId = depto[0].ID_Departamentos;

        // 2. Verificamos usuarios vinculados
        // CAMBIO AQUÍ: Usamos Departamentos_id_Departamentos (nombre común en tu estructura)
        const [usuarios] = await db.query(
            'SELECT COUNT(*) as total FROM Usuarios WHERE Departamentos_id_Departamentos = ? AND Estatus_id_Estatus = 1', 
            [deptoId]
        );

        if (usuarios[0].total > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `No se puede dar de baja: hay ${usuarios[0].total} usuario(s) asignados a este departamento.` 
            });
        }

        // 3. Baja lógica
        await db.query(
            'UPDATE Departamentos SET Estatus_id_Estatus = 2 WHERE ID_Departamentos = ?', 
            [deptoId]
        );
        
        res.json({ success: true, message: "Departamento dado de baja correctamente" });

    } catch (error) {
        // Si el error persiste, este mensaje te dirá qué columna te falta corregir
        res.status(500).json({ success: false, message: "Error en el servidor: " + error.message });
    }
});

module.exports = router;