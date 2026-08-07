import Link from "next/link";

import { cargarCurso, minutosDe, recorrer } from "@/lib/contenido";
import { CerrarSesion } from "@/components/CerrarSesion";

/** Lo que ve el docente al entrar: sus sesiones, con todo a mano. */

export const dynamic = "force-dynamic";

export default function InicioDocente() {
  const curso = cargarCurso();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm" style={{ color: "var(--tinta-suave)" }}>
            Docente
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {curso.titulo}
          </h1>
        </div>
        <CerrarSesion />
      </div>

      <ul className="mt-12 space-y-4">
        {curso.sesiones.map((sesion) => (
          <li
            key={sesion.id}
            className="rounded-xl border p-6"
            style={{
              borderColor: "var(--borde)",
              background: "var(--lienzo-alto)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--tinta-suave)" }}>
              Sesión {sesion.numero} · {sesion.fecha} · {sesion.horaInicio}–
              {sesion.horaFin}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{sesion.titulo}</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--tinta-suave)" }}>
              {sesion.unidades.length} unidades · {recorrer(sesion).length} ítems
              · {sesion.unidades.reduce((t, u) => t + minutosDe(u), 0)} min
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/profe/sesion/${sesion.id}`}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
                style={{
                  borderColor: "var(--color-acento)",
                  color: "var(--color-acento)",
                }}
              >
                Dictar
              </Link>
              {/* El segundo portátil: el que no se comparte por Zoom. */}
              <Link
                href={`/profe/sesion/${sesion.id}/mando`}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
                style={{
                  borderColor: "var(--color-aviso)",
                  color: "var(--color-aviso)",
                }}
              >
                Mando
              </Link>
              <Link
                href={`/profe/sesion/${sesion.id}/revision`}
                className="rounded-lg border px-4 py-2 text-sm"
                style={{ borderColor: "var(--borde)" }}
              >
                Revisar de corrido
              </Link>
              <Link
                href={`/curso/${curso.id}/sesion/${sesion.id}`}
                className="rounded-lg border px-4 py-2 text-sm"
                style={{ borderColor: "var(--borde)" }}
              >
                Ver como alumno
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
