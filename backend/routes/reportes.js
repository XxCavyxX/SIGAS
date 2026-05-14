const express = require('express');
const router  = express.Router();
const db      = require('../database');

// ── 1. INVENTARIO TOTAL ──────────────────────────────────────────
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
            LEFT JOIN Salones     s  ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            LEFT JOIN Estatus    es  ON e.Estatus_id_Estatus = es.id_Estatus
            ORDER BY e.ClaveUnicaEquipo`
        );
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── 2. FALLAS DE EQUIPO ──────────────────────────────────────────
router.get('/fallas-equipo', async (_req, res) => {
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
            INNER JOIN Equipos    e ON f.Equipos_Id_equipo  = e.Id_equipo
            LEFT JOIN  Salones    s ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN  Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            ORDER BY f.Fecha_falla DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── 3. MOVIMIENTOS DE EQUIPOS ────────────────────────────────────
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
            INNER JOIN Equipos    e ON m.Equipos_Id_equipo  = e.Id_equipo
            LEFT JOIN  Salones    s ON e.Salones_ID_Salon   = s.ID_Salon
            LEFT JOIN  Departamentos d ON s.Departamentos_ID_Departamentos = d.ID_Departamentos
            ORDER BY m.Fecha_Movimiento DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── 4. EQUIPOS INACTIVOS ─────────────────────────────────────────
router.get('/equipos-inactivos', async (_req, res) => {
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

// ── 5. ESTADO ACTUAL DE EQUIPOS ──────────────────────────────────
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
                COUNT(f.ID_Falla)                                                AS TotalFallas,
                SUM(CASE WHEN f.Estatus_Falla = 'Pendiente'  THEN 1 ELSE 0 END) AS FallasPendientes,
                SUM(CASE WHEN f.Estatus_Falla = 'En proceso' THEN 1 ELSE 0 END) AS FallasEnProceso
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

module.exports = router;