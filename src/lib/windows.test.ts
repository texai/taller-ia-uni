/**
 * Que la línea de Windows se pueda teclear.
 *
 * Es una traducción mecánica que la clase copia literalmente de la pantalla,
 * así que el fallo que importa no es «no traduce» —eso lo caza el validador—
 * sino «traduce mal»: una línea plausible que no corre, delante de veinte
 * personas que no saben si el error es suyo.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { aPowerShell, esComandoMake } from "./windows";

test("un comando pelado", () => {
  assert.equal(aPowerShell("make arriba"), String.raw`.\taller.ps1 arriba`);
  assert.equal(aPowerShell("make reparar"), String.raw`.\taller.ps1 reparar`);
  assert.equal(aPowerShell("make senales"), String.raw`.\taller.ps1 senales`);
});

test("`ARGS` pierde el envoltorio: en PowerShell van sueltos", () => {
  assert.equal(
    aPowerShell(`make verificar ARGS="--reto 1"`),
    String.raw`.\taller.ps1 verificar --reto 1`,
  );
  assert.equal(
    aPowerShell(`make agente ARGS="--verboso"`),
    String.raw`.\taller.ps1 agente --verboso`,
  );
  // Con espacio dentro de las comillas, que es donde se rompería si se
  // trocease por espacios.
  assert.equal(
    aPowerShell(`make agente ARGS="--verboso --fecha 2026-08-08"`),
    String.raw`.\taller.ps1 agente --verboso --fecha 2026-08-08`,
  );
});

test("`ESCENARIO` y `SERVICIO` se vuelven posicionales", () => {
  assert.equal(
    aPowerShell("make romper ESCENARIO=sesgo_silencioso"),
    String.raw`.\taller.ps1 romper sesgo_silencioso`,
  );
  assert.equal(
    aPowerShell("make logs SERVICIO=agente"),
    String.raw`.\taller.ps1 logs agente`,
  );
});

test("`make ayuda` es `.\\taller.ps1` a secas", () => {
  // El script sin argumentos ya lista los comandos, y es como se documenta a
  // sí mismo. Decir «ayuda» sobra.
  assert.equal(aPowerShell("make ayuda"), String.raw`.\taller.ps1`);
  assert.equal(aPowerShell("make"), String.raw`.\taller.ps1`);
});

test("una cadena con `&&` se traduce entera, y el separador cambia", () => {
  assert.equal(
    aPowerShell("make reparar && make romper ESCENARIO=feed_caido"),
    String.raw`.\taller.ps1 reparar; .\taller.ps1 romper feed_caido`,
  );
});

test("media traducción no vale: o entera o nada", () => {
  // Teclear la mitad buena y la mitad rota es peor que no ofrecer nada.
  assert.equal(aPowerShell("make reparar && docker compose ps"), null);
});

test("lo que no es `make` se deja en paz", () => {
  // `docker compose` y `curl` se teclean igual en PowerShell: no hay segunda
  // línea que dibujar.
  assert.equal(aPowerShell("docker compose up -d plataforma ui"), null);
  assert.equal(aPowerShell(`curl -s "http://localhost:8000/v1/metricas"`), null);
  assert.equal(aPowerShell("# un comentario de la demo"), null);
  assert.equal(aPowerShell("→ listar_modelos()"), null);
});

test("un `target` que `taller.ps1` no conoce no se inventa", () => {
  // Es el caso que motivó todo: `plano` y `senales` estaban en el Makefile y
  // no en el script, y en Windows contestaban «No conozco el comando».
  assert.equal(aPowerShell("make loquesea"), null);
  assert.equal(aPowerShell("make deploy"), null);
});

test("una variable desconocida tampoco", () => {
  // Adivinar dónde va el valor produce una línea plausible y equivocada.
  assert.equal(aPowerShell("make romper NIVEL=3"), null);
});

test("`esComandoMake` separa «no hace falta» de «falta»", () => {
  // Sin esta distinción el validador no puede exigir nada: los dos casos
  // llegan como `null`.
  assert.ok(esComandoMake("make loquesea"));
  assert.ok(esComandoMake("make reparar && docker compose ps"));
  assert.ok(!esComandoMake("docker compose ps"));
  assert.ok(!esComandoMake("makefile es otra cosa"));
});
