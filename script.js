// script.js - Lógica del juego Blue Lock Futsal y Motor de Partido 2D

// Quinteto titular actual (se llena con lo que salga del gacha)
let miQuinteto = {
    por: null,
    cie: null,
    ali: null,
    ald: null,
    piv: null
};

let jugadorObtenidoTemporal = null;

// VARIABLES DEL MOTOR DE PARTIDO EN 2D
let canvas, ctx;
let bucleJuego = null;
let partidoEnCurso = false;

let marcadorZ = 0;
let marcadorV = 0;
let balon = { x: 400, y: 225, vx: 0, vy: 0, radio: 8 };
let jugadores2D = [];

// Sistema de lectura de teclado para control manual
let teclasPulsadas = {};

window.addEventListener('keydown', (e) => {
    teclasPulsadas[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    teclasPulsadas[e.key.toLowerCase()] = false;
});

// Navegación entre las pestañas del juego
function mostrarSeccion(idSeccion) {
    const pantallas = document.querySelectorAll('.seccion-pantalla');
    pantallas.forEach(pantalla => pantalla.classList.remove('activa'));
    document.getElementById(idSeccion).classList.add('activa');
}

// GACHA (Abrir sobre para conseguir futbolistas)
function abrirSobre() {
    const indiceAleatorio = Math.floor(Math.random() * personajesDisponibles.length);
    jugadorObtenidoTemporal = personajesDisponibles[indiceAleatorio];

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

// Actualizar alineación visualmente en el mapa táctico
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

// INICIAR EL PARTIDO EN DIRECTO
function iniciarPartidoRapido() {
    const consola = document.getElementById('resultado-partido');
    
    // Comprobar si tenemos el equipo completo de 5 personas
    let jugadoresContratados = 0;
    for (let pos in miQuinteto) {
        if (miQuinteto[pos]) jugadoresContratados++;
    }

    if (jugadoresContratados < 5) {
        consola.innerHTML = "❌ Jinpachi Ego dice: 'No puedes crear una reacción química con un equipo incompleto. Consigue 5 jugadores en el Gacha'.";
        return;
    }

    if (partidoEnCurso) {
        cancelAnimationFrame(bucleJuego);
    }

    consola.innerHTML = "🔥 ¡El partido ha comenzado! Controlas al jugador VERDE NEÓN.";
    
    document.getElementById('marcador').classList.remove('oculto');
    canvas = document.getElementById('campoCanvas');
    canvas.classList.remove('oculto');
    ctx = canvas.getContext('2d');

    partidoEnCurso = true;
    marcadorZ = 0;
    marcadorV = 0;
    actualizarMarcadorInterfaz();

    // Spawn de jugadores y balón
    inicializarEntidades();

    // Arrancar bucle
    bucleJuego = requestAnimationFrame(buclePartido);

    // Duración del partido: 25 segundos
    setTimeout(() => {
        finalizarPartido();
    }, 25000);
}

// POSICIONAR JUGADORES (Equipo Z e IA Rival)
function inicializarEntidades() {
    balon = { x: 400, y: 225, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, radio: 8 };
    jugadores2D = [];

    const obtenerIniciales = (nombre) => nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Crear tus 5 jugadores del Equipo Z
    let index = 0;
    for (let pos in miQuinteto) {
        const jug = miQuinteto[pos];
        
        // Controlamos manualmente al pívot (delantero estrella)
        const esControladoPorUsuario = (pos === 'piv'); 

        jugadores2D.push({
            nombre: jug.nombre,
            iniciales: obtenerIniciales(jug.nombre),
            equipo: 'Z',
            posicionOriginal: pos,
            x: 150 + (index * 30),
            y: 80 + (index * 70),
            velocidad: (jug.ritmo / 100) * 4 + 1.2,
            color: esControladoPorUsuario ? '#00ffcc' : '#00d2ff', // Verde Neón si es manual
            esManual: esControladoPorUsuario
        });
        index++;
    }

    // Crear 5 rivales del Equipo V (Nagi, Reo, Zantetsu...)
    const rivalesNombres = ["Nagi", "Reo", "Zantetsu", "Rival A", "Rival B"];
    for (let i = 0; i < 5; i++) {
        jugadores2D.push({
            nombre: rivalesNombres[i],
            iniciales: rivalesNombres[i].substring(0,2).toUpperCase(),
            equipo: 'V',
            x: 650 - (i * 30),
            y: 80 + (i * 70),
            velocidad: 3.0,
            color: '#ff3366',
            esManual: false
        });
    }
}

function buclePartido() {
    if (!partidoEnCurso) return;

    actualizarFisicas();
    dibujarEscena();

    bucleJuego = requestAnimationFrame(buclePartido);
}

// CÁLCULO FÍSICO Y COLISIONES
function actualizarFisicas() {
    // 1. Desplazamiento y frenado del balón
    balon.x += balon.vx;
    balon.y += balon.vy;
    balon.vx *= 0.985;
    balon.vy *= 0.985;

    // Rebote superior e inferior
    if (balon.y - balon.radio < 0 || balon.y + balon.radio > canvas.height) {
        balon.vy = -balon.vy;
    }

    // Comprobación de Goles (Límites de la portería)
    if (balon.x < 0) {
        if (balon.y > 150 && balon.y < 300) {
            marcadorV++;
            marcarGol();
        } else {
            balon.vx = -balon.vx;
        }
    }
    if (balon.x > canvas.width) {
        if (balon.y > 150 && balon.y < 300) {
            marcadorZ++;
            marcarGol();
        } else {
            balon.vx = -balon.vx;
        }
    }

    // 2. Control de los jugadores
    jugadores2D.forEach(jugador => {
        if (jugador.esManual) {
            // CONTROL TECLADO (W-A-S-D / FLECHAS)
            if (teclasPulsadas['arrowup'] || teclasPulsadas['w']) {
                jugador.y -= jugador.velocidad;
            }
            if (teclasPulsadas['arrowdown'] || teclasPulsadas['s']) {
                jugador.y += jugador.velocidad;
            }
            if (teclasPulsadas['arrowleft'] || teclasPulsadas['a']) {
                jugador.x -= jugador.velocidad;
            }
            if (teclasPulsadas['arrowright'] || teclasPulsadas['d']) {
                jugador.x += jugador.velocidad;
            }

            // Evitar salir de los bordes del canvas
            jugador.x = Math.max(15, Math.min(canvas.width - 15, jugador.x));
            jugador.y = Math.max(15, Math.min(canvas.height - 15, jugador.y));

        } else {
            // INTELIGENCIA ARTIFICIAL (IA persigue la pelota)
            let dx = balon.x - jugador.x;
            let dy = balon.y - jugador.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia > 5) {
                jugador.x += (dx / distancia) * jugador.velocidad;
                jugador.y += (dy / distancia) * jugador.velocidad;
            }
        }

        // Interacción / Disparo de Pelota al tocarla
        let dx = balon.x - jugador.x;
        let dy = balon.y - jugador.y;
        let distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia < 18) {
            let fuerzaTiro = 6 + Math.random() * 4;
            let direccionTiroX = jugador.equipo === 'Z' ? 1 : -1;
            
            balon.vx = direccionTiroX * fuerzaTiro;
            balon.vy = (Math.random() - 0.5) * 6;
        }
    });
}

