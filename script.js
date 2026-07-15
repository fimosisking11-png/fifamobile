// script.js - Lógica del juego Blue Lock Futsal

// Nuestro quinteto titular actual (se llena con lo que salga del gacha)
let miQuinteto = {
    por: null,
    cie: null,
    ali: null,
    ald: null,
    piv: null
};

let jugadorObtenidoTemporal = null;

// Navegación
function mostrarSeccion(idSeccion) {
    const pantallas = document.querySelectorAll('.seccion-pantalla');
    pantallas.forEach(pantalla => pantalla.classList.remove('activa'));
    document.getElementById(idSeccion).classList.add('activa');
}

// Gacha (Abrir sobre)
function abrirSobre() {
    // Escogemos un jugador aleatorio del archivo 'jugadores.js'
    const indiceAleatorio = Math.floor(Math.random() * personajesDisponibles.length);
    jugadorObtenidoTemporal = personajesDisponibles[indiceAleatorio];

    // Asignamos una clase CSS especial según su rareza
    let claseRareza = "rareza-" + jugadorObtenidoTemporal.rareza.toLowerCase();

    const contenedorCarta = document.getElementById('carta-recompensa');
    contenedorCarta.innerHTML = `
        <div class="carta-jugador ${claseRareza}">
            <div class="header-carta">
                <span class="media">${jugadorObtenidoTemporal.media}</span>
                <span class="pos">${jugadorObtenidoTemporal.posicion.toUpperCase()}</span>
            </div>
            <span class="nombre">${jugadorObtenidoTemporal.nombre}</span>
            <span class="habilidad">⭐ ${jugadorObtenidoTemporal.habilidad}</span>
        </div>
    `;

    document.getElementById('pantalla-recompensa').classList.remove('oculto');
}

function cerrarRecompensa() {
    if (jugadorObtenidoTemporal) {
        const pos = jugadorObtenidoTemporal.posicion;
        miQuinteto[pos] = jugadorObtenidoTemporal;
        actualizarEquipoVisual();
    }

    document.getElementById('pantalla-recompensa').classList.add('oculto');
    jugadorObtenidoTemporal = null;
}

// Actualizar alineación visualmente
function actualizarEquipoVisual() {
    for (let pos in miQuinteto) {
        const divPosicion = document.getElementById(`pos-${pos}`);
        const jugador = miQuinteto[pos];

        if (jugador) {
            let claseRareza = "rareza-" + jugador.rareza.toLowerCase();
            divPosicion.className = `carta-jugador ${claseRareza}`;
            divPosicion.innerHTML = `
                <div class="header-carta">
                    <span class="media">${jugador.media}</span>
                    <span class="pos">${pos.toUpperCase()}</span>
                </div>
                <span class="nombre">${jugador.nombre}</span>
            `;
        } else {
            divPosicion.className = "carta-vacia";
            divPosicion.innerHTML = "Vacío";
        }
    }
}

// Simulación de partido rápido (Egoísta)
function iniciarPartidoRapido() {
    const consola = document.getElementById('resultado-partido');
    consola.innerHTML = "⚽ Buscando un rival digno en las instalaciones de Blue Lock...";

    let jugadoresContratados = 0;
    let sumaMedias = 0;
    for (let pos in miQuinteto) {
        if (miQuinteto[pos]) {
            jugadoresContratados++;
            sumaMedias += miQuinteto[pos].media;
        }
    }

    if (jugadoresContratados < 5) {
        setTimeout(() => {
            consola.innerHTML = "❌ Jinpachi Ego dice: 'No puedes crear una reacción química con un equipo incompleto. Consigue 5 jugadores en el Gacha'.";
        }, 1200);
        return;
    }

    setTimeout(() => {
        consola.innerHTML = "🔥 ¡Partido en marcha contra el EQUIPO V (Nagi, Reo, Zantetsu)! 🔥";
        
        setTimeout(() => {
            const mediaTuya = Math.round(sumaMedias / 5);
            const mediaRival = 84; // El Equipo V es duro de pelar
            
            let golesTus = Math.floor(Math.random() * 4) + (mediaTuya > mediaRival ? 2 : 0);
            let golesRival = Math.floor(Math.random() * 4) + (mediaRival > mediaTuya ? 2 : 0);
            
            // Elegir un anotador aleatorio de tu quinteto para darle más inmersión
            const clavesPosiciones = ['por', 'cie', 'ali', 'ald', 'piv'];
            const posAnotadora = clavesPosiciones[Math.floor(Math.random() * 5)];
            const goleadorEstrella = miQuinteto[posAnotadora].nombre;

            let resultadoTexto = "";
            if (golesTus > golesRival) {
                resultadoTexto = `👑 ¡VICTORIA! Ganaste ${golesTus} - ${golesRival}. El gol definitivo lo marcó ${goleadorEstrella} devorando el campo.`;
            } else if (golesTus < golesRival) {
                resultadoTexto = `💀 DERROTA ${golesTus} - ${golesRival}. Nagi y Reo destrozaron tu defensa. Jinpachi Ego te observa con decepción...`;
            } else {
                resultadoTexto = `🤝 EMPATE ${golesTus} - ${golesRival}. Un resultado tenso. ¡${goleadorEstrella} logró empatar en el último segundo!`;
            }

            consola.innerHTML = resultadoTexto;
        }, 2500);

    }, 1200);
}