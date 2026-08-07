/**
 * Recorre TODOS los ítems del curso en un navegador de verdad y falla si
 * alguno rompe.
 *
 * Existe por un fallo que ninguna otra comprobación podía ver. Los ítems de
 * código llamaban a Shiki con `await` dentro del componente; eso se renderiza
 * perfecto en el servidor —así que la construcción pasaba, el HTML salía bien
 * y `curl` devolvía 200— y revienta al hidratar en el navegador, porque
 * `Dictado` es de cliente y arrastra esos componentes consigo. El síntoma en
 * clase habría sido una lámina en blanco al llegar al primer fragmento de
 * código, con la sala mirando.
 *
 * Lo único que lo detecta es abrir cada ítem. Son unos cien; tarda un par de
 * minutos y se corre antes de dictar.
 *
 *     npm run humo            # contra localhost:3000
 *     npm run humo -- 3150    # contra otro puerto
 */

/**
 * Playwright no es dependencia del proyecto y se busca en tres sitios.
 *
 * No está en `package.json` a propósito: son ~300 MB de navegadores que no
 * hacen falta para dictar, ni para construir, ni en Vercel. Quien corre esta
 * comprobación lo instala aparte, y puede tenerlo instalado global —que es lo
 * normal en la máquina de uno— o local en `node_modules`.
 *
 * La ruta de `/opt` es la del contenedor donde se escribió el script. Estaba
 * cableada como único camino, y eso hacía que el `humo` solo corriera ahí:
 * en cualquier otra máquina moría con `ERR_MODULE_NOT_FOUND` señalando una
 * carpeta que no existe, que es la peor manera de decir «instala Playwright».
 */
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
      "\n    npm i -D playwright && npx playwright install chromium\n" +
      "\no apunta PLAYWRIGHT_MODULO a un Playwright ya instalado.",
  );
  process.exit(2);
}

const chromium = await traerChromium();

const PUERTO = process.argv[2] ?? "3000";
const BASE = `http://localhost:${PUERTO}`;

const { cargarCurso } = await import("../src/lib/contenido.ts");
const { SOLO_DOCENTE } = await import("../src/lib/tipos.ts");
const curso = cargarCurso();

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } });

/**
 * Antes de nada, comprobar que el servidor sirve ESTE contenido.
 *
 * Los ítems se enumeran leyendo el YAML del disco, pero quien los dibuja es un
 * servidor que se construyó en algún momento. Con la construcción vieja
 * levantada, un `?item=` que todavía no existe no da error: la página cae en el
 * primer ítem y devuelve 200. Todas las pantallas nuevas pasarían sin haberse
 * abierto nunca — que es exactamente lo que esta comprobación existe para
 * evitar.
 */
for (const sesion of curso.sesiones) {
  const esperados = sesion.unidades
    .flatMap((u) => u.items)
    .filter((i) => !SOLO_DOCENTE.includes(i.tipo))
    .map((i) => i.id);
  const r = await pagina.goto(`${BASE}/curso/${curso.id}/sesion/${sesion.id}`, {
    waitUntil: "load",
    timeout: 30000,
  });
  const html = (await r?.text()) ?? "";
  if (!html) {
    console.error(`${sesion.id} no respondió. ¿Está en pie el servidor?`);
    process.exit(2);
  }
  // El identificador de cada ítem viaja en la página: está en el índice lateral
  // y en la carga que hidrata la vista. Buscarlos uno a uno es más tosco que
  // contar, y no se deja engañar por un número suelto del HTML.
  const faltan = esperados.filter((id) => !html.includes(id));
  if (faltan.length) {
    console.error(
      `El servidor no conoce ${faltan.length} ítems de ${sesion.id}, empezando por \`${faltan[0]}\`.\n` +
        `Está corriendo una construcción vieja: npm run build y vuelve a levantarlo.`,
    );
    process.exit(2);
  }
}

let fallos = 0;
let vistos = 0;

for (const sesion of curso.sesiones) {
  for (const unidad of sesion.unidades) {
    for (const item of unidad.items) {
      // Un ítem con pasos se recorre entero: el paso 3 de un diagrama puede
      // romper con el paso 0 perfecto.
      const pasos =
        item.tipo === "diagrama-secuencia"
          ? (item.secuencia?.mensajes.length ?? 0) + 1
          : item.tipo === "comando-anotado"
            ? item.segmentos.length + 1
            : item.tipo === "salida-anotada"
              ? item.anotaciones.length + 1
              : 1;

      for (let paso = 0; paso < pasos; paso++) {
        const errores = [];
        const alError = (e) => errores.push(String(e).split("\n")[0]);
        pagina.on("pageerror", alError);

        const url =
          `${BASE}/curso/${curso.id}/sesion/${sesion.id}` +
          `?item=${item.id}${paso > 0 ? `&paso=${paso}` : ""}`;

        try {
          const r = await pagina.goto(url, { waitUntil: "load", timeout: 30000 });
          if (!r || r.status() >= 400) errores.push(`HTTP ${r?.status()}`);
          // Un margen para que React hidrate y falle si va a fallar.
          await pagina.waitForTimeout(400);
        } catch (e) {
          errores.push(String(e).split("\n")[0]);
        }

        pagina.off("pageerror", alError);
        vistos++;

        // El canal en vivo no conecta desde un contenedor sin salida a
        // Supabase, y eso no es un fallo del material.
        const reales = errores.filter((e) => !/WebSocket|supabase/i.test(e));
        if (reales.length) {
          fallos++;
          console.error(
            `✗ ${sesion.id} · ${item.id}${paso > 0 ? ` paso ${paso}` : ""}\n` +
              reales.map((e) => `    ${e}`).join("\n"),
          );
        }
      }
    }
  }
}

await navegador.close();

console.log(`\n${vistos} pantallas abiertas, ${fallos} con error.`);
process.exit(fallos ? 1 : 0);
