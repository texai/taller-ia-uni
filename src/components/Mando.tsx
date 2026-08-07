"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";

import type { Sesion } from "@/lib/tipos";
import { FAMILIA } from "@/lib/tipos";
import {
  acotar,
  avanzar,
  buscarPorId,
  indiceDeItem,
  INICIO,
  itemEn,
  minutosDeSesion,
  minutosHasta,
  pasosDe,
  retroceder,
  totalItems,
  unidadEn,
  type Posicion,
} from "@/lib/navegacion";
import { ahora, comoDuracion, minutosEntre } from "@/lib/reloj";
import { avisosDeTiempo, type Aviso } from "@/lib/avisos";
import { esMasNueva, type Pauta } from "@/lib/vivo";
import { Prosa } from "./items/texto";
import { useSincronia } from "@/components/useSincronia";

/**
 * El mando: la sesión desde el segundo portátil.
 *
 * El docente dicta con dos máquinas. Una proyecta —y se comparte por Zoom, así
 * que todo lo que aparezca ahí lo ve la clase entera—; la otra es esta, y es
 * donde vive lo que NO puede proyectarse: las notas, las preguntas que llegan
 * en privado, el reloj que dice que la unidad se está pasando.
 *
 * Mueve la clase publicando la pauta, igual que la pantalla principal. Las dos
 * se escuchan entre sí, así que da lo mismo desde cuál se avance.
 */
/** La hora de ahora, y el instante en milisegundos. `null` hasta el primer tic. */
type Tic = { hora: string; ms: number } | null;

/**
 * El reloj de pared, uno solo para toda la pantalla.
 *
 * Empieza en `null` y no en la hora del servidor: esa hora no significa nada
 * acá, y pintarla para corregirla al hidratar es una discrepancia de
 * hidratación. Un solo estado, y lo escribe únicamente el intervalo.
 */
function useTic(): Tic {
  const [tic, setTic] = useState<Tic>(null);
  useEffect(() => {
    const marcar = () => setTic({ hora: ahora(new Date()), ms: Date.now() });
    const primero = setTimeout(marcar, 0);
    const repetido = setInterval(marcar, 1000);
    return () => {
      clearTimeout(primero);
      clearInterval(repetido);
    };
  }, []);
  return tic;
}

const CLAVE_ARRANQUE = "taller:arranque:";
const EVENTO_ARRANQUE = "taller:arranque";

/**
 * La hora en que la clase realmente empezó.
 *
 * Casi ninguna sesión arranca a la hora del sílabo, y medir contra una hora
 * que no ocurrió vuelve ruido todo lo demás: el mando diría "12 min de atraso"
 * durante cuatro horas por algo que pasó mientras la gente se conectaba.
 *
 * Se guarda en `localStorage` —recargar el mando no debe perderla— y se lee
 * con `useSyncExternalStore`, que es lo que `localStorage` es: una fuente
 * mutable externa a React. La alternativa, un efecto que copia el valor a un
 * estado, encadena renders y además se lo pierde si el docente tiene el mando
 * abierto dos veces; escuchando `storage` las dos pestañas coinciden.
 */
function useArranque(sesionId: string) {
  const clave = CLAVE_ARRANQUE + sesionId;

  const suscribirse = useCallback((alCambiar: () => void) => {
    window.addEventListener("storage", alCambiar);
    window.addEventListener(EVENTO_ARRANQUE, alCambiar);
    return () => {
      window.removeEventListener("storage", alCambiar);
      window.removeEventListener(EVENTO_ARRANQUE, alCambiar);
    };
  }, []);

  const arranque = useSyncExternalStore(
    suscribirse,
    () => window.localStorage.getItem(clave),
    // En el servidor no hay `localStorage`: se dibuja como si no estuviera
    // marcada, y al hidratar aparece.
    () => null,
  );

  const marcar = useCallback(() => {
    window.localStorage.setItem(clave, ahora(new Date()));
    window.dispatchEvent(new Event(EVENTO_ARRANQUE));
  }, [clave]);

  return { arranque, marcar };
}

