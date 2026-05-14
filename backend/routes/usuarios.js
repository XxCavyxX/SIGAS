const express = require('express');
const router  = express.Router();
const db      = require('../database');
 
// ─────────────────────────────────────────────────────────────────
// 1. OPCIONES PARA MENÚS (Sexo, Roles, Deptos activos)
// ─────────────────────────────────────────────────────────────────
router.get('/opciones', async (_req, res) => {
    try {
        const [roles]  = await db.query('SELECT ID_roles AS id, Nombre AS nombre FROM Roles WHERE Estatus_ID_Estatus = 1');
        const [sexos]  = await db.query('SELECT ID_Sexo AS id, Nombre AS nombre FROM Sexo');
        const [deptos] = await db.query('SELECT ID_Departamentos AS id, Nombre AS nombre FROM Departamentos WHERE Estatus_id_Estatus = 1');
        res.json({ success: true, roles, sexos, departamentos: deptos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
 
// ─────────────────────────────────────────────────────────────────
// 2. LISTAR (Solo activos, con nombre de depto y rol)
// ─────────────────────────────────────────────────────────────────
router.get('/listar', async (_req, res) => {
    try {
        const query = `
            SELECT u.*, d.Nombre AS nombre_depto, r.Nombre AS nombre_rol
            FROM Usuarios u
            LEFT JOIN Departamentos d ON u.Departamentos_ID_Departamentos = d.ID_Departamentos
            LEFT JOIN Roles r         ON u.Roles_ID_roles = r.ID_roles
            WHERE u.Estatus_id_Estatus = 1`;
        const [usuarios] = await db.query(query);
        res.json({ success: true, usuarios });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
 
// ─────────────────────────────────────────────────────────────────
// 3. GUARDAR (INSERT)
// ─────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { nombre, paterno, materno, pass, correo, telefono, sexo, depto, rol } = req.body;
        if (!nombre || !correo || !pass) {
            return res.status(400).json({ success: false, message: 'Nombre, correo y contraseña son obligatorios.' });
        }
        const query = `
            INSERT INTO Usuarios
              (Nombre, Paterno, Materno, Pass, Correo, Telefono,
               Sexo_ID_Sexo, Departamentos_ID_Departamentos, Roles_ID_roles, Estatus_id_Estatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;
        await db.query(query, [nombre, paterno, materno, pass, correo, telefono || null, sexo, depto, rol]);
        res.json({ success: true, message: 'Usuario guardado correctamente.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Ese correo ya está registrado.' });
        }
        res.status(500).json({ success: false, message: 'Error al guardar: ' + err.sqlMessage });
    }
});
 
// ─────────────────────────────────────────────────────────────────
// 4. ACTUALIZAR (por correo)
// ─────────────────────────────────────────────────────────────────
router.put('/actualizar', async (req, res) => {
    try {
        const { correo, nombre, paterno, materno, pass, telefono, sexo, depto, rol } = req.body;
        if (!correo) {
            return res.status(400).json({ success: false, message: 'El correo es obligatorio para identificar al usuario.' });
        }
        const updates = [];
        const values  = [];
        if (nombre)   { updates.push('Nombre = ?');                         values.push(nombre); }
        if (paterno)  { updates.push('Paterno = ?');                        values.push(paterno); }
        if (materno !== undefined) { updates.push('Materno = ?');           values.push(materno); }
        if (pass)     { updates.push('Pass = ?');                           values.push(pass); }
        if (telefono) { updates.push('Telefono = ?');                       values.push(telefono); }
        if (sexo)     { updates.push('Sexo_ID_Sexo = ?');                   values.push(sexo); }
        if (depto)    { updates.push('Departamentos_ID_Departamentos = ?'); values.push(depto); }
        if (rol)      { updates.push('Roles_ID_roles = ?');                 values.push(rol); }
        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No se proporcionaron campos para actualizar.' });
        }
        values.push(correo);
        const [result] = await db.query(`UPDATE Usuarios SET ${updates.join(', ')} WHERE Correo = ?`, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró un usuario con ese correo.' });
        }
        res.json({ success: true, message: 'Usuario actualizado correctamente.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno: ' + err.sqlMessage });
    }
});
 
// ─────────────────────────────────────────────────────────────────
// 5. BORRAR (Baja lógica — cambia estatus a 2)
// ─────────────────────────────────────────────────────────────────
router.delete('/borrar', async (req, res) => {
    try {
        const { correo } = req.body;
        if (!correo) return res.status(400).json({ success: false, message: 'Correo requerido.' });
        const [result] = await db.query(
            'UPDATE Usuarios SET Estatus_id_Estatus = 2 WHERE Correo = ?', [correo]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
        res.json({ success: true, message: 'Usuario dado de baja correctamente.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error: ' + err.sqlMessage });
    }
});
 
module.exports = router;