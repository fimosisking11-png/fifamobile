// 1. BASE DE DATOS DE PERSONAJES PERSONALIZADOS
const personajesDisponibles = [
    { nombre: "Goku", posicion: "piv", media: 95, ritmo: 99, tiro: 98 },
    { nombre: "Vegeta", posicion: "ali", media: 92, ritmo: 95, tiro: 93 },
    { nombre: "Spiderman", posicion: "ald", media: 88, ritmo: 94, tiro: 80 },
    { nombre: "Batman", posicion: "cie", media: 89, ritmo: 85, tiro: 78 },
    { nombre: "Iron Man", posicion: "por", media: 90, ritmo: 88, tiro: 85 },
    { nombre: "Pikachu", posicion: "ali", media: 82, ritmo: 96, tiro: 75 },
    { nombre: "Shrek", posicion: "cie", media: 85, ritmo: 60, tiro: 80 },
    { nombre: "Sonic", posicion: "ald", media: 94, ritmo: 99, tiro: 82 },
    { nombre: "Casillas (Retro)", posicion: "por", media: 91, ritmo: 80, tiro: 10 }
];

// 2. NUESTRO QUINTETO TITULAR ACTUAL (Vacío al empezar)
let miQuinteto = {
    por: null, // Portero
    cie: null, // Cierre
    ali: null, // Ala Izquierdo
    ald: null, // Ala Derecho
    piv: null  // Pívot
};

// Variable para guardar temporalmente el último jugador que nos salió en el Gacha
let jugadorObtenidoTemporal = null;

// 3. NAVEGACIÓN ENTRE SECCIONES
function mostrarSeccion(idSeccion) {
    // Ocultar todas las pantallas
    const pantallas = document.querySelectorAll('.seccion-pantalla');
    pantallas.forEach(pantalla => pantalla.classList.remove('activa'));

    // Mostrar la seleccionada
    document.getElementById(idSeccion).classList.add('activa');
}

// 4. LÓGICA DEL GACHA (ABRIR SOBRES)
function abrirSobre() {
    // Seleccionar un jugador aleatorio de la base de datos
    const indiceAleatorio = Math.floor(Math.random() * personajesDisponibles.length);
    jugadorObtenidoTemporal = personajesDisponibles[indiceAleatorio];

    // Mostrar la recompensa en pantalla
    const contenedorCarta = document.getElementById('carta-recompensa');
    contenedorCarta.innerHTML = `
        <div class="carta-jugador">
            <span class="media">${jugadorObtenidoTemporal.media}</span>
            <span class="nombre">${jugadorObtenidoTemporal.nombre}</span>
            <span style="font-size: 0.8rem; color: #333;">POS: ${jugadorObtenidoTemporal.posicion.toUpperCase()}</span>
        </div>
    `;

    // Quitar la clase "oculto" de la sección de recompensa
    document.getElementById('pantalla-recompensa').classList.remove('oculto');
}

function cerrarRecompensa() {
    if (jugadorObtenidoTemporal) {
        // Guardamos el jugador en la posición correspondiente del equipo
        const pos = jugadorObtenidoTemporal.posicion;
        miQuinteto[pos] = jugadorObtenidoTemporal;

        // Actualizamos la interfaz del equipo
        actualizarEquipoVisual();
    }

    // Ocultamos la recompensa de nuevo
    document.getElementById('pantalla-recompensa').classList.add('oculto');
    jugadorObtenidoTemporal = null;
    alert("¡Jugador enviado a tu quinteto!");
}

// 5. ACTUALIZAR EL MAPA DEL EQUIPO VISUALMENTE
function actualizarEquipoVisual() {
    for (let pos in miQuinteto) {
        const divPosicion = document.getElementById(`pos-${pos}`);
        const jugador = miQuinteto[pos];

        if (jugador) {
            divPosicion.className = "carta-jugador";
            divPosicion.innerHTML = `
                <span class="media">${jugador.media}</span>
                <span class="nombre">${jugador.nombre}</span>
            `;
        } else {
            divPosicion.className = "carta-vacia";
            divPosicion.innerHTML = "Vacío";
        }
    }
}

// 6. LÓGICA DE PARTIDO RÁPIDO (LOBBY)
function iniciarPartidoRapido() {
    const consola = document.getElementById('resultado-partido');
    consola.innerHTML = "⚽ Buscando rival...";

    // Comprobamos cuántos jugadores tenemos en el quinteto
    let jugadoresContratados = 0;
    let sumaMedias = 0;
    for (let pos in miQuinteto) {
        if (miQuinteto[pos]) {
            jugadoresContratados++;
            sumaMedias += miQuinteto[pos].media;
        }
    }

    // Validación si no tienes equipo para jugar
    if (jugadoresContratados < 5) {
        setTimeout(() => {
            consola.innerHTML = "❌ Error: Necesitas tener los 5 jugadores en tu alineación de Fútbol Sala para poder jugar. ¡Ve a abrir sobres en el Gacha!";
        }, 1000);
        return;
    }

    // Si tenemos equipo, calculamos el resultado
    setTimeout(() => {
        consola.innerHTML = "⚽ ¡Partido en juego contra 'Team Villanos'! ⚽";
        
        setTimeout(() => {
            const mediaEquipo = Math.round(sumaMedias / 5);
            const mediaRival = 86; // Rival con media fija para la prueba
            
            // Lógica rápida de simulación basada en la media de tu equipo
            let golesTus = Math.floor(Math.random() * 4) + (mediaEquipo > mediaRival ? 2 : 0);
            let golesRival = Math.floor(Math.random() * 4) + (mediaRival > mediaEquipo ? 2 : 0);
            
            let resultadoTexto = "";
            if (golesTus > golesRival) {
                resultadoTexto = `🎉 ¡VICTORIA! Ganaste ${golesTus} - ${golesRival}. ¡Tus personajes son imparables!`;
            } else if (golesTus < golesRival) {
                resultadoTexto = `😢 Derrota ${golesTus} - ${golesRival}. Tu equipo de media ${mediaEquipo} no pudo contra el rival (${mediaRival}).`;
            } else {
                resultadoTexto = `🤝 Empate ${golesTus} - ${golesRival}. Un partido muy reñido.`;
            }

            consola.innerHTML = resultadoTexto;
        }, 2000);

    }, 1000);
}