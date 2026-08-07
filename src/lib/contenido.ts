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
import type { Curso, Item, Sesion, Termino, TipoItem, Unidad } from "./tipos";

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

/**
 * Dónde viven las imágenes y los descargables de esa misma raíz.
 *
 * Hermana de `raizPorDefecto` y derivada de ella, para que un árbol de prueba
 * siga funcionando: si el contenido está en `/tmp/x/contenido`, sus assets
 * están en `/tmp/x/public/contenido`.
 */
function raizDeAssets(raiz: string): string {
  return join(raiz, "..", "public", "contenido");
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
  // `descargas` no tiene un `archivo` suelto: tiene una lista, y cada entrada
  // apunta a `public/contenido/` igual que `archivo` e `imagen`. Se comprueba
  // acá para que un PDF que no se copió falle al construir y no proyectado.
  if (item.tipo === "descargas") {
    const assets = raizDeAssets(raiz);
    if (!existsSync(assets)) return;
    for (const [i, d] of (item.archivos ?? []).entries()) {
      if (typeof d?.archivo !== "string") continue;
      if (!existsSync(join(assets, d.archivo))) {
        problemas.push(
          `${donde} · archivos[${i}]: no existe el archivo ` +
            `\`public/contenido/${d.archivo}\``,
        );
      }
    }
    return;
  }

  const conArchivo = item as Item & { archivo?: string; contenido?: string };
  const ruta = conArchivo.archivo;
  if (!ruta) return;

  // `imagen` y `archivo` no se leen: se sirven tal cual, y por eso viven en
  // `public/contenido/` y no en `contenido/`.
  //
  // Es la única excepción a la regla de que el material vive en `contenido/`,
  // y la impone Next: lo que se sirve por URL sale de `public/`. La primera
  // versión los buscaba en `contenido/` mientras el componente los pedía en
  // `/contenido/…`, así que los dos tipos validaban contra una carpeta y se
  // dibujaban desde otra. Nadie lo notó porque en dos meses no se usó ninguno
  // de los dos — que es exactamente cómo se ve un camino sin terminar.
  //
  // La ruta del YAML es la ruta de la URL, sin traducción: `img/flota.png`
  // vive en `public/contenido/img/flota.png` y se pide en
  // `/contenido/img/flota.png`.
  if (item.tipo === "imagen" || item.tipo === "archivo") {
    // La comprobación se salta entera si la carpeta de assets NO EXISTE, y esa
    // distinción es la que evita un 500.
    //
    // Las páginas del docente son dinámicas: cargan el curso en cada
    // petición, dentro de una función serverless donde `public/` no viaja —
    // lo sirve el CDN. Sin esta guarda, cuatro imágenes que sí existen y sí se
    // ven hacían fallar la carga entera del curso, y `/profe/inicio` devolvía
    // «A server error occurred» con todo el material correcto.
    //
    // Que falte un archivo suelto sigue siendo un error, porque eso sí es
    // material roto y se descubre al construir. Que falte la carpeta entera no
    // dice nada del contenido: dice dónde está corriendo esto.
    const assets = raizDeAssets(raiz);
    if (existsSync(assets) && !existsSync(join(assets, ruta))) {
      problemas.push(
        `${donde}: no existe el archivo \`public/contenido/${ruta}\``,
      );
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

/**
 * Cambia los nombres de términos de un ítem `glosario` por sus entradas.
 *
 * Un término que no existe falla nombrándolo, y con la lista de los que sí
 * existen: escribir `Sesgo` cuando el glosario dice `sesgo` es el error de
 * dedo más probable acá, y sin el aviso la lámina saldría con un hueco.
 */
function resolverGlosario(
  item: Item,
  glosario: Termino[],
  donde: string,
  problemas: string[],
): void {
  if (item.tipo !== "glosario") return;

  const porNombre = new Map(glosario.map((t) => [t.termino, t]));
  const entradas: Termino[] = [];

  for (const nombre of item.terminos ?? []) {
    const entrada = porNombre.get(nombre);
    if (!entrada) {
      problemas.push(
        `${donde}: el término \`${nombre}\` no está en glosario.yml. ` +
          `Los que hay: ${glosario.map((t) => t.termino).join(", ")}`,
      );
      continue;
    }
    entradas.push(entrada);
  }

  if (item.grupo) {
    const delGrupo = glosario.filter((t) => t.grupo === item.grupo);
    if (!delGrupo.length) {
      problemas.push(
        `${donde}: ningún término del glosario está en el grupo ` +
          `\`${item.grupo}\``,
      );
    }
    for (const t of delGrupo) {
      if (!entradas.includes(t)) entradas.push(t);
    }
  }

  if (!entradas.length) {
    problemas.push(`${donde}: no selecciona ningún término`);
  }

  // `nuevos` tiene que ser un subconjunto de lo que la lámina muestra. Marcar
  // como novedad algo que no está en pantalla es una promesa que la lámina no
  // cumple, y el docente no se entera hasta proyectarla.
  for (const n of item.nuevos ?? []) {
    if (!entradas.some((t) => t.termino === n)) {
      problemas.push(
        `${donde}: \`${n}\` está en \`nuevos\` y no en los términos de la ` +
          `lámina (${entradas.map((t) => t.termino).join(", ")})`,
      );
    }
  }

  item.entradas = entradas;
}

// --------------------------------------------------------------------------
// Validación específica de algunos tipos
// --------------------------------------------------------------------------

function validacionesExtra(item: Item, donde: string, problemas: string[]) {
  if (item.tipo === "descargas") {
    // Cada entrada necesita las dos cosas: la ruta para bajarlo y el nombre con
    // el que se anuncia. Una lista de rutas sueltas obligaría a la lámina a
    // inventar el título a partir del nombre del archivo, que es como se acaba
    // proyectando `04-las-siete-herramientas.pdf` en una pantalla.
    const lista = item.archivos;
    if (!Array.isArray(lista) || !lista.length) {
      problemas.push(`${donde}: \`archivos\` tiene que ser una lista no vacía`);
    } else {
      lista.forEach((d, i) => {
        if (typeof d?.archivo !== "string" || !d.archivo.trim()) {
          problemas.push(`${donde} · archivos[${i}]: falta \`archivo\``);
        }
        if (typeof d?.titulo !== "string" || !d.titulo.trim()) {
          problemas.push(`${donde} · archivos[${i}]: falta \`titulo\``);
        }
      });
    }
  }

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

  if (item.tipo === "salida-anotada") {
    // Lo mismo que en un comando anotado, y por lo mismo: la anotación se
    // ancla por texto. Con una diferencia que importa — una salida real se
    // copia y se pega, y al pegarla se cuela un espacio de más con una
    // facilidad que un comando escrito a mano no tiene. El aviso dice cuál.
    for (const a of item.anotaciones ?? []) {
      const veces = item.salida.split(a.texto).length - 1;
      if (veces === 0) {
        problemas.push(
          `${donde}: la anotación \`${a.texto}\` no aparece en la salida`,
        );
      } else if (veces > 1) {
        problemas.push(
          `${donde}: la anotación \`${a.texto}\` aparece ${veces} veces en la ` +
            `salida; es ambiguo cuál señalar`,
        );
      }
    }

    for (const [a, b] of solapamientos(item.salida, item.anotaciones ?? [])) {
      problemas.push(
        `${donde}: las anotaciones \`${a}\` y \`${b}\` se solapan dentro de la salida`,
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
  glosario: Termino[],
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
    resolverGlosario(item, glosario, `${donde} \`${item.id}\``, problemas);
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
  glosario: Termino[],
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
    .map((u, i) => {
      // Una unidad puede estar escrita en su propio archivo. La sesión queda
      // como lo que es —cabecera y orden— y cada unidad se edita sin abrir
      // ochocientas líneas ajenas. Ver `CONVENTIONS.md` §1.
      const desde = typeof u.archivo === "string" ? u.archivo : null;
      if (!desde)
        return cargarUnidad(u, archivo, raiz, glosario, problemas, vistos);

      const claves = Object.keys(u).filter((k) => k !== "archivo");
      if (claves.length) {
        problemas.push(
          `${archivo} · unidad ${i + 1}: apunta a \`${desde}\` y además ` +
            `declara \`${claves.join("`, `")}\`. Una unidad se escribe en un ` +
            `sitio o en el otro, no repartida entre los dos.`,
        );
        return null;
      }

      const contenido = leerYaml(join(raiz, desde), raiz, problemas);
      if (!contenido) return null;
      return cargarUnidad(contenido, desde, raiz, glosario, problemas, vistos);
    })
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

/**
 * El glosario del curso, si lo hay.
 *
 * Se lee una vez y se pasa hacia abajo, porque los ítems de tipo `glosario`
 * nombran términos en vez de copiarlos: la definición vive en un solo sitio y
 * dos láminas no pueden definir «sesgo» con palabras distintas.
 */
function cargarGlosario(raiz: string, problemas: string[]): Termino[] {
  const ruta = join(raiz, "glosario.yml");
  if (!existsSync(ruta)) return [];

  const bruto = leerYaml(ruta, raiz, problemas);
  const lista = bruto?.terminos;
  if (!Array.isArray(lista)) {
    if (bruto) problemas.push("glosario.yml: falta la lista `terminos`");
    return [];
  }

  const vistos = new Set<string>();
  const terminos: Termino[] = [];
  lista.forEach((b, i) => {
    const t = b as Record<string, unknown>;
    const nombre = typeof t.termino === "string" ? t.termino : null;
    if (!nombre) {
      problemas.push(`glosario.yml · término ${i + 1}: falta \`termino\``);
      return;
    }
    if (typeof t.definicion !== "string" || !t.definicion.trim()) {
      problemas.push(`glosario.yml · \`${nombre}\`: falta \`definicion\``);
      return;
    }
    if (vistos.has(nombre)) {
      problemas.push(`glosario.yml: el término \`${nombre}\` está dos veces`);
    }
    vistos.add(nombre);
    terminos.push(t as unknown as Termino);
  });
  return terminos;
}

/** Carga el curso completo. Lanza `ErrorDeContenido` si algo no cierra. */
export function cargarCurso(raiz: string = raizPorDefecto()): Curso {
  const problemas: string[] = [];
  const bruto = leerYaml(join(raiz, "curso.yml"), raiz, problemas);

  if (!bruto) throw new ErrorDeContenido(problemas);

  const glosario = cargarGlosario(raiz, problemas);

  const dirSesiones = join(raiz, "sesiones");
  const archivos = existsSync(dirSesiones)
    ? readdirSync(dirSesiones)
        .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
        .sort()
    : [];

  if (!archivos.length) problemas.push("No hay archivos en contenido/sesiones/");

  const sesiones = archivos
    .map((a) => cargarSesion(a, raiz, glosario, problemas))
    .filter((s): s is Sesion => s !== null)
    .sort((a, b) => a.numero - b.numero);

  // Un término se abre UNA vez en todo el curso.
  //
  // Es la regla que hace que `nuevos` valga la pena, y solo se puede comprobar
  // acá: dos láminas presentando «deriva» como novedad viven en dos archivos
  // distintos, casi siempre de dos sesiones distintas, y son dos explicaciones
  // que se separan en cuanto alguien corrige una. Ver `CONVENTIONS.md` §18.
  const estrenos = new Map<string, string>();
  for (const sesion of sesiones) {
    for (const unidad of sesion.unidades) {
      for (const item of unidad.items) {
        if (item.tipo !== "glosario") continue;
        for (const n of item.nuevos ?? []) {
          const ya = estrenos.get(n);
          if (ya) {
            problemas.push(
              `\`${n}\` se declara nuevo dos veces: en \`${ya}\` y en ` +
                `\`${item.id}\`. Un término se abre una sola vez`,
            );
          } else {
            estrenos.set(n, item.id);
          }
        }
      }
    }
  }

  if (problemas.length) throw new ErrorDeContenido(problemas);

  return {
    id: String(bruto.id ?? "curso"),
    titulo: String(bruto.titulo ?? ""),
    subtitulo: bruto.subtitulo ? String(bruto.subtitulo) : undefined,
    programa: bruto.programa ? String(bruto.programa) : undefined,
    institucion: bruto.institucion ? String(bruto.institucion) : undefined,
    docente: bruto.docente ? String(bruto.docente) : undefined,
    descripcion: bruto.descripcion ? String(bruto.descripcion) : undefined,
    glosario: glosario.length ? glosario : undefined,
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

  // Una excepción, y una sola: en una ventana de lectura los minutos NO son el
  // plan privado del docente, son la instrucción — «tienen ocho minutos». Es
  // el único tipo donde el número está dirigido a la clase, y quitárselo deja
  // un reloj en blanco justo en la lámina que existe para poner un reloj.
  if (item.tipo === "lectura") copia.minutos = item.minutos;

  return copia as unknown as Item;
}

/**
 * La sesión sin las notas del docente, y con todo lo demás.
 *
 * Es para la pantalla que se proyecta. El curso se dicta por videollamada, así
 * que **la pantalla del docente la ve la clase entera**: unas notas que dicen
 * «no adelantar el número, es el golpe de dentro de diez minutos» proyectadas
 * son el golpe arruinado, y unas que dicen qué contestará la sala son peores.
 *
 * No es lo mismo que `sesionParaAlumno`: esta conserva las respuestas y los
 * minutos, que el docente necesita para revelar y para el reloj. Lo único que
 * quita son las notas, y las quita en el SERVIDOR — proyectar es compartir el
 * navegador, y lo que llega al navegador se puede leer.
 *
 * Las notas siguen enteras en el mando y en la vista de revisión, que son las
 * dos pantallas que nadie más ve.
 */
export function sesionSinNotas(sesion: Sesion): Sesion {
  return {
    ...sesion,
    unidades: sesion.unidades.map((u) => ({
      ...u,
      items: u.items.map((item) => {
        if (!("notas" in item)) return item;
        const copia: Record<string, unknown> = { ...item };
        delete copia.notas;
        return copia as unknown as Item;
      }),
    })),
  };
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
