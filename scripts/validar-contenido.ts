/**
 * Valida el contenido del curso y falla si algo no cierra.
 *
 * Corre dentro de `npm run build`: un YAML roto no debe llegar a producción, y
 * mucho menos descubrirse proyectado delante de veinte personas.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { cargarCurso, ErrorDeContenido, recorrer } from "../src/lib/contenido";
import { rutaDeLab } from "../src/lib/sitio";
import { ubicarBloques } from "../src/lib/bloques";
import { minutosDeSesion, reprochesDeRitmo } from "../src/lib/navegacion";
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

  // El ritmo.
  //
  // Un aviso y no un error: el reparto de preguntas y pausas es una decisión
  // del docente, y hay unidades donde un tramo largo se justifica. Pero se
  // justifica *a sabiendas* — el desbalance que encontró la auditoría del 7 de
  // agosto (una unidad de 105 minutos con cero interacciones) no lo decidió
  // nadie, se coló.
  const ritmos: string[] = [];
  for (const sesion of curso.sesiones) {
    for (const unidad of sesion.unidades) {
      for (const r of reprochesDeRitmo(unidad)) {
        ritmos.push(`${sesion.id} · ${unidad.id}: ${r}`);
      }
    }
  }
  if (ritmos.length) {
    console.log(`\n${AMARILLO}Unidades que no respiran:${FIN}`);
    for (const r of ritmos) console.log(`  ${AMARILLO}·${FIN} ${r}`);
  }

  // Las rutas al laboratorio.
  //
  // Es un error y no un aviso: una ventana de lectura que manda abrir un
  // archivo que no existe, o unas líneas que se salen del final, se descubre
  // con veinte personas buscándolo. Pero solo se comprueba si el laboratorio
  // está al lado — en Vercel no está, y esto tiene que poder construir igual.
  const LAB = join(process.cwd(), "..", "taller-ia-uni-lab");
  if (existsSync(LAB)) {
    const rotas: string[] = [];
    for (const sesion of curso.sesiones) {
      // `recorrer` devuelve envoltorios `{unidad, item, posicion}`, no ítems.
      for (const { item } of recorrer(sesion)) {
        if (item.tipo !== "lectura") continue;
        for (const a of item.archivos ?? []) {
          const ruta = join(LAB, a.ruta);
          if (!existsSync(ruta)) {
            rotas.push(`${item.id}: no existe ${a.ruta}`);
            continue;
          }
          if (!a.lineas) continue;
          const total = readFileSync(ruta, "utf8").split("\n").length;
          const hasta = Number(a.lineas.split("-").pop());
          if (hasta > total) {
            rotas.push(
              `${item.id}: ${a.ruta} ${a.lineas}, y el archivo tiene ${total} líneas`,
            );
          }
        }
      }
    }
    // Y los números de línea de los fragmentos de código: si el laboratorio se
    // movió, la lámina numera mal y nadie lo nota, porque un número puesto
    // parece un número comprobado. `npm run numerar -- -w` los recalcula.
    for (const sesion of curso.sesiones) {
      for (const { item } of recorrer(sesion)) {
        if (item.tipo !== "codigo" || !item.numeros || !item.contenido) continue;
        const rel = item.ruta ? rutaDeLab(item.ruta) : null;
        if (!rel || !existsSync(join(LAB, rel))) continue;
        const archivo = readFileSync(join(LAB, rel), "utf8").split("\n");
        const ahora = ubicarBloques(item.contenido, archivo);
        if (ahora?.join(",") !== item.numeros.join(",")) {
          rotas.push(
            `${item.id}: los números de ${rel} ya no cuadran ` +
              `(dice ${item.numeros.join(" · ")}, el archivo dice ` +
              `${ahora?.join(" · ") ?? "que el fragmento no es literal"})`,
          );
        }
      }
    }

    if (rotas.length) {
      console.error(`\n${ROJO}Rutas al laboratorio que no llevan a ninguna parte:${FIN}`);
      for (const r of rotas) console.error(`  ${ROJO}·${FIN} ${r}`);
      process.exit(1);
    }
  } else {
    console.log(
      `\n${GRIS}Sin taller-ia-uni-lab al lado: no se comprobaron las rutas de las lecturas.${FIN}`,
    );
  }
} catch (e) {
  if (e instanceof ErrorDeContenido) {
    console.error(`${ROJO}${e.message}${FIN}`);
    process.exit(1);
  }
  throw e;
}
