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
| | **Tercera ronda — la auditoría del inventario** | |
| 31 | Los minutos son del docente · la portada cliqueable | ✅ Completado |
| 32 | Los cuatro huecos: interfaz, capturas, job, quiebre | ✅ Completado |
| 33 | Presentación, ficha del docente, un archivo por unidad | ✅ Completado |
| 34 | El glosario | ✅ Completado |
| 35 | El vocabulario, y un SQL idempotente | ✅ Completado |
| 36 | Las tres herramientas que faltaban | ✅ Completado |
| | **Cuarta ronda — el hilo narrativo** | |
| 37 | La ventana de lectura, y el taller que es de verdad | ✅ Completado |
| 38 | Las salidas que faltan · retos 1 y 3 | 🔵 Reto 1 hecho; el 3 espera una llave |
| 39 | El caso, anclado a algo ejecutable | ✅ Completado |
| 40 | La cadena de comandos, visible | ✅ Completado |
| 41 | El repositorio, a un clic | ✅ Completado |
| 42 | Los conceptos que se usan sin nombrarse | ✅ Completado |
| 43 | Las seis guías, descargables desde la clase | ✅ Completado |
| | **Quinta ronda — cerrar el hilo conductor** | |
| 44 | Lo que no cuadra | ⬜ Pendiente |
| 45 | El caso, recorrido y no contado | ⬜ Pendiente |
| 46 | Con qué se fabrica un modelo | ⬜ Pendiente |
| 47 | Ninguna palabra se usa antes de abrirse | ⬜ Pendiente |
| 48 | Cada reto cierra su círculo | ⬜ Pendiente |
| 49 | La pauta de comandos del docente | ⬜ Pendiente |

Estados: ⬜ Pendiente · 🔵 En curso · ✅ Completado · ⬛ No usado

**La quinta ronda (44 a 49) sale de la auditoría del 7 de agosto por la
noche**, y tiene un solo objetivo: que el recorrido no deje ni un concepto sin
abrir ni un comando sin enseñar. El orden importa — 44 son correcciones
baratas, 45 a 48 son contenido (**uno por conversación**, §13), y 49 se hace al
final porque necesita que los comandos ya estén todos escritos.

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
| ~~Qué se recorta si el reloj aprieta~~ | ~~Batches 44–48~~ | ✅ **Resuelto: no se recorta nada.** La sesión 1 va en 320 min sobre 240 y la 2 en 268, y la quinta ronda suma unos 45 más. Decisión del docente: prefiere dictar una o dos horas de más antes que quedarse sin material, y omitir o acelerar secciones **en vivo**, según cómo vaya la sala. Por eso tampoco entra un campo `opcional` en el catálogo: la decisión de saltarse algo depende del día y no se puede escribir de antemano |

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

## Batch 37 — La ventana de lectura, y el taller que es de verdad

El contenido dice «escribe la herramienta» y «manos al teclado», y el
laboratorio trae `comparar_periodos` y el grafo ya escritos en `main`. El alumno
abre el archivo y encuentra la respuesta. Además el material promete seis veces
unas ramas `reto-N-solucion` que **no existen** — una de ellas abriendo el
domingo a las 09:00.

No va a haber tiempo en clase para depurar código de nadie. Lo que sí tiene que
haber son ventanas para leer, entender y ejecutar, con los archivos y comandos
dichos por su nombre y un tiempo propuesto que el docente pueda mover en vivo.

**Alcance**
- [ ] Tipo `lectura`: archivos del laboratorio a abrir, comandos a ejecutar,
      qué mirar, y una cuenta regresiva con el tiempo propuesto
- [ ] La cuenta se puede ajustar durante la clase sin salir de la lámina —
      más tiempo, menos, pausar, reiniciar
- [ ] Cada archivo listado lleva su enlace a GitHub y una línea de por qué
- [ ] Los cinco retos dejan de prometer teclado: se lee, se ejecuta, se
      comprueba con el verificador
- [ ] Ninguna mención a `reto-N-solucion` sobrevive en el contenido ni en
      `retos/README.md` del laboratorio

**Tests esperados**
- [ ] Un `lectura` sin archivos ni comandos falla en validación: no es una lámina
- [ ] Un archivo que no existe en el laboratorio falla nombrándolo
- [ ] El número de pasos de un `lectura` es 1 — la lámina no se recorre
- [ ] `pasosDe` y el barrido de humo lo conocen

**Fuera de alcance**
- Sincronizar la cuenta entre las pantallas de los alumnos. Cada pantalla
  cuenta desde que llegó, igual que el `receso` de hoy. Sincronizarla es un
  mensaje más por el canal de la pauta y se decide después de verlo en clase.
- Vaciar el cuerpo de las funciones del laboratorio. Decidido: todo en `main`.

---

## Batch 38 — Las salidas que faltan · retos 1 y 3

