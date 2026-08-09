/**
 * Reescribe los números de lámina de las pautas del docente.
 *
 *     npm run numerar-pauta            actualiza los archivos
 *     npm run numerar-pauta -- --ver   solo dice cuáles están desfasados
 *
 * Las pautas citan cada comando con la lámina donde sale: `# ← lámina 48 ·
 * s1-r3-antes-despues`. El **número** es lo que se teclea en el salto rápido
 * del mando, así que es lo que se busca; el identificador va detrás porque no
 * cambia nunca y el número sí — insertar una lámina en medio corre todas las
 * de después.
 *
 * Por eso esto es un comando y no una comprobación del build. Una lámina
 * nueva no debe romper la compilación la noche antes de dictar: debe costar
 * un `npm run numerar-pauta`. Lo que sí es error de build es que una pauta
 * cite un ítem que ya no existe, y de eso se ocupa `validar-pauta`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { cargarCurso, recorrer } from "../src/lib/contenido";

const VERDE = "\x1b[32m";
const AMARILLO = "\x1b[33m";
const GRIS = "\x1b[90m";
const FIN = "\x1b[0m";

/** Qué pauta numera contra qué sesión. `null` = todas, en orden. */
const PAUTAS: { archivo: string; sesion: number | null }[] = [
  { archivo: "docs/pauta-sesion-2.sh", sesion: 1 },
  { archivo: "docs/pauta-de-comandos.sh", sesion: null },
];

/**
 * El número de cada ítem, contando desde el principio de su sesión.
 *
 * Es el mismo que la vista de dictado muestra arriba a la derecha —«48 / 143»—
 * y el que acepta el salto rápido. Cuando la pauta cubre las dos sesiones, la
 * numeración se reinicia en cada una, igual que en pantalla.
 */
function numeros(sesion: number | null): Map<string, string> {
  const curso = cargarCurso();
  const fuera = new Map<string, string>();
  const sesiones =
    sesion === null ? curso.sesiones : [curso.sesiones[sesion]!];

  for (const s of sesiones) {
    let n = 0;
    for (const { item } of recorrer(s)) {
      n++;
      fuera.set(item.id, sesion === null ? `S${s.numero}·${n}` : String(n));
    }
  }
  return fuera;
}

function renumerar(texto: string, num: Map<string, string>): string {
  // `← lámina 5 · id` o `← láminas 37 y 38 · id · id`: se descarta lo que
  // hubiera y se recalcula desde los identificadores, que son la verdad.
  return texto.replace(
    /← (?:láminas? [^·]+ · )?([a-z0-9-]+)((?: · [a-z0-9-]+)*)/g,
    (todo, primero: string, resto: string) => {
      const ids = [primero, ...resto.split(" · ").filter(Boolean)];
      const nums = ids.map((i) => num.get(i)).filter((x): x is string => !!x);
      if (nums.length !== ids.length) return todo; // algún id desconocido
      const etiqueta =
        nums.length === 1 ? `lámina ${nums[0]}` : `láminas ${nums.join(" y ")}`;
      return `← ${etiqueta} · ${ids.join(" · ")}`;
    },
  );
}

function main(): void {
  const soloVer = process.argv.includes("--ver");
  let desfasados = 0;

  for (const { archivo, sesion } of PAUTAS) {
    const ruta = join(process.cwd(), archivo);
    const antes = readFileSync(ruta, "utf8");
    const despues = renumerar(antes, numeros(sesion));

    if (antes === despues) {
      console.log(`${VERDE}✓${FIN} ${archivo} ${GRIS}al día${FIN}`);
      continue;
    }
    desfasados++;
    if (soloVer) {
      console.log(`${AMARILLO}·${FIN} ${archivo} ${GRIS}desfasado${FIN}`);
    } else {
      writeFileSync(ruta, despues);
      console.log(`${VERDE}✓${FIN} ${archivo} ${GRIS}renumerado${FIN}`);
    }
  }

  if (soloVer && desfasados) process.exit(1);
}

main();
