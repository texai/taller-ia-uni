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

import type { Sesion } from "@/lib/tipos";
import { FAMILIA } from "@/lib/tipos";
import {
  acotar,
  avanzar,
  buscarPorId,
  indiceDeItem,
  itemEn,
  pasosDe,
  retroceder,
  totalItems,
  unidadEn,
  type Posicion,
} from "@/lib/navegacion";
import { RenderizarItem } from "@/components/items";

/**
 * La vista de dictado: navegación a la izquierda, un ítem a la vez a la
 * derecha.
 *
 * Se maneja con el teclado porque en clase se pulsa la flecha mirando a la
 * audiencia, no a la pantalla. El índice existe para saltar cuando alguien
 * pregunta por algo de hace veinte minutos, no para recorrer.
 */
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

export function Dictado({ sesion }: { sesion: Sesion }) {
  const [indiceAbierto, setIndiceAbierto] = useState(false);
  const principal = useRef<HTMLDivElement>(null);

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
      irA(direccion === 1 ? avanzar(sesion, pos) : retroceder(sesion, pos));
    },
    [sesion, pos, irA],
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

  const indice = indiceDeItem(sesion, pos);
  const total = totalItems(sesion);
  const pasos = item ? pasosDe(item) : 1;

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
            href="/"
            className="text-xs underline"
            style={{ color: "var(--tinta-suave)" }}
          >
            ← Cursos
          </Link>
          <p className="mt-2 text-sm font-semibold">
            Sesión {sesion.numero} · {sesion.titulo}
          </p>
          <p className="text-xs" style={{ color: "var(--tinta-suave)" }}>
            {sesion.horaInicio}–{sesion.horaFin} · {total} ítems
          </p>
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
                {u.tipo} · {u.minutos ?? 0} min
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

          <p
            className="ml-auto shrink-0 text-sm tabular-nums"
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
            <RenderizarItem
              item={item}
              sesion={sesion}
              unidadActual={unidad?.id}
              paso={pos.paso}
            />
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
          <p
            className="ml-auto hidden text-xs sm:block"
            style={{ color: "var(--tinta-suave)" }}
          >
            Flechas ← → para moverte
          </p>
        </footer>
      </div>
    </div>
  );
}
