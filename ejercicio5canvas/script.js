// Ejercicio Canvas: "Escapa del killer"
// - Dibuja formas, texto y una imagen (el killer)
// - Reacciona al teclado (flechas) y al ratón (click para reiniciar)
// - La velocidad no depende de la tasa de refresco (usamos el tiempo entre frames)

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

// Imagen del killer (genérica, dibujada por nosotros)
let imgKiller = new Image();
imgKiller.src = "killer.png";

// Velocidades en píxeles POR SEGUNDO (no por frame)
let jugador;
let killer;
let generadores;
let estado; // "jugando", "ganado" o "perdido"
let ultimoTiempo = null;

// Teclas pulsadas en este momento
let teclas = {};

window.addEventListener("load", init);

function init() {
  reiniciar();

  document.addEventListener("keydown", function (e) {
    teclas[e.code] = true;
    // Evitamos que las flechas muevan el scroll de la página
    if (e.code == "ArrowUp" || e.code == "ArrowDown" ||
        e.code == "ArrowLeft" || e.code == "ArrowRight") {
      e.preventDefault();
    }
  });

  document.addEventListener("keyup", function (e) {
    teclas[e.code] = false;
  });

  // Click en el canvas para reiniciar cuando se ha acabado la partida
  canvas.addEventListener("click", function () {
    if (estado != "jugando") {
      reiniciar();
    }
  });

  window.requestAnimationFrame(bucle);
}

function reiniciar() {
  jugador = { x: 40, y: 40, size: 24, speed: 170 };
  killer = { x: 430, y: 330, size: 44, speed: 95 };
  generadores = [
    { x: 120, y: 280, size: 30, reparado: false },
    { x: 380, y: 90, size: 30, reparado: false },
    { x: 250, y: 190, size: 30, reparado: false }
  ];
  estado = "jugando";
  ultimoTiempo = null;
}

// Bucle principal: se llama antes de cada repintado del navegador
function bucle(timestamp) {
  if (ultimoTiempo === null) {
    ultimoTiempo = timestamp;
  }
  // Segundos transcurridos desde el frame anterior
  let dt = (timestamp - ultimoTiempo) / 1000;
  ultimoTiempo = timestamp;
  if (dt > 0.1) {
    dt = 0.1; // por si la pestaña estuvo en segundo plano
  }

  actualizar(dt);
  dibujar();
  window.requestAnimationFrame(bucle);
}

function actualizar(dt) {
  if (estado != "jugando") {
    return;
  }

  // Mover al jugador según las teclas
  if (teclas["ArrowLeft"]) { jugador.x -= jugador.speed * dt; }
  if (teclas["ArrowRight"]) { jugador.x += jugador.speed * dt; }
  if (teclas["ArrowUp"]) { jugador.y -= jugador.speed * dt; }
  if (teclas["ArrowDown"]) { jugador.y += jugador.speed * dt; }

  // No salirse del canvas
  if (jugador.x < 0) { jugador.x = 0; }
  if (jugador.y < 0) { jugador.y = 0; }
  if (jugador.x > canvas.width - jugador.size) { jugador.x = canvas.width - jugador.size; }
  if (jugador.y > canvas.height - jugador.size) { jugador.y = canvas.height - jugador.size; }

  // El killer persigue al jugador
  let dx = jugador.x - killer.x;
  let dy = jugador.y - killer.y;
  let distancia = Math.sqrt(dx * dx + dy * dy);
  if (distancia > 0) {
    killer.x += (dx / distancia) * killer.speed * dt;
    killer.y += (dy / distancia) * killer.speed * dt;
  }

  // Reparar generadores al tocarlos
  let reparados = 0;
  generadores.forEach(function (g) {
    if (!g.reparado && chocan(jugador, g)) {
      g.reparado = true;
    }
    if (g.reparado) {
      reparados++;
    }
  });

  // ¿Ganamos o perdemos?
  if (reparados == generadores.length) {
    estado = "ganado";
  } else if (chocan(jugador, killer)) {
    estado = "perdido";
  }
}

// Comprueba si dos cuadrados se tocan
function chocan(a, b) {
  return a.x < b.x + b.size &&
         a.x + a.size > b.x &&
         a.y < b.y + b.size &&
         a.y + a.size > b.y;
}

function dibujar() {
  // 1. Limpiar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Dibujar los elementos
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Generadores
  generadores.forEach(function (g) {
    if (g.reparado) {
      ctx.fillStyle = "#2e7d32";
    } else {
      ctx.fillStyle = "#f2c230";
    }
    ctx.fillRect(g.x, g.y, g.size, g.size);
  });

  // Jugador (superviviente)
  ctx.fillStyle = "#4aa3ff";
  ctx.fillRect(jugador.x, jugador.y, jugador.size, jugador.size);

  // Killer (imagen)
  ctx.drawImage(imgKiller, killer.x, killer.y, killer.size, killer.size);

  // Texto con el progreso
  let reparados = 0;
  generadores.forEach(function (g) {
    if (g.reparado) { reparados++; }
  });
  ctx.fillStyle = "#e8e2d8";
  ctx.font = "18px Arial";
  ctx.fillText(`Generadores: ${reparados}/${generadores.length}`, 10, 24);

  // Mensajes finales
  if (estado != "jugando") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e8e2d8";
    ctx.font = "36px Arial";
    if (estado == "ganado") {
      ctx.fillText("¡Escapaste!", 160, 190);
    } else {
      ctx.fillText("¡Te atrapó el killer!", 110, 190);
    }
    ctx.font = "16px Arial";
    ctx.fillText("Haz click para jugar otra vez", 150, 230);
  }
}
