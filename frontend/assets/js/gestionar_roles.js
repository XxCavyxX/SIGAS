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
        const res = await fetch(`${API_URL}/listar`);
        const data = await res.json();
        const tbody = document.querySelector('#tablaRoles tbody');
        if (!tbody) return;
        tbody.innerHTML = ''; 

        if (data.success && data.roles) {
            data.roles.forEach(rol => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${rol.Nombre}</td>
                    <td style="text-align: right; padding-right: 20px;">
                        <button class="btn-edit" onclick="editarRol(${rol.ID_roles}, '${rol.Nombre}')">Editar</button>
                        <button class="btn-delete" onclick="eliminarRol(${rol.ID_roles}, '${rol.Nombre}')">Borrar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) { console.error("Error al cargar:", err); }
}

async function guardarRol() {
    const input = document.getElementById('nombreRol');
    const nombre = input.value.trim();
    if (!nombre) return Toast.fire({ icon: 'warning', title: 'Ingresa un nombre de rol' });

    try {
        const res = await fetch(`${API_URL}/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        const data = await res.json();
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            input.value = '';
            cargarRoles();
        } else {
            Toast.fire({ icon: 'error', title: data.message });
        }
    } catch (err) { Toast.fire({ icon: 'error', title: 'Error de conexión' }); }
}

async function editarRol(id, nombreActual) {
    const { value: nuevoNombre } = await Swal.fire({
        title: 'Editar Rol',
        input: 'text',
        inputValue: nombreActual,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        confirmButtonColor: '#6a1b31',
        cancelButtonColor: '#6c757d',
        inputValidator: (value) => { if (!value) return 'El nombre es obligatorio'; }
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
            }
        } catch (err) { Toast.fire({ icon: 'error', title: 'Error al actualizar' }); }
    }
}

async function eliminarRol(id, nombre) {
    const result = await Swal.fire({
        title: `¿Dar de baja: ${nombre}?`,
        text: "Se verificará que no existan usuarios vinculados.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        confirmButtonColor: '#6a1b31',
        cancelButtonColor: '#6c757d'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`${API_URL}/eliminar/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                Toast.fire({ icon: 'success', title: data.message });
                cargarRoles();
            } else {
                Swal.fire({ title: 'No se puede eliminar', text: data.message, icon: 'error', confirmButtonColor: '#6a1b31' });
            }
        } catch (err) { Toast.fire({ icon: 'error', title: 'Error de servidor' }); }
    }
}