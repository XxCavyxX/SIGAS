const express = require('express');
const router = express.Router();
const db = require('../database');

// Listar - Solo traer roles ACTIVOS (Estatus 1)
router.get('/listar', async (req, res) => {
    try {
        const [roles] = await db.query('SELECT ID_roles, Nombre FROM Roles WHERE Estatus_ID_Estatus = 1');
        res.json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Crear - Aseguramos que se cree con estatus 1 (Activo) por defecto
router.post('/crear', async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ success: false, message: "El nombre del rol es necesario" });
        }
        // Insertamos con el Estatus_ID_Estatus en 1
        const query = `INSERT INTO Roles (Nombre, Estatus_ID_Estatus) VALUES (?, 1)`;
        await db.query(query, [nombre]);
        res.json({ success: true, message: "Rol creado con éxito" });
    } catch (error) {
        if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Este rol ya está dado de alta y no se puede repetir." 
            });
        }
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

// Actualizar
router.put('/actualizar/:id', async (req, res) => {
    try {
        const { nombre } = req.body;
        await db.query('UPDATE Roles SET Nombre = ? WHERE ID_roles = ?', [nombre, req.params.id]);
        res.json({ success: true, message: "Rol actualizado" });
    } catch (error) { 
        if (error.errno === 1062) {
            return res.status(400).json({ success: false, message: "Este rol ya existe." });
        }
        res.status(500).json({ success: false, message: error.message }); 
    }
});

// Eliminar (Baja Lógica) - Cambiado de DELETE a UPDATE
// Eliminar (Baja Lógica con Validación de Dependencias)
router.delete('/eliminar/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Verificar si hay usuarios asociados a este rol
        const [usuariosConRol] = await db.query(
            'SELECT COUNT(*) as total FROM Usuarios WHERE Roles_ID_roles = ? AND Estatus_ID_Estatus = 1', 
            [id]
        );

        if (usuariosConRol[0].total > 0) {
            // Si hay usuarios, enviamos un error 400 y no procedemos
            return res.status(400).json({ 
                success: false, 
                message: `No se puede dar de baja: hay ${usuariosConRol[0].total} usuario(s) activos con este rol.` 
            });
        }

        // 2. Si no hay usuarios, procedemos con la baja lógica
        await db.query('UPDATE Roles SET Estatus_ID_Estatus = 2 WHERE ID_roles = ?', [id]);
        
        res.json({ 
            success: true, 
            message: "Rol dado de baja correctamente." 
        });

    } catch (error) {
        console.error("Error en la validación de baja:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor al intentar dar de baja el rol." 
        });
    }
});

module.exports = router;