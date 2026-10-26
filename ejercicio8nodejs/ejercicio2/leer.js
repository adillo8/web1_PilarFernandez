// Ejercicio 2: comprobamos que peliculas.json es un JSON válido y lo recorremos

const fs = require("fs");
const path = require("path");

let texto = fs.readFileSync(path.join(__dirname, "peliculas.json"), "utf8");
let datos = JSON.parse(texto); // si el JSON está mal formado, aquí salta un error

datos.peliculas.forEach(function (peli) {
  console.log(`${peli.titulo} (dir. ${peli.director})`);
  console.log("  Actores:", peli.actoresPrincipales.join(", "));
  peli.sesiones.forEach(function (sesion) {
    console.log(`  Sala ${sesion.sala}: ${sesion.horas.join(" y ")}`);
  });
});
