const API_URL = 'http://localhost:3000/api/usuarios';

// Referencias a los elementos del DOM
const form = document.getElementById('usuarioForm');
const btnGuardar = document.getElementById('btnGuardar');
const btnActualizar = document.getElementById('btnActualizar');
const btnBorrar = document.getElementById('btnBorrar');

// Se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarOpciones();
    configuracionInicial();
});

// Estado inicial de los botones (Opacos/Desactivados)
function configuracionInicial() {
    btnGuardar.disabled = false;
    btnActualizar.disabled = true;
    btnBorrar.disabled = true;
}

// 1. CARGAR MENÚS DESPLEGABLES (Sexo, Depto, Rol)
async function cargarOpciones() {
    try {
        const res = await fetch('http://localhost:3000/api/usuarios/opciones');
        const data = await res.json();
        
        console.log("Datos recibidos:", data); // Esto te dirá en la consola si llegaron bien

        if (data.success) {
            // Asegúrate que estos IDs existan en tu usuarios.html
            poblarSelect('sexo', data.sexos);
            poblarSelect('depto', data.departamentos);
            poblarSelect('rol', data.roles);
        }
    } catch (err) {
        console.error("Error al cargar:", err);
    }
}

function poblarSelect(id, lista) {
    const select = document.getElementById(id);
    if (!select) {
        console.warn(`No se encontró el select con id: ${id}`);
        return;
    }
    
    // Limpiar opciones previas (dejando solo la de "Seleccione...")
    select.innerHTML = '<option value="" disabled selected>Seleccione...</option>';

    lista.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nombre;
        select.appendChild(option);
    });
}
function poblarSelect(id, lista) {
    const select = document.getElementById(id);
    if (!select) return;
    lista.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nombre;
        select.appendChild(option);
    });
}

// 2. BUSCAR USUARIO (Al escribir el nombre y salir del campo)
// Ejemplo para la búsqueda (Evento blur)
document.getElementById('nombre').addEventListener('blur', async (e) => {
    const nombre = e.target.value;
    if (!nombre) return;

    try {
        const res = await fetch(`${API_URL}/buscar?nombre=${nombre}`);
        
        // Validamos si la respuesta es JSON antes de procesar
        if (!res.ok) throw new Error("Usuario no encontrado o error en servidor");
        
        const usuario = await res.json();
        if (usuario) {
            llenarFormulario(usuario); // Tu función para poner los datos en los inputs
            btnGuardar.disabled = true;
            btnActualizar.disabled = false;
            btnBorrar.disabled = false;
        }
    } catch (err) {
        console.log("Aviso:", err.message);
        // Si no existe, habilitamos el botón de guardar para uno nuevo
        btnGuardar.disabled = false;
        btnActualizar.disabled = true;
        btnBorrar.disabled = true;
    }
});

// 3. GUARDAR (Alta de usuario)
btnGuardar.addEventListener('click', async () => {
    const datos = obtenerDatosForm();
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datos)
        });
        const result = await res.json();
        if (result.success) {
            alert("Usuario registrado exitosamente");
            form.reset();
            configuracionInicial();
        }
    } catch (err) {
        alert("Error al guardar");
    }
});

// 4. ACTUALIZAR
btnActualizar.addEventListener('click', async () => {
    const datos = obtenerDatosForm();
    try {
        const res = await fetch(`${API_URL}/actualizar`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datos)
        });
        if (res.ok) {
            alert("Datos actualizados correctamente");
            form.reset();
            configuracionInicial();
        }
    } catch (err) {
        console.error(err);
    }
});

// 5. BORRAR
btnBorrar.addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value;
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;

    try {
        const res = await fetch(`${API_URL}/borrar`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nombre })
        });
        if (res.ok) {
            alert("Usuario eliminado");
            form.reset();
            configuracionInicial();
        }
    } catch (err) {
        console.error(err);
    }
});

// Función auxiliar para recolectar datos
function obtenerDatosForm() {
    return {
        nombre: document.getElementById('nombre').value,
        paterno: document.getElementById('paterno').value,
        materno: document.getElementById('materno').value,
        pass: document.getElementById('pass').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        sexo: document.getElementById('sexo').value,
        depto: document.getElementById('depto').value,
        rol: document.getElementById('rol').value
    };
}