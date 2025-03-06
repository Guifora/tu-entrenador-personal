document.addEventListener("DOMContentLoaded", function () {
    const formUsuario = document.getElementById("formUsuario");

    // Verificar si ya existen datos guardados
    const usuarioGuardado = obtenerUsuario();
    if (usuarioGuardado) {
        document.getElementById("nombre").value = usuarioGuardado.nombre;
        document.getElementById("genero").value = usuarioGuardado.genero;
        document.getElementById("altura").value = usuarioGuardado.altura;
        document.getElementById("peso").value = usuarioGuardado.peso;
    }

    // Guardar datos al enviar el formulario
    formUsuario.addEventListener("submit", function (event) {
        event.preventDefault(); // Evitar recarga

        const nombre = document.getElementById("nombre").value;
        const genero = document.getElementById("genero").value;
        const altura = parseInt(document.getElementById("altura").value);
        const peso = parseInt(document.getElementById("peso").value);

        guardarUsuario(nombre, genero, altura, peso);
        alert("Datos guardados correctamente.");
    });
});

// Función para guardar datos en LocalStorage
function guardarUsuario(nombre, genero, altura, peso) {
    const usuario = { nombre, genero, altura, peso };
    localStorage.setItem("usuario", JSON.stringify(usuario));
}

// Función para obtener datos desde LocalStorage
function obtenerUsuario() {
    const usuario = localStorage.getItem("usuario");
    return usuario ? JSON.parse(usuario) : null;
}

// Función para eliminar datos del usuario
function eliminarDatosUsuario() {
    if (confirm("¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.")) {
        localStorage.removeItem("usuario");
        alert("Datos eliminados correctamente.");
        location.reload(); // Recargar la página
    }
}
