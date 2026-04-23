const express = require('express');
const router = express.Router();
const db = require('../database');

// 1. Obtener Salones
router.get('/salones', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT ID_Salon, Nombre_Salon FROM Salones');
        res.json({ success: true, salones: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 2. Obtener Componentes
router.get('/componentes-lista', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT ID_Componentes, Nombre, Marca FROM Componentes');
        res.json({ success: true, componentes: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 3. Listar Equipos
router.get('/listar', async (req, res) => {
    try {
        const query = `SELECT e.*, s.Nombre_Salon FROM Equipos e LEFT JOIN Salones s ON e.Salones_ID_Salon = s.ID_Salon`;
        const [rows] = await db.query(query);
        res.json({ success: true, equipos: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 4. Guardar Equipo
router.post('/guardar', async (req, res) => {
    const { idSalon, nombre, fecha, tipo, clave, componentes } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Equipos (Estatus_id_Estatus, Salones_ID_Salon, Nombre, Fecha_Entrada, Tipo, ClaveUnicaEquipo) VALUES (1, ?, ?, ?, ?, ?)',
            [idSalon, nombre, fecha, tipo, clave]
        );
        if (componentes && componentes.length > 0) {
            await db.query('UPDATE Componentes SET Equipos_Id_equipo = ? WHERE ID_Componentes IN (?)', [result.insertId, componentes]);
        }
        res.json({ success: true, message: "Cambios guardados en la base de datos" });
    } catch (error) {
        if (error.errno === 1062) res.status(400).json({ success: false, message: "La clave de equipo ya existe." });
        else res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Actualizar
router.put('/actualizar/:id', async (req, res) => {
    const { idSalon, nombre, fecha, tipo, clave } = req.body;
    try {
        await db.query('UPDATE Equipos SET Salones_ID_Salon=?, Nombre=?, Fecha_Entrada=?, Tipo=?, ClaveUnicaEquipo=? WHERE Id_equipo=?', 
            [idSalon, nombre, fecha, tipo, clave, req.params.id]);
        res.json({ success: true, message: "Cambios guardados en la base de datos" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 6. Borrar (Desactivar)
router.put('/borrar/:id', async (req, res) => {
    try {
        await db.query('UPDATE Equipos SET Estatus_id_Estatus = 2 WHERE Id_equipo = ?', [req.params.id]);
        res.json({ success: true, message: "Cambios guardados en la base de datos" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;