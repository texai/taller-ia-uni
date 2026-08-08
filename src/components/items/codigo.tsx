
import type {
  ItemCodigo,
  ItemComandoAnotado,
  ItemDemo,
  ItemSalidaAnotada,
  ItemTerminal,
} from "@/lib/tipos";
import { llave, trocear, ubicar, type Trozo } from "@/lib/anotaciones";
import { comoTextoPlano, recortar } from "@/lib/resaltado";
import { enlaceALab, rutaDeLab } from "@/lib/sitio";
import { aPowerShell } from "@/lib/windows";
import { Copiar } from "./copiar";
import { Caja, Etiqueta, Marco, QuéSignifica } from "./marco";
import { Prosa } from "./texto";

/**
 * La misma orden, para quien está en PowerShell.
 *
 * Va **debajo** y en pequeño, no al lado ni en una pestaña. Dos comandos con
 * el mismo peso obligan a la sala a elegir antes de leer, y una pestaña
 * esconde la mitad de la clase detrás de un clic que nadie da mientras el
 * docente sigue hablando. Subordinada y siempre visible es lo que deja
 * teclear sin preguntar.
 *
 * Solo aparece donde hay algo distinto que teclear: `docker compose` y `curl`
 * se escriben igual en las dos, y repetirlos sería ruido (ver
 * `lib/windows.ts`).
 */
function EnWindows({ html, texto }: { html: string; texto?: string }) {
  return (
    <div className="mt-1.5 flex items-baseline gap-2.5">
      <span
        className="shrink-0 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--tinta-suave)" }}
      >
        Windows
      </span>
      <div
        className="min-w-0 flex-1 overflow-x-auto text-[15px] opacity-75 [&_pre]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {texto && <Copiar texto={texto} />}
    </div>
  );
}

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
            className="flex flex-wrap items-baseline gap-x-2 border-b px-5 py-2.5 font-mono text-sm"
            style={{
              borderColor: "var(--borde)",
              background: "var(--lienzo-alto)",
              color: "var(--tinta-suave)",
            }}
          >
            {/*
              La ruta era texto muerto: el alumno leía `agente/accion.py` y no
              tenía cómo llegar. Ahora enlaza al archivo en el laboratorio, y a
              las líneas exactas cuando el ítem las declara.

              `rutaDeLab` devuelve null para las rutas que no son un archivo
              —hay ítems que escriben cosas como `ui/app.py · el bloque de la
              reflexión`—, y entonces se dibuja como antes. Enlazar eso llevaría
              a un 404, que es peor que no enlazar.
            */}
            {rutaDeLab(item.ruta) ? (
              <a
                href={enlaceALab(rutaDeLab(item.ruta)!, item.lineas)}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
                style={{ color: "var(--color-acento)" }}
              >
                {item.ruta}
              </a>
            ) : (
              <span>{item.ruta}</span>
            )}
            {item.lineas && <span>· líneas {item.lineas}</span>}
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
  const win = item.comandoWindows ?? aPowerShell(item.comando);
  const htmlWin = item.htmlWindows ?? (win ? comoTextoPlano(win) : null);

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--borde)" }}
      >
        <div
          className="flex items-start gap-3 px-5 py-4"
          style={{ background: "var(--lienzo-alto)" }}
        >
          <div
            className="min-w-0 flex-1 overflow-x-auto text-[15px] [&_pre]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <Copiar texto={item.comando} />
        </div>

        {htmlWin && (
          <div
            className="border-t"
            style={{ borderColor: "var(--borde)" }}
          >
            <div className="px-5 pt-3">
              <Etiqueta>Windows</Etiqueta>
            </div>
            <div
              className="flex items-start gap-3 px-5 pb-4 pt-1"
              style={{ background: "var(--lienzo-alto)" }}
            >
              <div
                className="min-w-0 flex-1 overflow-x-auto text-[15px] [&_pre]:!bg-transparent"
                dangerouslySetInnerHTML={{ __html: htmlWin }}
              />
              {win && <Copiar texto={win} etiqueta="Copiar" />}
            </div>
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
      {item.significa && <QuéSignifica significa={item.significa} />}
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
      <div className="mb-2 flex justify-end">
        <Copiar texto={item.comando} etiqueta="Copiar el comando" />
      </div>
      <BloqueAnotado
        texto={item.comando}
        trozos={trozos}
        indice={indice}
        llaveEn={lineaLlave}
        donde={donde}
        tamano={tamano}
      />

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
      {item.significa && <QuéSignifica significa={item.significa} />}
    </Marco>
  );
}

/**
 * El bloque monoespaciado con una parte enfocada y la llave debajo.
 *
 * Lo comparten el comando anotado y la salida anotada porque el dibujo es el
 * mismo —resaltar sin perder el todo— y solo cambia qué se está mirando. Una
 * segunda copia de esto se habría desincronizado a la primera corrección de
 * color.
 */
