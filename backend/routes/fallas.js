const express = require('express');
const router  = express.Router();
const db      = require('../database');
 
// 1. Listar todas las fallas (con nombre de equipo)
router.get('/listar', async (_req, res) => {
    try {
        const query = `
            SELECT f.*,
                   e.Nombre          AS NombreEquipo,
                   e.ClaveUnicaEquipo AS ClaveEquipo,
                   s.Nombre_Salon     AS Ubicacion
            FROM Registro_fallas f
            INNER JOIN Equipos e ON f.Equipos_Id_equipo = e.Id_equipo
            LEFT JOIN  Salones s ON e.Salones_ID_Salon  = s.ID_Salon
            ORDER BY f.Fecha_falla DESC`;
        const [rows] = await db.query(query);
        res.json({ success: true, fallas: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// 2. Listar fallas de un equipo específico
router.get('/por-equipo/:idEquipo', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT f.*, e.Nombre AS NombreEquipo
             FROM Registro_fallas f
             INNER JOIN Equipos e ON f.Equipos_Id_equipo = e.Id_equipo
             WHERE f.Equipos_Id_equipo = ?
             ORDER BY f.Fecha_falla DESC`,
            [req.params.idEquipo]
        );
        res.json({ success: true, fallas: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// 3. Crear falla
router.post('/guardar', async (req, res) => {
    const { idEquipo, fecha, descripcion, severidad } = req.body;
    if (!idEquipo || !descripcion) {
        return res.status(400).json({ success: false, message: 'El equipo y la descripción son obligatorios.' });
    }
    try {
        await db.query(
            `INSERT INTO Registro_fallas
               (Equipos_Id_equipo, Fecha_falla, Descripcion_Falla, Severidad, Estatus_Falla)
             VALUES (?, ?, ?, ?, 'Pendiente')`,
            [idEquipo, fecha || new Date().toISOString().split('T')[0], descripcion, severidad || 'Media']
        );
        res.json({ success: true, message: 'Falla registrada correctamente.' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// 4. Actualizar falla (incluyendo resolución)
router.put('/actualizar/:id', async (req, res) => {
    const { descripcion, severidad, estatusFalla, notasResolucion, fechaResolucion } = req.body;
    try {
        await db.query(
            `UPDATE Registro_fallas
             SET Descripcion_Falla = ?,
                 Severidad         = ?,
                 Estatus_Falla     = ?,
                 Notas_Resolucion  = ?,
                 Fecha_Resolucion  = ?
             WHERE ID_Falla = ?`,
            [descripcion, severidad, estatusFalla, notasResolucion || null, fechaResolucion || null, req.params.id]
        );
        res.json({ success: true, message: 'Falla actualizada correctamente.' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// 5. Eliminar falla
router.delete('/eliminar/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Registro_fallas WHERE ID_Falla = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Falla no encontrada.' });
        }
        res.json({ success: true, message: 'Falla eliminada.' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// 6. Listado de equipos activos (para el select del formulario)
router.get('/equipos-activos', async (_req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT e.Id_equipo AS id,
                    CONCAT(e.ClaveUnicaEquipo, ' – ', e.Nombre) AS nombre
             FROM Equipos e
             WHERE e.Estatus_id_Estatus = 1
             ORDER BY e.Nombre`
        );
        res.json({ success: true, equipos: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
module.exports = router;