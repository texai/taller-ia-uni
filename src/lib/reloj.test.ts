import { test } from "node:test";
import assert from "node:assert/strict";

import {
  aHora,
  aMinutos,
  ahora,
  comoCuentaRegresiva,
  comoDuracion,
  horaDeRegreso,
  minutosEntre,
} from "./reloj";

test("horaDeRegreso suma los minutos del receso", () => {
  assert.equal(horaDeRegreso("16:40", 15), "16:55");
  assert.equal(horaDeRegreso("10:55", 15), "11:10");
  assert.equal(horaDeRegreso("09:00", 90), "10:30");
});

test("horaDeRegreso cruza la hora en punto", () => {
  assert.equal(horaDeRegreso("16:55", 15), "17:10");
  assert.equal(horaDeRegreso("18:50", 20), "19:10");
});

test("horaDeRegreso da la vuelta a medianoche sin negativos", () => {
  // No pasa en este taller, pero un formato que produce "24:10" o "-1:50" es
  // el tipo de cosa que se descubre proyectada.
  assert.equal(horaDeRegreso("23:50", 30), "00:20");
});

test("horaDeRegreso devuelve null antes que inventar una hora", () => {
  // Anunciar una hora equivocada divide la clase en dos grupos que vuelven en
  // momentos distintos. Mejor no anunciar ninguna.
  assert.equal(horaDeRegreso("no es una hora", 15), null);
  assert.equal(horaDeRegreso("25:00", 15), null);
  assert.equal(horaDeRegreso("16:70", 15), null);
  assert.equal(horaDeRegreso("16:40", NaN), null);
});

test("aMinutos y aHora son inversas", () => {
  for (const h of ["00:00", "09:05", "15:00", "23:59"]) {
    assert.equal(aHora(aMinutos(h)!), h);
  }
});

test("comoCuentaRegresiva rellena los segundos", () => {
  assert.equal(comoCuentaRegresiva(900), "15:00");
  assert.equal(comoCuentaRegresiva(65), "1:05");
  assert.equal(comoCuentaRegresiva(9), "0:09");
  assert.equal(comoCuentaRegresiva(-5), "0:00");
});

test("ahora formatea con dos dígitos", () => {
  assert.equal(ahora(new Date(2026, 7, 8, 9, 5)), "09:05");
  assert.equal(ahora(new Date(2026, 7, 8, 15, 0)), "15:00");
});

test("minutosEntre mide la distancia entre dos horas", () => {
  assert.equal(minutosEntre("15:00", "19:00"), 240);
  assert.equal(minutosEntre("15:00", "15:20"), 20);
});

test("minutosEntre es negativo antes de empezar", () => {
  // Es lo que el mando muestra si se abre a las 14:30: la sesión no empezó, y
  // decir "quedan 23 h 30 min" sería peor que decir "−30 min".
  assert.equal(minutosEntre("15:00", "14:30"), -30);
});

test("minutosEntre devuelve null si falta una hora o no se entiende", () => {
  assert.equal(minutosEntre(undefined, "19:00"), null);
  assert.equal(minutosEntre("15:00", undefined), null);
  assert.equal(minutosEntre("tarde", "19:00"), null);
});

test("comoDuracion separa horas de minutos y marca lo negativo", () => {
  assert.equal(comoDuracion(200), "3 h 20 min");
  assert.equal(comoDuracion(20), "20 min");
  assert.equal(comoDuracion(60), "1 h 00 min");
  assert.equal(comoDuracion(-5), "−5 min");
  assert.equal(comoDuracion(0), "0 min");
});
