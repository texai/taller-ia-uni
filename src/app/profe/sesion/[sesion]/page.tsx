import { notFound } from "next/navigation";

import { cargarCurso } from "@/lib/contenido";
import { Dictado } from "@/components/Dictado";

/**
 * La sesión, como la ve el docente: con todo.
 *
 * Notas privadas, ítems de asistencia y respuestas correctas incluidos. Está
 * detrás del middleware, y es dinámica porque una página estática con notas
 * dentro quedaría en la caché de Vercel al alcance de cualquiera con la URL.
 */

export const dynamic = "force-dynamic";

export default async function SesionDocente({
  params,
}: {
  params: Promise<{ sesion: string }>;
}) {
  const { sesion: idSesion } = await params;
  const curso = cargarCurso();
  const sesion = curso.sesiones.find((s) => s.id === idSesion);

  if (!sesion) notFound();

  return <Dictado sesion={sesion} curso={curso.id} modoDocente />;
}
