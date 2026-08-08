"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";

import type { ItemPregunta, Sesion, Termino } from "@/lib/tipos";
import { FAMILIA } from "@/lib/tipos";
import {
  acotar,
  avanzar,
  buscarPorId,
  indiceDeItem,
  itemEn,
  minutosDeUnidad,
  pasosDe,
  posicionDeIndice,
  retroceder,
  totalItems,
  unidadEn,
  type Posicion,
} from "@/lib/navegacion";
import { RenderizarItem } from "@/components/items";
import { Pregunta } from "@/components/items/pregunta";
import { useSincronia } from "@/components/useSincronia";
import { Preguntar } from "@/components/Preguntar";
import { PanelGlosario } from "@/components/items/glosario";
import { Prosa } from "@/components/items/texto";
import { comparar } from "@/lib/navegacion";

/**
 * La vista de dictado: navegación a la izquierda, un ítem a la vez a la
 * derecha.
 *
 * Se maneja con el teclado porque en clase se pulsa la flecha mirando a la
 * audiencia, no a la pantalla. El índice existe para saltar cuando alguien
 * pregunta por algo de hace veinte minutos, no para recorrer.
 */
/**
 * El contador de la esquina, convertido en un salto.
 *
 * El número ya estaba ahí —«79 / 144»— y no servía para nada. Para llegar a
 * una lámina concreta solo había dos caminos: el índice lateral, que obliga a
 * reconocer un título entre 234, o la flecha, cuarenta veces. En vivo, cuando
 * alguien pregunta por algo de hace media hora, ninguno de los dos sirve.
 *
 * Lleva las dos formas a propósito, y no es indecisión:
 *
 * - **La caja** es para cuando se sabe el número. Se teclea y Enter. Es lo que
 *   se usa con la escaleta al lado, o volviendo a un sitio que uno anotó.
 * - **El deslizador** es para cuando no se sabe: se arrastra viendo el título
 *   cambiar debajo hasta reconocerlo. Buscar sin saber el número es el caso
 *   más común de los dos.
 *
 * Se abre al pulsar el contador y se cierra con Escape o pulsando fuera. **No
 * salta mientras se arrastra**: solo al soltar. Con la pantalla proyectada,
 * arrastrar saltando dejaría a la clase pasando cuarenta láminas en dos
 * segundos.
 */
