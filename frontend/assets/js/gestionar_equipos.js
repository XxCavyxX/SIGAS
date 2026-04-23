const API_URL = 'http://localhost:3000/api/equipos';
let idSeleccionado = null;

// Configuración de Toast (SweetAlert2)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
});

document.addEventListener('DOMContentLoaded', () => {
    cargarEquipos();
    cargarSalones();
    cargarComponentes();
    
    document.getElementById('btnGuardar').addEventListener('click', guardarEquipo);
    document.getElementById('btnActualizar').addEventListener('click', actualizarEquipo);
    document.getElementById('btnBorrar').addEventListener('click', borrarEquipo);
});

// Cargar Salones en el Select
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
    } catch (err) { console.error("Error en salones:", err); }
}

// Cargar Componentes en la Lista
async function cargarComponentes() {
    try {
        const res = await fetch(`${API_URL}/componentes-lista`);
        const data = await res.json();
        const select = document.getElementById('componentes');
        if (data.success) {
            select.innerHTML = '';
            data.componentes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.ID_Componentes;
                opt.textContent = `${c.Nombre} (${c.Marca})`;
                select.appendChild(opt);
            });
        }
    } catch (err) { console.error("Error en componentes:", err); }
}

// Listar Equipos en la Tabla
async function cargarEquipos() {
    try {
        const res = await fetch(`${API_URL}/listar`);
        const data = await res.json();
        const tbody = document.querySelector('#tabla-equipos tbody');
        tbody.innerHTML = '';
        if (data.success) {
            data.equipos.forEach(eq => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                tr.innerHTML = `
                    <td>${eq.ClaveUnicaEquipo}</td>
                    <td>${eq.Nombre}</td>
                    <td>${eq.Nombre_Salon || 'Sin salón'}</td>
                    <td>${eq.Tipo}</td>
                    <td>${eq.Fecha_Entrada ? new Date(eq.Fecha_Entrada).toLocaleDateString() : 'N/A'}</td>
                `;
                tr.onclick = () => seleccionarEquipo(eq);
                tbody.appendChild(tr);
            });
        }
    } catch (err) { console.error("Error al listar:", err); }
}

function seleccionarEquipo(eq) {
    idSeleccionado = eq.Id_equipo;
    document.getElementById('salon').value = eq.Salones_ID_Salon || '';
    document.getElementById('nombreEquipo').value = eq.Nombre || '';
    document.getElementById('tipo').value = eq.Tipo || '';
    document.getElementById('fecha').value = eq.Fecha_Entrada ? eq.Fecha_Entrada.split('T')[0] : '';
    document.getElementById('clave').value = eq.ClaveUnicaEquipo || '';

    document.getElementById('btnActualizar').disabled = false;
    document.getElementById('btnBorrar').disabled = false;
    document.getElementById('btnGuardar').disabled = true;
}

async function guardarEquipo() {
    const componentesSelect = document.getElementById('componentes');
    const componentesSeleccionados = Array.from(componentesSelect.selectedOptions).map(opt => opt.value);

    const equipo = {
        idSalon: document.getElementById('salon').value,
        nombre: document.getElementById('nombreEquipo').value,
        tipo: document.getElementById('tipo').value,
        fecha: document.getElementById('fecha').value,
        clave: document.getElementById('clave').value,
        componentes: componentesSeleccionados
    };

    try {
        const res = await fetch(`${API_URL}/guardar`, {
            method: 'POST',
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
    } catch (err) { Toast.fire({ icon: 'error', title: 'Error de conexión' }); }
}

async function actualizarEquipo() {
    const equipo = {
        idSalon: document.getElementById('salon').value,
        nombre: document.getElementById('nombreEquipo').value,
        tipo: document.getElementById('tipo').value,
        fecha: document.getElementById('fecha').value,
        clave: document.getElementById('clave').value
    };

    try {
        const res = await fetch(`${API_URL}/actualizar/${idSeleccionado}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipo)
        });
        const data = await res.json();
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            cargarEquipos();
            limpiarFormulario();
        }
    } catch (err) { console.error("Error:", err); }
}

async function borrarEquipo() {
    try {
        const res = await fetch(`${API_URL}/borrar/${idSeleccionado}`, { method: 'PUT' });
        const data = await res.json();
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            cargarEquipos();
            limpiarFormulario();
        }
    } catch (err) { console.error("Error:", err); }
}

function limpiarFormulario() {
    idSeleccionado = null;
    document.querySelectorAll('input, select').forEach(i => i.value = '');
    document.getElementById('btnActualizar').disabled = true;
    document.getElementById('btnBorrar').disabled = true;
    document.getElementById('btnGuardar').disabled = false;
}