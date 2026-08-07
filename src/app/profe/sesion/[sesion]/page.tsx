import { notFound } from "next/navigation";

import { cargarCurso, sesionSinNotas } from "@/lib/contenido";
import { resaltarSesion } from "@/lib/resaltado";
import { Dictado } from "@/components/Dictado";

/**
 * La sesión que el docente proyecta.
 *
 * **Sin notas privadas**, y esa es la decisión de esta página. El curso se
 * dicta por videollamada: esta pantalla se comparte, así que todo lo que hay
 * en ella lo lee la clase. Las notas dicen cosas como «no adelantar el número,
 * es el golpe de dentro de diez minutos» — proyectadas, son el golpe
 * arruinado.
 *
 * Lleva todo lo demás: las respuestas correctas, para poder revelar, y los
 * minutos, para el reloj. Las notas viven en el **mando** y en la vista de
 * revisión, que son las dos pantallas que nadie más ve.
 *
 * Dinámica de todos modos: una página con respuestas dentro no puede quedarse
 * en la caché de Vercel al alcance de cualquiera con la URL.
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

  return (
    <Dictado
      sesion={sesionSinNotas(await resaltarSesion(sesion))}
      curso={curso.id}
      glosario={curso.glosario ?? []}
      modoDocente
    />
  );
}
