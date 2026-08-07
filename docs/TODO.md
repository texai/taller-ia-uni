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
| 11 | Segunda pantalla del docente | ✅ Completado |
| 12 | Reloj de sesión y avisos de tiempo | ✅ Completado |
| 13 | Diagramas de secuencia PlantUML, recorribles | ✅ Completado |
| 14 | Comandos anotados parte por parte | ✅ Completado |
| | **Contenido — una unidad por iteración** | |
| 15 | S1·U1 `repaso` — Dónde encaja esto, y la flota | ✅ Completado |
| 16 | S1·U2 `reto` — Encontrar el problema a mano | ✅ Completado |
| 17 | S1·U3 `reto` — La herramienta de percepción | ✅ Completado |
| 18 | S1·U4 `reto` — El primer agente, sin arquitectura | ✅ Completado |
| 19 | S2·U1 `repaso` — Qué le faltaba al bucle de ayer | ✅ Completado |
| 20 | S2·U2 `reto` — La arquitectura cognitiva | ✅ Completado |
| 21 | S2·U3 `reto` — De la recomendación a la acción | ✅ Completado |
| 22 | S2·U4 `cierre` — Los errores, y dónde estaban | ✅ Completado |
| | **Segunda ronda — la auditoría del 7 de agosto** | |
| 23 | La solución dentro del ítem de pregunta | ✅ Completado |
| 24 | El caso, como contenedor propio | ✅ Completado |
| 25 | Los comandos, desenvueltos · sesión 1 | ✅ Completado |
| 26 | Los comandos, desenvueltos · sesión 2 | ✅ Completado |
| 27 | El recap de apertura, con diagramas | ✅ Completado |
| 28 | Diagrama de pasos al abrir cada reto | ✅ Completado |
| 29 | El ritmo: preguntas y pausas repartidas | ✅ Completado |
| 30 | La salida anotada | ✅ Completado |

Estados: ⬜ Pendiente · 🔵 En curso · ✅ Completado · ⬛ No usado

**Ruta mínima para dictar el sábado:** batches 1 a 8. Del 9 al 14 mejoran el
dictado pero la clase se puede dar sin ellos.

Los bloques de los batches 8 a 12 siguen más abajo aunque figuren completados:
lo que queda en ellos son las listas de **qué falta comprobar en vivo**, que no
se pueden cerrar desde este contenedor porque su red no llega a Supabase.

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

---

# Segunda ronda — lo que la auditoría del 7 de agosto encontró

El contenido quedó completo respecto de los batches 15 a 22: 131 ítems, 480
minutos, cero marcadores pendientes. Pero una revisión del material contra seis
requisitos del docente encontró que **cinco no estaban** y uno estaba a medias.
Ninguno era un fallo de ejecución de aquellos batches: son cosas que aquellos
batches nunca incluyeron.

El inventario completo, con la hora de reloj a la que cae cada ítem, está en
<https://claude.ai/code/artifact/0c47845c-d7fa-43fd-9700-a5e11202557b>.

| # | Requisito | Estado | La evidencia |
|---|---|---|---|
| 23 | La solución dentro del ítem de pregunta | Hecho | `pregunta` dice cuál es la correcta y no tiene dónde decir por qué |
| 24 | El caso como contenedor propio | Hecho | Es un `markdown` de 3 min, recontado en S2 como otro markdown |
| 25–26 | Los comandos, desenvueltos | Falta | 22 de 26 comandos son `make X` sin abrir; 1 sola salida mostrada, sin anotar |
| 27 | Recap con diagramas al abrir sesión | Falta | Las dos sesiones abren con prosa; el diagrama de componentes de S1 va después del caso |
| 28 | Diagrama de pasos al abrir cada reto | Falta | Retos 1, 2, 3 y 5 sin ningún diagrama |
| 29 | Preguntas y pausas repartidas | A medias | 9 en 8 horas; `s2-reto-4` son 105 minutos con cero |
| 30 | La salida anotada | Falta | `terminal.salida` se dibuja en bloque, sin señalar nada |