export function Mando({ sesion, curso }: { sesion: Sesion; curso: string }) {
  const {
    pauta,
    estado,
    publicar,
    preguntas,
    atender,
    revelar,
    revelado,
    conectados,
    cuantosRespondieron,
    preguntaViva,
    lanzar,
    cerrarViva,
  } = useSincronia({ curso, sesion: sesion.id, esDocente: true });

  /**
   * Lo último que se mandó desde acá.
   *
   * La posición del mando es la más reciente entre esto y lo que llegó por el
   * canal. Se deriva en el render en vez de sincronizarse con un efecto: dos
   * pantallas que se mueven a la vez producen justo el tipo de carrera que un
   * efecto que copia estado resuelve mal.
   */
  const [propia, setPropia] = useState<Pauta | null>(null);
  const actual = propia && esMasNueva(propia, pauta) ? propia : (pauta ?? propia);

  const pos = useMemo<Posicion>(() => {
    if (!actual) return INICIO;
    const donde = buscarPorId(sesion, actual.itemId);
    return donde ? acotar(sesion, { ...donde, paso: actual.paso }) : INICIO;
  }, [sesion, actual]);

  const enVivo = actual?.enVivo ?? true;
  const item = itemEn(sesion, pos);
  const unidad = unidadEn(sesion, pos);
  const indice = indiceDeItem(sesion, pos);
  const total = totalItems(sesion);
  const pasos = item ? pasosDe(item) : 1;
  const siguiente = itemEn(sesion, avanzar(sesion, pos));

  const tic = useTic();
  const { arranque, marcar } = useArranque(sesion.id);
  // La hora cero: la que el docente marcó, o la programada si no marcó ninguna.
  const inicio = arranque ?? sesion.horaInicio;

  const avisos = useMemo(
    () =>
      tic
        ? avisosDeTiempo({ sesion, pos, horaActual: tic.hora, inicio })
        : [],
    [sesion, pos, tic, inicio],
  );

  const emitir = useCallback(
    (destino: Posicion, vivo: boolean) => {
      const it = itemEn(sesion, destino);
      if (!it) return;
      const emitida = publicar(it.id, destino.paso, vivo);
      if (emitida) setPropia(emitida);
    },
    [sesion, publicar],
  );

  const mover = useCallback(
    (direccion: 1 | -1) => {
      // Sin saber dónde va la clase, mover es peligroso: se empezaría desde el
      // principio y se arrastraría a todos hacia atrás. Hay un botón aparte
      // para tomar el mando a propósito.
      if (!actual) return;
      emitir(
        direccion === 1 ? avanzar(sesion, pos) : retroceder(sesion, pos),
        enVivo,
      );
    },
    [actual, emitir, sesion, pos, enVivo],
  );

  // Este portátil también se maneja con las flechas: es un teclado, no un
  // teléfono, y en clase la mano ya está ahí.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      const activo = document.activeElement;
      if (
        activo instanceof HTMLInputElement ||
        activo instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        mover(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        mover(-1);
      }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [mover]);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 lg:grid-cols-[1fr_24rem]">
      <div className="min-w-0">
        <Cabecera
          sesion={sesion}
          estado={estado}
          conectados={conectados}
          enVivo={enVivo}
          onVivo={() => emitir(pos, !enVivo)}
          puede={Boolean(actual)}
        />

        <Reloj
          sesion={sesion}
          pos={pos}
          desde={actual?.momento ?? null}
          item={item}
          tic={tic}
          inicio={inicio}
          arrancada={Boolean(arranque)}
          onArrancar={marcar}
        />

        <Avisos avisos={avisos} />

        {/* ------------------------------------------------ dónde va la clase */}
        <section
          className="mt-4 rounded-xl border p-5"
          style={{ borderColor: "var(--borde)", background: "var(--lienzo-alto)" }}
        >
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--tinta-suave)" }}>
            {unidad ? `${unidad.tipo} · ${unidad.titulo}` : "Sesión"}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {item?.titulo ?? item?.id ?? "Sin ítems"}
          </h1>
          <p className="mt-1 text-sm tabular-nums" style={{ color: "var(--tinta-suave)" }}>
            {indice + 1} / {total}
            {pasos > 1 && ` · paso ${pos.paso + 1}/${pasos}`}
            {item?.tipo ? ` · ${item.tipo}` : ""}
          </p>

          {item?.entradilla && (
            <p className="mt-3 text-base leading-relaxed">{item.entradilla}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => mover(-1)}
              disabled={!actual}
              className="flex-1 rounded-lg border px-5 py-4 text-lg disabled:opacity-40"
              style={{ borderColor: "var(--borde)" }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              disabled={!actual}
              className="flex-[2] rounded-lg border px-5 py-4 text-lg font-medium disabled:opacity-40"
              style={{
                borderColor: "var(--color-acento)",
                color: "var(--color-acento)",
              }}
            >
              Siguiente →
            </button>
          </div>

          {!actual && (
            <div className="mt-4">
              <p className="text-sm" style={{ color: "var(--color-aviso)" }}>
                Todavía no llegó la posición de la pantalla principal. Si es la
                primera vez que se abre la sesión, empieza desde acá.
              </p>
              <button
                type="button"
                onClick={() => emitir(INICIO, true)}
                className="mt-3 rounded-lg border px-4 py-2 text-sm"
                style={{ borderColor: "var(--color-aviso)", color: "var(--color-aviso)" }}
              >
                Empezar desde el principio
              </button>
            </div>
          )}
        </section>

        {/* --------------------------------------------------- notas privadas */}
        {item?.notas && (
          <section
            className="mt-4 rounded-xl border-l-2 py-3 pl-4"
            style={{ borderColor: "var(--color-aviso)" }}
          >
            {/*
              El minutaje va acá, en dígitos y siempre en el mismo sitio.
              Antes vivía dentro de la prosa —«Tres minutos, y decirlos
              completos»— y había que leer la frase para encontrarlo. Dictando
              se mira de reojo, y de reojo solo se ve lo que está donde
              siempre.
            */}
            <p
              className="flex items-baseline gap-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-aviso)" }}
            >
              Notas
              {typeof item.minutos === "number" && item.minutos > 0 && (
                <span className="rounded px-1.5 py-0.5 text-sm tabular-nums"
                  style={{
                    background: "color-mix(in srgb, var(--color-aviso) 18%, transparent)",
                  }}
                >
                  {item.minutos} min
                </span>
              )}
            </p>
            <Prosa className="mt-1" tamano="base">
              {item.notas}
            </Prosa>
          </section>
        )}

        {item?.tipo === "pregunta" && (
          <section className="mt-4 text-sm" style={{ color: "var(--tinta-suave)" }}>
            {item.respuesta ? `Respuesta correcta: ${item.respuesta}` : "Sin respuesta correcta"}
            {" · "}
            {cuantosRespondieron(item.id)}
            {conectados > 0 && ` / ${conectados}`} han respondido
            <button
              type="button"
              // Con `solucion`, igual que el revelado del proyector. Sin ella,
              // revelar desde acá dejaba el bloque de «Por qué» fuera: la clase
              // veía el conteo y la respuesta correcta, y no el razonamiento —
              // que es la mitad que enseña.
              onClick={() => revelar(item.id, item.respuesta, item.solucion)}
              className="ml-3 rounded-md border px-3 py-1 text-xs"
              style={{ borderColor: "var(--color-acento)", color: "var(--color-acento)" }}
            >
              Mostrar resultados
            </button>
          </section>
        )}

        {/* ------------------------------------------------------- lo que sigue */}
        {siguiente && siguiente.id !== item?.id && (
          <section className="mt-4 px-1">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--tinta-suave)" }}>
              Sigue
            </p>
            <p className="mt-0.5 text-base">
              <span
                aria-hidden
                style={{
                  color:
                    FAMILIA[siguiente.tipo] === "dictado"
                      ? "var(--color-aviso)"
                      : "var(--tinta-suave)",
                }}
              >
                {FAMILIA[siguiente.tipo] === "dictado" ? "◆ " : "• "}
              </span>
              {siguiente.titulo ?? siguiente.id}
              <span className="text-sm" style={{ color: "var(--tinta-suave)" }}>
                {" "}
                · {siguiente.tipo}
                {siguiente.minutos ? ` · ${siguiente.minutos}′` : ""}
              </span>
            </p>
          </section>
        )}
      </div>

      {/* ------------------------------------------------------------ columna */}
      <div className="min-w-0 space-y-6">
        <Moderacion preguntas={preguntas} onAtender={atender} />
        <Lanzar
          viva={preguntaViva}
          respondieron={preguntaViva ? cuantosRespondieron(preguntaViva.id) : 0}
          conectados={conectados}
          revelado={revelado}
          onLanzar={lanzar}
          onRevelar={revelar}
          onCerrar={cerrarViva}
        />
        {/* Saltar sí funciona sin conocer la posición de la otra pantalla:
            elegir un ítem de la lista es decir a dónde ir, no moverse a
            ciegas desde donde uno cree que está. */}
        <Salto sesion={sesion} pos={pos} onIr={(p) => emitir(p, enVivo)} />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------

