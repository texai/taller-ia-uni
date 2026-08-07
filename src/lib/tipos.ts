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

import type { Secuencia } from "./plantuml";

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
  /**
   * Dónde vive este fragmento en el archivo real: `["16-22", "44-46"]`.
   *
   * Los rangos se corresponden con los bloques contiguos del `contenido`, en
   * orden, y la suma de sus líneas tiene que dar exactamente las del
   * fragmento. Con esto la lámina numera como numera el archivo, y entre dos
   * bloques dibuja un salto en vez de fingir que son seguidos.
   *
   * No se escribe a mano: lo calcula `npm run numerar` leyendo el laboratorio,
   * y `validar-contenido` comprueba que sigan cuadrando. La consecuencia es
   * que **un fragmento numerado tiene que ser literal** — en cuanto alguien le
   * añade un comentario que no está en el archivo, deja de cuadrar y falla.
   */
  numeros?: string[];
  /** El resaltado ya hecho. Lo rellena `resaltarSesion`, no el YAML. */
  html?: string;
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
  /** El resaltado ya hecho. Lo rellena `resaltarSesion`, no el YAML. */
  htmlComando?: string;
  htmlWindows?: string;
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
 * Varios descargables juntos, cada uno con su porqué.
 *
 * No es `archivo` repetido. Seis `archivo` seguidos son seis láminas que la
 * clase pasa a golpe de flecha, y para cuando aparece la sexta ya nadie se
 * está bajando la primera. Un juego de material que se entrega en bloque se
 * decide de una vez o no se decide, y para eso tiene que estar entero a la
 * vista.
 */
