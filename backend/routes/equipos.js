const express = require('express');
const router  = express.Router();
const db      = require('../database');
 
// ── 1. Salones ──────────────────────────────────────────────────
router.get('/salones', async (_req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT s.ID_Salon, s.Nombre_Salon,
                    d.Nombre AS Departamento
             FROM Salones s
             LEFT JOIN Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
             ORDER BY d.Nombre, s.Nombre_Salon`
        );
        res.json({ success: true, salones: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// ── 2. Componentes sin asignar ──────────────────────────────────
router.get('/componentes-lista', async (_req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT ID_Componentes, Nombre, Marca FROM Componentes WHERE Equipos_Id_equipo IS NULL ORDER BY Nombre'
        );
        res.json({ success: true, componentes: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// ── 3. Listar Equipos ACTIVOS (gestión) ────────────────────────
router.get('/listar', async (_req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*,
                   s.Nombre_Salon,
                   d.Nombre AS Departamento,
                   es.Estado AS Estatus
            FROM Equipos e
            LEFT JOIN Salones    s  ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            LEFT JOIN Estatus    es ON e.Estatus_id_Estatus = es.id_Estatus
            WHERE e.Estatus_id_Estatus = 1
            ORDER BY e.Nombre`
        );
        res.json({ success: true, equipos: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// ── 4. SUB-VISTA: Inventario Total ─────────────────────────────
router.get('/inventario-total', async (_req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                e.Id_equipo,
                e.ClaveUnicaEquipo,
                e.Nombre      AS Equipo,
                e.Tipo,
                e.Fecha_Entrada,
                e.Fecha_Salida,
                s.Nombre_Salon AS Ubicacion,
                d.Nombre       AS Departamento,
                es.Estado      AS Estatus,
                (SELECT GROUP_CONCAT(c.Nombre SEPARATOR ', ')
                 FROM Componentes c WHERE c.Equipos_Id_equipo = e.Id_equipo) AS Componentes
            FROM Equipos e
            LEFT JOIN Salones    s  ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            LEFT JOIN Estatus    es ON e.Estatus_id_Estatus = es.id_Estatus
            ORDER BY e.ClaveUnicaEquipo`
        );
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// ── 5. SUB-VISTA: Fallas de Equipo ─────────────────────────────
router.get('/fallas', async (_req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                f.ID_Falla,
                e.ClaveUnicaEquipo,
                e.Nombre          AS Equipo,
                s.Nombre_Salon    AS Ubicacion,
                d.Nombre          AS Departamento,
                f.Fecha_falla,
                f.Descripcion_Falla,
                f.Severidad,
                f.Estatus_Falla,
                f.Fecha_Resolucion,
                f.Notas_Resolucion
            FROM Registro_fallas f
            INNER JOIN Equipos   e ON f.Equipos_Id_equipo  = e.Id_equipo
            LEFT JOIN  Salones   s ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN  Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            ORDER BY f.Fecha_falla DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// ── 6. SUB-VISTA: Movimientos / Historial ──────────────────────
router.get('/movimientos', async (_req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                m.ID_Movimiento,
                e.ClaveUnicaEquipo,
                e.Nombre          AS Equipo,
                s.Nombre_Salon    AS Ubicacion,
                d.Nombre          AS Departamento,
                m.Tipo_Movimiento,
                m.Fecha_Movimiento,
                m.Motivo
            FROM Movimientos m
            INNER JOIN Equipos   e ON m.Equipos_Id_equipo  = e.Id_equipo
            LEFT JOIN  Salones   s ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN  Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            ORDER BY m.Fecha_Movimiento DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// ── 7. SUB-VISTA: Equipos Inactivos ────────────────────────────
router.get('/inactivos', async (_req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                e.ClaveUnicaEquipo,
                e.Nombre       AS Equipo,
                e.Tipo,
                s.Nombre_Salon AS UbicacionAnterior,
                d.Nombre       AS Departamento,
                e.Fecha_Entrada,
                e.Fecha_Salida,
                e.Motivo       AS MotivoBaja
            FROM Equipos e
            LEFT JOIN Salones    s ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            WHERE e.Estatus_id_Estatus = 2
            ORDER BY e.Fecha_Salida DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// ── 8. SUB-VISTA: Estado Actual ─────────────────────────────────
router.get('/estado-actual', async (_req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                e.ClaveUnicaEquipo,
                e.Nombre      AS Equipo,
                e.Tipo,
                s.Nombre_Salon AS Ubicacion,
                d.Nombre       AS Departamento,
                es.Estado      AS Estatus,
                e.Fecha_Entrada,
                COUNT(f.ID_Falla)                                                 AS TotalFallas,
                SUM(CASE WHEN f.Estatus_Falla = 'Pendiente'  THEN 1 ELSE 0 END)  AS FallasPendientes,
                SUM(CASE WHEN f.Estatus_Falla = 'En proceso' THEN 1 ELSE 0 END)  AS FallasEnProceso
            FROM Equipos e
            LEFT JOIN Salones        s  ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN Departamentos  d  ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            LEFT JOIN Estatus        es ON e.Estatus_id_Estatus = es.id_Estatus
            LEFT JOIN Registro_fallas f ON e.Id_equipo          = f.Equipos_Id_equipo
            WHERE e.Estatus_id_Estatus = 1
            GROUP BY e.Id_equipo
            ORDER BY e.Nombre`
        );
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// ── 9. Guardar (Alta) ───────────────────────────────────────────
router.post('/guardar', async (req, res) => {
    const { idSalon, nombre, fecha, tipo, clave, componentes, motivo } = req.body;
    if (!nombre || !clave || !idSalon) {
        return res.status(400).json({ success: false, message: 'Nombre, clave y salón son obligatorios.' });
    }
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query(
            'INSERT INTO Equipos (Estatus_id_Estatus, Salones_ID_Salon, Nombre, Fecha_Entrada, Tipo, ClaveUnicaEquipo, Motivo) VALUES (1, ?, ?, ?, ?, ?, ?)',
            [idSalon, nombre, fecha || null, tipo || null, clave, motivo || null]
        );
        const idEquipo = result.insertId;
        if (componentes && componentes.length > 0) {
            await conn.query(
                'UPDATE Componentes SET Equipos_Id_equipo = ? WHERE ID_Componentes IN (?)',
                [idEquipo, componentes]
            );
        }
        await conn.query(
            'INSERT INTO Movimientos (Equipos_Id_equipo, Tipo_Movimiento, Fecha_Movimiento, Motivo) VALUES (?, "Alta", CURDATE(), ?)',
            [idEquipo, motivo || 'Alta de equipo']
        );
        await conn.commit();
        res.json({ success: true, message: 'Equipo dado de alta exitosamente.' });
    } catch (err) {
        await conn.rollback();
        if (err.errno === 1062) res.status(400).json({ success: false, message: 'La clave de equipo ya existe.' });
        else res.status(500).json({ success: false, message: err.message });
    } finally { conn.release(); }
});
 
// ── 10. Actualizar ──────────────────────────────────────────────
router.put('/actualizar/:id', async (req, res) => {
    const { idSalon, nombre, fecha, tipo, clave } = req.body;
    try {
        await db.query(
            'UPDATE Equipos SET Salones_ID_Salon=?, Nombre=?, Fecha_Entrada=?, Tipo=?, ClaveUnicaEquipo=? WHERE Id_equipo=?',
            [idSalon, nombre, fecha || null, tipo || null, clave, req.params.id]
        );
        res.json({ success: true, message: 'Cambios guardados correctamente.' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
// ── 11. Borrar (Baja lógica + movimiento) ──────────────────────
router.put('/borrar/:id', async (req, res) => {
    const { motivo } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(
            'UPDATE Equipos SET Estatus_id_Estatus = 2, Fecha_Salida = CURDATE(), Motivo = ? WHERE Id_equipo = ?',
            [motivo, req.params.id]
        );
        await conn.query(
            'INSERT INTO Movimientos (Equipos_Id_equipo, Tipo_Movimiento, Fecha_Movimiento, Motivo) VALUES (?, "Baja", CURDATE(), ?)',
            [req.params.id, motivo]
        );
        await conn.commit();
        res.json({ success: true, message: 'Equipo dado de baja correctamente.' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally { conn.release(); }
});
 
// ── 12. Reporte completo (alias para compatibilidad) ───────────
router.get('/reporte-completo', async (_req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                e.Id_equipo,
                e.ClaveUnicaEquipo,
                e.Nombre      AS Equipo,
                e.Tipo,
                e.Fecha_Entrada,
                e.Fecha_Salida,
                e.Motivo,
                s.Nombre_Salon AS Ubicacion,
                d.Nombre       AS Departamento,
                es.Estado      AS Estatus,
                (SELECT GROUP_CONCAT(c.Nombre SEPARATOR ', ')
                 FROM Componentes c WHERE c.Equipos_Id_equipo = e.Id_equipo) AS Componentes
            FROM Equipos e
            LEFT JOIN Salones    s  ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            LEFT JOIN Estatus    es ON e.Estatus_id_Estatus = es.id_Estatus
            ORDER BY e.ClaveUnicaEquipo`
        );
        res.json({ success: true, equipos: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
 
module.exports = router;
 