**Orden sugerido por costo y por urgencia.** La clase de la sesión 1 es el
sábado 8; la de la sesión 2, el domingo 9. Los batches 23 y 29 son los que más
cambian la clase por lo que cuestan. El bloque 25–26 es un rediseño real de
cómo se enseñan los comandos y no cabe antes del sábado.

**El contenido va antes que la maquinaria.** El hueco que el docente señaló es
de contenido —nadie entiende qué hace `make seed`— y **se cierra entero con
dos `comando-anotado` seguidos**, un tipo que ya existe desde el batch 14: el
comando que se teclea y el que eso ejecuta de verdad. Por eso los batches 25 y
26 escriben ese contenido primero, y el tipo especializado para **anotar una
salida** queda al final, en el batch 30, como una mejora sobre material que ya
estará dictándose. Al revés —maquinaria primero— el riesgo es construir un tipo
para un contenido que todavía no existe.

---

## Batch 24 — El caso, como contenedor propio

Los cinco retos ocurren dentro de un mismo caso: una cadena de retail, 192
modelos, un job de madrugada, una forma de fallar que no suena. Hoy ese marco
es un `markdown` de tres minutos, uno más entre veintiuno, y se vuelve a contar
en la sesión 2 como otro markdown suelto.

**Alcance**
- [x] Tipo `caso` en el catálogo (`CONVENTIONS.md` §8): la empresa, la escala,
      el problema de negocio, y la arquitectura de modelos que ya existe
- [x] Se dibuja como un contenedor, no como una lámina de texto: la clase tiene
      que reconocerlo como "el marco de todo lo que viene"
- [x] Una sola definición del caso, referenciada desde las dos sesiones
- [x] Reemplaza `s1-el-caso` y la parte de caso de `s2-para-quien-no-vino`
- [x] Va **antes** de cualquier reto, después del recap del batch 27

**Decisión tomada**
Ninguna de las dos opciones que estaban planteadas. El caso **no es un atributo
del curso**: hay cursos sin ningún caso y cursos con varios, y un campo
`Curso.caso` obliga a los primeros a declararlo vacío y no tiene dónde poner el
segundo de los segundos. El caso es **contenido**, igual que un reto o un
repaso — y por tanto es un `tipo` de unidad y un `tipo` de ítem, no una
propiedad de la jerarquía.

El texto vive en `contenido/casos/retail-192.yml` y las dos sesiones lo
referencian con `archivo:`. Escrito dos veces serían dos casos que se separan
en cuanto alguien corrige uno.

**Fuera de alcance**
- Cambiar el contenido del caso. El texto de `s1-el-caso` está escrito y
  medido; esto es darle el sitio que le corresponde.

---

## Batch 25 — Los comandos, desenvueltos · sesión 1

**Es el hueco más grande del curso y el que más lejos está del objetivo del
docente**: que el alumno entienda cada parámetro y sepa leer cada salida, en
vez de teclear `make X` y mirar pasar el texto.

Hoy, de 26 comandos, 22 son `make X` sin abrir. Lo que `make` esconde:

    make seed     → docker compose run --rm plataforma python -m plataforma seed
                    → datos, entrenar, pronosticar, metricas (cuatro etapas)
    make romper   → escenario --nombre X, después pronosticar, después metricas
    make agente   → docker compose run --rm agente python -m agente run
    make actuar   → lo mismo, más -e EJECUTAR_ACCIONES=1
    make ui       → docker compose up -d ui        (¡distinto de run --rm!)
    make reset    → docker compose down -v         (borra los volúmenes)

**No hace falta ningún tipo nuevo.** Para explicar lo que `make` envuelve bastan
**dos `comando-anotado` seguidos**: el que se teclea y el que eso ejecuta de
verdad. Cada uno con sus segmentos, y el recorrido por pasos que ya funciona
desde el batch 14. Un tipo que represente "capas" sería maquinaria nueva para
algo que la composición de ítems ya resuelve.

