// Función para guardar los datos del usuario en LocalStorage
function guardarDatosUsuario() {
    const nombre = document.getElementById('nombre').value;
    const genero = document.getElementById('genero').value;
    const altura = document.getElementById('altura').value;
    const peso = document.getElementById('peso').value;

    // Verificar que todos los campos estén completos
    if (nombre && genero && altura && peso) {
        // Crear un objeto con los datos
        const datosUsuario = {
            nombre: nombre,
            genero: genero,
            altura: parseFloat(altura),
            peso: parseFloat(peso)
        };

        // Guardar en LocalStorage
        localStorage.setItem('usuario', JSON.stringify(datosUsuario));

        alert('Datos guardados correctamente');
        
        // Redirigir al calendario
        window.location.href = 'calendario.html';  // Redirige al calendario
    } else {
        alert('Por favor, complete todos los campos.');
    }
}

// Función para eliminar los datos del usuario
function eliminarDatosUsuario() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos?')) {
        localStorage.removeItem('usuario');
        alert('Datos eliminados correctamente');
        
        // Limpiar los campos del formulario
        document.getElementById('formUsuario').reset();
    }
}

// Función para cargar los datos del usuario desde LocalStorage
function cargarDatosUsuario() {
    const datosUsuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (datosUsuario) {
        document.getElementById('nombre').value = datosUsuario.nombre;
        document.getElementById('genero').value = datosUsuario.genero;
        document.getElementById('altura').value = datosUsuario.altura;
        document.getElementById('peso').value = datosUsuario.peso;

        // Si los datos ya están guardados, redirigir al calendario
        window.location.href = 'calendario.html';
    }
}

function confirmarSalir() {
    const confirmacion = confirm("¿Seguro que deseas eliminar todos tus datos, incluyendo las rutinas?");
    if (confirmacion) {
        // Eliminar los datos del usuario
        localStorage.removeItem('usuario');
        
        // Eliminar las rutinas
        localStorage.removeItem('entrenamientos');
        
        // Redirigir al formulario de usuario (index.html)
        window.location.href = "index.html";  // Redirección a la página de inicio
    }
}




// Verificar si los datos ya están guardados al cargar la página
window.onload = function() {
    cargarDatosUsuario();

    // Agregar el evento al formulario para guardar los datos
    document.getElementById('formUsuario').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir el envío del formulario
        guardarDatosUsuario();
    });
};
