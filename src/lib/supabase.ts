/**
 * Los clientes de Supabase, y la única pregunta que importa: ¿es el docente?
 *
 * Supabase se usa para dos cosas y nada más: Auth, para que el docente entre
 * por `/profe`, y Realtime, para el canal en vivo del batch 8. No hay tablas
 * nuestras (ver `docs/CONVENTIONS.md` §11).
 *
 * El proyecto es COMPARTIDO con la aplicación `gen`, y ahí está el filo: Auth
 * es común a las dos, así que "estar autenticado" no alcanza como criterio.
 * Alguien que se registre en `gen` queda autenticado también acá. Por eso la
 * pregunta no es si hay sesión, sino si la sesión es la del docente.
 */

import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const LLAVE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Identificador del docente. No es secreto: la defensa es la política. */
export const DOCENTE_UID = process.env.NEXT_PUBLIC_DOCENTE_UID ?? "";

/**
 * Si falta configuración, la aplicación NO se cae.
 *
 * Sigue siendo un sitio público perfectamente utilizable: el contenido del
 * curso se sirve igual y lo único que deja de funcionar es la entrada del
 * docente, que además lo dice en pantalla. Reventar el arranque por una
 * variable de entorno ausente convertiría un despliegue mal configurado en un
 * sitio caído.
 */
export const HAY_SUPABASE = Boolean(URL && LLAVE);

/** ¿Este usuario es el docente? */
export function esDocente(usuario: User | null | undefined): boolean {
  if (!usuario || !DOCENTE_UID) return false;
  return usuario.id === DOCENTE_UID;
}

/** Cliente para componentes del navegador. */
export function clienteNavegador() {
  if (!HAY_SUPABASE) return null;
  return createBrowserClient(URL!, LLAVE!);
}

type Galleta = { name: string; value: string; options?: object };

/**
 * Cliente para el servidor.
 *
 * Recibe las funciones de galletas en vez de importarlas: el middleware y los
 * componentes de servidor las manejan de forma distinta, y hacer que este
 * módulo lo sepa lo ataría a uno de los dos.
 */
export function clienteServidor(galletas: {
  getAll: () => Galleta[];
  setAll: (nuevas: Galleta[]) => void;
}) {
  if (!HAY_SUPABASE) return null;
  return createServerClient(URL!, LLAVE!, { cookies: galletas });
}