**Alcance**
- [x] `make arriba` y `make seed`, abiertos hasta el fondo, incluido qué
      construye y por qué tarda
- [x] La salida de `make seed` mostrada y leída: qué son 17,472 días-modelo y
      de dónde salen los 192
- [x] `make romper` y `make reparar`, con las tres etapas que encadenan
- [x] `make ui` contra `make agente`: por qué uno es `up -d` y el otro
      `run --rm`, y qué significa eso para el estado
- [x] `make verificar`, y cómo se lee su salida
- [x] Cada parámetro que aparece —`--rm`, `-v`, `-e`, `-d`— explicado la primera
      vez que se ve, y no dos veces

**Cómo se muestran las salidas, por ahora**
Con `terminal`, que ya tiene campo `salida`, y con la lectura en el ítem de al
lado. Anotar la salida por segmentos es el batch 30, y llega después: el
contenido no puede esperar a la maquinaria, y una salida bien leída en voz alta
enseña casi lo mismo que una anotada.

**Fuera de alcance**
- La sesión 2. Es el batch 26.
- Anotar salidas por segmentos. Es el batch 30.

---

## Batch 26 — Los comandos, desenvueltos · sesión 2

Mismo criterio que el batch 25, sobre los comandos del domingo.

**Alcance**
- [x] `make agente ARGS="--verboso"` abierto, y cómo se lee una corrida verbosa:
      qué línea es una llamada a herramienta, cuál es un veredicto de reflexión,
      cuál es el paso por la política
- [x] `make actuar` contra `make agente`: dónde entra `-e EJECUTAR_ACCIONES=1`
      y qué cambia en la salida
- [x] La salida de un reentrenamiento, leída: qué modelos tocó, cuánto tardó,
      qué quedó en la bitácora
- [x] `make memoria`, que hoy no aparece en el curso y es la única forma de ver
      lo que el agente recuerda

**Fuera de alcance**
- La sesión 1. Es el batch 25.

---

## Batch 27 — El recap de apertura, con diagramas

Las dos sesiones abren con un ítem `transicion`, que es prosa: dos frases de
«lo que vimos» y «lo que viene». El docente quiere abrir con **diagramas
generales** —arquitectura, componentes— que permitan repasar sin entrar en
detalle.

**Alcance**
- [x] Un bloque de recap al abrir cada sesión, después de la asistencia y
      **antes del caso**
- [x] Diagramas de conjunto, no de detalle: se miran y se pasan
- [x] En la sesión 1, el recap es del programa: qué módulos trae la clase
      encima y dónde encaja este taller
- [x] En la sesión 2, el recap es de lo construido el sábado
- [x] El diagrama de componentes que hoy abre `s1-flota` se reconsidera: **se
      queda donde está**. No es un repaso del programa sino la planta de la
      plataforma, y hace falta para leer la telemetría que viene justo después

**Dónde entra, ahora que el caso es una unidad.** El batch 24 dejó las dos
sesiones abriendo con `s1-apertura` / `s2-apertura`, unidades cortas de
asistencia y portada, seguidas de la unidad `caso`. El recap va dentro de esas
unidades de apertura, que existen justamente para eso.

**Excepción a la §13, deliberada.** Este batch toca dos unidades. La §13 protege
contra la degradación de contexto al escribir **prosa**; un par de diagramas que
tienen que compartir lenguaje visual es el caso contrario — partirlos en dos
conversaciones produce dos dibujos distintos.

**Fuera de alcance**
- Los diagramas de pasos de cada reto. Es el batch 28.

---

## Batch 28 — Diagrama de pasos al abrir cada reto

Cuatro de los cinco retos empiezan sin ningún mapa de lo que se va a hacer. El
único diagrama de un reto es el de secuencia del agente corriendo, que explica
el resultado y no el recorrido.

**Alcance**
- [x] Un diagrama al abrir cada uno de los cinco retos, con los pasos que el
      alumno va a recorrer
