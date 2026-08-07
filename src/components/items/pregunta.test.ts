/**
 * Lo que la pantalla proyectada NO puede pintar.
 *
 * El curso se dicta compartiendo pantalla, así que la vista del docente
 * —`Dictado` con `modoDocente`— la lee la clase entera. Durante una prueba en
 * vivo se vio la respuesta correcta en verde y con un ✓ **antes de enviar la
 * pregunta**: la sala la leía a la vez que el enunciado, y preguntar dejaba de
 * medir nada.
 *
 * Es una invariante del mismo orden que las de `CONVENTIONS.md` §3 y §14, y por
 * eso tiene prueba: se rompe con un cambio de estilo de tres caracteres y no se
 * descubre hasta tenerla proyectada delante de veinte personas.
 *
 * Se renderiza a HTML plano en vez de montar un navegador. Alcanza: lo que se
 * comprueba es si la respuesta **aparece en la lámina**, y para eso el marcado
 * es la fuente de verdad.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Pregunta } from "./pregunta";
import type { ItemPregunta } from "@/lib/tipos";

const PREGUNTA: ItemPregunta = {
  id: "s1-pregunta-reentrenar",
  tipo: "pregunta",
  pregunta: "¿Cuáles vuelven a entrenar los 192 modelos?",
  opciones: [
    "Las tres",
    "romper y reparar, porque cambian los datos",
    "Solo seed, y solo la primera vez",
    "Ninguna",
  ],
  respuesta: "Solo seed, y solo la primera vez",
  solucion: { explicacion: "Solo `seed`, y solo la primera vez." },
};

const CORRECTA = PREGUNTA.respuesta!;

test("la pantalla que se proyecta no marca la respuesta antes de enviarla", () => {
  const html = renderToStaticMarkup(
    createElement(Pregunta, { item: PREGUNTA, modoDocente: true }),
  );

  // Las cuatro opciones se ven: la clase tiene que poder leerlas mientras
  // piensa. Lo que no puede verse es cuál es.
  for (const o of PREGUNTA.opciones ?? []) {
    assert.ok(html.includes(o), `falta la opción «${o}»`);
  }

  // El ✓ es lo que delataba. Ni él, ni el color de acento sobre esa línea.
  assert.ok(!html.includes("✓"), "la lámina proyectada marca una opción con ✓");

  const linea = html.slice(html.indexOf(CORRECTA) - 200, html.indexOf(CORRECTA));
  assert.ok(
    !linea.includes("--color-acento"),
    "la opción correcta se pinta distinta del resto",
  );

  // Y la explicación no se dibuja hasta el revelado, que es cuando viaja.
  assert.ok(
    !html.includes("Por qué"),
    "la solución aparece antes de revelar",
  );
});

test("y con el revelado sí la marca, que es el momento de enseñarla", () => {
  const html = renderToStaticMarkup(
    createElement(Pregunta, {
      item: PREGUNTA,
      modoDocente: true,
      revelado: {
        preguntaId: PREGUNTA.id,
        conteo: { [CORRECTA]: 3 },
        total: 3,
        omitidas: 0,
        abiertas: [],
        correcta: CORRECTA,
        solucion: PREGUNTA.solucion,
        momento: 0,
      },
    }),
  );

  assert.ok(html.includes("✓"), "el revelado no marca la correcta");
  assert.ok(html.includes("Por qué"), "el revelado no trae la explicación");
});
