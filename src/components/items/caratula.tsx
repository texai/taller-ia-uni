import type { ItemCaratula, Sesion } from "@/lib/tipos";

/**
 * La carátula del curso, como primera lámina.
 *
 * Nace de lo que se veía al pulsar «dictar»: la primera lámina era **«Tomar
 * asistencia»**. Es lo primero que hay que *hacer*, pero no lo primero que hay
 * que *enseñar* — la sala entra, mira la pantalla compartida y lo que ve es
 * una tarea administrativa en vez de a qué vino.
 *
 * Repite a propósito lo de la portada pública. Quien llega tarde, quien entra
 * desde el enlace sin haber visto la página, y quien simplemente no se acuerda
 * de cómo se llamaba el curso, lo tienen delante mientras se pasa lista.
 *
 * Y lleva el QR por lo mismo: el momento en que a alguien le hace falta el
 * enlace es **antes** de empezar, no en la lámina cuarenta.
 */
export function Caratula({
  item,
  sesion,
}: {
  item: ItemCaratula;
  /** Opcional como en el resto del catálogo: hay vistas que renderizan un
   *  ítem suelto sin sesión alrededor. Sin ella se dibuja el curso y se
   *  omiten las fichas, que es degradar y no reventar. */
  sesion?: Sesion;
}) {
  const c = item.curso;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col justify-center px-6 py-10">
      {c?.institucion && (
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--tinta-suave)" }}
        >
          {c.institucion}
        </p>
      )}
      {c?.programa && (
        <p className="mt-1 text-sm" style={{ color: "var(--tinta-suave)" }}>
          {c.programa}
        </p>
      )}

      <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
        {c?.titulo}
      </h1>
      {c?.subtitulo && (
        <p
          className="mt-3 text-xl sm:text-2xl"
          style={{ color: "var(--color-acento)" }}
        >
          {c.subtitulo}
        </p>
      )}

      {c?.descripcion && (
        <p
          className="mt-6 max-w-3xl text-lg leading-relaxed"
          style={{ color: "var(--tinta-suave)" }}
        >
          {c.descripcion}
        </p>
      )}

      {/* La sesión, y el QR al lado. Los datos van en una fila de fichas
          porque es lo que alguien copia de un vistazo desde el fondo del
          aula, no algo que se lea como prosa. */}
      <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-6">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          {(
            [
              [
                "Sesión",
                sesion ? `${sesion.numero} · ${sesion.titulo}` : undefined,
              ],
              ["Fecha", sesion?.fecha],
              [
                "Horario",
                sesion?.horaInicio && sesion.horaFin
                  ? `${sesion.horaInicio}–${sesion.horaFin}`
                  : undefined,
              ],
              ["Docente", c?.docente],
            ] as const
          )
            .filter(([, valor]) => Boolean(valor))
            .map(([nombre, valor]) => (
              <div key={nombre}>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--tinta-suave)" }}
                >
                  {nombre}
                </p>
                <p className="mt-1 text-lg font-medium">{valor}</p>
              </div>
            ))}
        </div>

        {item.qr && (
          <div className="ml-auto text-center">
            {/* Sin `next/image`: es un SVG que ya está en `public/`, no hay
                nada que optimizar y sí una dependencia que evitar. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.qr}
              alt="Código QR del curso"
              className="h-32 w-32 rounded-lg bg-white p-2"
            />
            <p
              className="mt-2 text-[10px] uppercase tracking-widest"
              style={{ color: "var(--tinta-suave)" }}
            >
              Sigue la clase
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
