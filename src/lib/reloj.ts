/**
 * Aritmética de reloj para el dictado.
 *
 * Vive aparte de los componentes porque es lo único de la familia `dictado`
 * que se puede equivocar en silencio. Un receso que anuncia mal la hora de
 * regreso divide la clase en dos grupos que vuelven en momentos distintos, y
 * nadie se da cuenta de que el error estaba en un `+ minutos`.
 */

/** Minutos desde medianoche de un `"HH:MM"`. `null` si no es una hora. */
export function aMinutos(hora: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hora.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** `"HH:MM"` a partir de minutos desde medianoche. Da la vuelta a medianoche. */
export function aHora(minutos: number): string {
  const total = ((minutos % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * A qué hora se vuelve de un receso que empieza ahora.
 *
 * `desde` es la hora de inicio en `"HH:MM"`; si no se puede leer, devuelve
 * `null` en vez de inventar una hora. Anunciar una hora equivocada es peor que
 * no anunciar ninguna.
 */
export function horaDeRegreso(desde: string, minutos: number): string | null {
  const inicio = aMinutos(desde);
  if (inicio === null || !Number.isFinite(minutos)) return null;
  return aHora(inicio + Math.round(minutos));
}

/** Formatea una duración en segundos como `"M:SS"`. */
export function comoCuentaRegresiva(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** La hora local actual como `"HH:MM"`. */
export function ahora(fecha: Date): string {
  return `${String(fecha.getHours()).padStart(2, "0")}:${String(
    fecha.getMinutes(),
  ).padStart(2, "0")}`;
}