export interface ItemDescargas extends ItemBase {
  tipo: "descargas";
  archivos: { archivo: string; titulo: string; descripcion?: string }[];
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
 * Cita textual de una ejecución real del agente.
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
  pasos: { comando: string; esperado?: string; html?: string }[];
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
 * El caso de negocio dentro del que ocurre todo el curso.
 *
 * Los cinco retos no son cinco ejercicios sueltos: son cinco momentos del mismo
 * problema, en la misma empresa, sobre la misma flota de modelos. Ese marco
 * merece un contenedor propio y no una lámina de texto más — hasta ahora era un
 * `markdown` de tres minutos, uno entre veintiuno, y se volvía a contar en la
 * sesión 2 como otro markdown suelto.
 *
 * Puede escribirse en el ítem o vivir en su propio archivo bajo `contenido/`.
 * Lo segundo es lo que permite que las dos sesiones muestren el mismo caso sin
 * copiarlo — y un curso puede tener varios casos, o ninguno.
 */
export interface ItemCaso extends ItemBase, Partial<Caso> {
  tipo: "caso";
  /**
   * O en su propio archivo: `casos/retail-192.yml`.
   *
   * Es lo que permite que dos sesiones muestren EL MISMO caso sin copiarlo.
   * Un caso escrito dos veces son dos casos que se separan en cuanto alguien
   * corrige uno.
   */
  archivo?: string;
}

export interface Caso {
  titulo: string;
  /** Quién es la empresa y a qué se dedica. Una o dos frases. */
  empresa: string;
  /** Los números que definen la escala. Son lo que la clase recuerda. */
  cifras: { valor: string; unidad: string; nota?: string }[];
  /** Cómo funciona hoy, dónde está el problema, quién lo vigila. */
  bloques: { titulo: string; contenido: string }[];
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
  /**
   * Explicación por mensaje, en el orden en que aparecen en la fuente.
   *
   * Van por índice y no por texto —al revés que los segmentos de
   * `comando-anotado`— porque dos mensajes de un diagrama pueden decir
   * exactamente lo mismo y el texto no los distinguiría. El precio de un
   * índice es que se descoloca en cuanto alguien inserta una flecha en medio,
   * así que el cargador **exige** que la cuenta coincida con la de la fuente,
   * y `texto` permite anclar la explicación a lo que dice el mensaje.
   */
  mensajes?: { explicacion: string; texto?: string }[];
  /**
   * La fuente ya leída. La rellena el cargador, no el YAML.
   *
   * Vive en el ítem para que el navegador no tenga que volver a parsear en
   * cada render y, sobre todo, para que `pasosDe` cuente los mensajes DE LA
   * FUENTE: contarlos por las explicaciones haría que olvidar una escondiera
   * un mensaje del recorrido.
   */
  secuencia?: Secuencia;
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

/**
 * Una entrada del glosario del curso.
 *
 * `ojo` es el campo que más rinde: lo que la gente cree que significa el
 * término y no significa. La mitad de las entradas útiles de un glosario
 * técnico son una corrección, no una definición.
 */
export interface Termino {
  termino: string;
  /** Qué significan las siglas, si las hay. */
  expansion?: string;
  /** Cómo se dice también, normalmente en inglés. */
  tambien?: string;
  /** Para agrupar en el panel. */
  grupo?: string;
  definicion: string;
  ojo?: string;
}

/**
 * Una selección del glosario, como lámina.
 *
 * Los términos se nombran, no se copian: la definición vive en
 * `contenido/glosario.yml` y acá solo se elige cuáles mostrar y cuándo. Dos
 * láminas que definan «sesgo» con palabras distintas es exactamente lo que
 * este tipo existe para impedir.
 */
export interface ItemGlosario extends ItemBase {
  tipo: "glosario";
  /** Nombres de los términos, en el orden en que se quieren mostrar. */
  terminos?: string[];
  /** O un grupo entero, por su nombre. */
  grupo?: string;
  /**
   * Cuáles de los términos listados se abren por primera vez acá.
   *
   * Distingue los dos usos de esta lámina, que no son el mismo ítem: la de
   * **apertura** —«estas cuatro palabras se van a usar en lo que viene»— y la
   * de **referencia**, que junta términos ya vistos para compararlos.
   *
   * Un término solo puede declararse nuevo **una vez en todo el curso**, y el
   * cargador lo comprueba. Dos láminas presentando «deriva» como novedad son
   * dos explicaciones que se separan, que es justo lo que el glosario existe
   * para impedir (ver `CONVENTIONS.md` §18).
   */
  nuevos?: string[];
  /** Lo rellena el cargador desde `glosario.yml`. */
  entradas?: Termino[];
}

/**
 * Una salida de terminal, explicada trozo a trozo.
 *
 * `terminal` ya muestra una salida, pero la dibuja en bloque: la clase ve
 * cuarenta líneas y el docente señala con el dedo hacia la pantalla
 * compartida, que es exactamente lo que no funciona por Zoom.
 *
 * Es un tipo aparte y no un campo más de `comando-anotado` por dos razones que
 * el material de los batches 25 y 26 dejó claras. Una salida larga y su
 * comando **no caben en la misma lámina** —la ejecución verbosa del agente son
 * cuarenta líneas, y hubo que partirla en dos— y hay salidas que valen solas,
 * como la de `make memoria`. El `comando` va acá como contexto, en pequeño, y
 * puede faltar.
 */
export interface ItemSalidaAnotada extends ItemBase {
  tipo: "salida-anotada";
  /** Qué produjo esta salida. Contexto, no protagonista. */
  comando?: string;
  salida: string;
  anotaciones: {
    texto: string;
    explicacion: string;
  }[];
}

/**
 * Un cambio, enseñado como cambio.
 *
 * Hay arreglos que no se entienden como bloque de código y sí como diferencia:
 * la trampa del reto 4 es **un parámetro que no estaba**, y proyectada dentro
 * de su archivo obliga a que alguien diga cuál es la línea nueva. En
 * antes/después lo dice el dibujo.
 *
 * Es distinto de `comparacion`, que enfrenta dos ideas en prosa. Acá los dos
 * lados son el mismo código en dos momentos, y lo que importa es exactamente
 * lo que se movió entre uno y otro.
 */
export interface ItemDiff extends ItemBase {
  tipo: "diff";
  /** El archivo del laboratorio donde vive, si vive en uno. */
  ruta?: string;
  lenguaje?: string;
  antes: string;
  despues: string;
  /** Qué cambió, en una frase. Va debajo del dibujo. */
  explicacion?: string;
}

// --------------------------------------------------------------------------
// Familia: dictado
// --------------------------------------------------------------------------

/** Un archivo del laboratorio que hay que abrir, y por qué. */
export interface ArchivoDeLectura {
  /** Relativa a la raíz del laboratorio: `agente/herramientas.py`. */
  ruta: string;
  /** Una línea. Qué se va a encontrar y para qué sirve mirarlo. */
  porque: string;
  /** Dónde mirar dentro del archivo: `268-330`. Opcional. */
  lineas?: string;
}

/**
 * Una ventana para leer código y ejecutar, con el reloj a la vista.
 *
 * Nace de un hecho que el material se negaba a admitir: el laboratorio trae
 * todo escrito, y en cuatro horas con veinte personas no hay tiempo de depurar
 * el código de nadie. Lo que sí hay tiempo de hacer es abrir un archivo
 * concreto, entender qué hace y correr un comando — pero solo si a alguien se
 * le dice **cuál** archivo y **cuál** comando, y se le da el rato.
 *
 * Por eso no es una `demo`: una demo la conduce el docente desde adelante.
 * Acá cada uno trabaja en su máquina y lo que la lámina aporta es la lista y
 * el tiempo.
 *
 * El tiempo es propuesto, no impuesto: se puede alargar, acortar, pausar y
 * reiniciar sin salir del ítem. Una cuenta regresiva que no se puede mover es
 * una cuenta regresiva que el docente apaga la primera vez que la sala va
 * lenta, y entonces deja de servir el resto del día.
 */
export interface ItemLectura extends ItemBase {
  tipo: "lectura";
  /** El tiempo propuesto. Lo que arranca en el reloj. */
  minutos: number;
  /** Qué abrir. Cada uno se enlaza al repositorio. */
  archivos?: ArchivoDeLectura[];
  /** Qué ejecutar, en orden. */
  comandos?: string[];
  /** En qué fijarse. Lo que convierte leer en entender. */
  observar?: string;
}

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

/**
 * Tomar asistencia. La lámina la ve la clase; la nota, solo el docente.
 *
 * Empezó siendo un ítem oculto por completo, y era un error de forma: el
 * alumno veía la pantalla saltar de la nada a la portada sin saber que se
 * estaba pasando lista. Anunciarlo es mejor —la sala sabe qué se espera de
 * ella— y no cuesta nada, porque lo único que había que esconder era la nota
 * del docente, no el hecho.
 */
export interface ItemAsistencia extends ItemBase {
  tipo: "asistencia";
  /** Instrucción privada. Se filtra en el servidor, como las notas. */
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
  /**
   * Cuántos segundos dura, desde que el docente la abre.
   *
   * Es un valor por defecto y no una regla: se puede mover en el momento,
   * desde la propia lámina. Está en el contenido porque el tiempo que merece
   * una pregunta lo sabe quien la escribió — una cuenta mental de treinta
   * segundos y una de discusión no duran lo mismo—, y porque decidirlo en
   * vivo, con la sala esperando, es decidirlo mal.
   */
  segundos?: number;
  /**
   * Por qué esa es la respuesta. Se muestra SOLO tras el revelado.
   *
   * Preguntar y revelar sin explicar deja el momento a medias: la clase ve qué
   * eligió la mayoría y no ve el razonamiento. Antes esto vivía en las `notas`
   * privadas del docente, que por diseño no se proyectan — o sea que la
   * explicación existía y la clase nunca la veía.
   */
  solucion?: Solucion;
}

export interface Solucion {
  explicacion: string;
  /**
   * Por qué las otras no. Suele ser donde está la enseñanza: descartar bien
   * una opción plausible enseña más que confirmar la correcta.
   */
  descartes?: { opcion: string; razon: string }[];
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
  | ItemDescargas
  | ItemComparacion
  | ItemMetrica
  | ItemTabla
  | ItemCitaAgente
  | ItemCriterios
  | ItemErrorComun
  | ItemDemo
  | ItemTransicion
  | ItemCaso
  | ItemDiagramaSecuencia
  | ItemComandoAnotado
  | ItemSalidaAnotada
  | ItemGlosario
  | ItemDiff
  | ItemLectura
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
  descargas: "contenido",
  comparacion: "contenido",
  metrica: "contenido",
  tabla: "contenido",
  "cita-agente": "contenido",
  criterios: "contenido",
  "error-comun": "contenido",
  demo: "contenido",
  transicion: "contenido",
  "diagrama-secuencia": "contenido",
  caso: "contenido",
  "comando-anotado": "contenido",
  "salida-anotada": "contenido",
  glosario: "contenido",
  diff: "contenido",
  lectura: "dictado",
  receso: "dictado",
  "pausa-preguntas": "dictado",
  asistencia: "dictado",
  pregunta: "dictado",
};

export const TIPOS: TipoItem[] = Object.keys(FAMILIA) as TipoItem[];

/**
 * Ítems que el alumno no debe ver. Se filtran en el servidor.
 *
 * Está vacía, y eso es una posición y no un descuido: ocultar una lámina
 * entera desincroniza las dos pantallas —el docente avanza y la clase ve otra
 * cosa— y hasta ahora el único caso, la asistencia, se resolvió mejor
 * quitándole su nota privada y dejando la lámina. Si algún día vuelve a hacer
 * falta, el mecanismo sigue acá.
 */
export const SOLO_DOCENTE: readonly TipoItem[] = [] as const;

// --------------------------------------------------------------------------
// La jerarquía
// --------------------------------------------------------------------------

/**
 * Qué clase de unidad es.
 *
 * `caso` está acá y no como un atributo del curso porque un caso ES contenido:
 * hay cursos sin ninguno y cursos con varios, igual que con los retos. Un
 * `caso` en el curso lo volvería obligatorio y único, que es justo lo que no
 * es.
 */
export type TipoUnidad = "repaso" | "reto" | "cierre" | "caso";

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
  /**
   * El glosario, entero.
   *
   * Sí es un atributo del curso, y la diferencia con el caso —que
   * deliberadamente no lo es (§8)— vale la pena decirla: un caso es contenido
   * que ocupa tiempo y tiene un sitio en la escaleta, y puede haber varios o
   * ninguno. El glosario es **referencia**: hay uno, no ocupa minutos, y tiene
   * que estar disponible en todo momento y no en un punto del recorrido.
   */
  glosario?: Termino[];
  sesiones: Sesion[];
}
