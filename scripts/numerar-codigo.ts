/**
 * Calcula los números de línea de cada fragmento de código, leyendo el
 * laboratorio.
 *
 *     npm run numerar          # informe: qué cuadra y qué no
 *     npm run numerar -- -w    # y los escribe en el YAML
 *
 * Un fragmento numerado tiene que ser **literal**. Eso es una restricción y es
 * el punto: en cuanto alguien le agrega un comentario explicativo que no está
 * en el archivo, deja de encontrarse y este script lo dice. Las explicaciones
 * van en `notas`, que es donde el docente las lee.
 *
 * Los fragmentos se buscan por bloques contiguos, así que un fragmento puede
 * saltarse trozos del archivo — la lámina dibuja el salto.
 *
 * Necesita `taller-ia-uni-lab` al lado. Sin él no hace nada: en Vercel no está.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { cargarCurso, recorrer } from "../src/lib/contenido";
import { ubicarBloques } from "../src/lib/bloques";
import { rutaDeLab } from "../src/lib/sitio";

const VERDE = "\x1b[32m";
const ROJO = "\x1b[31m";
const GRIS = "\x1b[90m";
const AMARILLO = "\x1b[33m";
const FIN = "\x1b[0m";

const LAB = join(process.cwd(), "..", "taller-ia-uni-lab");
const ESCRIBIR = process.argv.includes("-w");

if (!existsSync(LAB)) {
  console.log(`${GRIS}Sin taller-ia-uni-lab al lado. Nada que numerar.${FIN}`);
  process.exit(0);
}

const curso = cargarCurso();
const encontrados: { id: string; ruta: string; numeros: string[] }[] = [];
const perdidos: { id: string; ruta: string }[] = [];
const sinArchivo: string[] = [];

for (const sesion of curso.sesiones) {
  for (const { item } of recorrer(sesion)) {
    if (item.tipo !== "codigo" || !item.ruta || !item.contenido) continue;
    const rel = rutaDeLab(item.ruta);
    if (!rel || !existsSync(join(LAB, rel))) {
      sinArchivo.push(`${item.id} · ${item.ruta}`);
      continue;
    }
    const archivo = readFileSync(join(LAB, rel), "utf8").split("\n");
    const bloques = ubicarBloques(item.contenido, archivo);
    if (bloques) encontrados.push({ id: item.id, ruta: rel, numeros: bloques });
    else perdidos.push({ id: item.id, ruta: rel });
  }
}

for (const e of encontrados) {
  console.log(`${VERDE}✓${FIN} ${e.id.padEnd(26)} ${e.ruta.padEnd(26)} ${e.numeros.join(" · ")}`);
}
for (const p of perdidos) {
  console.log(`${ROJO}✗${FIN} ${p.id.padEnd(26)} ${p.ruta.padEnd(26)} el fragmento no es literal`);
}
for (const s of sinArchivo) {
  console.log(`${GRIS}·${FIN} ${s} — no es un archivo del laboratorio`);
}

console.log(
  `\n${encontrados.length} numerados · ${perdidos.length} sin numerar · ` +
    `${sinArchivo.length} fuera del laboratorio`,
);

if (!ESCRIBIR) {
  console.log(`${GRIS}Informe solamente. Con -w los escribe en el YAML.${FIN}`);
  process.exit(0);
}

// Se escribe con una sustitución de texto y no reserializando el YAML: el
// contenido está lleno de comentarios y de bloques `|` cuya forma importa, y
// volcarlo con una librería los aplasta.
let tocados = 0;
for (const e of encontrados) {
  const archivos = ["contenido/unidades", "contenido/casos"].flatMap((d) =>
    existsSync(d) ? readdirSync(d).map((f) => join(d, f)) : [],
  );
  for (const ruta of archivos) {
    if (!ruta.endsWith(".yml")) continue;
    const texto = readFileSync(ruta, "utf8");
    const marca = `  - id: ${e.id}\n`;
    if (!texto.includes(marca)) continue;
    const yaNumerado = new RegExp(`  - id: ${e.id}\\n(?:.*\\n)*?    numeros:`);
    const lista = e.numeros.map((n) => `"${n}"`).join(", ");
    let nuevo: string;
    if (yaNumerado.test(texto)) {
      nuevo = texto.replace(
        new RegExp(`(  - id: ${e.id}\\n(?:.*\\n)*?    numeros: )\\[[^\\]]*\\]`),
        `$1[${lista}]`,
      );
    } else {
      nuevo = texto.replace(
        new RegExp(`(  - id: ${e.id}\\n(?:.*\\n)*?    ruta: .*\\n)`),
        `$1    numeros: [${lista}]\n`,
      );
    }
    if (nuevo !== texto) {
      writeFileSync(ruta, nuevo, "utf8");
      tocados++;
    }
    break;
  }
}
console.log(`${AMARILLO}${tocados} ítems escritos.${FIN}`);