function Cabecera({
  sesion,
  estado,
  conectados,
  enVivo,
  onVivo,
  puede,
}: {
  sesion: Sesion;
  estado: string;
  conectados: number;
  enVivo: boolean;
  onVivo: () => void;
  puede: boolean;
}) {
  return (
    <header className="flex flex-wrap items-center gap-3">
      <Link href="/profe/inicio" className="text-xs underline" style={{ color: "var(--tinta-suave)" }}>
        ← Sesiones
      </Link>
      <p className="text-xs" style={{ color: "var(--tinta-suave)" }}>
        Mando · sesión {sesion.numero}
      </p>

      <span
        className="ml-auto flex items-center gap-1.5 text-xs"
        style={{
          color:
            estado === "en-vivo"
              ? "var(--color-acento)"
              : estado === "reconectando"
                ? "var(--color-aviso)"
                : "var(--tinta-suave)",
        }}
      >
        <span aria-hidden>●</span>
        {estado === "en-vivo" ? `${conectados} conectados` : estado}
      </span>

      <button
        type="button"
        onClick={onVivo}
        disabled={!puede}
        className="rounded-md border px-3 py-1 text-xs disabled:opacity-40"
        style={{
          borderColor: enVivo ? "var(--color-acento)" : "var(--borde)",
          color: enVivo ? "var(--color-acento)" : "var(--tinta-suave)",
        }}
      >
        {enVivo ? "Dictando" : "Ensayando"}
      </button>
    </header>
  );
}

