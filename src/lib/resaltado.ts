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

async function resaltar(codigo: string, lenguaje: string): Promise<string> {
  try {
    return await codeToHtml(codigo.trimEnd(), {
      lang: lenguaje,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
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
    return { ...item, html: await resaltar(fuente, item.lenguaje) };
  }

  if (item.tipo === "terminal") {
    return {
      ...item,
      htmlComando: await resaltar(item.comando, "bash"),
      htmlWindows: item.comandoWindows
        ? await resaltar(item.comandoWindows, "powershell")
        : undefined,
    };
  }

  if (item.tipo === "demo") {
    return {
      ...item,
      pasos: await Promise.all(
        item.pasos.map(async (p) => ({
          ...p,
          html: await resaltar(p.comando, "bash"),
        })),
      ),
    };
  }

  return item;
}
