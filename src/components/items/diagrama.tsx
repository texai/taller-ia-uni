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

  return <div ref={contenedor} className="flex justify-center" />;
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
