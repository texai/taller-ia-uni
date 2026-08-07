import { test } from "node:test";
import assert from "node:assert/strict";

import { avisosDeTiempo, UMBRAL_AVISO } from "./avisos";
import type { Item, Sesion } from "./tipos";

function item(id: string, minutos: number, extra: Partial<Item> = {}): Item {
  return { id, tipo: "titulo", titulo: id, minutos, ...extra } as Item;
}

/**
 * Una sesión de 15:00 a 17:00.
 *
 *   u1  30 min   a(20) b(10)
 *   u2  45 min   c(30) receso(15)   ← el receso empieza en el minuto 60 → 16:00
 *   u3  45 min   d(45)
 */
const SESION: Sesion = {
  id: "s1",
  numero: 1,
  titulo: "Prueba",
  horaInicio: "15:00",
  horaFin: "17:00",
  unidades: [
    {
      id: "u1",
      tipo: "repaso",
      titulo: "Uno",
      items: [item("a", 20), item("b", 10)],
    },
    {
      id: "u2",
      tipo: "reto",
      titulo: "Dos",
      items: [
        item("c", 30),
        { id: "pausa", tipo: "receso", minutos: 15 } as Item,
      ],
    },
    { id: "u3", tipo: "cierre", titulo: "Tres", items: [item("d", 45)] },
  ],
};

const EN_A = { unidad: 0, item: 0, paso: 0 };
const EN_C = { unidad: 1, item: 0, paso: 0 };
const EN_D = { unidad: 2, item: 0, paso: 0 };

function ids(avisos: { id: string }[]) {
  return avisos.map((a) => a.id);
}

// --------------------------------------------------------------------------

test("en hora no hay nada que avisar", () => {
  // A las 15:20 tocaba estar terminando el primer ítem, y ahí está.
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_A,
    horaActual: "15:20",
  });
  assert.deepEqual(avisos, []);
});

test("antes de empezar no se avisa de nada", () => {
  // Abrir el mando a las 14:30 no significa ir 30 minutos tarde.
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_A,
    horaActual: "14:30",
  });
  assert.deepEqual(avisos, []);
});

test("sin horas legibles no se inventa un aviso", () => {
  const sinHoras: Sesion = { ...SESION, horaInicio: undefined };
  assert.deepEqual(
    avisosDeTiempo({ sesion: sinHoras, pos: EN_A, horaActual: "16:00" }),
    [],
  );
  assert.deepEqual(
    avisosDeTiempo({ sesion: SESION, pos: EN_A, horaActual: "no es una hora" }),
    [],
  );
});

// ------------------------------------------------------------------ receso

test("el receso avisa por la hora, aunque la clase vaya por otro sitio", () => {
  // 16:20: el receso empezaba a las 16:00 y todavía se está en `c`.
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_C,
    horaActual: "16:20",
  });
  const receso = avisos.find((a) => a.id === "receso:pausa");
  assert.ok(receso, "debería avisar del receso");
  assert.match(receso.titulo, /16:00/);
});

test("un receso ya pasado no vuelve a avisar", () => {
  // A las 16:50 el receso quedó atrás: la clase está en la última unidad.
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_D,
    horaActual: "16:50",
  });
  assert.ok(!ids(avisos).some((i) => i.startsWith("receso:")));
});

test("estando dentro del receso tampoco se avisa de él", () => {
  const dentro = { unidad: 1, item: 1, paso: 0 };
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: dentro,
    horaActual: "16:20",
  });
  assert.ok(!ids(avisos).some((i) => i.startsWith("receso:")));
});

test("antes de su hora, el receso no aparece", () => {
  // 15:50: al receso todavía le faltan diez minutos.
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_C,
    horaActual: "15:50",
  });
  assert.ok(!ids(avisos).some((i) => i.startsWith("receso:")));
});

// ------------------------------------------------------------------ unidad

test("una unidad que se pasa de su hora avisa cuál y cuánto", () => {
  // `u1` debía cerrar a los 30 minutos, o sea a las 15:30. Son las 15:42.
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: { unidad: 0, item: 1, paso: 0 },
    horaActual: "15:42",
  });
  const suyo = avisos.find((a) => a.id === "unidad:u1");
  assert.ok(suyo, "debería avisar de la unidad");
  assert.match(suyo.titulo, /Uno/);
  assert.match(suyo.titulo, /12 min/);
});

// ------------------------------------------------------------------ desvío

test("el desvío acumulado propone qué recortar, de lo más caro a lo más barato", () => {
  // A las 15:45 tocaría ir por el minuto 45; se sigue en `a`, minuto 20.
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_A,
    horaActual: "15:45",
  });
  const desvio = avisos.find((a) => a.id === "desvio");
  assert.ok(desvio, "debería avisar del desvío");
  assert.match(desvio.titulo, /25 min/);
  assert.deepEqual(
    desvio.recortes?.map((r) => [r.id, r.minutos]),
    [
      ["u2", 45],
      ["u3", 45],
    ],
  );
});

test("un atraso por debajo del umbral no molesta", () => {
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_A,
    horaActual: `15:${20 + UMBRAL_AVISO - 1}`,
  });
  assert.ok(!ids(avisos).includes("desvio"));
});

test("ir adelantado no es un aviso", () => {
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_D,
    horaActual: "16:00",
  });
  assert.ok(!ids(avisos).includes("desvio"));
});

// --------------------------------------------------------------- la hora cero

test("el desvío se calcula igual con la sesión empezada tarde", () => {
  // La misma clase, corrida diez minutos: si arrancó a las 15:10, a las 15:55
  // va exactamente igual de atrasada que la que arrancó a las 15:00 a las
  // 15:45. El cálculo no cambia; lo único que cambia es desde dónde se cuenta.
  const puntual = avisosDeTiempo({
    sesion: SESION,
    pos: EN_A,
    horaActual: "15:45",
  });
  const tardia = avisosDeTiempo({
    sesion: SESION,
    pos: EN_A,
    horaActual: "15:55",
    inicio: "15:10",
  });

  assert.deepEqual(
    tardia.map((a) => a.titulo),
    puntual.map((a) => a.titulo),
  );
});

test("empezar tarde no inventa un atraso que no existe", () => {
  // Arrancó a las 15:10 y son las 15:30: lleva 20 minutos de clase y va por el
  // ítem de 20 minutos. Está en hora, aunque el reloj de pared diga 15:30.
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_A,
    horaActual: "15:30",
    inicio: "15:10",
  });
  assert.deepEqual(avisos, []);
});

// ----------------------------------------------------------------- el orden

test("lo urgente va primero", () => {
  // 16:30: el receso lleva 15 minutos de retraso (urgente) y la unidad `u2`
  // se pasó 5 (aviso).
  const avisos = avisosDeTiempo({
    sesion: SESION,
    pos: EN_C,
    horaActual: "16:30",
  });
  assert.ok(avisos.length >= 2);
  assert.equal(avisos[0]?.urgencia, "urgente");
});
