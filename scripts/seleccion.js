document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const dia = urlParams.get("dia");
    document.getElementById("diaSeleccionado").textContent = `Día seleccionado: ${dia}`;

    document.getElementById("buscarEntrenamiento").addEventListener("click", function () {
        const parteCuerpo = document.getElementById("parteCuerpo").value;
        const duracion = parseInt(document.getElementById("duracion").value);
        const errorMensaje = document.getElementById("errorDuracion");

        // Validación: Duración entre 15 y 120 minutos
        if (isNaN(duracion) || duracion < 15 || duracion > 120) {
            errorMensaje.style.display = "block";
            return; // Detiene la ejecución si el valor es incorrecto
        } else {
            errorMensaje.style.display = "none";
        }

        // Simulación de llamada a una API (esto se reemplazará con una real)
        const entrenamientos = [
            { nombre: "Rutina 1", imagen: "https://via.placeholder.com/150", repeticiones: "3 series de 12 reps" },
            { nombre: "Rutina 2", imagen: "https://via.placeholder.com/150", repeticiones: "4 series de 10 reps" },
            { nombre: "Rutina 3", imagen: "https://via.placeholder.com/150", repeticiones: "5 series de 8 reps" }
        ];

        mostrarEntrenamientos(entrenamientos);
    });
});

function mostrarEntrenamientos(entrenamientos) {
    const contenedor = document.getElementById("opcionesEntrenamiento");
    contenedor.innerHTML = "";

    entrenamientos.forEach(entreno => {
        const div = document.createElement("div");
        div.classList.add("card", "mb-3");
        div.innerHTML = `
            <img src="${entreno.imagen}" class="card-img-top" alt="${entreno.nombre}">
            <div class="card-body">
                <h5 class="card-title">${entreno.nombre}</h5>
                <p class="card-text">${entreno.repeticiones}</p>
                <button class="btn btn-success seleccionarEntreno">Seleccionar</button>
            </div>
        `;
        div.querySelector(".seleccionarEntreno").addEventListener("click", function () {
            guardarEntrenamiento(entreno);
        });
        contenedor.appendChild(div);
    });
}

function guardarEntrenamiento(entreno) {
    const urlParams = new URLSearchParams(window.location.search);
    const dia = urlParams.get("dia");

    let entrenamientos = JSON.parse(localStorage.getItem("entrenamientos")) || {};
    entrenamientos[dia] = entreno;

    localStorage.setItem("entrenamientos", JSON.stringify(entrenamientos));
    window.location.href = "calendario.html";
}
