/**
 * Carga y valida el contenido del curso desde `contenido/`.
 *
 * El material vive en YAML versionado, no en una base de datos (ver
 * `docs/CONVENTIONS.md` §1). Este módulo es la frontera: a partir de acá el
 * resto de la aplicación trabaja con objetos tipados y puede confiar en que
 * están completos.
 *
 * Los errores de validación se acumulan y se reportan TODOS juntos, con
 * archivo, unidad, posición del ítem y campo. Fallar en el primero obligaría a
 * arreglar y volver a correr una vez por error, y eso a las dos de la mañana
 * de un viernes es exactamente lo que no se quiere.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
// Import con nombre, no por defecto: el paquete ESM de js-yaml no publica un
// export default, y aunque Node lo tolera por interoperabilidad, el bundler no.
import { load as cargarYaml } from "js-yaml";

import {
  CAMPOS_COMUNES,
  CAMPOS_PRIVADOS,
  ESPECIFICACION,
} from "./especificacion";
import { solapamientos } from "./anotaciones";
import { leerSecuencia } from "./plantuml";
import { FAMILIA, SOLO_DOCENTE, TIPOS } from "./tipos";
import type { Curso, Item, Sesion, TipoItem, Unidad } from "./tipos";

/**
 * Dónde vive el contenido.
 *
 * Es un parámetro y no una constante de módulo para que se pueda cargar un
 * árbol de prueba sin cambiar el directorio de trabajo del proceso. Un
 * `process.chdir` en pruebas que corren en paralelo es una fuente de fallos
 * que no se reproducen.
 */
export function raizPorDefecto(): string {
  return join(process.cwd(), "contenido");
}

export class ErrorDeContenido extends Error {
  constructor(public readonly problemas: string[]) {
    super(
      `El contenido tiene ${problemas.length} ` +
        `problema${problemas.length === 1 ? "" : "s"}:\n\n` +
        problemas.map((p) => `  · ${p}`).join("\n"),
    );
    this.name = "ErrorDeContenido";
  }
}

type Bruto = Record<string, unknown>;

function leerYaml(ruta: string, raiz: string, problemas: string[]): Bruto | null {
  if (!existsSync(ruta)) {
    problemas.push(`No existe ${ruta.replace(raiz, "contenido")}`);
    return null;
  }
  try {
    const datos = cargarYaml(readFileSync(ruta, "utf8"));
    if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
      problemas.push(`${ruta}: se esperaba un objeto YAML`);
      return null;
    }
    return datos as Bruto;
  } catch (e) {
    problemas.push(`${ruta}: YAML inválido — ${(e as Error).message}`);
    return null;
  }
}

// --------------------------------------------------------------------------
// Validación de un ítem
// --------------------------------------------------------------------------

function validarItem(
  bruto: Bruto,
  donde: string,
  problemas: string[],
  vistos: Set<string>,
): Item | null {
  const tipo = bruto.tipo;

  if (typeof tipo !== "string") {
    problemas.push(`${donde}: falta \`tipo\``);
    return null;
  }
  if (!TIPOS.includes(tipo as TipoItem)) {
    problemas.push(
      `${donde}: tipo desconocido \`${tipo}\`. ` +
        `Los válidos son: ${TIPOS.join(", ")}`,
    );
    return null;
  }

  const id = bruto.id;
  if (typeof id !== "string" || !id.trim()) {
    problemas.push(`${donde} (\`${tipo}\`): falta \`id\``);
    return null;
  }
  if (vistos.has(id)) {
    // Un identificador repetido no rompe la carga, pero sí la posición de la
    // clase: el docente marcaría dos ítems a la vez y las preguntas de los
    // alumnos quedarían atadas al equivocado.
    problemas.push(`${donde}: el identificador \`${id}\` ya se usó`);
  }
  vistos.add(id);

  const espec = ESPECIFICACION[tipo as TipoItem];
  const etiqueta = `${donde} \`${id}\` (\`${tipo}\`)`;

  for (const campo of espec.requeridos) {
    if (bruto[campo] === undefined || bruto[campo] === null) {
      problemas.push(`${etiqueta}: falta \`${campo}\``);
    }
  }

  for (const grupo of espec.alMenosUno ?? []) {
    if (grupo.every((c) => bruto[c] === undefined || bruto[c] === null)) {
      problemas.push(
        `${etiqueta}: hace falta alguno de ${grupo
          .map((c) => `\`${c}\``)
          .join(" o ")}`,
      );
    }
  }

  const permitidos = new Set<string>([
    ...CAMPOS_COMUNES,
    ...espec.requeridos,
    ...(espec.opcionales ?? []),
    ...(espec.alMenosUno ?? []).flat(),
  ]);
  for (const campo of Object.keys(bruto)) {
    if (!permitidos.has(campo)) {
      // Casi siempre es un typo, y un typo silencioso en el material se
      // descubre proyectado.
      problemas.push(
        `${etiqueta}: campo \`${campo}\` no reconocido para este tipo`,
      );
    }
  }

  return bruto as unknown as Item;
}

