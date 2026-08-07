/**
 * Resalta el código de una sesión, en el servidor, antes de entregarla.
 *
 * Existe por un fallo que solo se ve en el navegador y que estuvo escondido
 * hasta que alguien abrió un ítem de código con la consola abierta.
 *
 * `Codigo`, `Terminal` y `Demo` llamaban a Shiki con `await` dentro del propio
 * componente. Eso funciona en un componente de servidor — y estos lo eran— pero
 * `Dictado` lleva `"use client"`, así que TODO lo que importa termina también
 * en el paquete del navegador. Un componente asíncrono en el árbol del cliente
 * no es esperable: React lo renderiza bien en el servidor y revienta al
 * hidratar, con un error minificado que no menciona ni a Shiki ni al ítem.
 * El síntoma en clase habría sido una lámina en blanco al llegar al primer
 * fragmento de código.
 *
 * La solución es la misma que ya usa `diagrama-secuencia`: el trabajo pesado se
 * hace una vez, en el servidor, y viaja con el ítem. El componente queda
 * síncrono y al navegador no llega ni una línea de JavaScript para pintar
 * código, que era la intención desde el principio.
 */

import { codeToHtml } from "shiki";

import type { Item, Sesion } from "./tipos";
import { aPowerShell } from "./windows";

/** Recorta `lineas: "12-34"` sobre el contenido. */
export function recortar(codigo: string, lineas?: string): string {
  if (!lineas) return codigo;
  const [desde, hasta] = lineas.split("-").map((n) => Number(n.trim()));
  if (!desde) return codigo;
  return codigo
    .split("\n")
    .slice(desde - 1, hasta ?? desde)
    .join("\n");
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Envoltura simple para cuando Shiki no conoce el lenguaje. */
export function comoTextoPlano(codigo: string): string {
  return `<pre><code>${escapar(codigo.trimEnd())}</code></pre>`;
}

/**
 * Expande `resaltar: [3, "10-14"]` a un conjunto de números de línea.
 *
 * Se cuentan sobre lo que se MUESTRA, no sobre el archivo: si el ítem trae
 * `lineas: "40-60"`, la 1 es la 40 del archivo. Contar sobre el archivo
 * obligaría a rehacer los números cada vez que alguien mueve el recorte, que
 * es justo lo que nadie se acuerda de hacer.
 */
export function lineasResaltadas(resaltar?: (number | string)[]): Set<number> {
  const lineas = new Set<number>();
  for (const entrada of resaltar ?? []) {
    if (typeof entrada === "number") {
      lineas.add(entrada);
      continue;
    }
    const [desde, hasta] = String(entrada)
      .split("-")
      .map((n) => Number(n.trim()));
    if (!desde) continue;
    for (let i = desde; i <= (hasta ?? desde); i++) lineas.add(i);
  }
  return lineas;
}

/**
 * Los números de línea del archivo real, uno por línea del fragmento.
 *
 * `["16-22", "44-46"]` produce `[16,17,…,22, 44,45,46]`. Si la cuenta no
 * cuadra con el fragmento devuelve `null` y la lámina se dibuja sin numerar:
 * numerar mal es peor que no numerar, porque nadie comprueba un número que
 * parece estar ahí.
 */
export function numerosDeLinea(
  numeros: string[] | undefined,
  totalLineas: number,
): (number | null)[] | null {
  if (!numeros?.length) return null;
  const salida: (number | null)[] = [];
  for (const [i, rango] of numeros.entries()) {
    const [desde, hasta] = rango.split("-").map((n) => Number(n.trim()));
    if (!desde || Number.isNaN(desde)) return null;
    // Entre dos bloques va un hueco: son líneas del archivo que no se muestran,
    // y fingir que el segundo sigue al primero sería mentir sobre el archivo.
    if (i > 0) salida.push(null);
    for (let n = desde; n <= (hasta ?? desde); n++) salida.push(n);
  }
  return salida.filter((n) => n !== null).length === totalLineas ? salida : null;
}

async function resaltar(
  codigo: string,
  lenguaje: string,
  destacadas?: Set<number>,
  numeros?: (number | null)[] | null,
): Promise<string> {
  try {
    return await codeToHtml(codigo.trimEnd(), {
      lang: lenguaje,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      transformers:
        destacadas?.size || numeros
          ? [
              {
                // Shiki emite un `<span class="line">` por línea y las numera
                // desde 1. Marcarla acá y pintarla con CSS sale más barato que
                // rearmar el HTML, y así el resaltado por línea, el número y el
                // de sintaxis conviven sin pisarse.
                line(nodo, numero) {
                  if (destacadas?.has(numero)) {
                    this.addClassToHast(nodo, "linea-resaltada");
                  }
                  if (!numeros) return;
                  // Las líneas de Shiki no cuentan los huecos, así que hay que
                  // saltarlos para emparejar el fragmento con el archivo.
                  const sinHuecos = numeros.filter((n) => n !== null);
                  const real = sinHuecos[numero - 1];
                  if (real != null) {
                    nodo.properties["data-linea"] = String(real);
                    // El hueco se marca en la línea que lo sigue, que es donde
                    // se dibuja el separador.
                    const pos = numeros.indexOf(real);
                    if (pos > 0 && numeros[pos - 1] === null) {
                      this.addClassToHast(nodo, "tras-salto");
                    }
                  }
                },
              },
            ]
          : undefined,
    });
  } catch {
    // Un lenguaje que Shiki no conoce no puede tumbar la lámina.
    return comoTextoPlano(codigo);
  }
}

/**
 * Devuelve la sesión con el HTML resaltado ya puesto en cada ítem.
 *
 * No muta la que recibe: la sesión que devuelve `cargarCurso` se reutiliza
 * entre peticiones, y escribirle encima haría que el resaltado de una carga se
 * filtrara a la siguiente.
 */
export async function resaltarSesion(sesion: Sesion): Promise<Sesion> {
  const unidades = await Promise.all(
    sesion.unidades.map(async (u) => ({
      ...u,
      items: await Promise.all(u.items.map(resaltarItem)),
    })),
  );
  return { ...sesion, unidades };
}

async function resaltarItem(item: Item): Promise<Item> {
  if (item.tipo === "codigo") {
    const fuente = recortar(item.contenido ?? "", item.lineas);
    const destacadas = lineasResaltadas(item.resaltar);
    const numeros = numerosDeLinea(
      item.numeros,
      fuente.replace(/\n$/, "").split("\n").length,
    );
    return {
      ...item,
      html: await resaltar(fuente, item.lenguaje, destacadas, numeros),
    };
  }

  if (item.tipo === "terminal") {
    // Lo escrito a mano manda; si no hay, se deriva. Un `comandoWindows` en el
    // YAML solo existe donde la equivalencia **no** es mecánica, y ahí la
    // traducción automática estorbaría.
    const win = item.comandoWindows ?? aPowerShell(item.comando);
    return {
      ...item,
      htmlComando: await resaltar(item.comando, "bash"),
      htmlWindows: win ? await resaltar(win, "powershell") : undefined,
    };
  }

  if (item.tipo === "demo") {
    return {
      ...item,
      pasos: await Promise.all(
        item.pasos.map(async (p) => {
          const win = aPowerShell(p.comando);
          return {
            ...p,
            html: await resaltar(p.comando, "bash"),
            htmlWindows: win ? await resaltar(win, "powershell") : undefined,
          };
        }),
      ),
    };
  }

  return item;
}
