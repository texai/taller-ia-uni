# TODO

Backlog de batches de la plataforma de dictado del Taller 02.

Cada batch es **autocontenido**: pensado para enviarse solo a un asistente de
codificación y resolverse en una conversación independiente, sin depender de
contexto de batches futuros.

- Entrada: [`DRAFT.md`](DRAFT.md) → batches (ver [`WORKFLOW-1-DRAFT-TODO.md`](WORKFLOW-1-DRAFT-TODO.md)).
- Salida: implementación (ver [`WORKFLOW-2-TODO-CODE.md`](WORKFLOW-2-TODO-CODE.md)); al completarse, el bloque se mueve a [`DONE.md`](DONE.md) y se registra en [`CHANGELOG.md`](../CHANGELOG.md).

Referencias:
- [`CONVENTIONS.md`](CONVENTIONS.md) — reglas no derivables del código, y el **catálogo de tipos de ítem**
- [`../README.md`](../README.md) — qué es la aplicación y cómo se corre

## Resumen

| # | Título | Estado |
|---|--------|--------|
| 1 | Esqueleto Next.js y despliegue en Vercel | ✅ Completado |
| 2 | Modelo de contenido en YAML y cargador | ✅ Completado |
| 3 | Estructura completa del curso | ✅ Completado |
| 4 | Renderizadores: familia `contenido` | ✅ Completado |
| 5 | Renderizadores: familia `dictado` | ✅ Completado |
| 6 | Vista de dictado y navegación por teclado | ✅ Completado |
| 7 | Autenticación del docente en `/profe` | ✅ Completado |
| 8 | Sincronía en vivo: el docente marca el ritmo | ✅ Completado |
| 9 | Preguntas del alumno hacia el docente | ✅ Completado |
| 10 | Preguntas del docente hacia los alumnos | ✅ Completado |
| 11 | Segunda pantalla del docente | ⬜ Pendiente |
| 12 | Reloj de sesión y avisos de tiempo | ⬜ Pendiente |
| 13 | Diagramas de secuencia PlantUML, recorribles | ⬜ Pendiente |
| 14 | Comandos anotados parte por parte | ⬜ Pendiente |
| | **Contenido — una unidad por iteración** | |
| 15 | S1·U1 `repaso` — Dónde encaja esto, y la flota | ⬜ Pendiente |
| 16 | S1·U2 `reto` — Encontrar el problema a mano | ⬜ Pendiente |
| 17 | S1·U3 `reto` — La herramienta de percepción | ⬜ Pendiente |
| 18 | S1·U4 `reto` — El primer agente, sin arquitectura | ⬜ Pendiente |
| 19 | S2·U1 `repaso` — Qué le faltaba al bucle de ayer | ⬜ Pendiente |
| 20 | S2·U2 `reto` — La arquitectura cognitiva | ⬜ Pendiente |
| 21 | S2·U3 `reto` — De la recomendación a la acción | ⬜ Pendiente |
| 22 | S2·U4 `cierre` — Los errores, y dónde estaban | ⬜ Pendiente |

Estados: ⬜ Pendiente · 🔵 En curso · ✅ Completado · ⬛ No usado

**Ruta mínima para dictar el sábado:** batches 1 a 8. Del 9 al 14 mejoran el
dictado pero la clase se puede dar sin ellos.

Los batches 13 y 14 dependen de los `pasos` internos que introduce el batch 6
(ver [`CONVENTIONS.md`](CONVENTIONS.md) §10).

**Los batches 15 a 22 son de contenido, no de código.** Se hacen *después* de
que la funcionalidad esté en pie, y **uno por conversación** — una iteración
que sostiene las ocho unidades a la vez escribe ocho unidades mediocres (ver
[`CONVENTIONS.md`](CONVENTIONS.md) §13). Cada uno toca un solo archivo de
unidad y no necesita leer el resto del curso.

### Decisiones pendientes