/** Reemplaza `archivo:` por el contenido del archivo, cuando corresponde. */
function resolverArchivo(
  item: Item,
  raiz: string,
  donde: string,
  problemas: string[],
): void {
  const conArchivo = item as Item & { archivo?: string; contenido?: string };
  const ruta = conArchivo.archivo;
  if (!ruta) return;

  // `imagen` y `archivo` referencian un asset que se sirve tal cual; no se
  // lee su contenido.
  if (item.tipo === "imagen" || item.tipo === "archivo") {
    if (!existsSync(join(raiz, ruta))) {
      problemas.push(`${donde}: no existe el archivo \`contenido/${ruta}\``);
    }
    return;
  }

  const completa = join(raiz, ruta);
  if (!existsSync(completa)) {
    problemas.push(`${donde}: no existe el archivo \`contenido/${ruta}\``);
    return;
  }

  const texto = readFileSync(completa, "utf8");
  if (item.tipo === "caso") {
    // Un caso no es texto: es estructura. Se lee como YAML y se funde en el
    // ítem, para que dos sesiones puedan apuntar al mismo archivo.
    try {
      const datos = cargarYaml(texto);
      if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
        problemas.push(`${donde}: \`contenido/${ruta}\` no es un objeto YAML`);
        return;
      }
      Object.assign(item, datos);
    } catch (e) {
      problemas.push(`${donde}: \`contenido/${ruta}\` — ${(e as Error).message}`);
    }
    return;
  }
  if (item.tipo === "diagrama-secuencia") {
    (item as { fuente?: string }).fuente = texto;
  } else {
    conArchivo.contenido = texto;
  }
}

// --------------------------------------------------------------------------
// Validación específica de algunos tipos
// --------------------------------------------------------------------------

