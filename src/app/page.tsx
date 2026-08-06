import Link from "next/link";

import { cargarCurso, minutosDe, recorrer } from "@/lib/contenido";

export default function Inicio() {
  const curso = cargarCurso();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-16">
        <p
          className="text-sm font-medium uppercase tracking-widest"
          style={{ color: "var(--tinta-suave)" }}
        >
          {curso.institucion}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Cursos
        </h1>
      </header>

      <article
        className="rounded-xl border p-7 sm:p-9"
        style={{ borderColor: "var(--borde)", background: "var(--lienzo-alto)" }}
      >
        <p className="text-sm" style={{ color: "var(--tinta-suave)" }}>
          {curso.programa}
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {curso.titulo}
        </h2>

        {curso.subtitulo && (
          <p className="mt-1 text-lg" style={{ color: "var(--color-acento)" }}>
            {curso.subtitulo}
          </p>
        )}

        {curso.descripcion && (
          <p className="mt-5 text-base leading-relaxed sm:text-lg">
            {curso.descripcion}
          </p>
        )}

        <ul
          className="mt-7 space-y-1 border-t pt-4"
          style={{ borderColor: "var(--borde)" }}
        >
          {curso.sesiones.map((sesion) => {
            const items = recorrer(sesion).length;
            const minutos = sesion.unidades.reduce(
              (t, u) => t + minutosDe(u),
              0,
            );
            return (
              <li key={sesion.id}>
                <Link
                  href={`/curso/${curso.id}/sesion/${sesion.id}`}
                  className="-mx-3 flex flex-col gap-1 rounded-lg px-3 py-3 transition-colors hover:bg-black/20 sm:flex-row sm:items-baseline sm:gap-4"
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
                    className="text-sm tabular-nums sm:ml-auto"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    {sesion.unidades.length} unidades · {items} ítems ·{" "}
                    {minutos} min
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-sm" style={{ color: "var(--tinta-suave)" }}>
          {curso.docente}
        </p>
      </article>
    </main>
  );
}
