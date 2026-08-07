/**
 * Lee el código QR de la portada y comprueba que lleva a donde dice.
 *
 * Un QR es opaco: mirándolo no se distingue el correcto del que apunta a otro
 * sitio, y el momento en que uno se entera es con veinte personas escaneándolo.
 * Por eso se lee de vuelta, y se lee **de la página servida**, no del archivo
 * suelto — lo que hay que comprobar es lo que se proyecta.
 *
 *     npm start          # en una terminal
 *     npm run qr:leer    # en otra
 *
 * Necesita Playwright, igual que `npm run humo`, y por la misma razón: no es
 * dependencia del proyecto. Ver el README.
 */

import jsQR from "jsqr";

import { URL_PUBLICA } from "../src/lib/sitio.ts";

async function traerChromium() {
  const rutas = [
    "playwright",
    process.env.PLAYWRIGHT_MODULO,
    "/opt/node22/lib/node_modules/playwright/index.mjs",
  ].filter(Boolean);
  for (const ruta of rutas) {
    try {
      return (await import(ruta)).chromium;
    } catch (e) {
      if (e?.code !== "ERR_MODULE_NOT_FOUND") throw e;
    }
  }
  console.error(
    "No encuentro Playwright. Instálalo con:\n" +
      "\n    npm i -D playwright && npx playwright install chromium\n",
  );
  process.exit(2);
}

const PUERTO = process.argv[2] ?? "3000";
const chromium = await traerChromium();
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } });
await pagina.goto(`http://localhost:${PUERTO}/`, { waitUntil: "load" });

// Se rasteriza grande: el SVG se dibuja a 208 px en la portada y a ese tamaño
// un módulo son seis píxeles, suficiente para un teléfono y justo para un
// decodificador. A 500 sobra margen y la lectura deja de depender del redondeo.
const LADO = 500;
const mapa = await pagina.evaluate(async (lado) => {
  const img = document.querySelector('img[alt^="Código QR"]');
  if (!img) return null;
  const lienzo = document.createElement("canvas");
  lienzo.width = lado;
  lienzo.height = lado;
  const ctx = lienzo.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, lado, lado);
  ctx.drawImage(img, 0, 0, lado, lado);
  const datos = ctx.getImageData(0, 0, lado, lado);
  return { data: Array.from(datos.data), width: datos.width, height: datos.height };
}, LADO);

await navegador.close();

if (!mapa) {
  console.error("No hay ningún código QR en la portada. ¿Se sirvió el build nuevo?");
  process.exit(1);
}

const leido = jsQR(new Uint8ClampedArray(mapa.data), mapa.width, mapa.height);
if (!leido) {
  console.error("El código QR de la portada no se puede leer.");
  process.exit(1);
}
if (leido.data !== URL_PUBLICA) {
  console.error(`El QR lleva a ${leido.data}\ny debería llevar a ${URL_PUBLICA}`);
  console.error("Regenéralo con: npm run qr");
  process.exit(1);
}

console.log(`El QR de la portada lleva a ${leido.data}`);
