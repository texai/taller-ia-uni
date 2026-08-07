/**
 * Un diagrama de secuencia, dibujado por nosotros, recorrible mensaje a
 * mensaje.
 *
 * La fuente se escribe en PlantUML —es un buen formato para escribir nueve
 * flechas— pero el dibujo NO lo hace PlantUML. Se dibuja acá, en SVG, a partir
 * de lo que leyó `plantuml.ts`.
 *
 * La razón es el paso 0. El plan original era generar una imagen en tiempo de
 * construcción para el diagrama completo y dibujar por nuestra cuenta solo el
 * recorrido enfocado. Eso son dos dibujantes distintos para la misma figura, y
 * el cambio de uno a otro ocurre EN MEDIO del ítem, delante de la clase:
 * pulsas la flecha y el diagrama cambia de tipografía, de colores y de
 * proporciones. Un solo dibujante quita eso, y de paso quita el `plantuml.jar`,
 * la carpeta de imágenes versionadas que puede quedar desfasada de su fuente, y
 * la dependencia de un servicio externo a mitad de una clase.
 */

import type { ItemDiagramaSecuencia } from "@/lib/tipos";
import type { MensajeSecuencia, AnotacionSecuencia, Secuencia } from "@/lib/plantuml";
import { Marco } from "./marco";

// Medidas. Están acá arriba porque un diagrama de secuencia es aritmética de
// posiciones y nada más; con los números sueltos por el cuerpo no se puede
// ajustar nada sin romper otra cosa.
const MARGEN = 24;
const ALTO_CABECERA = 44;
const HUECO_CABECERA = 28;
const ALTO_MENSAJE = 50;
const ALTO_PROPIO = 68;
const ALTO_NOTA = 20;
const ANCHO_ACTIVACION = 10;
const POR_CARACTER = 7.1;

/** Ancho de columna: cabe el nombre más largo, con un mínimo cómodo. */
function anchoDeColumna(s: Secuencia): number {
  const nombre = Math.max(...s.participantes.map((p) => p.nombre.length), 8);
  const etiqueta = Math.max(...s.mensajes.map((m) => m.texto.length), 8);
  // Las etiquetas de mensaje cruzan una columna entera, así que también
  // empujan el ancho — pero a la mitad, porque suelen abarcar dos columnas.
  return Math.max(150, nombre * POR_CARACTER + 28, (etiqueta * POR_CARACTER) / 2);
}