function validacionesExtra(item: Item, donde: string, problemas: string[]) {
  if (item.tipo === "diagrama-secuencia") {
    // La fuente se lee ACÁ, al cargar, y no en el navegador. Un diagrama que
    // el lector no entiende tiene que romper la construcción, no aparecer
    // vacío proyectado — que es exactamente el momento en que no hay arreglo.
    const fuente = item.fuente;
    if (!fuente) {
      problemas.push(`${donde}: falta \`fuente\` o \`archivo\``);
    } else {
      try {
        const secuencia = leerSecuencia(fuente);
        item.secuencia = secuencia;

        const escritas = item.mensajes ?? [];
        if (escritas.length && escritas.length !== secuencia.mensajes.length) {
          problemas.push(
            `${donde}: la fuente tiene ${secuencia.mensajes.length} mensajes y ` +
              `hay ${escritas.length} explicaciones. Van por índice, así que ` +
              `insertar una flecha en medio descoloca todas las de abajo.`,
          );
        }

        // `texto` es opcional, pero si está tiene que coincidir: es el ancla
        // que avisa cuando el orden se corrió sin que cambie la cuenta.
        escritas.forEach((m, i) => {
          const suyo = secuencia.mensajes[i]?.texto;
          if (m.texto && suyo && m.texto !== suyo) {
            problemas.push(
              `${donde}: la explicación ${i + 1} dice ser de \`${m.texto}\` y ` +
                `el mensaje ${i + 1} de la fuente es \`${suyo}\``,
            );
          }
        });
      } catch (e) {
        problemas.push(`${donde}: ${(e as Error).message}`);
      }
    }
  }

  if (item.tipo === "comando-anotado") {
    // Los segmentos se declaran por texto, no por índice: un índice se rompe
    // en cuanto alguien corrige un espacio. El costo es que hay que
    // comprobar que el texto exista y sea inequívoco.
    for (const seg of item.segmentos ?? []) {
      const veces = item.comando.split(seg.texto).length - 1;
      if (veces === 0) {
        problemas.push(
          `${donde}: el segmento \`${seg.texto}\` no aparece en el comando`,
        );
      } else if (veces > 1) {
        problemas.push(
          `${donde}: el segmento \`${seg.texto}\` aparece ${veces} veces en ` +
            `el comando; es ambiguo cuál anotar`,
        );
      }
    }

    // Dos segmentos que se pisan producen un recorrido en el que uno se traga
    // al otro: esa explicación nunca llega a enfocarse, y la única señal es un
    // paso que parece repetido.
    for (const [a, b] of solapamientos(item.comando, item.segmentos ?? [])) {
      problemas.push(
        `${donde}: los segmentos \`${a}\` y \`${b}\` se solapan dentro del comando`,
      );
    }
  }

  if (item.tipo === "caso") {
    for (const campo of ["titulo", "empresa"] as const) {
      if (!item[campo]) problemas.push(`${donde}: al caso le falta \`${campo}\``);
    }
    if (!item.cifras?.length) {
      problemas.push(
        `${donde}: el caso no tiene \`cifras\`. La escala es lo que la clase ` +
          `recuerda; un caso sin números es una anécdota.`,
      );
    }
    if (!item.bloques?.length) {
      problemas.push(`${donde}: el caso no tiene \`bloques\``);
    }
  }

  if (item.tipo === "pregunta" && item.solucion?.descartes?.length) {
    // Un descarte que nombra una opción inexistente se dibuja igual, y en
    // clase parece que la pregunta tenía una opción más. Se ancla por texto,
    // como los segmentos de un comando.
    for (const d of item.solucion.descartes) {
      if (!(item.opciones ?? []).includes(d.opcion)) {
        problemas.push(
          `${donde}: la solución descarta \`${d.opcion}\`, que no es una de ` +
            `las opciones de la pregunta`,
        );
      }
    }
  }

  if (item.tipo === "tabla") {
    const ancho = item.columnas.length;
    item.filas.forEach((fila, i) => {
      if (fila.length !== ancho) {
        problemas.push(
          `${donde}: la fila ${i + 1} tiene ${fila.length} celdas y hay ` +
            `${ancho} columnas`,
        );
      }
    });
  }

  if (item.tipo === "pregunta" && item.respuesta && !item.opciones) {
    problemas.push(
      `${donde}: tiene \`respuesta\` correcta pero no \`opciones\`; ` +
        `una pregunta abierta no se corrige sola`,
    );
  }
}

// --------------------------------------------------------------------------
// Carga
// --------------------------------------------------------------------------

