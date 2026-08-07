import { notFound } from "next/navigation";

import { cargarCurso } from "@/lib/contenido";
import { resaltarSesion } from "@/lib/resaltado";
import { Mando } from "@/components/Mando";

/**
 * El mando, en el segundo portátil.
 *
 * Lleva la sesión completa —notas incluidas— porque es justo lo que esta
 * pantalla existe para mostrar. Dinámica por lo mismo que la de dictado: una
 * página con notas dentro no puede quedarse en la caché de Vercel al alcance
 * de cualquiera que acierte la URL.
 */

export const dynamic = "force-dynamic";

export default async function MandoDeSesion({
  params,
}: {
  params: Promise<{ sesion: string }>;
}) {
  const { sesion: idSesion } = await params;
  const curso = cargarCurso();
  const sesion = curso.sesiones.find((s) => s.id === idSesion);

  if (!sesion) notFound();

  return <Mando sesion={await resaltarSesion(sesion)} curso={curso.id} />;
}