Los dos retos donde el hilo se corta, y se corta por lo mismo: se afirma un
resultado y no se enseña.

En el reto 1, `s1-r1-a-mano` y `s1-r1-a-mano-2` son ocho minutos de clase cuyos
pasos son dos comentarios —`# agrupar por categoría`— sin pandas y sin salida.
En el reto 3 se corre el agente tres veces para demostrar que diverge, no se
muestra ninguna de las tres, y el respaldo remite a «las salidas guardadas del
ítem siguiente», que no existen. Las dos únicas evidencias del cierre del
sábado son citas que —lo dicen sus propias notas— salen del agente del domingo.

**Alcance**
- [ ] El groupby de pandas del reto 1, escrito, y su salida real anotada
- [ ] Lo mismo para el segundo escenario, donde el mismo código no encuentra nada
- [ ] Las tres ejecuciones del reto 3, recortadas a lo que diverge, lado a lado
- [ ] El respaldo de cada demo apunta a algo que existe

**Tests esperados**
- [ ] Ninguna demo del curso tiene todos sus pasos en comentario
- [ ] Las salidas nuevas pasan la validación de anotaciones (ni ausentes ni ambiguas)

**Fuera de alcance**
- Grabar las tres ejecuciones en vivo durante la clase. Van medidas de antemano.

**Requisitos externos**
- Una llave de LLM para producir las tres ejecuciones reales del reto 3.

**Lo que quedó pendiente, y por qué.** Todo el reto 1 está hecho y medido. Las
tres ejecuciones del reto 3 **no**: hacen falta tres diagnósticos reales y
divergentes, y con `PROVEEDOR_LLM=mock` el proveedor simulado no razona — las
tres saldrían idénticas, que es exactamente lo contrario de lo que la lámina
tiene que demostrar. Inventarlas sería escribir un razonamiento de agente que
nadie produjo, y es la única cosa que este material no hace. Se destraba con
una llave y quince minutos.

---

## Batch 39 — El caso, anclado a algo ejecutable

El caso son cuatro bloques de prosa y tres cifras redondas. No nombra un solo
archivo, comando ni número medido — y el estado inicial existe y es medible:
192 modelos entrenados hasta el 8 de mayo, MAPE de validación 10.4%, 17,472
días-modelo, MAPE de producción 13.8%, sesgo +0.8%. Hoy el caso y el
laboratorio son dos cosas que no se tocan.

**Alcance**
- [ ] El estado inicial del caso, medido, con el comando que lo produce
- [ ] Qué archivo es cada pieza del caso: `ventas.csv` es el mundo,
      `modelos/` son los 192, `metricas.csv` es lo que mira el agente
- [ ] La misma ancla vale para el domingo, desde el mismo archivo

**Tests esperados**
- [ ] Las cifras del caso y las de la telemetría no se contradicen

**Fuera de alcance**
- Convertir el caso en un reto. Sigue siendo el marco.

---

## Batch 40 — La cadena de comandos, visible

El material desestructura `make` → `docker compose` → `python -m plataforma X`
y se detiene ahí. Nunca se ve qué hace `escenario` por dentro, ni la cadena
completa que produce el mundo sano, lo rompe y lo repara. Que `romper` y
`reparar` sean la misma receta con la primera línea cambiada está dicho en una
nota del docente y nunca en pantalla.

**Alcance**
- [ ] La cadena entera en una lámina: `seed` = datos → entrenar → pronosticar →
      metricas; `romper` y `reparar` como la misma receta, y la línea que las
      separa
- [ ] Por qué ninguna de las dos reentrena, que es lo que hace que los 192
      modelos sean los mismos toda la tarde
- [ ] El snippet de `escenario.py` donde `feed_caido` **borra filas** en vez de
      escribir ceros — doce líneas que sostienen la distinción anomalía/deriva
      del reto 4
- [ ] El comentario calibrado de `CAIDA_SESGO_SILENCIOSO`: por qué 0.18 era
      demasiado y dejaba de ser silencioso

**Fuera de alcance**
- Explicar `datos.py` entero. Solo lo que ilustra la intención.

---

## Batch 41 — El repositorio, a un clic

En 174 ítems hay dos enlaces al laboratorio, los dos en los últimos minutos del
domingo. Los doce bloques de código que citan `ruta:` la muestran como texto
muerto: el alumno ve `agente/accion.py` y no tiene cómo llegar.

**Alcance**
- [ ] `ruta:` se dibuja como enlace al archivo en GitHub, en la línea exacta
      cuando se sabe
- [ ] La base del repositorio se configura una vez, no se repite en cada ítem
- [ ] Un tipo `diff` para enseñar un cambio como cambio: el antes y el después
      de una edición, que es como se lee un arreglo de verdad
- [ ] El `diff` se estrena con la trampa que más cuesta del reto 4:
      `messages_key="mensajes"`