function cargarUnidad(
  bruto: Bruto,
  archivo: string,
  raiz: string,
  problemas: string[],
  vistos: Set<string>,
): Unidad | null {
  const id = typeof bruto.id === "string" ? bruto.id : null;
  if (!id) {
    problemas.push(`${archivo}: una unidad no tiene \`id\``);
    return null;
  }
  const tipo = bruto.tipo;
  if (tipo !== "repaso" && tipo !== "reto" && tipo !== "cierre" && tipo !== "caso") {
    problemas.push(
      `${archivo} · unidad \`${id}\`: \`tipo\` debe ser repaso, reto, caso o cierre`,
    );
    return null;
  }
  if (typeof bruto.titulo !== "string") {
    problemas.push(`${archivo} · unidad \`${id}\`: falta \`titulo\``);
    return null;
  }

  // YAML convierte "Algo: otra cosa" en un mapa, no en texto. Es la trampa que
  // más muerde al escribir material, porque el archivo se ve bien y el error
  // aparece al renderizar, con un mensaje de React que no menciona el YAML.
  for (const campo of ["objetivos", "requisitos"] as const) {
    const lista = bruto[campo];
    if (lista === undefined) continue;
    if (!Array.isArray(lista)) {
      problemas.push(`${archivo} · unidad \`${id}\`: \`${campo}\` debe ser una lista`);
      continue;
    }
    lista.forEach((entrada, i) => {
      if (typeof entrada !== "string") {
        problemas.push(
          `${archivo} · unidad \`${id}\` · ${campo}[${i}]: se esperaba texto y ` +
            `llegó ${Array.isArray(entrada) ? "una lista" : typeof entrada}. ` +
            `Si la frase lleva dos puntos seguidos de espacio, YAML la lee como ` +
            `un mapa: enciérrala entre comillas.`,
        );
      }
    });
  }

  // Los minutos son de los ítems. Que una unidad declare los suyos no se
  // ignora en silencio: se rechaza, porque una cifra escrita que el programa
  // descarta es peor que una cifra ausente — se lee como si valiera.
  if (bruto.minutos !== undefined) {
    problemas.push(
      `${archivo} · unidad \`${id}\`: los minutos no se declaran en la unidad. ` +
        `Van en cada ítem, y la unidad suma los suyos (ver CONVENTIONS.md §15).`,
    );
  }

  const brutos = Array.isArray(bruto.items) ? (bruto.items as Bruto[]) : [];
  if (!brutos.length) {
    problemas.push(`${archivo} · unidad \`${id}\`: no tiene ítems`);
  }

  const items: Item[] = [];
  brutos.forEach((b, i) => {
    const donde = `${archivo} · unidad \`${id}\` · ítem ${i + 1}`;
    const item = validarItem(b, donde, problemas, vistos);
    if (!item) return;
    resolverArchivo(item, raiz, `${donde} \`${item.id}\``, problemas);
    validacionesExtra(item, `${donde} \`${item.id}\``, problemas);
    items.push(item);
  });

  return {
    id,
    tipo,
    titulo: bruto.titulo,
    objetivos: Array.isArray(bruto.objetivos)
      ? (bruto.objetivos as string[])
      : undefined,
    requisitos: Array.isArray(bruto.requisitos)
      ? (bruto.requisitos as string[])
      : undefined,
    items,
  };
}

function cargarSesion(
  archivo: string,
  raiz: string,
  problemas: string[],
): Sesion | null {
  const bruto = leerYaml(join(raiz, "sesiones", archivo), raiz, problemas);
  if (!bruto) return null;

  const id = typeof bruto.id === "string" ? bruto.id : null;
  if (!id) {
    problemas.push(`${archivo}: falta \`id\``);
    return null;
  }
  if (typeof bruto.numero !== "number" || typeof bruto.titulo !== "string") {
    problemas.push(`${archivo}: hacen falta \`numero\` y \`titulo\``);
    return null;
  }

  // Los identificadores son únicos dentro de la sesión: es el alcance en el
  // que se mueve la posición de la clase.
  const vistos = new Set<string>();
  const brutas = Array.isArray(bruto.unidades) ? (bruto.unidades as Bruto[]) : [];
  if (!brutas.length) problemas.push(`${archivo}: no tiene unidades`);

  const unidades = brutas
    .map((u) => cargarUnidad(u, archivo, raiz, problemas, vistos))
    .filter((u): u is Unidad => u !== null);

  return {
    id,
    numero: bruto.numero,
    titulo: bruto.titulo,
    subtitulo: typeof bruto.subtitulo === "string" ? bruto.subtitulo : undefined,
    fecha: typeof bruto.fecha === "string" ? bruto.fecha : undefined,
    horaInicio:
      typeof bruto.horaInicio === "string" ? bruto.horaInicio : undefined,
    horaFin: typeof bruto.horaFin === "string" ? bruto.horaFin : undefined,
    unidades,
  };
}

