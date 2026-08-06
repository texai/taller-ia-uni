import { notFound } from "next/navigation";

import { cargarCurso } from "@/lib/contenido";
import { Dictado } from "@/components/Dictado";

/**
 * La sesión, para dictar: índice a la izquierda, un ítem a la vez.
 *
 * Todavía sirve el contenido COMPLETO, con notas privadas incluidas. El batch
 * 7 la protege y el 8 le agrega la sincronía; hasta entonces no compartir la
 * URL.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  const curso = cargarCurso();
  return curso.sesiones.map((s) => ({ curso: curso.id, sesion: s.id }));
}

export default async function VistaSesion({
  params,
}: {
  params: Promise<{ curso: string; sesion: string }>;
}) {
  const { sesion: idSesion } = await params;
  const sesion = cargarCurso().sesiones.find((s) => s.id === idSesion);

  if (!sesion) notFound();

  return <Dictado sesion={sesion} />;
}