function SaltarA({
  indice,
  total,
  pasos,
  paso,
  onIr,
}: {
  indice: number;
  total: number;
  pasos: number;
  paso: number;
  onIr: (n: number) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  // Lo que el deslizador está señalando ahora mismo, que puede no ser dónde
  // está la clase: mientras se arrastra, la sala no se ha movido.
  const [apuntando, setApuntando] = useState(indice + 1);
  const caja = useRef<HTMLInputElement | null>(null);

  // El efecto solo escucha y enfoca. Poner los valores iniciales acá dentro
  // sería escribir estado desde un efecto para algo que ya sabe el gesto que
  // lo abrió — se hacen en `abrir`, que es donde ocurre.
  useEffect(() => {
    if (!abierto) return;
    caja.current?.focus();
    caja.current?.select();
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alTeclado);
    return () => window.removeEventListener("keydown", alTeclado);
  }, [abierto]);

  const abrir = () => {
    // Siempre parte de dónde está la clase, no de dónde quedó el deslizador la
    // vez anterior: media hora después, ese número ya no significa nada.
    setTexto("");
    setApuntando(indice + 1);
    setAbierto(true);
  };

  const saltar = (n: number) => {
    if (!Number.isFinite(n)) return;
    onIr(n);
    setAbierto(false);
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        className="rounded-md px-2 py-1 text-sm tabular-nums"
        style={{
          color: abierto ? "var(--color-acento)" : "var(--tinta-suave)",
          background: abierto ? "var(--lienzo-alto)" : "transparent",
        }}
        title="Saltar a una lámina"
      >
        {indice + 1} / {total}
        {pasos > 1 && (
          <span style={{ color: "var(--color-acento)" }}>
            {" "}
            · paso {paso + 1}/{pasos}
          </span>
        )}
      </button>

      {abierto && (
        <>
          {/* Pulsar fuera cierra. Va detrás del panel y delante de todo lo
              demás, para que no haga falta acertarle al botón otra vez. */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setAbierto(false)}
          />
          <div
            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border p-4 shadow-xl"
            style={{
              borderColor: "var(--borde)",
              background: "var(--lienzo-alto)",
            }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--tinta-suave)" }}
            >
              Saltar a la lámina
            </p>

            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                saltar(Number(texto));
              }}
            >
              <input
                ref={caja}
                type="number"
                inputMode="numeric"
                min={1}
                max={total}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={String(indice + 1)}
                className="w-24 rounded-md border px-3 py-2 text-lg tabular-nums"
                style={{
                  borderColor: "var(--borde)",
                  background: "var(--lienzo)",
                  color: "var(--tinta)",
                }}
              />
              <span className="text-sm" style={{ color: "var(--tinta-suave)" }}>
                de {total}
              </span>
              <button
                type="submit"
                className="ml-auto rounded-md border px-3 py-2 text-sm font-medium"
                style={{
                  borderColor: "var(--color-acento)",
                  color: "var(--color-acento)",
                }}
              >
                Ir
              </button>
            </form>

            <input
              type="range"
              min={1}
              max={total}
              value={apuntando}
              onChange={(e) => setApuntando(Number(e.target.value))}
              // Solo al soltar. Saltando en cada píxel, la clase vería pasar
              // cuarenta láminas mientras uno busca.
              onMouseUp={() => saltar(apuntando)}
              onTouchEnd={() => saltar(apuntando)}
              onKeyUp={(e) => {
                if (e.key === "Enter") saltar(apuntando);
              }}
              className="mt-4 w-full"
              style={{ accentColor: "var(--color-acento)" }}
              aria-label="Buscar una lámina arrastrando"
            />
            <p
              className="mt-1 text-xs tabular-nums"
              style={{ color: "var(--tinta-suave)" }}
            >
              {apuntando === indice + 1
                ? "Arrastra para buscar, o teclea el número"
                : `Ir a la ${apuntando} · suelta para saltar`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

const EVENTO = "taller:navegacion";

/**
 * La URL es la fuente de verdad de la posición, no un espejo del estado.
 *
 * Se lee con `useSyncExternalStore` porque eso es exactamente lo que es: una
 * fuente mutable externa a React. La alternativa —estado local sincronizado
 * con un efecto— encadena renders, y además rompe el botón de atrás del
 * navegador, que en clase es justo lo que uno pulsa cuando se pasó de ítem.
 */
function suscribirseALaUrl(alCambiar: () => void) {
  window.addEventListener("popstate", alCambiar);
  window.addEventListener(EVENTO, alCambiar);
  return () => {
    window.removeEventListener("popstate", alCambiar);
    window.removeEventListener(EVENTO, alCambiar);
  };
}

export function Dictado({
  sesion,
  curso,
  glosario = [],
  modoDocente = false,
}: {
  sesion: Sesion;
  /** Para el nombre del canal en vivo. */
  curso: string;
  /**
   * El glosario del curso, para el panel que está siempre a mano.
   *
   * Llega entero y no filtrado: es referencia pública, y lo mismo ve el
   * docente que el alumno.
   */
  glosario?: Termino[];
  /**
   * En modo docente la sesión llega completa, con notas y respuestas. El
   * filtrado lo hace la ruta, no este componente: una vista que decide en el
   * render qué ocultar acaba mostrándolo en el HTML.
   */
  modoDocente?: boolean;
}) {
  const [indiceAbierto, setIndiceAbierto] = useState(false);
  /**
   * Si se está dictando o ensayando, decidido desde acá.
   *
   * Guarda su marca de tiempo porque el interruptor está en dos sitios: acá y
   * en el mando. Gana el más reciente de los dos, igual que con la posición.
   * Sin la marca, esta pantalla volvería a imponer su valor cada vez que el
   * mando cambiara el suyo, y el interruptor parpadearía entre los dos.
   */
  const [vivoLocal, setVivoLocal] = useState<{
    valor: boolean;
    momento: number;
  } | null>(null);
  const principal = useRef<HTMLDivElement>(null);

  const {
    pauta,
    estado,
    publicar,
    preguntar,
    responder,
    revelar,
    revelado,
    conectados,
    cuantosRespondieron,
    preguntaViva,
    apertura,
    abrir,
  } = useSincronia({
    curso,
    sesion: sesion.id,
    esDocente: modoDocente,
  });

  const enVivo =
    vivoLocal && (!pauta || vivoLocal.momento > pauta.momento)
      ? vivoLocal.valor
      : (pauta?.enVivo ?? true);

  const busqueda = useSyncExternalStore(
    suscribirseALaUrl,
    () => window.location.search,
    // En el servidor no hay URL que leer: se dibuja el primer ítem, y al
    // hidratar React vuelve a preguntar y salta a donde toque.
    () => "",
  );

  const pos = useMemo<Posicion>(() => {
    const params = new URLSearchParams(busqueda);
    const id = params.get("item");
    const paso = Number(params.get("paso") ?? 0);
    const encontrada = id ? buscarPorId(sesion, id) : null;
    return acotar(sesion, encontrada ? { ...encontrada, paso } : { unidad: 0, item: 0, paso: 0 });
  }, [sesion, busqueda]);

  const item = itemEn(sesion, pos);
  const unidad = unidadEn(sesion, pos);

  const seFueAtras = useRef(false);

  // Hasta dónde ha llegado la clase. Todo lo anterior es libre para el alumno;
  // lo posterior, no. El docente no tiene tope.
  //
  // Se calcula acá arriba, antes de `mover`, para que `mover` lo lea como un
  // valor y no a través de un ref: un ref leído en el render puede quedar
  // desfasado si React interrumpe una renderización.
  const tope = useMemo(() => {
    // El docente no tiene tope: su pantalla principal sigue a la segunda, pero
    // no se le impide moverse.
    if (modoDocente || !pauta?.enVivo) return null;
    const encontrada = buscarPorId(sesion, pauta.itemId);
    return encontrada
      ? acotar(sesion, { ...encontrada, paso: pauta.paso })
      : null;
  }, [modoDocente, pauta, sesion]);

  const atrasado = tope !== null && comparar(pos, tope) < 0;

  const irA = useCallback(
    (destino: Posicion) => {
      const siguiente = acotar(sesion, destino);
      const item = itemEn(sesion, siguiente);
      if (!item) return;

      const url = new URL(window.location.href);
      url.searchParams.set("item", item.id);
      if (siguiente.paso > 0) url.searchParams.set("paso", String(siguiente.paso));
      else url.searchParams.delete("paso");

      // `replaceState` y no `pushState`: avanzar de ítem no debe apilar una
      // entrada de historial por cada flecha.
      window.history.replaceState(null, "", url);
      window.dispatchEvent(new Event(EVENTO));
      principal.current?.scrollTo({ top: 0 });
    },
    [sesion],
  );

  const mover = useCallback(
    (direccion: 1 | -1) => {
      const destino =
        direccion === 1 ? avanzar(sesion, pos) : retroceder(sesion, pos);
      // El alumno puede mirar atrás cuanto quiera; adelantarse, no. Es una
      // barrera de comportamiento y no de seguridad: la página estática lleva
      // toda la sesión dentro. Ver `CONVENTIONS.md` §4.
      if (tope && comparar(destino, tope) > 0) return;
      seFueAtras.current = direccion === -1;
      irA(destino);
    },
    [sesion, pos, irA, tope],
  );

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      // No robarle las flechas a quien está escribiendo una respuesta.
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
      } else if (e.key === "Escape") {
        setIndiceAbierto(false);
      }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [mover]);

  /**
   * El índice sigue al cursor.
   *
   * Con casi doscientos ítems, avanzar unas cuantas láminas dejaba el ítem
   * actual fuera de la parte visible del panel: la clase avanzaba y el índice
   * seguía enseñando el principio de la sesión, así que había que buscar a
   * mano dónde se estaba. Ahora se desplaza solo.
   *
   * `block: "nearest"` y no `"center"` a propósito: centrar mueve el panel en
   * cada paso aunque el ítem ya se vea, y un índice que se agita cada vez que
   * se pulsa una flecha cansa más de lo que ayuda. Así solo se mueve cuando
   * hace falta, y lo justo.
   */
  const activo = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const nodo = activo.current;
    if (!nodo) return;
    nodo.scrollIntoView({
      block: "nearest",
      // Suave, salvo para quien pidió al sistema que no le animen nada.
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [pos.unidad, pos.item]);

  /**
   * Cuando se acaba el tiempo, el docente publica el resultado. Solo él.
   *
   * Los alumnos dejan de poder responder por su cuenta, mirando el reloj —no
   * hace falta que llegue ningún mensaje para eso— pero **el recuento solo lo
   * puede hacer quien tiene las respuestas**, y eso es la pantalla del
   * docente. Si lo hiciera cada uno con lo suyo, cada pantalla enseñaría un
   * número distinto.
   */
  useEffect(() => {
    if (!modoDocente || !apertura || !item) return;
    if (item.tipo !== "pregunta" || apertura.preguntaId !== item.id) return;
    if (revelado?.preguntaId === item.id) return;
    const falta = apertura.hasta - Date.now();
    const cerrar = () => revelar(item.id, item.respuesta, item.solucion);
    if (falta <= 0) {
      cerrar();
      return;
    }
    const id = setTimeout(cerrar, falta);
    return () => clearTimeout(id);
  }, [modoDocente, apertura, item, revelado, revelar]);

  // El docente publica cada movimiento.
  useEffect(() => {
    if (!modoDocente || !item) return;
    // Salvo el que acaba de llegar del mando. Sin esto, mover desde el otro
    // portátil rebota: llega la pauta, esta pantalla se mueve, y al moverse
    // vuelve a publicar la MISMA posición con una marca de tiempo más nueva
    // —que es exactamente la que pisaría el movimiento siguiente hecho desde
    // el mando si el docente pulsa dos veces seguidas.
    if (
      pauta &&
      pauta.itemId === item.id &&
      pauta.paso === pos.paso &&
      pauta.enVivo === enVivo
    ) {
      return;
    }
    publicar(item.id, pos.paso, enVivo);
  }, [modoDocente, item, pos.paso, enVivo, publicar, pauta]);

  // Y también sigue al otro portátil, el del mando. El canal no devuelve al
  // emisor sus propios mensajes, así que lo que llega acá viene de allá.
  useEffect(() => {
    if (!modoDocente || !pauta) return;
    const destino = buscarPorId(sesion, pauta.itemId);
    if (!destino) return;
    const conPaso = acotar(sesion, { ...destino, paso: pauta.paso });
    if (comparar(pos, conPaso) !== 0) irA(conPaso);
  }, [modoDocente, pauta, sesion, pos, irA]);

  // El alumno sigue la pauta, salvo que se haya ido a mirar hacia atrás: en
  // ese caso se queda donde está y aparece el botón para volver. Arrastrarlo
  // de vuelta mientras lee algo es peor que dejarlo perderse un ítem.
  useEffect(() => {
    if (modoDocente || !tope) return;
    if (seFueAtras.current) return;
    if (comparar(pos, tope) !== 0) irA(tope);
  }, [modoDocente, tope, pos, irA]);

  const indice = indiceDeItem(sesion, pos);
  const total = totalItems(sesion);
  const pasos = item ? pasosDe(item) : 1;

  /**
   * Una pregunta lanzada al vuelo se disfraza de ítem `pregunta`.
   *
   * No es un atajo: es exactamente la misma cosa, salvo que el texto llegó por
   * el canal en vez de por el YAML. Reutilizar el componente le da gratis los
   * tres estados —respondiendo, revelado, en vivo— y garantiza que una
   * pregunta improvisada no filtre resultados antes de tiempo por haberse
   * dibujado con otro código.
   */
  const improvisada = useMemo<ItemPregunta | null>(
    () =>
      preguntaViva
        ? {
            id: preguntaViva.id,
            tipo: "pregunta",
            pregunta: preguntaViva.pregunta,
            opciones: preguntaViva.opciones,
            visibilidad: "publica",
          }
        : null,
    [preguntaViva],
  );

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* ---------------------------------------------------- Navegación */}
      <nav
        className={`${
          indiceAbierto ? "flex" : "hidden"
        } absolute inset-y-0 left-0 z-20 w-[22rem] shrink-0 flex-col border-r lg:relative lg:flex`}
        style={{ borderColor: "var(--borde)", background: "var(--lienzo-alto)" }}
        aria-label="Índice de la sesión"
      >
        <div
          className="border-b px-5 py-4"
          style={{ borderColor: "var(--borde)" }}
        >
          <Link
            href={modoDocente ? "/profe/inicio" : "/"}
            className="text-xs underline"
            style={{ color: "var(--tinta-suave)" }}
          >
            {modoDocente ? "← Sesiones" : "← Cursos"}
          </Link>
          <p className="mt-2 text-sm font-semibold">
            Sesión {sesion.numero} · {sesion.titulo}
          </p>
          <p className="text-xs" style={{ color: "var(--tinta-suave)" }}>
            {sesion.horaInicio}–{sesion.horaFin} · {total} ítems
          </p>
          {modoDocente && (
            <p
              className="mt-2 text-[11px]"
              style={{ color: "var(--color-aviso)" }}
            >
              Modo docente · sin notas, esta pantalla se comparte
            </p>
          )}
        </div>

        <ol className="flex-1 overflow-y-auto px-2 py-3">
          {sesion.unidades.map((u, iu) => (
            <li key={u.id} className="mb-4">
              <p
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{
                  color:
                    iu === pos.unidad
                      ? "var(--color-acento)"
                      : "var(--tinta-suave)",
                }}
              >
                {/*
                  Los minutos son del docente, y desde que las ventanas de
                  lectura conservan los suyos —son la instrucción a la clase, no
                  el plan— la suma que llega al alumno es PARCIAL. Un total
                  parcial es peor que ninguno: «reto · 12 min» sobre una unidad
                  de cien es un número que miente. Se muestra solo en modo
                  docente, que es donde está completo.
                */}
                {u.tipo}
                {modoDocente && minutosDeUnidad(u) > 0
                  ? ` · ${minutosDeUnidad(u)} min`
                  : ""}
              </p>
              <p className="px-3 pb-1 text-sm font-medium">{u.titulo}</p>

              <ol>
                {u.items.map((it, ii) => {
                  const actual = iu === pos.unidad && ii === pos.item;
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => {
                          irA({ unidad: iu, item: ii, paso: 0 });
                          setIndiceAbierto(false);
                        }}
                        className="flex w-full items-baseline gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-black/20"
                        style={{
                          background: actual ? "var(--lienzo)" : undefined,
                          color: actual ? "var(--tinta)" : "var(--tinta-suave)",
                          fontWeight: actual ? 600 : 400,
                        }}
                        ref={actual ? activo : undefined}
                        aria-current={actual ? "true" : undefined}
                      >
                        <span
                          aria-hidden
                          className="shrink-0 text-[10px]"
                          style={{
                            color:
                              FAMILIA[it.tipo] === "dictado"
                                ? "var(--color-aviso)"
                                : "var(--tinta-suave)",
                          }}
                        >
                          {FAMILIA[it.tipo] === "dictado" ? "◆" : "•"}
                        </span>
                        <span className="truncate">
                          {it.titulo ?? it.id}
                        </span>
                        {it.minutos ? (
                          <span
                            className="ml-auto shrink-0 text-[11px] tabular-nums"
                            style={{ color: "var(--tinta-suave)" }}
                          >
                            {it.minutos}′
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </nav>

      {/* -------------------------------------------------------- Lámina */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center gap-4 border-b px-5 py-3"
          style={{ borderColor: "var(--borde)" }}
        >
          <button
            type="button"
            onClick={() => setIndiceAbierto((v) => !v)}
            className="rounded-md border px-3 py-1.5 text-sm lg:hidden"
            style={{ borderColor: "var(--borde)" }}
          >
            Índice
          </button>

          <p className="min-w-0 truncate text-sm" style={{ color: "var(--tinta-suave)" }}>
            {unidad?.titulo}
          </p>

          {/* Estado del canal. Al alumno le importa saber si sigue conectado;
              al docente, si lo están siguiendo. */}
          <span
            className="ml-auto flex shrink-0 items-center gap-1.5 text-xs"
            style={{
              color:
                estado === "en-vivo"
                  ? "var(--color-acento)"
                  : estado === "reconectando"
                    ? "var(--color-aviso)"
                    : "var(--tinta-suave)",
            }}
            title={estado}
          >
            <span aria-hidden>●</span>
            {estado === "en-vivo"
              ? modoDocente
                ? enVivo
                  ? "En vivo"
                  : "Fuera de vivo"
                : pauta?.enVivo
                  ? "Siguiendo la clase"
                  : "Libre"
              : estado === "reconectando"
                ? "Reconectando"
                : estado === "sin-configurar"
                  ? "Sin sincronía"
                  : "Sin conexión"}
          </span>

          {/*
            Las preguntas de los alumnos NO salen acá aunque esta sea la
            pantalla del docente: es la que se comparte por videollamada, y una
            pregunta lleva el nombre de quien la hizo. Preguntar desde el
            anonimato deja de tener sentido si el nombre acaba proyectado.
            Viven en el mando, que es la pantalla que no ve nadie.
          */}

          {modoDocente && (
            <button
              type="button"
              onClick={() =>
                setVivoLocal({ valor: !enVivo, momento: Date.now() })
              }
              className="shrink-0 rounded-md border px-3 py-1 text-xs"
              style={{
                borderColor: enVivo ? "var(--color-acento)" : "var(--borde)",
                color: enVivo ? "var(--color-acento)" : "var(--tinta-suave)",
              }}
            >
              {enVivo ? "Dictando" : "Ensayando"}
            </button>
          )}

          {/*
            El contador es el salto. Solo para el docente: el alumno lo ve
            igual pero no lo puede pulsar — saltar es marcar el ritmo, y el
            ritmo lo marca quien dicta (§4).
          */}
          {modoDocente ? (
            <SaltarA
              indice={indice}
              total={total}
              pasos={pasos}
              paso={pos.paso}
              onIr={(n) => irA(posicionDeIndice(sesion, n))}
            />
          ) : (
            <p
              className="shrink-0 text-sm tabular-nums"
              style={{ color: "var(--tinta-suave)" }}
            >
              {indice + 1} / {total}
              {pasos > 1 && (
                <span style={{ color: "var(--color-acento)" }}>
                  {" "}
                  · paso {pos.paso + 1}/{pasos}
                </span>
              )}
            </p>
          )}
        </header>

        {/* La barra de avance de la sesión, fina y siempre visible. */}
        <div
          className="h-0.5 w-full"
          style={{ background: "var(--borde)" }}
          role="presentation"
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${((indice + 1) / total) * 100}%`,
              background: "var(--color-acento)",
            }}
          />
        </div>

        <main ref={principal} className="flex-1 overflow-y-auto py-12">
          {item ? (
            <>
              <RenderizarItem
                item={item}
                sesion={sesion}
                unidadActual={unidad?.id}
                paso={pos.paso}
                vivo={{
                  modoDocente,
                  revelado,
                  conectados,
                  respondieron:
                    item.tipo === "pregunta"
                      ? cuantosRespondieron(item.id)
                      : 0,
                  onResponder: (v) =>
                    item.tipo === "pregunta" ? responder(item.id, v) : undefined,
                  onRevelar: () =>
                    item.tipo === "pregunta"
                      ? revelar(item.id, item.respuesta, item.solucion)
                      : undefined,
                  apertura,
                  onAbrir: (segundos: number) => {
                    if (item.tipo === "pregunta") abrir(item.id, segundos);
                  },
                }}
              />
              {/*
                Las notas no llegan a esta pantalla: la ruta de dictado las
                quita en el servidor porque se proyecta por videollamada. Esto
                se queda por si algún día se dicta en una sala donde la
                pantalla del docente no la ve nadie — y entonces bastaría con
                no filtrarlas.
              */}
              {modoDocente && item.notas && (
                <aside className="mx-auto mt-10 max-w-4xl px-6">
                  <div
                    className="rounded-lg border-l-2 py-2 pl-4"
                    style={{ borderColor: "var(--color-aviso)" }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "var(--color-aviso)" }}
                    >
                      Notas
                    </p>
                    <div style={{ color: "var(--tinta-suave)" }}>
                      <Prosa className="mt-1" tamano="base">
                        {item.notas}
                      </Prosa>
                    </div>
                  </div>
                </aside>
              )}
            </>
          ) : (
            <p className="px-6">Esta sesión no tiene ítems.</p>
          )}
        </main>

        <footer
          className="flex items-center gap-3 border-t px-5 py-3"
          style={{ borderColor: "var(--borde)" }}
        >
          <button
            type="button"
            onClick={() => mover(-1)}
            className="rounded-md border px-4 py-2 text-sm"
            style={{ borderColor: "var(--borde)" }}
          >
            ← Anterior
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            className="rounded-md border px-4 py-2 text-sm"
            style={{ borderColor: "var(--borde)" }}
          >
            Siguiente →
          </button>
          {atrasado && (
            <button
              type="button"
              onClick={() => {
                seFueAtras.current = false;
                if (tope) irA(tope);
              }}
              className="rounded-md border px-4 py-2 text-sm font-medium"
              style={{
                borderColor: "var(--color-acento)",
                color: "var(--color-acento)",
              }}
            >
              Volver a donde va la clase →
            </button>
          )}

          <p
            className="ml-auto hidden text-xs sm:block"
            style={{ color: "var(--tinta-suave)" }}
          >
            Flechas ← → para moverte
          </p>
        </footer>
      </div>

      {/* Una pregunta lanzada al vuelo tapa la lámina, en las dos pantallas.
          Tiene que tapar: si conviviera con el contenido, media clase seguiría
          leyendo lo de atrás. Se cierra desde el mando. */}
      {improvisada && (
        <div
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto"
          style={{ background: "var(--lienzo)" }}
        >
          <div className="flex flex-1 flex-col justify-center py-12">
            {/*
              `apertura` y `onAbrir` van acá por lo mismo que en la lámina
              pauteada, y faltaban: sin ellos la pregunta improvisada se
              quedaba para siempre en su primer estado y el botón «Enviar
              pregunta a la clase» **no hacía nada al pulsarlo** — `onAbrir` es
              opcional, así que la llamada se evaporaba sin error. Se dibujaba
              un botón que no era un botón, en la pantalla proyectada, delante
              de la sala esperando la pregunta.
            */}
            <Pregunta
              key={improvisada.id}
              item={improvisada}
              modoDocente={modoDocente}
              revelado={revelado}
              conectados={conectados}
              respondieron={cuantosRespondieron(improvisada.id)}
              onResponder={(v) => responder(improvisada.id, v)}
              onRevelar={() => revelar(improvisada.id)}
              apertura={apertura}
              onAbrir={(segundos) => abrir(improvisada.id, segundos)}
            />
          </div>
        </div>
      )}

      {/* El glosario, en las dos vistas y en todo momento. Un término
          explicado a las 15:40 no sirve a las 18:20, y en clase nadie levanta
          la mano para preguntar qué era la cobertura. */}
      <PanelGlosario terminos={glosario} />

      {/* El alumno puede preguntar desde cualquier ítem. Sin sincronía no hay
          a quién preguntarle, así que el botón no aparece. */}
      {!modoDocente && (
        <Preguntar
          disponible={estado === "en-vivo"}
          itemTitulo={item?.titulo}
          onEnviar={(texto, autor) =>
            item ? preguntar(texto, autor, item.id, item.titulo ?? "", pos.paso) : false
          }
        />
      )}
    </div>
  );
}
