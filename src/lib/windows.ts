/**
 * El mismo comando, para quien está en Windows.
 *
 * El laboratorio trae dos puertas a lo mismo: `make` en macOS y Linux, y
 * `taller.ps1` en PowerShell. Corren los mismos contenedores y producen los
 * mismos resultados — `make arriba` y `.\taller.ps1 arriba` son el mismo
 * comando.
 *
 * El material solo enseñaba la primera. Proyectado, `make verificar
 * ARGS="--reto 1"` deja fuera a media sala: Windows no trae `make`, y montar
 * WSL2 en clase cuesta la primera hora del taller.
 *
 * **Por qué se traduce y no se escribe.** Son ciento tres apariciones. Escritas
 * a mano se desincronizan el primer día que alguien renombre un `target`, y una
 * línea de Windows que no existe es peor que ninguna: la sala la teclea y no
 * corre. La forma es mecánica —`make X ARGS="…"` es `.\taller.ps1 X …`— así que
 * lo que se escribe una vez es la regla, y lo que se comprueba en cada build es
 * que **todo lo que el curso manda ejecutar tenga equivalente**.
 *
 * Devuelve `null` en dos casos, y los dos importan:
 *
 * - **No es un `make`.** `docker compose …` y `curl …` se teclean igual en
 *   PowerShell, así que no hay nada que ofrecer y no se dibuja segunda línea.
 * - **Es un `make` que no sabe traducir.** Un `target` nuevo del `Makefile`
 *   que nadie agregó a `taller.ps1`, o una variable que no se conoce. Acá
 *   `null` no es «no hace falta» sino «falta algo», y por eso
 *   `validar-contenido` lo convierte en error: se rompe el build, que es
 *   barato, en vez de la clase, que no lo es.
 */

/**
 * Lo que `taller.ps1` sabe hacer.
 *
 * Es el espejo de su `switch`, copiado a mano porque el script vive en el otro
 * repositorio y no se puede importar. Esa copia es exactamente lo que la
 * comprobación de `validar-contenido` vigila: si el curso manda un `make` que
 * no está en esta lista, el build cae.
 */
export const CONOCIDOS = new Set([
  "arriba",
  "abajo",
  "estado",
  "logs",
  "seed",
  "datos",
  "entrenar",
  "pronosticar",
  "metricas",
  "agente",
  "plano",
  "memoria",
  "senales",
  "actuar",
  "consola",
  "verificar",
  "ui",
  "romper",
  "reparar",
  "mlflow",
  "ollama",
  "reset",
  "ayuda",
]);

/**
 * Las variables del `Makefile`, y qué son del otro lado.
 *
 * Las tres se vuelven un argumento posicional: `make romper
 * ESCENARIO=feed_caido` es `.\taller.ps1 romper feed_caido`. Una variable que
 * no esté acá devuelve `null` a propósito — adivinar dónde va un valor que no
 * se conoce produce una línea plausible y equivocada, que es la peor de las
 * salidas posibles.
 */
const VARIABLES = new Set(["ARGS", "ESCENARIO", "SERVICIO"]);

/** El nombre del script, tal como se teclea. */
export const SCRIPT_WINDOWS = String.raw`.\taller.ps1`;

/** Un solo `make …`, ya separado de sus vecinos. */
function unTramo(tramo: string): string | null {
  const partes = tramo.trim().split(/\s+/);
  if (partes[0] !== "make") return null;

  const objetivo = partes[1];
  // `make` a secas es `make ayuda`: es el `.DEFAULT_GOAL` del Makefile.
  if (!objetivo) return SCRIPT_WINDOWS;
  if (!CONOCIDOS.has(objetivo)) return null;

  // El resto se vuelve a unir antes de trocearlo: `ARGS="--fecha 2026-08-08"`
  // trae un espacio dentro de las comillas, y partirlo por espacios lo rompe.
  const resto = tramo.trim().slice(tramo.trim().indexOf(objetivo) + objetivo.length).trim();

  const argumentos: string[] = [];
  let sobra = resto;
  while (sobra) {
    const m = /^([A-Z_]+)=("([^"]*)"|'([^']*)'|(\S*))\s*/.exec(sobra);
    if (!m) return null; // algo que no es `VARIABLE=valor`. Mejor no inventar.
    if (!VARIABLES.has(m[1]!)) return null;
    const valor = (m[3] ?? m[4] ?? m[5] ?? "").trim();
    if (valor) argumentos.push(valor);
    sobra = sobra.slice(m[0].length);
  }

  // `.\taller.ps1` sin argumento ya lista los comandos, así que `make ayuda`
  // no necesita decir «ayuda». Es además lo que documenta el propio script.
  if (objetivo === "ayuda" && !argumentos.length) return SCRIPT_WINDOWS;

  return [SCRIPT_WINDOWS, objetivo, ...argumentos].join(" ");
}

/**
 * La línea equivalente en PowerShell, o `null` si no la hay.
 *
 * Una cadena con `&&` se traduce entera o no se traduce: media línea buena y
 * media mala no se puede teclear. En PowerShell el separador es `;`.
 */
export function aPowerShell(comando: string): string | null {
  const tramos = comando.split("&&");
  const traducidos: string[] = [];
  for (const t of tramos) {
    const uno = unTramo(t);
    if (uno === null) return null;
    traducidos.push(uno);
  }
  return traducidos.join("; ");
}

/**
 * Si esto era un `make`, aunque no se haya sabido traducir.
 *
 * Separa los dos `null` de `aPowerShell`: sin esto, el validador no puede
 * distinguir «`docker compose`, no hace falta» de «`make loquesea`, falta».
 */
export function esComandoMake(comando: string): boolean {
  return comando.split("&&").some((t) => /^\s*make(\s|$)/.test(t));
}
