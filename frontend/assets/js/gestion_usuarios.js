const API_URL = 'http://localhost:3000/api/usuarios';

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

// 2. Función para llenar la tabla (SOLO MUESTRA ACTIVOS)
async function actualizarTabla() {
    try {
        // El backend ahora filtra por Estatus_ID_Estatus = 1
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

// 3. GUARDAR (Con validación de correo repetido)
btnGuardar.addEventListener('click', async () => {
    const datos = obtenerDatosForm();
    
    // Validación simple antes de enviar
    if (!datos.correo) return alert("El correo es obligatorio");

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datos)
        });
        
        const result = await res.json();

        if (res.ok && result.success) {
            alert("Usuario registrado exitosamente");
            form.reset();
            actualizarTabla();
            configuracionInicial();
        } else {
            // AQUÍ CAPTURAMOS EL ERROR DE CORREO REPETIDO
            // El backend debe enviar un status 400 o un mensaje específico
            alert(result.message || "Ese correo ya está registrado en el sistema");
        }
    } catch (err) {
        alert("Error de conexión con el servidor");
    }
});

// 4. ACTUALIZAR (Usando el correo como identificador)
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
            alert("Datos actualizados correctamente");
            actualizarTabla();
            form.reset();
            configuracionInicial();
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Error al actualizar:", err);
    }
});

// 5. BORRAR (BAJA LÓGICA: Cambia estatus de 1 a 2)
btnBorrar.addEventListener('click', async () => {
    const correo = document.getElementById('correo').value;
    const nombre = document.getElementById('nombre').value;
    
    if (!correo) return alert("Selecciona un usuario de la tabla primero");
    
    if (!confirm(`¿Estás seguro de dar de baja a ${nombre}? (Ya no aparecerá en la lista)`)) return;

    try {
        const res = await fetch(`${API_URL}/borrar`, {
            method: 'DELETE', // O PUT, según como lo hayas definido en tu Backend
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: correo }) // Enviamos el correo para identificarlo
        });
        
        const result = await res.json();

        if (result.success) {
            alert("Usuario dado de baja exitosamente");
            actualizarTabla(); // Esto lo quitará de la vista porque el filtro del backend actuará
            form.reset();
            configuracionInicial();
        } else {
            alert("No se pudo realizar la baja: " + result.message);
        }
    } catch (err) { 
        console.error("Error en la baja lógica:", err); 
    }
});

// --- FUNCIONES AUXILIARES ---

function obtenerDatosForm() {
    return {
        id: document.getElementById('userId').value,
        nombre: document.getElementById('nombre').value.trim(),
        paterno: document.getElementById('paterno').value,
        materno: document.getElementById('materno').value,
        pass: document.getElementById('pass').value,
        correo: document.getElementById('correo').value.trim(),
        telefono: document.getElementById('telefono').value,
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
    document.getElementById('sexo').value = user.Sexo_ID_Sexo;
    document.getElementById('depto').value = user.Departamentos_ID_Departamentos;
    document.getElementById('rol').value = user.Roles_ID_roles;

    // El correo no debería editarse si es nuestra llave única
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

// ... Mantén tus funciones de cargarOpciones() y poblarSelect() igual ...