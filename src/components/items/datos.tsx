import type {
  ItemComparacion,
  ItemCriterios,
  ItemErrorComun,
  ItemModeloDatos,
  ItemTabla,
} from "@/lib/tipos";
import { Caja, Etiqueta, Marco } from "./marco";
import { Markdown, Prosa } from "./texto";

/** Datos, sin más. `resaltar` marca las filas que importan. */
export function Tabla({ item }: { item: ItemTabla }) {
  const resaltadas = new Set(item.resaltar ?? []);

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      {/* La tabla se desborda hacia adentro, no empuja el ancho de la página. */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-lg">
          <thead>
            <tr>
              {item.columnas.map((c) => (
                <th
                  key={c}
                  className="border-b-2 px-4 py-3 text-left text-base font-semibold"
                  style={{
                    borderColor: "var(--borde)",
                    color: "var(--tinta-suave)",
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.filas.map((fila, i) => (
              <tr
                key={i}
                style={
                  resaltadas.has(i)
                    ? { background: "var(--lienzo-alto)" }
                    : undefined
                }
              >
                {/*
                  Las celdas van con markdown: media docena de tablas del curso
                  son de comandos y de nombres de campo, y sin comillas
                  invertidas se leen en la tipografía del texto, que es
                  exactamente donde un guion doble deja de distinguirse de uno
                  solo.
                */}
                {fila.map((celda, j) => (
                  <td
                    key={j}
                    className="border-b px-4 py-3 align-top tabular-nums"
                    style={{
                      borderColor: "var(--borde)",
                      fontWeight: resaltadas.has(i) ? 600 : 400,
                    }}
                  >
                    <Prosa tamano="lg">{String(celda)}</Prosa>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Marco>
  );
}

/** Tablas con sus columnas. Se dibuja, no se describe. */
export function ModeloDatos({ item }: { item: ItemModeloDatos }) {
  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <div className="grid gap-5 sm:grid-cols-2">
        {item.tablas.map((tabla) => (
          <Caja key={tabla.nombre} className="!p-0 overflow-hidden">
            <div
              className="border-b px-5 py-3"
              style={{ borderColor: "var(--borde)" }}
            >
              <p className="font-mono text-lg font-semibold">{tabla.nombre}</p>
              {tabla.descripcion && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--tinta-suave)" }}
                >
                  {tabla.descripcion}
                </p>
              )}
            </div>
            <ul className="divide-y" style={{ borderColor: "var(--borde)" }}>
              {tabla.columnas.map((col) => (
                <li
                  key={col.nombre}
                  className="flex flex-wrap items-baseline gap-x-3 px-5 py-2.5"
                  style={{ borderColor: "var(--borde)" }}
                >
                  <span className="font-mono text-base">{col.nombre}</span>
                  <span
                    className="font-mono text-sm"
                    style={{ color: "var(--color-acento)" }}
                  >
                    {col.tipo}
                  </span>
                  {col.nota && (
                    <span
                      className="w-full text-sm"
                      style={{ color: "var(--tinta-suave)" }}
                    >
                      {col.nota}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Caja>
        ))}
      </div>
    </Marco>
  );
}

/**
 * Dos lados, uno al lado del otro.
 *
 * Existe porque la mitad de lo que enseña este taller es un contraste, y dos
 * ítems de markdown seguidos pierden justo eso.
 */
export function Comparacion({ item }: { item: ItemComparacion }) {
  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <div className="grid gap-5 sm:grid-cols-2">
        {[item.izquierda, item.derecha].map((lado, i) => (
          <Caja key={i} tono={i === 1 ? "acento" : undefined}>
            <h3 className="text-xl font-semibold">{lado.titulo}</h3>
            <div className="mt-3">
              <Markdown>{lado.contenido}</Markdown>
            </div>
          </Caja>
        ))}
      </div>
    </Marco>
  );
}

/** Criterios de aceptación. El alumno sabe cuándo terminó, sin preguntar. */
export function Criterios({ item }: { item: ItemCriterios }) {
  return (
    <Marco titulo={item.titulo ?? "Cuándo terminaste"} entradilla={item.entradilla}>
      <ul className="space-y-4">
        {item.criterios.map((c, i) => (
          <li key={i} className="flex gap-4">
            <span
              aria-hidden
              className="mt-1 shrink-0 text-xl"
              style={{ color: "var(--color-acento)" }}
            >
              ☐
            </span>
            <div>
              <p className="text-lg leading-relaxed">{c.texto}</p>
              {c.pista && (
                <p
                  className="mt-1 text-base"
                  style={{ color: "var(--tinta-suave)" }}
                >
                  {c.pista}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Marco>
  );
}

/**
 * Un error que va a ocurrir, con su síntoma y su arreglo.
 *
 * Anticiparlo convierte "se me rompió" en "ah, es la del pipe".
 */
export function ErrorComun({ item }: { item: ItemErrorComun }) {
  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla}>
      <Caja tono="aviso">
        <Etiqueta>Lo que ves</Etiqueta>
        <pre
          className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-base leading-relaxed"
          style={{ color: "var(--color-aviso)" }}
        >
          {item.sintoma}
        </pre>

        <div className="mt-6">
          <Etiqueta>Qué significa</Etiqueta>
          <p className="mt-2 text-lg leading-relaxed">{item.causa}</p>
        </div>

        <div className="mt-6">
          <Etiqueta>Qué hacer</Etiqueta>
          <p className="mt-2 text-lg leading-relaxed">{item.arreglo}</p>
        </div>
      </Caja>
    </Marco>
  );
}
