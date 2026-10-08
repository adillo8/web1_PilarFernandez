// ==UserScript==
// @name         DBD en Wikipedia - sin banner y con botón de subir
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Quita el banner de donaciones y añade un botón para volver arriba en el artículo de Dead by Daylight
// @author       Pilar
// @match        https://es.wikipedia.org/wiki/Dead_by_Daylight*
// @grant        none
// ==/UserScript==

/*
  QUÉ CONSIGUE ESTE SCRIPT:
  1. ELIMINA algo molesto: el banner de donaciones que aparece arriba de la página
     (lo ocultamos con una regla CSS, así también se oculta si tarda en cargar).
  2. AÑADE algo extra: un botón fijo abajo a la derecha, "Subir", que te lleva
     al principio del artículo (la página de Dead by Daylight es muy larga).
*/

(function () {
  'use strict';
  console.log("¡Funciona! Script de DBD en Wikipedia cargado");

  // 1. Ocultar el banner de donaciones
  let estilo = document.createElement("style");
  estilo.textContent = "#siteNotice, #centralNotice { display: none !important; }";
  document.head.appendChild(estilo);

  // 2. Botón para volver arriba
  let boton = document.createElement("button");
  boton.textContent = "Subir";
  boton.style.position = "fixed";
  boton.style.bottom = "20px";
  boton.style.right = "20px";
  boton.style.padding = "10px 16px";
  boton.style.backgroundColor = "#b3141c";
  boton.style.color = "white";
  boton.style.border = "none";
  boton.style.cursor = "pointer";
  boton.style.zIndex = "9999";

  boton.addEventListener("click", function () {
    window.scrollTo(0, 0);
  });

  document.body.appendChild(boton);
})();