| Decisión | Bloquea | Detalle |
|---|---|---|
| ~~Proyecto Supabase~~ | ~~Batches 7, 8~~ | ✅ Resuelto: se comparte el de `gen`. Falta deshabilitar el registro en Authentication → Providers → Email, crear el usuario del docente, y habilitar Realtime |
| Dominio de la aplicación | — (ajuste posterior) | Afecta a la URL que se comparte con los alumnos y a los `redirectTo` de Supabase Auth |
| Cuánto contenido fino entra antes del sábado | Batch 3 | El batch deja la estructura de las 8 horas. Llenar cada ítem con su contenido definitivo es trabajo aparte, y puede hacerse en caliente entre sesión y sesión |
| ~~Retención de preguntas y respuestas~~ | ~~Batch 9, 10~~ | ✅ Resuelto: no se persisten. No hay tablas (ver [`CONVENTIONS.md`](CONVENTIONS.md) §11) |
| Identificador del docente | Batches 7, 8 | Hace falta el `uuid` del usuario creado en Supabase, para `NEXT_PUBLIC_DOCENTE_UID` y para la política sobre `realtime.messages` |

---

## Batch 8 — Sincronía en vivo: el docente marca el ritmo

**Verificado en producción el 6 de agosto**, en lo esencial: el docente entra,
activa el dictado y el alumno lo sigue solo; con el dictado apagado el alumno
queda libre. Quedan por comprobar los casos de borde de la lista de abajo — la
red del contenedor de desarrollo deniega las conexiones salientes a Supabase,
así que solo se pueden probar desplegados.

### Qué falta comprobar, y cómo

Con `.env.local` puesto y `npm run dev`:

1. Abrir `/profe`, entrar, e ir a `/profe/sesion/sesion-1`.
2. En otra ventana —de incógnito, para no compartir sesión— abrir
   `/curso/taller-02/sesion/sesion-1`.
3. Mover al docente con las flechas. **El alumno debería seguirlo.**
4. En el alumno, retroceder: debería quedarse donde está y aparecer el botón
   "Volver a donde va la clase".
5. En el alumno, intentar avanzar más allá del docente: no debería moverse.
6. Recargar el alumno a mitad de clase: debería aterrizar donde va el docente,
   **incluido el paso interno** si es un comando anotado.
7. Pulsar "Ensayando" en el docente: el alumno debería quedar libre.

Si el indicador dice **Reconectando**, lo más probable es que Realtime no esté
habilitado en el proyecto: `gen` no lo usa.

### Lo que queda pendiente del alcance original

- [ ] Aplicar `supabase/politicas.sql` en el editor SQL del proyecto. Hasta que
      eso pase, el canal está abierto: cualquiera que sepa el nombre del tema
      podría publicar una pauta falsa, y las preguntas y respuestas de los
      alumnos son legibles entre ellos. Deben quedar **siete** políticas.
      Después de aplicarlo hay que volver a probar que la clase se sigue
      moviendo, que el contador de conectados no se queda en cero (eso sería la
      presencia bloqueada) y que un alumno puede responder una pregunta.

## Batch 9 — Preguntas del alumno hacia el docente

**Implementado, sin verificar en vivo**, por la misma razón que el batch 8: la
red del contenedor de desarrollo deniega las conexiones a Supabase.

### Cómo quedó

- Canal **aparte**, `taller:{curso}:{sesion}:preguntas`, y asimétrico: los
  alumnos escriben y no leen. La mitad del valor de poder preguntar es que
  nadie más te vea preguntarlo; si el canal fuera de lectura común, cualquiera
  con las herramientas de desarrollador abiertas vería quién preguntó qué.
  Lo corta la política, no el cliente (`supabase/politicas.sql`).
- Botón discreto, siempre a mano en la vista del alumno.
- La pregunta viaja con el ítem y el paso donde se hizo.
- Nombre **opcional**, recordado entre preguntas. Se recupera al abrir el
  formulario y no al montar: además de evitar un efecto que escribe estado, si
  el alumno lo cambia en otra pestaña verá el actual. La pregunta a medio
  escribir NO se guarda — nadie quiere que le reaparezca media frase de hace
  media hora.
