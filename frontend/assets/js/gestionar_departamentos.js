const API_URL = 'http://localhost:3000/api/deptos';

// Configuración Toast para notificaciones (Estilo institucional)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

document.addEventListener('DOMContentLoaded', () => {
    cargarDepartamentos(); 
    document.getElementById('btnGuardar').addEventListener('click', guardarDepto);
});

// 1. Cargar la tabla
async function cargarDepartamentos() {
    try {
        const res = await fetch(`${API_URL}/listar`);
        const data = await res.json();
        const tbody = document.querySelector('#tabla-departamentos tbody');
        
        if (!tbody) return;
        tbody.innerHTML = '';

        if (data.success && data.departamentos) {
            data.departamentos.forEach(depto => {
                const tr = document.createElement('tr');
                
                // Usamos depto.Nombre para las funciones porque así están tus rutas de backend
                tr.innerHTML = `
                    <td>${depto.Nombre}</td>
                    <td class="acciones-celda">
                        <button class="btn-editar-tabla" onclick="abrirModalEditar('${depto.Nombre}')">Editar</button>
                        <button class="btn-borrar-tabla" onclick="eliminarDepto('${depto.Nombre}')">Borrar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Error al cargar:", err);
        Toast.fire({ icon: 'error', title: 'No se pudo cargar la lista' });
    }
}

// 2. Modal para editar (Ajustado a colores guinda/oro)
async function abrirModalEditar(nombreActual) {
    const { value: nuevoNombre } = await Swal.fire({
        title: 'Editar Departamento',
        input: 'text',
        inputLabel: 'Nuevo nombre del departamento',
        inputValue: nombreActual,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#6a1b31', // Guinda ITS
        cancelButtonColor: '#6c757d',
        inputValidator: (value) => {
            if (!value) return '¡El nombre no puede estar vacío!';
        }
    });

    if (nuevoNombre && nuevoNombre !== nombreActual) {
        ejecutarActualizacion(nuevoNombre, nombreActual);
    }
}

// 3. Ejecutar actualización en el servidor
async function ejecutarActualizacion(nombreNuevo, nombreAnterior) {
    try {
        const res = await fetch(`${API_URL}/actualizar-por-nombre`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreNuevo, nombreAnterior })
        });
        const data = await res.json();
        
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            cargarDepartamentos();
        } else {
            Toast.fire({ icon: 'error', title: data.message });
        }
    } catch (err) {
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    }
}

// 4. Guardar nuevo departamento
async function guardarDepto() {
    const inputNombre = document.getElementById('nombreDepto');
    const nombre = inputNombre.value.trim();

    if (!nombre) {
        return Toast.fire({ icon: 'warning', title: 'Ingresa un nombre de departamento' });
    }

    try {
        const res = await fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        const data = await res.json();
        
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            inputNombre.value = ''; // Limpiar input
            cargarDepartamentos();
        } else {
            Toast.fire({ icon: 'error', title: data.message });
        }
    } catch (err) { 
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    }
}

// 5. Borrar (Baja lógica) con validación
async function eliminarDepto(nombre) {
    const resultado = await Swal.fire({
        title: `¿Dar de baja: ${nombre}?`,
        text: "Si hay usuarios vinculados, la acción será rechazada.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#6a1b31', // Guinda ITS
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, dar de baja',
        cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
        try {
            const res = await fetch(`${API_URL}/borrar-por-nombre`, {
                method: 'PUT', // Usamos PUT por ser actualización de estatus
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });
            
            const data = await res.json();
            
            if (data.success) {
                Toast.fire({ icon: 'success', title: data.message });
                cargarDepartamentos();
            } else {
                // Muestra el error si hay usuarios asignados (Error 400 del servidor)
                Swal.fire({
                    title: 'No se puede eliminar',
                    text: data.message,
                    icon: 'error',
                    confirmButtonColor: '#6a1b31'
                });
            }
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Error al conectar con el servidor' });
        }
    }
}