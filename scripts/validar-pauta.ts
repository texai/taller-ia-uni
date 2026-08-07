/**
 * Comprueba que la pauta del docente cubra todos los comandos del curso.
 *
 *     npm run validar-pauta
 *     npm run validar-pauta -- --listar     lista los comandos del contenido
 *
 * `docs/pauta-de-comandos.sh` es el ensayo general: el docente la recorre
 * bloque a bloque antes de dictar, comprobando que cada comando funcione y
 * mirando la evidencia entre uno y otro. Una pauta incompleta es peor que
 * ninguna, porque se confía en ella — así que esto falla si el contenido gana
 * un comando y la pauta no.
 *
 * Tres comprobaciones:
 *
 *  1. **Cobertura.** Todo comando que el curso dicta está en la pauta.
 *  2. **Sondas.** Todo comando que modifica el mundo tiene la misma sonda
 *     antes y después. Un comando que corre sin error y no deja ver qué
 *     cambió no está probado: `make seed` puede terminar en verde y haber
 *     escrito en el sitio equivocado.
 *  3. **Sintaxis.** El archivo tiene que parsear como script de shell.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { cargarCurso, recorrer } from "../src/lib/contenido";

const VERDE = "\x1b[32m";
const ROJO = "\x1b[31m";
const GRIS = "\x1b[90m";
const FIN = "\x1b[0m";

const PAUTA = join(process.cwd(), "docs", "pauta-de-comandos.sh");

/**
 * Comandos que el curso nombra y nadie teclea.
 *
 * No es una lista de excepciones cómoda: cada entrada es un comando que
 * aparece en una lámina como ilustración —una plantilla con puntos
 * suspensivos, un comentario de pandas, una variante que se menciona— y que
 * no tiene nada que ejecutar. Meterlos en la pauta la llenaría de líneas que
 * no se pueden correr, que es como una pauta deja de leerse.
 */
const NO_SE_TECLEAN = [
  "#", // los pasos de una demo escritos como comentario
  "→", // una llamada a herramienta, no una línea de shell
  "…", // un comando abreviado en la lámina
  "...",
];

/**
 * Varias láminas escriben el comando con una coletilla —`make seed · y después
 * → resumen_flota(...)`— porque la lámina cuenta dos cosas. Lo ejecutable es
 * lo de la izquierda; enviarlo entero a la pauta metería una línea que no
 * corre. Es la misma decisión que `rutaDeLab` toma con las rutas.
 */
function sinColetilla(comando: string): string {
  return comando.split(" · ")[0]?.trim() ?? comando;
}

/** Lo que el curso dicta, sin duplicados y en orden de aparición. */
export function comandosDelCurso(): { id: string; comando: string }[] {
  const curso = cargarCurso();
  const fuera: { id: string; comando: string }[] = [];
  const vistos = new Set<string>();

  for (const sesion of curso.sesiones) {
    for (const { item } of recorrer(sesion)) {
      const i = item as unknown as Record<string, unknown>;
      const crudos: string[] = [];
      if (typeof i.comando === "string") crudos.push(i.comando);
      if (typeof i.comandoWindows === "string") crudos.push(i.comandoWindows);
      for (const p of (i.pasos as { comando?: string }[] | undefined) ?? []) {
        if (p.comando) crudos.push(p.comando);
      }
      for (const c of (i.comandos as string[] | undefined) ?? []) crudos.push(c);

      for (const crudo of crudos) {
        const comando = sinColetilla(crudo.trim());
        if (!comando) continue;
        if (NO_SE_TECLEAN.some((m) => comando.includes(m))) continue;
        if (vistos.has(comando)) continue;
        vistos.add(comando);
        fuera.push({ id: item.id, comando });
      }
    }
  }
  return fuera;
}

/**
 * La forma ejecutable de un comando, para poder compararlo con la pauta.
 *
 * La lámina escribe el comando como se dice en voz alta —con la URL
 * recortada, con el prefijo `docker compose run --rm plataforma` entero— y la
 * pauta usa el atajo del Makefile. Comparar las dos cadenas tal cual daría
 * falsos negativos en la mitad de los casos, así que se comparan por su
 * **núcleo**: el subcomando que de verdad se ejecuta.
 */
