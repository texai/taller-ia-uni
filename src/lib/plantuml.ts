/**
 * Un lector de PlantUML para el subconjunto que este curso usa.
 *
 * No es PlantUML. Es lo justo para diagramas de secuencia: participantes,
 * mensajes, anotaciones y activaciones. **Cualquier otra cosa falla nombrando la
 * línea que no entendió**, y falla al cargar el contenido — nunca en clase.
 * Un parser que ignora en silencio lo que no comprende dibuja un diagrama al
 * que le faltan flechas, y eso se descubre proyectado.
 *
 * Lo que sale de acá se dibuja en SVG en el navegador. La fuente PlantUML es
 * el formato de escritura, no el de entrega: escribir nueve flechas en texto
 * es mucho mejor que maquetarlas, y a partir de ahí el dibujo es nuestro.
 * Ver `docs/DONE.md`, batch 13, para por qué no se genera una imagen.
 */

export interface Participante {
  alias: string;
  nombre: string;
}

export interface MensajeSecuencia {
  de: string;
  a: string;
  texto: string;
  /** `-->` en vez de `->`. Se dibuja punteada: convención de "respuesta". */
  punteada: boolean;
  /** De un participante a sí mismo. Se dibuja como un lazo. */
  propio: boolean;
}

export interface AnotacionSecuencia {
  /** Sobre qué participantes se apoya. */
  sobre: string[];
  texto: string;
  /** Va después de este mensaje. `-1` si va antes del primero. */
  tras: number;
}

export interface Activacion {
  participante: string;
  /** Índice del mensaje donde empieza y donde termina, inclusive. */
  desde: number;
  hasta: number;
}

export interface Secuencia {
  participantes: Participante[];
  mensajes: MensajeSecuencia[];
  /** Las `note` de PlantUML. NO son las `notas` privadas del docente: ese
   *  nombre ya está tomado y confundirlos sería confundir lo que se proyecta
   *  con lo que no. */
  anotaciones: AnotacionSecuencia[];
  activaciones: Activacion[];
}

export class ErrorDePlantUml extends Error {}

const DECLARACION =
  /^(?:participant|actor|boundary|control|entity|database|collections|queue)\s+(?:"([^"]+)"|(\S+))(?:\s+as\s+(\S+))?\s*$/i;

const MENSAJE = /^(\S+)\s*(-->|->)\s*(\S+)\s*:\s*(.*)$/;

const NOTA = /^note\s+(?:over|(?:right|left)\s+of)\s+([^:]+?)(?:\s*:\s*(.*))?$/i;

/** Líneas que existen para el renderizador de PlantUML y que acá no aplican. */
const IGNORADAS = /^(@startuml|@enduml|skinparam\b|hide\b|title\b|autonumber\b)/i;

/**
 * Lee una fuente PlantUML de diagrama de secuencia.
 *
 * Lanza `ErrorDePlantUml` con TODAS las líneas que no entendió, no con la
 * primera: quien escribe un diagrama quiere arreglarlo entero de una pasada,
 * igual que con el resto del contenido.
 */
export function leerSecuencia(fuente: string): Secuencia {
  const participantes: Participante[] = [];
  const mensajes: MensajeSecuencia[] = [];
  const anotaciones: AnotacionSecuencia[] = [];
  const activaciones: Activacion[] = [];
  /** Activaciones abiertas: alias → índice del mensaje donde empezó. */
  const abiertas = new Map<string, number>();
  const problemas: string[] = [];

  /** Un participante nombrado en una flecha existe aunque no se haya declarado. */
  const asegurar = (alias: string) => {
    if (!participantes.some((p) => p.alias === alias)) {
      participantes.push({ alias, nombre: alias });
    }
  };

  const lineas = fuente.split("\n");
  /** Nota multilínea en curso, si la hay. */
  let nota: { sobre: string[]; partes: string[] } | null = null;

  lineas.forEach((cruda, i) => {
    const numero = i + 1;
    // Los comentarios de PlantUML empiezan con comilla simple. Se quitan
    // enteros: no hay comentarios a mitad de línea en este subconjunto.
    const linea = cruda.replace(/^\s*'.*$/, "").trim();

    if (nota) {
      if (/^end\s*note$/i.test(linea)) {
        anotaciones.push({
          sobre: nota.sobre,
          texto: nota.partes.join(" ").trim(),
          tras: mensajes.length - 1,
        });
        nota = null;
      } else {
        nota.partes.push(linea);
      }
      return;
    }

    if (!linea || IGNORADAS.test(linea)) return;

    const declarado = DECLARACION.exec(linea);
    if (declarado) {
      const nombre = declarado[1] ?? declarado[2] ?? "";
      const alias = declarado[3] ?? nombre;
      if (!participantes.some((p) => p.alias === alias)) {
        participantes.push({ alias, nombre });
      }
      return;
    }

    const activar = /^(activate|deactivate)\s+(\S+)\s*$/i.exec(linea);
    if (activar) {
      const alias = activar[2] ?? "";
      asegurar(alias);
      if (activar[1]?.toLowerCase() === "activate") {
        abiertas.set(alias, mensajes.length);
      } else {
        const desde = abiertas.get(alias);
        if (desde === undefined) {
          problemas.push(
            `línea ${numero}: \`deactivate ${alias}\` sin un \`activate\` antes`,
          );
        } else {
          abiertas.delete(alias);
          activaciones.push({
            participante: alias,
            desde,
            hasta: Math.max(desde, mensajes.length - 1),
          });
        }
      }
      return;
    }

    const flecha = MENSAJE.exec(linea);
    if (flecha) {
      const de = flecha[1] ?? "";
      const a = flecha[3] ?? "";
      asegurar(de);
      asegurar(a);
      mensajes.push({
        de,
        a,
        texto: (flecha[4] ?? "").trim(),
        punteada: flecha[2] === "-->",
        propio: de === a,
      });
      return;
    }

    const encabezado = NOTA.exec(linea);
    if (encabezado) {
      const sobre = (encabezado[1] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      sobre.forEach(asegurar);
      const texto = encabezado[2];
      if (texto === undefined) {
        // Nota multilínea: sigue hasta `end note`.
        nota = { sobre, partes: [] };
      } else {
        anotaciones.push({ sobre, texto: texto.trim(), tras: mensajes.length - 1 });
      }
      return;
    }

    problemas.push(`línea ${numero}: no se entiende \`${linea}\``);
  });

  if (nota) {
    problemas.push("una nota quedó abierta: falta `end note`");
  }
  for (const alias of abiertas.keys()) {
    problemas.push(`\`activate ${alias}\` quedó sin su \`deactivate\``);
  }
  if (!mensajes.length) {
    problemas.push("el diagrama no tiene ningún mensaje");
  }

  if (problemas.length) {
    throw new ErrorDePlantUml(
      `Este lector de PlantUML solo entiende diagramas de secuencia ` +
        `—participantes, mensajes, notas y activaciones—:\n` +
        problemas.map((p) => `  · ${p}`).join("\n"),
    );
  }

  return { participantes, mensajes, anotaciones, activaciones };
}
