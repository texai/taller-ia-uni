/**
 * Dónde cae cada parte anotada dentro de un comando.
 *
 * `docker compose run --rm -e EJECUTAR_ACCIONES=1 agente python -m agente run`
 * son doce palabras que se leen como un bloque opaco. Cada una está ahí por
 * una razón, y esa razón es lo que hay que enseñar — pero mostrando la parte
 * **sin perder el todo**, que es justo lo que se pierde al citar el trozo
 * suelto en una viñeta.
 *
 * Los segmentos se declaran por TEXTO y no por índice de caracteres: un índice
 * se rompe en cuanto alguien corrige un espacio, y se rompe en silencio. El
 * costo de esa decisión es que hay que localizarlos, y que hay que decidir qué
 * pasa cuando el texto no aparece o aparece dos veces. Las dos cosas viven
 * acá, probadas, en vez de dentro de un componente.
 */

/** Un trozo del comando: o es un segmento anotado, o es el relleno entre dos. */
export interface Trozo {
  texto: string;
  /** Índice del segmento al que pertenece, o `null` si es relleno. */
  segmento: number | null;
}

export interface Ubicacion {
  /** Desplazamiento en caracteres desde el principio del comando. */
  desde: number;
  hasta: number;
  /** Línea (base 0) y columna donde empieza, para dibujar la llave debajo. */
  linea: number;
  columna: number;
  /** Cuántos caracteres ocupa. Si cruza un salto de línea, `null`. */
  ancho: number | null;
}

/** Dónde está un texto dentro del comando. `null` si no está. */
export function ubicar(comando: string, texto: string): Ubicacion | null {
  const desde = comando.indexOf(texto);
  if (desde < 0) return null;

  const hasta = desde + texto.length;
  const antes = comando.slice(0, desde);
  const linea = antes.split("\n").length - 1;
  const columna = desde - (antes.lastIndexOf("\n") + 1);

  return {
    desde,
    hasta,
    linea,
    columna,
    ancho: texto.includes("\n") ? null : texto.length,
  };
}

/**
 * Parte el comando en trozos, marcando cuáles son segmentos anotados.
 *
 * Los trozos salen **en el orden del comando**, no en el orden en que están
 * escritos los segmentos en el YAML. Quien escribe el material anota primero
 * lo que le parece más importante, y eso no tiene por qué coincidir con el
 * orden de las palabras.
 *
 * Un segmento que no aparece se ignora acá: el cargador ya falló por él, y
 * este módulo no debe decidir dos veces lo mismo.
 */
export function trocear(
  comando: string,
  segmentos: { texto: string }[],
): Trozo[] {
  const ubicados = segmentos
    .map((s, i) => ({ i, u: ubicar(comando, s.texto) }))
    .filter((x): x is { i: number; u: Ubicacion } => x.u !== null)
    .sort((a, b) => a.u.desde - b.u.desde);

  const trozos: Trozo[] = [];
  let cursor = 0;

  for (const { i, u } of ubicados) {
    // Un segmento que empieza dentro del anterior se salta. El cargador avisa
    // del solapamiento; acá lo único que importa es no cortar mal el texto.
    if (u.desde < cursor) continue;
    if (u.desde > cursor) {
      trozos.push({ texto: comando.slice(cursor, u.desde), segmento: null });
    }
    trozos.push({ texto: comando.slice(u.desde, u.hasta), segmento: i });
    cursor = u.hasta;
  }

  if (cursor < comando.length) {
    trozos.push({ texto: comando.slice(cursor), segmento: null });
  }

  return trozos;
}

/**
 * La llave que señala un segmento, en caracteres.
 *
 * Se dibuja con caracteres y no con CSS porque el comando va en monoespaciada:
 * contar columnas alinea exacto, y una llave que no queda debajo de su parte
 * es peor que ninguna llave. Es también cómo se anota en un terminal, que es
 * donde el alumno va a ver estos comandos.
 */
export function llave(columna: number, ancho: number): string {
  const relleno = " ".repeat(Math.max(0, columna));
  if (ancho <= 1) return `${relleno}↑`;
  if (ancho === 2) return `${relleno}└┘`;
  return `${relleno}└${"─".repeat(ancho - 2)}┘`;
}

/**
 * Los solapamientos entre segmentos, si los hay.
 *
 * Dos segmentos que se pisan producen un recorrido en el que una parte se
 * traga a la otra y esa otra nunca se enfoca. Devuelve los pares en conflicto
 * para que el cargador los nombre.
 */
export function solapamientos(
  comando: string,
  segmentos: { texto: string }[],
): [string, string][] {
  const ubicados = segmentos
    .map((s) => ({ texto: s.texto, u: ubicar(comando, s.texto) }))
    .filter((x): x is { texto: string; u: Ubicacion } => x.u !== null)
    .sort((a, b) => a.u.desde - b.u.desde);

  const pares: [string, string][] = [];
  for (let i = 1; i < ubicados.length; i++) {
    const previo = ubicados[i - 1];
    const actual = ubicados[i];
    if (previo && actual && actual.u.desde < previo.u.hasta) {
      pares.push([previo.texto, actual.texto]);
    }
  }
  return pares;
}
