const express = require('express');
const router = express.Router();
const db = require('../database');

// 1. OPCIONES PARA MENÚS (Sexo, Roles, Deptos)
router.get('/opciones', async (req, res) => {
    try {
        const [roles] = await db.query('SELECT ID_roles AS id, Nombre AS nombre FROM Roles');
        const [sexos] = await db.query('SELECT ID_Sexo AS id, Nombre AS nombre FROM Sexo');
        const [deptos] = await db.query('SELECT ID_Departamentos AS id, Nombre AS nombre FROM Departamentos');
        res.json({ success: true, roles, sexos, departamentos: deptos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. BUSCAR USUARIO POR NOMBRE
router.get('/buscar', async (req, res) => {
    try {
        const { nombre } = req.query;
        const [rows] = await db.query('SELECT * FROM Usuarios WHERE Nombre = ? AND Estatus_ID_Estatus = 1', [nombre]);
        
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. GUARDAR USUARIO (INSERT)
router.post('/', async (req, res) => {
    try {
        const { nombre, paterno, materno, pass, correo, telefono, sexo, depto, rol } = req.body;
        
        const query = `INSERT INTO Usuarios 
            (Nombre, Paterno, Materno, Pass, Correo, Telefono, Sexo_ID_Sexo, Departamentos_ID_Departamentos, Roles_ID_roles, Estatus_ID_Estatus) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;
        
        await db.query(query, [nombre, paterno, materno, pass, correo, telefono, sexo, depto, rol]);
        res.json({ success: true, message: "Usuario guardado correctamente" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Ese correo ya está registrado" });
        }
        res.status(500).json({ success: false, message: "Error al guardar: " + error.sqlMessage });
    }
});

// 4. LISTAR USUARIOS (Solo activos)
router.get('/listar', async (req, res) => {
    try {
        const query = `
            SELECT u.*, d.Nombre AS nombre_depto, r.Nombre AS nombre_rol
            FROM Usuarios u
            LEFT JOIN Departamentos d ON u.Departamentos_ID_Departamentos = d.ID_Departamentos
            LEFT JOIN Roles r ON u.Roles_ID_roles = r.ID_roles
            WHERE u.Estatus_ID_Estatus = 1`;
        
        const [usuarios] = await db.query(query);
        res.json({ success: true, usuarios });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. ACTUALIZAR USUARIO (UPDATE DINÁMICO)
// ACTUALIZAR POR CORREO
router.put('/actualizar', async (req, res) => {
    try {
        // Extraemos los datos que vienen del formulario frontend
        const { correo, nombre, paterno, materno, pass, telefono, sexo, depto, rol } = req.body;

        if (!correo) {
            return res.status(400).json({ success: false, message: "El correo es obligatorio para identificar al usuario" });
        }

        // Construimos los cambios dinámicamente usando los nombres reales de tu DB
        const updates = [];
        const values = [];

        if (nombre) { updates.push("Nombre = ?"); values.push(nombre); }
        if (paterno) { updates.push("Paterno = ?"); values.push(paterno); }
        if (materno) { updates.push("Materno = ?"); values.push(materno); }
        if (pass) { updates.push("Pass = ?"); values.push(pass); }
        if (telefono) { updates.push("Telefono = ?"); values.push(telefono); }
        if (sexo) { updates.push("Sexo_ID_Sexo = ?"); values.push(sexo); }
        if (depto) { updates.push("Departamentos_ID_Departamentos = ?"); values.push(depto); }
        if (rol) { updates.push("Roles_ID_roles = ?"); values.push(rol); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: "No se proporcionaron campos para actualizar" });
        }

        // El último valor es el correo para el WHERE
        values.push(correo);

        // La consulta final
        const query = `UPDATE Usuarios SET ${updates.join(', ')} WHERE Correo = ?`;

        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "No se encontró un usuario con ese correo" });
        }

        res.json({ success: true, message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error("Error en servidor:", error);
        res.status(500).json({ success: false, message: "Error interno: " + error.sqlMessage });
    }
});

module.exports = router;

// 6. BORRAR USUARIO (Baja Lógica)
router.delete('/borrar', async (req, res) => {
    try {
        const { correo } = req.body;
        const query = `UPDATE Usuarios SET Estatus_ID_Estatus = 2 WHERE Correo = ?`;
        const [result] = await db.query(query, [correo]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
        res.json({ success: true, message: "Usuario dado de baja correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error: " + error.sqlMessage });
    }
});

module.exports = router;