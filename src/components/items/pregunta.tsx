"use client";

import { useEffect, useState } from "react";

import type { ItemPregunta } from "@/lib/tipos";
import { Prosa } from "./texto";
import { SEGUNDOS_POR_DEFECTO, type Apertura, type Revelado } from "@/lib/vivo";

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

/** La cuenta atrás, con su barra. Igual en las dos pantallas. */
function Reloj({
  restan,
  segundos,
}: {
  restan: number;
  segundos: number;
}) {
  const fraccion = Math.max(0, Math.min(1, restan / Math.max(1, segundos)));
  // Los últimos diez segundos se ponen en ámbar. Es el único momento en que el
  // color dice algo que el número no dice ya: que hay que decidir ahora.
  const color = restan <= 10 ? "var(--color-aviso)" : "var(--color-acento)";
  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between">
        <span
          className="text-3xl font-semibold tabular-nums"
          style={{ color }}
        >
          {Math.ceil(restan)}s
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded"
        style={{ background: "var(--lienzo-alto)" }}
      >
        <div
          className="h-full rounded"
          style={{
            width: `${fraccion * 100}%`,
            background: color,
            // Sin transición: la barra se redibuja cinco veces por segundo y
            // animar cada paso la deja siempre por detrás de la cifra.
          }}
        />
      </div>
    </div>
  );
}

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

/**
 * Cuánto queda, en segundos, y el efecto que lo va bajando.
 *
 * El plazo llega como un instante y no como una duración, así que las dos
 * pantallas cuentan lo mismo aunque sus relojes no coincidan al segundo y
 * aunque una se haya conectado a mitad.
 */
function useCuentaAtras(hasta: number | null): number | null {
  const [restan, setRestan] = useState<number | null>(null);

  useEffect(() => {
    // El primer valor va en el siguiente turno del bucle de eventos y no en el
    // cuerpo del efecto: escribir estado ahí encadena renders, y además
    // `Date.now()` no vale lo mismo en el servidor que en el cliente.
    const tic = () =>
      setRestan(hasta === null ? null : Math.max(0, (hasta - Date.now()) / 1000));
    const primero = setTimeout(tic, 0);
    const id = hasta === null ? null : setInterval(tic, 200);
    return () => {
      clearTimeout(primero);
      if (id) clearInterval(id);
    };
  }, [hasta]);

  return hasta === null ? null : restan;
}

