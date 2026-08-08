"use client";

import { useEffect, useRef, useState } from "react";

import type { ItemLectura } from "@/lib/tipos";
import { comoCuentaRegresiva } from "@/lib/reloj";
import { enlaceALab } from "@/lib/sitio";
import { aPowerShell } from "@/lib/windows";
import { Copiar } from "./copiar";
import { QuéSignifica } from "./marco";
import { Prosa } from "./texto";

/** Cuánto mueve cada pulsación de más/menos tiempo. */
const PASO_MINUTOS = 1;

/**
 * El reloj de una ventana de lectura.
 *
 * Se separa del resto de la lámina porque es lo único vivo que hay en ella, y
 * porque su estado no es el tiempo restante sino **hasta cuándo**: guardar los
 * segundos que faltan obliga a restar en cada tic y acumula el error de cada
 * intervalo. Guardando el instante final, el tic solo lee el reloj del sistema
 * y la cuenta no se desvía aunque la pestaña se duerma.
 */
function Cuenta({ minutos }: { minutos: number }) {
  // El instante en que se acaba, no los segundos que faltan: restando en cada
  // tic se acumula el error de cada intervalo, y la cuenta se desvía si la
  // pestaña se duerme. En pausa se guarda lo que faltaba, y al seguir se
  // convierte otra vez en un instante.
  const fin = useRef<number | null>(null);
  const congelado = useRef<number | null>(null);
  const [reinicios, setReinicios] = useState(0);

  // Lo único que se pinta. Se escribe desde el intervalo y nunca desde el
  // cuerpo del efecto: `Date.now()` no vale lo mismo en el servidor que en el
  // cliente, y pintarlo en ambos sería una discrepancia de hidratación.
  const [restante, setRestante] = useState<number | null>(null);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    fin.current = Date.now() + minutos * 60_000;
    congelado.current = null;

    // Una sola expresión, y el único sitio del componente que escribe
    // `restante`. El primer tic va en el siguiente turno del bucle de eventos:
    // durante ese instante no hay reloj, que es preferible a pintar uno con la
    // hora del servidor y corregirlo al hidratar.
    const tic = () =>
      setRestante(
        congelado.current !== null
          ? congelado.current / 1000
          : fin.current !== null
            ? (fin.current - Date.now()) / 1000
            : null,
      );

    const primero = setTimeout(tic, 0);
    const repetido = setInterval(tic, 250);
    return () => {
      clearTimeout(primero);
      clearInterval(repetido);
    };
  }, [minutos, reinicios]);

  // Los tres controles mueven referencias, no estado: el intervalo ya está
  // corriendo y recoge el cambio en el siguiente cuarto de segundo. Pedir un
  // repintado además del suyo sería pedir dos.
  const mover = (deltaMinutos: number) => {
    const delta = deltaMinutos * 60_000;
    if (congelado.current !== null) {
      congelado.current = Math.max(0, congelado.current + delta);
      return;
    }
    if (fin.current !== null) fin.current += delta;
  };

  const alternarPausa = () => {
    if (congelado.current !== null) {
      fin.current = Date.now() + congelado.current;
      congelado.current = null;
      setPausado(false);
      return;
    }
    if (fin.current === null) return;
    congelado.current = Math.max(0, fin.current - Date.now());
    setPausado(true);
  };

  const terminado = restante !== null && restante <= 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="whitespace-nowrap text-5xl font-semibold sm:text-6xl"
        style={{
          color: terminado ? "var(--color-aviso)" : "var(--tinta)",
          // Sin esto la cifra cambia de ancho al pasar de 10:00 a 9:59 y la
          // lámina entera da un salto cada minuto.
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {restante === null ? "—:—" : comoCuentaRegresiva(restante)}
      </p>

      {/*
        Los controles se dibujan para todos. Esconderlos exigiría saber acá
        quién está mirando, y no hace falta: la lámina se proyecta desde la
        pantalla del docente, y que un alumno mueva su propio reloj no le hace
        daño a nadie — cada pantalla cuenta lo suyo.
      */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Boton onClick={() => mover(-PASO_MINUTOS)} etiqueta="−1 min" />
        <Boton onClick={() => mover(PASO_MINUTOS)} etiqueta="+1 min" />
        <Boton onClick={alternarPausa} etiqueta={pausado ? "Seguir" : "Pausa"} />
        <Boton
          onClick={() => {
            setPausado(false);
            setReinicios((n) => n + 1);
          }}
          etiqueta="Reiniciar"
        />
      </div>

      <p className="text-xs" style={{ color: "var(--tinta-suave)" }}>
        {minutos} min propuestos
        {pausado ? " · en pausa" : ""}
        {terminado && !pausado ? " · se acabó el rato" : ""}
      </p>
    </div>
  );
}

function Boton({
  onClick,
  etiqueta,
}: {
  onClick: () => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border px-3 py-1.5 text-sm font-medium tabular-nums transition-colors"
      style={{ borderColor: "var(--borde)", color: "var(--tinta-suave)" }}
    >
      {etiqueta}
    </button>
  );
}

/**
 * Una ventana para leer código y ejecutar.
 *
 * La forma sale de para qué existe: a la izquierda **qué hacer** —los archivos
 * con su enlace y los comandos—, a la derecha **cuánto tiempo queda**. No lleva
 * el aire de las otras interrupciones porque no es una pausa: durante estos
 * minutos la sala está trabajando y necesita ver la lista entera sin
 * desplazarse.
 */
export function Lectura({ item }: { item: ItemLectura }) {
  const archivos = item.archivos ?? [];
  const comandos = item.comandos ?? [];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8">
      <p
        className="text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--color-acento)" }}
      >
        Lean y ejecuten
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {item.titulo}
      </h2>
      {item.entradilla && (
        <p className="mt-2 text-lg" style={{ color: "var(--tinta-suave)" }}>
          {item.entradilla}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-7">
          {archivos.length > 0 && (
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--tinta-suave)" }}
              >
                Abran estos archivos
              </p>
              <ul className="mt-3 flex flex-col gap-3">
                {archivos.map((a) => (
                  <li
                    key={a.ruta + (a.lineas ?? "")}
                    className="border-l-2 pl-4"
                    style={{ borderColor: "var(--color-acento)" }}
                  >
                    <a
                      href={enlaceALab(a.ruta, a.lineas)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-base underline underline-offset-4"
                      style={{ color: "var(--color-acento)" }}
                    >
                      {a.ruta}
                      {a.lineas ? `  ${a.lineas}` : ""}
                    </a>
                    <Prosa className="mt-1" tamano="base">
                      {a.porque}
                    </Prosa>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {comandos.length > 0 && (
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--tinta-suave)" }}
              >
                Y corran esto
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {comandos.map((c) => {
                  // La ventana de lectura es donde la sala teclea de verdad,
                  // cada uno en su máquina: si acá falta la línea de Windows,
                  // media clase se queda mirando. Ver `lib/windows.ts`.
                  const win = aPowerShell(c);
                  return (
                    <li
                      key={c}
                      className="rounded-lg border px-4 py-2.5 font-mono text-sm"
                      style={{
                        borderColor: "var(--borde)",
                        background: "var(--lienzo-alto)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="min-w-0 flex-1">
                          <span style={{ color: "var(--tinta-suave)" }}>$ </span>
                          {c}
                        </span>
                        <Copiar texto={c} />
                      </div>
                      {win && (
                        <div className="mt-1.5 flex items-baseline gap-2.5">
                          <span
                            className="shrink-0 font-sans text-[10px] font-semibold uppercase tracking-widest"
                            style={{ color: "var(--tinta-suave)" }}
                          >
                            Windows
                          </span>
                          <span
                            className="min-w-0 flex-1"
                            style={{ color: "var(--tinta-suave)" }}
                          >
                            {win}
                          </span>
                          <Copiar texto={win} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {item.observar && (
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-aviso)" }}
              >
                En qué fijarse
              </p>
              <Prosa className="mt-2" tamano="lg">
                {item.observar}
              </Prosa>
              {item.significa && <QuéSignifica significa={item.significa} />}
            </div>
          )}
        </div>

        <div
          className="flex h-fit items-start justify-center rounded-xl border p-6"
          style={{
            borderColor: "var(--borde)",
            background: "var(--lienzo-alto)",
          }}
        >
          <Cuenta minutos={item.minutos} />
        </div>
      </div>
    </section>
  );
}
