// Función para mostrar notificaciones visuales
function mostrarNotificacion(mensaje, tipo = 'success') {
    const contenedor = document.createElement('div');
    contenedor.className = `alert alert-${tipo} alert-dismissible fade show fixed-top m-3`;
    contenedor.role = 'alert';
    contenedor.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.prepend(contenedor);
    
    // Eliminar automáticamente después de 3 segundos
    setTimeout(() => {
        contenedor.remove();
    }, 3000);
}

// Validación mejorada de datos
function validarDatosUsuario(usuario) {
    const errores = [];
    
    if (!usuario.nombre || usuario.nombre.trim().length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!usuario.altura || usuario.altura < 140 || usuario.altura > 220) {
        errores.push('La altura debe estar entre 140 y 220 cm');
    }
    
    if (!usuario.peso || usuario.peso < 40 || usuario.peso > 200) {
        errores.push('El peso debe estar entre 40 y 200 kg');
    }
    
    return errores;
}

// Guardar datos con validación mejorada
function guardarDatosUsuario(evento) {
    evento.preventDefault();
    
    const usuario = {
        nombre: document.getElementById('nombre').value.trim(),
        genero: document.getElementById('genero').value,
        altura: parseInt(document.getElementById('altura').value),
        peso: parseInt(document.getElementById('peso').value)
    };
    
    const errores = validarDatosUsuario(usuario);
    
    if (errores.length > 0) {
        errores.forEach(error => mostrarNotificacion(error, 'danger'));
        return;
    }
    
    try {
        localStorage.setItem('usuarioConfig', JSON.stringify(usuario));
        mostrarNotificacion('Datos guardados correctamente! Redirigiendo...');
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'calendario.html';
        }, 1500);
        
    } catch (error) {
        mostrarNotificacion('Error al guardar los datos', 'danger');
        console.error('Error de almacenamiento:', error);
    }
}

// Cargar datos con manejo de errores
function cargarDatosUsuario() {
    try {
        const datos = localStorage.getItem('usuarioConfig');
        if (!datos) return null;
        
        const usuario = JSON.parse(datos);
        
        // Validar datos existentes
        const errores = validarDatosUsuario(usuario);
        if (errores.length > 0) {
            localStorage.removeItem('usuarioConfig');
            return null;
        }
        
        return usuario;
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        return null;
    }
}

// Eliminar datos con confirmación
function eliminarDatosUsuario() {
    if (!confirm('¿Estás seguro de eliminar tus datos?')) return;
    
    try {
        localStorage.removeItem('usuarioConfig');
        document.getElementById('formUsuario').reset();
        mostrarNotificacion('Datos eliminados correctamente', 'warning');
    } catch (error) {
        mostrarNotificacion('Error al eliminar los datos', 'danger');
        console.error('Error eliminando datos:', error);
    }
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const usuario = cargarDatosUsuario();
    
    if (usuario) {
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('genero').value = usuario.genero;
        document.getElementById('altura').value = usuario.altura;
        document.getElementById('peso').value = usuario.peso;
    }
    
    // Configurar eventos
    document.getElementById('formUsuario').addEventListener('submit', guardarDatosUsuario);
    document.querySelector('.btn-danger').addEventListener('click', eliminarDatosUsuario);
});