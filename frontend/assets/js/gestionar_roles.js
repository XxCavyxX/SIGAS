const API_URL = 'http://localhost:3000/api/roles';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
});

document.addEventListener('DOMContentLoaded', () => {
    cargarRoles();
    document.getElementById('btnGuardarRol').addEventListener('click', guardarRol);
});

async function cargarRoles() {
    try {
        const respuesta = await fetch(`${API_URL}/listar`);
        const data = await respuesta.json();
        const tablaBody = document.querySelector('#tablaRoles tbody');
        
        if (!tablaBody) return;
        tablaBody.innerHTML = ''; 

        if (data.success && data.roles) {
            data.roles.forEach(rol => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${rol.ID_roles}</td>
                    <td>${rol.Nombre}</td>
                    <td>
                        <button class="btn-edit" onclick="editarRol(${rol.ID_roles}, '${rol.Nombre}')">Editar</button>
                        <button class="btn-delete" onclick="eliminarRol(${rol.ID_roles})">Borrar</button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error("Error al cargar roles:", error);
    }
}

async function guardarRol() {
    const nombreInput = document.getElementById('nombreRol');
    const nombre = nombreInput.value.trim();

    if (!nombre) {
        return Toast.fire({ icon: 'warning', title: 'Por favor, escribe un nombre de rol' });
    }

    try {
        const res = await fetch(`${API_URL}/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });

        const data = await res.json();

        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            nombreInput.value = ''; // Limpiar el input
            cargarRoles(); // Refrescar la tabla
        } else {
            // AQUÍ SE MUESTRA LA VENTANA EMERGENTE DE ERROR
            Swal.fire({
                icon: 'error',
                title: 'No se pudo agregar',
                text: data.message, // Mostrará: "Este rol ya está dado de alta..."
                confirmButtonColor: '#7b1e34' // Color guinda institucional
            });
        }
    } catch (err) {
        Toast.fire({ icon: 'error', title: 'Error de conexión con el servidor' });
    }
}
async function editarRol(id, nombreActual) {
    const { value: nuevoNombre } = await Swal.fire({
        title: 'Editar Rol',
        input: 'text',
        inputValue: nombreActual,
        showCancelButton: true
    });

    if (nuevoNombre && nuevoNombre !== nombreActual) {
        const res = await fetch(`${API_URL}/actualizar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nuevoNombre })
        });
        const data = await res.json();
        Toast.fire({ icon: 'success', title: data.message });
        cargarRoles();
    }
}

async function eliminarRol(id) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar'
    });

    if (confirmacion.isConfirmed) {
        const res = await fetch(`${API_URL}/eliminar/${id}`, { method: 'DELETE' });
        const data = await res.json();
        Toast.fire({ icon: 'success', title: data.message });
        cargarRoles();
    }
}