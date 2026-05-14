/* ============================================================
   SIGAS — Gestión de Fallas
   Conecta con /api/fallas
   ============================================================ */
 
const API_FALLAS = 'http://localhost:3000/api/fallas';
let idFallaSeleccionada = null;
let datosFallasActuales = []; // cache para el PDF
 
const Toast = Swal.mixin({
    toast: true, position: 'top-end',
    showConfirmButton: false, timer: 2800, timerProgressBar: true
});
 
// ──────────────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Fijar fecha de hoy por defecto
    document.getElementById('fechaFalla').valueAsDate = new Date();
 
    cargarEquipos();
    cargarFallas();
 
    document.getElementById('btnGuardar').addEventListener('click',    guardarFalla);
    document.getElementById('btnActualizar').addEventListener('click', actualizarFalla);
    document.getElementById('btnEliminar').addEventListener('click',   eliminarFalla);
    document.getElementById('btnLimpiar').addEventListener('click',    limpiarFormulario);
    document.getElementById('btnPDF').addEventListener('click',        abrirVistaPrevia);
 
    // Mostrar/ocultar campos de resolución según estatus
    document.getElementById('estatusFalla').addEventListener('change', toggleResolucion);
});
 
function toggleResolucion() {
    const val = document.getElementById('estatusFalla').value;
    const mostrar = (val === 'Resuelta' || val === 'En proceso');
    document.getElementById('bloqueResolucion').style.display      = mostrar ? '' : 'none';
    document.getElementById('bloqueFechaResolucion').style.display = (val === 'Resuelta') ? '' : 'none';
}
 
// ──────────────────────────────────────────────────────────────
// CARGAR EQUIPOS ACTIVOS
// ──────────────────────────────────────────────────────────────
async function cargarEquipos() {
    try {
        const res  = await fetch(`${API_FALLAS}/equipos-activos`);
        const data = await res.json();
        const sel  = document.getElementById('equipoFalla');
        sel.innerHTML = '<option value="">Seleccione un equipo...</option>';
        if (data.success) {
            data.equipos.forEach(eq => {
                const opt = document.createElement('option');
                opt.value = eq.id;
                opt.textContent = eq.nombre;
                sel.appendChild(opt);
            });
        }
    } catch (err) { console.error('Error al cargar equipos:', err); }
}
 
// ──────────────────────────────────────────────────────────────
// CARGAR TABLA DE FALLAS
// ──────────────────────────────────────────────────────────────
async function cargarFallas() {
    try {
        const res  = await fetch(`${API_FALLAS}/listar`);
        const data = await res.json();
        datosFallasActuales = data.fallas || [];
 
        const tbody = document.querySelector('#tablaFallas tbody');
        tbody.innerHTML = '';
 
        if (data.success && data.fallas.length > 0) {
            data.fallas.forEach(f => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${f.ID_Falla}</td>
                    <td>${f.NombreEquipo} <small style="color:#888">(${f.ClaveEquipo})</small></td>
                    <td>${f.Ubicacion || 'N/A'}</td>
                    <td>${f.Fecha_falla ? new Date(f.Fecha_falla).toLocaleDateString('es-MX') : '—'}</td>
                    <td style="max-width:260px;white-space:normal;">${f.Descripcion_Falla}</td>
                    <td><span class="badge badge-${f.Severidad}">${f.Severidad}</span></td>
                    <td><span class="badge badge-${f.Estatus_Falla.replace(' ','-')}">${f.Estatus_Falla}</span></td>
                `;
                tr.style.cursor = 'pointer';
                tr.addEventListener('click', () => seleccionarFalla(f));
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#999;">No hay fallas registradas.</td></tr>';
        }
    } catch (err) { console.error('Error al cargar fallas:', err); }
}
 
// ──────────────────────────────────────────────────────────────
// SELECCIONAR FALLA (llenar formulario)
// ──────────────────────────────────────────────────────────────
function seleccionarFalla(f) {
    idFallaSeleccionada = f.ID_Falla;
 
    document.getElementById('equipoFalla').value      = f.Equipos_Id_equipo;
    document.getElementById('fechaFalla').value       = f.Fecha_falla ? f.Fecha_falla.split('T')[0] : '';
    document.getElementById('severidad').value        = f.Severidad;
    document.getElementById('estatusFalla').value     = f.Estatus_Falla;
    document.getElementById('descripcionFalla').value = f.Descripcion_Falla;
    document.getElementById('notasResolucion').value  = f.Notas_Resolucion || '';
    document.getElementById('fechaResolucion').value  = f.Fecha_Resolucion ? f.Fecha_Resolucion.split('T')[0] : '';
 
    toggleResolucion();
 
    document.getElementById('btnGuardar').disabled    = true;
    document.getElementById('btnActualizar').disabled = false;
    document.getElementById('btnEliminar').disabled   = false;
}
 
// ──────────────────────────────────────────────────────────────
// GUARDAR
// ──────────────────────────────────────────────────────────────
async function guardarFalla() {
    const idEquipo    = document.getElementById('equipoFalla').value;
    const fecha       = document.getElementById('fechaFalla').value;
    const descripcion = document.getElementById('descripcionFalla').value.trim();
    const severidad   = document.getElementById('severidad').value;
 
    if (!idEquipo || !descripcion) {
        return Toast.fire({ icon: 'warning', title: 'Equipo y descripción son obligatorios.' });
    }
 
    try {
        const res = await fetch(`${API_FALLAS}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idEquipo, fecha, descripcion, severidad })
        });
        const data = await res.json();
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            limpiarFormulario();
            cargarFallas();
        } else {
            Toast.fire({ icon: 'error', title: data.message });
        }
    } catch (err) { Toast.fire({ icon: 'error', title: 'Error de conexión.' }); }
}
 
