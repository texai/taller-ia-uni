import type {
  ItemArchivo,
  ItemDiagrama,
  ItemDiagramaSecuencia,
  ItemEnlace,
  ItemImagen,
} from "@/lib/tipos";
import { Caja, Etiqueta, Marco } from "./marco";
import { Mermaid } from "./diagrama";

export function Diagrama({ item }: { item: ItemDiagrama }) {
  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <Mermaid fuente={item.contenido ?? ""} />
    </Marco>
  );
}

/**
 * Diagrama de secuencia en PlantUML.
 *
 * Acá se muestra la fuente y los mensajes enumerados. El recorrido enfocado
 * —uno a la vez, con el resto atenuado— y la imagen generada en construcción
 * los agrega el batch 13, apoyándose en los pasos internos del batch 6.
 */
export function DiagramaSecuencia({
  item,
  paso = 0,
}: {
  item: ItemDiagramaSecuencia;
  paso?: number;
}) {
  // paso 0 es el diagrama completo; a partir de 1, un mensaje enfocado. El
  // recorrido dibujado lo agrega el batch 13.
  const mensajes = item.mensajes ?? [];
  const enfocado = paso > 0 ? paso - 1 : null;

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <Caja>
        <Etiqueta>Fuente PlantUML</Etiqueta>
        <pre className="mt-3 overflow-x-auto font-mono text-sm leading-relaxed">
          {item.fuente}
        </pre>
      </Caja>

      {mensajes.length > 0 && (
        <ol className="mt-6 space-y-3">
          {mensajes.map((m, i) => (
            <li
              key={i}
              className="flex gap-4 transition-opacity"
              style={{ opacity: enfocado === null || enfocado === i ? 1 : 0.3 }}
            >
              <span
                className="shrink-0 tabular-nums font-mono text-sm"
                style={{ color: "var(--tinta-suave)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-lg leading-relaxed">{m.explicacion}</p>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-6 text-sm" style={{ color: "var(--tinta-suave)" }}>
        El recorrido mensaje a mensaje llega con el batch 13.
      </p>
    </Marco>
  );
}

export function Imagen({ item }: { item: ItemImagen }) {
  const [x, y, ancho, alto] = item.destacar ?? [];

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <figure>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/contenido/${item.archivo}`}
            alt={item.pie ?? item.titulo ?? ""}
            className="w-full rounded-xl border"
            style={{ borderColor: "var(--borde)" }}
          />
          {item.destacar && (
            <span
              aria-hidden
              className="pointer-events-none absolute rounded border-2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${ancho}%`,
                height: `${alto}%`,
                borderColor: "var(--color-acento)",
              }}
            />
          )}
        </div>
        {item.pie && (
          <figcaption
            className="mt-3 text-base"
            style={{ color: "var(--tinta-suave)" }}
          >
            {item.pie}
          </figcaption>
        )}
      </figure>
    </Marco>
  );
}

export function Enlace({ item }: { item: ItemEnlace }) {
  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla}>
      <Caja>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-xl font-medium underline"
          style={{ color: "var(--color-acento)" }}
        >
          {item.url}
        </a>
        {item.descripcion && (
          <p className="mt-3 text-lg leading-relaxed">{item.descripcion}</p>
        )}
      </Caja>
    </Marco>
  );
}

export function Archivo({ item }: { item: ItemArchivo }) {
  const nombre = item.archivo.split("/").pop() ?? item.archivo;
  const extension = nombre.split(".").pop()?.toUpperCase() ?? "";

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla}>
      <Caja>
        <a
          href={`/contenido/${item.archivo}`}
          download
          className="flex items-center gap-4"
        >
          <span
            className="rounded-lg border px-3 py-2 font-mono text-sm font-semibold"
            style={{
              borderColor: "var(--color-acento)",
              color: "var(--color-acento)",
            }}
          >
            {extension}
          </span>
          <span className="text-xl font-medium underline">{nombre}</span>
        </a>
        {item.descripcion && (
          <p className="mt-4 text-lg leading-relaxed">{item.descripcion}</p>
        )}
      </Caja>
    </Marco>
  );
}
