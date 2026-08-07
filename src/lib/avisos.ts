/**
 * Avisos de tiempo para el mando.
 *
 * El reloj del batch 11 informa: dice cuánto queda y cuánto se lleva. Eso no
 * alcanza, porque lo que se olvida es justo lo que nadie mira. Cuatro horas se
 * van rápido, el receso se pasa, y una unidad que se come veinte minutos de
 * más se los come a la siguiente sin que nadie decida que así sea.
 *
 * Todo esto es aritmética pura y vive fuera de los componentes por la misma
 * razón que `reloj.ts`: es de lo poco que puede estar mal sin que se note. Un
 * aviso que salta cuando no toca se aprende a ignorar en diez minutos, y a
 * partir de ahí tampoco sirve el que sí toca.
 *
 * Nada de esto se proyecta (`CONVENTIONS.md` §14).
 */

import type { Sesion, TipoUnidad } from "./tipos";
import { minutosDeUnidad, minutosHasta, type Posicion } from "./navegacion";
import { aHora, aMinutos, minutosEntre } from "./reloj";

export type Urgencia = "aviso" | "urgente";

/** Una unidad que todavía no se dictó, y lo que cuesta. */
export interface Recorte {
  id: string;
  titulo: string;
  tipo: TipoUnidad;
  minutos: number;
}

export interface Aviso {
  /**
   * Estable mientras el aviso siga siendo el mismo.
   *
   * El mando repinta cada segundo. Sin un identificador estable, cualquier
   * animación o resaltado se reiniciaría en cada tic y el aviso parecería
   * nuevo sesenta veces por minuto.
   */
  id: string;
  urgencia: Urgencia;
  titulo: string;
  detalle?: string;
  /** Con qué recuperar el tiempo, si el aviso es de desvío acumulado. */
  recortes?: Recorte[];
}

/** Minutos de atraso a partir de los cuales conviene enterarse. */
export const UMBRAL_AVISO = 10;
/** Y a partir de los cuales hay que recortar algo. */
export const UMBRAL_URGENTE = 20;

/** Dónde está cada ítem de un tipo dado, en orden. */
function posicionesDe(sesion: Sesion, tipo: string): Posicion[] {
  const salida: Posicion[] = [];
  sesion.unidades.forEach((u, iu) => {
    u.items.forEach((it, ii) => {
      if (it.tipo === tipo) salida.push({ unidad: iu, item: ii, paso: 0 });
    });
  });
  return salida;
}

/**
 * Los avisos que corresponden ahora mismo, del más urgente al menos.
 *
 * `inicio` es la hora de referencia contra la que se mide todo. Por omisión es
 * la hora programada de la sesión, pero el mando puede pasar la hora en que la
 * clase **realmente** empezó: una sesión que arranca ocho minutos tarde no
 * está atrasada, y un reloj que insista en que sí lo está se vuelve ruido
 * antes del primer receso. El cálculo es el mismo en los dos casos; lo único
 * que cambia es desde dónde se cuenta.
 *
 * Sin horas legibles no hay avisos. Igual que `horaDeRegreso`, es preferible
 * quedarse callado a inventar.
 */
export function avisosDeTiempo({
  sesion,
  pos,
  horaActual,
  inicio = sesion.horaInicio,
}: {
  sesion: Sesion;
  pos: Posicion;
  /** La hora de ahora, en `"HH:MM"`. */
  horaActual: string;
  inicio?: string;
}): Aviso[] {
  const desdeMin = inicio ? aMinutos(inicio) : null;
  const transcurrido = minutosEntre(inicio, horaActual);
  if (desdeMin === null || transcurrido === null) return [];
  // Antes de empezar no hay nada que avisar: no se puede ir tarde a algo que
  // todavía no arrancó.
  if (transcurrido < 0) return [];

  const avisos: Aviso[] = [];
  const planificado = minutosHasta(sesion, pos);
  // Positivo: la clase va con holgura. Negativo: se está pasando.
  const desvio = planificado - transcurrido;

  // ------------------------------------------------------------- el receso
  //
  // Se avisa por la HORA, no por la posición. La posición ya la ve el docente
  // en el índice; lo que no ve es que son las 16:52 y el receso era a las
  // 16:40, porque justamente está explicando algo.
  for (const donde of posicionesDe(sesion, "receso")) {
    // Uno ya pasado no vuelve a avisar. Es el aviso que más rápido se aprende
    // a ignorar si se equivoca.
    if (
      donde.unidad < pos.unidad ||
      (donde.unidad === pos.unidad && donde.item <= pos.item)
    ) {
      continue;
    }

    const item = sesion.unidades[donde.unidad]?.items[donde.item];
    // `minutosHasta` incluye el ítem entero; el receso EMPIEZA antes.
    const empieza = minutosHasta(sesion, donde) - (item?.minutos ?? 0);
    const tarde = transcurrido - empieza;
    if (tarde > 0) {
      avisos.push({
        id: `receso:${item?.id ?? donde.item}`,
        urgencia: tarde >= UMBRAL_AVISO ? "urgente" : "aviso",
        titulo: `El receso tocaba a las ${aHora(desdeMin + empieza)}`,
        detalle:
          tarde >= 1
            ? `Van ${Math.round(tarde)} min de más antes de pararlo.`
            : undefined,
      });
    }
    // Solo el primero que quede por delante: avisar de los dos recesos del día
    // a la vez no ayuda a nadie.
    break;
  }

  // ------------------------------------------------------------- la unidad
  const unidad = sesion.unidades[pos.unidad];
  if (unidad && unidad.items.length > 0) {
    const fin = minutosHasta(sesion, {
      unidad: pos.unidad,
      item: unidad.items.length - 1,
      paso: 0,
    });
    const excedido = transcurrido - fin;
    if (excedido >= 1) {
      avisos.push({
        id: `unidad:${unidad.id}`,
        urgencia: excedido >= UMBRAL_AVISO ? "urgente" : "aviso",
        titulo: `«${unidad.titulo}» se pasó ${Math.round(excedido)} min`,
        detalle: `Debía cerrar a las ${aHora(desdeMin + fin)}.`,
      });
    }
  }

  // ------------------------------------------- el desvío acumulado, y qué cortar
  if (desvio <= -UMBRAL_AVISO) {
    const atraso = Math.round(-desvio);
    const recortes: Recorte[] = sesion.unidades
      .slice(pos.unidad + 1)
      .map((u) => ({
        id: u.id,
        titulo: u.titulo,
        tipo: u.tipo,
        minutos: minutosDeUnidad(u),
      }))
      .sort((a, b) => b.minutos - a.minutos);

    avisos.push({
      id: "desvio",
      urgencia: atraso >= UMBRAL_URGENTE ? "urgente" : "aviso",
      titulo: `${atraso} min de atraso acumulado`,
      detalle: recortes.length
        ? "Queda por dictar, de lo más caro a lo más barato:"
        : "No queda nada por recortar: lo que sobra sale del final.",
      recortes,
    });
  }

  // Lo urgente arriba. Dentro de la misma urgencia se respeta el orden en que
  // se generaron, que va de lo más concreto —el receso, la unidad— a lo más
  // general.
  return avisos.sort(
    (a, b) =>
      (b.urgencia === "urgente" ? 1 : 0) - (a.urgencia === "urgente" ? 1 : 0),
  );
}
