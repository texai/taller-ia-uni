/**
 * Los comandos de los retos se pueden copiar.
 *
 * La clase los teclea desde otra ventana, y lo que teclea son cosas como
 * `make verificar ARGS="--reto 1"`. Un error de dedo ahí son tres minutos de
 * reto perdidos, multiplicados por veinte personas.
 *
 * Se comprueba el marcado porque el botón es marcado: que exista, que lleve
 * el comando **completo** en su etiqueta accesible, y que no aparezca donde no
 * hay nada que teclear.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Lectura } from "./lectura";
import { Terminal, Demo } from "./codigo";
import type { ItemLectura, ItemTerminal, ItemDemo } from "@/lib/tipos";

test("la ventana de trabajo trae un botón por comando", () => {
  const item: ItemLectura = {
    id: "x",
    tipo: "lectura",
    minutos: 10,
    comandos: ['make verificar ARGS="--reto 1"', "make senales"],
  };
  const html = renderToStaticMarkup(createElement(Lectura, { item }));

  // Uno por comando, y otro por su línea de Windows: los dos se teclean.
  assert.equal(html.split("Copiar el comando").length - 1, 4);
  assert.ok(
    html.includes("Copiar el comando make verificar ARGS=&quot;--reto 1&quot;"),
    "la etiqueta no lleva el comando entero",
  );
  assert.ok(
    html.includes(String.raw`.\taller.ps1 verificar --reto 1`),
    "la línea de Windows no se puede copiar",
  );
});

test("`terminal` también, con su línea de Windows", () => {
  const item: ItemTerminal = {
    id: "x",
    tipo: "terminal",
    comando: "make reparar && make romper ESCENARIO=sesgo_silencioso",
  };
  const html = renderToStaticMarkup(createElement(Terminal, { item }));
  assert.equal(html.split("Copiar el comando").length - 1, 2);
});

test("un paso de demo que es un comentario no se copia", () => {
  // Media docena de pasos del curso son `# y para la peor tienda:` o
  // `→ listar_modelos()`. No hay nada que teclear, y un botón ahí es ruido.
  const item: ItemDemo = {
    id: "x",
    tipo: "demo",
    pasos: [
      { comando: "make senales" },
      { comando: "# y para la peor tienda, dentro de esa categoría:" },
      { comando: "→ listar_modelos()" },
    ],
  };
  const html = renderToStaticMarkup(createElement(Demo, { item }));
  const copiables = [...html.matchAll(/Copiar el comando ([^"]*)"/g)].map(
    (m) => m[1],
  );

  // Dos, no uno: `make senales` copia su propia línea y la de Windows. Los
  // dos pasos que no son comandos no aportan ninguno.
  assert.deepEqual(copiables, ["make senales", String.raw`.\taller.ps1 senales`]);
});
