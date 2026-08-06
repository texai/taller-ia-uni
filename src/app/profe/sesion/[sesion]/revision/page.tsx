import Link from "next/link";
import { notFound } from "next/navigation";

import { cargarCurso, minutosDe } from "@/lib/contenido";
import { RenderizarItem } from "@/components/items";
import { FAMILIA } from "@/lib/tipos";

/**
 * La vista de revisión: la sesión entera, de corrido.
 *
 * NO es la vista de dictado. Esa va de a un ítem, con flechas y sincronía, y
 * llega con el batch 6. Esta existe para escribir material: ver ochenta ítems
 * en una sola página es la única forma razonable de darse cuenta de que dos
 * unidades explican lo mismo, o de que a la tercera hora no queda nada
 * proyectable.
 *
 * Muestra el contenido COMPLETO, incluidas las notas privadas del docente. Es
 * deliberado y es la razón de que el batch 7 tenga que protegerla: hasta
 * entonces, no compartir esta URL.
 */

export const dynamic = "force-dynamic";



export default async function Revision({
  params,
}: {
  params: Promise<{ sesion: string }>;
}) {
  const { sesion: idSesion } = await params;
  const curso = cargarCurso();
  const sesion = curso.sesiones.find((s) => s.id === idSesion);

  if (!sesion) notFound();

  const total = sesion.unidades.reduce((t, u) => t + minutosDe(u), 0);

  return (
    <main className="pb-32">
      <header
        className="border-b px-6 py-10"
        style={{ borderColor: "var(--borde)" }}
      >
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/profe/sesion/${sesion.id}`}
            className="text-sm underline"
            style={{ color: "var(--tinta-suave)" }}
          >
            ← Volver a la vista de dictado
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Sesión {sesion.numero} · {sesion.titulo}
          </h1>
          <p className="mt-2" style={{ color: "var(--tinta-suave)" }}>
            {sesion.fecha} · {sesion.horaInicio}–{sesion.horaFin} ·{" "}
            {sesion.unidades.length} unidades · {total} min
          </p>
          <p
            className="mt-6 rounded-lg border border-dashed px-4 py-3 text-sm"
            style={{ borderColor: "var(--color-aviso)", color: "var(--color-aviso)" }}
          >
            Vista de revisión. Muestra el material completo, incluidas las notas
            privadas.
          </p>
        </div>
      </header>

      {sesion.unidades.map((unidad) => (
        <section key={unidad.id}>
          <div
            className="mt-20 border-y px-6 py-10"
            style={{
              borderColor: "var(--borde)",
              background: "var(--lienzo-alto)",
            }}
          >
            <div className="mx-auto max-w-4xl">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-acento)" }}
              >
                {unidad.tipo} · {minutosDe(unidad)} min · {unidad.items.length}{" "}
                ítems
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {unidad.titulo}
              </h2>

              {unidad.objetivos?.length ? (
                <div className="mt-6">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    Objetivos
                  </p>
                  <ul className="mt-2 space-y-1">
                    {unidad.objetivos.map((o) => (
                      <li key={o} className="text-lg">
                        · {o}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {unidad.requisitos?.length ? (
                <div className="mt-5">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    Requisitos
                  </p>
                  <ul className="mt-2 space-y-1">
                    {unidad.requisitos.map((r) => (
                      <li
                        key={r}
                        className="text-base"
                        style={{ color: "var(--tinta-suave)" }}
                      >
                        · {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-20 pt-20">
            {unidad.items.map((item) => (
              <article key={item.id}>
                <div className="mx-auto mb-4 max-w-4xl px-6">
                  <p
                    className="font-mono text-xs"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    {item.id} · {item.tipo}
                    <span
                      style={{
                        color:
                          FAMILIA[item.tipo] === "dictado"
                            ? "var(--color-aviso)"
                            : "var(--tinta-suave)",
                      }}
                    >
                      {" "}
                      · {FAMILIA[item.tipo]}
                    </span>
                    {item.minutos ? ` · ${item.minutos} min` : ""}
                  </p>
                </div>

                <RenderizarItem
                  item={item}
                  sesion={sesion}
                  unidadActual={unidad.id}
                />

                {item.notas && (
                  <div className="mx-auto mt-5 max-w-4xl px-6">
                    <div
                      className="rounded-lg border-l-2 py-2 pl-4"
                      style={{ borderColor: "var(--color-aviso)" }}
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "var(--color-aviso)" }}
                      >
                        Notas del docente
                      </p>
                      <p
                        className="mt-1 whitespace-pre-wrap text-base leading-relaxed"
                        style={{ color: "var(--tinta-suave)" }}
                      >
                        {item.notas}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
