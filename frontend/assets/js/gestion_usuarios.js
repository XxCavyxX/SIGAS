/* ============================================================
   SIGAS — Gestión de Usuarios
   Correcciones: ID_Usuarios, Estatus_id_Estatus consistente
   ============================================================ */
 
const API_URL = 'http://localhost:3000/api/usuarios';
 
const Toast = Swal.mixin({
    toast: true, position: 'top-end',
    showConfirmButton: false, timer: 3000, timerProgressBar: true,
    didOpen: (t) => {
        t.addEventListener('mouseenter', Swal.stopTimer);
        t.addEventListener('mouseleave', Swal.resumeTimer);
    }
});
 
const form         = document.getElementById('usuarioForm');
const btnGuardar   = document.getElementById('btnGuardar');
const btnActualizar= document.getElementById('btnActualizar');
const btnBorrar    = document.getElementById('btnBorrar');
 
// ──────────────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarOpciones();
    actualizarTabla();
    configuracionInicial();
 
    btnGuardar.addEventListener('click',    guardar);
    btnActualizar.addEventListener('click', actualizar);
    btnBorrar.addEventListener('click',     borrar);
});
 
// ──────────────────────────────────────────────────────────────
// CARGAR SELECTS
// ──────────────────────────────────────────────────────────────
async function cargarOpciones() {
    try {
        const res  = await fetch(`${API_URL}/opciones`);
        const data = await res.json();
        if (data.success) {
            poblarSelect('sexo',  data.sexos);
            poblarSelect('depto', data.departamentos);
            poblarSelect('rol',   data.roles);
        }
    } catch (err) {
        console.error('Error al cargar opciones:', err);
        Toast.fire({ icon: 'error', title: 'Error al cargar catálogos.' });
    }
}
 
function poblarSelect(id, lista) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Seleccione...</option>';
    lista.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item.nombre;
        select.appendChild(opt);
    });
}
 
// ──────────────────────────────────────────────────────────────
// TABLA
// ──────────────────────────────────────────────────────────────
async function actualizarTabla() {
    try {
        const res  = await fetch(`${API_URL}/listar`);
        const data = await res.json();
        const tbody = document.querySelector('#tablaUsuarios tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
 
        if (data.success && data.usuarios.length > 0) {
            data.usuarios.forEach(user => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                tr.innerHTML = `
                    <td>${user.Nombre} ${user.Paterno || ''}</td>
                    <td>${user.Correo}</td>
                    <td>${user.nombre_depto || 'Sin asignar'}</td>
                    <td>${user.nombre_rol   || 'Sin asignar'}</td>
                `;
                tr.addEventListener('click', () => rellenarFormulario(user));
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#999;">No hay usuarios activos.</td></tr>';
        }
    } catch (err) { console.error('Error al actualizar tabla:', err); }
}
 
// ──────────────────────────────────────────────────────────────
// GUARDAR
// ──────────────────────────────────────────────────────────────
async function guardar() {
    const datos = obtenerDatosForm();
    if (!datos.correo || !datos.nombre || !datos.pass) {
        return Toast.fire({ icon: 'warning', title: 'Nombre, correo y contraseña son obligatorios.' });
    }
    try {
        const res    = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const result = await res.json();
        if (res.ok && result.success) {
            Toast.fire({ icon: 'success', title: result.message });
            form.reset();
            actualizarTabla();
            cargarOpciones();
            configuracionInicial();
        } else {
            Toast.fire({ icon: 'error', title: result.message || 'Error al guardar.' });
        }
    } catch { Toast.fire({ icon: 'error', title: 'Error de conexión con el servidor.' }); }
}
 
// ──────────────────────────────────────────────────────────────
// ACTUALIZAR
// ──────────────────────────────────────────────────────────────
async function actualizar() {
    const datos = obtenerDatosForm();
    try {
        const res    = await fetch(`${API_URL}/actualizar`, {
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
    } catch { Toast.fire({ icon: 'error', title: 'Error al intentar actualizar.' }); }
}
 
// ──────────────────────────────────────────────────────────────
// BORRAR (Baja Lógica)
// ──────────────────────────────────────────────────────────────
async function borrar() {
    const correo = document.getElementById('correo').value;
    const nombre = document.getElementById('nombre').value;
    if (!correo) return Toast.fire({ icon: 'warning', title: 'Selecciona un usuario primero.' });
 
    const conf = await Swal.fire({
        title: `¿Dar de baja a ${nombre}?`,
        text: 'El usuario no aparecerá en las listas activas.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, dar de baja',
        cancelButtonText: 'Cancelar'
    });
 
    if (!conf.isConfirmed) return;
 
    try {
        const res    = await fetch(`${API_URL}/borrar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
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
    } catch { Toast.fire({ icon: 'error', title: 'Error en el servidor.' }); }
}
 
// ──────────────────────────────────────────────────────────────
// AUXILIARES
// ──────────────────────────────────────────────────────────────
function obtenerDatosForm() {
    return {
        nombre:   document.getElementById('nombre').value.trim(),
        paterno:  document.getElementById('paterno').value.trim(),
        materno:  document.getElementById('materno').value.trim(),
        pass:     document.getElementById('pass').value,
        correo:   document.getElementById('correo').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        sexo:     document.getElementById('sexo').value,
        depto:    document.getElementById('depto').value,
        rol:      document.getElementById('rol').value
    };
}
 
function rellenarFormulario(user) {
    // FIX: la DB usa ID_Usuarios (mayúscula U)
    document.getElementById('userId').value    = user.ID_Usuarios;
    document.getElementById('nombre').value    = user.Nombre   || '';
    document.getElementById('paterno').value   = user.Paterno  || '';
    document.getElementById('materno').value   = user.Materno  || '';
    document.getElementById('correo').value    = user.Correo   || '';
    document.getElementById('telefono').value  = user.Telefono || '';
    document.getElementById('pass').value      = '';  // No se carga la contraseña por seguridad
    document.getElementById('sexo').value      = user.Sexo_ID_Sexo                    || '';
    document.getElementById('depto').value     = user.Departamentos_ID_Departamentos  || '';
    document.getElementById('rol').value       = user.Roles_ID_roles                  || '';
 
    document.getElementById('correo').readOnly = true;
    btnGuardar.disabled    = true;
    btnActualizar.disabled = false;
    btnBorrar.disabled     = false;
}
 
function configuracionInicial() {
    document.getElementById('correo').readOnly = false;
    btnGuardar.disabled    = false;
    btnActualizar.disabled = true;
    btnBorrar.disabled     = true;
}
 