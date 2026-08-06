import { test } from "node:test";
import assert from "node:assert/strict";

import { canalDePreguntas, canalDeRespuestas, contar, esMasNueva, nombreCanal } from "./vivo";
import type { RespuestaAlumno } from "./vivo";

function r(
  alumnoId: string,
  extra: Partial<RespuestaAlumno> = {},
): RespuestaAlumno {
  return {
    preguntaId: "p1",
    alumnoId,
    omitida: false,
    momento: 1,
    ...extra,
  };
}

test("los canales llevan prefijo, porque el proyecto es compartido", () => {
  assert.equal(nombreCanal("taller-02", "sesion-1"), "taller:taller-02:sesion-1");
  assert.match(canalDePreguntas("c", "s"), /^taller:.*:preguntas$/);
  assert.match(canalDeRespuestas("c", "s"), /^taller:.*:respuestas$/);
});

test("una pauta vieja no arrastra la clase hacia atrás", () => {
  assert.ok(esMasNueva({ itemId: "b", paso: 0, enVivo: true, momento: 2 }, { itemId: "a", paso: 0, enVivo: true, momento: 1 }));
  assert.ok(!esMasNueva({ itemId: "a", paso: 0, enVivo: true, momento: 1 }, { itemId: "b", paso: 0, enVivo: true, momento: 2 }));
});

test("contar agrupa por opción", () => {
  const v = contar(
    [r("a", { opcion: "MAPE" }), r("b", { opcion: "sesgo" }), r("c", { opcion: "sesgo" })],
    "p1",
  );
  assert.deepEqual(v.conteo, { MAPE: 1, sesgo: 2 });
  assert.equal(v.total, 3);
});

test("quien cambia de opinión no cuenta dos veces", () => {
  // Sin esto el total podría superar al número de conectados, y el recuento
  // proyectado diría más votos que personas en la sala.
  const v = contar(
    [
      r("a", { opcion: "MAPE", momento: 1 }),
      r("a", { opcion: "sesgo", momento: 2 }),
    ],
    "p1",
  );
  assert.deepEqual(v.conteo, { sesgo: 1 });
  assert.equal(v.total, 1);
});

test("omitir es una respuesta, no una ausencia", () => {
  const v = contar([r("a", { omitida: true }), r("b", { opcion: "x" })], "p1");
  assert.equal(v.omitidas, 1);
  assert.equal(v.total, 2);
  assert.deepEqual(v.conteo, { x: 1 });
});

test("las respuestas de otra pregunta no se mezclan", () => {
  const v = contar(
    [r("a", { opcion: "x" }), r("b", { preguntaId: "p2", opcion: "y" })],
    "p1",
  );
  assert.equal(v.total, 1);
  assert.deepEqual(v.conteo, { x: 1 });
});

test("la correcta solo aparece en el revelado", () => {
  assert.equal(contar([], "p1").correcta, undefined);
  assert.equal(contar([], "p1", "sesgo").correcta, "sesgo");
});
