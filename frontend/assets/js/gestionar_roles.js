const API_URL = 'http://localhost:3000/api/roles';

document.addEventListener('DOMContentLoaded', () => {
    actualizarTabla();

    const btnGuardar = document.getElementById('btnGuardarRol');
    
    btnGuardar.addEventListener('click', async () => {
        const input = document.getElementById('nombreRol');
        const nombre = input.value.trim();

        if (!nombre) return alert("Ingresa un nombre para el rol");

        try {
            const res = await fetch(`${API_URL}/crear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });
            const data = await res.json();

            if (data.success) {
                alert("Rol guardado");
                input.value = '';
                actualizarTabla();
            }
        } catch (err) {
            console.error("Error al guardar:", err);
        }
    });
});

async function actualizarTabla() {
    try {
        const res = await fetch(`${API_URL}/listar`);
        const data = await res.json();
        const tbody = document.querySelector('#tablaRoles tbody');
        
        tbody.innerHTML = '';

        if (data.success) {
            data.roles.forEach(rol => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${rol.ID_roles}</td><td>${rol.Nombre}</td>`;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Error al listar:", err);
    }
}