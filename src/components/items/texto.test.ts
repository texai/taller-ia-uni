/**
 * Los enlaces del material no pueden sacar al docente de la lámina.
 *
 * Pulsar el GitHub de la ficha del docente —o cualquier enlace del curso—
 * navegaba **fuera de la lámina**. Proyectando eso no es una molestia: es
 * perder la posición del dictado delante de la clase y tener que volver con
 * el botón de atrás mientras veinte personas miran.
 *
 * Se renderiza a HTML plano en vez de montar un navegador: lo que se comprueba
 * es un atributo del marcado, y para eso el marcado es la fuente de verdad.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Markdown, Prosa } from "./texto";

test("un enlace externo abre en pestaña nueva", () => {
  const html = renderToStaticMarkup(
    createElement(Markdown, {
      children: "[GitHub](https://github.com/texai/)",
    }),
  );
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("y también dentro de `Prosa`, que es el otro sitio donde hay markdown", () => {
  const html = renderToStaticMarkup(
    createElement(Prosa, { children: "ver [el repo](https://github.com/x)" }),
  );
  assert.match(html, /target="_blank"/);
});

test("un ancla interna NO abre pestaña", () => {
  // Sería peor que el problema que se está resolviendo.
  const html = renderToStaticMarkup(
    createElement(Markdown, { children: "[abajo](#seccion)" }),
  );
  assert.ok(!html.includes("target="), "un enlace interno abre pestaña");
});
