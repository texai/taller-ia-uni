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
import { readFileSync } from "node:fs";
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

/**
 * El botón que no era un botón.
 *
 * Una pregunta lanzada al vuelo se dibujaba en la pantalla proyectada con su
 * enunciado, sus alternativas y un «Enviar pregunta a la clase» que **no hacía
 * nada al pulsarlo**: `Dictado` no le pasaba `onAbrir`, y la llamada opcional
 * se evaporaba sin error. Las pauteadas sí lo traían, así que el fallo solo
 * aparecía improvisando — delante de la sala, esperando una pregunta que nunca
 * se abría.
 *
 * Dos defensas, y las dos se prueban: el control no se pinta si no puede
 * funcionar, y las dos llamadas de `Dictado` pasan lo que hace falta.
 */

test("sin `onAbrir` no se pinta el control de enviar", () => {
  const html = renderToStaticMarkup(
    createElement(Pregunta, { item: PREGUNTA, modoDocente: true }),
  );
  assert.ok(
    !html.includes("Enviar pregunta a la clase"),
    "se dibuja un botón que no puede abrir la pregunta",
  );
  assert.ok(!html.includes("Tiempo para responder"));
});

test("con `onAbrir` sí, que es el caso normal", () => {
  const html = renderToStaticMarkup(
    createElement(Pregunta, {
      item: PREGUNTA,
      modoDocente: true,
      onAbrir: () => {},
    }),
  );
  assert.ok(html.includes("Enviar pregunta a la clase"));
  assert.ok(html.includes("Tiempo para responder"));
});

test("las dos preguntas de `Dictado` se pueden abrir", () => {
  // Se lee el archivo porque el fallo estaba en el cableado y no en el
  // componente: montar `Dictado` acá pediría Supabase.
  //
  // Las dos rutas no se parecen. La pauteada se dibuja dentro de `Item`, que
  // recibe un objeto `vivo`; la improvisada monta `<Pregunta>` directamente.
  // Esa asimetría es justo la razón de que una llevara `onAbrir` y la otra no.
  const fuente = readFileSync(
    new URL("../Dictado.tsx", import.meta.url),
    "utf8",
  );

  const directos = fuente.split(/<Pregunta\s/).slice(1);
  assert.equal(directos.length, 1, "cambió el número de <Pregunta> directos");
  for (const uso of directos) {
    const props = uso.slice(0, uso.indexOf("/>"));
    assert.match(props, /onAbrir/, "el <Pregunta> improvisado no puede abrirse");
    assert.match(props, /apertura/, "el <Pregunta> improvisado no ve la apertura");
  }

  const vivos = fuente.split(/vivo=\{\{/).slice(1);
  assert.equal(vivos.length, 1, "cambió el número de `vivo={{...}}`");
  for (const uso of vivos) {
    const props = uso.slice(0, uso.indexOf("}}"));
    assert.match(props, /onAbrir/, "la pregunta pauteada no puede abrirse");
    assert.match(props, /apertura/, "la pregunta pauteada no ve la apertura");
  }
});
