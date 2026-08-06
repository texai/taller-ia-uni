"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { clienteNavegador, HAY_SUPABASE } from "@/lib/supabase";
import {
  canalDePreguntas,
  canalDeRespuestas,
  contar,
  EVENTO_RESPUESTA,
  EVENTO_REVELADO,
  EVENTO_PAUTA,
  EVENTO_PREGUNTA,
  esMasNueva,
  MAX_PREGUNTA,
  nombreCanal,
  type EstadoCanal,
  type Pauta,
  type PreguntaAlumno,
  type RespuestaAlumno,
  type Revelado,
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
  const [respuestas, setRespuestas] = useState<RespuestaAlumno[]>([]);
  const [revelado, setRevelado] = useState<Revelado | null>(null);
  /** Cuántos alumnos hay conectados. Es el denominador de "respondieron
   *  todos", y sale de Presence: nunca hay que declarar el tamaño del grupo. */
  const [conectados, setConectados] = useState(0);
  const canal = useRef<RealtimeChannel | null>(null);
  const canalPreguntas = useRef<RealtimeChannel | null>(null);
  const canalRespuestas = useRef<RealtimeChannel | null>(null);
  /** El canal está listo para recibir envíos. */
  const suscrito = useRef(false);
  /** La última pauta que se quiso publicar antes de estarlo. */
  const pendiente = useRef<Pauta | null>(null);

  /**
   * Identidad anónima y estable dentro de la pestaña.
   *
   * Sirve para no contar dos veces a quien cambia de opinión. Va en un estado
   * con inicializador perezoso y no en un ref: un ref hay que escribirlo, y
   * escribirlo durante el render es justo lo que React desaconseja. Este valor
   * nace una vez y no cambia nunca, que es lo que un estado hace bien.
   */
  const [yo] = useState(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : "",
  );
  const ultima = useRef<Pauta | null>(null);

  useEffect(() => {
    const supabase = clienteNavegador();
    if (!supabase) return;

    /**
     * Los avisos de un canal que ya se limpió no cuentan.
     *
     * Al reejecutarse el efecto, el canal anterior emite `CLOSED` mientras se
     * cierra — y ese aviso llega DESPUÉS del `SUBSCRIBED` del canal nuevo. Sin
     * esta bandera, el indicador acaba diciendo "Sin conexión" con el canal
     * perfectamente vivo: exactamente lo que se vio en la primera clase de
     * prueba, con el docente marcado como desconectado mientras los alumnos lo
     * seguían sin problema.
     */
    let vigente = true;

    const c = supabase.channel(nombreCanal(curso, sesion), {
      config: { presence: { key: esDocente ? "docente" : crypto.randomUUID() } },
    });

    const aceptar = (nueva: Pauta) => {
      if (!vigente) return;
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
      if (!vigente) return;
      const estados = c.presenceState<{ pauta?: Pauta }>();
      const delDocente = estados["docente"]?.[0]?.pauta;
      if (delDocente) aceptar(delDocente);
      // Todos menos el docente. Si alguien se desconecta a mitad, el
      // denominador baja con él: no tiene sentido esperar por una pantalla que
      // se fue.
      setConectados(
        Object.keys(estados).filter((k) => k !== "docente").length,
      );
    });

    // El revelado lo publica el docente en el canal público: a partir de ahí
    // los resultados sí se ven.
    c.on("broadcast", { event: EVENTO_REVELADO }, ({ payload }) => {
      if (!vigente) return;
      setRevelado(payload as Revelado);
    });

    c.subscribe((situacion) => {
      if (!vigente) return;
      if (situacion === "SUBSCRIBED") {
        setEstado("en-vivo");
        suscrito.current = true;
        // Se publica la posición en cuanto hay canal, sin esperar a que el
        // docente se mueva. Si no, quien entre antes del primer movimiento se
        // queda sin pauta y aterriza en el primer ítem.
        const p = pendiente.current;
        if (p) {
          void c.send({ type: "broadcast", event: EVENTO_PAUTA, payload: p });
          void c.track({ pauta: p });
        }
      }
      else if (situacion === "CHANNEL_ERROR" || situacion === "TIMED_OUT") {
        suscrito.current = false;
        setEstado("reconectando");
      } else if (situacion === "CLOSED") {
        suscrito.current = false;
        setEstado("sin-conexion");
      }
    });

    canal.current = c;

    // Canal de preguntas, aparte. El docente se suscribe para recibirlas; el
    // alumno solo lo abre para poder publicar. Que un alumno intente leerlo no
    // depende de que el cliente se porte bien: lo corta la política.
    const cp = supabase.channel(canalDePreguntas(curso, sesion));
    if (esDocente) {
      cp.on("broadcast", { event: EVENTO_PREGUNTA }, ({ payload }) => {
        if (!vigente) return;
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

    // Canal de respuestas, con la misma asimetría: los alumnos escriben y no
    // leen. Antes del revelado, ver las respuestas de los demás cambia las
    // propias.
    const cr = supabase.channel(canalDeRespuestas(curso, sesion));
    if (esDocente) {
      cr.on("broadcast", { event: EVENTO_RESPUESTA }, ({ payload }) => {
        if (!vigente) return;
        setRespuestas((previas) => [...previas, payload as RespuestaAlumno]);
      });
    }
    cr.subscribe();
    canalRespuestas.current = cr;

    // Un alumno anuncia su presencia para que cuente en el denominador.
    if (!esDocente) void c.track({ alumno: true });

    return () => {
      vigente = false;
      suscrito.current = false;
      canal.current = null;
      canalPreguntas.current = null;
      canalRespuestas.current = null;
      supabase.removeChannel(c);
      supabase.removeChannel(cp);
      supabase.removeChannel(cr);
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

      // Enviar por un canal que todavía no terminó de suscribirse falla, y en
      // algunos casos lo cierra. Se guarda y se emite al suscribirse.
      if (!suscrito.current) {
        pendiente.current = nueva;
        return;
      }
      pendiente.current = null;
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

  /** El alumno responde una pregunta del docente. */
  const responder = useCallback(
    (preguntaId: string, valor: { opcion?: string; texto?: string; omitida?: boolean }) => {
      const cr = canalRespuestas.current;
      if (!cr) return false;
      void cr.send({
        type: "broadcast",
        event: EVENTO_RESPUESTA,
        payload: {
          preguntaId,
          alumnoId: yo,
          opcion: valor.opcion,
          texto: valor.texto,
          omitida: Boolean(valor.omitida),
          momento: Date.now(),
        } satisfies RespuestaAlumno,
      });
      return true;
    },
    [yo],
  );

  /**
   * El docente revela los resultados.
   *
   * Es un acto deliberado: el momento de mostrar el resultado es el momento de
   * enseñar. Lo único que lo dispara solo es que ya hayan respondido todos,
   * porque a esa altura no queda a quién sesgar.
   */
  const revelar = useCallback(
    (preguntaId: string, correcta?: string) => {
      const c = canal.current;
      if (!c || !esDocente) return;
      const cuenta = contar(respuestas, preguntaId, correcta);
      setRevelado(cuenta);
      void c.send({ type: "broadcast", event: EVENTO_REVELADO, payload: cuenta });
    },
    [esDocente, respuestas],
  );

  /** Cuántos respondieron una pregunta. Sin decir qué respondieron. */
  const cuantosRespondieron = useCallback(
    (preguntaId: string) => contar(respuestas, preguntaId).total,
    [respuestas],
  );

  return {
    pauta,
    estado,
    publicar,
    preguntas,
    preguntar,
    atender,
    respuestas,
    responder,
    revelar,
    revelado,
    conectados,
    cuantosRespondieron,
  };
}
