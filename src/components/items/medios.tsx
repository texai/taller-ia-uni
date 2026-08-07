import type {
  ItemArchivo,
  ItemDiagrama,
  ItemEnlace,
  ItemImagen,
} from "@/lib/tipos";
import { Caja, Marco } from "./marco";
import { Mermaid } from "./diagrama";

export function Diagrama({ item }: { item: ItemDiagrama }) {
  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <Mermaid fuente={item.contenido ?? ""} />
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
