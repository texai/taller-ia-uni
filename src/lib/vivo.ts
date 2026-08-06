/**
 * El canal en vivo: el docente marca el ritmo, los alumnos lo siguen.
 *
 * Va directo del navegador contra Supabase Realtime, sin pasar por Vercel: una
 * función serverless no puede sostener una conexión abierta, así que un
 * WebSocket servido desde nuestra infraestructura no existe como opción (ver
 * `CONVENTIONS.md` §5).
 *
 * Dos mecanismos, ninguno de los cuales toca Postgres:
 *
 *   Broadcast   cada movimiento del docente
 *   Presence    la posición actual, para quien llega tarde
 *
 * Presence es la pieza que hace innecesaria una tabla. Sin ella habría que
 * persistir la posición en algún lado para que alguien que abre el navegador a
 * las 16:20 supiera dónde va la clase; con ella, ese estado lo mantiene el
 * propio canal.
 */

export interface Pauta {
  /** Identificador del ítem donde va la clase. */
  itemId: string;
  /** Paso interno dentro del ítem. Quien llega tarde aterriza en el mensaje 4
   *  del diagrama, no al principio del diagrama. */
  paso: number;
  /** Fuera de vivo, cada quien navega por su cuenta. */
  enVivo: boolean;
  /** Para descartar mensajes que llegan fuera de orden. */
  momento: number;
}

export type EstadoCanal =
  | "conectando"
  | "en-vivo"
  | "reconectando"
  | "sin-conexion"
  | "sin-configurar";

/**
 * Nombre del tema.
 *
 * Con prefijo porque el proyecto es compartido con `gen`, y un nombre genérico
 * es de los que dos aplicaciones eligen sin consultarse.
 */
export function nombreCanal(curso: string, sesion: string): string {
  return `taller:${curso}:${sesion}`;
}

export const EVENTO_PAUTA = "pauta";

/** ¿La pauta `a` es más nueva que la `b`? */
export function esMasNueva(a: Pauta, b: Pauta | null): boolean {
  return !b || a.momento > b.momento;
}
