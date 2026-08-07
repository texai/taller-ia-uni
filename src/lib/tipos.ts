/**
 * El catálogo de tipos de ítem, y la jerarquía del curso.
 *
 * La apuesta del producto es que crear material de clase se parezca más a
 * escribir una lista que a maquetar diapositivas. Eso solo funciona si el
 * catálogo cubre lo que un docente realmente necesita poner en pantalla — y
 * también lo que necesita RECORDAR hacer, que es la mitad olvidada de dictar
 * bien.
 *
 * De ahí las dos familias:
 *
 *   contenido    lo que el alumno ve y el docente explica
 *   dictado      lo que marca el ritmo: recesos, pausas, asistencia, preguntas
 *
 * Ver `docs/CONVENTIONS.md` §7 y §8.
 */

// --------------------------------------------------------------------------
// Base
// --------------------------------------------------------------------------

export type FamiliaItem = "contenido" | "dictado";

export interface ItemBase {
  id: string;
  tipo: TipoItem;
  titulo?: string;
  /** Una línea que enmarca lo que sigue. */
  entradilla?: string;
  /**
   * Notas privadas del docente, para la segunda pantalla.
   *
   * NUNCA llegan al cliente del alumno: se filtran en el servidor, no se
   * ocultan con CSS. La pantalla del docente se comparte por Zoom y el HTML
   * es legible con las herramientas de desarrollador abiertas.
   */
  notas?: string;
  /** Minutos estimados. Alimenta el reloj de la segunda pantalla. */
  minutos?: number;
}

// --------------------------------------------------------------------------
// Familia: contenido
// --------------------------------------------------------------------------

/** Un corte de sección. Una idea sola, grande. */
export interface ItemTitulo extends ItemBase {
  tipo: "titulo";
  titulo: string;
  destacado?: string;
}

/** Markdown renderizado. Inline para lo corto, `archivo` para lo largo. */
export interface ItemMarkdown extends ItemBase {
  tipo: "markdown";
  contenido?: string;
  /** Ruta relativa a `contenido/`, por ejemplo `md/el-caso.md`. */
  archivo?: string;
}

/** Fragmento de código con resaltado. */
export interface ItemCodigo extends ItemBase {
  tipo: "codigo";
  lenguaje: string;
  contenido?: string;
  archivo?: string;
  /** `"12-34"` para mostrar solo esas líneas. */
  lineas?: string;
  /** Líneas a resaltar dentro de lo mostrado: `[3, "10-14"]`. */
  resaltar?: (number | string)[];
  /** Ruta que se muestra como etiqueta. */
  ruta?: string;
}

/** Un comando de terminal, con su salida si vale la pena mostrarla. */
export interface ItemTerminal extends ItemBase {
  tipo: "terminal";
  comando: string;
  salida?: string;
  /** Windows escribe otra cosa. Si está, la interfaz ofrece las dos. */
  comandoWindows?: string;
  /** Segundos que tarda de verdad. Evita el silencio incómodo en clase. */
  duracion?: number;
}

/** Diagrama Mermaid. Para secuencias con recorrido, usar `diagrama-secuencia`. */
export interface ItemDiagrama extends ItemBase {
  tipo: "diagrama";
  contenido?: string;
  archivo?: string;
  clase?: "secuencia" | "flujo" | "entidad-relacion" | "estados" | "componentes";
}

/** Tablas con sus columnas. Se dibuja, no se describe. */
export interface ItemModeloDatos extends ItemBase {
  tipo: "modelo-datos";
  tablas: {
    nombre: string;
    descripcion?: string;
    columnas: { nombre: string; tipo: string; nota?: string }[];
  }[];
}

/** Captura de pantalla o figura. */
export interface ItemImagen extends ItemBase {
  tipo: "imagen";
  archivo: string;
  pie?: string;
  /** Recuadra una zona: `[x, y, ancho, alto]` en porcentaje. */
  destacar?: [number, number, number, number];
}

/** Una página que vale la pena visitar. */
export interface ItemEnlace extends ItemBase {
  tipo: "enlace";
  url: string;
  descripcion?: string;
}

/** Un archivo descargable: PDF, Excel, Word, SVG, CSV. */
export interface ItemArchivo extends ItemBase {
  tipo: "archivo";
  archivo: string;
  descripcion?: string;
}

