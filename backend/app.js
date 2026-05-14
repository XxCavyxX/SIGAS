const express = require('express');
const cors    = require('cors');
const path    = require('path');
 
const authRoutes      = require('./routes/auth');
const usuariosRoutes  = require('./routes/usuarios');
const rolesRoutes     = require('./routes/roles');
const deptosRoutes    = require('./routes/departamentos');
const equiposRoutes   = require('./routes/equipos');
const fallasRoutes    = require('./routes/fallas');       // NUEVO
const reportesRoutes  = require('./routes/reportes');     // NUEVO
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
// ── API ROUTES (antes que los estáticos) ──────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/usuarios',  usuariosRoutes);
app.use('/api/roles',     rolesRoutes);
app.use('/api/deptos',    deptosRoutes);
app.use('/api/equipos',   equiposRoutes);
app.use('/api/fallas',    fallasRoutes);      // NUEVO
app.use('/api/reportes',  reportesRoutes);    // NUEVO
 
// ── ARCHIVOS ESTÁTICOS ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));
 
// ── RUTAS HTML (fallback para navegación directa) ─────────────────
const pages = ['departamentos','equipos','fallas','reportes','roles','usuarios','menu'];
pages.forEach(p => {
    app.get(`/${p}`, (_req, res) =>
        res.sendFile(path.join(__dirname, `../frontend/${p}.html`))
    );
});
 
// ── 404 API ───────────────────────────────────────────────────────
app.use('/api', (_req, res) =>
    res.status(404).json({ success: false, message: 'Ruta de API no encontrada' })
);
 
const PORT = 3000;
app.listen(PORT, () =>
    console.log(`>>> Servidor activo en http://localhost:${PORT}`)
);