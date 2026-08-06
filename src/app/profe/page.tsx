"use client";

import { useState } from "react";
import Link from "next/link";

import { clienteNavegador, esDocente, HAY_SUPABASE } from "@/lib/supabase";

/**
 * La entrada del docente.
 *
 * Fuera de toda navegación —no hay un solo enlace hacia acá en el sitio— pero
 * documentada en el README. Una URL oculta no es un mecanismo de seguridad; lo
 * que protege es la contraseña. Ocultarla solo evita que un alumno curioso se
 * distraiga con un formulario que no le sirve.
 *
 * No hay registro, ni recuperación de contraseña, ni "crear cuenta". El
 * usuario se crea a mano en el panel de Supabase.
 */
export default function Profe() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEntrando(true);

    const supabase = clienteNavegador();
    if (!supabase) {
      setError("Falta configurar Supabase en este despliegue.");
      setEntrando(false);
      return;
    }

    const { data, error: fallo } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    });

    if (fallo) {
      // Un mensaje único para credenciales malas: distinguir "ese correo no
      // existe" de "la contraseña no es esa" le regala a quien prueba la mitad
      // de la respuesta.
      setError("Correo o contraseña incorrectos.");
      setEntrando(false);
      return;
    }

    if (!esDocente(data.user)) {
      // Auth es compartida con `gen`: alguien puede autenticarse legítimamente
      // y no ser el docente de este taller.
      await supabase.auth.signOut();
      setError("Esa cuenta no dicta este taller.");
      setEntrando(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get("volver") ?? "/profe/inicio";
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Docente</h1>
      <p className="mt-2 text-base" style={{ color: "var(--tinta-suave)" }}>
        Taller 02 · Caso aplicado de IA en industria
      </p>

      {!HAY_SUPABASE && (
        <p
          className="mt-8 rounded-lg border border-dashed px-4 py-3 text-sm"
          style={{
            borderColor: "var(--color-aviso)",
            color: "var(--color-aviso)",
          }}
        >
          Este despliegue no tiene Supabase configurado. El sitio público
          funciona igual; la entrada del docente, no.
        </p>
      )}

      <form onSubmit={entrar} className="mt-10 space-y-4">
        <div>
          <label
            htmlFor="correo"
            className="text-sm"
            style={{ color: "var(--tinta-suave)" }}
          >
            Correo
          </label>
          <input
            id="correo"
            type="email"
            autoComplete="username"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-3 text-lg"
            style={{
              borderColor: "var(--borde)",
              background: "var(--lienzo-alto)",
              color: "var(--tinta)",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="clave"
            className="text-sm"
            style={{ color: "var(--tinta-suave)" }}
          >
            Contraseña
          </label>
          <input
            id="clave"
            type="password"
            autoComplete="current-password"
            required
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-3 text-lg"
            style={{
              borderColor: "var(--borde)",
              background: "var(--lienzo-alto)",
              color: "var(--tinta)",
            }}
          />
        </div>

        {error && (
          <p className="text-base" style={{ color: "var(--color-alerta)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={entrando || !HAY_SUPABASE}
          className="w-full rounded-lg border px-6 py-3 text-lg font-medium disabled:opacity-40"
          style={{
            borderColor: "var(--color-acento)",
            color: "var(--color-acento)",
          }}
        >
          {entrando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <Link
        href="/"
        className="mt-10 text-sm underline"
        style={{ color: "var(--tinta-suave)" }}
      >
        ← Volver al curso
      </Link>
    </main>
  );
}
