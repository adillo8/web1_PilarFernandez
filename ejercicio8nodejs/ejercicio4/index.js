// Ejercicio 4: web scraping
// - Cada cierto tiempo descarga el HTML de books.toscrape.com (una web hecha para practicar scraping)
// - Con cheerio extrae TODOS los libros de la página: título, precio, valoración y disponibilidad
// - Calcula un resumen (precio medio, libro más barato y más caro) y lo guarda en un historial
// - Un servidor muestra los libros y el historial en http://localhost:3000

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const port = process.env.PORT || 3000;
const URL_WEB = process.env.URL_WEB || "https://books.toscrape.com/";

// Cuidado: no hacemos muchas peticiones en poco tiempo (una cada 10 minutos)
const INTERVALO_MINUTOS = 10;
const MAX_HISTORIAL = 20;
const ARCHIVO_HISTORIAL = path.join(__dirname, "historial.json");

// Las valoraciones vienen como palabra en la clase del HTML (star-rating Three)
const VALORACIONES = { One: 1, Two: 2, Three: 3, Four: 4, Five: 5 };

// ---------- Estado en memoria ----------

let libros = [];     // libros de la última descarga
let historial = [];  // resúmenes de todas las descargas

if (fs.existsSync(ARCHIVO_HISTORIAL)) {
  try {
    historial = JSON.parse(fs.readFileSync(ARCHIVO_HISTORIAL, "utf8"));
  } catch (e) {
    historial = [];
  }
}

// ---------- Descargar el HTML ----------

function descargarHtml(url, callback) {
  const opciones = {
    headers: { "User-Agent": "SistemasWebI-ejercicio/1.0 (estudiante CEU; practica de web scraping)" }
  };
  const cliente = url.startsWith("https") ? https : http;

  cliente.get(url, opciones, (resp) => {
    if (resp.statusCode !== 200) {
      console.log("Error: la web respondió con código", resp.statusCode);
      resp.resume(); // descartamos el cuerpo de la respuesta
      return;
    }
    resp.setEncoding("utf8");
    let data = "";
    resp.on("data", (chunk) => {
      data += chunk;
    });
    resp.on("end", () => {
      callback(data);
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

// ---------- Extraer la información con cheerio ----------

// Devuelve un array con un objeto por cada libro de la página
function extraerLibros(html) {
  const $ = cheerio.load(html);
  const lista = [];

  // Cada libro está dentro de <article class="product_pod">
  $("article.product_pod").each(function () {
    const titulo = $(this).find("h3 a").attr("title");
    const precioTexto = $(this).find(".price_color").text(); // por ejemplo "£51.77"
    const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, ""));
    const claseEstrellas = $(this).find("p.star-rating").attr("class") || ""; // "star-rating Three"
    const valoracion = VALORACIONES[claseEstrellas.split(" ")[1]] || 0;
    const disponible = $(this).find(".availability").text().trim();

    lista.push({ titulo: titulo, precio: precio, valoracion: valoracion, disponible: disponible });
  });

  return lista;
}

// Calcula un resumen de la lista de libros
function resumir(lista) {
  let total = 0;
  let masBarato = lista[0];
  let masCaro = lista[0];

  lista.forEach(function (libro) {
    total += libro.precio;
    if (libro.precio < masBarato.precio) { masBarato = libro; }
    if (libro.precio > masCaro.precio) { masCaro = libro; }
  });

  return {
    consultadoEl: new Date().toLocaleString("es-ES"),
    totalLibros: lista.length,
    precioMedio: Number((total / lista.length).toFixed(2)),
    masBarato: `${masBarato.titulo} (${masBarato.precio})`,
    masCaro: `${masCaro.titulo} (${masCaro.precio})`
  };
}

// ---------- Proceso periódico ----------

function hacerScraping() {
  console.log(`[${new Date().toLocaleTimeString()}] Descargando ${URL_WEB} ...`);
  descargarHtml(URL_WEB, function (html) {
    const lista = extraerLibros(html);
    if (lista.length === 0) {
      console.log("No se ha encontrado ningún libro (¿ha cambiado el HTML de la web?)");
      return;
    }

    libros = lista;
    const resumen = resumir(lista);
    console.log("Libros extraídos:", lista.length);
    console.log("Resumen:", resumen);

    historial.push(resumen);
    if (historial.length > MAX_HISTORIAL) {
      historial.shift(); // quitamos el más antiguo
    }

    fs.writeFile(ARCHIVO_HISTORIAL, JSON.stringify(historial, null, 2), (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
}

// ---------- Servidor ----------

// Evita que el texto sacado de la web rompa nuestro HTML
function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const server = http.createServer((req, res) => {
  if (req.url !== "/") {
    res.statusCode = 404;
    res.end("No encontrado");
    return;
  }

  let contenido = "<meta charset='utf-8'><h1>Scraping de libros</h1>";
  contenido += `<p>Web vigilada: ${escapar(URL_WEB)} (cada ${INTERVALO_MINUTOS} minutos)</p>`;

  if (libros.length === 0) {
    contenido += "<p>Todavía no hay datos. Espera unos segundos y recarga.</p>";
  } else {
    contenido += "<h2>Libros de la última descarga</h2><table border='1' cellpadding='6'>";
    contenido += "<tr><th>Título</th><th>Precio</th><th>Valoración</th><th>Disponibilidad</th></tr>";
    libros.forEach(function (l) {
      contenido += `<tr><td>${escapar(l.titulo)}</td><td>${l.precio}</td><td>${l.valoracion}/5</td><td>${escapar(l.disponible)}</td></tr>`;
    });
    contenido += "</table>";

    contenido += "<h2>Historial de descargas</h2><table border='1' cellpadding='6'>";
    contenido += "<tr><th>Consultado el</th><th>Libros</th><th>Precio medio</th><th>Más barato</th><th>Más caro</th></tr>";
    historial.forEach(function (h) {
      contenido += `<tr><td>${escapar(h.consultadoEl)}</td><td>${h.totalLibros}</td><td>${h.precioMedio}</td><td>${escapar(h.masBarato)}</td><td>${escapar(h.masCaro)}</td></tr>`;
    });
    contenido += "</table>";
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(contenido);
});

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
  hacerScraping(); // primera descarga al arrancar
  setInterval(hacerScraping, INTERVALO_MINUTOS * 60 * 1000);
});
