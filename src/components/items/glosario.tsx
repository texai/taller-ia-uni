"use client";

import { useEffect, useState } from "react";

import type { ItemGlosario, Termino } from "@/lib/tipos";
import { Marco } from "./marco";
import { Prosa } from "./texto";

/**
 * Una entrada del glosario.
 *
 * El `ojo` va en su propia caja y con su etiqueta porque casi nunca es un
 * matiz: es la corrección de lo que la sala cree que significa el término. En
 * varias entradas es la mitad útil, y mezclado con la definición se lee como
 * una coletilla.
 */
function Entrada({ t, compacta = false }: { t: Termino; compacta?: boolean }) {
  return (
    <div
      className="border-l-2 pl-4"
      style={{ borderColor: "var(--color-acento)" }}
    >
      <p className="flex flex-wrap items-baseline gap-x-3">
        <span
          className={compacta ? "text-base font-semibold" : "text-xl font-semibold"}
        >
          {t.termino}
        </span>
        {t.expansion && (
          <span className="text-sm" style={{ color: "var(--tinta-suave)" }}>
            {t.expansion}
          </span>
        )}
        {t.tambien && (
          <span
            className="font-mono text-sm"
            style={{ color: "var(--tinta-suave)" }}
          >
            · {t.tambien}
          </span>
        )}
      </p>

      <Prosa className="mt-1" tamano={compacta ? "base" : "lg"}>
        {t.definicion}
      </Prosa>

      {t.ojo && (
        <div className="mt-2">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-aviso)" }}
          >
            Ojo
          </p>
          <Prosa tamano={compacta ? "base" : "lg"}>{t.ojo}</Prosa>
        </div>
      )}
    </div>
  );
}

/** Una selección del glosario, como lámina. */
export function Glosario({ item }: { item: ItemGlosario }) {
  const entradas = item.entradas ?? [];
  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      {/* En dos columnas desde tres términos: cuatro definiciones apiladas en
          una columna dejan media lámina vacía y obligan a desplazar. */}
      <div
        className={
          entradas.length > 2
            ? "grid gap-6 md:grid-cols-2"
            : "flex flex-col gap-6"
        }
      >
        {entradas.map((t) => (
          <Entrada key={t.termino} t={t} compacta={entradas.length > 2} />
        ))}
      </div>
    </Marco>
  );
}

/**
 * El glosario entero, siempre a mano.
 *
 * Un término explicado una vez a las 15:40 no sirve a las 18:20, y esa es toda
 * la razón de que esto exista además de las láminas: durante ocho horas hay
 * alguien que no quiere levantar la mano para preguntar qué era la cobertura.
 *
 * Se abre y se cierra sin tocar la posición de la clase — buscar una palabra
 * no debería costar el sitio donde uno estaba.
 */
export function PanelGlosario({ terminos }: { terminos: Termino[] }) {
  const [abierto, setAbierto] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!abierto) return;
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alTeclado);
    return () => window.removeEventListener("keydown", alTeclado);
  }, [abierto]);

  if (!terminos.length) return null;

  const q = busca.trim().toLowerCase();
  const visibles = q
    ? terminos.filter((t) =>
        `${t.termino} ${t.expansion ?? ""} ${t.tambien ?? ""} ${t.definicion}`
          .toLowerCase()
          .includes(q),
      )
    : terminos;

  // Agrupados, y en el orden en que aparecen los grupos en el archivo: es el
  // orden del curso, y ordenarlos alfabéticamente lo perdería.
  const grupos: { nombre: string; items: Termino[] }[] = [];
  for (const t of visibles) {
    const nombre = t.grupo ?? "Otros";
    const ya = grupos.find((g) => g.nombre === nombre);
    if (ya) ya.items.push(t);
    else grupos.push({ nombre, items: [t] });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="fixed bottom-20 right-6 z-30 rounded-full border px-5 py-3 text-sm font-medium shadow-lg"
        style={{
          borderColor: "var(--borde)",
          background: "var(--lienzo-alto)",
          color: "var(--tinta)",
        }}
      >
        Glosario
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-40 flex justify-end"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setAbierto(false)}
        >
          <aside
            className="flex h-full w-full max-w-xl flex-col border-l"
            style={{
              borderColor: "var(--borde)",
              background: "var(--lienzo)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <header
              className="flex items-center gap-3 border-b px-6 py-4"
              style={{ borderColor: "var(--borde)" }}
            >
              <h2 className="text-lg font-semibold">Glosario</h2>
              <span className="text-sm" style={{ color: "var(--tinta-suave)" }}>
                {terminos.length} términos
              </span>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="ml-auto rounded-md border px-3 py-1.5 text-sm"
                style={{ borderColor: "var(--borde)" }}
              >
                Cerrar
              </button>
            </header>

            <div className="px-6 pt-4">
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar un término…"
                className="w-full rounded-lg border px-4 py-2.5 text-base"
                style={{
                  borderColor: "var(--borde)",
                  background: "var(--lienzo-alto)",
                  color: "var(--tinta)",
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {!visibles.length && (
                <p style={{ color: "var(--tinta-suave)" }}>
                  Ningún término coincide con «{busca}».
                </p>
              )}
              {grupos.map((g) => (
                <section key={g.nombre} className="mb-8">
                  <p
                    className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    {g.nombre}
                  </p>
                  <div className="flex flex-col gap-5">
                    {g.items.map((t) => (
                      <Entrada key={t.termino} t={t} compacta />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