- [x] Es un mapa del trabajo, no de la solución: dice qué se va a hacer, no cómo
- [x] Los cinco comparten lenguaje visual, para que se reconozcan entre sí
- [x] Se ubica después del `titulo` del reto y antes de cualquier comando

**Excepción a la §13, deliberada.** Toca los cinco retos, por lo mismo que el
batch 27: cinco diagramas dibujados en cinco conversaciones son cinco dibujos
distintos.

**Fuera de alcance**
- Reescribir el contenido de los retos. Solo se agrega el mapa de entrada.

---

## Batch 29 — El ritmo: preguntas y pausas repartidas

Hay nueve momentos de interacción en ocho horas, uno cada 53 minutos, y el
agujero está donde más duele: **`s2-reto-4` son 105 minutos y 25 ítems con cero
preguntas y cero pausas.**

**Alcance**
- [x] Repartir preguntas y pausas por las unidades, con un criterio escrito y no
      a ojo
- [x] Ninguna unidad de más de 40 minutos sin al menos dos momentos
- [x] Cada pregunta nueva llega con su solución (batch 23)
- [x] Las preguntas se ponen donde hay algo que **decidir o predecir**, no como
      control de lectura
- [x] Los minutos siguen sumando lo que cada unidad tiene reservado: lo que
      entra, saca a algo

**Excepción a la §13, deliberada.** Es un reparto global del ritmo. Decidirlo
unidad por unidad es exactamente lo que produjo el desbalance actual.

**Tests esperados**
- [x] Una comprobación en `validar-contenido` que avise si una unidad larga se
      queda sin interacción

**Fuera de alcance**
- Cambiar las preguntas que ya existen, salvo para darles su solución.

---

## Batch 30 — La salida anotada

**Va al final a propósito.** Es el único tipo nuevo que pedía el bloque de los
comandos, y llega cuando los batches 25 y 26 ya escribieron el contenido: así
se diseña contra salidas reales que están en el material, y no contra las que
uno imagina que hará falta anotar.

Hoy `terminal` tiene un campo `salida` que se dibuja en bloque, sin señalar
nada. Un comando sí se puede anotar por segmentos desde el batch 14; su salida,
que es la mitad de lo que hay que enseñar a leer, no.

**Alcance**
- [x] Una salida se puede anotar por segmentos, igual que un comando: señalar
      un trozo de lo que imprime y explicar qué significa
- [x] Se apoya en los `pasos` del batch 6 y reutiliza la maquinaria de
      `anotaciones.ts`, que ya sabe ubicar y trocear por texto
- [x] Un segmento de salida que no aparece en la salida falla en validación,
      igual que uno de comando
- [x] Las salidas que los batches 25 y 26 dejaron en `terminal` se migran: la de
      `make seed`, la de una corrida verbosa del agente, la de `make verificar`

**Decisión tomada: tipo propio.** El material de los batches 25 y 26 la
decidió, aunque no por donde se esperaba. Cuatro de las cinco salidas sí
quedaron pegadas a su comando —lo que apuntaba a hacer crecer
`comando-anotado`— pero lo que zanjó el asunto fue el alto: la corrida verbosa
del agente son cuarenta líneas y **hubo que partirla en dos láminas**. Un tipo
que obligara a llevar el comando encima habría producido un ítem que no cabe en
la pantalla. Y `make memoria` imprime algo que vale por sí solo.

El `comando` queda como campo opcional, dibujado arriba en pequeño: contexto,
no protagonista. El dibujo sí se comparte — `BloqueAnotado`, un solo
componente para los dos.

**Tests esperados**
- [x] Una anotación que no aparece en la salida falla nombrándola
- [x] Una anotación ambigua —aparece dos veces— falla como ambigua
- [x] El número de pasos incluye los segmentos de la salida

**Fuera de alcance**
- Un tipo para las capas de un comando. Se resuelve con dos ítems seguidos.

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
