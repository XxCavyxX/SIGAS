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
    document.getElementById('btnPDF').addEventListener('click', generarPDF);
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
    // El motivo no se carga usualmente al seleccionar para edición, pero podrías hacerlo si quisieras:
    document.getElementById('motivo').value = eq.Motivo || '';

    document.getElementById('btnActualizar').disabled = false;
    document.getElementById('btnBorrar').disabled = false;
    document.getElementById('btnGuardar').disabled = true;
}

// GUARDAR (ALTA)
async function guardarEquipo() {
    const motivo = document.getElementById('motivo').value;
    
    // Validación de motivo para el alta
    if (!motivo) {
        return Swal.fire('Atención', 'Por favor, ingrese un motivo para el alta del equipo.', 'warning');
    }

    const componentesSelect = document.getElementById('componentes');
    const componentesSeleccionados = Array.from(componentesSelect.selectedOptions).map(opt => opt.value);

    const equipo = {
        idSalon: document.getElementById('salon').value,
        nombre: document.getElementById('nombreEquipo').value,
        tipo: document.getElementById('tipo').value,
        fecha: document.getElementById('fecha').value,
        clave: document.getElementById('clave').value,
        motivo: motivo,
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
            Swal.fire('¡Éxito!', data.message, 'success');
            cargarEquipos();
            limpiarFormulario();
        } else {
            Swal.fire('Error', data.message, 'error');
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

// BORRAR (BAJA)
async function borrarEquipo() {
    // 1. Pedir motivo obligatoriamente con SweetAlert2
    const { value: motivoBaja } = await Swal.fire({
        title: '¿Confirmar Baja de Equipo?',
        text: "Indique la razón por la cual se retira el equipo del inventario:",
        input: 'textarea',
        inputPlaceholder: 'Ej: Falla irreparable, Donación, Reemplazo...',
        showCancelButton: true,
        confirmButtonColor: '#6a1b31',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Confirmar Baja',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) return '¡El motivo de la baja es obligatorio!';
        }
    });

    if (motivoBaja) {
        try {
            const res = await fetch(`${API_URL}/borrar/${idSeleccionado}`, { 
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
        } catch (err) { console.error("Error:", err); }
    }
}

// GENERAR PDF
async function generarPDF() {
    try {
        const res = await fetch(`${API_URL}/reporte-completo`);
        const data = await res.json();
        
        if (!data.success) return Swal.fire('Error', 'No se pudieron obtener los datos para el reporte', 'error');

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');

        // Diseño del PDF
        doc.setFontSize(22);
        doc.setTextColor(44, 114, 161);
        doc.text("SIGAS", 300, 50, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("SISTEMA DE GESTIÓN DE ACTIVOS", 300, 65, { align: 'center' });
        
        doc.setDrawColor(106, 27, 49); // Color guinda
        doc.setLineWidth(2);
        doc.line(40, 80, 560, 80);

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text("REPORTE DE INVENTARIO GENERAL", 300, 110, { align: 'center' });

        const columns = [
            { header: 'CLAVE', dataKey: 'ClaveUnicaEquipo' },
            { header: 'EQUIPO (TIPO)', dataKey: 'EquipoInfo' },
            { header: 'SALÓN', dataKey: 'Ubicacion' },
            { header: 'ESTADO', dataKey: 'Estatus' }
        ];

        const rows = data.equipos.map(eq => ({
            ClaveUnicaEquipo: eq.ClaveUnicaEquipo,
            EquipoInfo: `${eq.Equipo}\n(${eq.Tipo})`,
            Ubicacion: eq.Ubicacion || 'N/A',
            Estatus: eq.Estatus || 'ACTIVO'
        }));

        doc.autoTable({
            columns: columns,
            body: rows,
            startY: 140,
            theme: 'grid',
            headStyles: { fillColor: [106, 27, 49], textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
            columnStyles: { 3: { halign: 'center', fontStyle: 'bold' } }
        });

        doc.save(`Reporte_SIGAS_${new Date().getTime()}.pdf`);

    } catch (err) {
        console.error("Error PDF:", err);
        Swal.fire('Error', 'Hubo un problema al generar el documento PDF', 'error');
    }
}

function limpiarFormulario() {
    idSeleccionado = null;
    document.querySelectorAll('input, select, textarea').forEach(i => i.value = '');
    document.getElementById('btnActualizar').disabled = true;
    document.getElementById('btnBorrar').disabled = true;
    document.getElementById('btnGuardar').disabled = false;
}