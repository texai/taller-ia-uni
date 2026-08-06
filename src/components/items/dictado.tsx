"use client";

import { useEffect, useState } from "react";

import type {
  ItemAsistencia,
  ItemPausaPreguntas,
  ItemReceso,
} from "@/lib/tipos";
import { ahora, comoCuentaRegresiva, horaDeRegreso } from "@/lib/reloj";
import { Caja, Etiqueta, Marco } from "./marco";

/**
 * Los ítems de dictado interrumpen; no informan.
 *
 * Por eso se ven distintos de un vistazo: ocupan la pantalla, llevan su propio
 * color, y no compiten con el contenido. Un receso que se parece a una lámina
 * más es un receso que la mitad de la clase no toma.
 */
function Interrupcion({
  etiqueta,
  color,
  children,
}: {
  etiqueta: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col justify-center px-6"
      style={{ borderColor: color }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color }}
      >
        {etiqueta}
      </p>
      {children}
    </section>
  );
}

/**
 * Receso, con cuenta regresiva y la hora de regreso.
 *
 * El reloj arranca al montar y no al construir: la hora de regreso depende de
 * cuándo se llegó al ítem, no de cuándo se desplegó la aplicación. Por eso
 * también empieza vacío y se rellena tras la hidratación — pintar una hora en
 * el servidor y otra en el cliente es una discrepancia de hidratación, y la
 * hora del servidor no significa nada acá.
 */
export function Receso({ item }: { item: ItemReceso }) {
  // Un solo estado, y lo escribe unicamente el intervalo. Poner el valor
  // inicial en el cuerpo del efecto encadena renders, y ademas obligaria a
  // calcular la hora dos veces: una al montar y otra en cada tic.
  const [reloj, setReloj] = useState<{
    regreso: string | null;
    restante: number;
  } | null>(null);

  useEffect(() => {
    const inicio = Date.now();
    const regreso = horaDeRegreso(ahora(new Date()), item.minutos);

    const tic = () =>
      setReloj({
        regreso,
        restante: item.minutos * 60 - (Date.now() - inicio) / 1000,
      });

    // El primer tic va en el siguiente turno del bucle de eventos: durante ese
    // instante no se pinta reloj, que es preferible a pintar la hora del
    // servidor y corregirla al hidratar.
    const primero = setTimeout(tic, 0);
    const repetido = setInterval(tic, 250);

    return () => {
      clearTimeout(primero);
      clearInterval(repetido);
    };
  }, [item.minutos]);

  const regreso = reloj?.regreso ?? null;
  const restante = reloj?.restante ?? null;
  const terminado = restante !== null && restante <= 0;

  return (
    <Interrupcion etiqueta="Receso" color="var(--color-aviso)">
      <h2 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">
        {item.minutos} minutos
      </h2>

      {regreso && (
        <p className="mt-6 text-2xl sm:text-3xl">
          Volvemos a las{" "}
          <span
            className="font-semibold tabular-nums"
            style={{ color: "var(--color-aviso)" }}
          >
            {regreso}
          </span>
        </p>
      )}

      {restante !== null && (
        <p
          className="mt-10 text-6xl font-semibold tabular-nums sm:text-8xl"
          style={{
            color: terminado ? "var(--color-acento)" : "var(--tinta-suave)",
          }}
        >
          {terminado ? "Volvamos" : comoCuentaRegresiva(restante)}
        </p>
      )}
    </Interrupcion>
  );
}

/**
 * Una pausa deliberada para preguntas.
 *
 * No es "¿alguna pregunta?" dicho de pasada mientras se pasa a la lámina
 * siguiente. Para la clase y lo pone en pantalla, que es lo que hace que
 * alguien se anime.
 */
export function PausaPreguntas({ item }: { item: ItemPausaPreguntas }) {
  return (
    <Interrupcion etiqueta="Pausa" color="var(--color-acento)">
      <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        {item.titulo ?? "¿Preguntas?"}
      </h2>

      {item.disparadores?.length ? (
        <ul className="mt-10 space-y-4">
          {item.disparadores.map((d) => (
            <li
              key={d}
              className="text-xl sm:text-2xl"
              style={{ color: "var(--tinta-suave)" }}
            >
              · {d}
            </li>
          ))}
        </ul>
      ) : null}
    </Interrupcion>
  );
}

/**
 * Recordatorio de tomar asistencia.
 *
 * El alumno no lo ve nunca: `cursoParaAlumno` lo quita en el servidor, así que
 * este componente solo se dibuja en las vistas del docente. Que exista acá no
 * lo expone.
 */
export function Asistencia({ item }: { item: ItemAsistencia }) {
  return (
    <Marco>
      <Caja tono="aviso">
        <Etiqueta>Solo el docente</Etiqueta>
        <h2 className="mt-3 text-2xl font-semibold">
          {item.titulo ?? "Tomar asistencia"}
        </h2>
        {item.nota && (
          <p
            className="mt-2 text-lg leading-relaxed"
            style={{ color: "var(--tinta-suave)" }}
          >
            {item.nota}
          </p>
        )}
      </Caja>
    </Marco>
  );
}
