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

// 3. Listar Equipos (SOLO ACTIVOS)
router.get('/listar', async (req, res) => {
    try {
        // Se añade el filtro WHERE para que los equipos con estatus 2 (baja) no aparezcan en la tabla principal
        const query = `
            SELECT e.*, s.Nombre_Salon 
            FROM Equipos e 
            LEFT JOIN Salones s ON e.Salones_ID_Salon = s.ID_Salon 
            WHERE e.Estatus_id_Estatus = 1`;
        const [rows] = await db.query(query);
        res.json({ success: true, equipos: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 4. Guardar Equipo (Alta con Motivo)
router.post('/guardar', async (req, res) => {
    const { idSalon, nombre, fecha, tipo, clave, componentes, motivo } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Equipos (Estatus_id_Estatus, Salones_ID_Salon, Nombre, Fecha_Entrada, Tipo, ClaveUnicaEquipo, Motivo) VALUES (1, ?, ?, ?, ?, ?, ?)',
            [idSalon, nombre, fecha, tipo, clave, motivo]
        );
        if (componentes && componentes.length > 0) {
            await db.query('UPDATE Componentes SET Equipos_Id_equipo = ? WHERE ID_Componentes IN (?)', [result.insertId, componentes]);
        }
        res.json({ success: true, message: "Equipo dado de alta exitosamente" });
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

// 6. Borrar (Baja lógica con Fecha Automática y Motivo)
router.put('/borrar/:id', async (req, res) => {
    const { motivo } = req.body; // Recibe el motivo desde el SweetAlert del frontend
    try {
        // CURDATE() asigna la fecha actual automáticamente en la base de datos
        const query = `
            UPDATE Equipos 
            SET Estatus_id_Estatus = 2, 
                Fecha_Salida = CURDATE(), 
                Motivo = ? 
            WHERE Id_equipo = ?`;
        await db.query(query, [motivo, req.params.id]);
        res.json({ success: true, message: "Equipo dado de baja correctamente" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 7. Ruta especial para el Reporte PDF
router.get('/reporte-completo', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.ClaveUnicaEquipo, 
                e.Nombre as Equipo, 
                e.Tipo, 
                s.Nombre_Salon as Ubicacion, 
                es.Estado as Estatus,
                (SELECT GROUP_CONCAT(c.Nombre SEPARATOR ', ') FROM Componentes c WHERE c.Equipos_Id_equipo = e.Id_equipo) as Componentes
            FROM Equipos e 
            LEFT JOIN Salones s ON e.Salones_ID_Salon = s.ID_Salon
            LEFT JOIN Estatus es ON e.Estatus_id_Estatus = es.id_Estatus`;
        const [rows] = await db.query(query);
        res.json({ success: true, equipos: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;