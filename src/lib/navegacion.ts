/**
 * Moverse por una sesión.
 *
 * Vive aparte de los componentes porque es la lógica que el docente maneja a
 * ciegas: en clase se pulsa la flecha mirando a la audiencia, no a la pantalla.
 * Una posición que se salta un ítem o que se atasca en el último paso de un
 * diagrama es de las cosas que solo se descubren dictando.
 *
 * La posición es `(unidad, ítem, paso)` — el paso interno importa tanto como
 * los otros dos, porque quien llega tarde tiene que aterrizar en el mensaje 4
 * del diagrama y no al principio del diagrama. Ver `CONVENTIONS.md` §10.
 */

import type { Item, Sesion, TipoItem, Unidad } from "./tipos";


export interface Posicion {
  unidad: number;
  item: number;
  paso: number;
}

export const INICIO: Posicion = { unidad: 0, item: 0, paso: 0 };

/**
 * Cuántos pasos internos tiene un ítem. Siempre al menos 1.
 *
 * El primer paso muestra el conjunto completo, sin nada enfocado: primero el
 * mapa, después el recorrido. De ahí el `+ 1`.
 */
export function pasosDe(item: Item): number {
  // Los pasos salen de la FUENTE, no de las explicaciones escritas. Si se
  // contaran las explicaciones, olvidar una escondería un mensaje entero del
  // recorrido — y nadie repara en el mensaje que nunca se mostró.
  if (item.tipo === "diagrama-secuencia" && item.secuencia?.mensajes.length) {
    return item.secuencia.mensajes.length + 1;
  }
  if (item.tipo === "comando-anotado" && item.segmentos.length) {
    return item.segmentos.length + 1;
  }
  if (item.tipo === "salida-anotada" && item.anotaciones.length) {
    return item.anotaciones.length + 1;
  }
  return 1;
}

/** El ítem que hay en una posición, o `null` si la posición no existe. */
export function itemEn(sesion: Sesion, pos: Posicion): Item | null {
  return sesion.unidades[pos.unidad]?.items[pos.item] ?? null;
}

export function unidadEn(sesion: Sesion, pos: Posicion): Unidad | null {
  return sesion.unidades[pos.unidad] ?? null;
}

/** Acota una posición a algo que existe de verdad. */
export function acotar(sesion: Sesion, pos: Posicion): Posicion {
  const unidad = Math.max(0, Math.min(pos.unidad, sesion.unidades.length - 1));
  const items = sesion.unidades[unidad]?.items ?? [];
  const item = Math.max(0, Math.min(pos.item, items.length - 1));
  const actual = items[item];
  const pasos = actual ? pasosDe(actual) : 1;
  return { unidad, item, paso: Math.max(0, Math.min(pos.paso, pasos - 1)) };
}

/**
 * Avanza uno.
 *
 * Dentro del ítem mientras le queden pasos; después al ítem siguiente; después
 * a la unidad siguiente. Al final de la sesión se queda donde está: pulsar de
 * más no debe tirar al docente a una pantalla en blanco.
 */
export function avanzar(sesion: Sesion, pos: Posicion): Posicion {
  const item = itemEn(sesion, pos);
  if (item && pos.paso < pasosDe(item) - 1) {
    return { ...pos, paso: pos.paso + 1 };
  }

  const items = sesion.unidades[pos.unidad]?.items ?? [];
  if (pos.item < items.length - 1) {
    return { unidad: pos.unidad, item: pos.item + 1, paso: 0 };
  }

  if (pos.unidad < sesion.unidades.length - 1) {
    return { unidad: pos.unidad + 1, item: 0, paso: 0 };
  }

  return pos;
}

/**
 * Retrocede uno.
 *
 * Al volver a un ítem con pasos, cae en su ÚLTIMO paso, no en el primero:
 * retroceder es deshacer, y quien retrocede quiere ver lo que acaba de pasar.
 */
export function retroceder(sesion: Sesion, pos: Posicion): Posicion {
  if (pos.paso > 0) return { ...pos, paso: pos.paso - 1 };

  if (pos.item > 0) {
    const previo = sesion.unidades[pos.unidad]?.items[pos.item - 1];
    return {
      unidad: pos.unidad,
      item: pos.item - 1,
      paso: previo ? pasosDe(previo) - 1 : 0,
    };
  }

  if (pos.unidad > 0) {
    const unidad = sesion.unidades[pos.unidad - 1];
    const items = unidad?.items ?? [];
    const ultimo = items[items.length - 1];
    return {
      unidad: pos.unidad - 1,
      item: Math.max(0, items.length - 1),
      paso: ultimo ? pasosDe(ultimo) - 1 : 0,
    };
  }

  return pos;
}

/** Índice absoluto del ítem dentro de la sesión, ignorando los pasos. */
export function indiceDeItem(sesion: Sesion, pos: Posicion): number {
  let n = 0;
  for (let u = 0; u < pos.unidad; u++) {
    n += sesion.unidades[u]?.items.length ?? 0;
  }
  return n + pos.item;
}

/** Total de ítems de la sesión. */
export function totalItems(sesion: Sesion): number {
  return sesion.unidades.reduce((t, u) => t + u.items.length, 0);
}

