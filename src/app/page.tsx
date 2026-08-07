import Image from "next/image";
import Link from "next/link";

import { cargarCurso, minutosDe, recorrer } from "@/lib/contenido";
import { URL_PUBLICA, URL_VISIBLE } from "@/lib/sitio";

export default function Inicio() {
  const curso = cargarCurso();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      {/*
        Sin el título "Cursos". Hay uno solo, y encabezar la página con el
        plural de algo que no se repite es una etiqueta que no informa: quien
        llega ya sabe a qué curso viene, y lo que necesita ver primero es cómo
        entrar.
      */}
      <header className="mb-10">
        <p
          className="text-sm font-medium uppercase tracking-widest"
          style={{ color: "var(--tinta-suave)" }}
        >
          {curso.institucion}
        </p>
      </header>

      {/*
        Dos tarjetas: el curso a la izquierda, cómo entrar a la derecha.
        La segunda existe para el primer minuto de clase, proyectada — veinte
        personas escaneando a la vez es más rápido que veinte personas
        tecleando una URL que se lee mal desde la última fila.
      */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article
          className="rounded-xl border p-7 sm:p-9"
          style={{
            borderColor: "var(--borde)",
            background: "var(--lienzo-alto)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--tinta-suave)" }}>
            {curso.programa}
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {curso.titulo}
          </h1>

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

          {/*
            Cada sesión es una tarjeta con borde y flecha, no una línea de texto
            con un enlace encima. La versión anterior era cliqueable en toda la
            fila y no lo parecía: sin borde, sin flecha, y con el único indicio
            en el `hover` —que en una pantalla táctil no existe—. Nadie tiene por
            qué adivinar dónde pulsar para entrar a su propia clase.
          */}
          <p
            className="mt-8 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--tinta-suave)" }}
          >
            Entra a una sesión
          </p>
          <ul className="mt-3 flex flex-col gap-3">
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
                    className="tarjeta-sesion group flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span
                        className="text-xs font-semibold uppercase tracking-widest tabular-nums"
                        style={{ color: "var(--color-acento)" }}
                      >
                        Sesión {sesion.numero}
                        {sesion.horaInicio && sesion.horaFin
                          ? ` · ${sesion.horaInicio}–${sesion.horaFin}`
                          : ""}
                      </span>
                      <span className="text-lg font-semibold tracking-tight">
                        {sesion.titulo}
                      </span>
                      <span
                        className="text-sm tabular-nums"
                        style={{ color: "var(--tinta-suave)" }}
                      >
                        {sesion.unidades.length} unidades · {items} ítems ·{" "}
                        {minutos} min
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 text-xl transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--color-acento)" }}
                    >
                      &rarr;
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

        <article
          className="flex flex-col items-center rounded-xl border p-7 text-center"
          style={{
            borderColor: "var(--borde)",
            background: "var(--lienzo-alto)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--tinta-suave)" }}
          >
            Entra desde tu teléfono
          </p>

          {/*
            Fondo blanco fijo, también en tema oscuro: un QR invertido lo leen
            algunos teléfonos y otros no, y no es el momento de averiguar cuáles.
          */}
          <div className="mt-5 rounded-lg bg-white p-3">
            <Image
              src="/contenido/img/qr.svg"
              alt={`Código QR de ${URL_VISIBLE}`}
              width={208}
              height={208}
              priority
              unoptimized
            />
          </div>

          <a
            href={URL_PUBLICA}
            className="mt-5 break-all text-base font-medium underline underline-offset-4"
            style={{ color: "var(--color-acento)" }}
          >
            {URL_VISIBLE}
          </a>

          <p className="mt-3 text-sm" style={{ color: "var(--tinta-suave)" }}>
            Escanéalo o escribe la dirección. No hay que instalar nada ni
            registrarse.
          </p>
        </article>
      </div>
    </main>
  );
}
