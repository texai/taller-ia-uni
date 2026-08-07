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