/**
 * El tiempo se cuenta de abajo hacia arriba.
 *
 * Lo declara el ítem, que es la pieza más pequeña y la única que alguien puede
 * estimar de verdad; la unidad suma los suyos y la sesión suma las unidades.
 * Nadie declara un total: los totales se calculan, siempre, y así no pueden
 * contradecir a sus partes.
 *
 * Un ítem sin minutos suma cero — es el caso normal de un título o una
 * transición, y no tiene sentido inventarle una duración.
 *
 * Vive acá y no en `contenido.ts` porque el reloj del mando lo necesita en el
 * navegador, y `contenido.ts` importa `node:fs`.
 */
export function minutosDeUnidad(unidad: Unidad): number {
  return unidad.items.reduce((t, i) => t + (i.minutos ?? 0), 0);
}

/** Minutos de una sesión entera: la suma de sus unidades. */
export function minutosDeSesion(sesion: Sesion): number {
  return sesion.unidades.reduce((t, u) => t + minutosDeUnidad(u), 0);
}

/**
 * Minutos planificados hasta el final del ítem donde se está.
 *
 * Es la mitad interesante del reloj: comparado con el tiempo realmente
 * transcurrido dice si la clase va adelantada o atrasada, que es lo único que
 * un docente hace con un reloj mientras dicta.
 */
export function minutosHasta(sesion: Sesion, pos: Posicion): number {
  let n = 0;
  for (let u = 0; u <= pos.unidad && u < sesion.unidades.length; u++) {
    const items = sesion.unidades[u]?.items ?? [];
    const hasta = u === pos.unidad ? pos.item : items.length - 1;
    for (let i = 0; i <= hasta && i < items.length; i++) {
      n += items[i]?.minutos ?? 0;
    }
  }
  return n;
}

/** Dónde está un ítem, por su identificador. `null` si no está. */
export function buscarPorId(sesion: Sesion, id: string): Posicion | null {
  for (let u = 0; u < sesion.unidades.length; u++) {
    const items = sesion.unidades[u]?.items ?? [];
    for (let i = 0; i < items.length; i++) {
      if (items[i]?.id === id) return { unidad: u, item: i, paso: 0 };
    }
  }
  return null;
}

/** Compara dos posiciones. Negativo si `a` va antes que `b`. */
export function comparar(a: Posicion, b: Posicion): number {
  if (a.unidad !== b.unidad) return a.unidad - b.unidad;
  if (a.item !== b.item) return a.item - b.item;
  return a.paso - b.paso;
}

// --------------------------------------------------------------------------
// El ritmo de una unidad
// --------------------------------------------------------------------------

/**
 * Minutos seguidos que puede durar un tramo sin que pase nada.
 *
 * No sale de ninguna teoría: sale de que veinticinco minutos son el largo de
 * los tramos que en las pruebas de dictado se sostuvieron, y de que a partir
 * de treinta la sala deja de preguntar aunque tenga preguntas. Está acá y no
 * en la cabeza de nadie para que el descuadre se vea al construir, no en el
 * aula.
 */
export const TRAMO_MAXIMO = 25;

/** A partir de estos minutos, una unidad necesita al menos dos momentos. */
export const UNIDAD_LARGA = 40;

/** Ítems que cortan un tramo: algo pasa, y no lo hace el docente hablando. */
const CORTAN: readonly TipoItem[] = ["pregunta", "pausa-preguntas", "receso"];

export interface Ritmo {
  /** Preguntas y pausas. El receso no cuenta: descansar no es participar. */
  momentos: number;
  /** El tramo más largo, en minutos, sin que pase nada. */
  tramoMayor: number;
}

/**
 * Cómo respira una unidad.
 *
 * Dos cifras, porque los dos fallos son distintos: una unidad puede tener
 * cuatro momentos y aun así abrir con cuarenta minutos seguidos de láminas, y
 * otra puede no tener ninguno y durar quince.
 */
export function ritmoDe(unidad: Unidad): Ritmo {
  let momentos = 0;
  let tramo = 0;
  let mayor = 0;

  for (const item of unidad.items) {
    if (CORTAN.includes(item.tipo)) {
      if (item.tipo !== "receso") momentos++;
      mayor = Math.max(mayor, tramo);
      tramo = 0;
      continue;
    }
    tramo += item.minutos ?? 0;
  }

  return { momentos, tramoMayor: Math.max(mayor, tramo) };
}

/** Qué le reprocharías al ritmo de esta unidad. Vacío si está bien. */
export function reprochesDeRitmo(unidad: Unidad): string[] {
  const { momentos, tramoMayor } = ritmoDe(unidad);
  const minutos = minutosDeUnidad(unidad);
  const reproches: string[] = [];

  if (minutos > UNIDAD_LARGA && momentos < 2) {
    reproches.push(
      `${minutos} min ${momentos === 0 ? "sin ningún" : "con un solo"} momento ` +
        `de interacción; a partir de ${UNIDAD_LARGA} hacen falta dos`,
    );
  }
  if (tramoMayor > TRAMO_MAXIMO) {
    reproches.push(
      `${tramoMayor} min seguidos sin que pase nada (el tope es ${TRAMO_MAXIMO})`,
    );
  }
  return reproches;
}
