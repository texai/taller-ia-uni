/**
 * El marco común a todos los ítems, y las piezas que comparten.
 *
 * Todo lo de acá está calibrado para proyectarse. Un tamaño de cuerpo que se
 * ve cómodo a medio metro de un monitor es ilegible desde la última fila de un
 * aula, y ese es el error de diseño más caro que puede tener esta aplicación:
 * no se nota mientras la construyes y se nota entera el sábado.
 */

import type { ReactNode } from "react";

export function Marco({
  titulo,
  entradilla,
  children,
  ancho = "normal",
}: {
  titulo?: string;
  entradilla?: string;
  children: ReactNode;
  /** `ancho` para tablas y código; `estrecho` para prosa. */
  ancho?: "normal" | "ancho" | "estrecho";
}) {
  const maximo =
    ancho === "ancho"
      ? "max-w-6xl"
      : ancho === "estrecho"
        ? "max-w-2xl"
        : "max-w-4xl";

  return (
    <section className={`mx-auto w-full ${maximo} px-6`}>
      {titulo && (
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {titulo}
        </h2>
      )}
      {entradilla && (
        <p
          className="mt-2 text-lg sm:text-xl"
          style={{ color: "var(--tinta-suave)" }}
        >
          {entradilla}
        </p>
      )}
      <div className={titulo || entradilla ? "mt-8" : ""}>{children}</div>
    </section>
  );
}

/** Una etiqueta pequeña, para nombrar una parte sin competir con ella. */
export function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest"
      style={{ color: "var(--tinta-suave)" }}
    >
      {children}
    </p>
  );
}

/** Caja con borde, el contenedor de casi todo. */
export function Caja({
  children,
  tono,
  className = "",
}: {
  children: ReactNode;
  tono?: "acento" | "alerta" | "aviso";
  className?: string;
}) {
  const color =
    tono === "acento"
      ? "var(--color-acento)"
      : tono === "alerta"
        ? "var(--color-alerta)"
        : tono === "aviso"
          ? "var(--color-aviso)"
          : "var(--borde)";

  return (
    <div
      className={`rounded-xl border p-6 sm:p-7 ${className}`}
      style={{ borderColor: color, background: "var(--lienzo-alto)" }}
    >
      {children}
    </div>
  );
}
