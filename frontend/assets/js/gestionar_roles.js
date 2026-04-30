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
                    <td>${rol.Nombre}</td>
                    <td style="text-align: right;">
                        <button class="btn-edit" onclick="editarRol(${rol.ID_roles}, '${rol.Nombre}')">Editar</button>
                        <button class="btn-delete" onclick="eliminarRol(${rol.ID_roles}, '${rol.Nombre}')">Borrar</button>
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
            nombreInput.value = ''; 
            cargarRoles(); 
        } else {
            Toast.fire({
                icon: 'error',
                title: data.message
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
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#6e54f3', 
        cancelButtonColor: '#6c757d',
        customClass: {
            input: 'swal2-input-centrado'
        }
    });

    if (nuevoNombre && nuevoNombre !== nombreActual) {
        try {
            const res = await fetch(`${API_URL}/actualizar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nuevoNombre })
            });
            const data = await res.json();
            
            if (data.success) {
                Toast.fire({ icon: 'success', title: data.message });
                cargarRoles();
            } else {
                Toast.fire({ icon: 'error', title: data.message });
            }
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Error al actualizar' });
        }
    }
}

// Función actualizada para Baja Lógica
async function eliminarRol(id, nombre) {
    const confirmacion = await Swal.fire({
        title: `¿Dar de baja el rol: ${nombre}?`,
        text: "Se verificará que no existan usuarios vinculados.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#7b1e34',
        cancelButtonColor: '#6c757d'
    });

    if (confirmacion.isConfirmed) {
        try {
            const res = await fetch(`${API_URL}/eliminar/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                Toast.fire({ icon: 'success', title: data.message });
                cargarRoles();
            } else {
                // Aquí se mostrará: "No se puede dar de baja: hay X usuario(s) activos..."
                // Usando el estilo de la imagen que proporcionaste
                Toast.fire({ 
                    icon: 'error', 
                    title: data.message 
                });
            }
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Error de comunicación con el servidor' });
        }
    }
}