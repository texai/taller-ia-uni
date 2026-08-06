"use client";

import { useRouter } from "next/navigation";

import { clienteNavegador } from "@/lib/supabase";

export function CerrarSesion() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await clienteNavegador()?.auth.signOut();
        router.push("/");
        // `refresh` además del `push`: sin él, el servidor podría servir desde
        // caché una página que se generó con la sesión todavía viva.
        router.refresh();
      }}
      className="shrink-0 rounded-lg border px-4 py-2 text-sm"
      style={{ borderColor: "var(--borde)" }}
    >
      Cerrar sesión
    </button>
  );
}
