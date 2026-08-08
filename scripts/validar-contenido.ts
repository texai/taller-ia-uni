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
import {
  minutosDeSesion,
  minutosDeUnidad,
  reprochesDeRitmo,
} from "../src/lib/navegacion";
import { aHora, aMinutos, minutosEntre } from "../src/lib/reloj";
import { aPowerShell, CONOCIDOS, esComandoMake } from "../src/lib/windows";

const VERDE = "\x1b[32m";
const ROJO = "\x1b[31m";
const GRIS = "\x1b[90m";
const AMARILLO = "\x1b[33m";
const FIN = "\x1b[0m";

/**
 * Cuándo una nota deja de leerse de un vistazo.
 *
 * Lo que se mide no es solo el largo: es **la forma**. Cinco bullets de
 * noventa palabras se escanean; un párrafo de sesenta, no — hay que leerlo
 * entero para saber si dice algo que haga falta ahora. Por eso el aviso
 * dispara con cualquiera de las dos cosas, y la de la forma pesa más.
 */
const TOPE_DE_NOTA = 110;

/** Palabras de la frase de apertura, antes del primer bullet. */
const TOPE_DE_ENTRADILLA = 45;

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

  // La escaleta: a qué hora empieza cada unidad si el dictado va al ritmo
  // escrito.
  //
  // Se calcula acá y no se escribe en el YAML, y esa es la decisión. Los
  // archivos de unidad llevaban la hora en un comentario de cabecera, y esa
  // hora envejece con cada ítem que entra en cualquier unidad anterior: en la
  // auditoría del 7 de agosto había dos unidades del domingo declarando 09:06
  // y 09:05 **en ese orden**, y dos sin nada. Un dato que se corrige a mano
  // cada vez que se toca el contenido es un dato que va a estar mal.
  //
  // Es orientativa a propósito: la hora de verdad la lleva el reloj de la
  // aplicación, que sabe cuándo empezó la clase de verdad.
  if (process.argv.includes("--escaleta")) {
    console.log(`\n${GRIS}Escaleta, al ritmo escrito:${FIN}`);
    for (const sesion of curso.sesiones) {
      // Una sesión sin hora de inicio no tiene escaleta que calcular: se
      // salta en vez de contar desde medianoche, que sería un horario falso
      // con toda la pinta de ser el bueno.
      const arranque = sesion.horaInicio ? aMinutos(sesion.horaInicio) : null;
      if (arranque === null) continue;
      let reloj = arranque;
      console.log(`  ${GRIS}sesión ${sesion.numero}${FIN}`);
      for (const unidad of sesion.unidades) {
        const min = minutosDeUnidad(unidad);
        console.log(
          `    ${aHora(reloj)}  ${unidad.titulo.padEnd(38)} ` +
            `${GRIS}${String(min).padStart(3)} min${FIN}`,
        );
        reloj += min;
      }
      console.log(`    ${GRIS}${aHora(reloj)}  (fin, sobre ${sesion.horaFin})${FIN}`);
    }
  }

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

  // El vocabulario que se usa sin abrirse.
  //
  // Ninguna palabra del glosario debería usarse en pantalla antes de haberse
  // abierto en pantalla (CONVENTIONS.md §18). El panel flotante es el
  // respaldo, no el primer contacto: nadie lo abre en mitad de una
  // explicación.
  //
  // Es un aviso y no un error porque un glosario puede llevar términos de
  // consulta que no toca dictar. Lo que no puede es llevarlos sin que nadie lo
  // haya decidido, que es como estaba: 39 términos y tres láminas cubriendo 13.
  const abiertos = new Set<string>();
  for (const sesion of curso.sesiones) {
    for (const { item } of recorrer(sesion)) {
      if (item.tipo !== "glosario") continue;
      for (const t of item.entradas ?? []) abiertos.add(t.termino);
    }
  }
  const sinAbrir = (curso.glosario ?? [])
    .map((t) => t.termino)
    .filter((t) => !abiertos.has(t));
  if (sinAbrir.length) {
    console.log(
      `\n${AMARILLO}Términos del glosario que ninguna lámina abre ` +
        `(${sinAbrir.length} de ${curso.glosario?.length}):${FIN}`,
    );
    console.log(`  ${AMARILLO}·${FIN} ${sinAbrir.join(", ")}`);
  }

  // Las notas privadas, en formato de chuleta.
  //
  // El curso se dicta en línea y con la cámara encendida: el docente las lee
  // de reojo entre lámina y lámina, mientras la sala le mira la cara. Un
  // párrafo de ciento ochenta palabras no se lee de reojo — se lee bajando la
  // vista diez segundos, y eso se nota desde el otro lado.
  //
  // Aviso y no error: hay láminas donde el contexto pesa y la nota larga está
  // justificada. Lo que no puede es pasar sin que nadie lo decida, que es
  // como estaba: 223 notas, 16,256 palabras, media de 73.
  const gordas: { id: string; palabras: number; parrafo: boolean }[] = [];
  let conNotas = 0;
  for (const sesion of curso.sesiones) {
    for (const { item } of recorrer(sesion)) {
      const n = (item as { notas?: string }).notas;
      if (!n) continue;
      conNotas++;
      const palabras = n.trim().split(/\s+/).length;

      // La forma. Una nota bien hecha es una entradilla corta y bullets; lo
      // que se persigue es la prosa, no las líneas — una frase que ocupa
      // cuatro renglones al ajustarse sigue siendo una frase.
      //
      // Dos defectos, y el segundo es el que de verdad duele: una entradilla
      // que ya es un párrafo, y prosa **después** de que los bullets
      // empezaron, que es donde se esconde lo que nadie va a leer en vivo.
      const lineas = n.split("\n");
      const primerBullet = lineas.findIndex((l) => l.trim().startsWith("-"));
      let parrafo = false;
      if (primerBullet === -1) {
        parrafo = palabras > TOPE_DE_ENTRADILLA;
      } else {
        const entradilla = lineas.slice(0, primerBullet).join(" ").trim();
        if (entradilla.split(/\s+/).filter(Boolean).length > TOPE_DE_ENTRADILLA) {
          parrafo = true;
        }
        for (const l of lineas.slice(primerBullet)) {
          const t = l.trim();
          // Sangrada es continuación de bullet; a ras de margen y sin guión,
          // es prosa suelta.
          if (t && !t.startsWith("-") && !/^ {2,}\S/.test(l)) parrafo = true;
        }
      }

      if (parrafo || palabras > TOPE_DE_NOTA) {
        gordas.push({ id: item.id, palabras, parrafo });
      }
    }
  }
  if (gordas.length) {
    gordas.sort((a, b) => b.palabras - a.palabras);
    console.log(
      `\n${AMARILLO}Notas del docente que no se leen de reojo ` +
        `(${gordas.length} de ${conNotas}):${FIN}`,
    );
    for (const g of gordas.slice(0, 12)) {
      const por = g.parrafo ? "prosa" : `${g.palabras} palabras`;
      console.log(`  ${AMARILLO}·${FIN} ${g.id.padEnd(30)} ${por}`);
    }
    if (gordas.length > 12) {
      console.log(`  ${GRIS}… y ${gordas.length - 12} más${FIN}`);
    }
  }

  // Ningún comando deja fuera a Windows.
  //
  // Todo `make` que el curso **mande ejecutar** tiene que saber traducirse a
  // `taller.ps1`. Es error y no aviso por lo mismo que las rutas rotas: la
  // consecuencia no es una lámina fea, es media sala que no puede teclear lo
  // que está proyectado, y no se descubre hasta ese momento.
  //
  // Lo que caza en la práctica es un `target` nuevo del `Makefile` que nadie
  // agregó al `.ps1` — que es exactamente lo que pasaba con `plano` y
  // `senales`, los dos comandos del reto 3 y de la sonda.
  const sinWindows: string[] = [];
  for (const sesion of curso.sesiones) {
    for (const { item } of recorrer(sesion)) {
      const suyos: string[] = [];
      if (item.tipo === "terminal") suyos.push(item.comando);
      if (item.tipo === "lectura") suyos.push(...(item.comandos ?? []));
      if (item.tipo === "demo") suyos.push(...item.pasos.map((p) => p.comando));
      for (const c of suyos) {
        if (!esComandoMake(c)) continue;
        if (aPowerShell(c) === null) sinWindows.push(`${item.id}: ${c}`);
      }
    }
  }
  if (sinWindows.length) {
    console.error(
      `\n${ROJO}Comandos que en Windows no se pueden teclear${FIN}` +
        `${GRIS} (falta el equivalente en taller.ps1, o la lista de ` +
        `src/lib/windows.ts se quedó corta):${FIN}`,
    );
    for (const c of sinWindows) console.error(`  ${ROJO}·${FIN} ${c}`);
    process.exit(1);
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

    // Y la lista de `src/lib/windows.ts` contra el `taller.ps1` de verdad.
    //
    // Esa lista es una copia a mano —el script vive en el otro repositorio y
    // no se puede importar— y una copia a mano es una copia que se desfasa.
    // Acá, cuando el laboratorio está al lado, deja de ser a ciegas.
    const ps1 = join(LAB, "taller.ps1");
    if (existsSync(ps1)) {
      const texto = readFileSync(ps1, "utf8");
      // Los `case` del `switch`: `'arriba' {` o `'arriba' = '…'` en la tabla
      // de ayuda. Con cualquiera de las dos formas el comando existe.
      const suyos = new Set(
        [...texto.matchAll(/^\s*'([a-z-]+)'\s*[{=]/gm)].map((m) => m[1]!),
      );
      const inventados = [...CONOCIDOS].filter((c) => !suyos.has(c));
      if (inventados.length) {
        rotas.push(
          `src/lib/windows.ts promete comandos que taller.ps1 no tiene: ` +
            inventados.join(", "),
        );
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
