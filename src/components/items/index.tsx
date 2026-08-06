/**
 * El registro: qué componente dibuja cada tipo de ítem.
 *
 * Un tipo sin renderizador NO rompe la vista. Muestra un aviso que dice cuál
 * fue, y el resto de la sesión sigue proyectándose. La alternativa —una
 * excepción que tumba la página— convierte un ítem a medio escribir en una
 * clase interrumpida, y el material se escribe hasta el último minuto.
 */

import type { Item, Sesion } from "@/lib/tipos";
import type { Revelado } from "@/lib/vivo";
import { FAMILIA } from "@/lib/tipos";

import { Marco } from "./marco";
import { BloqueMarkdown, CitaAgente, Metrica, Titulo, Transicion } from "./texto";
import { Codigo, ComandoAnotado, Demo, Terminal } from "./codigo";
import { Comparacion, Criterios, ErrorComun, ModeloDatos, Tabla } from "./datos";
import { Archivo, Diagrama, DiagramaSecuencia, Enlace, Imagen } from "./medios";
import { Asistencia, PausaPreguntas, Receso } from "./dictado";
import { Pregunta } from "./pregunta";

export interface PropsItem {
  item: Item;
  /** Para los ítems que se sitúan dentro de la sesión, como `transicion`. */
  sesion?: Sesion;
  unidadActual?: string;
  /**
   * Paso interno, cuando el ítem tiene varios. 0 es el conjunto completo, sin
   * nada enfocado. Los batches 13 y 14 lo usan para recorrer un diagrama de
   * secuencia y un comando anotado; el resto de los tipos lo ignora.
   */
  paso?: number;
  /**
   * Lo que necesita una `pregunta` para vivir en el canal: el recuento, el
   * revelado y cómo responder. El resto de los tipos lo ignora.
   */
  vivo?: {
    modoDocente?: boolean;
    revelado?: Revelado | null;
    respondieron?: number;
    conectados?: number;
    onResponder?: (v: { opcion?: string; texto?: string; omitida?: boolean }) => void;
    onRevelar?: () => void;
  };
}

function SinRenderizador({ item }: { item: Item }) {
  return (
    <Marco titulo={item.titulo}>
      <div
        className="rounded-xl border border-dashed p-6"
        style={{ borderColor: "var(--color-aviso)" }}
      >
        <p style={{ color: "var(--color-aviso)" }}>
          Todavía no hay renderizador para el tipo{" "}
          <code className="font-mono">{item.tipo}</code> (familia{" "}
          {FAMILIA[item.tipo]}).
        </p>
      </div>
    </Marco>
  );
}

/** Dibuja un ítem, sea del tipo que sea. */
export function RenderizarItem({
  item,
  sesion,
  unidadActual,
  paso = 0,
  vivo,
}: PropsItem) {
  switch (item.tipo) {
    case "titulo":
      return <Titulo item={item} />;
    case "markdown":
      return <BloqueMarkdown item={item} />;
    case "codigo":
      return <Codigo item={item} />;
    case "terminal":
      return <Terminal item={item} />;
    case "diagrama":
      return <Diagrama item={item} />;
    case "diagrama-secuencia":
      return <DiagramaSecuencia item={item} paso={paso} />;
    case "comando-anotado":
      return <ComandoAnotado item={item} paso={paso} />;
    case "modelo-datos":
      return <ModeloDatos item={item} />;
    case "imagen":
      return <Imagen item={item} />;
    case "enlace":
      return <Enlace item={item} />;
    case "archivo":
      return <Archivo item={item} />;
    case "comparacion":
      return <Comparacion item={item} />;
    case "metrica":
      return <Metrica item={item} />;
    case "tabla":
      return <Tabla item={item} />;
    case "cita-agente":
      return <CitaAgente item={item} />;
    case "criterios":
      return <Criterios item={item} />;
    case "error-comun":
      return <ErrorComun item={item} />;
    case "demo":
      return <Demo item={item} />;
    case "transicion":
      return <Transicion item={item} sesion={sesion} unidadActual={unidadActual} />;

    // Familia `dictado`: interrumpen, no informan.
    case "receso":
      return <Receso item={item} />;
    case "pausa-preguntas":
      return <PausaPreguntas item={item} />;
    case "pregunta":
      return <Pregunta item={item} {...vivo} />;
    case "asistencia":
      // El alumno nunca llega acá: `cursoParaAlumno` lo quita en el servidor.
      // Este componente solo se dibuja en las vistas del docente.
      return <Asistencia item={item} />;

    default:
      return <SinRenderizador item={item} />;
  }
}
