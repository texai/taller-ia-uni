import { NextResponse, type NextRequest } from "next/server";

import { clienteServidor, esDocente, HAY_SUPABASE } from "@/lib/supabase";

/**
 * Renueva la sesión y cierra las rutas del docente.
 *
 * Dos trabajos, y el orden importa: primero se refresca el token —si no, la
 * sesión del docente caduca a mitad de una clase de cuatro horas— y solo
 * después se decide si puede pasar.
 *
 * `/profe` queda abierta a propósito: es el formulario. Todo lo que cuelga de
 * ella, no. Esa URL no aparece en ninguna navegación, pero eso no es lo que la
 * protege; lo que la protege es la contraseña (ver `CONVENTIONS.md` §6).
 */
export async function middleware(peticion: NextRequest) {
  let respuesta = NextResponse.next({ request: peticion });

  if (!HAY_SUPABASE) {
    // Sin configuración no hay a quién autenticar. Las rutas del docente
    // quedan cerradas: es la lectura segura de un despliegue a medio hacer.
    return peticion.nextUrl.pathname === "/profe"
      ? respuesta
      : NextResponse.redirect(new URL("/profe", peticion.url));
  }

  const supabase = clienteServidor({
    getAll: () => peticion.cookies.getAll(),
    setAll: (nuevas) => {
      for (const { name, value } of nuevas) {
        peticion.cookies.set(name, value);
      }
      respuesta = NextResponse.next({ request: peticion });
      for (const { name, value, options } of nuevas) {
        respuesta.cookies.set(name, value, options);
      }
    },
  })!;

  // `getUser` y no `getSession`: getSession lee la galleta sin comprobar nada,
  // y una galleta es lo que un alumno puede fabricar. getUser lo verifica
  // contra Supabase.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (peticion.nextUrl.pathname === "/profe") return respuesta;

  if (!esDocente(user)) {
    const destino = new URL("/profe", peticion.url);
    destino.searchParams.set("volver", peticion.nextUrl.pathname);
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  // Solo lo del docente. El resto del sitio es público y estático, y hacerlo
  // pasar por el middleware le costaría una llamada a Supabase a cada alumno.
  matcher: ["/profe/:path*"],
};
