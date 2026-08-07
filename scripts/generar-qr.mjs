/**
 * Genera el código QR de la portada, una vez, a un archivo.
 *
 * No se dibuja en el navegador a propósito. La portada se proyecta al empezar
 * la clase, que es exactamente el momento en que el aula puede no tener red
 * buena: un QR que depende de que cargue una librería es un QR que a veces no
 * aparece, y entonces veinte personas no pueden entrar. Un SVG servido desde
 * `public/` no puede fallar.
 *
 * La URL sale de `src/lib/sitio.ts`, que es la única copia.
 *
 *     npm run qr
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import QRCode from "qrcode";

const { URL_PUBLICA } = await import("../src/lib/sitio.ts");

const DESTINO = join(process.cwd(), "public", "contenido", "img", "qr.svg");

const svg = await QRCode.toString(URL_PUBLICA, {
  type: "svg",
  // `M` corrige hasta un 15% del código. Es el punto donde un QR proyectado
  // sigue leyéndose con el reflejo de una ventana encima sin que los módulos
  // se hagan tan pequeños que el teléfono de la última fila no los resuelva.
  errorCorrectionLevel: "M",
  margin: 2,
  color: { dark: "#000000", light: "#ffffff" },
});

writeFileSync(DESTINO, svg, "utf-8");
console.log(`QR de ${URL_PUBLICA} → ${DESTINO}`);