/**
 * El reloj de la sesión, que es el que se olvida.
 *
 * Tres cosas, y ninguna se proyecta: cuánto queda de sesión, si lo dictado va
 * adelantado o atrasado respecto de lo planificado, y cuánto lleva el ítem
 * actual en pantalla. Lo tercero sale de la marca de tiempo de la pauta: el
 * momento en que la clase llegó acá, publicado por la pantalla que se movió.
 *
 * Cuando la sesión no declara horas legibles, no se muestra un reloj inventado
 * — se muestra menos.
 */
function Reloj({
  sesion,
  pos,
  desde,
  item,
  tic,
  inicio,
  arrancada,
  onArrancar,
}: {
  sesion: Sesion;
  pos: Posicion;
  desde: number | null;
  item: { minutos?: number } | null;
  tic: Tic;
  /** La hora cero contra la que se mide todo. */
  inicio?: string;
  /** Si esa hora cero la marcó el docente o es la programada. */
  arrancada: boolean;
  onArrancar: () => void;
}) {
  const planificado = minutosHasta(sesion, pos);
  const totalPlan = minutosDeSesion(sesion);

  const transcurrido = tic ? minutosEntre(inicio, tic.hora) : null;
  const restante = tic ? minutosEntre(tic.hora, sesion.horaFin) : null;
  // Positivo: la clase va por delante del plan. Negativo: se está pasando.
  const desvio =
    transcurrido === null ? null : planificado - transcurrido;

  const enElItem = tic && desde ? (tic.ms - desde) / 60000 : null;
  const pasado =
    enElItem !== null && item?.minutos ? enElItem > item.minutos : false;

  return (
    <section
      className="mt-4 flex flex-wrap gap-x-8 gap-y-2 rounded-xl border px-5 py-3 text-sm"
      style={{ borderColor: "var(--borde)" }}
    >
      <Dato
        titulo="Queda de sesión"
        valor={restante === null ? "—" : comoDuracion(restante)}
        color={restante !== null && restante <= 15 ? "var(--color-aviso)" : undefined}
      />
      <Dato
        titulo="Plan"
        valor={`${planificado} / ${totalPlan} min`}
      />
      <Dato
        titulo={desvio !== null && desvio < 0 ? "Atrasado" : "Holgura"}
        valor={desvio === null ? "—" : comoDuracion(desvio)}
        color={
          desvio === null
            ? undefined
            : desvio < 0
              ? "var(--color-aviso)"
              : "var(--color-acento)"
        }
      />
      <Dato
        titulo="En este ítem"
        valor={
          enElItem === null
            ? "—"
            : `${Math.floor(enElItem)}′${item?.minutos ? ` de ${item.minutos}′` : ""}`
        }
        color={pasado ? "var(--color-aviso)" : undefined}
      />

      {/* La hora cero.
          Casi ninguna clase empieza a la hora programada, y medir contra una
          hora que no ocurrió convierte el reloj en ruido antes del primer
          receso: diría "12 min de atraso" toda la tarde por algo que pasó al
          principio y que ya nadie puede recuperar. */}
      <div className="ml-auto self-center">
        {arrancada ? (
          <p className="text-[11px]" style={{ color: "var(--tinta-suave)" }}>
            Empezó {inicio}
          </p>
        ) : (
          <button
            type="button"
            onClick={onArrancar}
            className="rounded-md border px-3 py-1 text-xs"
            style={{ borderColor: "var(--borde)", color: "var(--tinta-suave)" }}
            title="Mide el tiempo desde ahora en vez de desde la hora programada"
          >
            Empezamos ahora
          </button>
        )}
      </div>
    </section>
  );
}

