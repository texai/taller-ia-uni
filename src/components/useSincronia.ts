"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { clienteNavegador, HAY_SUPABASE } from "@/lib/supabase";
import {
  EVENTO_PAUTA,
  esMasNueva,
  nombreCanal,
  type EstadoCanal,
  type Pauta,
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
  const canal = useRef<RealtimeChannel | null>(null);
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
    return () => {
      canal.current = null;
      supabase.removeChannel(c);
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

  return { pauta, estado, publicar };
}