/** Parte un texto en líneas de a lo sumo `maximo` caracteres, por palabras. */
function enLineas(texto: string, maximo: number): string[] {
  const palabras = texto.split(/\s+/);
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    if (!actual) actual = p;
    else if (actual.length + 1 + p.length <= maximo) actual += ` ${p}`;
    else {
      lineas.push(actual);
      actual = p;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

type Fila =
  | { tipo: "mensaje"; indice: number; alto: number; y: number }
  | { tipo: "nota"; nota: AnotacionSecuencia; tras: number; alto: number; y: number };

/**
 * Ordena mensajes y notas como se leen, y les da su altura y su `y`.
 *
 * Una nota va después del mensaje al que se ancló. Sin esto habría que
 * dibujarlas flotando y se solaparían con las flechas justo en los diagramas
 * densos, que son los que más falta hacen explicar.
 */
function filasDe(s: Secuencia, anchoNota: number): Fila[] {
  const filas: Fila[] = [];
  let y = ALTO_CABECERA + HUECO_CABECERA;

  const meterNotas = (tras: number) => {
    for (const nota of s.anotaciones.filter((n) => n.tras === tras)) {
      const alto = enLineas(nota.texto, anchoNota).length * ALTO_NOTA + 22;
      filas.push({ tipo: "nota", nota, tras, alto, y });
      y += alto + 12;
    }
  };

  meterNotas(-1);
  s.mensajes.forEach((m, i) => {
    const alto = m.propio ? ALTO_PROPIO : ALTO_MENSAJE;
    filas.push({ tipo: "mensaje", indice: i, alto, y });
    y += alto;
    meterNotas(i);
  });

  return filas;
}

function Flecha({
  m,
  x,
  y,
  ancho,
  apagada,
}: {
  m: MensajeSecuencia;
  x: (alias: string) => number;
  y: number;
  ancho: number;
  apagada: boolean;
}) {
  const color = apagada ? "var(--tinta-suave)" : "var(--color-acento)";
  const tinta = apagada ? "var(--tinta-suave)" : "var(--tinta)";
  const guiones = m.punteada ? "6 4" : undefined;

  if (m.propio) {
    // El lazo: sale y vuelve al mismo sitio. Se dibuja hacia la derecha
    // siempre, porque hacia la izquierda chocaría con la columna anterior.
    const x0 = x(m.de);
    const salto = Math.min(70, ancho / 2 - 10);
    const arriba = y + 6;
    const abajo = y + 32;
    return (
      <g opacity={apagada ? 0.28 : 1}>
        <path
          d={`M ${x0} ${arriba} H ${x0 + salto} V ${abajo} H ${x0 + 9}`}
          fill="none"
          stroke={color}
          strokeWidth={apagada ? 1.5 : 2.5}
          strokeDasharray={guiones}
        />
        <polygon
          points={`${x0},${abajo} ${x0 + 10},${abajo - 5} ${x0 + 10},${abajo + 5}`}
          fill={color}
        />
        <text
          x={x0 + salto + 10}
          y={arriba + 4}
          fontSize={13}
          fill={tinta}
          fontWeight={apagada ? 400 : 600}
        >
          {m.texto}
        </text>
      </g>
    );
  }

  const x0 = x(m.de);
  const x1 = x(m.a);
  const haciaLaDerecha = x1 > x0;
  const punta = haciaLaDerecha ? x1 - 1 : x1 + 1;
  const base = haciaLaDerecha ? punta - 10 : punta + 10;
  const linea = y + 22;

  return (
    <g opacity={apagada ? 0.28 : 1}>
      <line
        x1={x0}
        y1={linea}
        x2={base}
        y2={linea}
        stroke={color}
        strokeWidth={apagada ? 1.5 : 2.5}
        strokeDasharray={guiones}
      />
      <polygon
        points={`${punta},${linea} ${base},${linea - 5} ${base},${linea + 5}`}
        fill={color}
      />
      <text
        x={(x0 + x1) / 2}
        y={linea - 8}
        fontSize={13}
        textAnchor="middle"
        fill={tinta}
        fontWeight={apagada ? 400 : 600}
      >
        {m.texto}
      </text>
    </g>
  );
}

/** El dibujo completo. `enfocado` es el índice del mensaje, o `null` para todo. */
export function Lienzo({
  secuencia,
  enfocado,
  alto: topeAlto,
}: {
  secuencia: Secuencia;
  enfocado: number | null;
  /** Tope de altura en CSS. Sin él, un diagrama largo empuja lo de abajo. */
  alto: string;
}) {
  const ancho = anchoDeColumna(secuencia);
  const columna = (alias: string) => {
    const i = secuencia.participantes.findIndex((p) => p.alias === alias);
    return MARGEN + (i < 0 ? 0 : i) * ancho + ancho / 2;
  };

  const anchoNota = Math.max(24, Math.floor((ancho * 1.6) / POR_CARACTER));
  const filas = filasDe(secuencia, anchoNota);
  const ultima = filas[filas.length - 1];
  const alto = (ultima ? ultima.y + ultima.alto : ALTO_CABECERA) + MARGEN;

  // El lazo de un mensaje a sí mismo sale hacia la derecha y lleva su etiqueta
  // ahí. Si el que se lo manda es el último participante —que es justo el caso
  // del diagrama de este curso: `Accion -> Accion`— el texto se sale del
  // lienzo y queda cortado. El ancho tiene que contarlo.
  const salto = Math.min(70, ancho / 2 - 10);
  const desborde = secuencia.mensajes
    .filter((m) => m.propio)
    .map((m) => columna(m.de) + salto + 14 + m.texto.length * POR_CARACTER);
  const total = Math.max(
    MARGEN * 2 + secuencia.participantes.length * ancho,
    ...desborde.map((x) => x + MARGEN),
  );

  /** La `y` de la línea de un mensaje, para colgar de ella las activaciones. */
  const yDe = (indice: number) => {
    const fila = filas.find((f) => f.tipo === "mensaje" && f.indice === indice);
    return fila ? fila.y + 22 : ALTO_CABECERA;
  };

  return (
    <svg
      viewBox={`0 0 ${total} ${alto}`}
      preserveAspectRatio="xMidYMid meet"
      // El alto tiene tope para que la explicación del mensaje enfocado quepa
      // en la misma pantalla. Un diagrama de trece mensajes proyectado a
      // tamaño natural deja el texto debajo del pliegue, y en clase eso
      // significa desplazar la página con la sala mirando. En el paso 0 no hay
      // texto debajo, así que el diagrama se queda con todo el alto.
      className="w-full"
      style={{ maxHeight: topeAlto }}
      role="img"
      aria-label="Diagrama de secuencia"
    >
      {/* Líneas de vida, primero, para que todo lo demás quede encima. */}
      {secuencia.participantes.map((p) => (
        <line
          key={`vida-${p.alias}`}
          x1={columna(p.alias)}
          y1={ALTO_CABECERA}
          x2={columna(p.alias)}
          y2={alto - MARGEN}
          stroke="var(--borde)"
          strokeWidth={1}
          strokeDasharray="4 5"
        />
      ))}

      {/* Activaciones: la barra que dice "este sigue trabajando". */}
      {secuencia.activaciones.map((a, i) => (
        <rect
          key={`act-${i}`}
          x={columna(a.participante) - ANCHO_ACTIVACION / 2}
          y={yDe(a.desde) - 12}
          width={ANCHO_ACTIVACION}
          height={Math.max(20, yDe(a.hasta) - yDe(a.desde) + 24)}
          rx={2}
          fill="var(--lienzo-alto)"
          stroke="var(--borde)"
        />
      ))}

      {/* Cabecera: quién es quién. */}
      {secuencia.participantes.map((p) => {
        const x = columna(p.alias);
        const w = Math.min(ancho - 16, p.nombre.length * POR_CARACTER + 24);
        return (
          <g key={`cab-${p.alias}`}>
            <rect
              x={x - w / 2}
              y={4}
              width={w}
              height={ALTO_CABECERA - 12}
              rx={8}
              fill="var(--lienzo-alto)"
              stroke="var(--borde)"
            />
            <text
              x={x}
              y={ALTO_CABECERA - 17}
              fontSize={13}
              fontWeight={600}
              textAnchor="middle"
              fill="var(--tinta)"
            >
              {p.nombre}
            </text>
          </g>
        );
      })}

      {filas.map((fila, i) => {
        if (fila.tipo === "mensaje") {
          const m = secuencia.mensajes[fila.indice];
          if (!m) return null;
          return (
            <Flecha
              key={`m-${fila.indice}`}
              m={m}
              x={columna}
              y={fila.y}
              ancho={ancho}
              apagada={enfocado !== null && enfocado !== fila.indice}
            />
          );
        }

        // Una nota se apaga con el mensaje al que está pegada: si sigue
        // encendida sola, parece que habla del mensaje enfocado y no del suyo.
        const apagada = enfocado !== null && enfocado !== fila.tras;
        const xs = fila.nota.sobre.map(columna);
        const izquierda = Math.min(...xs) - ancho / 2 + 14;
        const derecha = Math.max(...xs) + ancho / 2 - 14;
        const lineas = enLineas(fila.nota.texto, anchoNota);

        return (
          <g key={`n-${i}`} opacity={apagada ? 0.28 : 1}>
            <rect
              x={izquierda}
              y={fila.y}
              width={Math.max(80, derecha - izquierda)}
              height={fila.alto}
              rx={6}
              fill="var(--lienzo-alto)"
              stroke="var(--color-aviso)"
            />
            {lineas.map((l, k) => (
              <text
                key={k}
                x={izquierda + 12}
                y={fila.y + 20 + k * ALTO_NOTA}
                fontSize={12.5}
                fill="var(--tinta-suave)"
              >
                {l}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * El ítem completo: el dibujo arriba, la explicación del mensaje abajo.
 *
 * El paso 0 muestra el diagrama entero sin nada atenuado — primero el mapa,
 * después el recorrido. Del 1 en adelante se enfoca un mensaje por vez.
 */
export function DiagramaSecuencia({
  item,
  paso = 0,
}: {
  item: ItemDiagramaSecuencia;
  paso?: number;
}) {
  const secuencia = item.secuencia;

  // Sin fuente legible no se dibuja nada: el cargador ya debería haber fallado
  // con un mensaje mejor que este, así que llegar acá significa que el ítem se
  // construyó a mano en algún sitio.
  if (!secuencia) {
    return (
      <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
        <p style={{ color: "var(--color-aviso)" }}>
          Este diagrama no se pudo leer.
        </p>
      </Marco>
    );
  }

  const enfocado = paso > 0 ? paso - 1 : null;
  const mensaje = enfocado === null ? null : secuencia.mensajes[enfocado];
  const explicacion =
    enfocado === null ? undefined : item.mensajes?.[enfocado]?.explicacion;

  return (
    <Marco titulo={item.titulo} entradilla={item.entradilla} ancho="ancho">
      <Lienzo
        secuencia={secuencia}
        enfocado={enfocado}
        alto={enfocado === null ? "74vh" : "54vh"}
      />

      {mensaje && (
        <div
          className="mt-6 border-l-2 pl-5"
          style={{ borderColor: "var(--color-acento)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-acento)" }}
          >
            {enfocado !== null && `${enfocado + 1} / ${secuencia.mensajes.length}`}
            {" · "}
            {mensaje.de} → {mensaje.a}
          </p>
          <p className="mt-2 font-mono text-lg">{mensaje.texto}</p>
          {explicacion && (
            <p className="mt-3 text-xl leading-relaxed">{explicacion}</p>
          )}
        </div>
      )}
    </Marco>
  );
}