// ──────────────────────────────────────────────────────────────
// ACTUALIZAR
// ──────────────────────────────────────────────────────────────
async function actualizarFalla() {
    if (!idFallaSeleccionada) return;
    const descripcion      = document.getElementById('descripcionFalla').value.trim();
    const severidad        = document.getElementById('severidad').value;
    const estatusFalla     = document.getElementById('estatusFalla').value;
    const notasResolucion  = document.getElementById('notasResolucion').value.trim();
    const fechaResolucion  = document.getElementById('fechaResolucion').value;
 
    try {
        const res = await fetch(`${API_FALLAS}/actualizar/${idFallaSeleccionada}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion, severidad, estatusFalla, notasResolucion, fechaResolucion })
        });
        const data = await res.json();
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            limpiarFormulario();
            cargarFallas();
        } else {
            Toast.fire({ icon: 'error', title: data.message });
        }
    } catch (err) { Toast.fire({ icon: 'error', title: 'Error de conexión.' }); }
}
 
// ──────────────────────────────────────────────────────────────
// ELIMINAR
// ──────────────────────────────────────────────────────────────
async function eliminarFalla() {
    if (!idFallaSeleccionada) return;
    const confirm = await Swal.fire({
        title: '¿Eliminar esta falla?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;
 
    try {
        const res  = await fetch(`${API_FALLAS}/eliminar/${idFallaSeleccionada}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            limpiarFormulario();
            cargarFallas();
        } else {
            Toast.fire({ icon: 'error', title: data.message });
        }
    } catch (err) { Toast.fire({ icon: 'error', title: 'Error de conexión.' }); }
}
 
// ──────────────────────────────────────────────────────────────
// LIMPIAR FORMULARIO
// ──────────────────────────────────────────────────────────────
function limpiarFormulario() {
    idFallaSeleccionada = null;
    document.getElementById('equipoFalla').value      = '';
    document.getElementById('fechaFalla').valueAsDate = new Date();
    document.getElementById('severidad').value        = 'Media';
    document.getElementById('estatusFalla').value     = 'Pendiente';
    document.getElementById('descripcionFalla').value = '';
    document.getElementById('notasResolucion').value  = '';
    document.getElementById('fechaResolucion').value  = '';
    document.getElementById('bloqueResolucion').style.display     = 'none';
    document.getElementById('bloqueFechaResolucion').style.display= 'none';
    document.getElementById('btnGuardar').disabled    = false;
    document.getElementById('btnActualizar').disabled = true;
    document.getElementById('btnEliminar').disabled   = true;
}
 
// ──────────────────────────────────────────────────────────────
// VISTA PREVIA + PDF
// ──────────────────────────────────────────────────────────────
function abrirVistaPrevia() {
    const contenido = document.getElementById('modalContenido');
    const fecha     = new Date().toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
 
    if (!datosFallasActuales.length) {
        contenido.innerHTML = '<p style="text-align:center;color:#999;">No hay datos para mostrar.</p>';
    } else {
        const filas = datosFallasActuales.map(f => `
            <tr>
                <td>${f.ID_Falla}</td>
                <td>${f.NombreEquipo} (${f.ClaveEquipo})</td>
                <td>${f.Ubicacion || 'N/A'}</td>
                <td>${f.Fecha_falla ? new Date(f.Fecha_falla).toLocaleDateString('es-MX') : '—'}</td>
                <td>${f.Descripcion_Falla}</td>
                <td>${f.Severidad}</td>
                <td>${f.Estatus_Falla}</td>
            </tr>`).join('');
 
        contenido.innerHTML = `
            <p class="preview-titulo">Reporte de Fallas — SIGAS</p>
            <p class="preview-meta">Instituto Tecnológico de Saltillo &nbsp;|&nbsp; Generado: ${fecha} &nbsp;|&nbsp; Total: ${datosFallasActuales.length} registros</p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>Equipo</th><th>Ubicación</th><th>Fecha</th>
                        <th>Descripción</th><th>Severidad</th><th>Estatus</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>`;
    }
    document.getElementById('modalPDF').classList.add('activo');
}
 
function cerrarModal() {
    document.getElementById('modalPDF').classList.remove('activo');
}
 
function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'pt', 'a4'); // landscape
    const ahora = new Date().toLocaleDateString('es-MX');
 
    doc.setFontSize(18);
    doc.setTextColor(106, 27, 49);
    doc.text('SIGAS — Reporte de Fallas', 420, 45, { align: 'center' });
 
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Instituto Tecnológico de Saltillo  |  ${ahora}`, 420, 62, { align: 'center' });
 
    doc.setDrawColor(106, 27, 49);
    doc.setLineWidth(1.5);
    doc.line(40, 72, 800, 72);
 
    doc.autoTable({
        startY: 85,
        head: [['ID','Equipo','Clave','Ubicación','Fecha','Descripción','Severidad','Estatus']],
        body: datosFallasActuales.map(f => [
            f.ID_Falla,
            f.NombreEquipo,
            f.ClaveEquipo,
            f.Ubicacion || 'N/A',
            f.Fecha_falla ? new Date(f.Fecha_falla).toLocaleDateString('es-MX') : '—',
            f.Descripcion_Falla,
            f.Severidad,
            f.Estatus_Falla
        ]),
        theme: 'grid',
        headStyles: { fillColor: [106, 27, 49], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 5: { cellWidth: 180 } }
    });
 
    doc.save(`Reporte_Fallas_SIGAS_${Date.now()}.pdf`);
    cerrarModal();
}
 