function Dato({
  titulo,
  valor,
  color,
}: {
  titulo: string;
  valor: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--tinta-suave)" }}>
        {titulo}
      </p>
      <p className="tabular-nums" style={{ color: color ?? "var(--tinta)" }}>
        {valor}
      </p>
    </div>
  );
}

/**
 * Las preguntas de los alumnos, acá y en ningún otro sitio.
 *
 * En la pantalla principal el panel está cerrado por omisión justamente porque
 * se proyecta. Acá se ven abiertas: es la máquina que solo mira el docente, y
 * moderar en privado es la mitad de por qué existen dos portátiles.
 */
function Moderacion({
  preguntas,
  onAtender,
}: {
  preguntas: { id: string; texto: string; autor?: string; itemTitulo?: string }[];
  onAtender: (id: string) => void;
}) {
  return (
    <section
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--borde)", background: "var(--lienzo-alto)" }}
    >
      <h2 className="text-sm font-semibold">
        Preguntas{" "}
        {preguntas.length > 0 && (
          <span style={{ color: "var(--color-aviso)" }}>· {preguntas.length}</span>
        )}
      </h2>

      {preguntas.length === 0 ? (
        <p className="mt-3 text-sm" style={{ color: "var(--tinta-suave)" }}>
          Nadie ha preguntado todavía.
        </p>
      ) : (
        <ul className="mt-3 max-h-[40vh] space-y-4 overflow-y-auto">
          {preguntas.map((p) => (
            <li key={p.id} className="border-l-2 pl-3" style={{ borderColor: "var(--color-aviso)" }}>
              <p className="text-base leading-relaxed">{p.texto}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--tinta-suave)" }}>
                {p.autor ?? "Anónimo"}
                {p.itemTitulo ? ` · sobre "${p.itemTitulo}"` : ""}
              </p>
              <button
                type="button"
                onClick={() => onAtender(p.id)}
                className="mt-1 text-xs underline"
                style={{ color: "var(--color-acento)" }}
              >
                Atendida
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Lanzar una pregunta que no estaba en el material.
 *
 * Las mejores preguntas de una clase se le ocurren a uno mientras dicta. Como
 * no están en el YAML no pueden llegar por la pauta, así que viajan enteras
 * por el canal y se dibujan encima de la lámina en todas las pantallas.
 *
 * Una opción por línea; sin líneas, respuesta abierta.
 */
function Lanzar({
  viva,
  respondieron,
  conectados,
  revelado,
  onLanzar,
  onRevelar,
  onCerrar,
}: {
  viva: { id: string; pregunta: string } | null;
  respondieron: number;
  conectados: number;
  revelado: { preguntaId: string } | null;
  onLanzar: (pregunta: string, opciones: string[]) => unknown;
  onRevelar: (id: string) => void;
  onCerrar: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [opciones, setOpciones] = useState("");

  if (viva) {
    const yaRevelada = revelado?.preguntaId === viva.id;
    return (
      <section
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--color-acento)", background: "var(--lienzo-alto)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-acento)" }}>
          Pregunta en pantalla
        </h2>
        <p className="mt-2 text-base leading-relaxed">{viva.pregunta}</p>
        <p className="mt-3 text-2xl font-semibold tabular-nums">
          {respondieron}
          {conectados > 0 && (
            <span style={{ color: "var(--tinta-suave)" }}> / {conectados}</span>
          )}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onRevelar(viva.id)}
            disabled={yaRevelada}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
            style={{ borderColor: "var(--color-acento)", color: "var(--color-acento)" }}
          >
            {yaRevelada ? "Mostrada" : "Mostrar resultados"}
          </button>
          <button
            type="button"
            onClick={() => {
              onCerrar();
              setTexto("");
              setOpciones("");
            }}
            className="rounded-md border px-3 py-1.5 text-sm"
            style={{ borderColor: "var(--borde)" }}
          >
            Quitar
          </button>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onLanzar(
          texto,
          opciones
            .split("\n")
            .map((o) => o.trim())
            .filter(Boolean),
        );
      }}
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--borde)", background: "var(--lienzo-alto)" }}
    >
      <h2 className="text-sm font-semibold">Preguntar a la clase</h2>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={2}
        placeholder="La pregunta"
        className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--borde)", background: "var(--lienzo)", color: "var(--tinta)" }}
      />
      <textarea
        value={opciones}
        onChange={(e) => setOpciones(e.target.value)}
        rows={3}
        placeholder={"Una opción por línea\n(vacío = respuesta abierta)"}
        className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--borde)", background: "var(--lienzo)", color: "var(--tinta)" }}
      />
      <button
        type="submit"
        disabled={!texto.trim()}
        className="mt-3 w-full rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40"
        style={{ borderColor: "var(--color-acento)", color: "var(--color-acento)" }}
      >
        Lanzar
      </button>
    </form>
  );
}

