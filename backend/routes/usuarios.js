const express = require('express');
const router = express.Router();
const db = require('../database');

// 1. Opciones para los menús (Ya funciona, pero asegúrate que esté así)
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

// 2. BUSCAR USUARIO (Soluciona el error 404 /buscar?nombre=...)
router.get('/buscar', async (req, res) => {
    try {
        const { nombre } = req.query;
        // Buscamos por nombre exacto
        const [rows] = await db.query('SELECT * FROM Usuarios WHERE Nombre = ?', [nombre]);
        
        if (rows.length > 0) {
            res.json(rows[0]); // Retorna el usuario encontrado
        } else {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. GUARDAR USUARIO (Soluciona el error 500 POST)
router.post('/', async (req, res) => {
    try {
        const { nombre, paterno, materno, pass, correo, telefono, sexo, depto, rol } = req.body;
        
        const query = `INSERT INTO Usuarios 
            (Nombre, Paterno, Materno, Pass, Correo, Telefono, Sexo_ID_Sexo, Departamentos_ID_Departamentos, Roles_ID_roles, Estatus_id_Estatus) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;
        
        await db.query(query, [nombre, paterno, materno, pass, correo, telefono, sexo, depto, rol]);
        res.json({ success: true, message: "Usuario guardado correctamente" });
    } catch (error) {
        console.error("Error en servidor:", error);
        res.status(500).json({ success: false, message: "Error al guardar: " + error.sqlMessage });
    }
});

// Obtener todos los usuarios para llenar la tabla
router.get('/listar', async (req, res) => {
    try {
        const query = `
            SELECT u.Nombre, u.Paterno, u.Materno, u.Correo, u.Telefono, u.Pass,
                   u.Sexo_ID_Sexo, u.Departamentos_ID_Departamentos, u.Roles_ID_roles,
                   d.Nombre AS nombre_depto, r.Nombre AS nombre_rol
            FROM Usuarios u
            LEFT JOIN Departamentos d ON u.Departamentos_ID_Departamentos = d.ID_Departamentos
            LEFT JOIN Roles r ON u.Roles_ID_roles = r.ID_roles`;
        
        const [usuarios] = await db.query(query);
        res.json({ success: true, usuarios });
    } catch (error) {
        console.error("Error al listar usuarios:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

// 4. Actualizar usuario existente
// ACTUALIZAR POR ID
router.put('/actualizar', async (req, res) => {
    try {
        const { id, nombre, paterno, materno, pass, correo, telefono, sexo, depto, rol } = req.body;

        if (!id) return res.status(400).json({ success: false, message: "ID de usuario necesario" });

        const query = `UPDATE Usuarios SET 
            Nombre = ?, Paterno = ?, Materno = ?, Pass = ?, Correo = ?, 
            Telefono = ?, Sexo_ID_Sexo = ?, Departamentos_ID_Departamentos = ?, 
            Roles_ID_roles = ?
            WHERE ID_usuarios = ?`; // <-- Ahora usamos el ID
        
        const [result] = await db.query(query, [
            nombre, paterno, materno, pass, correo, telefono, sexo, depto, rol, id
        ]);

        res.json({ success: true, message: "Usuario actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.sqlMessage });
    }
});

// BORRAR POR ID
router.delete('/borrar', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "ID necesario" });

        const query = `DELETE FROM Usuarios WHERE ID_usuarios = ?`;
        await db.query(query, [id]);

        res.json({ success: true, message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.sqlMessage });
    }
});

module.exports = router;