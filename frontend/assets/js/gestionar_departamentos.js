const API_URL = 'http://localhost:3000/api/deptos';

// Variable global para rastrear el nombre original antes de ser editado
let nombreOriginal = ""; 

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

function mostrarToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerText = mensaje;

    container.appendChild(toast);

    // Eliminar la notificación después de 3 segundos
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 1. Cargar datos al iniciar y configurar eventos
document.addEventListener('DOMContentLoaded', () => {
    cargarDepartamentos(); 
    gestionarBotones(false); 

    document.getElementById('btnGuardar').addEventListener('click', guardarDepto);
    document.getElementById('btnActualizar').addEventListener('click', actualizarDepto);
    document.getElementById('btnBorrar').addEventListener('click', () => {
        const nombre = document.getElementById('nombreDepto').value.trim();
        if (nombre) eliminarDepto(nombre);
        else mostrarToast("Selecciona un departamento primero", "error");
    });
});

// Función para habilitar/deshabilitar botones según la selección
function gestionarBotones(seleccionado) {
    document.getElementById('btnGuardar').disabled = seleccionado;
    document.getElementById('btnActualizar').disabled = !seleccionado;
    document.getElementById('btnBorrar').disabled = !seleccionado;
}

async function prepararBorrado() {
    const nombre = document.getElementById('nombreDepto').value.trim();
    if (!nombre) {
        return Toast.fire({ icon: 'error', title: 'Selecciona un departamento' });
    }

    // Ventana emergente de confirmación
    const resultado = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a dar de baja el departamento: ${nombre}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
        ejecutarBorrado(nombre);
    }
}

async function ejecutarBorrado(nombre) {
    try {
        const res = await fetch(`${API_URL}/borrar-por-nombre`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        const data = await res.json();
        
        if (data.success) {
            Toast.fire({ icon: 'success', title: data.message });
            document.getElementById('nombreDepto').value = '';
            gestionarBotones(false);
            cargarDepartamentos();
        } else {
            Toast.fire({ icon: 'error', title: data.message });
        }
    } catch (err) {
        Toast.fire({ icon: 'error', title: 'Error al conectar con el servidor' });
    }
}

// 2. Función para GUARDAR un nuevo departamento
async function guardarDepto() {
    const nombre = document.getElementById('nombreDepto').value.trim();
    if (!nombre) return Toast.fire({ icon: 'error', title: 'Ingresa un nombre' });

    try {
        const res = await fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        const data = await res.json();
        
        Toast.fire({ 
            icon: data.success ? 'success' : 'error', 
            title: data.message 
        });

        if (data.success) {
            document.getElementById('nombreDepto').value = '';
            cargarDepartamentos();
        }
    } catch (err) { console.error(err); }
}

// 3. Función para ACTUALIZAR
async function actualizarDepto() {
    const nombreNuevo = document.getElementById('nombreDepto').value.trim();
    if (!nombreNuevo || !nombreOriginal) {
        return Toast.fire({ icon: 'error', title: 'Selecciona un registro' });
    }

    try {
        const res = await fetch(`${API_URL}/actualizar-por-nombre`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreNuevo, nombreAnterior: nombreOriginal })
        });
        const data = await res.json();
        
        Toast.fire({ 
            icon: data.success ? 'success' : 'error', 
            title: data.message 
        });

        if (data.success) {
            document.getElementById('nombreDepto').value = '';
            nombreOriginal = "";
            gestionarBotones(false);
            cargarDepartamentos();
        }
    } catch (err) { console.error(err); }
}
// 4. Función para LLENAR LA TABLA
async function cargarDepartamentos() {
    try {
        const res = await fetch(`${API_URL}/listar`);
        const data = await res.json();
        const tbody = document.querySelector('#tabla-departamentos tbody');
        
        tbody.innerHTML = '';

        if (data.success && data.departamentos) {
            data.departamentos.forEach(depto => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                tr.innerHTML = `
                    <td>${depto.id}</td>
                    <td>${depto.Nombre}</td>
                `;

                tr.addEventListener('click', () => {
                    // LLENADO DE DATOS AL SELECCIONAR
                    document.getElementById('nombreDepto').value = depto.Nombre;
                    nombreOriginal = depto.Nombre; // GUARDAR EL VALOR ACTUAL
                    gestionarBotones(true);
                    
                    document.querySelectorAll('#tabla-departamentos tr').forEach(r => r.style.background = '');
                    tr.style.background = '#f0f0f0';
                });

                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Error al cargar:", err);
    }
}

// 5. Función para BORRAR (BAJA LÓGICA)
async function eliminarDepto(nombre) {
    // 1. Ventana emergente para preguntar si está seguro
    const resultado = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a dar de baja el departamento: ${nombre}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6', // Azul para confirmar
        cancelButtonColor: '#d33',    // Rojo para cancelar
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    // Si el usuario cancela, no hacemos nada
    if (!resultado.isConfirmed) return;

    try {
        const res = await fetch(`${API_URL}/borrar-por-nombre`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre })
        });
        
        const data = await res.json();

        // 2. Ventana emergente para mostrar el éxito o error
        if (data.success) {
            Swal.fire({
                title: '¡Eliminado!',
                text: data.message,
                icon: 'success',
                timer: 2000, // Se cierra sola en 2 segundos
                showConfirmButton: false
            });

            // Limpiar y refrescar
            document.getElementById('nombreDepto').value = '';
            gestionarBotones(false);
            cargarDepartamentos(); 
        } else {
            Swal.fire('Error', data.message, 'error');
        }

    } catch (err) {
        console.error("Error al eliminar:", err);
        Swal.fire('Error de conexión', 'No se pudo contactar con el servidor', 'error');
    }
}