/** Saltar a cualquier ítem: para cuando alguien pregunta por algo de hace una hora. */
function Salto({
  sesion,
  pos,
  onIr,
}: {
  sesion: Sesion;
  pos: Posicion;
  onIr: (destino: Posicion) => void;
}) {
  return (
    <section
      className="rounded-xl border p-2"
      style={{ borderColor: "var(--borde)" }}
    >
      <ol className="max-h-[50vh] overflow-y-auto">
        {sesion.unidades.map((u, iu) => (
          <li key={u.id} className="mb-3">
            <p
              className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{
                color: iu === pos.unidad ? "var(--color-acento)" : "var(--tinta-suave)",
              }}
            >
              {u.titulo}
            </p>
            <ol>
              {u.items.map((it, ii) => {
                const aqui = iu === pos.unidad && ii === pos.item;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => onIr({ unidad: iu, item: ii, paso: 0 })}
                      className="w-full truncate rounded px-2 py-1 text-left text-sm"
                      style={{
                        background: aqui ? "var(--lienzo-alto)" : undefined,
                        color: aqui ? "var(--tinta)" : "var(--tinta-suave)",
                        fontWeight: aqui ? 600 : 400,
                      }}
                    >
                      {it.titulo ?? it.id}
                    </button>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Los avisos de tiempo.
 *
 * Van arriba del todo y solo aparecen cuando hay algo que decir. Un panel que
 * siempre está ahí, aunque diga "todo en orden", deja de leerse a los veinte
 * minutos — y entonces tampoco se lee el día que dice otra cosa.
 *
 * Esto no se proyecta nunca (`CONVENTIONS.md` §14). Que la clase vea que su
 * docente va quince minutos tarde no la ayuda; que el docente lo vea, sí.
 */
function Avisos({ avisos }: { avisos: Aviso[] }) {
  if (!avisos.length) return null;

  return (
    <section className="mt-4 space-y-3">
      {avisos.map((a) => {
        const color =
          a.urgencia === "urgente" ? "var(--color-acento)" : "var(--color-aviso)";
        return (
          <div
            key={a.id}
            className="rounded-xl border-l-4 py-3 pl-4 pr-4"
            style={{ borderColor: color, background: "var(--lienzo-alto)" }}
          >
            <p className="font-medium" style={{ color }}>
              {a.titulo}
            </p>
            {a.detalle && (
              <p className="mt-0.5 text-sm" style={{ color: "var(--tinta-suave)" }}>
                {a.detalle}
              </p>
            )}

            {a.recortes?.length ? (
              <ul className="mt-2 space-y-1 text-sm">
                {a.recortes.map((r) => (
                  <li key={r.id} className="flex items-baseline gap-2">
                    <span
                      className="text-[11px] uppercase tracking-wider"
                      style={{ color: "var(--tinta-suave)" }}
                    >
                      {r.tipo}
                    </span>
                    <span className="truncate">{r.titulo}</span>
                    <span
                      className="ml-auto shrink-0 tabular-nums"
                      style={{ color: "var(--tinta-suave)" }}
                    >
                      {r.minutos} min
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
