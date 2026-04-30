const API_URL = 'http://localhost:3000/api/usuarios';

// --- CONFIGURACIÓN DE SWEETALERT (TOAST) ---
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

// Referencias a los elementos del DOM
const form = document.getElementById('usuarioForm');
const btnGuardar = document.getElementById('btnGuardar');
const btnActualizar = document.getElementById('btnActualizar');
const btnBorrar = document.getElementById('btnBorrar');

// 1. Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarOpciones();
    actualizarTabla(); 
    configuracionInicial();
});

async function cargarOpciones() {
    try {
        const res = await fetch('http://localhost:3000/api/usuarios/opciones');
        const data = await res.json();
        
        if (data.success) {
            poblarSelect('sexo', data.sexos);
            poblarSelect('depto', data.departamentos);
            poblarSelect('rol', data.roles);
        }
    } catch (err) {
        console.error("Error al cargar opciones:", err);
        Toast.fire({ icon: 'error', title: 'Error al cargar catálogos' });
    }
}

function poblarSelect(id, lista) {
    const select = document.getElementById(id);
    if (!select) return;
    
    select.innerHTML = '<option value="" disabled selected>Seleccione...</option>';
    lista.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nombre;
        select.appendChild(option);
    });
}

// 2. Función para llenar la tabla
async function actualizarTabla() {
    try {
        const res = await fetch(`${API_URL}/listar`);
        const data = await res.json();
        
        const tbody = document.querySelector('#tablaUsuarios tbody');
        if (!tbody) return;
        tbody.innerHTML = ''; 

        if (data.success) {
            data.usuarios.forEach(user => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                
                tr.innerHTML = `
                    <td>${user.Nombre} ${user.Paterno}</td>
                    <td>${user.Correo}</td>
                    <td>${user.nombre_depto || 'Sin asignar'}</td>
                    <td>${user.nombre_rol || 'Sin asignar'}</td>
                `;

                tr.addEventListener('click', () => rellenarFormulario(user));
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Error al actualizar tabla:", err);
    }
}

// 3. GUARDAR
btnGuardar.addEventListener('click', async () => {
    const datos = obtenerDatosForm();
    
    if (!datos.correo || !datos.nombre) {
        return Toast.fire({ icon: 'warning', title: 'Nombre y Correo son obligatorios' });
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datos)
        });
        
        const result = await res.json();

        if (res.ok && result.success) {
            Toast.fire({ icon: 'success', title: result.message });
            form.reset();
            actualizarTabla();
            configuracionInicial();
        } else {
            // Aquí muestra el error (ej: "Ese correo ya está registrado")
            Toast.fire({ icon: 'error', title: result.message || 'Error al guardar' });
        }
    } catch (err) {
        Toast.fire({ icon: 'error', title: 'Error de conexión con el servidor' });
    }
});

// 4. ACTUALIZAR
btnActualizar.addEventListener('click', async () => {
    const datos = obtenerDatosForm();
    
    try {
        const res = await fetch(`${API_URL}/actualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const result = await res.json();
        
        if (result.success) {
            Toast.fire({ icon: 'success', title: result.message });
            actualizarTabla();
            form.reset();
            configuracionInicial();
        } else {
            Toast.fire({ icon: 'error', title: result.message });
        }
    } catch (err) {
        Toast.fire({ icon: 'error', title: 'Error al intentar actualizar' });
    }
});

// 5. BORRAR (BAJA LÓGICA)
btnBorrar.addEventListener('click', async () => {
    const correo = document.getElementById('correo').value;
    const nombre = document.getElementById('nombre').value;
    
    if (!correo) return Toast.fire({ icon: 'warning', title: 'Selecciona un usuario primero' });
    
    // Usamos el modal de confirmación de SweetAlert en lugar del confirm() nativo
    const confirmacion = await Swal.fire({
        title: `¿Dar de baja a ${nombre}?`,
        text: "El usuario ya no aparecerá en las listas activas.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, dar de baja',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            const res = await fetch(`${API_URL}/borrar`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: correo })
            });
            
            const result = await res.json();

            if (result.success) {
                Toast.fire({ icon: 'success', title: result.message });
                actualizarTabla();
                form.reset();
                configuracionInicial();
            } else {
                Toast.fire({ icon: 'error', title: result.message });
            }
        } catch (err) { 
            Toast.fire({ icon: 'error', title: 'Error en el servidor' });
        }
    }
});

// --- FUNCIONES AUXILIARES ---

function obtenerDatosForm() {
    return {
        nombre: document.getElementById('nombre').value.trim(),
        paterno: document.getElementById('paterno').value.trim(),
        materno: document.getElementById('materno').value.trim(),
        pass: document.getElementById('pass').value,
        correo: document.getElementById('correo').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        sexo: document.getElementById('sexo').value,
        depto: document.getElementById('depto').value,
        rol: document.getElementById('rol').value
    };
}

function rellenarFormulario(user) {
    document.getElementById('userId').value = user.ID_usuarios;
    document.getElementById('nombre').value = user.Nombre || '';
    document.getElementById('paterno').value = user.Paterno || '';
    document.getElementById('materno').value = user.Materno || '';
    document.getElementById('correo').value = user.Correo || '';
    document.getElementById('telefono').value = user.Telefono || '';
    document.getElementById('pass').value = user.Pass || '';
    document.getElementById('sexo').value = user.Sexo_ID_Sexo || '';
    document.getElementById('depto').value = user.Departamentos_ID_Departamentos || '';
    document.getElementById('rol').value = user.Roles_ID_roles || '';

    document.getElementById('correo').readOnly = true;
    btnGuardar.disabled = true;
    btnActualizar.disabled = false;
    btnBorrar.disabled = false;
}

function configuracionInicial() {
    document.getElementById('correo').readOnly = false;
    btnGuardar.disabled = false;
    btnActualizar.disabled = true;
    btnBorrar.disabled = true;
}