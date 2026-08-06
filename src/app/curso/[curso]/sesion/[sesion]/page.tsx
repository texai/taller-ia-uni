import { notFound } from "next/navigation";

import { cargarCurso, cursoParaAlumno } from "@/lib/contenido";
import { Dictado } from "@/components/Dictado";

/**
 * La sesión, como la ve un alumno.
 *
 * Sirve la carga PÚBLICA: sin las notas del docente, sin la respuesta correcta
 * de las preguntas, y sin los ítems de asistencia. El filtro ocurre en el
 * servidor y no en el render, porque lo que llega al navegador es lo que un
 * alumno puede leer con las herramientas de desarrollador abiertas — y esta
 * pantalla se proyecta por Zoom (ver `CONVENTIONS.md` §3).
 *
 * Es estática y pública a propósito: el alumno entra con la URL y nada más.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  const curso = cargarCurso();
  return curso.sesiones.map((s) => ({ curso: curso.id, sesion: s.id }));
}

export default async function SesionPublica({
  params,
}: {
  params: Promise<{ curso: string; sesion: string }>;
}) {
  const { sesion: idSesion } = await params;
  const curso = cursoParaAlumno(cargarCurso());
  const sesion = curso.sesiones.find((s) => s.id === idSesion);

  if (!sesion) notFound();

  return <Dictado sesion={sesion} curso={curso.id} />;
}
