/**
 * El marco común a todos los ítems, y las piezas que comparten.
 *
 * Todo lo de acá está calibrado para proyectarse. Un tamaño de cuerpo que se
 * ve cómodo a medio metro de un monitor es ilegible desde la última fila de un
 * aula, y ese es el error de diseño más caro que puede tener esta aplicación:
 * no se nota mientras la construyes y se nota entera el sábado.
 */

import type { ReactNode } from "react";

import type { Significado } from "@/lib/tipos";

export function Marco({
  titulo,
  entradilla,
  etiqueta,
  children,
  ancho = "normal",
}: {
  titulo?: string;
  entradilla?: string;
  /**
   * El nombre del tipo de lámina, encima del título.
   *
   * No lo lleva casi ninguna, y es a propósito: un `markdown` o una `tabla` se
   * reconocen solos, y anunciar «Tabla» encima de una tabla es ruido. Vale la
   * pena cuando la lámina **no dice sola lo que es** — un glosario se ve como
   * cuatro párrafos con un borde, y sin la palabra puesta pasa por prosa.
   *
   * Mismo estilo que el de la lámina de pregunta, que es la otra que lo lleva:
   * pequeño, en versalitas y en el color de acento. Es una ceja, no un título.
   */
  etiqueta?: string;
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
      {etiqueta && (
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--color-acento)" }}
        >
          {etiqueta}
        </p>
      )}
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

/**
 * Qué significa lo que acaba de salir en pantalla.
 *
 * Va **debajo del resultado y en la lámina**, no en las notas: la traducción
 * de «sesgo +4.7%» a «36,981 unidades de más en almacén» es justo lo que la
 * sala deja de hacer sola a media tarde, y es la mitad de para qué existe el
 * taller.
 *
 * Dos columnas y no un párrafo, porque son dos preguntas distintas y la
 * primera es la que se olvida: **qué le cuesta esto a la cadena** y **qué le
 * pasó al modelo**. Puestas al lado, la ausencia de una se ve.
 */
export function QuéSignifica({ significa }: { significa: Significado }) {
  return (
    <div className="mt-6">
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--color-acento)" }}
      >
        Qué significa esto
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["Para el negocio", significa.negocio],
            ["Para el modelo", significa.modelo],
          ] as const
        ).map(([nombre, texto]) => (
          <div
            key={nombre}
            className="border-l-2 pl-4"
            style={{ borderColor: "var(--borde)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--tinta-suave)" }}
            >
              {nombre}
            </p>
            <p className="mt-1 text-lg leading-relaxed">{texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
