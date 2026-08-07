/**
 * Ubicar un fragmento de código dentro de su archivo real.
 *
 * Lo usan dos scripts: el que calcula los números de línea y el que comprueba
 * que sigan cuadrando. Vive acá y no dentro de uno de ellos porque importar un
 * script lo ejecuta entero, y un validador que además reescribe YAML no es un
 * validador.
 */

/**
 * Los bloques contiguos del fragmento, como rangos de línea 1-based.
 *
 * Devuelve `null` si alguna línea del fragmento no está en el archivo — es
 * decir, si el fragmento no es literal. Esa es la restricción que hace
 * confiables los números: un comentario explicativo añadido a mano rompe la
 * búsqueda, y el fragmento se queda sin numerar en vez de numerar mal.
 */
export function ubicarBloques(
  fragmento: string,
  archivo: string[],
): string[] | null {
  const lineas = fragmento.replace(/\n$/, "").split("\n");
  const bloques: string[] = [];
  let i = 0;
  // Dónde puede empezar el siguiente bloque: los bloques van en orden.
  let minimo = 0;

  while (i < lineas.length) {
    // Una línea en blanco no identifica nada: se pega al bloque que viene.
    if (lineas[i]!.trim() === "") {
      i++;
      continue;
    }

    // De todas las apariciones de esta línea, la que da el bloque más largo, y
    // a igualdad la primera que venga después del bloque anterior.
    //
    // Sin esto, un fragmento que empieza por `@tool` se ancla en el primer
    // `@tool` del archivo —que es otra herramienta— y numera mal sin avisar.
    let mejor: { inicio: number; fin: number } | null = null;
    for (let c = 0; c < archivo.length; c++) {
      if (archivo[c] !== lineas[i]) continue;
      let j = i;
      let k = c;
      while (j + 1 < lineas.length && archivo[k + 1] === lineas[j + 1]) {
        j++;
        k++;
      }
      const largo = k - c;
      const mejorLargo = mejor ? mejor.fin - mejor.inicio : -1;
      const ordenado = c >= minimo;
      const mejorOrdenado = mejor ? mejor.inicio >= minimo : false;
      if (
        largo > mejorLargo ||
        (largo === mejorLargo && ordenado && !mejorOrdenado)
      ) {
        mejor = { inicio: c, fin: k };
      }
    }
    if (!mejor) return null;

    minimo = mejor.fin + 1;
    bloques.push(
      mejor.inicio === mejor.fin
        ? `${mejor.inicio + 1}`
        : `${mejor.inicio + 1}-${mejor.fin + 1}`,
    );
    i += mejor.fin - mejor.inicio + 1;
  }

  return bloques.length ? bloques : null;
}
