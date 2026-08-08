import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type {
  ItemCitaAgente,
  ItemMarkdown,
  ItemMetrica,
  ItemTitulo,
  ItemTransicion,
  Sesion,
} from "@/lib/tipos";
import { minutosDeUnidad } from "@/lib/navegacion";
import { Caja, Etiqueta, Marco } from "./marco";

/** Un corte de sección. Una idea sola, centrada, sin nada que la acompañe. */
export function Titulo({ item }: { item: ItemTitulo }) {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col justify-center px-6">
      <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        {item.titulo}
      </h1>
      {item.entradilla && (
        <p
          className="mt-6 text-xl sm:text-2xl"
          style={{ color: "var(--tinta-suave)" }}
        >
          {item.entradilla}
        </p>
      )}
      {item.destacado && (
        <p
          className="mt-8 text-2xl font-medium sm:text-3xl"
          style={{ color: "var(--color-acento)" }}
        >
          {item.destacado}
        </p>
      )}
    </section>
  );
}

/**
 * Los enlaces del material salen en una pestaña nueva.
 *
 * Sin esto, pulsar el GitHub de la ficha del docente —o cualquier enlace del
 * curso— **navega fuera de la lámina**. Proyectando eso no es una molestia:
 * es perder la posición del dictado delante de la clase y tener que volver
 * con el botón de atrás mientras veinte personas miran.
 *
 * Solo los externos. Un ancla interna que abriera pestaña sería peor que el
 * problema que se está resolviendo.
 *
 * `noreferrer` va con `noopener` por costumbre y porque no cuesta nada: el
 * segundo evita que la pestaña abierta pueda tocar la que la abrió.
 */
const ENLACES_FUERA = {
  a({ href, children, ...resto }: React.ComponentProps<"a">) {
    const externo = /^https?:\/\//.test(href ?? "");
    return (
      <a
        href={href}
        {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...resto}
      >
        {children}
      </a>
    );
  },
} as const;

/**
 * Markdown renderizado.
 *
 * Los estilos van acá y no en una hoja global porque el markdown del curso
 * aparece dentro de otros ítems (comparaciones, criterios) y tiene que
 * comportarse igual en todos.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="[&_p]:my-4 [&_p]:text-lg [&_p]:leading-relaxed [&_li]:text-lg [&_li]:leading-relaxed [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_strong]:font-semibold [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-5 [&_blockquote]:italic [&_table]:my-4 [&_table]:w-full [&_th]:border-b [&_th]:py-2 [&_th]:text-left [&_td]:border-b [&_td]:py-2 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={ENLACES_FUERA}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Un párrafo suelto que además admite markdown.
 *
 * Existe porque explicar un comando sin poder escribir `--rm` entre comillas
 * invertidas no se puede: los campos que describen comandos —la explicación de
 * un segmento anotado, el "qué hay que ver" de una demo— se escriben con
 * markdown por reflejo, y hasta que esto existió salían proyectados con los
 * asteriscos y las comillas a la vista.
 *
 * No reutiliza `Markdown` porque aquel fija el tamaño del párrafo y acá el
 * tamaño lo pone quien llama. Dos juegos de clases sobre el mismo elemento se
 * resuelven por orden en la hoja, que es una forma de perder en silencio.
 *
 * Las clases van enteras y literales en el mapa: Tailwind lee el código fuente
 * como texto, así que una clase compuesta con una plantilla no se genera.
 */
const TAMANO_PROSA = {
  base: "[&_p]:text-base [&_li]:text-base",
  lg: "[&_p]:text-lg [&_li]:text-lg",
  xl: "[&_p]:text-xl [&_li]:text-xl",
  // Para un enunciado que hace de título. Las preguntas llevan `código` y
  // negritas desde siempre, y como `<h2>` salían con los acentos graves
  // puestos — que en una pregunta proyectada distrae justo cuando hay que
  // leerla rápido.
  titulo:
    "[&_p]:text-3xl [&_p]:font-semibold [&_p]:tracking-tight sm:[&_p]:text-5xl",
} as const;

