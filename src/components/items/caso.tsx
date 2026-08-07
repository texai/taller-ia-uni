/**
 * El caso de negocio, como contenedor.
 *
 * No es una lámina de texto: es el marco dentro del que ocurren los cinco
 * retos, y tiene que reconocerse como tal de un vistazo. Por eso las cifras van
 * arriba y grandes —la escala es lo que la clase recuerda— y la prosa va
 * debajo, en bloques cortos.
 *
 * El contenido no viene en el ítem: lo declara `curso.yml` una sola vez y el
 * cargador lo baja hasta acá. Un caso declarado dos veces son dos casos que se
 * separan en cuanto alguien corrige uno.
 */

import type { Caso, ItemCaso } from "@/lib/tipos";
import { Marco } from "./marco";
import { Prosa } from "./texto";

export function Caso({ item }: { item: ItemCaso }) {
  // El caso puede venir escrito en el ítem o de un archivo que el cargador ya
  // resolvió; a esta altura da lo mismo, y si faltara el cargador habría
  // fallado con un mensaje mejor que cualquier cosa que se pudiera dibujar acá.
  const caso: Caso = {
    titulo: item.titulo ?? "",
    empresa: item.empresa ?? "",
    cifras: item.cifras ?? [],
    bloques: item.bloques ?? [],
  };

  return (
    <Marco ancho="ancho">
      <div
        className="rounded-2xl border-2 px-8 py-8 sm:px-10 sm:py-10"
        style={{
          borderColor: "var(--color-acento)",
          background: "var(--lienzo-alto)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--color-acento)" }}
        >
          El caso
        </p>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {caso.titulo}
        </h2>
        <p className="mt-3 text-xl leading-relaxed" style={{ color: "var(--tinta-suave)" }}>
          {caso.empresa}
        </p>

        {/* La escala, arriba y grande. Es el número que se repite ocho horas. */}
        <ul className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
          {caso.cifras.map((c: Caso["cifras"][number]) => (
            <li key={`${c.valor}-${c.unidad}`}>
              <p className="text-4xl font-semibold tabular-nums sm:text-5xl">
                {c.valor}
              </p>
              <p className="mt-1 text-base" style={{ color: "var(--tinta-suave)" }}>
                {c.unidad}
              </p>
              {c.nota && (
                <p className="text-sm" style={{ color: "var(--tinta-suave)" }}>
                  {c.nota}
                </p>
              )}
            </li>
          ))}
        </ul>

        {caso.bloques.length > 0 && (
          <div
            className="mt-9 grid gap-7 border-t pt-8 sm:grid-cols-2"
            style={{ borderColor: "var(--borde)" }}
          >
            {caso.bloques.map((b: Caso["bloques"][number]) => (
              <div key={b.titulo}>
                <h3
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--tinta-suave)" }}
                >
                  {b.titulo}
                </h3>
                <Prosa className="mt-2" tamano="lg">
                  {b.contenido}
                </Prosa>
              </div>
            ))}
          </div>
        )}
      </div>
    </Marco>
  );
}
