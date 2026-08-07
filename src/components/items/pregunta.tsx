"use client";

import { useState } from "react";

import type { ItemPregunta } from "@/lib/tipos";
import type { Revelado } from "@/lib/vivo";

/**
 * Una pregunta del docente, con sus tres estados.
 *
 * El orden importa y es toda la razón de que esto no sea un formulario más:
 *
 *   1. Respondiendo — se ve CUÁNTOS respondieron, nunca QUÉ respondieron.
 *   2. Revelado — por un clic del docente, o solo cuando ya respondieron todos.
 *   3. En vivo — ya revelado, el recuento sigue subiendo si alguien llega tarde.
 *
 * El primer estado es lo que hace que la pregunta mida algo. Si los resultados
 * se proyectan mientras la gente contesta, los que faltan copian al grupo.
 * El contador sí puede verse —sirve para saber cuándo cortar— porque no dice
 * hacia dónde va la respuesta. Ver `docs/CONVENTIONS.md` §12.
 */

function Envoltura({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col justify-center px-6">
      <p
        className="text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--color-acento)" }}
      >
        {etiqueta}
      </p>
      {children}
    </section>
  );
}

export function Pregunta({
  item,
  modoDocente = false,
  revelado,
  respondieron,
  conectados,
  onResponder,
  onRevelar,
}: {
  item: ItemPregunta;
  modoDocente?: boolean;
  revelado?: Revelado | null;
  /** Cuántos respondieron. Solo el docente lo ve antes del revelado. */
  respondieron?: number;
  conectados?: number;
  onResponder?: (valor: {
    opcion?: string;
    texto?: string;
    omitida?: boolean;
  }) => void;
  onRevelar?: () => void;
}) {
  const [mio, setMio] = useState<string | null>(null);
  const [abierta, setAbierta] = useState("");
  const [omitida, setOmitida] = useState(false);

  const publica = item.visibilidad === "publica";
  const puedeOmitir = item.permiteOmitir !== false;
  const respondida = mio !== null || omitida;
  const suyo = revelado?.preguntaId === item.id ? revelado : null;
  const total = suyo?.total ?? respondieron ?? 0;

  // "Todos" sale de Presence: nunca hay que declarar el tamaño del grupo.
  const todosRespondieron =
    typeof conectados === "number" && conectados > 0 && total >= conectados;

  function responder(valor: {
    opcion?: string;
    texto?: string;
    omitida?: boolean;
  }) {
    if (valor.omitida) setOmitida(true);
    else setMio(valor.opcion ?? valor.texto ?? "");
    onResponder?.(valor);
  }

  // ------------------------------------------------------------ resultados
  if (suyo) {
    const maximo = Math.max(1, ...Object.values(suyo.conteo));
    return (
      <Envoltura etiqueta="Resultados">
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {item.pregunta}
        </h2>

        {item.opciones?.length ? (
          <ul className="mt-10 space-y-4">
            {item.opciones.map((opcion) => {
              const n = suyo.conteo[opcion] ?? 0;
              const esCorrecta = suyo.correcta === opcion;
              return (
                <li key={opcion}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className="text-xl"
                      style={{
                        color: esCorrecta
                          ? "var(--color-acento)"
                          : "var(--tinta)",
                        fontWeight: esCorrecta ? 600 : 400,
                      }}
                    >
                      {opcion}
                      {esCorrecta && " ✓"}
                    </span>
                    <span
                      className="shrink-0 tabular-nums text-lg"
                      style={{ color: "var(--tinta-suave)" }}
                    >
                      {n}
                      {suyo.total > 0 &&
                        ` · ${Math.round((n / suyo.total) * 100)}%`}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-3 w-full rounded"
                    style={{ background: "var(--lienzo-alto)" }}
                  >
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${(n / maximo) * 100}%`,
                        background: esCorrecta
                          ? "var(--color-acento)"
                          : "var(--tinta-suave)",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="mt-10 space-y-3">
            {suyo.abiertas.map((t, i) => (
              <li
                key={i}
                className="border-l-2 pl-4 text-lg"
                style={{ borderColor: "var(--color-acento)" }}
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-base" style={{ color: "var(--tinta-suave)" }}>
          {suyo.total} respuesta{suyo.total === 1 ? "" : "s"}
          {suyo.omitidas > 0 &&
            ` · ${suyo.omitidas} prefirieron no responder`}
        </p>

        {/*
          La solución, y solo acá.

          Llega dentro del revelado, no con la carga de la página: antes de que
          el docente lo decida, esta explicación no existe en ningún navegador.
          Preguntar y mostrar el conteo sin decir por qué deja el momento a
          medias — la clase ve qué eligió la mayoría y no ve el razonamiento.
        */}
        {suyo.solucion && (
          <div
            className="mt-10 border-l-2 pl-6"
            style={{ borderColor: "var(--color-acento)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-acento)" }}
            >
              Por qué
            </p>
            <p className="mt-3 whitespace-pre-line text-xl leading-relaxed">
              {suyo.solucion.explicacion}
            </p>

            {suyo.solucion.descartes?.length ? (
              <ul className="mt-6 space-y-3">
                {suyo.solucion.descartes.map((d) => (
                  <li key={d.opcion} className="text-lg leading-relaxed">
                    <span
                      className="font-semibold"
                      style={{ color: "var(--tinta-suave)" }}
                    >
                      {d.opcion}
                    </span>
                    <span style={{ color: "var(--tinta-suave)" }}> — </span>
                    <span style={{ color: "var(--tinta-suave)" }}>{d.razon}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </Envoltura>
    );
  }

  // -------------------------------------------------------------- docente
  if (modoDocente) {
    return (
      <Envoltura etiqueta={publica ? "Pregunta a la clase" : "Pregunta"}>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          {item.pregunta}
        </h2>

        {item.opciones?.length ? (
          <ul className="mt-8 space-y-2">
            {item.opciones.map((o) => (
              <li
                key={o}
                className="text-xl"
                style={{
                  color:
                    item.respuesta === o
                      ? "var(--color-acento)"
                      : "var(--tinta-suave)",
                }}
              >
                · {o}
                {item.respuesta === o && " ✓"}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Lo único que se proyecta mientras responden: cuántos van. */}
        <p className="mt-12 text-5xl font-semibold tabular-nums sm:text-6xl">
          {total}
          {typeof conectados === "number" && conectados > 0 && (
            <span style={{ color: "var(--tinta-suave)" }}> / {conectados}</span>
          )}
        </p>
        <p className="mt-2 text-lg" style={{ color: "var(--tinta-suave)" }}>
          {todosRespondieron ? "Respondieron todos" : "han respondido"}
        </p>

        <button
          type="button"
          onClick={onRevelar}
          className="mt-8 self-start rounded-lg border px-6 py-3 text-lg font-medium"
          style={{
            borderColor: todosRespondieron
              ? "var(--color-acento)"
              : "var(--borde)",
            color: todosRespondieron
              ? "var(--color-acento)"
              : "var(--tinta-suave)",
          }}
        >
          Mostrar resultados
        </button>
      </Envoltura>
    );
  }

  // --------------------------------------------------------------- alumno
  return (
    <Envoltura etiqueta={publica ? "Pregunta a la clase" : "Pregunta"}>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
        {item.pregunta}
      </h2>

      {respondida ? (
        <div className="mt-10">
          <p className="text-xl sm:text-2xl" style={{ color: "var(--tinta-suave)" }}>
            {omitida
              ? "Anotado: prefieres no responder."
              : "Respuesta registrada."}
          </p>
          {publica && (
            <p className="mt-4 text-base" style={{ color: "var(--tinta-suave)" }}>
              Los resultados aparecen cuando el docente los muestre.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-10">
          {item.opciones?.length ? (
            <ul className="space-y-3">
              {item.opciones.map((opcion) => (
                <li key={opcion}>
                  <button
                    type="button"
                    onClick={() => responder({ opcion })}
                    className="w-full rounded-xl border px-6 py-4 text-left text-xl transition-colors hover:bg-black/20"
                    style={{
                      borderColor: "var(--borde)",
                      background: "var(--lienzo-alto)",
                    }}
                  >
                    {opcion}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (abierta.trim()) responder({ texto: abierta.trim() });
              }}
            >
              <textarea
                value={abierta}
                onChange={(e) => setAbierta(e.target.value)}
                rows={3}
                placeholder="Tu respuesta"
                className="w-full rounded-xl border px-5 py-4 text-xl"
                style={{
                  borderColor: "var(--borde)",
                  background: "var(--lienzo-alto)",
                  color: "var(--tinta)",
                }}
              />
              <button
                type="submit"
                disabled={!abierta.trim()}
                className="mt-4 rounded-lg border px-6 py-3 text-lg font-medium disabled:opacity-40"
                style={{
                  borderColor: "var(--color-acento)",
                  color: "var(--color-acento)",
                }}
              >
                Responder
              </button>
            </form>
          )}

          {puedeOmitir && (
            <button
              type="button"
              onClick={() => responder({ omitida: true })}
              className="mt-6 text-base underline"
              style={{ color: "var(--tinta-suave)" }}
            >
              Prefiero no responder
            </button>
          )}
        </div>
      )}
    </Envoltura>
  );
}
