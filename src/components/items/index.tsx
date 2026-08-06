/**
 * El registro: qué componente dibuja cada tipo de ítem.
 *
 * Un tipo sin renderizador NO rompe la vista. Muestra un aviso que dice cuál
 * fue, y el resto de la sesión sigue proyectándose. La alternativa —una
 * excepción que tumba la página— convierte un ítem a medio escribir en una
 * clase interrumpida, y el material se escribe hasta el último minuto.
 */

import type { Item, Sesion } from "@/lib/tipos";
import { FAMILIA } from "@/lib/tipos";

import { Marco } from "./marco";
import { BloqueMarkdown, CitaAgente, Metrica, Titulo, Transicion } from "./texto";
import { Codigo, ComandoAnotado, Demo, Terminal } from "./codigo";
import { Comparacion, Criterios, ErrorComun, ModeloDatos, Tabla } from "./datos";
import { Archivo, Diagrama, DiagramaSecuencia, Enlace, Imagen } from "./medios";

export interface PropsItem {
  item: Item;
  /** Para los ítems que se sitúan dentro de la sesión, como `transicion`. */
  sesion?: Sesion;
  unidadActual?: string;
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
          <code className="font-mono">{item.tipo}</code>
          {FAMILIA[item.tipo] === "dictado" && " — llega con el batch 5"}.
        </p>
      </div>
    </Marco>
  );
}

/** Dibuja un ítem, sea del tipo que sea. */
export function RenderizarItem({ item, sesion, unidadActual }: PropsItem) {
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
      return <DiagramaSecuencia item={item} />;
    case "comando-anotado":
      return <ComandoAnotado item={item} />;
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
    default:
      // Los de la familia `dictado` caen acá hasta el batch 5.
      return <SinRenderizador item={item} />;
  }
}
