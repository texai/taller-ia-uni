"use client";

import { useEffect, useRef, useState } from "react";

import { MAX_PREGUNTA, type PreguntaAlumno } from "@/lib/vivo";

/**
 * El botón de preguntar del alumno.
 *
 * Siempre a mano, discreto, en una esquina. Preguntar en voz alta cuesta —
 * sobre todo si uno cree que la pregunta es tonta— y bajar ese costo es todo
 * el punto de esto.
 *
 * El nombre es opcional y se recuerda entre preguntas: quien quiere firmar lo
 * escribe una vez, y quien no, no lo escribe nunca.
 */
export function Preguntar({
  onEnviar,
  itemTitulo,
  disponible,
}: {
  onEnviar: (texto: string, autor: string) => boolean;
  itemTitulo?: string;
  disponible: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [autor, setAutor] = useState("");
  const [enviada, setEnviada] = useState(false);
  const campo = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (abierto) campo.current?.focus();
  }, [abierto]);

  if (!disponible) return null;

  /**
   * El nombre se recupera al abrir, no al montar.
   *
   * Además de evitar un efecto que escribe estado, es más correcto: si el
   * alumno cambia su nombre en otra pestaña, la próxima vez que abra acá verá
   * el actual. Y la pregunta a medio escribir NO se guarda — nadie quiere que
   * le reaparezca media frase de hace media hora.
   */
  function abrir() {
    if (!autor) setAutor(window.localStorage.getItem("taller:autor") ?? "");
    setAbierto(true);
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!onEnviar(texto, autor)) return;
    window.localStorage.setItem("taller:autor", autor.trim());
    setTexto("");
    setEnviada(true);
    setAbierto(false);
    window.setTimeout(() => setEnviada(false), 4000);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="fixed bottom-36 right-6 z-30 rounded-full border px-5 py-3 text-sm font-medium shadow-lg"
        style={{
          borderColor: enviada ? "var(--color-acento)" : "var(--borde)",
          background: "var(--lienzo-alto)",
          color: enviada ? "var(--color-acento)" : "var(--tinta)",
        }}
      >
        {enviada ? "Enviada ✓" : "Preguntar"}
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center"
          style={{ background: "rgba(0,0,0,.6)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setAbierto(false);
          }}
        >
          <form
            onSubmit={enviar}
            className="w-full max-w-lg rounded-xl border p-6"
            style={{
              borderColor: "var(--borde)",
              background: "var(--lienzo)",
            }}
          >
            <h2 className="text-xl font-semibold">Preguntar</h2>
            {itemTitulo && (
              <p className="mt-1 text-sm" style={{ color: "var(--tinta-suave)" }}>
                Sobre: {itemTitulo}
              </p>
            )}

            <textarea
              ref={campo}
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, MAX_PREGUNTA))}
              rows={4}
              placeholder="Tu pregunta"
              className="mt-4 w-full rounded-lg border px-4 py-3 text-base"
              style={{
                borderColor: "var(--borde)",
                background: "var(--lienzo-alto)",
                color: "var(--tinta)",
              }}
            />
            <p
              className="mt-1 text-right text-xs tabular-nums"
              style={{ color: "var(--tinta-suave)" }}
            >
              {texto.length} / {MAX_PREGUNTA}
            </p>

            <input
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="mt-2 w-full rounded-lg border px-4 py-2.5 text-base"
              style={{
                borderColor: "var(--borde)",
                background: "var(--lienzo-alto)",
                color: "var(--tinta)",
              }}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--tinta-suave)" }}>
              Solo la ve el docente, y no se proyecta.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={!texto.trim()}
                className="rounded-lg border px-5 py-2.5 font-medium disabled:opacity-40"
                style={{
                  borderColor: "var(--color-acento)",
                  color: "var(--color-acento)",
                }}
              >
                Enviar
              </button>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-lg border px-5 py-2.5"
                style={{ borderColor: "var(--borde)" }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/**
 * Las preguntas que le llegan al docente.
 *
 * Cerrado por omisión y con un contador discreto: esta pantalla se proyecta.
 * Que una pregunta aparezca sola delante de toda la clase es exactamente lo
 * que hace que la siguiente no se escriba.
 */
export function PanelPreguntas({
  preguntas,
  onAtender,
}: {
  preguntas: PreguntaAlumno[];
  onAtender: (id: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="shrink-0 rounded-md border px-3 py-1 text-xs"
        style={{
          borderColor: preguntas.length
            ? "var(--color-aviso)"
            : "var(--borde)",
          color: preguntas.length
            ? "var(--color-aviso)"
            : "var(--tinta-suave)",
        }}
        title="Preguntas de los alumnos"
      >
        {preguntas.length ? `${preguntas.length} ✋` : "✋"}
      </button>

      {abierto && (
        <div
          className="fixed bottom-16 right-4 z-40 max-h-[70vh] w-[26rem] overflow-y-auto rounded-xl border p-4 shadow-2xl"
          style={{
            borderColor: "var(--borde)",
            background: "var(--lienzo-alto)",
          }}
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Preguntas</h2>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="text-xs underline"
              style={{ color: "var(--tinta-suave)" }}
            >
              cerrar
            </button>
          </div>

          {preguntas.length === 0 ? (
            <p className="mt-4 text-sm" style={{ color: "var(--tinta-suave)" }}>
              Todavía no hay preguntas.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {preguntas.map((p) => (
                <li
                  key={p.id}
                  className="border-l-2 pl-3"
                  style={{ borderColor: "var(--color-aviso)" }}
                >
                  <p className="text-base leading-relaxed">{p.texto}</p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    {p.autor ?? "Anónimo"}
                    {p.itemTitulo ? ` · sobre "${p.itemTitulo}"` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => onAtender(p.id)}
                    className="mt-2 text-xs underline"
                    style={{ color: "var(--color-acento)" }}
                  >
                    Atendida
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