/** Carga el curso completo. Lanza `ErrorDeContenido` si algo no cierra. */
export function cargarCurso(raiz: string = raizPorDefecto()): Curso {
  const problemas: string[] = [];
  const bruto = leerYaml(join(raiz, "curso.yml"), raiz, problemas);

  if (!bruto) throw new ErrorDeContenido(problemas);

  const dirSesiones = join(raiz, "sesiones");
  const archivos = existsSync(dirSesiones)
    ? readdirSync(dirSesiones)
        .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
        .sort()
    : [];

  if (!archivos.length) problemas.push("No hay archivos en contenido/sesiones/");

  const sesiones = archivos
    .map((a) => cargarSesion(a, raiz, problemas))
    .filter((s): s is Sesion => s !== null)
    .sort((a, b) => a.numero - b.numero);

  if (problemas.length) throw new ErrorDeContenido(problemas);

  return {
    id: String(bruto.id ?? "curso"),
    titulo: String(bruto.titulo ?? ""),
    subtitulo: bruto.subtitulo ? String(bruto.subtitulo) : undefined,
    programa: bruto.programa ? String(bruto.programa) : undefined,
    institucion: bruto.institucion ? String(bruto.institucion) : undefined,
    docente: bruto.docente ? String(bruto.docente) : undefined,
    descripcion: bruto.descripcion ? String(bruto.descripcion) : undefined,
    sesiones,
  };
}

// --------------------------------------------------------------------------
// El filtro que separa lo del docente de lo del alumno
// --------------------------------------------------------------------------

/**
 * Deja un ítem listo para enviarse al cliente del alumno.
 *
 * Quita las notas del docente y la respuesta correcta. Esto ocurre en el
 * SERVIDOR, no en el render: la pantalla del docente se comparte por Zoom, y
 * un campo que llega al navegador es un campo que se puede leer con las
 * herramientas de desarrollador abiertas. Ver `docs/CONVENTIONS.md` §3.
 */
export function itemParaAlumno(item: Item): Item {
  const copia: Record<string, unknown> = { ...item };
  for (const campo of CAMPOS_PRIVADOS) delete copia[campo];
  return copia as unknown as Item;
}

/** Como `itemParaAlumno`, para una unidad entera. */
export function unidadParaAlumno(unidad: Unidad): Unidad {
  return {
    ...unidad,
    items: unidad.items
      .filter((i) => !SOLO_DOCENTE.includes(i.tipo))
      .map(itemParaAlumno),
  };
}

/** El curso tal como puede viajar al navegador de un alumno. */
export function cursoParaAlumno(curso: Curso): Curso {
  return {
    ...curso,
    sesiones: curso.sesiones.map((s) => ({
      ...s,
      unidades: s.unidades.map(unidadParaAlumno),
    })),
  };
}

// --------------------------------------------------------------------------
// Utilidades
// --------------------------------------------------------------------------

/** Todos los ítems de una sesión, en orden, con su unidad. */
export function recorrer(
  sesion: Sesion,
): { unidad: Unidad; item: Item; posicion: number }[] {
  const salida: { unidad: Unidad; item: Item; posicion: number }[] = [];
  let posicion = 0;
  for (const unidad of sesion.unidades) {
    for (const item of unidad.items) {
      salida.push({ unidad, item, posicion: posicion++ });
    }
  }
  return salida;
}

/**
 * Minutos declarados de una unidad: los suyos, o la suma de sus ítems.
 *
 * La definición vive en `navegacion.ts` porque el reloj del mando la necesita
 * en el navegador y este módulo importa `node:fs`. Se reexporta con el nombre
 * de siempre para no tocar a quien ya la llama desde el servidor — y, sobre
 * todo, para que no haya dos reglas distintas sobre los mismos minutos.
 */
export { minutosDeUnidad as minutosDe } from "./navegacion";

export { FAMILIA, SOLO_DOCENTE, TIPOS };
