import { test } from "node:test";
import assert from "node:assert/strict";

import {
  alRelojDeAqui,
  canalDePreguntas,
  canalDeRespuestas,
  contar,
  esMasNueva,
  nombreCanal,
} from "./vivo";
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

// --------------------------------------------------------------------------
// La solución
// --------------------------------------------------------------------------

test("la solución viaja en el revelado, y solo ahí", () => {
  // Es el mismo trato que `correcta`: no existe en ningún navegador hasta que
  // el docente decide mostrarla.
  const solucion = { explicacion: "porque el sesgo mide dirección" };
  const sin = contar([], "p1", "El sesgo");
  const con = contar([], "p1", "El sesgo", solucion);
  assert.equal(sin.solucion, undefined);
  assert.deepEqual(con.solucion, solucion);
});

test("los descartes sobreviven al recuento", () => {
  const solucion = {
    explicacion: "ninguno solo",
    descartes: [{ opcion: "El MAPE", razon: "mide distancia" }],
  };
  const r = contar([], "p1", undefined, solucion);
  assert.equal(r.solucion?.descartes?.[0]?.opcion, "El MAPE");
});

// --------------------------------------------------------------------------
// El plazo, entre dos relojes
// --------------------------------------------------------------------------

/**
 * El caso que lo motivó: en una prueba en vivo la clase veía **quince
 * segundos menos** que el docente. No era la red — era que el instante de
 * cierre se calcula en el reloj de quien abre la pregunta y se resta contra el
 * de quien la recibe.
 */
test("el plazo se traduce al reloj de quien lo recibe", () => {
  // El docente abre 60 s a las 1 000 000 de su reloj.
  const suya = {
    preguntaId: "p1",
    segundos: 60,
    hasta: 1_000_000 + 60_000,
    emitido: 1_000_000,
  };

  // El teléfono del alumno va quince segundos adelantado: recibe el mensaje
  // cuando su reloj marca 1 015 000.
  const mia = alRelojDeAqui(suya, 1_015_000);

  // Y le quedan los sesenta que le tocan, no cuarenta y cinco.
  assert.equal(mia.hasta - 1_015_000, 60_000);
  // La duración concedida no se toca: la barra de progreso la necesita entera.
  assert.equal(mia.segundos, 60);
});

test("y también si el reloj de quien recibe va atrasado", () => {
  const suya = {
    preguntaId: "p1",
    segundos: 60,
    hasta: 1_000_000 + 60_000,
    emitido: 1_000_000,
  };
  const mia = alRelojDeAqui(suya, 980_000);
  assert.equal(mia.hasta - 980_000, 60_000);
});

test("la latencia sí se descuenta, porque es tiempo que el alumno perdió", () => {
  // Relojes idénticos y 300 ms de red: el alumno tiene 59,7 s, no 60.
  const suya = {
    preguntaId: "p1",
    segundos: 60,
    hasta: 1_000_000 + 60_000,
    emitido: 1_000_000,
  };
  const mia = alRelojDeAqui(suya, 1_000_300);
  assert.equal(mia.hasta - 1_000_300, 60_000);
  // …que es lo mismo que decir que el instante de cierre no se movió.
  assert.equal(mia.hasta, 1_060_300);
});

test("sin `emitido` no se corrige nada, que es como se comportaba antes", () => {
  // Una pestaña vieja a medio taller no puede empeorar lo que había.
  const vieja = { preguntaId: "p1", segundos: 60, hasta: 1_060_000 };
  assert.equal(alRelojDeAqui(vieja, 1_015_000).hasta, 1_060_000);
});
