/**
 * Comparar dos versiones de un fragmento, línea a línea.
 *
 * Existe porque hay arreglos que **no se entienden como bloque de código y sí
 * como cambio**: la trampa del reto 4 es un parámetro que no estaba, y verlo
 * en su archivo obliga a que alguien diga cuál es la línea nueva. Verlo como
 * antes/después lo dice solo.
 *
 * Es una diferencia de líneas y no de palabras, y es a propósito: los
 * fragmentos que se proyectan son de diez o quince líneas, y una diferencia de
 * palabras produce un dibujo más fino que nadie lee desde la última fila.
 */

export type Signo = "igual" | "quita" | "pone";

export interface LineaDeDiff {
  signo: Signo;
  texto: string;
}

/**
 * La subsecuencia común más larga, por líneas.
 *
 * Es el algoritmo de siempre y no una comparación posición a posición porque
 * esta última convierte «insertar una línea» en «todas las de abajo
 * cambiaron», que es exactamente el ruido que hace ilegible un diff.
 */
function comunes(a: string[], b: string[]): number[][] {
  const tabla: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      tabla[i]![j] =
        a[i] === b[j]
          ? tabla[i + 1]![j + 1]! + 1
          : Math.max(tabla[i + 1]![j]!, tabla[i]![j + 1]!);
    }
  }
  return tabla;
}

/** Las líneas de `antes` y `despues`, marcadas. */
export function diferencia(antes: string, despues: string): LineaDeDiff[] {
  const a = antes.replace(/\n$/, "").split("\n");
  const b = despues.replace(/\n$/, "").split("\n");
  const tabla = comunes(a, b);

  const salida: LineaDeDiff[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      salida.push({ signo: "igual", texto: a[i]! });
      i++;
      j++;
    } else if (tabla[i + 1]![j]! >= tabla[i]![j + 1]!) {
      salida.push({ signo: "quita", texto: a[i]! });
      i++;
    } else {
      salida.push({ signo: "pone", texto: b[j]! });
      j++;
    }
  }
  while (i < a.length) salida.push({ signo: "quita", texto: a[i++]! });
  while (j < b.length) salida.push({ signo: "pone", texto: b[j++]! });
  return salida;
}

/** Cuántas líneas se quitan y cuántas se ponen. Para el encabezado. */
export function recuento(lineas: LineaDeDiff[]): { quita: number; pone: number } {
  return {
    quita: lineas.filter((l) => l.signo === "quita").length,
    pone: lineas.filter((l) => l.signo === "pone").length,
  };
}
