import type { ItemDiff } from "@/lib/tipos";
import { diferencia, recuento } from "@/lib/diff";
import { enlaceALab, rutaDeLab } from "@/lib/sitio";
import { Marco } from "./marco";
import { Prosa } from "./texto";

/** El prefijo de cada línea, como en cualquier diff que hayan visto. */
const MARCA = { igual: " ", quita: "−", pone: "+" } as const;

/**
 * Un cambio, en antes y después.
 *
 * Va en una sola columna y no en dos paneles enfrentados. Dos paneles obligan
 * a la vista a saltar de un lado al otro buscando la línea equivalente, y
 * proyectado eso no funciona: lo que hay que ver es una línea que aparece
 * entre otras que no se movieron.
 *
 * Sin resaltado de sintaxis, también a propósito. El color acá significa
 * «esto cambió», y dos sistemas de color en el mismo bloque compiten: el
 * fragmento se vuelve un arcoíris y la única distinción que importa se pierde.
 */
export function Diff({ item }: { item: ItemDiff }) {
  const lineas = diferencia(item.antes, item.despues);
  const { quita, pone } = recuento(lineas);
  const archivo = item.ruta ? rutaDeLab(item.ruta) : null;

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--borde)" }}
      >
        <div
          className="flex flex-wrap items-baseline gap-x-3 border-b px-5 py-2.5 font-mono text-sm"
          style={{
            borderColor: "var(--borde)",
            background: "var(--lienzo-alto)",
            color: "var(--tinta-suave)",
          }}
        >
          {item.ruta &&
            (archivo ? (
              <a
                href={enlaceALab(archivo)}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
                style={{ color: "var(--color-acento)" }}
              >
                {item.ruta}
              </a>
            ) : (
              <span>{item.ruta}</span>
            ))}
          <span style={{ color: "var(--color-alerta)" }}>−{quita}</span>
          <span style={{ color: "var(--color-acento)" }}>+{pone}</span>
        </div>

        <div
          className="overflow-x-auto py-3 text-[15px] leading-relaxed"
          style={{ background: "var(--lienzo-alto)" }}
        >
          <pre className="font-mono">
            {lineas.map((l, i) => (
              <div
                key={`${i}-${l.texto}`}
                className="px-5"
                style={{
                  // Un fondo tenue y no letras de color: la línea entera es lo
                  // que cambió, y así se ve de un vistazo cuál es aunque el
                  // texto sea largo.
                  background:
                    l.signo === "quita"
                      ? "color-mix(in srgb, var(--color-alerta) 12%, transparent)"
                      : l.signo === "pone"
                        ? "color-mix(in srgb, var(--color-acento) 14%, transparent)"
                        : "transparent",
                  color:
                    l.signo === "igual" ? "var(--tinta-suave)" : "var(--tinta)",
                }}
              >
                <span
                  aria-hidden
                  className="mr-3 select-none"
                  style={{ color: "var(--tinta-suave)" }}
                >
                  {MARCA[l.signo]}
                </span>
                {l.texto || " "}
              </div>
            ))}
          </pre>
        </div>
      </div>

      {item.explicacion && (
        <Prosa className="mt-5" tamano="lg">
          {item.explicacion}
        </Prosa>
      )}
    </Marco>
  );
}
