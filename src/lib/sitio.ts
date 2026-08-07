/**
 * La dirección pública del taller.
 *
 * Vive acá y no en `contenido/` porque no es material del curso: es dónde está
 * desplegado. Y vive en un solo sitio porque el código QR se genera a partir de
 * esta constante (`scripts/generar-qr.mjs`) — dos copias de una URL son dos
 * copias que un día dejan de coincidir, y el síntoma sería un QR que lleva a
 * otro lado sin que nadie lo note hasta tenerlo proyectado.
 */
export const URL_PUBLICA = "https://taller-ia-uni.vercel.app/";

/** La misma, sin protocolo ni barra final, para escribirla en pantalla. */
export const URL_VISIBLE = URL_PUBLICA.replace(/^https?:\/\//, "").replace(
  /\/$/,
  "",
);

/**
 * El laboratorio, en GitHub.
 *
 * Los ítems que citan un archivo (`ruta:`, y los `archivos` de una `lectura`)
 * construyen su enlace desde acá. Escribir la URL completa en cada ítem sería
 * repetir cuarenta veces algo que cambia de golpe el día que el repositorio se
 * mueva.
 */
export const REPO_LAB = "https://github.com/texai/taller-ia-uni-lab";

/** El enlace a un archivo del laboratorio, opcionalmente a unas líneas. */
export function enlaceALab(ruta: string, lineas?: string): string {
  const base = `${REPO_LAB}/blob/main/${ruta}`;
  if (!lineas) return base;
  // GitHub ancla `#L268-L330`; el contenido escribe `268-330`, que es como se
  // dice en voz alta.
  const [desde, hasta] = lineas.split("-");
  return hasta ? `${base}#L${desde}-L${hasta}` : `${base}#L${desde}`;
}

/**
 * La parte de un `ruta:` que es de verdad un archivo del laboratorio.
 *
 * Varios ítems escriben la ruta con una coletilla —`ui/app.py · el bloque de
 * la reflexión`— porque el fragmento no es el archivo entero. Enlazar eso
 * llevaría a un 404. Devuelve `null` cuando no reconoce un archivo, y quien
 * llama dibuja texto plano.
 */
export function rutaDeLab(ruta: string): string | null {
  const limpia = ruta.split("·")[0]?.trim() ?? "";
  // Con extensión, o uno de los que no la tienen y sí son archivos. La lista
  // corta es a propósito: sin ella, «el bloque de la reflexión» pasaría por
  // ruta y el enlace llevaría a un 404.
  const sinExtension = ["Makefile", "Dockerfile"];
  const vale = /^[\w./-]+\.\w+$/.test(limpia) || sinExtension.includes(limpia);
  return vale ? limpia : null;
}