**Tests esperados**
- [ ] Una `ruta:` que no existe en el laboratorio falla en validación
- [ ] El `diff` cuenta sus pasos como el resto de los ítems recorribles

**Fuera de alcance**
- Traer el código del repositorio en tiempo de construcción. Se copia y se
  enlaza, como hasta ahora.

---

## Batch 42 — Los conceptos que se usan sin nombrarse

Cada reto usa estadística y modelado que el material da por sabidos. Se nombra
«regresión Ridge» y se pasa; las features se listan y nunca se ven; la
cobertura se explica tres veces sin mostrar de dónde sale el intervalo, que es
un `p ± 1.96σ` de doce caracteres en `pronosticar.py`.

**Alcance**
- [ ] Qué es Ridge y por qué regularizar, en el reto donde importa
- [ ] Las features reales del modelo, desde `plataforma/modelo.py`
- [ ] De dónde sale el intervalo de predicción, y por eso qué mide la cobertura
- [ ] El corte de entrenamiento y validación, que es lo que hace comparable el
      10.4% con el 13.8%
- [ ] Cada reto declara qué concepto introduce, en sus objetivos

**Fuera de alcance**
- Un módulo de estadística. Cada concepto entra pegado al reto que lo usa.

---

# Quinta ronda — cerrar el hilo conductor

Salen de la auditoría completa del contenido del 7 de agosto por la noche, y
persiguen una sola cosa: **que el recorrido no deje ni un concepto sin abrir ni
un comando sin enseñar.** El taller se dicta bien; lo que falla son costuras
concretas, y están todas enumeradas.

El orden no es negociable. El 44 son correcciones de dato y cuesta minutos; del
45 al 48 son contenido y van **uno por conversación** (§13); el 49 se hace al
final porque necesita que todos los comandos estén ya escritos.

---

## Batch 44 — Lo que no cuadra

Tres cosas que el material dice mal. Ninguna es de criterio: son datos que se
contradicen entre láminas, un archivo mal citado y unas horas corridas. Van
juntas porque las tres se arreglan mirando la fuente, no discutiendo.

**Alcance**
- [ ] **El ancla se contradice.** `s1-caso-estado` mide `sesgo_pct: 0.801` y
      `modelos_con_mape_sobre_25: 8`; `s1-r1-tabla` dice **+0.7%** y **7 / 192**
      para el mismo mundo sano. Son dos de los cuatro números que la sala anota
      en el minuto diez. Arreglar **midiendo**, no eligiendo: correr `datos`,
      `pronosticar` y `metricas` y poner lo que salga.
- [ ] Esa misma cifra vive también en `plataforma/escenario.py` del
      laboratorio, en el comentario de `CAIDA_SESGO_SILENCIOSO`, y de ahí la
      cita `s1-r2-calibrado` **literalmente** (§8: un fragmento numerado es
      literal). Así que el arreglo **toca los dos repositorios**, y el del
      laboratorio va primero — si no, `npm run numerar` deja el fragmento sin
      números y la validación lo canta.
- [ ] El propio comentario del laboratorio ya avisa de que el conteo de modelos
      se mueve entre ejecuciones y dice `8 → 16`. La fila de `s1-r1-tabla` debe
      quedar consistente con eso, y su nota decir que lo que se sostiene es que
      se duplican.
- [ ] **Un archivo mal citado, en el peor sitio.** `s2-apertura` dice en notas
      que el bucle de ayer está en `agente/__main__.py`. Está en
      `agente/plano.py`; `__main__.py` solo registra el subcomando. Es la frase
      dirigida a quien no vino el sábado, sobre el único archivo que se le pide
      abrir.
- [ ] **Las cabeceras de hora.** `s02-u02` marca 09:06 y `s02-u03` marca 09:05,
      en ese orden; `s02-u05` y `s02-u06` no tienen ninguna. Recalcularlas
      todas contra los minutos reales de cada unidad, y dejar dicho en el
      comentario que son orientativas —el reloj real lo dibuja la aplicación—
      para que nadie las vuelva a tratar como contrato.

**Tests esperados**
- [ ] `npm run numerar` sigue dando 19 numerados · 0 sin numerar después de
      tocar el laboratorio
- [ ] `validar-contenido` limpio

**Fuera de alcance**
- Volver a medir todas las cifras del curso. Solo las que se contradicen.

**Requisitos externos**
- El laboratorio corriendo en local para medir: `RUTA_DATOS=<dir> PYTHONPATH=.
  python3 -m plataforma seed` y después `metricas`.

---

## Batch 45 — El caso, recorrido y no contado

El caso se cuenta muy bien y **no se recorre**. La sala oye «24 tiendas en
cinco regiones» y no ve nunca la lista; oye «`ventas.csv` es el mundo, 76,800
filas» y no ve nunca una fila; oye «192 artefactos en disco» y no ve ninguno.
De los cinco archivos de `/datos` que `s1-caso-estado` enumera, el curso solo
abre `metricas.csv`.

