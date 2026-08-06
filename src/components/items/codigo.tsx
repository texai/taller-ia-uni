import { codeToHtml } from "shiki";

import type {
  ItemCodigo,
  ItemComandoAnotado,
  ItemDemo,
  ItemTerminal,
} from "@/lib/tipos";
import { Caja, Etiqueta, Marco } from "./marco";

/**
 * Resaltado en el servidor.
 *
 * Shiki corre al construir y devuelve HTML: al navegador no llega ni una línea
 * de JavaScript para pintar código. En una aplicación que se proyecta desde el
 * portátil del docente sobre el wifi de un aula, cada kilobyte que no se envía
 * es un problema que no puede ocurrir.
 */
async function resaltar(codigo: string, lenguaje: string): Promise<string> {
  try {
    return await codeToHtml(codigo.trimEnd(), {
      lang: lenguaje,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
  } catch {
    // Un lenguaje que Shiki no conoce no puede tumbar la lámina.
    const escapado = codigo
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre><code>${escapado}</code></pre>`;
  }
}

/** Recorta `lineas: "12-34"` sobre el contenido. */
function recortar(codigo: string, lineas?: string): string {
  if (!lineas) return codigo;
  const [desde, hasta] = lineas.split("-").map((n) => Number(n.trim()));
  if (!desde) return codigo;
  return codigo
    .split("\n")
    .slice(desde - 1, hasta ?? desde)
    .join("\n");
}

export async function Codigo({ item }: { item: ItemCodigo }) {
  const fuente = recortar(item.contenido ?? "", item.lineas);
  const html = await resaltar(fuente, item.lenguaje);

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--borde)" }}
      >
        {item.ruta && (
          <div
            className="border-b px-5 py-2.5 font-mono text-sm"
            style={{
              borderColor: "var(--borde)",
              background: "var(--lienzo-alto)",
              color: "var(--tinta-suave)",
            }}
          >
            {item.ruta}
            {item.lineas && <span className="ml-2">· líneas {item.lineas}</span>}
          </div>
        )}
        <div
          className="overflow-x-auto p-5 text-[15px] leading-relaxed [&_pre]:!bg-transparent"
          style={{ background: "var(--lienzo-alto)" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </Marco>
  );
}

/** Un comando, con su salida si vale la pena mostrarla. */
export async function Terminal({ item }: { item: ItemTerminal }) {
  const html = await resaltar(item.comando, "bash");
  const htmlWin = item.comandoWindows
    ? await resaltar(item.comandoWindows, "powershell")
    : null;

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--borde)" }}
      >
        <div
          className="overflow-x-auto px-5 py-4 text-[15px] [&_pre]:!bg-transparent"
          style={{ background: "var(--lienzo-alto)" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {htmlWin && (
          <div
            className="border-t"
            style={{ borderColor: "var(--borde)" }}
          >
            <div className="px-5 pt-3">
              <Etiqueta>Windows</Etiqueta>
            </div>
            <div
              className="overflow-x-auto px-5 pb-4 pt-1 text-[15px] [&_pre]:!bg-transparent"
              style={{ background: "var(--lienzo-alto)" }}
              dangerouslySetInnerHTML={{ __html: htmlWin }}
            />
          </div>
        )}

        {item.salida && (
          <div
            className="border-t px-5 py-4"
            style={{ borderColor: "var(--borde)" }}
          >
            <Etiqueta>Salida</Etiqueta>
            <pre
              className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[15px] leading-relaxed"
              style={{ color: "var(--tinta-suave)" }}
            >
              {item.salida}
            </pre>
          </div>
        )}
      </div>

      {item.duracion !== undefined && (
        <p className="mt-3 text-sm" style={{ color: "var(--tinta-suave)" }}>
          Tarda unos {item.duracion} segundos.
        </p>
      )}
    </Marco>
  );
}

/**
 * Un comando largo, explicado parte por parte.
 *
 * Acá se dibuja completo, con las anotaciones listadas debajo. El recorrido
 * enfocado —una parte a la vez, con el resto atenuado— lo agrega el batch 14
 * apoyándose en los pasos internos del batch 6.
 */
export function ComandoAnotado({
  item,
  paso = 0,
}: {
  item: ItemComandoAnotado;
  paso?: number;
}) {
  // paso 0 es el comando entero; a partir de 1, un segmento enfocado. El
  // recorrido completo con la llave señalando la parte es el batch 14.
  const enfocado = paso > 0 ? item.segmentos[paso - 1] : null;

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <div
        className="overflow-x-auto rounded-xl border px-5 py-4"
        style={{ borderColor: "var(--borde)", background: "var(--lienzo-alto)" }}
      >
        <code className="font-mono text-[17px] leading-relaxed">
          {item.comando}
        </code>
      </div>

      <dl className="mt-6 space-y-4">
        {item.segmentos.map((seg) => (
          <div
            key={seg.texto}
            className="border-l-2 pl-5 transition-opacity"
            style={{
              borderColor: "var(--color-acento)",
              opacity: !enfocado || enfocado.texto === seg.texto ? 1 : 0.3,
            }}
          >
            <dt className="font-mono text-base font-semibold">{seg.texto}</dt>
            <dd className="mt-1 text-lg leading-relaxed">{seg.explicacion}</dd>
            {seg.otrosValores?.length ? (
              <dd
                className="mt-1.5 font-mono text-sm"
                style={{ color: "var(--tinta-suave)" }}
              >
                También acepta: {seg.otrosValores.join(" · ")}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </Marco>
  );
}

/**
 * Un momento de demostración en vivo.
 *
 * Distinto de `terminal`: acá el docente ejecuta delante de todos. Lleva el
 * respaldo por si falla, que es lo que convierte una demo caída en una
 * anécdota en vez de en cinco minutos incómodos.
 */
export async function Demo({ item }: { item: ItemDemo }) {
  const pasos = await Promise.all(
    item.pasos.map(async (p) => ({
      ...p,
      html: await resaltar(p.comando, "bash"),
    })),
  );

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <Caja tono="acento">
        <Etiqueta>En vivo</Etiqueta>
        <ol className="mt-4 space-y-4">
          {pasos.map((paso, i) => (
            <li key={i}>
              <div
                className="overflow-x-auto text-[15px] [&_pre]:!bg-transparent"
                dangerouslySetInnerHTML={{ __html: paso.html }}
              />
              {paso.esperado && (
                <pre
                  className="mt-1.5 overflow-x-auto whitespace-pre-wrap font-mono text-sm"
                  style={{ color: "var(--tinta-suave)" }}
                >
                  {paso.esperado}
                </pre>
              )}
            </li>
          ))}
        </ol>
      </Caja>

      {item.observar && (
        <div className="mt-6">
          <Etiqueta>Qué hay que ver</Etiqueta>
          <p className="mt-2 text-lg leading-relaxed">{item.observar}</p>
        </div>
      )}

      {item.respaldo && (
        <div className="mt-6">
          <Etiqueta>Si falla en vivo</Etiqueta>
          <p
            className="mt-2 text-base leading-relaxed"
            style={{ color: "var(--tinta-suave)" }}
          >
            {item.respaldo}
          </p>
        </div>
      )}
    </Marco>
  );
}
