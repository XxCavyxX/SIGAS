document.addEventListener('DOMContentLoaded', () => {
    const rol = localStorage.getItem('userRole');
    const nombre = localStorage.getItem('userName');
    const showWelcome = localStorage.getItem('showWelcome');

    // 1. Mostrar mensaje estilo Toast (como en image_feafa3.png)
    if (showWelcome === 'true') {
        let mensaje = `Bienvenido a SIGAS, ${nombre}`;
        
        // Si el rol es 1 (Administrador), personalizamos el mensaje
        if (rol == "1") { 
            mensaje = `Bienvenido Administrador: ${nombre}`;
        }

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
        });

        Toast.fire({
            icon: 'success',
            title: mensaje
        });

        // Limpiamos la bandera para que no salga el mensaje cada vez que refresque
        localStorage.removeItem('showWelcome');
    }

    // 2. Configurar el menú según el Rol
    const contenedorOpciones = document.getElementById('contenedor-opciones');
    
    if (rol == "1") {
        // Opciones exclusivas para Administrador
        contenedorOpciones.innerHTML = `
            <button onclick="location.href='usuarios.html'">Gestionar Usuarios</button>
            <button onclick="location.href='reportes.html'">Ver Reportes</button>
            <button onclick="location.href='roles.html'">Configurar Roles</button>
        `;
    } else {
        // Opciones para otros roles (Maestro, Técnico, etc.)
        contenedorOpciones.innerHTML = `
            <button onclick="location.href='perfil.html'">Mi Perfil</button>
            <button onclick="location.href='inventario.html'">Consultar Inventario</button>
        `;
    }
});