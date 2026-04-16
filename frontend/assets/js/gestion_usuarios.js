const API_URL = 'http://localhost:3000/api/usuarios';

// Referencias a los elementos del DOM
const form = document.getElementById('usuarioForm');
const btnGuardar = document.getElementById('btnGuardar');
const btnActualizar = document.getElementById('btnActualizar');
const btnBorrar = document.getElementById('btnBorrar');

// Se ejecuta al cargar la página
// 1. Asegúrate de que se llame al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarOpciones();
    actualizarTabla(); 
});

// 2. Función para llenar la tabla dinámicamente
async function actualizarTabla() {
    try {
        const res = await fetch(`${API_URL}/listar`);
        const data = await res.json();
        
        const tbody = document.querySelector('#tablaUsuarios tbody');
        if (!tbody) return;
        tbody.innerHTML = ''; // Limpiamos la tabla antes de llenar

        if (data.success) {
            data.usuarios.forEach(user => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer'; // Para que el mouse cambie al pasar
                
                tr.innerHTML = `
                    <td>${user.Nombre} ${user.Paterno}</td>
                    <td>${user.Correo}</td>
                    <td>${user.nombre_depto || 'Sin asignar'}</td>
                    <td>${user.nombre_rol || 'Sin asignar'}</td>
                `;

                // EVENTO: Al hacer clic en la fila, se rellenan los inputs de arriba
                tr.addEventListener('click', () => rellenarFormulario(user));
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Error al actualizar tabla:", err);
    }
}

// 3. Función para rellenar los campos de inmediato
function rellenarFormulario(user) {
    document.getElementById('userId').value = user.ID_usuarios;
    document.getElementById('nombre').value = user.Nombre || '';
    document.getElementById('paterno').value = user.Paterno || '';
    document.getElementById('materno').value = user.Materno || '';
    document.getElementById('correo').value = user.Correo || '';
    document.getElementById('telefono').value = user.Telefono || '';
    document.getElementById('pass').value = user.Pass || '';
    document.getElementById('sexo').value = user.Sexo_ID_Sexo;
    document.getElementById('depto').value = user.Departamentos_ID_Departamentos;
    document.getElementById('rol').value = user.Roles_ID_roles;

    // Cambiamos el estado de los botones: Bloqueamos Guardar, activamos el resto
    document.getElementById('btnGuardar').disabled = true;
    document.getElementById('btnActualizar').disabled = false;
    document.getElementById('btnBorrar').disabled = false;
}

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

// EVENTO ACTUALIZAR
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
            alert(result.message);
            actualizarTabla(); // REFRESCAR TABLA INMEDIATAMENTE
            form.reset();
            configuracionInicial();
        }
    } catch (err) {
        console.error("Error en el PUT:", err);
    }
});

// EVENTO BORRAR
btnBorrar.addEventListener('click', async () => {
    const id = document.getElementById('userId').value;
    const nombre = document.getElementById('nombre').value;
    
    if (!id) return alert("Selecciona un usuario primero");
    if (!confirm(`¿Seguro que quieres borrar a ${nombre}?`)) return;

    try {
        const res = await fetch(`${API_URL}/borrar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }) // Mandamos el ID
        });
        // ... resto del código (alert, actualizarTabla, reset)
    } catch (err) { console.error(err); }
});
// Función auxiliar para recolectar datos
// Función para capturar los datos (Asegúrate de que el ID 'nombre' sea el correcto)
function obtenerDatosForm() {
    return {
        id: document.getElementById('userId').value, // <-- El valor del campo oculto
        nombre: document.getElementById('nombre').value.trim(),
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

// Ejemplo de cómo debe verse el evento de Actualizar
btnActualizar.addEventListener('click', async () => {
    const datos = obtenerDatosForm();
    
    // Validación extra en frontend
    if (!datos.nombre) {
        alert("Primero selecciona un usuario de la tabla o escribe su nombre.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/actualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const result = await res.json();
        
        if (result.success) {
            alert(result.message);
            actualizarTabla(); // Recargamos la tabla para ver el cambio
            form.reset();
            configuracionInicial();
        }
    } catch (err) {
        console.error("Error al actualizar:", err);
    }
});