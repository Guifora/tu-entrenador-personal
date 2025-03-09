export class Recomendador {
    constructor() {
        this.datosEjercicios = null;
        this.dificultadMap = {
            'Principiante': 1,
            'Intermedio': 2,
            'Avanzado': 3
        };
    }

    async inicializar() {
        await this.cargarDatos();
    }

    async cargarDatos() {
        try {
            const respuesta = await fetch('data/entrenamientos.csv');
            const texto = await respuesta.text();
            this.datosEjercicios = this.parsearCSV(texto);
        } catch (error) {
            console.error('Error cargando datos:', error);
            throw error;
        }
    }

    parsearCSV(texto) {
        const lineas = texto.split('\n').filter(l => l.trim() !== '');
        const encabezados = lineas[0].split(',').map(h => h.trim());
        
        return lineas.slice(1).map(linea => {
            const valores = linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"(.*)"$/, '$1'));
            return encabezados.reduce((obj, header, index) => {
                let valor = valores[index];
                
                // Conversión de tipos de datos
                if (['Duracion_Estimada_x_Set(min)', 'Quemado_Calorico_x_Minuto', 'Impacto'].includes(header)) {
                    valor = parseFloat(valor);
                }
                
                if (header === 'Reps_Recomendadas' && valor) {
                    valor = valor.split('-').map(Number);
                }
                
                obj[header] = valor;
                return obj;
            }, {});
        });
    }

    async generarRecomendacion(usuario) {
        const params = {
            nivel: this.dificultadMap[usuario.nivel],
            tiempo: usuario.duracion,
            impacto_max: usuario.impactoMax || 3,
            tiempo_max_ejercicio: usuario.tiempoMaxEjercicio || 15,
            parte_cuerpo: usuario.parteCuerpo,
            intensidad_preferida: usuario.intensidad || 'Media'
        };

        try {
            const respuesta = await fetch('/generar-rutina', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });
            
            if (!respuesta.ok) throw new Error('Error en la respuesta del servidor');
            
            return await respuesta.json();
            
        } catch (error) {
            console.error('Error en recomendación:', error);
            return [];
        }
    }

    mostrarRecomendaciones(rutina, contenedorId) {
        const contenedor = document.getElementById(contenedorId);
        contenedor.innerHTML = '';
        
        rutina.forEach(ejercicio => {
            const ejercicioHTML = `
                <div class="card mb-3 ejercicio-card">
                    <div class="card-body">
                        <h5 class="card-title">${ejercicio.Ejercicio}</h5>
                        <p class="card-text text-muted">${ejercicio.Descripcion_Corta}</p>
                        <div class="row">
                            <div class="col-md-4">
                                <span class="badge bg-primary">Sets: ${ejercicio.Sets}</span>
                            </div>
                            <div class="col-md-4">
                                <span class="badge bg-success">Reps: ${ejercicio.Reps}</span>
                            </div>
                            <div class="col-md-4">
                                <span class="badge bg-warning text-dark">Duración: ${ejercicio.Duracion_Estimada_x_Set(min)}min</span>
                            </div>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">Grupo muscular: ${ejercicio.Grupo_Muscular_Primario}</small>
                        </div>
                    </div>
                </div>
            `;
            contenedor.insertAdjacentHTML('beforeend', ejercicioHTML);
        });
    }
}