export function Pregunta({
  item,
  modoDocente = false,
  revelado,
  respondieron,
  conectados,
  onResponder,
  onRevelar,
  apertura,
  onAbrir,
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
  /** La pregunta abierta ahora mismo, si es esta. */
  apertura?: Apertura | null;
  onAbrir?: (segundos: number) => void;
}) {
  const [mio, setMio] = useState<string | null>(null);
  const [abierta, setAbierta] = useState("");
  const [omitida, setOmitida] = useState(false);
  const [segundos, setSegundos] = useState(
    item.segundos ?? SEGUNDOS_POR_DEFECTO,
  );

  const publica = item.visibilidad === "publica";
  const puedeOmitir = item.permiteOmitir !== false;
  const respondida = mio !== null || omitida;
  const suyo = revelado?.preguntaId === item.id ? revelado : null;
  const total = suyo?.total ?? respondieron ?? 0;

  const suya = apertura?.preguntaId === item.id ? apertura : null;
  const restan = useCuentaAtras(suya?.hasta ?? null);
  /** Admite respuestas: alguien la abrió y todavía le queda tiempo. */
  const enJuego = Boolean(suya) && restan !== null && restan > 0;

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
        <Prosa className="mt-4" tamano="titulo">
          {item.pregunta}
        </Prosa>

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
            {/*
              Markdown, no texto plano. Las explicaciones vienen con negritas y
              con `código` desde el primer día, y proyectadas como texto crudo
              se leen con los asteriscos puestos — que es peor que no
              destacarlos, porque el ojo tropieza con ellos.
            */}
            <Prosa className="mt-3" tamano="xl">
              {suyo.solucion.explicacion}
            </Prosa>

            {suyo.solucion.descartes?.length ? (
              <ul className="mt-6 space-y-3">
                {suyo.solucion.descartes.map((d) => (
                  <li key={d.opcion} style={{ color: "var(--tinta-suave)" }}>
                    <Prosa tamano="lg">
                      {`**${d.opcion}** — ${d.razon}`}
                    </Prosa>
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
        <Prosa className="mt-4" tamano="titulo">
          {item.pregunta}
        </Prosa>

        {/*
          Las opciones, todas iguales. **Acá NO se marca la correcta.**

          Esta rama es la pantalla que se proyecta —`Dictado` con
          `modoDocente`—, y el curso se dicta compartiendo pantalla. Pintaba la
          respuesta en verde y con un ✓ **antes de enviar la pregunta**, así que
          la clase la leía a la vez que el enunciado y preguntar dejaba de medir
          nada.

          Quien sí necesita verla es el docente, y la tiene en el mando: ahí
          sale «Respuesta correcta: …», junto a las notas privadas. Es
          exactamente el reparto de §14 — lo que no puede proyectarse vive en la
          pantalla que nadie más ve.

          El ✓ vuelve en el revelado, arriba, cuando ya respondieron.
        */}
        {item.opciones?.length ? (
          <ul className="mt-8 space-y-2">
            {item.opciones.map((o) => (
              <li
                key={o}
                className="text-xl"
                style={{ color: "var(--tinta-suave)" }}
              >
                · {o}
              </li>
            ))}
          </ul>
        ) : null}

        {/*
          Antes de enviarla no hay contador ni cuenta atrás: la lámina es el
          enunciado y el plazo que se le va a dar. Es el mismo momento que
          vive la clase, y por eso el botón dice «enviar» y no «empezar».
        */}
        {!suya ? (
          <div className="mt-12">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--tinta-suave)" }}
            >
              Tiempo para responder
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSegundos((s) => Math.max(10, s - 15))}
                className="rounded-md border px-3 py-1.5 text-lg tabular-nums"
                style={{ borderColor: "var(--borde)" }}
              >
                −15
              </button>
              <span className="text-4xl font-semibold tabular-nums">
                {segundos}s
              </span>
              <button
                type="button"
                onClick={() => setSegundos((s) => Math.min(600, s + 15))}
                className="rounded-md border px-3 py-1.5 text-lg tabular-nums"
                style={{ borderColor: "var(--borde)" }}
              >
                +15
              </button>
            </div>

            <button
              type="button"
              onClick={() => onAbrir?.(segundos)}
              className="mt-8 rounded-lg border px-6 py-3 text-lg font-medium"
              style={{
                borderColor: "var(--color-acento)",
                color: "var(--color-acento)",
              }}
            >
              Enviar pregunta a la clase
            </button>
          </div>
        ) : (
          <>
            {restan !== null && restan > 0 && (
              <Reloj restan={restan} segundos={suya.segundos} />
            )}

            {/* Mientras responden se proyecta cuántos van, nunca qué eligieron. */}
            <p className="mt-8 text-5xl font-semibold tabular-nums sm:text-6xl">
              {total}
              {typeof conectados === "number" && conectados > 0 && (
                <span style={{ color: "var(--tinta-suave)" }}>
                  {" "}
                  / {conectados}
                </span>
              )}
            </p>
            <p className="mt-2 text-lg" style={{ color: "var(--tinta-suave)" }}>
              {todosRespondieron ? "Respondieron todos" : "han respondido"}
            </p>

            {/*
              Cortar antes de tiempo cuando ya respondieron todos: esperar a
              que se acabe el reloj con la sala mirando no mide nada mejor.
            */}
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
              Cerrar y mostrar resultados
            </button>
          </>
        )}
      </Envoltura>
    );
  }

  // --------------------------------------------------------------- alumno
  return (
    <Envoltura etiqueta={publica ? "Pregunta a la clase" : "Pregunta"}>
      <Prosa className="mt-4" tamano="titulo">
        {item.pregunta}
      </Prosa>

      {/*
        Tres estados, y el primero es nuevo: **la pregunta se lee antes de
        poder contestarla.** Hasta que el docente la envía no hay dónde pulsar,
        y esos segundos son justamente para pensarla. Mostrar el enunciado y
        las opciones a la vez es lo que hace que media sala elija antes de
        terminar de leer.
      */}
      {!enJuego && !respondida ? (
        <div className="mt-10">
          <p
            className="text-xl sm:text-2xl"
            style={{ color: "var(--tinta-suave)" }}
          >
            {suya
              ? "Se acabó el tiempo. Los resultados salen enseguida."
              : "Léela. En un momento se abre para responder."}
          </p>
        </div>
      ) : respondida ? (
        <div className="mt-10">
          {restan !== null && restan > 0 && (
            <Reloj restan={restan} segundos={suya?.segundos ?? 1} />
          )}
          <p
            className="mt-6 text-xl sm:text-2xl"
            style={{ color: "var(--tinta-suave)" }}
          >
            {omitida
              ? "Anotado: prefieres no responder."
              : "Respuesta registrada."}
          </p>
          {publica && (
            <p className="mt-4 text-base" style={{ color: "var(--tinta-suave)" }}>
              Los resultados salen cuando se acabe el tiempo.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-10">
          {restan !== null && (
            <div className="mb-8">
              <Reloj restan={restan} segundos={suya?.segundos ?? 1} />
            </div>
          )}
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
