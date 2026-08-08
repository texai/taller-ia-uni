"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Copiar un comando al portapapeles.
 *
 * Los comandos de los retos se teclean **desde otra ventana**: la clase mira
 * la lámina, cambia a la terminal y escribe. Y lo que escribe son cosas como
 * `make verificar ARGS="--reto 1"` o `docker compose run --rm plataforma
 * python -m plataforma escenario --nombre campana_promocional`. Un error de
 * dedo ahí no es un error de dedo: son tres minutos de reto perdidos
 * averiguando por qué no corre, multiplicados por veinte personas.
 *
 * Seleccionar con el ratón tampoco sirve: en una lámina proyectada el texto
 * está a un tamaño que se lee de lejos, y arrastrar sobre él se lleva media
 * línea de al lado.
 *
 * **Confirma copiando**, y esa es la mitad del valor. Sin la confirmación uno
 * cambia de ventana, pega, no sale nada, y vuelve sin saber si falló el
 * botón o el pegado.
 *
 * Al alumno le sirve más que a nadie: el docente tiene la pauta al lado.
 */
export function Copiar({
  texto,
  etiqueta = "Copiar",
}: {
  texto: string;
  /** Para distinguir dos botones en la misma línea: `make` y Windows. */
  etiqueta?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El temporizador se limpia al desmontar: cambiar de lámina con el aviso
  // puesto dejaría un `setState` sobre un componente que ya no está.
  useEffect(() => () => {
    if (reloj.current) clearTimeout(reloj.current);
  }, []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // `navigator.clipboard` no existe sin HTTPS ni en algunos navegadores
      // viejos. El respaldo es feo y funciona en todos.
      const caja = document.createElement("textarea");
      caja.value = texto;
      caja.style.position = "fixed";
      caja.style.opacity = "0";
      document.body.appendChild(caja);
      caja.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(caja);
      }
    }
    setCopiado(true);
    if (reloj.current) clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setCopiado(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copiar}
      className="shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors"
      style={{
        borderColor: copiado ? "var(--color-acento)" : "var(--borde)",
        color: copiado ? "var(--color-acento)" : "var(--tinta-suave)",
      }}
      title={`Copiar: ${texto}`}
      aria-label={`Copiar el comando ${texto}`}
    >
      {copiado ? "Copiado ✓" : etiqueta}
    </button>
  );
}