function nucleo(comando: string): string {
  return comando
    .replace(/^docker compose run --rm (-e \S+ )?/, "")
    .replace(/^python -m /, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function main(): void {
  const comandos = comandosDelCurso();

  if (process.argv.includes("--listar")) {
    for (const { id, comando } of comandos) {
      console.log(`${GRIS}${id.padEnd(28)}${FIN}${comando}`);
    }
    console.log(`\n${GRIS}${comandos.length} comandos distintos${FIN}`);
    return;
  }

  if (!existsSync(PAUTA)) {
    console.error(`${ROJO}No existe docs/pauta-de-comandos.sh${FIN}`);
    process.exit(1);
  }
  const pauta = readFileSync(PAUTA, "utf8");
  const enPauta = pauta.toLowerCase();

  // Que el archivo parsee como shell.
  //
  // Lleva shebang y el docente lo abre en su terminal, así que tiene que ser
  // un script válido aunque no se ejecute entero. El guardia de arriba corta
  // la ejecución completa, pero un error de sintaxis no lo detiene todo: se
  // descubre cuando el editor lo colorea mal, o cuando alguien lo pasa por
  // `source`.
  //
  // Pasó de verdad. Al documentar `make consola` entraron dos líneas de
  // **Python** —`b = u[...]`, con corchetes y paréntesis— sueltas entre los
  // comandos. Para el shell eso es un error de sintaxis. Van comentadas, que
  // además es lo que son: se teclean dentro del intérprete, no en la terminal.
  try {
    execFileSync("bash", ["-n", PAUTA], { stdio: "pipe" });
  } catch (e) {
    const salida = (e as { stderr?: Buffer }).stderr?.toString() ?? String(e);
    console.error(`\n${ROJO}La pauta no parsea como script de shell:${FIN}`);
    console.error(salida.trim().split("\n").map((l) => `  ${l}`).join("\n"));
    console.error(
      `${GRIS}  Una línea que se teclea dentro de un intérprete va comentada.${FIN}`,
    );
    process.exit(1);
  }

  const faltan = comandos.filter(({ comando }) => {
    const n = nucleo(comando);
    // Basta con que la pauta lo contenga de alguna forma: como atajo del
    // Makefile o como la línea entera. Lo que importa es que el docente lo
    // haya ensayado, no cómo lo escribió.
    return !enPauta.includes(n) && !enPauta.includes(comando.toLowerCase());
  });

  // Las sondas: cada bloque que corre un comando que mueve el mundo tiene que
  // repetir la misma línea de sonda antes y después.
  const MUEVEN = [
    "make seed",
    "make entrenar",
    "make romper",
    "make reparar",
    "make arriba",
    "make ui",
    "make abajo",
    "make actuar",
    "make agente",
    "make plano",
    "make mlflow",
    "make reset",
  ];
  const bloques = pauta.split(/^# ── /m).slice(1);
  const sinSonda: string[] = [];
  for (const bloque of bloques) {
    const titulo = (bloque.split("\n")[0] ?? "?").replace(/[─\s]+$/, "");
    const mueve = MUEVEN.filter((m) =>
      new RegExp(`^\\s*${m}\\b`, "m").test(bloque),
    );
    if (!mueve.length) continue;
    // El marcador puede llevar una nota detrás —«⚠️ verificar deja el mundo
    // roto»—, que es donde mejor se lee. Se ancla al principio de la línea y
    // no al final.
    const sondas = [...bloque.matchAll(/^# sonda · (antes|despues)\b/gm)].map(
      (m) => m[1],
    );
    if (!sondas.includes("antes") || !sondas.includes("despues")) {
      sinSonda.push(`${titulo} — corre ${mueve.join(", ")} sin sonda a los dos lados`);
    }
  }

  if (faltan.length || sinSonda.length) {
    if (faltan.length) {
      console.error(
        `\n${ROJO}Comandos del curso que la pauta no cubre:${FIN}`,
      );
      for (const { id, comando } of faltan) {
        console.error(`  ${ROJO}·${FIN} ${GRIS}${id}${FIN}  ${comando}`);
      }
    }
    if (sinSonda.length) {
      console.error(`\n${ROJO}Bloques sin sonda antes y después:${FIN}`);
      for (const s of sinSonda) console.error(`  ${ROJO}·${FIN} ${s}`);
    }
    process.exit(1);
  }

  console.log(
    `${VERDE}✓${FIN} La pauta cubre los ${comandos.length} comandos del curso, ` +
      `en ${bloques.length} bloques.`,
  );
}

main();