- En el docente, un contador discreto en la cabecera y un panel **cerrado por
  omisión**. Esa pantalla se proyecta: que una pregunta aparezca sola delante
  de toda la clase es exactamente lo que hace que la siguiente no se escriba.
- "Atendida" la quita de la lista.

### Qué falta comprobar

1. Con el docente en `/profe/sesion/sesion-1` y un alumno en la ruta pública,
   enviar una pregunta: debe aparecer el contador en la cabecera del docente.
2. Abrir el panel: la pregunta con su autor y el ítem donde se hizo.
3. Desde un **segundo alumno**, comprobar que NO recibe la pregunta del
   primero. Esto solo se cumple con `supabase/politicas.sql` aplicado.
4. "Atendida" la quita.

### Fuera de alcance, y dicho

- Persistencia. Si el docente recarga, las preguntas se pierden: son de la
  clase, no del curso.

---

## Batch 10 — Preguntas del docente hacia los alumnos

**Implementado, sin verificar en vivo** (red del contenedor).

### Los tres estados

1. **Respondiendo** — la pantalla proyectada muestra la pregunta y un número
   grande: `12 / 20`. Cuántos respondieron, **nunca qué respondieron**.
2. **Revelado** — un clic del docente. El botón se enciende cuando ya
   respondieron todos, pero no se pulsa solo: el momento de mostrar el
   resultado es el momento de enseñar.
3. **En vivo** — ya revelado, el recuento sigue subiendo si alguien responde
   tarde.

### El denominador sale de Presence

No hay que declarar el tamaño del grupo: el canal ya sabe cuántos alumnos están
conectados. Si alguien se desconecta a mitad, el denominador baja con él — no
tiene sentido esperar por una pantalla que se fue.

### Decisiones

- **Las respuestas van por su propio tema**, con la misma asimetría que las
  preguntas: los alumnos escriben y no leen. Ver las respuestas de los demás
  antes del revelado cambia las propias.
- **Una respuesta por alumno; la última gana.** Sin esto, quien cambia de
  opinión cuenta dos veces y el recuento proyectado diría más votos que
  personas en la sala. Probado.
- **Omitir es una respuesta, no una ausencia**: cuenta en el total y se reporta
  aparte.
- **La correcta sale del servidor solo en el revelado**, dentro del mensaje que
  publica el docente. La carga del alumno nunca la lleva.

### Qué falta comprobar

1. Llegar a un ítem `pregunta` con el docente y dos alumnos.
2. Responder desde los dos: el docente debe ver `2 / 2` y **ninguna respuesta**.
3. Comprobar en el HTML del alumno que no está la correcta ni el recuento.
4. Pulsar "Mostrar resultados": las barras aparecen en las tres pantallas, con
   la correcta marcada.
5. Un tercer alumno responde tarde: el recuento sube.
6. Cambiar de opinión antes del revelado no debe contar dos veces.

---

## Batch 11 — Segunda pantalla del docente

**Implementado, sin verificar en vivo** (red del contenedor). Lo que quedó
escrito está en [`DONE.md`](DONE.md); acá solo queda lo que hay que probar con
las dos máquinas delante.

### Qué falta comprobar

Con el portátil que proyecta en `/profe/sesion/sesion-1` y el otro en
`/profe/sesion/sesion-1/mando`:

1. Avanzar desde el mando: **las dos pantallas y los alumnos** se mueven.
2. Avanzar desde la pantalla principal: el mando se pone al día.
3. Pulsar dos veces seguidas y rápido en el mando: debe avanzar dos, no
   quedarse en uno. Es el caso que motivó dejar de reemitir la pauta recibida.
4. Abrir el mando con la clase ya empezada: debe aterrizar donde va, con los
   controles habilitados.
5. Abrir el mando **antes** que la pantalla principal: los controles salen
   deshabilitados y aparece "Empezar desde el principio".
