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
    <div
      ref={contenedor}
      className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full"
    />
  );
}
