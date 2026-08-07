/**
 * Valida el contenido del curso y falla si algo no cierra.
 *
 * Corre dentro de `npm run build`: un YAML roto no debe llegar a producción, y
 * mucho menos descubrirse proyectado delante de veinte personas.
 */

import { cargarCurso, ErrorDeContenido, recorrer } from "../src/lib/contenido";
import { minutosDeSesion } from "../src/lib/navegacion";
import { minutosEntre } from "../src/lib/reloj";

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

  // Los minutos de los items contra las horas de la sesion.
  //
  // El tiempo se cuenta de abajo hacia arriba (CONVENTIONS.md §15), asi que no
  // hay dos cifras que puedan discrepar dentro del YAML. Lo que si puede
  // discrepar es la suma contra el mundo: cuatro horas de aula son cuatro
  // horas, y una sesion cuyos items suman 260 minutos no cabe. No es un error
  // de estructura -- el YAML es valido igual -- pero se avisa.
  const descuadres: string[] = [];
  for (const sesion of curso.sesiones) {
    const ventana = minutosEntre(sesion.horaInicio, sesion.horaFin);
    if (ventana === null) continue;
    const suma = minutosDeSesion(sesion);
    if (suma !== ventana) {
      descuadres.push(
        `${sesion.id}: sus ítems suman ${suma} min y la sesión dura ` +
          `${ventana} (${sesion.horaInicio}–${sesion.horaFin})`,
      );
    }
  }

  console.log(`${VERDE}✓${FIN} ${curso.titulo}`);
  for (const sesion of curso.sesiones) {
    const minutos = minutosDeSesion(sesion);
    console.log(
      `  ${GRIS}sesión ${sesion.numero}${FIN} ${sesion.titulo} — ` +
        `${sesion.unidades.length} unidades, ${recorrer(sesion).length} ítems, ` +
        `${minutos} min`,
    );
  }
  console.log(`${GRIS}${unidades} unidades · ${items} ítems${FIN}`);

  if (descuadres.length) {
    console.log(`\n${AMARILLO}Minutos que no caben en la hora:${FIN}`);
    for (const d of descuadres) console.log(`  ${AMARILLO}·${FIN} ${d}`);
  }
} catch (e) {
  if (e instanceof ErrorDeContenido) {
    console.error(`${ROJO}${e.message}${FIN}`);
    process.exit(1);
  }
  throw e;
}