Y hay una consecuencia narrativa concreta, que es la razón de fondo de este
batch: el **cierre del reto 5** —el mejor momento del domingo— dice que la
política tiene un agujero porque *«la telemetría no tiene la señal de si hubo
stock»*. Esa señal **existe**: `ventas.csv` trae una columna `quiebre_stock`
que se pierde por el camino. Enseñar la fila cruda el sábado convierte ese
cierre de limitación abstracta en decisión de instrumentación, que es lo que
de verdad es.

**Alcance**
- [ ] **`plataforma/config.py`, el caso escrito en código** — ítem `codigo` en
      S1·U2, después de `s1-el-caso` y antes de `s1-caso-estado`: las 24
      tiendas con su región y su factor de tamaño, y las 8 categorías con su
      demanda base y su amplitud estacional. Es el archivo que convierte «una
      cadena de retail» en esta cadena.
- [ ] Con eso se paga otra deuda: **16 de las 24 tiendas no se nombran jamás**
      en el curso, y las 8 que sí aparecen lo hacen **dentro de una salida**,
      sin presentación — la primera vez que la sala lee «arequipa» es como un
      `modelo_id` en un JSON. Las categorías y las regiones sí están
      enumeradas; las tiendas, no.
- [ ] **Una fila de `ventas.csv`**, en S1·U3, cerca de `s1-telemetria`: ítem
      `salida-anotada` con la cabecera y dos o tres filas de verdad, anotando
      `unidades` contra `unidades_demandadas` —que no son lo mismo, y ahí está
      el quiebre— y **`quiebre_stock`**, sembrado explícitamente hacia el reto 5.
- [ ] **El artefacto, en disco** — `ls -la /datos/modelos | head` dentro de
      `s1-caso-estado` o en un ítem propio: que se vea un `.joblib` con su
      tamaño. La palabra «artefacto» se usa todo el taller y no tiene imagen.
- [ ] Revisar que el sembrado del reto 5 (`s2-r5-quiebre-politica`) **cite de
      vuelta** la columna: hoy dice «una señal que la telemetría no tiene», y
      tras este batch tiene que decir dónde sí está y dónde se pierde.

**Tests esperados**
- [ ] `npm run numerar` numera el fragmento de `config.py` contra el
      laboratorio
- [ ] `validar-contenido` limpio y `npm run humo` sin errores

**Fuera de alcance**
- Enseñar `plataforma/datos.py` entero. Cómo se **inventa** el mundo no es del
  taller; qué **forma** tiene, sí.
- Tocar el laboratorio. Este batch solo lee de él.

---

## Batch 46 — Con qué se fabrica un modelo

Pregunta literal del docente: *«no he visto en qué momento se usan las
herramientas específicas que generan los modelos; ¿cómo se generan, con Python
o con otra herramienta?»*. La respuesta es que se generan con **Python y
scikit-learn**, y el curso no lo dice en ninguna parte.

Contado sobre los 199 ítems: **scikit-learn, joblib, LangChain, numpy, scipy,
FastAPI y pydantic tienen cero menciones**; `pandas` una; `uvicorn` una, dentro
de la causa de un error; `Ridge` una, sin decir de qué librería sale. Alguien
que termine las ocho horas no puede decir con qué se entrenó el modelo que
estuvo vigilando.

Y hay una promesa hecha dos veces y nunca pagada: **MLflow**. `s1-recap` dice
en notas *«el registro de modelos que van a ver hoy es MLflow»* y
`s1-arquitectura` lo dibuja como arista punteada. En el laboratorio es real
—`make mlflow` levanta la interfaz en `:5000` y cada uno de los 192
entrenamientos registra parámetros y `mape_validacion`— y la clase no lo ve.
De ahí cuelga además el `mape_validacion_medio: 10.382` de `s1-inventario`, que
la lámina explica que *«sale del registro de los modelos»*: la mitad izquierda
de la comparación 10.4 → 13.8, que es el argumento de la primera hora, no tiene
dónde mirarse.

**Alcance**
- [ ] **La cadena, nombrada**: `pandas` construye las features →
      `sklearn.linear_model.Ridge` entrena → `joblib.dump` deja el `.joblib` →
      `mlflow.log_params/log_metric` lo registra. Va como ampliación de
      `s1-features` / `s1-validacion`, que ya están en el sitio correcto — **no
      como lámina nueva de inventario de librerías**.
- [ ] **`make entrenar`, solo y con su salida.** Hoy solo corre dentro de
      `seed`, donde es la barra de progreso `2/4`. Es el único paso lento del
      laboratorio y el único que **cambia un artefacto**, y la clase nunca lo
      ve aislado. Ítem `comando-anotado` + `salida-anotada`.
- [ ] **La persistencia**: `joblib.dump(modelo, ruta)` y el bump de `version`
      en el registro. Dos líneas de `plataforma/entrenar.py`, y son las que
      hacen que «artefacto» deje de ser una abstracción.
