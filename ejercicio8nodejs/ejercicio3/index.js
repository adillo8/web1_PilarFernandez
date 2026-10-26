// Ejercicio 3: servidor que muestra una contraseña aleatoria
// El número de palabras (X) se pasa en la query: http://localhost:3000/?palabras=5

const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;

// Leemos el diccionario (una palabra por línea) al arrancar
const diccionario = fs
  .readFileSync(path.join(__dirname, "diccionario.txt"), "utf8")
  .split(/\r?\n/)
  .filter(function (palabra) {
    return palabra !== ""; // quitamos líneas vacías
  });

// Genera una contraseña con "cantidad" palabras sin repetir
function generarContrasena(cantidad) {
  let disponibles = diccionario.slice();
  let elegidas = [];
  for (let i = 0; i < cantidad; i++) {
    let pos = Math.floor(Math.random() * disponibles.length);
    elegidas.push(disponibles[pos]);
    disponibles.splice(pos, 1);
  }
  return elegidas.join("-");
}

const server = http.createServer((req, res) => {
  // req.url trae la ruta y la query, por ejemplo "/?palabras=5"
  const url = new URL(req.url, "http://localhost");

  // Solo respondemos en la página principal (así ignoramos peticiones como /favicon.ico)
  if (url.pathname !== "/") {
    res.statusCode = 404;
    res.end("No encontrado");
    return;
  }

  // Número de palabras: si no viene o no es válido, usamos 4
  let cantidad = Number(url.searchParams.get("palabras"));
  if (!cantidad || cantidad < 1) {
    cantidad = 4;
  }
  if (cantidad > diccionario.length) {
    cantidad = diccionario.length;
  }

  let contrasena = generarContrasena(cantidad);
  console.log(`Petición ${req.url} -> ${cantidad} palabras`);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<h1>Contraseña de la Niebla</h1>
<p style="font-family: monospace; font-size: 24px;">${contrasena}</p>
<p>Palabras: ${cantidad}. Prueba a cambiarlo en la URL: <code>/?palabras=6</code></p>`);
});

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
