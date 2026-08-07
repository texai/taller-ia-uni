"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { clienteNavegador, HAY_SUPABASE } from "@/lib/supabase";
import type { Solucion } from "@/lib/tipos";
import {
  canalDePreguntas,
  canalDeRespuestas,
  contar,
  EVENTO_RESPUESTA,
  EVENTO_REVELADO,
  EVENTO_APERTURA,
  EVENTO_PAUTA,
  EVENTO_PREGUNTA,
  EVENTO_PREGUNTA_VIVA,
  esMasNueva,
  MAX_PREGUNTA,
  nombreCanal,
  SEGUNDOS_POR_DEFECTO,
  type Apertura,
  type EstadoCanal,
  type Pauta,
  type PreguntaAlumno,
  type PreguntaViva,
  type RespuestaAlumno,
  type Revelado,
} from "@/lib/vivo";

/**
 * Conecta una pantalla al canal de la sesión.
 *
 * El docente publica; el alumno escucha. La misma función sirve para los dos
 * porque el canal es el mismo — lo único que cambia es quién habla.
 */
/**
 * Cuánto se espera entre dos envíos de posición, como mínimo.
 *
 * Un cuarto de segundo: por debajo de eso no hay ojo humano que distinga dos
 * cambios de lámina, y por encima el movimiento normal —pasar una lámina, leer
 * un rato— sale instantáneo porque casi nunca hay dos en la misma ventana. Lo
 * que corta son las ráfagas.
 */
const MINIMO_ENTRE_ENVIOS = 250;

/**
 * Y cuánto entre dos anuncios de presencia.
 *
 * Mucho más espaciado, porque la presencia no es lo que mueve la clase: eso lo
 * hace el broadcast, que llega en milisegundos. La presencia solo tiene que
 * estar al día para **quien se conecte después** — un alumno que llega tarde o
 * una pestaña que vuelve— y a esos les da igual llegar dos segundos tarde.
 *
 * Antes iba pegada a cada movimiento, así que cada transición costaba dos
 * mensajes en vez de uno. Separarlas es lo que baja el tráfico a la mitad, y
 * el tráfico era el problema: el canal se cerraba tras unas pocas
 * transiciones seguidas y la clase se quedaba clavada.
 */
const MINIMO_ENTRE_PRESENCIAS = 2000;

/**
 * Cuánto tiene que aguantar una conexión para contarla como recuperada.
 *
 * La escalera de esperas entre reintentos se reiniciaba en cuanto llegaba
 * `SUBSCRIBED`, y eso la deja clavada en el primer escalón para siempre: un
 * canal que conecta y se cae en bucle reintenta cada segundo indefinidamente,
 * porque cada conexión —aunque dure un instante— borra la cuenta.
 *
 * Cinco segundos. Una reconexión de verdad se sostiene mucho más que eso, y
 * una que no llega ahí no era una reconexión.
 */
