const API_URL = 'http://localhost:3000/api/roles';

// Función para eliminar
async function eliminarRol(id) {
    if (!confirm("¿Seguro que quieres eliminar este rol?")) return;
    const res = await fetch(`${API_URL}/eliminar/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    actualizarTabla();
}

// Función para editar
async function editarRol(id, nombreActual) {
    const nuevoNombre = prompt("Editar nombre del rol:", nombreActual);
    if (!nuevoNombre || nuevoNombre === nombreActual) return;

    const res = await fetch(`${API_URL}/actualizar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre })
    });
    const data = await res.json();
    alert(data.message);
    actualizarTabla();
}

async function cargarRoles() {
    try {
        // Usamos la ruta que definiste en el backend
        const respuesta = await fetch(`${API_URL_ROLES}/listar-roles`);
        const data = await respuesta.json();

        const tablaBody = document.querySelector('#tabla-roles tbody');
        if (!tablaBody) return console.error("No se encontró la tabla con ID #tabla-roles");
        
        tablaBody.innerHTML = ''; 

        if (data.success && data.roles) {
            data.roles.forEach(rol => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${rol.id}</td>
                    <td>${rol.nombre}</td>
                    <td>
                        <button class="btn-edit" onclick="editarRol(${rol.id}, '${rol.nombre}')">Editar</button>
                        <button class="btn-delete" onclick="eliminarRol(${rol.id})">Borrar</button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error("Error al cargar roles:", error);
    }
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', cargarRoles);