export function Prosa({
  children,
  className = "",
  tamano = "lg",
}: {
  children: string;
  className?: string;
  tamano?: keyof typeof TAMANO_PROSA;
}) {
  return (
    <div
      className={`${className} ${TAMANO_PROSA[tamano]} [&_p]:leading-relaxed [&_p]:my-0 [&_p+p]:mt-3 [&_strong]:font-semibold [&_a]:underline [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_code]:px-0.5 [&_code]:text-[0.92em] [&_code]:font-mono`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={ENLACES_FUERA}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function BloqueMarkdown({ item }: { item: ItemMarkdown }) {
  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="estrecho">
      <Markdown>{item.contenido ?? ""}</Markdown>
    </Marco>
  );
}

/** Un número grande y lo que significa. */
export function Metrica({ item }: { item: ItemMetrica }) {
  const color =
    item.tono === "malo"
      ? "var(--color-alerta)"
      : item.tono === "bueno"
        ? "var(--color-acento)"
        : "var(--tinta)";

  return (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-4xl flex-col justify-center px-6">
      {item.titulo && <Etiqueta>{item.titulo}</Etiqueta>}
      <p
        className="mt-4 text-7xl font-semibold tabular-nums tracking-tight sm:text-8xl"
        style={{ color }}
      >
        {item.valor}
      </p>
      {item.unidad && (
        <p className="mt-3 text-xl sm:text-2xl">{item.unidad}</p>
      )}
      {item.contexto && (
        <p
          className="mt-6 text-lg sm:text-xl"
          style={{ color: "var(--tinta-suave)" }}
        >
          {item.contexto}
        </p>
      )}
    </section>
  );
}

/**
 * El puente entre dos unidades.
 *
 * Además de la prosa dibuja el mapa de la sesión. Ese mapa NO se declara en el
 * YAML: se deriva de dónde está el ítem. Declararlo obligaría a mantener a mano
 * algo que el programa ya sabe, y quedaría desactualizado la primera vez que se
 * reordene una unidad.
 */
export function Transicion({
  item,
  sesion,
  unidadActual,
}: {
  item: ItemTransicion;
  sesion?: Sesion;
  unidadActual?: string;
}) {
  const indice = sesion?.unidades.findIndex((u) => u.id === unidadActual) ?? -1;

  return (
    <Marco titulo={item.titulo}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Caja>
          <Etiqueta>Lo que vimos</Etiqueta>
          <p className="mt-3 text-lg leading-relaxed">{item.vimos}</p>
        </Caja>
        <Caja tono="acento">
          <Etiqueta>Lo que viene</Etiqueta>
          <p className="mt-3 text-lg leading-relaxed">{item.viene}</p>
        </Caja>
      </div>

      {sesion && indice >= 0 && (
        <ol className="mt-8 space-y-2">
          {sesion.unidades.map((u, i) => {
            const estado =
              i < indice ? "cerrada" : i === indice ? "actual" : "pendiente";
            return (
              <li
                key={u.id}
                className="flex items-baseline gap-3 text-base sm:text-lg"
                style={{
                  color:
                    estado === "pendiente"
                      ? "var(--tinta-suave)"
                      : "var(--tinta)",
                  opacity: estado === "pendiente" ? 0.55 : 1,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    color:
                      estado === "cerrada"
                        ? "var(--color-acento)"
                        : estado === "actual"
                          ? "var(--tinta)"
                          : "var(--tinta-suave)",
                  }}
                >
                  {estado === "cerrada" ? "✓" : estado === "actual" ? "▸" : "·"}
                </span>
                <span className={estado === "actual" ? "font-medium" : ""}>
                  {u.titulo}
                </span>
                {minutosDeUnidad(u) > 0 && (
                  <span
                    className="ml-auto text-sm tabular-nums"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    {minutosDeUnidad(u)} min
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Marco>
  );
}

/**
 * Cita textual de una ejecución del agente.
 *
 * Se marca como literal a propósito: este taller tiene material que no se
 * puede inventar, y hay que dejar claro que no es una paráfrasis nuestra.
 */
export function CitaAgente({ item }: { item: ItemCitaAgente }) {
  return (
    <Marco titulo={item.titulo} ancho="estrecho">
      <figure>
        <blockquote
          className="rounded-xl border-l-4 py-2 pl-6 pr-2 text-xl italic leading-relaxed sm:text-2xl"
          style={{ borderColor: "var(--color-acento)" }}
        >
          {item.cita}
        </blockquote>
        {item.procedencia && (
          <figcaption
            className="mt-4 text-sm"
            style={{ color: "var(--tinta-suave)" }}
          >
            Textual — {item.procedencia}
          </figcaption>
        )}
      </figure>
      {item.comentario && (
        <p className="mt-6 text-lg leading-relaxed">{item.comentario}</p>
      )}
    </Marco>
  );
}
