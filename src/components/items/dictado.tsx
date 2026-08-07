"use client";

import { useEffect, useState } from "react";

import type {
  ItemAsistencia,
  ItemPausaPreguntas,
  ItemReceso,
} from "@/lib/tipos";
import { comoCuentaRegresiva } from "@/lib/reloj";


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
 * Receso, con cuenta regresiva.
 *
 * El reloj arranca al montar y no al construir: lo que cuenta es cuándo se
 * llegó al ítem, no cuándo se desplegó la aplicación. Por eso también empieza
 * vacío y se rellena tras la hidratación — pintar un reloj en el servidor y
 * otro en el cliente es una discrepancia de hidratación.
 *
 * **No dice a qué hora se vuelve, y es deliberado.** Lo decía, calculado sobre
 * el reloj de la máquina que proyecta. En una clase en vivo esa hora no es la
 * que va a pasar: el receso empieza cuando el docente lo abre, se alarga
 * mientras alguien termina de preguntar, y la sala vuelve cuando vuelve. Un
 * «volvemos a las 18:06» proyectado es una promesa que nadie hizo, y en cuanto
 * se incumple —siempre se incumple— la pantalla pasa a ser la cosa del aula
 * que miente. La cuenta regresiva dice lo mismo sin comprometer una hora:
 * cuánto queda de los minutos que se anunciaron.
 */
export function Receso({ item }: { item: ItemReceso }) {
  // Un solo estado, y lo escribe unicamente el intervalo. Poner el valor
  // inicial en el cuerpo del efecto encadena renders.
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const inicio = Date.now();

    const tic = () =>
      setRestante(item.minutos * 60 - (Date.now() - inicio) / 1000);

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

  const terminado = restante !== null && restante <= 0;

  return (
    <Interrupcion etiqueta="Receso" color="var(--color-aviso)">
      <h2 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">
        {item.minutos} minutos
      </h2>

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
/**
 * Tomar asistencia, y la clase se entera.
 *
 * La `nota` la quita el servidor para el alumno, así que su presencia es lo
 * que distingue las dos caras: con nota, es la pantalla del docente; sin ella,
 * la que ve la sala. No hace falta preguntarle a nadie quién está mirando.
 */
export function Asistencia({ item }: { item: ItemAsistencia }) {
  return (
    <Interrupcion etiqueta="Asistencia" color="var(--color-aviso)">
      <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        {item.titulo ?? "Tomar asistencia"}
      </h2>
      <p className="mt-4 text-xl" style={{ color: "var(--tinta-suave)" }}>
        Un minuto. El taller se evalúa solo por asistencia, así que esto es lo
        único que hay que registrar en las ocho horas.
      </p>
      {item.nota && (
        <div className="mt-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-aviso)" }}
          >
            Solo el docente
          </p>
          <p
            className="mt-1 text-lg leading-relaxed"
            style={{ color: "var(--tinta-suave)" }}
          >
            {item.nota}
          </p>
        </div>
      )}
    </Interrupcion>
  );
}
