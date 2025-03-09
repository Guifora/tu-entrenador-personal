import { Recomendador } from './recomendador.js';

const recomendador = new Recomendador();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await recomendador.inicializar();
        console.log('Sistema de recomendación listo');
    } catch (error) {
        console.error('Error inicializando:', error);
        mostrarError('No se pudieron cargar los datos de ejercicios');
    }
});

document.getElementById('buscarEntrenamiento').addEventListener('click', async () => {
    const usuario = {
        nivel: document.getElementById('nivelDificultad').value,
        duracion: parseInt(document.getElementById('duracion').value),
        parteCuerpo: document.getElementById('parteCuerpo').value,
        impactoMax: 3,
        tiempoMaxEjercicio: 15,
        intensidad: document.getElementById('intensidad').value
    };

    console.log("Enviando datos:", usuario);  // Agrega esto

    try {
        const response = await fetch('http://localhost:5000/generar-rutina', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(usuario)
        });

        console.log("Respuesta recibida:", response); 
        const data = await response.json();
        
        if (data.status === 'success' && data.rutina.length > 0) {
            recomendador.mostrarRecomendaciones(data.rutina, 'opcionesEntrenamiento');
        } else {
            mostrarError(data.message || 'No se encontraron ejercicios con tus criterios');
        }
        
    } catch (error) {
        console.error('Error generando rutina:', error);
        mostrarError(error.message || 'Error al conectar con el servidor');
    }
});

// Helper functions actualizadas
function obtenerParametrosUsuario() {
    return {
        nivel: document.getElementById('nivelDificultad').value,
        duracion: parseInt(document.getElementById('duracion').value),
        parteCuerpo: document.getElementById('parteCuerpo').value,
        impactoMax: 3,
        tiempoMaxEjercicio: 15,
        intensidad: document.getElementById('intensidad')?.value || 'Media'  // Asegurar tener este selector en HTML
    };
}

function validarParametros({ duracion }) {
    const errorDiv = document.getElementById('errorDuracion');
    let valido = true;
    
    if (duracion < 15 || duracion > 120) {
        errorDiv.textContent = '⚠️ La duración debe estar entre 15 y 120 minutos';
        errorDiv.style.display = 'block';
        valido = false;
    } else {
        errorDiv.style.display = 'none';
    }
    
    return valido;
}

function mostrarCargando() {
    const contenedor = document.getElementById('opcionesEntrenamiento');
    contenedor.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Generando tu rutina personalizada...</p>
        </div>
    `;
}

function mostrarError(mensaje) {
    const contenedor = document.getElementById('opcionesEntrenamiento');
    contenedor.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>¡Error!</strong> ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

// Nueva función para mostrar resultados
export function mostrarRecomendaciones(rutina, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';
    
    rutina.forEach(ejercicio => {
        const ejercicioHTML = `
            <div class="card mb-3 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title text-primary">${ejercicio.Ejercicio}</h5>
                    <p class="card-text text-muted">${ejercicio.Descripcion_Corta}</p>
                    <div class="row g-2">
                        <div class="col-6 col-md-3">
                            <div class="p-2 border rounded text-center">
                                <small class="text-muted d-block">Sets</small>
                                <span class="fw-bold">${ejercicio.Sets}</span>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="p-2 border rounded text-center">
                                <small class="text-muted d-block">Reps</small>
                                <span class="fw-bold">${ejercicio.Reps}</span>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="p-2 border rounded text-center">
                                <small class="text-muted d-block">Duración</small>
                                <span class="fw-bold">${ejercicio.Duracion_Estimada_x_Set(min)} min</span>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="p-2 border rounded text-center">
                                <small class="text-muted d-block">Grupo Muscular</small>
                                <span class="fw-bold">${ejercicio.Grupo_Muscular_Primario}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.insertAdjacentHTML('beforeend', ejercicioHTML);
    });
}