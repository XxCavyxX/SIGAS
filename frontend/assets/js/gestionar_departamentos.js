const API_URL = 'http://localhost:3000/api/deptos';

// Configuración Toast para notificaciones en la esquina (Imagen 2)
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

// Función para cargar la tabla con estilos de la Imagen 3
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
                
                // Botones con clases para el CSS (Imagen 3)
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
    }
}

// Ventana emergente centrada para editar (Imagen 4)
async function abrirModalEditar(nombreActual) {
    const { value: nuevoNombre } = await Swal.fire({
        title: 'Editar Departamento',
        input: 'text',
        inputValue: nombreActual,
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#6e54f3', // Color morado de tu imagen
        cancelButtonColor: '#6c757d',
        customClass: {
            input: 'swal2-input-custom'
        },
        inputValidator: (value) => {
            if (!value) return '¡El nombre no puede estar vacío!';
        }
    });

    if (nuevoNombre && nuevoNombre !== nombreActual) {
        ejecutarActualizacion(nuevoNombre, nombreActual);
    }
}

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

// Guardar nuevo
async function guardarDepto() {
    const nombre = document.getElementById('nombreDepto').value.trim();
    if (!nombre) return Toast.fire({ icon: 'warning', title: 'Ingresa un nombre' });

    try {
        const res = await fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        const data = await res.json();
        
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            document.getElementById('nombreDepto').value = '';
            cargarDepartamentos();
        } else {
            Toast.fire({ icon: 'error', title: data.message });
        }
    } catch (err) { 
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    }
}

// Borrar con confirmación
async function eliminarDepto(nombre) {
    const resultado = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a dar de baja: ${nombre}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    });

    if (resultado.isConfirmed) {
        const res = await fetch(`${API_URL}/borrar-por-nombre`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        const data = await res.json();
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            cargarDepartamentos();
        }
    }
}