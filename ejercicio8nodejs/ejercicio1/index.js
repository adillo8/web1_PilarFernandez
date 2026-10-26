// Ejercicio 1: servidor que vigila el sistema (la Entidad nos observa...)
// - Al iniciar muestra información del sistema y la versión de node.js
// - Cada X segundos muestra CPU, memoria y tiempos de actividad
// - Qué se muestra y cada cuánto se define en config.json

const http = require("http");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Leemos la configuración del fichero config.json
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));

const port = process.env.PORT || config.puerto;

// ---------- Funciones auxiliares ----------

// Pasa bytes a megabytes con 1 decimal
function aMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

// Pasa segundos a "Xh Ym Zs"
function formatearTiempo(segundos) {
  let total = Math.floor(segundos);
  let horas = Math.floor(total / 3600);
  let minutos = Math.floor((total % 3600) / 60);
  let segs = total % 60;
  return `${horas}h ${minutos}m ${segs}s`;
}

// Suma el tiempo de CPU de todos los núcleos: cuánto llevan en reposo y cuánto en total
function medirCpu() {
  let reposo = 0;
  let total = 0;
  os.cpus().forEach(function (nucleo) {
    for (let tipo in nucleo.times) {
      total += nucleo.times[tipo];
    }
    reposo += nucleo.times.idle;
  });
  return { reposo, total };
}

// ---------- Información inicial ----------

function mostrarInfoInicial() {
  console.log("=== Información del sistema ===");
  console.log("Equipo:", os.hostname());
  console.log("Sistema operativo:", process.platform, os.release());
  console.log("Arquitectura:", process.arch);
  console.log("Núcleos de CPU:", os.cpus().length);
  console.log("Memoria total:", aMB(os.totalmem()), "MB");
  console.log("Versión de node.js:", process.version);
  console.log("Se mostrará el estado cada", config.intervaloSegundos, "segundos");
  console.log("");
}

// ---------- Información periódica ----------

let cpuAnterior = medirCpu();

function mostrarEstado() {
  console.log(`--- Estado a las ${new Date().toLocaleTimeString()} ---`);

  if (config.mostrar.cpu) {
    // Uso de CPU desde la última medición
    let cpuActual = medirCpu();
    let diffTotal = cpuActual.total - cpuAnterior.total;
    let diffReposo = cpuActual.reposo - cpuAnterior.reposo;
    let uso = diffTotal > 0 ? 100 - (diffReposo / diffTotal) * 100 : 0;
    cpuAnterior = cpuActual;
    console.log(`Uso de CPU: ${uso.toFixed(1)}%`);
  }

  if (config.mostrar.memoria) {
    let usada = os.totalmem() - os.freemem();
    let porcentaje = (usada / os.totalmem()) * 100;
    console.log(`Memoria del sistema: ${aMB(usada)} MB usados (${porcentaje.toFixed(1)}%)`);
    console.log(`Memoria de node.js: ${aMB(process.memoryUsage().rss)} MB`);
  }

  if (config.mostrar.tiempoSistema) {
    console.log("Sistema activo desde hace:", formatearTiempo(os.uptime()));
  }

  if (config.mostrar.tiempoNode) {
    console.log("node.js ejecutándose desde hace:", formatearTiempo(process.uptime()));
  }

  console.log("");
}

// ---------- Servidor ----------

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end("<h1>La Entidad vigila el servidor</h1><p>Mira la consola para ver el estado del sistema.</p>");
});

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
  mostrarInfoInicial();
  setInterval(mostrarEstado, config.intervaloSegundos * 1000);
});