6. "Dictando / Ensayando" desde el mando: el interruptor de la pantalla
   principal cambia con él, y no vuelve atrás solo.
7. Un alumno pregunta: aparece en el mando, con panel abierto, y **no** se
   despliega solo en la pantalla proyectada.
8. Lanzar una pregunta al vuelo, con opciones y sin opciones: tapa la lámina en
   todas las pantallas, el recuento sube sin mostrar respuestas, "Mostrar
   resultados" las revela, y "Quitar" la retira de todas.
9. El reloj: comprobar contra la hora real que "queda de sesión" y el desvío
   dicen lo que deben, y que "en este ítem" arranca de cero al moverse.

---

## Batch 12 — Avisos de tiempo

**Implementado y probado contra el contenido real**, pero los umbrales solo se
validan dictando. Lo escrito está en [`DONE.md`](DONE.md).

### Qué falta comprobar

1. Pulsar "Empezamos ahora" al arrancar la clase: el desvío se mide desde ahí,
   y recargar el mando no lo pierde.
2. Que el aviso de receso aparezca cuando toca y no antes. El del sábado cae a
   las 16:40.
3. Que los umbrales —10 min avisa, 20 urge— no resulten ni ansiosos ni tardíos.
   Es lo único de este batch que no se puede decidir sin dictar.
4. Que ninguno de estos avisos se vea nunca en la pantalla proyectada.

---

## Batch 20 — Contenido · S2·U2 `reto` — La arquitectura cognitiva

**Escribe una sola unidad.** No leas el resto del curso: la estructura
del batch 3 ya dice qué va dónde (ver [`CONVENTIONS.md`](CONVENTIONS.md) §13).

**Objetivo de la unidad**
El corazón del taller: cada nodo hace un trabajo y solo uno, y una reflexión que no puede corregir es decorativa.

**Duración** 90 minutos → del orden de 30 ítems.

**Material de origen** — repositorio `texai/taller-ia-uni-lab`
- `retos/README.md` — Reto 4
- `agente/grafo.py` completo
- `agente/memoria.py`
- Las citas reales de reflexión: *estoy dramatizando*, *SÍ hay hallazgo: hay DERIVA*

**Tipos de ítem sugeridos**
- `diagrama-secuencia` en PlantUML recorrible mensaje a mensaje: percepción, herramientas, diagnóstico, reflexión, revisión
- `codigo` con `Estado`, `messages_key` y las aristas condicionales
- `error-comun` con las dos trampas de cableado
- `cita-agente` con la reflexión acusándose de dramatizar
- `comparacion` del diagnóstico antes y después de la revisión
- `criterios` con los cuatro mundos
- `receso` a mitad

**Criterios de aceptación**
- [ ] El diagrama de secuencia se recorre paso a paso, no se proyecta entero
- [ ] Se explica **por qué existe `revision`** con el caso real donde el agente sabía la respuesta y el grafo no lo dejaba decirla
- [ ] Las dos trampas de cableado quedan anticipadas: son mudas y cuestan una hora
- [ ] `objetivos` y `requisitos` de la unidad, escritos
- [ ] Los minutos de los ítems suman los 90 de la unidad
- [ ] Cada ítem que lo amerite lleva sus `notas` privadas para la segunda pantalla
- [ ] `npm run validar-contenido` pasa

**Fuera de alcance**
- Cualquier otra unidad. Un batch que toca dos unidades está mal partido.
- Inventar cifras. Las de este curso están medidas; si falta una, se pide.

---

## Batch 21 — Contenido · S2·U3 `reto` — De la recomendación a la acción

**Escribe una sola unidad.** No leas el resto del curso: la estructura
del batch 3 ya dice qué va dónde (ver [`CONVENTIONS.md`](CONVENTIONS.md) §13).

**Objetivo de la unidad**
Lo que separa a un agente de un informe, y por qué el freno importa más que el botón.

**Duración** 60 minutos → del orden de 20 ítems.