- [ ] **El job cargando los 192.** `s1-intervalo` muestra de
      `plataforma/pronosticar.py` la sigma y el intervalo, pero no el bucle que
      abre los `.joblib` y predice. El «job batch de madrugada» del caso no
      tiene código en pantalla.
- [ ] **MLflow en pantalla**: `make mlflow`, `:5000`, y una captura de
      respaldo bajo `public/contenido/img/`. Va en S1·U3, después de
      `s1-validacion`, que es donde nace el 10.4%. Paga la promesa de
      `s1-recap` y cierra `s1-inventario`.
- [ ] **`docker-compose.yml`**, aunque sea un fragmento: dos comandos anotados
      explican «los servicios declarados ahí» y el mecanismo de `profiles` que
      esconde `mlflow` y `ollama`, y el archivo no se abre nunca.
- [ ] Añadir a la tabla `s1-make` las filas que faltan: `make entrenar`,
      `make mlflow` y `make ollama`.

**Tests esperados**
- [ ] `validar-contenido` con las rutas nuevas comprobadas contra el
      laboratorio, y `npm run numerar` cuadrando
- [ ] La captura de MLflow existe en `public/contenido/img/` y `npm run humo`
      la abre sin error

**Fuera de alcance**
- Enseñar a usar MLflow. Se abre, se mira un run, se dice que es el mismo del
  Módulo 2, y se sigue.
- Un ítem por librería. Las herramientas se nombran **donde se usan**, no en
  una lista.

**Requisitos externos**
- Correr `make mlflow` en el laboratorio para capturar la pantalla. Son unos
  minutos y hay que tener el `seed` hecho, porque sin runs la interfaz sale
  vacía.

---

## Batch 47 — Ninguna palabra se usa antes de abrirse

El glosario tiene **39 términos** y está bien escrito, pero solo hay **tres**
láminas de tipo `glosario` y cubren **13**. Los otros 26 existen únicamente en
el panel flotante: están a mano si alguien lo abre, y nadie lo abre en mitad de
una explicación.

El agujero más caro es el del **reto 2**, que proyecta `p < 0.01` sin que nadie
haya dicho en voz alta qué es un p-valor: `p-valor`, `Kolmogorov-Smirnov`,
`significativo y relevante`, `ventana y línea base` y `percentil` —el
vocabulario entero de esa unidad— no aparecen en ninguna lámina. Y hay dos
palabras que el material **declara como concepto propio y no define nunca**:
`ReAct`, que es un objetivo del reto 3 y sale en su diagrama de pasos, y
`arquitectura cognitiva`, que es el título de la sesión 2 completa.

La regla que sale de acá, y que es lo que de verdad entrega este batch:
**ninguna palabra del glosario se usa en pantalla antes de haberse abierto en
pantalla.** El panel flotante es el respaldo, no el primer contacto.

### El tipo de ítem

`glosario` ya existe y **no hace falta uno nuevo**: inventar un segundo tipo
para lo mismo es exactamente lo que §8 evita. Lo que sí le falta es distinguir
sus dos usos, porque no son el mismo ítem:

- **De apertura** — «estas cuatro palabras se van a usar en lo que viene».
- **De referencia** — las tres señales juntas, para compararlas.

Se resuelve con **un campo opcional `nuevos`**: cuáles de los términos
listados se abren por primera vez acá, y cuáles son recordatorio. La lámina los
dibuja distinto y el docente sabe en cuáles detenerse.

- [ ] `ItemGlosario.nuevos?: string[]`, validado contra `terminos` del propio
      ítem — un `nuevos` que nombre algo que no está en la lámina es un error.
- [ ] **Un término solo puede declararse `nuevo` una vez en todo el curso.**
      Esta es la regla que paga el campo: dos láminas presentando «deriva» como
      novedad son dos explicaciones que se separan, que es justo lo que el
      glosario existe para impedir. Falla en validación nombrando las dos.
- [ ] Fila en `CONVENTIONS.md` §8 y sección propia: **§18 · El vocabulario se
      abre antes de usarse**.

### Dónde va cada lámina

