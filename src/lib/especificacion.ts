/**
 * Qué campos exige cada tipo de ítem.
 *
 * Dirigido por datos a propósito: agregar un tipo al catálogo debe costar una
 * línea acá, una interfaz en `tipos.ts` y un componente. Si validar un tipo
 * nuevo exigiera escribir un validador a mano, el catálogo dejaría de crecer y
 * la apuesta del producto —que crear material se parezca a escribir una
 * lista— se cae.
 */

import type { TipoItem } from "./tipos";

export interface EspecificacionTipo {
  /** Campos sin los cuales el ítem no significa nada. */
  requeridos: string[];
  /**
   * Grupos donde hace falta al menos uno. `[["contenido", "archivo"]]` acepta
   * cualquiera de los dos y rechaza que falten ambos.
   */
  alMenosUno?: string[][];
  /** Campos aceptados además de los comunes. */
  opcionales?: string[];
}

/** Aceptados por cualquier ítem, sea del tipo que sea. */
export const CAMPOS_COMUNES = [
  "id",
  "tipo",
  "titulo",
  "entradilla",
  "notas",
  "minutos",
] as const;

export const ESPECIFICACION: Record<TipoItem, EspecificacionTipo> = {
  titulo: { requeridos: ["titulo"], opcionales: ["destacado"] },

  markdown: {
    requeridos: [],
    alMenosUno: [["contenido", "archivo"]],
    opcionales: ["contenido", "archivo"],
  },

  codigo: {
    requeridos: ["lenguaje"],
    alMenosUno: [["contenido", "archivo"]],
    opcionales: ["contenido", "archivo", "lineas", "resaltar", "ruta"],
  },

  terminal: {
    requeridos: ["comando"],
    opcionales: ["salida", "comandoWindows", "duracion"],
  },

  diagrama: {
    requeridos: [],
    alMenosUno: [["contenido", "archivo"]],
    opcionales: ["contenido", "archivo", "clase"],
  },

  "modelo-datos": { requeridos: ["tablas"] },

  imagen: { requeridos: ["archivo"], opcionales: ["pie", "destacar"] },

  enlace: { requeridos: ["url"], opcionales: ["descripcion"] },

  archivo: { requeridos: ["archivo"], opcionales: ["descripcion"] },

  comparacion: { requeridos: ["izquierda", "derecha"] },

  metrica: {
    requeridos: ["valor"],
    opcionales: ["unidad", "contexto", "tono"],
  },

  tabla: { requeridos: ["columnas", "filas"], opcionales: ["resaltar"] },

  "cita-agente": {
    requeridos: ["cita"],
    opcionales: ["procedencia", "comentario"],
  },

  criterios: { requeridos: ["criterios"] },

  "error-comun": { requeridos: ["sintoma", "causa", "arreglo"] },

  demo: { requeridos: ["pasos"], opcionales: ["observar", "respaldo"] },

  transicion: { requeridos: ["vimos", "viene"] },

  "diagrama-secuencia": {
    requeridos: [],
    alMenosUno: [["fuente", "archivo"]],
    opcionales: ["fuente", "archivo", "mensajes"],
  },

  "comando-anotado": { requeridos: ["comando", "segmentos"] },

  "salida-anotada": {
    requeridos: ["salida", "anotaciones"],
    opcionales: ["comando"],
  },

  receso: { requeridos: ["minutos"] },

  "pausa-preguntas": { requeridos: [], opcionales: ["disparadores"] },

  asistencia: { requeridos: [], opcionales: ["nota"] },

  caso: {
    requeridos: [],
    opcionales: ["empresa", "cifras", "bloques", "archivo"],
  },

  pregunta: {
    requeridos: ["pregunta"],
    opcionales: [
      "opciones",
      "respuesta",
      "permiteOmitir",
      "visibilidad",
      "solucion",
    ],
  },
};

/**
 * Lo que nunca viaja al navegador del alumno con la carga de la página.
 *
 * Se filtra en el servidor, no se oculta con CSS: esta pantalla se proyecta, y
 * el HTML es legible con las herramientas de desarrollador abiertas. Ver
 * `docs/CONVENTIONS.md` §3.
 *
 * - `notas` son del docente, escritas para sí mismo.
 * - `respuesta` es la correcta de una pregunta. Enviarla antes del revelado
 *   convierte la pregunta en un ejercicio de inspeccionar el HTML.
 * - `solucion` está acá por lo mismo: llega por el canal, dentro del revelado.
 * - `minutos` es el presupuesto del docente, no información para la sala. Un
 *   alumno que ve «4′» en un ítem sabe cuándo el profesor va tarde, y eso
 *   cambia lo que la sala hace con una explicación que se alarga. El total de
 *   la sesión sí es suyo, y ya lo tiene: son las horas de inicio y fin.
 */
export const CAMPOS_PRIVADOS = [
  "notas",
  "respuesta",
  "solucion",
  "minutos",
] as const;

/** Campos que apuntan a un archivo bajo `contenido/`. */
export const CAMPOS_DE_ARCHIVO = ["archivo"] as const;