function BloqueAnotado({
  texto,
  trozos,
  indice,
  llaveEn,
  donde,
  tamano,
}: {
  texto: string;
  trozos: Trozo[];
  indice: number | null;
  llaveEn: number | null;
  donde: { columna: number; ancho: number | null } | null;
  tamano: number;
}) {
  return (
    <div
      className="overflow-x-auto rounded-xl border px-5 py-4"
      style={{ borderColor: "var(--borde)", background: "var(--lienzo-alto)" }}
      data-largo={texto.length}
    >
      <pre
        className="font-mono leading-relaxed"
        style={{ fontSize: `${tamano.toFixed(1)}px` }}
      >
        <code>
          {/*
            Se recorre por LÍNEAS y no de un tirón, porque la llave tiene que
            quedar justo debajo de la suya. Cada línea se rearma a partir de
            los trozos que le tocan.
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
              {llaveEn === iLinea && donde?.ancho != null && (
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
  );
}

/**
 * Una salida de terminal, explicada trozo a trozo.
 *
 * Misma idea que el comando anotado y misma maquinaria, con dos diferencias
 * que vienen de lo que es una salida:
 *
 *  - **El comando pasa a ser contexto.** Va arriba, en pequeño, y puede no
 *    estar: `make memoria` imprime algo que vale por sí solo.
 *  - **El tamaño se calcula contra el alto y no solo contra el ancho.** Un
 *    comando es una línea larga; una salida son cuarenta cortas, y lo que se
 *    sale de la pantalla es por abajo.
 */
export function SalidaAnotada({
  item,
  paso = 0,
}: {
  item: ItemSalidaAnotada;
  paso?: number;
}) {
  const indice = paso > 0 ? paso - 1 : null;
  const enfocada = indice === null ? null : item.anotaciones[indice];
  const trozos = trocear(item.salida, item.anotaciones);
  const donde = enfocada ? ubicar(item.salida, enfocada.texto) : null;

  const lineas = item.salida.split("\n");
  const largo = Math.max(...lineas.map((l) => l.length), 1);
  // La llave añade una línea a la que la lleva, y el enfoque puede caer en
  // cualquiera: se reserva su sitio siempre para que la lámina no dé un salto
  // al avanzar de paso.
  const alto = lineas.length + 1;
  // El reparto vertical de la lámina: título y comando arriba, el bloque en el
  // medio, y sitio garantizado abajo para la explicación. Sin el tope de alto,
  // una salida de veinte líneas empuja la explicación fuera de la pantalla —
  // y la explicación es la razón de que el ítem exista.
  const porAncho = 980 / (0.6 * largo);
  const porAlto = 410 / (1.6 * alto);
  const tamano = Math.max(9, Math.min(17, Math.min(porAncho, porAlto)));

  const lineaLlave = donde?.ancho != null ? donde.linea : null;

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      {item.comando && (
        <p
          className="mb-2 font-mono text-sm"
          style={{ color: "var(--tinta-suave)" }}
        >
          $ {item.comando}
        </p>
      )}

      <BloqueAnotado
        texto={item.salida}
        trozos={trozos}
        indice={indice}
        llaveEn={lineaLlave}
        donde={donde}
        tamano={tamano}
      />

      {enfocada && (
        <div
          className="mt-6 border-l-2 pl-5"
          style={{ borderColor: "var(--color-acento)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-acento)" }}
          >
            {indice !== null && `${indice + 1} / ${item.anotaciones.length}`}
          </p>
          <Prosa className="mt-2" tamano="lg">
            {enfocada.explicacion}
          </Prosa>
        </div>
      )}

      {!enfocada && (
        <p className="mt-6 text-base" style={{ color: "var(--tinta-suave)" }}>
          {item.anotaciones.length} cosas que leer acá. Avanza para verlas una a
          una.
        </p>
      )}
      {item.significa && <QuéSignifica significa={item.significa} />}
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
  const pasos = item.pasos.map((p) => {
    // El resaltado llega ya hecho desde el servidor; acá solo se recalcula la
    // traducción si no vino, que es el caso de las pruebas y del render sin
    // Shiki.
    const win = aPowerShell(p.comando);
    return {
      ...p,
      html: p.html ?? comoTextoPlano(p.comando),
      htmlWindows: p.htmlWindows ?? (win ? comoTextoPlano(win) : null),
    };
  });

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <Caja tono="acento">
        <Etiqueta>En vivo</Etiqueta>
        <ol className="mt-4 space-y-4">
          {pasos.map((paso, i) => (
            <li key={i}>
              <div className="flex items-start gap-3">
                <div
                  className="min-w-0 flex-1 overflow-x-auto text-[15px] [&_pre]:!bg-transparent"
                  dangerouslySetInnerHTML={{ __html: paso.html }}
                />
                {/* Los pasos que son un comentario o una llamada a herramienta
                    no se copian: no hay nada que teclear. */}
                {!/^\s*(#|→|…)/.test(paso.comando) && (
                  <Copiar texto={paso.comando} />
                )}
              </div>
              {paso.htmlWindows && (
                <EnWindows
                  html={paso.htmlWindows}
                  texto={aPowerShell(paso.comando) ?? undefined}
                />
              )}
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
      {item.significa && <QuéSignifica significa={item.significa} />}
    </Marco>
  );
}