/**
 * Dos lados, uno al lado del otro.
 *
 * La mitad de lo que enseña este taller es una comparación: MAPE contra sesgo,
 * el diagnóstico antes y después de la reflexión. Dos ítems de markdown
 * seguidos pierden justo lo que importa, que es el contraste.
 */
export interface ItemComparacion extends ItemBase {
  tipo: "comparacion";
  izquierda: { titulo: string; contenido: string };
  derecha: { titulo: string; contenido: string };
}

/** Un número grande y lo que significa. */
export interface ItemMetrica extends ItemBase {
  tipo: "metrica";
  valor: string;
  unidad?: string;
  contexto?: string;
  tono?: "bueno" | "malo" | "neutro";
}

/** Tabla de datos, sin más. */
export interface ItemTabla extends ItemBase {
  tipo: "tabla";
  columnas: string[];
  filas: (string | number)[][];
  /** Índices de filas a resaltar. */
  resaltar?: number[];
}

/**
 * Cita textual de una corrida real del agente.
 *
 * Este taller tiene material que no se puede inventar. Merece un tipo propio
 * porque hay que dejar claro que es literal, no una paráfrasis nuestra.
 */
export interface ItemCitaAgente extends ItemBase {
  tipo: "cita-agente";
  cita: string;
  /** De dónde salió: `"reflexión, escenario sesgo_silencioso"`. */
  procedencia?: string;
  comentario?: string;
}

/** Criterios de aceptación de un reto. El alumno sabe cuándo terminó. */
export interface ItemCriterios extends ItemBase {
  tipo: "criterios";
  criterios: { texto: string; pista?: string }[];
}

/** Un error que va a ocurrir, con su síntoma y su arreglo. */
export interface ItemErrorComun extends ItemBase {
  tipo: "error-comun";
  sintoma: string;
  causa: string;
  arreglo: string;
}

/**
 * Un momento de demostración en vivo.
 *
 * Distinto de `terminal`: acá el docente ejecuta delante de todos. Lleva los
 * comandos, lo que debería salir, y un respaldo por si falla.
 */
export interface ItemDemo extends ItemBase {
  tipo: "demo";
  pasos: { comando: string; esperado?: string }[];
  observar?: string;
  respaldo?: string;
}

/**
 * El puente entre dos unidades.
 *
 * Además de la prosa dibuja el mapa: qué unidades quedaron cerradas y cuál
 * viene. Ese mapa NO se declara — se deriva de dónde está el ítem dentro del
 * curso (ver `docs/CONVENTIONS.md` §8).
 */
export interface ItemTransicion extends ItemBase {
  tipo: "transicion";
  vimos: string;
  viene: string;
}

/**
 * Diagrama de secuencia en PlantUML, recorrible mensaje a mensaje.
 *
 * Un diagrama proyectado entero es una maraña que nadie sigue. Ver
 * `docs/CONVENTIONS.md` §10.
 */
export interface ItemDiagramaSecuencia extends ItemBase {
  tipo: "diagrama-secuencia";
  /** Fuente PlantUML inline. */
  fuente?: string;
  /** O en su propio archivo: `puml/grafo.puml`. */
  archivo?: string;
  /** Explicación por mensaje, en el orden en que aparecen en la fuente. */
  mensajes?: { explicacion: string }[];
}

/**
 * Un comando largo, explicado parte por parte.
 *
 * Los segmentos se declaran por su TEXTO, nunca por índice de caracteres: un
 * índice se rompe en cuanto alguien corrige un espacio.
 */
export interface ItemComandoAnotado extends ItemBase {
  tipo: "comando-anotado";
  comando: string;
  segmentos: {
    texto: string;
    explicacion: string;
    /** Qué otros valores admite ese modificador. */
    otrosValores?: string[];
  }[];
}

// --------------------------------------------------------------------------
// Familia: dictado
// --------------------------------------------------------------------------

/** Receso. La interfaz avisa según la hora y cuenta el tiempo. */
export interface ItemReceso extends ItemBase {
  tipo: "receso";
  minutos: number;
}

/**
 * Una pausa deliberada para preguntas.
 *
 * No es lo mismo que "¿alguna pregunta?" dicho de pasada: para la clase,
 * muestra en pantalla que es el momento, y le da al docente las preguntas que
 * llegaron sin responder.
 */
