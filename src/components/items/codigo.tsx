
import type {
  ItemCodigo,
  ItemComandoAnotado,
  ItemDemo,
  ItemTerminal,
} from "@/lib/tipos";
import { llave, trocear, ubicar, type Trozo } from "@/lib/anotaciones";
import { comoTextoPlano, recortar } from "@/lib/resaltado";
import { Caja, Etiqueta, Marco } from "./marco";
import { Prosa } from "./texto";

/**
 * Un fragmento de código.
 *
 * SÍNCRONO a propósito. El resaltado lo hizo `resaltarSesion` en el servidor y
 * viaja dentro del ítem: un componente asíncrono acá revienta al hidratar,
 * porque `Dictado` es de cliente y arrastra a este al navegador. Ver
 * `src/lib/resaltado.ts`.
 */
export function Codigo({ item }: { item: ItemCodigo }) {
  // Si falta el resaltado, el código se muestra igual, sin color. Una lámina
  // sin colores es un contratiempo; una lámina en blanco es una clase parada.
  const html =
    item.html ?? comoTextoPlano(recortar(item.contenido ?? "", item.lineas));

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
export function Terminal({ item }: { item: ItemTerminal }) {
  const html = item.htmlComando ?? comoTextoPlano(item.comando);
  const htmlWin =
    item.htmlWindows ??
    (item.comandoWindows ? comoTextoPlano(item.comandoWindows) : null);

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
 * El paso 0 lo muestra entero. Del 1 en adelante se enfoca una parte: resaltada
 * dentro del comando, con una llave debajo señalándola y el resto atenuado pero
 * **visible**. Esa es toda la idea: ver la parte sin perder el todo. Citar el
 * trozo suelto en una viñeta es exactamente lo que no enseña dónde va.
 *
 * La llave se dibuja con caracteres, no con CSS. El comando va en
 * monoespaciada, así que contar columnas alinea exacto — y de paso es como se
 * anota en un terminal, que es donde el alumno va a ver estos comandos.
 */
export function ComandoAnotado({
  item,
  paso = 0,
}: {
  item: ItemComandoAnotado;
  paso?: number;
}) {
  const indice = paso > 0 ? paso - 1 : null;
  const enfocado = indice === null ? null : item.segmentos[indice];
  const trozos = trocear(item.comando, item.segmentos);
  const donde = enfocado ? ubicar(item.comando, enfocado.texto) : null;

  /**
   * El comando se encoge para caber, en vez de desplazarse.
   *
   * Un comando de noventa caracteres no entra a 17px, y la salida fácil —una
   * barra de desplazamiento horizontal— es la peor de todas proyectando: hay
   * que arrastrar con el ratón delante de la clase, y la mitad del comando
   * está fuera de pantalla justo cuando se explica la otra mitad. Envolver
   * tampoco sirve, porque rompería la alineación de la llave. Encoger sí: la
   * llave usa la misma tipografía y se encoge con él.
   */
  const largo = Math.max(...item.comando.split("\n").map((l) => l.length), 1);
  const tamano = Math.max(11, Math.min(19, 860 / (0.6 * largo)));

  // Bajo qué línea va la llave. `null` cuando el segmento cruza un salto de
  // línea: ahí no hay una columna sola que señalar, así que se resalta y ya.
  const lineaLlave = donde?.ancho != null ? donde.linea : null;

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <div
        className="overflow-x-auto rounded-xl border px-5 py-4"
        style={{ borderColor: "var(--borde)", background: "var(--lienzo-alto)" }}
      >
        <pre
          className="font-mono leading-relaxed"
          style={{ fontSize: `${tamano.toFixed(1)}px` }}
        >
          <code>
            {/*
              El comando se recorre por LÍNEAS y no de un tirón, porque la
              llave tiene que quedar justo debajo de la suya. Cada línea se
              rearma a partir de los trozos que le tocan.
            */}
            {partirEnLineas(trozos).map((linea, iLinea) => (
              <span key={iLinea}>
                {linea.map((trozo, iTrozo) => {
                  const suyo = trozo.segmento === indice;
                  const anotado = trozo.segmento !== null;
                  return (
                    <span
                      key={iTrozo}
                      style={{
                        color:
                          indice === null
                            ? anotado
                              ? "var(--color-acento)"
                              : "var(--tinta)"
                            : suyo
                              ? "var(--color-acento)"
                              : "var(--tinta-suave)",
                        fontWeight: suyo ? 700 : 400,
                        opacity: indice !== null && !suyo ? 0.55 : 1,
                        background: suyo ? "var(--lienzo)" : undefined,
                        borderRadius: suyo ? 3 : undefined,
                      }}
                    >
                      {trozo.texto}
                    </span>
                  );
                })}
                {"\n"}
                {lineaLlave === iLinea && donde?.ancho != null && (
                  <span style={{ color: "var(--color-acento)" }}>
                    {llave(donde.columna, donde.ancho)}
                    {"\n"}
                  </span>
                )}
              </span>
            ))}
          </code>
        </pre>
      </div>

      {/* La explicación de la parte enfocada, grande y sola. */}
      {enfocado && (
        <div
          className="mt-6 border-l-2 pl-5"
          style={{ borderColor: "var(--color-acento)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-acento)" }}
          >
            {indice !== null && `${indice + 1} / ${item.segmentos.length}`}
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">{enfocado.texto}</p>
          <Prosa className="mt-2" tamano="xl">
            {enfocado.explicacion}
          </Prosa>
          {enfocado.otrosValores?.length ? (
            <p
              className="mt-3 font-mono text-base"
              style={{ color: "var(--tinta-suave)" }}
            >
              También acepta: {enfocado.otrosValores.join("   ")}
            </p>
          ) : null}
        </div>
      )}

      {/* En el paso 0 se listan todas, para tener el mapa antes del recorrido. */}
      {!enfocado && (
        <dl className="mt-6 space-y-4">
          {item.segmentos.map((seg) => (
            <div
              key={seg.texto}
              className="border-l-2 pl-5"
              style={{ borderColor: "var(--borde)" }}
            >
              <dt className="font-mono text-base font-semibold">{seg.texto}</dt>
              <dd className="mt-1">
                <Prosa tamano="lg">{seg.explicacion}</Prosa>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Marco>
  );
}

/**
 * Reparte los trozos por línea, cortando los que abarcan más de una.
 *
 * Un comando de varias líneas suele llevar `\` al final de cada una, y un
 * segmento de relleno se lleva por delante ese salto. Sin este reparto, la
 * llave se dibujaría después de todo el bloque en vez de debajo de su línea.
 */
function partirEnLineas(trozos: Trozo[]): Trozo[][] {
  const lineas: Trozo[][] = [[]];
  for (const trozo of trozos) {
    const partes = trozo.texto.split("\n");
    partes.forEach((parte, i) => {
      if (i > 0) lineas.push([]);
      if (parte) lineas[lineas.length - 1]?.push({ ...trozo, texto: parte });
    });
  }
  return lineas;
}

/**
 * Un momento de demostración en vivo.
 *
 * Distinto de `terminal`: acá el docente ejecuta delante de todos. Lleva el
 * respaldo por si falla, que es lo que convierte una demo caída en una
 * anécdota en vez de en cinco minutos incómodos.
 */
export function Demo({ item }: { item: ItemDemo }) {
  const pasos = item.pasos.map((p) => ({
    ...p,
    html: p.html ?? comoTextoPlano(p.comando),
  }));

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
          <Prosa className="mt-2" tamano="lg">
            {item.observar}
          </Prosa>
        </div>
      )}

      {item.respaldo && (
        <div className="mt-6" style={{ color: "var(--tinta-suave)" }}>
          <Etiqueta>Si falla en vivo</Etiqueta>
          <Prosa className="mt-2" tamano="base">
            {item.respaldo}
          </Prosa>
        </div>
      )}
    </Marco>
  );
}
