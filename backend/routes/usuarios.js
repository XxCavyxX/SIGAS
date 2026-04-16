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

module.exports = router;

// 4. Actualizar usuario existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        Sexo_ID_Sexo, Roles_ID_roles, Departamentos_ID_Departamentos, 
        Pass, Nombre, Paterno, Materno, Correo, Telefono 
    } = req.body;

    try {
        const query = `
            UPDATE Usuarios SET 
            Sexo_ID_Sexo = ?, Roles_ID_roles = ?, Departamentos_ID_Departamentos = ?, 
            Pass = ?, Nombre = ?, Paterno = ?, Materno = ?, Correo = ?, Telefono = ?
            WHERE ID_Usuarios = ?
        `;
        await db.query(query, [
            Sexo_ID_Sexo, Roles_ID_roles, Departamentos_ID_Departamentos, 
            Pass, Nombre, Paterno, Materno, Correo, Telefono, id
        ]);
        
        res.json({ success: true, message: "Usuario actualizado correctamente." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Borrar usuario
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Usuarios WHERE ID_Usuarios = ?', [id]);
        res.json({ success: true, message: "Usuario eliminado." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;