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

/**
 * Una pregunta de un alumno.
 *
 * Viaja por un canal aparte, `…:preguntas`, donde los alumnos escriben pero no
 * leen. La asimetría es el punto: la mitad del valor de poder preguntar es que
 * nadie más te vea preguntarlo, y si el canal fuera de lectura común cualquiera
 * con las herramientas de desarrollador abiertas sabría quién preguntó qué.
 *
 * La restricción la aplica la política sobre `realtime.messages`
 * (`supabase/politicas.sql`), no el cliente.
 */
export interface PreguntaAlumno {
  id: string;
  texto: string;
  /** Cómo quiere firmar. Puede quedar vacío: preguntar sin firmar es la idea. */
  autor?: string;
  /** Dónde estaba la clase. Sin esto, una pregunta llega descontextualizada
   *  diez minutos después y ya nadie sabe de qué hablaba. */
  itemId: string;
  itemTitulo?: string;
  paso: number;
  momento: number;
}

export const EVENTO_PREGUNTA = "pregunta-alumno";

/** El tema donde viajan las preguntas. */
export function canalDePreguntas(curso: string, sesion: string): string {
  return `${nombreCanal(curso, sesion)}:preguntas`;
}

/** Límite de longitud. Una pregunta no es un ensayo. */
export const MAX_PREGUNTA = 500;

// --------------------------------------------------------------------------
// Preguntas del docente hacia los alumnos
// --------------------------------------------------------------------------

/**
 * La respuesta de un alumno.
 *
 * Viaja por su propio tema, con la misma asimetría que las preguntas: los
 * alumnos escriben y no leen. Si pudieran leerlo, cualquiera con las
 * herramientas de desarrollador abiertas vería las respuestas de los demás
 * antes del revelado — y entonces la pregunta deja de medir lo que quería.
 */
export interface RespuestaAlumno {
  preguntaId: string;
  /** Quién responde. Anónimo y estable dentro de la sesión, para no contar dos
   *  veces a quien cambia de opinión. */
  alumnoId: string;
  opcion?: string;
  texto?: string;
  /** Prefiere no responder. Es una respuesta, no una ausencia. */
  omitida: boolean;
  momento: number;
}

/**
 * El recuento, tal como lo publica el docente al revelar.
 *
 * Solo se emite DESPUÉS del revelado. Antes, lo único que se proyecta es
 * cuántos respondieron — nunca qué respondieron (ver `CONVENTIONS.md` §12).
 */
export interface Revelado {
  preguntaId: string;
  /** Opción → cuántos la eligieron. */
  conteo: Record<string, number>;
  /** Respuestas abiertas, tal cual. */
  abiertas: string[];
  omitidas: number;
  total: number;
  /** La correcta, si la pregunta la tenía. Sale del servidor solo acá. */
  correcta?: string;
  momento: number;
}

export const EVENTO_RESPUESTA = "respuesta-alumno";
export const EVENTO_REVELADO = "revelado";

export function canalDeRespuestas(curso: string, sesion: string): string {
  return `${nombreCanal(curso, sesion)}:respuestas`;
}

/** Cuenta las respuestas de una pregunta, listas para publicar. */
export function contar(
  respuestas: RespuestaAlumno[],
  preguntaId: string,
  correcta?: string,
): Revelado {
  const suyas = respuestas.filter((r) => r.preguntaId === preguntaId);

  // Una sola por alumno: la última gana. Quien cambia de opinión no cuenta dos
  // veces, y sin esto el total podría superar a los conectados.
  const porAlumno = new Map<string, RespuestaAlumno>();
  for (const r of suyas) {
    const previa = porAlumno.get(r.alumnoId);
    if (!previa || r.momento > previa.momento) porAlumno.set(r.alumnoId, r);
  }

  const conteo: Record<string, number> = {};
  const abiertas: string[] = [];
  let omitidas = 0;

  for (const r of porAlumno.values()) {
    if (r.omitida) omitidas++;
    else if (r.opcion) conteo[r.opcion] = (conteo[r.opcion] ?? 0) + 1;
    else if (r.texto) abiertas.push(r.texto);
  }

  return {
    preguntaId,
    conteo,
    abiertas,
    omitidas,
    total: porAlumno.size,
    correcta,
    momento: Date.now(),
  };
}
