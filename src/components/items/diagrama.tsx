"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Mermaid, en el cliente.
 *
 * Es de los pocos componentes que necesitan JavaScript en el navegador:
 * Mermaid dibuja midiendo texto, y eso exige un DOM real. Se carga de forma
 * diferida para que su peso no entre en el paquete de la primera lámina.
 */
export function Mermaid({ fuente }: { fuente: string }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const oscuro = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;

        mermaid.initialize({
          startOnLoad: false,
          theme: oscuro ? "dark" : "default",
          fontFamily: "inherit",
          fontSize: 16,
          securityLevel: "strict",
          /*
            El recuadro de un `subgraph`, con los colores de la aplicación.

            El tema `dark` de Mermaid pinta los grupos con un gris claro
            opaco. Sobre este lienzo casi negro eso no se lee como «estos
            nodos van juntos»: se lee como un rectángulo recortado y mal
            pegado encima del diagrama — que es exactamente lo que parecía en
            la lámina de arquitectura.

            Un grupo no necesita relleno para agrupar. Basta un borde tenue y
            el rótulo, que es lo que hace el resto de la interfaz con sus
            cajas. Va acá y no en el diagrama concreto para que cualquier
            `subgraph` futuro salga bien sin acordarse de esto.
          */
          themeVariables: oscuro
            ? {
                clusterBkg: "#0f1115",
                clusterBorder: "#262c37",
                titleColor: "#9aa4b2",
                lineColor: "#9aa4b2",
                // El rótulo de una flecha viene con un chip gris de resalte
                // detrás. Sobre el lienzo oscuro parece un subrayado de
                // rotulador, no una etiqueta.
                edgeLabelBackground: "#0f1115",
              }
            : {
                clusterBkg: "#f6f7f9",
                clusterBorder: "#e1e5ea",
                edgeLabelBackground: "#ffffff",
              },
        });

        const { svg } = await mermaid.render(`m${id}`, fuente);
        if (!cancelado && contenedor.current) {
          contenedor.current.innerHTML = svg;
          ocuparElAncho(contenedor.current);
        }
      } catch (e) {
        // Un diagrama mal escrito no puede tumbar la lámina entera: en clase
        // vale más ver el resto del contenido y la fuente del diagrama.
        if (!cancelado) setError((e as Error).message);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [fuente, id]);

  if (error) {
    return (
      <div
        className="rounded-xl border p-5"
        style={{ borderColor: "var(--color-aviso)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-aviso)" }}>
          El diagrama no se pudo dibujar: {error}
        </p>
        <pre className="mt-3 overflow-x-auto font-mono text-sm">{fuente}</pre>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={contenedor} className="flex justify-center" />
      <AbrirAparte contenedor={contenedor} />
    </div>
  );
}

/**
 * Abrir el diagrama solo, en una pestaña.
 *
 * Mermaid dibuja **SVG en línea**, no una `<img>`: por eso el clic derecho no
 * ofrece «abrir imagen en una pestaña nueva». No hay archivo que abrir — el
 * dibujo lo acaba de construir el navegador.
 *
 * Se resuelve sin exportar nada ni añadir un paso de compilación: se serializa
 * el SVG que ya está en pantalla, se envuelve en un `Blob` y se abre esa URL.
 * Se ve el mismo dibujo, a pantalla completa, con el zoom del navegador y
 * guardable con `⌘S`. Y como sale de lo que hay renderizado, **nunca puede
 * quedar desincronizado con la lámina**, que es lo que pasaría con un `.svg`
 * exportado a mano.
 *
 * Va sobre el propio diagrama y en gris tenue: proyectado no debe competir
 * con el dibujo, pero tiene que estar donde uno lo busca.
 */
function AbrirAparte({
  contenedor,
}: {
  contenedor: React.RefObject<HTMLDivElement | null>;
}) {
  const abrir = () => {
    const svg = contenedor.current?.querySelector("svg");
    if (!svg) return;

    const copia = svg.cloneNode(true) as SVGElement;
    // Sin el `max-width` que Mermaid le pone, y con fondo: abierto solo, un
    // SVG transparente sobre el blanco del navegador deja el texto claro
    // ilegible.
    copia.removeAttribute("style");
    copia.setAttribute("width", "100%");
    const fondo = getComputedStyle(document.body).backgroundColor;

    const doc =
      `<!doctype html><meta charset="utf-8">` +
      `<title>Diagrama · Taller 02</title>` +
      `<body style="margin:0;background:${fondo};display:flex;` +
      `align-items:center;justify-content:center;min-height:100vh">` +
      new XMLSerializer().serializeToString(copia) +
      `</body>`;

    const url = URL.createObjectURL(new Blob([doc], { type: "text/html" }));
    window.open(url, "_blank", "noopener");
    // No se revoca de inmediato: la pestaña todavía no ha leído el blob.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <button
      type="button"
      onClick={abrir}
      className="absolute right-0 top-0 rounded-md px-2 py-1 text-xs opacity-50 transition-opacity hover:opacity-100"
      style={{ color: "var(--tinta-suave)" }}
      title="Abrir el diagrama solo, en una pestaña nueva"
    >
      Abrir aparte ↗
    </button>
  );
}

/**
 * Hace que el diagrama ocupe el ancho de la lámina.
 *
 * Mermaid mide el texto y escribe un `max-width` **en el atributo `style` del
 * propio SVG**, con el ancho natural del dibujo. Eso está pensado para un
 * documento, donde un diagrama no debe estirarse más allá de su tamaño
 * cómodo; proyectado es lo contrario de lo que uno quiere. Un mapa de cinco
 * pasos ocupaba media pantalla y se leía a duras penas desde el fondo del
 * aula, mientras la lámina de al lado usaba el ancho completo. No es cuestión
 * de estética: son diagramas que se miran veinte segundos y hay que poder
 * leerlos de pie.
 *
 * Un `!important` en una clase también lo lograría, pero el atributo `style`
 * de un nodo que escribe otra librería se pisa mejor donde se ve.
 *
 * El tope de altura es lo que evita el efecto contrario: un diagrama alto
 * —el grafo del reto 4— estirado al ancho se saldría de la pantalla. Con el
 * `viewBox` que Mermaid ya pone, el navegador lo encoge dentro de la caja y lo
 * centra, sin deformarlo.
 */
function ocuparElAncho(contenedor: HTMLElement) {
  const svg = contenedor.querySelector("svg");
  if (!svg) return;
  svg.style.maxWidth = "100%";
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.maxHeight = "68vh";
}