function marcarGol() {
    actualizarMarcadorInterfaz();
    balon.x = canvas.width / 2;
    balon.y = canvas.height / 2;
    balon.vx = (Math.random() - 0.5) * 6;
    balon.vy = (Math.random() - 0.5) * 6;
}

function actualizarMarcadorInterfaz() {
    document.getElementById('puntos-z').innerText = marcadorZ;
    document.getElementById('puntos-v').innerText = marcadorV;
}

// RENDERIZADO GRÁFICO DEL CAMPO
function dibujarEscena() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Líneas blancas del campo de juego
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 3;
    
    // Línea divisoria central
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Círculo del centro de campo
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Áreas de Portería semicirculares
    ctx.beginPath();
    ctx.arc(0, canvas.height / 2, 90, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width, canvas.height / 2, 90, Math.PI/2, -Math.PI/2);
    ctx.stroke();

    // Renderizar Balón (Amarillo Neón)
    ctx.fillStyle = "#ccff00";
    ctx.beginPath();
    ctx.arc(balon.x, balon.y, balon.radio, 0, Math.PI * 2);
    ctx.fill();

    // Renderizar Jugadores
    jugadores2D.forEach(jugador => {
        ctx.fillStyle = jugador.color;
        ctx.beginPath();
        ctx.arc(jugador.x, jugador.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Iniciales internas del jugador
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(jugador.iniciales, jugador.x, jugador.y);
    });
}

// FIN DE SIMULACIÓN Y RESULTADOS
function finalizarPartido() {
    partidoEnCurso = false;
    cancelAnimationFrame(bucleJuego);
    
    const consola = document.getElementById('resultado-partido');
    
    if (marcadorZ > marcadorV) {
        consola.innerHTML = `👑 ¡FINAL DEL PARTIDO! El Equipo Z se alza con la victoria por ${marcadorZ} a ${marcadorV}. ¡Has devorado el partido con tu egoísmo!`;
    } else if (marcadorZ < marcadorV) {
        consola.innerHTML = `💀 ¡FINAL DEL PARTIDO! El Equipo V te ha derrotado ${marcadorZ} - ${marcadorV}. Nagi y Reo se ríen de tu fórmula química.`;
    } else {
        consola.innerHTML = `🤝 ¡FINAL DEL PARTIDO! Empate de infarto ${marcadorZ} - ${marcadorV}. Necesitáis exprimir aún más vuestro talento.`;
    }
}