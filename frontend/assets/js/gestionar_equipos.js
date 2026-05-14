/* ============================================================
   SIGAS — Gestión de Equipos
   ============================================================ */
 
const API_URL = 'http://localhost:3000/api/equipos';
let idSeleccionado = null;
let datosEquiposCompletos = [];  // cache para el PDF
 
const Toast = Swal.mixin({
    toast: true, position: 'top-end',
    showConfirmButton: false, timer: 2500, timerProgressBar: true
});
 
// ──────────────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarEquipos();
    cargarSalones();
    cargarComponentes();
 
    document.getElementById('btnGuardar').addEventListener('click',    guardarEquipo);
    document.getElementById('btnActualizar').addEventListener('click', actualizarEquipo);
    document.getElementById('btnBorrar').addEventListener('click',     borrarEquipo);
    document.getElementById('btnPDF').addEventListener('click',        abrirVistaPrevia);
});
 
// ──────────────────────────────────────────────────────────────
// CARGAR SELECTS
// ──────────────────────────────────────────────────────────────
async function cargarSalones() {
    try {
        const res = await fetch(`${API_URL}/salones`);
        const data = await res.json();
        const select = document.getElementById('salon');
        if (data.success) {
            select.innerHTML = '<option value="">Seleccione un salón...</option>';
            data.salones.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.ID_Salon;
                opt.textContent = s.Nombre_Salon;
                select.appendChild(opt);
            });
        }
    } catch (err) { console.error('Error en salones:', err); }
}
 
async function cargarComponentes() {
    try {
        const res  = await fetch(`${API_URL}/componentes-lista`);
        const data = await res.json();
        const select = document.getElementById('componentes');
        if (data.success) {
            select.innerHTML = '';
            data.componentes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.ID_Componentes;
                opt.textContent = `${c.Nombre} (${c.Marca || 'S/M'})`;
                select.appendChild(opt);
            });
        }
    } catch (err) { console.error('Error en componentes:', err); }
}
 
// ──────────────────────────────────────────────────────────────
// LISTAR EQUIPOS
// ──────────────────────────────────────────────────────────────
async function cargarEquipos() {
    try {
        const res  = await fetch(`${API_URL}/listar`);
        const data = await res.json();
        const tbody = document.querySelector('#tabla-equipos tbody');
        tbody.innerHTML = '';
 
        if (data.success && data.equipos.length > 0) {
            data.equipos.forEach(eq => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                tr.innerHTML = `
                    <td>${eq.ClaveUnicaEquipo}</td>
                    <td>${eq.Nombre}</td>
                    <td>${eq.Nombre_Salon || 'Sin salón'}</td>
                    <td>${eq.Tipo || '—'}</td>
                    <td>${eq.Fecha_Entrada ? new Date(eq.Fecha_Entrada).toLocaleDateString('es-MX') : 'N/A'}</td>
                `;
                tr.onclick = () => seleccionarEquipo(eq);
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999;">No hay equipos activos.</td></tr>';
        }
    } catch (err) { console.error('Error al listar:', err); }
}
 
// ──────────────────────────────────────────────────────────────
// SELECCIONAR
// ──────────────────────────────────────────────────────────────
function seleccionarEquipo(eq) {
    idSeleccionado = eq.Id_equipo;
    document.getElementById('salon').value       = eq.Salones_ID_Salon || '';
    document.getElementById('nombreEquipo').value= eq.Nombre || '';
    document.getElementById('tipo').value        = eq.Tipo || '';
    document.getElementById('fecha').value       = eq.Fecha_Entrada ? eq.Fecha_Entrada.split('T')[0] : '';
    document.getElementById('clave').value       = eq.ClaveUnicaEquipo || '';
    document.getElementById('motivo').value      = '';
 
    document.getElementById('statusIndicator').textContent = '✏️ Editando';
    document.getElementById('btnActualizar').disabled = false;
    document.getElementById('btnBorrar').disabled     = false;
    document.getElementById('btnGuardar').disabled    = true;
}
 
// ──────────────────────────────────────────────────────────────
// GUARDAR (ALTA)
// ──────────────────────────────────────────────────────────────
async function guardarEquipo() {
    const motivo = document.getElementById('motivo').value.trim();
    if (!motivo) return Swal.fire('Atención', 'Ingrese un motivo para el alta.', 'warning');
 
    const componentesSelect = document.getElementById('componentes');
    const componentes = Array.from(componentesSelect.selectedOptions).map(o => o.value);
 
    const equipo = {
        idSalon:    document.getElementById('salon').value,
        nombre:     document.getElementById('nombreEquipo').value.trim(),
        tipo:       document.getElementById('tipo').value.trim(),
        fecha:      document.getElementById('fecha').value,
        clave:      document.getElementById('clave').value.trim(),
        motivo,
        componentes
    };
 
    if (!equipo.nombre || !equipo.clave || !equipo.idSalon) {
        return Toast.fire({ icon: 'warning', title: 'Nombre, clave y salón son obligatorios.' });
    }
 
    try {
        const res  = await fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipo)
        });
        const data = await res.json();
        if (data.success) {
            Swal.fire('¡Éxito!', data.message, 'success');
            cargarEquipos();
            cargarComponentes();
            limpiarFormulario();
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch { Toast.fire({ icon: 'error', title: 'Error de conexión.' }); }
}
 
