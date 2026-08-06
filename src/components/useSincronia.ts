"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { clienteNavegador, HAY_SUPABASE } from "@/lib/supabase";
import {
  canalDePreguntas,
  EVENTO_PAUTA,
  EVENTO_PREGUNTA,
  esMasNueva,
  MAX_PREGUNTA,
  nombreCanal,
  type EstadoCanal,
  type Pauta,
  type PreguntaAlumno,
} from "@/lib/vivo";

/**
 * Conecta una pantalla al canal de la sesión.
 *
 * El docente publica; el alumno escucha. La misma función sirve para los dos
 * porque el canal es el mismo — lo único que cambia es quién habla.
 */
export function useSincronia({
  curso,
  sesion,
  esDocente,
}: {
  curso: string;
  sesion: string;
  esDocente: boolean;
}) {
  const [pauta, setPauta] = useState<Pauta | null>(null);
  // El estado inicial ya sabe si hay configuración: es un dato del despliegue,
  // no algo que se descubra al conectar.
  const [estado, setEstado] = useState<EstadoCanal>(
    HAY_SUPABASE ? "conectando" : "sin-configurar",
  );
  const [preguntas, setPreguntas] = useState<PreguntaAlumno[]>([]);
  const canal = useRef<RealtimeChannel | null>(null);
  const canalPreguntas = useRef<RealtimeChannel | null>(null);
  const ultima = useRef<Pauta | null>(null);

  useEffect(() => {
    const supabase = clienteNavegador();
    if (!supabase) return;

    const c = supabase.channel(nombreCanal(curso, sesion), {
      config: { presence: { key: esDocente ? "docente" : crypto.randomUUID() } },
    });

    const aceptar = (nueva: Pauta) => {
      // Los mensajes pueden llegar fuera de orden tras una reconexión. Sin
      // esta comprobación, una pauta vieja arrastraría a la clase hacia atrás
      // en el peor momento posible.
      if (!esMasNueva(nueva, ultima.current)) return;
      ultima.current = nueva;
      setPauta(nueva);
    };

    c.on("broadcast", { event: EVENTO_PAUTA }, ({ payload }) => {
      aceptar(payload as Pauta);
    });

    // Presence es lo que sincroniza a quien llega tarde: al suscribirse llega
    // el estado completo del canal, incluida la posición que el docente dejó
    // anotada la última vez que se movió.
    c.on("presence", { event: "sync" }, () => {
      const estados = c.presenceState<{ pauta?: Pauta }>();
      const delDocente = estados["docente"]?.[0]?.pauta;
      if (delDocente) aceptar(delDocente);
    });

    c.subscribe((situacion) => {
      if (situacion === "SUBSCRIBED") setEstado("en-vivo");
      else if (situacion === "CHANNEL_ERROR" || situacion === "TIMED_OUT") {
        setEstado("reconectando");
      } else if (situacion === "CLOSED") setEstado("sin-conexion");
    });

    canal.current = c;

    // Canal de preguntas, aparte. El docente se suscribe para recibirlas; el
    // alumno solo lo abre para poder publicar. Que un alumno intente leerlo no
    // depende de que el cliente se porte bien: lo corta la política.
    const cp = supabase.channel(canalDePreguntas(curso, sesion));
    if (esDocente) {
      cp.on("broadcast", { event: EVENTO_PREGUNTA }, ({ payload }) => {
        const pregunta = payload as PreguntaAlumno;
        setPreguntas((previas) =>
          previas.some((p) => p.id === pregunta.id)
            ? previas
            : [...previas, pregunta],
        );
      });
    }
    cp.subscribe();
    canalPreguntas.current = cp;

    return () => {
      canal.current = null;
      canalPreguntas.current = null;
      supabase.removeChannel(c);
      supabase.removeChannel(cp);
    };
  }, [curso, sesion, esDocente]);

  /**
   * Publica la posición. Solo el docente llama a esto.
   *
   * Se emite por broadcast —rápido, para quien ya está mirando— y además se
   * deja en presence, que es lo que recibirá quien se conecte después.
   */
  const publicar = useCallback(
    (itemId: string, paso: number, enVivo: boolean) => {
      const c = canal.current;
      if (!c || !esDocente) return;
      const nueva: Pauta = { itemId, paso, enVivo, momento: Date.now() };
      ultima.current = nueva;
      void c.send({ type: "broadcast", event: EVENTO_PAUTA, payload: nueva });
      void c.track({ pauta: nueva });
    },
    [esDocente],
  );

  /** El alumno manda una pregunta. Devuelve si salió. */
  const preguntar = useCallback(
    (texto: string, autor: string, itemId: string, itemTitulo: string, paso: number) => {
      const cp = canalPreguntas.current;
      const limpio = texto.trim().slice(0, MAX_PREGUNTA);
      if (!cp || !limpio) return false;

      void cp.send({
        type: "broadcast",
        event: EVENTO_PREGUNTA,
        payload: {
          id: crypto.randomUUID(),
          texto: limpio,
          autor: autor.trim() || undefined,
          itemId,
          itemTitulo,
          paso,
          momento: Date.now(),
        } satisfies PreguntaAlumno,
      });
      return true;
    },
    [],
  );

  /** El docente marca una pregunta como atendida. */
  const atender = useCallback((id: string) => {
    setPreguntas((previas) => previas.filter((p) => p.id !== id));
  }, []);

  return { pauta, estado, publicar, preguntas, preguntar, atender };
}
