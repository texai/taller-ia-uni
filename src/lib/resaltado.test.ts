/**
 * Pruebas del recorte y del resaltado por línea.
 *
 * Lo caro de que falle no es que se vea feo: es que el docente escriba
 * `resaltar: [2, 3]` en el YAML, la lámina salga sin marcar, y en clase señale
 * con el dedo unas líneas que la sala no distingue de las demás.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { lineasResaltadas, recortar } from "./resaltado";

test("sin `resaltar` no hay ninguna línea marcada", () => {
  assert.equal(lineasResaltadas(undefined).size, 0);
  assert.equal(lineasResaltadas([]).size, 0);
});

test("un número suelto marca esa línea", () => {
  assert.deepEqual([...lineasResaltadas([3])], [3]);
});

test("un rango marca los dos extremos y todo lo de en medio", () => {
  assert.deepEqual([...lineasResaltadas(["2-4"])].sort(), [2, 3, 4]);
});

test("los números y los rangos se mezclan sin repetirse", () => {
  const lineas = lineasResaltadas([1, "3-5", 4]);
  assert.deepEqual([...lineas].sort((a, b) => a - b), [1, 3, 4, 5]);
});

test("un rango de una sola línea es esa línea", () => {
  assert.deepEqual([...lineasResaltadas(["7"])], [7]);
});

test("una entrada sin sentido se ignora, no tumba la lámina", () => {
  assert.equal(lineasResaltadas(["-"]).size, 0);
  assert.equal(lineasResaltadas(["hola"]).size, 0);
});

/**
 * Las líneas se cuentan sobre lo mostrado, no sobre el archivo.
 *
 * Es la decisión que hace que mover el recorte no obligue a rehacer los
 * números — y como es una convención y no algo derivable del código, conviene
 * que quede escrita en una prueba.
 */
test("recortar deja la primera línea mostrada como la número 1", () => {
  const fuente = "uno\ndos\ntres\ncuatro\ncinco";
  assert.equal(recortar(fuente, "3-4"), "tres\ncuatro");
  assert.equal(recortar(fuente, "3-4").split("\n")[0], "tres");
});

test("sin `lineas` se muestra todo", () => {
  const fuente = "uno\ndos";
  assert.equal(recortar(fuente, undefined), fuente);
});