| Unidad | Ítem | Términos | Nuevos |
|---|---|---|---|
| S1·U2 caso | `s1-glosario-caso` | flota, el mundo, artefacto, job batch | los 4 |
| S1·U3 (existe) | `s1-glosario-docker` | + **servicio**, que falta | servicio |
| S1·U3 tras `s1-seed-salida` | `s1-glosario-pipeline` | pipeline, telemetría, días-modelo, percentil | los 4 |
| S1·U3 (existe) | `s1-glosario-senales` | — | MAPE, sesgo, cobertura |
| S1·U4 tras `s1-r1-encargo` | `s1-glosario-escenarios` | escenario, deriva, anomalía, el mundo | los 3 primeros |
| S1·U5 tras `s1-r2-tres-reglas` | `s1-glosario-estadistica` | ventana y línea base, Kolmogorov-Smirnov, p-valor, significativo y relevante | los 4 |
| S1·U6 antes de `s1-r3-bucle` | `s1-glosario-react` | LLM, herramienta, ReAct | LLM, ReAct |
| S2·U3 (existe) | `s2-glosario-agente` | + **arquitectura cognitiva** | arquitectura cognitiva |
| S2·U4 antes de `s2-r4-diagnostico` | `s2-glosario-diagnostico` | alcance, severidad y urgencia, deriva, anomalía | los 2 primeros |
| S2·U5 tras `s2-r5-riesgo` | `s2-glosario-accion` | política, radio de daño | los 2 |
| S1·U3, con el batch 46 | `s1-glosario-herramientas` | MLflow, LangGraph, Streamlit | los 3 |

13 ya cubiertos + 26 nuevos = **39**. La cobertura queda completa, y eso es
comprobable.

**Alcance, además de las láminas**
- [ ] `s1-reto-1` declara en sus objetivos *«por qué el sesgo no se promedia»*
      y no lo enseña: en toda la unidad eso es un `resaltar` sobre dos líneas
      del groupby y una nota privada. Se enseña de verdad en el reto 2, trampa
      1. **Baja el objetivo del reto 1** y se queda donde se cumple.

**Tests esperados**
- [ ] Todo término de `glosario.yml` aparece en al menos una lámina `glosario`.
      Es el criterio de aceptación del batch y tiene que ser una prueba, no una
      revisión a ojo
- [ ] Un término declarado `nuevo` en dos láminas falla nombrando las dos
- [ ] Un `nuevos` que no esté en `terminos` falla
- [ ] `ESPECIFICACION` sigue cubriendo todos los tipos

**Fuera de alcance**
- Reescribir las definiciones del glosario. Están bien; lo que falta es
  proyectarlas.
- Una lámina por término. Van agrupadas por unidad, tres o cuatro cada una.

---

## Batch 48 — Cada reto cierra su círculo

La cadena que sostiene el taller es **reto → intención → concepto → comando →
código → comprobación**, y dos de los cinco retos no llegan al final.

**El reto 1 es el único sin criterios de aceptación** y el único que no corre
el verificador, aunque `--reto 1` existe en el laboratorio y comprueba justo lo
que hace falta antes de un ejercicio de 40 minutos: 192 modelos vivos y
telemetría suficiente. Con la mano alzada del trabajo previo como único filtro,
alguien va a pasar el reto entero mirando un mundo a medio poblar y creyendo
que el problema es suyo.

**El reto 3 tampoco corre `--reto 3`**, que es literalmente la comprobación
«¿mi llave responde y sabe llamar herramientas?». Es la que evita descubrir a
las 18:10 que media sala no puede ejecutar la demo — y esa demo es el final del
sábado.

**Alcance**
- [ ] `criterios` para el reto 1, en su sitio: después de `s1-r1-encargo`. No
      son criterios de código —no se escribe ninguno— sino de lectura: los tres
      cortes que hay que haber mirado y la pregunta que hay que poder
      contestar.
- [ ] `make verificar ARGS="--reto 1"` como ítem, al abrir el reto, con su
      salida real anotada. Es el «¿estoy en condiciones de empezar?».
- [ ] Lo mismo para el reto 3 con `--reto 3`, antes de `s1-r3-lectura`.
- [ ] **La lámina de rescate de la llave.** El reto 3 depende de una llave de
      LLM y hoy la única salida para quien llega sin ella está en notas
      privadas. Un `error-comun` con los tres caminos: proveedor gratuito
      (Google AI Studio, Groq), `PROVEEDOR_LLM=mock`, o mirar la pantalla del
      de al lado. El prework ya lo explica; lo que falta es en clase.
- [ ] Revisar que los cinco retos declaren en sus objetivos exactamente los
      conceptos que enseñan, después de lo que mueva el batch 47.

**Tests esperados**
- [ ] `validar-contenido` limpio, `npm run humo` sin errores

**Fuera de alcance**
- Añadir comprobaciones nuevas al verificador del laboratorio. Se usan las que
  ya existen.

---

## Batch 49 — La pauta de comandos del docente

Antes de repasar el contenido a mano, el docente necesita **probar que todos
los comandos del curso funcionan**, uno por uno, mirando la evidencia de cada
uno antes de pasar al siguiente. Hoy los comandos están repartidos entre 199
ítems —dentro de `terminal`, `comando-anotado`, `demo.pasos[]`,
`lectura.comandos[]` y `salida-anotada.comando`— y no existe ninguna lista.

Lo que hace falta **no es un script que se ejecute de un enter**: es una pauta.
Un archivo de shell que se lee de arriba abajo y del que se copia un bloque a
la vez.