// ──────────────────────────────────────────────────────────────
// ACTUALIZAR
// ──────────────────────────────────────────────────────────────
async function actualizarEquipo() {
    const equipo = {
        idSalon: document.getElementById('salon').value,
        nombre:  document.getElementById('nombreEquipo').value,
        tipo:    document.getElementById('tipo').value,
        fecha:   document.getElementById('fecha').value,
        clave:   document.getElementById('clave').value
    };
    try {
        const res  = await fetch(`${API_URL}/actualizar/${idSeleccionado}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipo)
        });
        const data = await res.json();
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            cargarEquipos();
            limpiarFormulario();
        } else {
            Toast.fire({ icon: 'error', title: data.message });
        }
    } catch { console.error('Error al actualizar'); }
}
 
// ──────────────────────────────────────────────────────────────
// BORRAR (BAJA)
// ──────────────────────────────────────────────────────────────
async function borrarEquipo() {
    const { value: motivoBaja } = await Swal.fire({
        title: '¿Confirmar Baja de Equipo?',
        text: 'Indique la razón:',
        input: 'textarea',
        inputPlaceholder: 'Ej: Falla irreparable, Donación...',
        showCancelButton: true,
        confirmButtonColor: '#6a1b31',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Confirmar Baja',
        cancelButtonText: 'Cancelar',
        inputValidator: v => { if (!v) return '¡El motivo es obligatorio!'; }
    });
 
    if (!motivoBaja) return;
 
    try {
        const res  = await fetch(`${API_URL}/borrar/${idSeleccionado}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo: motivoBaja })
        });
        const data = await res.json();
        if (data.success) {
            Swal.fire('Baja Registrada', data.message, 'success');
            cargarEquipos();
            limpiarFormulario();
        }
    } catch { console.error('Error al borrar'); }
}
 
// ──────────────────────────────────────────────────────────────
// REPORTE — Vista previa + descarga PDF
// ──────────────────────────────────────────────────────────────
async function abrirVistaPrevia() {
    try {
        const res  = await fetch(`${API_URL}/reporte-completo`);
        const data = await res.json();
        if (!data.success) return Swal.fire('Error', 'No se obtuvieron datos.', 'error');
 
        datosEquiposCompletos = data.equipos;
 
        const fecha = new Date().toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
        const filas = data.equipos.map(eq => `<tr>
            <td>${eq.ClaveUnicaEquipo}</td>
            <td>${eq.Equipo}</td>
            <td>${eq.Tipo || '—'}</td>
            <td>${eq.Ubicacion || '—'}</td>
            <td style="text-align:center"><strong>${eq.Estatus}</strong></td>
            <td>${eq.Componentes || '—'}</td>
        </tr>`).join('');
 
        document.getElementById('previewTable').innerHTML = `
            <p class="preview-titulo">Inventario General de Equipos</p>
            <p class="preview-meta">Instituto Tecnológico de Saltillo &nbsp;|&nbsp; ${fecha} &nbsp;|&nbsp; ${data.equipos.length} registros</p>
            <table>
                <thead><tr><th>Clave</th><th>Equipo</th><th>Tipo</th><th>Ubicación</th><th>Estatus</th><th>Componentes</th></tr></thead>
                <tbody>${filas}</tbody>
            </table>`;
 
        document.getElementById('modalEquipos').classList.add('activo');
 
    } catch (err) { Swal.fire('Error', 'Hubo un problema al obtener los datos: ' + err.message, 'error'); }
}
 
function descargarPDFEquipos() {
    if (!datosEquiposCompletos.length) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'pt', 'a4');
    const ahora = new Date().toLocaleDateString('es-MX');
 
    doc.setFontSize(18);
    doc.setTextColor(106, 27, 49);
    doc.text('SIGAS — Inventario General de Equipos', 420, 44, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Instituto Tecnológico de Saltillo  |  ${ahora}`, 420, 60, { align: 'center' });
    doc.setDrawColor(106, 27, 49);
    doc.setLineWidth(1.2);
    doc.line(40, 70, 800, 70);
 
    doc.autoTable({
        startY: 82,
        head: [['Clave','Equipo','Tipo','Ubicación','Estatus','Componentes']],
        body: datosEquiposCompletos.map(eq => [
            eq.ClaveUnicaEquipo, eq.Equipo, eq.Tipo||'—', eq.Ubicacion||'—', eq.Estatus, eq.Componentes||'—'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [106, 27, 49], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [250, 250, 250] }
    });
 
    doc.save(`Inventario_SIGAS_${Date.now()}.pdf`);
    document.getElementById('modalEquipos').classList.remove('activo');
}
 
// ──────────────────────────────────────────────────────────────
// LIMPIAR
// ──────────────────────────────────────────────────────────────
function limpiarFormulario() {
    idSeleccionado = null;
    document.querySelectorAll('#tabla-equipos ~ * input, #tabla-equipos ~ * select, #tabla-equipos ~ * textarea').forEach(i => i.value = '');
    // Limpiar directamente los campos del form
    ['salon','nombreEquipo','tipo','fecha','clave','motivo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('statusIndicator').textContent = '';
    document.getElementById('btnActualizar').disabled = true;
    document.getElementById('btnBorrar').disabled     = true;
    document.getElementById('btnGuardar').disabled    = false;
}
 