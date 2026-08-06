/**
 * Valida el contenido del curso y falla si algo no cierra.
 *
 * Corre dentro de `npm run build`: un YAML roto no debe llegar a producción, y
 * mucho menos descubrirse proyectado delante de veinte personas.
 */

import { cargarCurso, ErrorDeContenido, recorrer, minutosDe } from "../src/lib/contenido";

const VERDE = "\x1b[32m";
const ROJO = "\x1b[31m";
const GRIS = "\x1b[90m";
const AMARILLO = "\x1b[33m";
const FIN = "\x1b[0m";

try {
  const curso = cargarCurso();
  const items = curso.sesiones.reduce(
    (t, s) => t + recorrer(s).length,
    0,
  );
  const unidades = curso.sesiones.reduce((t, s) => t + s.unidades.length, 0);

  // Los minutos declarados de la unidad contra la suma de sus items. No es un
  // error de estructura -- el YAML es valido igual -- pero un desajuste
  // significa que la unidad no dura lo que dice, y el reloj de la segunda
  // pantalla se apoya en ese numero.
  const descuadres: string[] = [];
  for (const sesion of curso.sesiones) {
    for (const unidad of sesion.unidades) {
      if (typeof unidad.minutos !== "number") continue;
      const suma = unidad.items.reduce((t, i) => t + (i.minutos ?? 0), 0);
      if (suma !== unidad.minutos) {
        descuadres.push(
          `${sesion.id} · ${unidad.id}: declara ${unidad.minutos} min y sus ` +
            `ítems suman ${suma}`,
        );
      }
    }
  }

  console.log(`${VERDE}✓${FIN} ${curso.titulo}`);
  for (const sesion of curso.sesiones) {
    const minutos = sesion.unidades.reduce((t, u) => t + minutosDe(u), 0);
    console.log(
      `  ${GRIS}sesión ${sesion.numero}${FIN} ${sesion.titulo} — ` +
        `${sesion.unidades.length} unidades, ${recorrer(sesion).length} ítems, ` +
        `${minutos} min`,
    );
  }
  console.log(`${GRIS}${unidades} unidades · ${items} ítems${FIN}`);

  if (descuadres.length) {
    console.log(`\n${AMARILLO}Minutos que no cuadran:${FIN}`);
    for (const d of descuadres) console.log(`  ${AMARILLO}·${FIN} ${d}`);
  }
} catch (e) {
  if (e instanceof ErrorDeContenido) {
    console.error(`${ROJO}${e.message}${FIN}`);
    process.exit(1);
  }
  throw e;
}
