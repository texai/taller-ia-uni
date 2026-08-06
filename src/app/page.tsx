import { CURSOS } from "@/lib/cursos";

export default function Inicio() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-16">
        <p
          className="text-sm font-medium uppercase tracking-widest"
          style={{ color: "var(--tinta-suave)" }}
        >
          Universidad Nacional de Ingeniería
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Cursos
        </h1>
      </header>

      <ul className="space-y-6">
        {CURSOS.map((curso) => (
          <li key={curso.id}>
            <article
              className="rounded-xl border p-7 sm:p-9"
              style={{
                borderColor: "var(--borde)",
                background: "var(--lienzo-alto)",
              }}
            >
              <p
                className="text-sm"
                style={{ color: "var(--tinta-suave)" }}
              >
                {curso.programa}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {curso.titulo}
              </h2>

              <p
                className="mt-1 text-lg"
                style={{ color: "var(--color-acento)" }}
              >
                {curso.subtitulo}
              </p>

              <p className="mt-5 text-base leading-relaxed sm:text-lg">
                {curso.descripcion}
              </p>

              <ul
                className="mt-7 space-y-3 border-t pt-6"
                style={{ borderColor: "var(--borde)" }}
              >
                {curso.sesiones.map((sesion) => (
                  <li
                    key={sesion.numero}
                    className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <span
                      className="text-sm font-medium tabular-nums"
                      style={{ color: "var(--tinta-suave)" }}
                    >
                      Sesión {sesion.numero}
                    </span>
                    <span className="text-base font-medium sm:text-lg">
                      {sesion.titulo}
                    </span>
                    <span
                      className="text-sm sm:ml-auto"
                      style={{ color: "var(--tinta-suave)" }}
                    >
                      {sesion.cuando}
                    </span>
                  </li>
                ))}
              </ul>

              <p
                className="mt-7 text-sm"
                style={{ color: "var(--tinta-suave)" }}
              >
                {curso.docente}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