### La regla que define este batch: ningún comando sin evidencia

Es un ensayo general, no un inventario. Un comando que corre sin error y no
deja ver qué cambió **no está probado**: `make seed` puede terminar en verde y
haber escrito cuatro archivos en el sitio equivocado. Así que cada comando del
curso va **envuelto en sondas**, y el bloque es el que enseña algo, no la línea:

    # ── s1-seed · S1·U3 · ~15:35 ──────────────────────────────
    # estado de partida: mundo vacío, plataforma en pie

    # sonda · antes
    docker compose run --rm plataforma sh -c 'ls /datos; ls /datos/modelos | wc -l'
    #   → el volumen está vacío · 0

    make seed                                            # ⏱ ~30 s

    # sonda · después — la misma línea, literal
    docker compose run --rm plataforma sh -c 'ls /datos; ls /datos/modelos | wc -l'
    #   → ventas.csv modelos predicciones.csv metricas.csv ejecuciones_job.csv · 192

    # deja el mundo: sano

Tres clases de línea, y se distinguen a la vista: **sonda antes**, **comando
del curso**, **sonda después**. Un comando que ya se evidencia solo —un `curl`
que imprime su respuesta, `make estado`, `make memoria`— no lleva sondas: lleva
la salida esperada, que es lo mismo dicho de otra forma.

**La sonda de después es la misma sonda de antes, literal.** No una parecida:
la misma línea, repetida. Es lo que convierte dos salidas en una diferencia
legible de un vistazo — si la de antes lista archivos y la de después cuenta
filas, hay dos hechos y ninguna comparación, y el docente tiene que reconstruir
mentalmente qué cambió.

Y la evidencia **no es que aparezcan archivos**. La mayoría de los comandos de
este taller no crean nada: reescriben un CSV que ya estaba, mueven un número,
suben una versión, dejan una marca de tiempo nueva. Ahí es donde la sonda tiene
que estar bien elegida, porque `ls` no distingue un `metricas.csv` sano de uno
degradado — son el mismo nombre y casi el mismo tamaño. La sonda tiene que
apuntar a **lo que el comando de verdad movió**:

| Lo que hace el comando significativo | Lo que la sonda tiene que enseñar |
|---|---|
| Crea archivos (`seed` la primera vez) | El directorio antes y después, y el conteo de artefactos |
| **Reescribe un archivo** (`romper`, `reparar`) | **El número que hay dentro**: el MAPE y el sesgo de la flota, por la API. Nunca el `ls` |
| **Mueve un número** (`escenario`) | La misma consulta agregada, antes y después, sobre la misma ventana |
| **Reescribe artefactos** (`entrenar`, `actuar`) | La marca de tiempo y la `version` del registro, no el conteo — siguen siendo 192 |
| **Añade una entrada** (`agente`, `actuar`) | El historial completo antes y después: `make memoria`, `/v1/reentrenamientos` |
| **Quita filas** (`feed_caido`) | `wc -l` de `metricas.csv`: 17,472 → 17,304, que son exactamente las 168 de una tienda |
| Cambia qué corre (`arriba`, `ui`, `abajo`) | `docker compose ps`, la misma línea las dos veces |

El caso que mejor explica la regla es `make romper ESCENARIO=sesgo_silencioso`:
no crea ni borra nada, y `ls` da idéntico antes y después. Lo único que cambió
es que el sesgo de la flota pasó de +0.8% a +4.7% — y esa es, además, **la
lección central del taller**. Si la sonda no la enseña, el ensayo no probó lo
que importa.

**Alcance**
- [ ] `docs/pauta-de-comandos.sh` — zsh/bash, ejecutable pero **con un guardián
      al principio que aborta si alguien lo corre entero**. Correrlo de una vez
      levantaría y rompería el mundo cuatro veces seguidas y no probaría nada:
      la mitad del valor está en mirar la salida entre comando y comando.
- [ ] **Cobertura completa, del primero al último.** No se omite ningún comando
      del curso, ni siquiera los obvios. Es una prueba de fuego: lo que no se
      ensaya es lo que falla en clase.
- [ ] **Cada comando, envuelto en sondas** según la regla de arriba, y cada
      sonda con su `#   →` de lo que tiene que salir. Las sondas son
      **inofensivas y de solo lectura**: `ls`, `wc -l`, `docker compose ps`,
      `curl` a la API, `head`. Ninguna sonda cambia el mundo.
- [ ] **Estructura por escaleta, no por tema.** Un bloque por unidad, en el
      orden del dictado, con el `id` del ítem del que sale cada comando y la
      hora aproximada. Así el archivo sirve para dos cosas: ensayar hoy, y como
      chuleta el sábado.
- [ ] **El estado del mundo, explícito en cada bloque.** Es el riesgo real de
      un ensayo largo: dos `make romper` sin `make reparar` en medio se apilan
      y las lecturas dejan de significar nada, y `make verificar` **deja el
      mundo en `feed_caido`**. Cada bloque abre diciendo de qué estado parte y
      cierra dejándolo como el siguiente lo espera.