const MINIMO_PARA_DARLA_POR_BUENA = 5000;

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
  /** La pregunta lanzada al vuelo, si hay alguna abierta ahora mismo. */
  const [preguntaViva, setPreguntaViva] = useState<PreguntaViva | null>(null);
  /** La pregunta del material que está admitiendo respuestas, con su plazo. */
  const [apertura, setApertura] = useState<Apertura | null>(null);
  /** Cuántos alumnos hay conectados. Es el denominador de "respondieron
   *  todos", y sale de Presence: nunca hay que declarar el tamaño del grupo. */
  const [conectados, setConectados] = useState(0);
  const canal = useRef<RealtimeChannel | null>(null);
  const canalPreguntas = useRef<RealtimeChannel | null>(null);
  const canalRespuestas = useRef<RealtimeChannel | null>(null);
  /** El canal está listo para recibir envíos. */
  const suscrito = useRef(false);
  /** La última pauta que falta por emitir: por ráfaga o por canal caído. */
  const pendiente = useRef<Pauta | null>(null);
  /** Cuándo se emitió la última, para no pasarse del tope del canal. */
  const ultimoEnvio = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aperturaRef = useRef<Apertura | null>(null);
  const ultimaPresencia = useRef(0);
  const presencia = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  /**
   * Reconectar, y no solo enterarse de que se cayó.
   *
   * La versión anterior escuchaba `CHANNEL_ERROR`, `TIMED_OUT` y `CLOSED`,
   * pintaba «sin conexión» y no hacía nada más. En clase eso se ve así: el
   * docente sigue pasando láminas —su pantalla es local— y los alumnos se
   * quedan clavados donde estaban, sin que nadie se dé cuenta hasta que
   * alguien levanta la mano. Recargar arreglaba, y a los pocos minutos volvía.
   *
   * Un WebSocket se cae por motivos que no son un fallo: el portátil se
   * suspende, la red del aula cambia de punto de acceso, el navegador duerme
   * una pestaña de fondo, o el token de la sesión se renueva. Todos son
   * normales durante cuatro horas, así que reconectar no es un caso de error:
   * es parte del funcionamiento.
   */
  const reconexiones = useRef(0);
  const reintento = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conectar = useRef<(() => void) | null>(null);
  /** Ver `MINIMO_PARA_DARLA_POR_BUENA`. */
  const estable = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = clienteNavegador();
    if (!supabase) return;

    let vivo = true;

    /**
     * Los avisos de un canal que ya se limpió no cuentan.
     *
     * Al reconectar, el canal anterior emite `CLOSED` mientras se cierra — y
     * ese aviso llega DESPUÉS del `SUBSCRIBED` del canal nuevo. Sin distinguir
     * de qué canal viene, el indicador acaba diciendo «Sin conexión» con el
     * canal perfectamente vivo: es lo que se vio en la primera clase de
     * prueba, con el docente marcado como desconectado mientras los alumnos lo
     * seguían sin problema.
     */
    let generacion = 0;

    const aceptar = (nueva: Pauta) => {
      // Los mensajes pueden llegar fuera de orden tras una reconexión. Sin
      // esta comprobación, una pauta vieja arrastraría a la clase hacia atrás
      // en el peor momento posible.
      if (!esMasNueva(nueva, ultima.current)) return;
      ultima.current = nueva;
      setPauta(nueva);
    };

    const limpiar = () => {
      for (const ref of [canal, canalPreguntas, canalRespuestas]) {
        if (ref.current) supabase.removeChannel(ref.current);
        ref.current = null;
      }
      suscrito.current = false;
      if (estable.current) {
        clearTimeout(estable.current);
        estable.current = null;
      }
    };

    const programarReintento = () => {
      if (!vivo || reintento.current) return;
      // Rápido las primeras veces —una caída de red suele durar segundos— y
      // más espaciado después, hasta diez segundos. No se rinde nunca: una
      // clase dura cuatro horas y quedarse desconectado para siempre a la
      // tercera es peor que insistir.
      const espera = Math.min(1000 * 2 ** reconexiones.current, 10_000);
      reconexiones.current++;
      reintento.current = setTimeout(() => {
        reintento.current = null;
        if (vivo) abrir();
      }, espera);
    };

    const abrir = () => {
      if (!vivo) return;
      // **El orden importa, y al revés produce un parpadeo de un segundo.**
      //
      // `limpiar()` llama a `removeChannel`, y eso hace que el canal viejo
      // emita `CLOSED` por su propio callback. Si la generación se incrementa
      // DESPUÉS, ese `CLOSED` todavía pasa el filtro de `deOtra()` y se lee
      // como una caída: pinta «Sin conexión» y programa un reintento. Un
      // segundo más tarde el reintento vuelve a abrir, vuelve a limpiar,
      // vuelve a emitir `CLOSED`… y así indefinidamente, alternando «En vivo»
      // y «Sin conexión» a intervalos exactos.
      //
      // Que el estado alternara entre esos dos y nunca pasara por
      // «Reconectando» era la pista: `reconectando` sale de un error o un
      // tiempo agotado, y `sin-conexion` solo de un `CLOSED` — es decir, de un
      // cierre que pedimos nosotros.
      //
      // Subiendo la generación primero, todo lo que emita un canal que estamos
      // desmontando queda fuera por construcción. Es lo que el desmontaje del
      // efecto ya hacía bien.
      generacion++;
      limpiar();
      const mia = generacion;
      const deOtra = () => !vivo || mia !== generacion;

      const c = supabase.channel(nombreCanal(curso, sesion), {
        config: {
          presence: { key: esDocente ? "docente" : yo },
          // `self: false` es lo que permite que una pantalla del docente siga a
          // la otra sin oírse a sí misma. Con el eco activado, publicar y
          // escuchar en el mismo cliente sería un bucle.
          broadcast: { self: false },
        },
      });

      c.on("broadcast", { event: EVENTO_PAUTA }, ({ payload }) => {
        if (deOtra()) return;
        aceptar(payload as Pauta);
      });

      // Presence es lo que sincroniza a quien llega tarde, y también a quien
      // vuelve: al suscribirse llega el estado completo del canal, incluida la
      // posición que el docente dejó anotada la última vez que se movió.
      c.on("presence", { event: "sync" }, () => {
        if (deOtra()) return;
        const estados = c.presenceState<{ pauta?: Pauta }>();
        // El docente puede tener DOS pantallas abiertas —el proyector y el
        // teléfono— y las dos anuncian presencia bajo la misma clave. Gana la
        // pauta más reciente, no la primera de la lista.
        const delDocente = (estados["docente"] ?? [])
          .map((e) => e.pauta)
          .filter((p): p is Pauta => Boolean(p))
          .sort((a, b) => b.momento - a.momento)[0];
        if (delDocente) aceptar(delDocente);
        // Todos menos el docente. Si alguien se desconecta a mitad, el
        // denominador baja con él: no tiene sentido esperar por una pantalla
        // que se fue.
        setConectados(Object.keys(estados).filter((k) => k !== "docente").length);
      });

      // El revelado lo publica el docente en el canal público: a partir de ahí
      // los resultados sí se ven.
      c.on("broadcast", { event: EVENTO_REVELADO }, ({ payload }) => {
        if (deOtra()) return;
        setRevelado(payload as Revelado);
      });

      // Abrir una pregunta del material: a partir de acá, y hasta `hasta`,
      // los alumnos pueden responder. Antes solo veían el enunciado.
      c.on("broadcast", { event: EVENTO_APERTURA }, ({ payload }) => {
        if (deOtra()) return;
        setApertura(payload as Apertura);
      });

      // Una pregunta lanzada al vuelo viaja entera, porque no está en el
      // material. Va por el canal público —la ven todos— y se dibuja encima de
      // lo que hubiera en pantalla.
      c.on("broadcast", { event: EVENTO_PREGUNTA_VIVA }, ({ payload }) => {
        if (deOtra()) return;
        const viva = payload as PreguntaViva;
        setPreguntaViva(viva.cerrada ? null : viva);
      });

      c.subscribe((situacion) => {
        if (deOtra()) return;
        if (situacion === "SUBSCRIBED") {
          setEstado("en-vivo");
          suscrito.current = true;
          // La escalera de esperas se reinicia solo si el canal aguanta. Ver
          // `estable`: ponerla a cero acá mismo dejaba el reintento clavado en
          // un segundo por muy mal que fuera la red.
          if (estable.current) clearTimeout(estable.current);
          estable.current = setTimeout(() => {
            estable.current = null;
            reconexiones.current = 0;
          }, MINIMO_PARA_DARLA_POR_BUENA);

          // **Lo que hace que reconectar sirva de algo.** Al volver, el canal
          // está vacío: nadie recuerda dónde iba la clase. El docente reemite
          // su posición y vuelve a dejarla en presence, así que los alumnos se
          // recolocan solos aunque no se haya movido de lámina. Sin esto, la
          // clase seguiría separada hasta el siguiente cambio de página.
          const p = pendiente.current ?? ultima.current;
          if (esDocente && p) {
            void c.send({ type: "broadcast", event: EVENTO_PAUTA, payload: p });
            void c.track({ pauta: p });
            pendiente.current = null;
          }
          // Si hay una pregunta abierta y todavía le queda tiempo, se
          // reemite: quien acabe de reconectar tiene que poder responderla, y
          // con el plazo que queda de verdad.
          const a = aperturaRef.current;
          if (esDocente && a && a.hasta > Date.now()) {
            void c.send({ type: "broadcast", event: EVENTO_APERTURA, payload: a });
          }
          // Y el alumno vuelve a anunciarse, o dejaría de contar en el
          // denominador de «respondieron todos».
          if (!esDocente) void c.track({ alumno: true });
          return;
        }
        suscrito.current = false;
        setEstado(situacion === "CLOSED" ? "sin-conexion" : "reconectando");
        programarReintento();
      });

      canal.current = c;

      // Canal de preguntas, aparte. El docente se suscribe para recibirlas; el
      // alumno solo lo abre para poder publicar. Que un alumno intente leerlo
      // no depende de que el cliente se porte bien: lo corta la política.
      const cp = supabase.channel(canalDePreguntas(curso, sesion));
      if (esDocente) {
        cp.on("broadcast", { event: EVENTO_PREGUNTA }, ({ payload }) => {
          if (deOtra()) return;
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
          if (deOtra()) return;
          setRespuestas((previas) => [...previas, payload as RespuestaAlumno]);
        });
      }
      cr.subscribe();
      canalRespuestas.current = cr;
    };

    conectar.current = abrir;
    abrir();

    /**
     * Tres avisos del navegador, y un vigilante.
     *
     * Los avisos cubren lo que el navegador sí sabe: que volvió la red, que la
     * pestaña dejó de estar en segundo plano —y ahí es donde se duerme un
     * WebSocket sin avisar—, y que la sesión se renovó, porque el canal del
     * docente va autenticado y con el token viejo lo rechazan.
     *
     * El vigilante cubre lo que no avisa nadie: un canal que se quedó a medias
     * y nunca emitió su error. Cada diez segundos, si esto no está en vivo,
     * vuelve a intentarlo. Es barato y es el único que se entera de los casos
     * que no tienen nombre.
     */
    const despertar = () => {
      if (!vivo || suscrito.current) return;
      reconexiones.current = 0;
      if (reintento.current) {
        clearTimeout(reintento.current);
        reintento.current = null;
      }
      abrir();
    };

    const alVolverAlFrente = () => {
      if (document.visibilityState === "visible") despertar();
    };

    window.addEventListener("online", despertar);
    document.addEventListener("visibilitychange", alVolverAlFrente);

    let tokenPuesto: string | undefined;
    const { data: escuchaAuth } = supabase.auth.onAuthStateChange(
      (_evento, sesionNueva) => {
        if (!vivo) return;
        // El token del socket no se renueva solo. Sin esto, a la hora de clase
        // el canal del docente empieza a devolver error de autorización y la
        // sala deja de moverse — que es exactamente el síntoma que se vio.
        //
        // Pero solo cuando **cambia de verdad**. `onAuthStateChange` dispara
        // un `INITIAL_SESSION` al montar y algún evento más con el mismo
        // token, y cada `setAuth` empuja el token a los canales ya unidos:
        // repetirlo con el mismo valor es pedir una reunión que no hacía
        // falta, justo mientras el canal se está suscribiendo.
        const token = sesionNueva?.access_token;
        if (token === tokenPuesto) return;
        tokenPuesto = token;
        supabase.realtime.setAuth(token);
      },
    );

    const vigilante = setInterval(() => {
      if (vivo && !suscrito.current) despertar();
    }, 10_000);

    return () => {
      vivo = false;
      generacion++;
      conectar.current = null;
      if (reintento.current) clearTimeout(reintento.current);
      reintento.current = null;
      clearInterval(vigilante);
      window.removeEventListener("online", despertar);
      document.removeEventListener("visibilitychange", alVolverAlFrente);
      escuchaAuth.subscription.unsubscribe();
      if (temporizador.current) clearTimeout(temporizador.current);
      if (presencia.current) clearTimeout(presencia.current);
      temporizador.current = null;
      presencia.current = null;
      limpiar(); // se lleva también el temporizador de `estable`
    };
  }, [curso, sesion, esDocente, yo]);

  /**
   * Publica la posición. Solo el docente llama a esto.
   *
   * Se emite por broadcast —rápido, para quien ya está mirando— y además se
   * deja en presence, que es lo que recibirá quien se conecte después.
   *
   * Devuelve la pauta emitida, con su marca de tiempo. El mando la necesita:
   * su posición es la más reciente entre lo que él mismo mandó y lo que llegó
   * del proyector, y para compararlas las dos tienen que llevar el mismo
   * reloj. Si el mando se inventara la suya, dos marcas distintas para el
   * mismo movimiento decidirían mal esa comparación.
   */
  /**
   * Publica la posición, sin inundar el canal.
   *
   * Es el arreglo de la desincronía que se veía moviéndose rápido: dos flechas
   * seguidas eran **cuatro mensajes** —un broadcast y una presencia por cada
   * una—, y mantener pulsada una flecha, decenas por segundo. Un canal de
   * Realtime tiene un tope de eventos por segundo, y pasarse no devuelve un
   * error visible: **cierra el canal**. Desde la pantalla del docente no se
   * nota nada, porque su posición es local; los alumnos se quedan clavados.
   *
   * Así que se envía como mucho una vez cada `MINIMO_ENTRE_ENVIOS`, y lo que
   * se envía es siempre **la última posición**, no la primera de la ráfaga.
   * Ese detalle es todo: recorrer diez láminas de un tirón produce un mensaje
   * con la décima, que es donde la clase tiene que acabar. Nadie necesita ver
   * las nueve intermedias.
   */
  /**
   * Deja la posición en presence, sin ir pegada a cada movimiento.
   *
   * Siempre anuncia **la última** que haya, así que aunque se salte varias
   * durante una ráfaga, la que queda anotada es la buena.
   */
  const anunciar = useCallback(() => {
    const hacerlo = () => {
      presencia.current = null;
      ultimaPresencia.current = Date.now();
      const c = canal.current;
      const p = ultima.current;
      if (c && p && suscrito.current) void c.track({ pauta: p });
    };
    const desde = Date.now() - ultimaPresencia.current;
    if (desde >= MINIMO_ENTRE_PRESENCIAS) {
      hacerlo();
    } else if (!presencia.current) {
      presencia.current = setTimeout(hacerlo, MINIMO_ENTRE_PRESENCIAS - desde);
    }
  }, []);

  const publicar = useCallback(
    (itemId: string, paso: number, enVivo: boolean): Pauta | null => {
      if (!esDocente) return null;

      const nueva: Pauta = { itemId, paso, enVivo, momento: Date.now() };
      ultima.current = nueva;
      // Siempre queda anotada la última: la envíe quien la envíe, y aunque el
      // canal esté caído en este instante, se emite al reconectar.
      pendiente.current = nueva;

      const emitir = () => {
        temporizador.current = null;
        const c = canal.current;
        const p = pendiente.current;
        if (!c || !p || !suscrito.current) return;
        ultimoEnvio.current = Date.now();
        pendiente.current = null;
        void c.send({ type: "broadcast", event: EVENTO_PAUTA, payload: p });
        anunciar();
      };

      const desde = Date.now() - ultimoEnvio.current;
      if (desde >= MINIMO_ENTRE_ENVIOS) {
        emitir();
      } else if (!temporizador.current) {
        temporizador.current = setTimeout(emitir, MINIMO_ENTRE_ENVIOS - desde);
      }
      return nueva;
    },
    [esDocente, anunciar],
  );

  /**
   * El docente abre una pregunta del material.
   *
   * Hasta que la abre, la clase ve el enunciado y nada más. Esa espera es
   * deliberada: leer y decidir son dos cosas, y enseñarlas juntas hace que
   * media sala pulse antes de terminar de leer.
   */
  const abrir = useCallback(
    (preguntaId: string, segundos: number): Apertura | null => {
      const c = canal.current;
      if (!c || !esDocente) return null;
      const nueva: Apertura = {
        preguntaId,
        segundos,
        hasta: Date.now() + segundos * 1000,
      };
      aperturaRef.current = nueva;
      setApertura(nueva);
      setRevelado(null);
      void c.send({ type: "broadcast", event: EVENTO_APERTURA, payload: nueva });
      return nueva;
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
    (preguntaId: string, correcta?: string, solucion?: Solucion) => {
      const c = canal.current;
      if (!c || !esDocente) return;
      const cuenta = contar(respuestas, preguntaId, correcta, solucion);
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

  /**
   * El docente lanza una pregunta que no estaba en el material.
   *
   * Se emite por el canal público y se guarda también acá: el mando tiene que
   * poder ver el recuento de lo que acaba de lanzar, y el canal no le devuelve
   * sus propios mensajes.
   */
  const lanzar = useCallback(
    (pregunta: string, opciones: string[]): PreguntaViva | null => {
      const c = canal.current;
      const limpia = pregunta.trim();
      if (!c || !esDocente || !limpia) return null;

      const viva: PreguntaViva = {
        id: `viva-${crypto.randomUUID()}`,
        pregunta: limpia,
        opciones: opciones.length ? opciones : undefined,
        momento: Date.now(),
      };
      setPreguntaViva(viva);
      setRevelado(null);
      void c.send({
        type: "broadcast",
        event: EVENTO_PREGUNTA_VIVA,
        payload: viva,
      });
      return viva;
    },
    [esDocente],
  );

  /** Retira la pregunta lanzada de todas las pantallas. */
  const cerrarViva = useCallback(() => {
    const c = canal.current;
    if (!c || !esDocente || !preguntaViva) return;
    setPreguntaViva(null);
    void c.send({
      type: "broadcast",
      event: EVENTO_PREGUNTA_VIVA,
      payload: { ...preguntaViva, cerrada: true } satisfies PreguntaViva,
    });
  }, [esDocente, preguntaViva]);

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
    preguntaViva,
    lanzar,
    cerrarViva,
    apertura,
    abrir,
    SEGUNDOS_POR_DEFECTO,
  };
}