export interface ItemPausaPreguntas extends ItemBase {
  tipo: "pausa-preguntas";
  /** Para romper el hielo si nadie dice nada. */
  disparadores?: string[];
}

/** Recordatorio de tomar asistencia. Solo lo ve el docente. */
export interface ItemAsistencia extends ItemBase {
  tipo: "asistencia";
  nota?: string;
}

/**
 * Una pregunta del docente hacia los alumnos.
 *
 * `visibilidad: publica` proyecta el recuento y, tras el revelado, los
 * resultados. Ver `docs/CONVENTIONS.md` §12.
 */
export interface ItemPregunta extends ItemBase {
  tipo: "pregunta";
  pregunta: string;
  /** Con opciones es una encuesta; sin ellas, respuesta abierta. */
  opciones?: string[];
  /** Cuál era la buena. SOLO para el docente, y solo tras el revelado. */
  respuesta?: string;
  /** Se puede decir "prefiero no responder". Por omisión, sí. */
  permiteOmitir?: boolean;
  /** `privada` por omisión: el recuento solo llega a la segunda pantalla. */
  visibilidad?: "privada" | "publica";
}

// --------------------------------------------------------------------------

export type Item =
  | ItemTitulo
  | ItemMarkdown
  | ItemCodigo
  | ItemTerminal
  | ItemDiagrama
  | ItemModeloDatos
  | ItemImagen
  | ItemEnlace
  | ItemArchivo
  | ItemComparacion
  | ItemMetrica
  | ItemTabla
  | ItemCitaAgente
  | ItemCriterios
  | ItemErrorComun
  | ItemDemo
  | ItemTransicion
  | ItemDiagramaSecuencia
  | ItemComandoAnotado
  | ItemReceso
  | ItemPausaPreguntas
  | ItemAsistencia
  | ItemPregunta;

export type TipoItem = Item["tipo"];

export const FAMILIA: Record<TipoItem, FamiliaItem> = {
  titulo: "contenido",
  markdown: "contenido",
  codigo: "contenido",
  terminal: "contenido",
  diagrama: "contenido",
  "modelo-datos": "contenido",
  imagen: "contenido",
  enlace: "contenido",
  archivo: "contenido",
  comparacion: "contenido",
  metrica: "contenido",
  tabla: "contenido",
  "cita-agente": "contenido",
  criterios: "contenido",
  "error-comun": "contenido",
  demo: "contenido",
  transicion: "contenido",
  "diagrama-secuencia": "contenido",
  "comando-anotado": "contenido",
  receso: "dictado",
  "pausa-preguntas": "dictado",
  asistencia: "dictado",
  pregunta: "dictado",
};

export const TIPOS: TipoItem[] = Object.keys(FAMILIA) as TipoItem[];

/** Ítems que el alumno no debe ver. Se filtran en el servidor. */
export const SOLO_DOCENTE: readonly TipoItem[] = ["asistencia"] as const;

// --------------------------------------------------------------------------
// La jerarquía
// --------------------------------------------------------------------------

export type TipoUnidad = "repaso" | "reto" | "cierre";

export interface Unidad {
  id: string;
  tipo: TipoUnidad;
  titulo: string;
  /** Qué se lleva el alumno. Se muestra al abrir la unidad. */
  objetivos?: string[];
  /** Qué hay que saber de antes. */
  requisitos?: string[];
  /**
   * Los minutos NO se declaran acá, y por eso no hay campo.
   *
   * El tiempo se cuenta de abajo hacia arriba: lo declara el ítem —la unidad
   * más pequeña, y la única que alguien puede estimar de verdad— y todo lo que
   * lo contiene suma. Un presupuesto declarado en la unidad sería una segunda
   * cifra sobre lo mismo, y dos cifras sobre lo mismo terminan siempre en
   * desacuerdo. Ver `CONVENTIONS.md` §15.
   */
  items: Item[];
}

export interface Sesion {
  id: string;
  numero: number;
  titulo: string;
  subtitulo?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  unidades: Unidad[];
}

export interface Curso {
  id: string;
  titulo: string;
  subtitulo?: string;
  programa?: string;
  institucion?: string;
  docente?: string;
  descripcion?: string;
  sesiones: Sesion[];
}