- [ ] Los bloques de preparación separados de los de dictado: lo que se corre
      **antes** de la clase (`make arriba`, `make seed`, `make verificar`) no
      es lo que se teclea delante de la sala.
- [ ] Las variantes de Windows (`.\taller.ps1`) como comentario al lado, no
      como archivo aparte.
- [ ] Marcar los que **gastan llave de LLM** y los que **tardan** —`seed`,
      `entrenar`, `make actuar`— para poder saltarlos en una pasada rápida.
- [ ] `npm run validar-pauta`, con dos comprobaciones:
      **(a)** todo comando que aparezca en el contenido está en la pauta —sin
      esto el archivo se desincroniza en el primer batch que entre después, y
      una pauta incompleta es peor que ninguna porque se confía en ella—; y
      **(b)** todo comando que modifica el mundo tiene al menos una sonda
      antes y otra después.

### Catálogo de sondas, por familia de comando

Se documenta acá para que la conversación que lo implemente no tenga que
inventarlo, y para que la elección de sonda sea una decisión discutible y no
una ocurrencia.

| Comando del curso | Sonda antes | Sonda después · qué demuestra |
|---|---|---|
| `make arriba` | `docker compose ps` | `docker compose ps` — dos servicios en pie, el agente no |
| `make seed` | `ls -la /datos` | `ls -la /datos` y `ls /datos/modelos \| wc -l` → 192 |
| `make ui` | `curl -s -o /dev/null -w '%{http_code}' :8501` | el mismo, ahora 200 · y `docker compose ps` |
| `make estado` | — | se evidencia solo |
| `make romper ESCENARIO=x` | `curl -s :8000/v1/resumen` → MAPE 13.8 | el mismo → el MAPE del escenario. **Es la evidencia central del taller** |
| `make reparar` | `curl -s :8000/v1/resumen` degradado | el mismo → vuelve a 13.8 · y `wc -l metricas.csv` → 17,472 |
| `make entrenar` | `ls -l --time-style=full /datos/modelos \| head` | el mismo → las marcas de tiempo cambiaron, y la `version` del registro subió |
| `make mlflow` | `curl -s -o /dev/null -w '%{http_code}' :5000` | el mismo → 200 · y el número de runs |
| `make plano` / `make agente` | `make memoria` → lo que había | `make memoria` → una entrada más. **Es la prueba de que el agente escribió** |
| `make actuar` | `curl -s :8000/v1/reentrenamientos` | el mismo → una entrada nueva · y los `.joblib` con marca de tiempo nueva |
| `make verificar` | — | se evidencia solo, **pero deja el mundo roto**: cerrar con `make reparar` y su sonda |
| `make abajo` | `docker compose ps` | `docker compose ps` vacío · `ls /datos` intacto — que es el punto |
| `make reset` | `ls /datos` | `ls /datos` vacío. Va al final del ensayo y en ningún otro sitio |
| `curl` de la API | — | se evidencian solos |
| el `groupby` de pandas | — | se evidencia solo |
| `docker builder prune -f` | `docker system df` | `docker system df` — el espacio recuperado |

**Dónde vive, y por qué acá y no en el laboratorio**

Los comandos se ejecutan en el laboratorio, así que la tentación es ponerlo
ahí. Va en este repositorio por una sola razón: **es material derivado del
contenido**, y solo acá se puede comprobar que no se ha quedado corto. Un
archivo en el otro repositorio no tiene forma de saber que el batch 46 añadió
`make entrenar`. La primera línea de la pauta dice desde qué directorio se
corre.

**Dónde vive, y por qué acá y no en el laboratorio**

Los comandos se ejecutan en el laboratorio, así que la tentación es ponerlo
ahí. Va en este repositorio por una sola razón: **es material derivado del
contenido**, y solo acá se puede comprobar que no se ha quedado corto. Un
archivo en el otro repositorio no tiene forma de saber que el batch 46 añadió
`make entrenar`. La primera línea de la pauta dice desde qué directorio se
corre.

**Tests esperados**
- [ ] `validar-pauta` falla si se añade un comando a una unidad y no a la pauta
- [ ] `validar-pauta` falla si un comando que modifica el mundo no tiene la
      misma sonda antes y después
- [ ] La pauta corrida entera aborta con un mensaje que explica por qué

**Fuera de alcance**
- Automatizar la comprobación de las evidencias. La pauta dice qué tiene que
  salir; quien mira es el docente. Lo que sí se comprueba es que **la sonda
  esté**, no que su salida sea la correcta.
- Los comandos que solo salen en notas privadas y no se dictan.

**Requisitos externos**
- Se hace **después** de los batches 45, 46 y 48, que son los que añaden
  comandos nuevos.

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
