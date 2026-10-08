// Ejercicio JS 1: generador de contraseñas con palabras de Dead by Daylight

// Diccionario guardado en una variable (array de palabras)
const diccionario = [
  "trapper", "wraith", "hillbilly", "nurse", "huntress", "doctor",
  "hag", "legion", "ghostface", "pig", "clown", "spirit", "plague",
  "demogorgon", "oni", "twins", "nemesis", "generador", "gancho",
  "totem", "trampilla", "cofre", "linterna", "botiquin", "niebla",
  "sangre", "sacrificio", "entidad", "bosque", "cabana", "hospital",
  "escape", "perk", "paleta", "ventana", "superviviente", "asesino"
];

// Cuando se carga la página, asociamos la función al botón
window.addEventListener("load", init);

function init() {
  document.getElementById("generar").addEventListener("click", generar);
}

function generar() {
  // Leemos la configuración
  let cantidad = Number(document.getElementById("cantidad").value);
  let mayusculas = document.getElementById("mayusculas").checked;
  let sinRepetir = document.getElementById("sinRepetir").checked;

  // Comprobaciones sencillas
  if (!cantidad || cantidad < 1) {
    cantidad = 1;
  }
  if (sinRepetir && cantidad > diccionario.length) {
    cantidad = diccionario.length;
  }

  // Copiamos el diccionario para poder quitar palabras si no queremos repetir
  let disponibles = diccionario.slice();
  let elegidas = [];

  for (let i = 0; i < cantidad; i++) {
    let pos = Math.floor(Math.random() * disponibles.length);
    let palabra = disponibles[pos];

    if (sinRepetir) {
      disponibles.splice(pos, 1); // la quitamos para que no vuelva a salir
    }
    if (mayusculas) {
      palabra = palabra.charAt(0).toUpperCase() + palabra.slice(1);
    }
    elegidas.push(palabra);
  }

  let contrasena = elegidas.join("-");
  document.getElementById("resultado").textContent = contrasena;

  // Recomendación del NIST: mínimo 15 caracteres
  let aviso = document.getElementById("aviso");
  if (contrasena.length < 15) {
    aviso.textContent = `Solo tiene ${contrasena.length} caracteres. El NIST recomienda mínimo 15: prueba con más palabras.`;
  } else {
    aviso.textContent = `Longitud: ${contrasena.length} caracteres. ¡Cumple la recomendación del NIST!`;
  }
}
