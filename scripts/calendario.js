document.addEventListener("DOMContentLoaded", function () {
    const calendario = document.getElementById("calendario");
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = hoy.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();

    for (let i = 0; i < primerDia; i++) {
        const espacio = document.createElement("div");
        calendario.appendChild(espacio);
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
        const divDia = document.createElement("div");
        divDia.classList.add("dia");
        divDia.textContent = dia;

        if (dia === hoy.getDate()) {
            divDia.classList.add("hoy");
            divDia.addEventListener("click", () => {
                window.location.href = `seleccion.html?dia=${dia}`;
            });
        }

        calendario.appendChild(divDia);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const calendario = document.getElementById("calendario");
    const fechaActual = new Date();
    const mes = fechaActual.getMonth();
    const anio = fechaActual.getFullYear();
    const hoy = fechaActual.getDate();

    const entrenamientos = JSON.parse(localStorage.getItem("entrenamientos")) || {};

    // Obtener el primer día del mes y la cantidad de días
    const primerDia = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();

    let html = "<table class='table table-bordered'><tr>";
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    // Encabezados de los días de la semana
    diasSemana.forEach(dia => {
        html += `<th>${dia}</th>`;
    });

    html += "</tr><tr>";

    // Espacios vacíos hasta el primer día del mes
    for (let i = 0; i < primerDia; i++) {
        html += "<td></td>";
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
        const claseHoy = dia === hoy ? "table-primary" : "";
        const keyDia = `${anio}-${mes + 1}-${dia}`;
        const entrenamiento = entrenamientos[keyDia];

        html += `<td class="${claseHoy}"> 
                    <a href="seleccion.html?dia=${keyDia}" class="d-block">${dia}</a>`;

        if (entrenamiento) {
            html += `<div class="mt-2 p-2 bg-success text-white text-center">
                        ${entrenamiento.nombre}
                     </div>`;
        }

        html += "</td>";

        if ((dia + primerDia) % 7 === 0) {
            html += "</tr><tr>";
        }
    }

    html += "</tr></table>";
    calendario.innerHTML = html;
});

document.addEventListener("DOMContentLoaded", function () {
    const calendario = document.getElementById("calendario");
    const mesActualSpan = document.getElementById("mes-actual");
    const btnPrev = document.getElementById("prev-mes");
    const btnNext = document.getElementById("next-mes");

    let fecha = new Date();
    let mes = fecha.getMonth();
    let anio = fecha.getFullYear();

    function renderizarCalendario() {
        mesActualSpan.textContent = fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

        const entrenamientos = JSON.parse(localStorage.getItem("entrenamientos")) || {};
        const primerDia = new Date(anio, mes, 1).getDay();
        const diasEnMes = new Date(anio, mes + 1, 0).getDate();
        let html = "<table class='table table-bordered'><tr>";

        const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        diasSemana.forEach(dia => html += `<th>${dia}</th>`);
        html += "</tr><tr>";

        for (let i = 0; i < primerDia; i++) html += "<td></td>";

        for (let dia = 1; dia <= diasEnMes; dia++) {
            const keyDia = `${anio}-${mes + 1}-${dia}`;
            const entrenamiento = entrenamientos[keyDia];
            let claseHoy = (dia === new Date().getDate() && mes === new Date().getMonth() && anio === new Date().getFullYear()) ? "table-primary" : "";

            html += `<td class="${claseHoy}"> 
                        <a href="seleccion.html?dia=${keyDia}" class="d-block">${dia}</a>`;

            if (entrenamiento) {
                html += `<div class="entrenamiento-info">${entrenamiento.nombre}</div>`;
            }

            html += "</td>";

            if ((dia + primerDia) % 7 === 0) html += "</tr><tr>";
        }

        html += "</tr></table>";
        calendario.innerHTML = html;
    }

    btnPrev.addEventListener("click", () => {
        fecha.setMonth(fecha.getMonth() - 1);
        mes = fecha.getMonth();
        anio = fecha.getFullYear();
        renderizarCalendario();
    });

    btnNext.addEventListener("click", () => {
        fecha.setMonth(fecha.getMonth() + 1);
        mes = fecha.getMonth();
        anio = fecha.getFullYear();
        renderizarCalendario();
    });

    renderizarCalendario();
});

document.addEventListener("DOMContentLoaded", function () {
    // Obtener los datos del usuario desde el LocalStorage
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    
    // Verificar si el nombre está disponible
    if (usuario && usuario.nombre) {
        // Mostrar el mensaje de bienvenida con el nombre del usuario
        const bienvenidaElement = document.getElementById("bienvenida");
        bienvenidaElement.textContent = `¡Bienvenido a tu calendario, ${usuario.nombre}!`;
    } else {
        // Si no hay nombre de usuario, mostrar un mensaje genérico
        const bienvenidaElement = document.getElementById("bienvenida");
        bienvenidaElement.textContent = "¡Bienvenido a tu calendario!";
    }
});

// Agregar al final del archivo
function mostrarEntrenamientosDia(fecha) {
    const entrenamientos = JSON.parse(localStorage.getItem('entrenamientos')) || [];
    const entrenamientosDia = entrenamientos.filter(e => e.fecha === fecha);
    
    if (entrenamientosDia.length > 0) {
        const dialog = document.createElement('div');
        dialog.className = 'entrenamiento-modal';
        dialog.innerHTML = `
            <h3>Entrenamientos para ${fecha}</h3>
            ${entrenamientosDia.map(e => `<p>${e.nombre} (${e.duracion} min)</p>`).join('')}
            <button onclick="this.parentElement.remove()">Cerrar</button>
        `;
        document.body.appendChild(dialog);
    }
}