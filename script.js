document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('usuario').value;
    alert('Intentando entrar con el usuario: ' + user);
});