**Material de origen** — repositorio `texai/taller-ia-uni-lab`
- `retos/README.md` — Reto 5
- `agente/accion.py`
- `plataforma/api.py` — `POST /v1/reentrenar`
- La corrida real: 24 modelos de panadería en 1.5s, 24 de lácteos en 1.4s

**Tipos de ítem sugeridos**
- `titulo`: *equivocarse deja de costar una alerta*
- `codigo` con las dos reglas de la política
- `demo` con `make actuar` sobre `sesgo_silencioso` y sobre `feed_caido`
- `comparacion` de los dos resultados
- `error-comun` con el error de frenar por urgencia en vez de por radio de daño
- `imagen` del panel de la interfaz
- `pausa-preguntas`

**Criterios de aceptación**
- [ ] El freno está en código y se explica por qué no en el prompt
- [ ] Se cuenta el error propio: la primera versión frenaba por urgencia, y la urgencia es opinión editorial del agente, no una propiedad de seguridad
- [ ] La trampa del `feed_caido` se demuestra, no se describe
- [ ] `objetivos` y `requisitos` de la unidad, escritos
- [ ] Los minutos de los ítems suman los 60 de la unidad
- [ ] Cada ítem que lo amerite lleva sus `notas` privadas para la segunda pantalla
- [ ] `npm run validar-contenido` pasa

**Fuera de alcance**
- Cualquier otra unidad. Un batch que toca dos unidades está mal partido.
- Inventar cifras. Las de este curso están medidas; si falta una, se pide.

---

## Batch 22 — Contenido · S2·U4 `cierre` — Los errores, y dónde estaban de verdad

**Escribe una sola unidad.** No leas el resto del curso: la estructura
del batch 3 ya dice qué va dónde (ver [`CONVENTIONS.md`](CONVENTIONS.md) §13).

**Objetivo de la unidad**
Que se lleven la tesis: cuando un agente se equivoca, la primera sospecha no debería ser el modelo.

**Duración** 35 minutos → del orden de 12 ítems.

**Material de origen** — repositorio `texai/taller-ia-uni-lab`
- Los nueve errores de diseño del agente, documentados
- Las trece incidencias del laboratorio
- Las citas donde el agente diagnosticó errores nuestros antes que nosotros

**Tipos de ítem sugeridos**
- `tabla` con los nueve errores y dónde vivía cada arreglo
- `cita-agente` con el agente criticando un umbral mal calibrado
- `titulo` de cierre con la tesis
- `enlace` al repositorio del laboratorio
- `transicion` con el mapa completo de las ocho horas
- `pausa-preguntas` final

**Criterios de aceptación**
- [ ] Ninguno de los nueve errores estaba en el modelo de lenguaje
- [ ] Se nombra que varios los encontró el propio agente
- [ ] Cierra con qué se llevan y qué pueden hacer con esto en su trabajo
- [ ] `objetivos` y `requisitos` de la unidad, escritos
- [ ] Los minutos de los ítems suman los 35 de la unidad
- [ ] Cada ítem que lo amerite lleva sus `notas` privadas para la segunda pantalla
- [ ] `npm run validar-contenido` pasa

**Fuera de alcance**
- Cualquier otra unidad. Un batch que toca dos unidades está mal partido.
- Inventar cifras. Las de este curso están medidas; si falta una, se pide.

---

---

## Plantilla de batch

Copiar y completar al agregar un batch nuevo.

```markdown
## Batch N — Título corto y accionable

Una o dos frases con el **problema o necesidad**, no con la solución. Por qué
hace falta.

**Alcance**
- [ ] Cambio concreto 1 (archivo o área afectada)
- [ ] Cambio concreto 2

**Tests esperados**
- [ ] Caso a cubrir

**Fuera de alcance**
- Lo que explícitamente NO se hace en este batch.

**Requisitos externos**
- Variables de entorno, tablas de Supabase, configuración del proyecto,
  dependencias nuevas.
```
