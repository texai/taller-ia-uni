import { test } from "node:test";
import assert from "node:assert/strict";

import { diferencia, recuento } from "./diff";

const signos = (a: string, b: string) =>
  diferencia(a, b)
    .map((l) => ({ igual: "=", quita: "-", pone: "+" })[l.signo])
    .join("");

test("dos fragmentos idénticos no tienen ninguna diferencia", () => {
  assert.equal(signos("uno\ndos", "uno\ndos"), "==");
  assert.deepEqual(recuento(diferencia("uno\ndos", "uno\ndos")), {
    quita: 0,
    pone: 0,
  });
});

test("una línea insertada no arrastra a las de abajo", () => {
  // Es la razón de usar subsecuencia común y no comparar posición a posición:
  // así, insertar una línea marcaría como cambiadas todas las siguientes, y un
  // diff con todo en rojo no se lee desde la última fila.
  assert.equal(signos("a\nb\nc", "a\nNUEVA\nb\nc"), "=+==");
  assert.deepEqual(recuento(diferencia("a\nb\nc", "a\nNUEVA\nb\nc")), {
    quita: 0,
    pone: 1,
  });
});

test("una línea cambiada sale como una que se quita y otra que se pone", () => {
  assert.equal(signos("a\nvieja\nc", "a\nnueva\nc"), "=-+=");
});

test("una línea borrada se marca sola", () => {
  assert.equal(signos("a\nsobra\nc", "a\nc"), "=-=");
});

test("el salto final no cuenta como línea", () => {
  // Un YAML con `|` deja un `\n` al final, y sin esto todo fragmento tendría
  // una línea vacía de diferencia que nadie escribió.
  assert.equal(signos("a\nb\n", "a\nb"), "==");
});

test("de vacío a algo son solo altas", () => {
  assert.equal(signos("", "a\nb"), "-++");
});
