import { test } from "node:test";
import assert from "node:assert/strict";

import { llave, solapamientos, trocear, ubicar } from "./anotaciones";

const COMANDO =
  "docker compose run --rm -e EJECUTAR_ACCIONES=1 agente python -m agente run";

test("ubicar encuentra un segmento y dice dónde empieza", () => {
  const u = ubicar(COMANDO, "--rm");
  assert.deepEqual(u, {
    desde: 19,
    hasta: 23,
    linea: 0,
    columna: 19,
    ancho: 4,
  });
});

test("ubicar devuelve null si el texto no está", () => {
  assert.equal(ubicar(COMANDO, "--no-existe"), null);
});

test("ubicar cuenta líneas y columnas en un comando de varias líneas", () => {
  const multi = ["docker compose run \\", "  --rm \\", "  agente"].join("\n");
  const u = ubicar(multi, "--rm");
  assert.equal(u?.linea, 1);
  assert.equal(u?.columna, 2);
});

test("un segmento que cruza un salto de línea no tiene ancho", () => {
  // Sin ancho no se le puede dibujar la llave debajo, y hay que saberlo antes
  // de intentarlo en vez de pintar una llave desalineada.
  const multi = "docker compose \\\n  run";
  assert.equal(ubicar(multi, "\\\n  run")?.ancho, null);
});

// --------------------------------------------------------------------------

test("trocear cubre el comando entero, sin perder ni un carácter", () => {
  // La invariante que importa: el comando se muestra COMPLETO, resaltando una
  // parte. Si al trocear se perdiera algo, el alumno vería un comando que no
  // es el que tiene que escribir.
  const trozos = trocear(COMANDO, [
    { texto: "--rm" },
    { texto: "-e EJECUTAR_ACCIONES=1" },
  ]);
  assert.equal(trozos.map((t) => t.texto).join(""), COMANDO);
});

test("trocear marca qué trozo es de qué segmento", () => {
  const trozos = trocear(COMANDO, [{ texto: "--rm" }]);
  const marcados = trozos.filter((t) => t.segmento !== null);
  assert.equal(marcados.length, 1);
  assert.equal(marcados[0]?.texto, "--rm");
  assert.equal(marcados[0]?.segmento, 0);
});

test("los trozos salen en el orden del comando, no en el del YAML", () => {
  // Quien escribe el material anota primero lo que le parece más importante, y
  // eso no tiene por qué ser la primera palabra.
  const trozos = trocear(COMANDO, [
    { texto: "agente python" },
    { texto: "docker" },
  ]);
  const orden = trozos.filter((t) => t.segmento !== null).map((t) => t.texto);
  assert.deepEqual(orden, ["docker", "agente python"]);
});

test("un segmento inexistente se ignora al trocear", () => {
  // El cargador ya falló por él. Este módulo no decide dos veces lo mismo, y
  // sobre todo no rompe la lámina por algo ya reportado.
  const trozos = trocear(COMANDO, [{ texto: "--no-existe" }, { texto: "--rm" }]);
  assert.equal(trozos.map((t) => t.texto).join(""), COMANDO);
  assert.equal(trozos.filter((t) => t.segmento !== null).length, 1);
});

test("un comando sin segmentos es un solo trozo sin marcar", () => {
  const trozos = trocear(COMANDO, []);
  assert.deepEqual(trozos, [{ texto: COMANDO, segmento: null }]);
});

// --------------------------------------------------------------------------

test("la llave queda debajo de su parte, columna por columna", () => {
  // Se cuenta en caracteres porque el comando va en monoespaciada. Una llave
  // que no queda debajo de su parte es peor que ninguna llave.
  const l = llave(19, 4);
  assert.equal(l, `${" ".repeat(19)}└──┘`);
  assert.equal(l.indexOf("└"), 19);
  assert.equal(l.length, 23);
});

test("la llave de un solo carácter es una flecha", () => {
  assert.equal(llave(3, 1), "   ↑");
});

test("la llave de dos caracteres no se queda sin extremos", () => {
  assert.equal(llave(0, 2), "└┘");
});

// --------------------------------------------------------------------------

test("dos segmentos que se pisan se reportan", () => {
  // Si uno se traga al otro, el segundo nunca llega a enfocarse y el recorrido
  // se salta una explicación sin decir nada.
  const pares = solapamientos(COMANDO, [
    { texto: "-e EJECUTAR_ACCIONES=1" },
    { texto: "EJECUTAR_ACCIONES=1 agente" },
  ]);
  assert.deepEqual(pares, [
    ["-e EJECUTAR_ACCIONES=1", "EJECUTAR_ACCIONES=1 agente"],
  ]);
});

test("segmentos que solo se tocan no se pisan", () => {
  assert.deepEqual(solapamientos("abcdef", [{ texto: "abc" }, { texto: "def" }]), []);
});
