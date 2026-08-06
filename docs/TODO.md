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
| 3 | Estructura completa del curso | ⬜ Pendiente |
| 4 | Renderizadores: familia `contenido` | ⬜ Pendiente |
| 5 | Renderizadores: familia `dictado` | ⬜ Pendiente |
| 6 | Vista de dictado y navegación por teclado | ⬜ Pendiente |
| 7 | Autenticación del docente en `/profe` | ⬜ Pendiente |
| 8 | Sincronía en vivo: el docente marca el ritmo | ⬜ Pendiente |
| 9 | Preguntas del alumno hacia el docente | ⬜ Pendiente |
| 10 | Preguntas del docente hacia los alumnos | ⬜ Pendiente |
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

## Batch 3 — Estructura completa del curso

Antes de escribir contenido fino hace falta ver el esqueleto de las ocho horas
completo, para saber si el reparto de tiempos cierra y si falta algún bloque.

**Alcance**
- [ ] `contenido/curso.yml` con los atributos del curso: título, programa,
      institución, docente, descripción
- [ ] `contenido/sesiones/sesion-1.yml` y `sesion-2.yml` con fecha y horario
- [ ] Unidades de sesión 1: una de tipo `repaso` y las de tipo `reto`
- [ ] Unidades de sesión 2: las de tipo `reto` y una de tipo `cierre`
- [ ] Cada unidad con `objetivos`, `requisitos` y `minutos`
- [ ] Ítems enunciados con su tipo, título y minutos — **sin el contenido
      definitivo**, que es trabajo aparte
- [ ] Ítems de dictado colocados donde corresponden: asistencia al inicio de
      cada sesión, receso a mitad, pausas de preguntas entre unidades
- [ ] La suma de minutos por sesión cuadra con las cuatro horas

**Reparto acordado**

Sale de cuadrar los cinco retos que ya existen en `texai/taller-ia-uni-lab`
(`retos/README.md`) contra los 480 minutos disponibles. Los retos suman 310, así
que quedan 170 para todo lo demás: apertura, repaso, recesos, rescate de
entornos, pausas de preguntas, asistencia y cierre. Cabe, sin holgura.

Sesión 1 · sábado 15:00–19:00 · *El mundo y la percepción* — 240 min

| Inicio | Unidad | Tipo | Min |
|---|---|---|---|
| 15:00 | Dónde encaja esto, y la flota de 192 modelos | `repaso` | 60 |
| 16:00 | Encontrar el problema a mano | `reto` | 40 |
| 16:40 | *Receso* | | 15 |
| 16:55 | La herramienta de percepción | `reto` | 60 |
| 17:55 | El primer agente, sin arquitectura | `reto` | 55 |
| 18:50 | Cierre y qué viene mañana | | 10 |

Sesión 2 · domingo 09:00–13:00 · *La arquitectura cognitiva* — 240 min

| Inicio | Unidad | Tipo | Min |
|---|---|---|---|
| 09:00 | Qué le faltaba al bucle de ayer | `repaso` | 25 |
| 09:25 | La arquitectura cognitiva | `reto` | 90 |
| 10:55 | *Receso* | | 15 |
| 11:10 | De la recomendación a la acción | `reto` | 60 |
| 12:10 | Los errores, y dónde estaban de verdad | `cierre` | 35 |
| 12:45 | Preguntas y despedida | | 15 |

**Dos decisiones que salieron de hacer las cuentas**

- **El rescate de entornos rotos vive dentro del repaso**, no como bloque
  aparte. Con su propio bloque se consume los veinte minutos completos aunque
  solo dos personas lo necesiten; dentro del repaso, quien está bien escucha el
  contexto mientras quien está roto arregla en paralelo.
- **El reto 3 baja de 60 a 55 minutos, y puede bajar más.** Es el único reto
  donde no se construye casi nada: se corre un ReAct pelado tres veces y se
  observa cómo divaga. Es diagnóstico, no construcción. Si el sábado va
  retrasado, es el bloque del que robar tiempo sin perder nada.

**Riesgo conocido:** el reto 2 es el que puede reventar el cronograma. Son 60
minutos escribiendo estadística con niveles mezclados, y es el único donde una
persona trabada se traba de verdad. Las dos redes ya existen en el laboratorio:
`make verificar` da un criterio objetivo de cuándo terminaron, y la
implementación de referencia está en `agente/`.

**Fuera de alcance**
- El contenido definitivo de cada ítem. Acá se define qué ítem va dónde.

---

## Batch 4 — Renderizadores: familia `contenido`

Los ítems están definidos pero no se ven. Sin renderizadores no hay material
proyectable.

**Alcance**
- [ ] Un componente por tipo en `src/components/items/`
- [ ] Registro que mapea `tipo` → componente, con un fallback visible que diga
      qué tipo no supo renderizar en vez de romper la vista
- [ ] `codigo` con resaltado por lenguaje y soporte de `resaltar`
- [ ] `terminal` con el comando copiable de un clic, y las dos variantes cuando
      hay `comandoWindows`
- [ ] `diagrama` con Mermaid, legible en claro y oscuro
- [ ] `markdown` con GFM: tablas, listas de tareas, código embebido
- [ ] `imagen` responsiva, con `destacar` dibujando el recuadro
- [ ] `archivo` con descarga y el peso del archivo a la vista
- [ ] `transicion` dibuja el mapa de la sesión: unidades cerradas, la actual y
      la que viene. **Derivado de la estructura del curso, no declarado en el
      YAML** (ver [`CONVENTIONS.md`](CONVENTIONS.md) §8)
- [ ] Todos legibles proyectados: mínimo 18px de cuerpo, contraste alto

**Tests esperados**
- [ ] Cada tipo del catálogo renderiza sin romper
- [ ] Un tipo desconocido muestra el fallback y no tumba la página
- [ ] `transicion` marca como cerradas exactamente las unidades anteriores a la
      suya, y reordenar unidades en el YAML cambia el mapa sin tocar el ítem

**Fuera de alcance**
- Navegación entre ítems. Cada componente solo se dibuja a sí mismo.

---

## Batch 5 — Renderizadores: familia `dictado`

Los ítems que marcan el ritmo necesitan un tratamiento distinto: interrumpen,
no informan.

**Alcance**
- [ ] `receso` a pantalla completa, con cuenta regresiva y la hora de regreso
      calculada
- [ ] `pausa-preguntas` que muestra que es el momento y lista los disparadores
- [ ] `asistencia` visible **solo** para el docente: el alumno ve el ítem
      siguiente sin enterarse
- [ ] `pregunta` renderizado para alumno: la pregunta, el campo o las opciones,
      y el botón de omitir
- [ ] Estos ítems se distinguen visualmente de los de contenido a primera vista

**Tests esperados**
- [ ] Un ítem `asistencia` no aparece en la carga del alumno
- [ ] `receso` calcula bien la hora de regreso

---

## Batch 6 — Vista de dictado y navegación por teclado

El material existe y se renderiza, pero no hay forma de recorrerlo.

**Alcance**
- [ ] Ruta de sesión que muestra un ítem a la vez
- [ ] Flecha derecha e izquierda para avanzar y retroceder
- [ ] **Pasos internos**: un ítem puede declarar `pasos`, y la flecha avanza
      dentro del ítem antes de saltar al siguiente (ver
      [`CONVENTIONS.md`](CONVENTIONS.md) §10). Un ítem sin `pasos` se comporta
      como siempre
- [ ] La posición es `(unidad, ítem, paso)` en toda la aplicación, incluida la URL
- [ ] Barra de progreso con la unidad actual y cuánto falta
- [ ] Índice lateral con las unidades, plegable
- [ ] Al abrir una unidad se muestran sus `objetivos` antes del primer ítem
- [ ] La URL refleja la posición, para poder recargar y compartir
- [ ] Funciona con teclado, con clic y en pantalla táctil

**Fuera de alcance**
- Sincronía. Acá cada quien navega por su cuenta.

---

## Batch 7 — Autenticación del docente en `/profe`

Todo lo anterior es público. Los controles de dictado no pueden serlo.

**Alcance**
- [ ] Supabase Auth con `@supabase/ssr`
- [ ] `/profe` con formulario de correo y contraseña, fuera de toda navegación
- [ ] Sesión en cookie, con renovación en el middleware
- [ ] Middleware que protege las rutas de docente
- [ ] El cliente comprueba que el usuario autenticado sea el docente,
      comparando contra `NEXT_PUBLIC_DOCENTE_UID`. **Esto es para la interfaz,
      no es la defensa**: la defensa está en la política de Realtime (ver
      [`CONVENTIONS.md`](CONVENTIONS.md) §11), porque Auth es compartida con
      `gen` y un usuario de esa aplicación queda autenticado también acá
- [ ] Cierre de sesión
- [ ] `/profe` documentada en el README

**Fuera de alcance**
- Ninguna tabla. El docente se crea a mano en el panel de Supabase; no hay
  script de npm ni gestión de usuarios en la aplicación.
- Recuperación de contraseña, registro, invitaciones.

**Requisitos externos**
- Usuario del docente creado a mano en *Authentication → Users* del proyecto
  compartido con `gen`.
- **Registro deshabilitado** en *Authentication → Providers → Email*.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y
  `NEXT_PUBLIC_DOCENTE_UID` en `.env.local` y en Vercel.

**Tests esperados**
- [ ] Sin sesión, una ruta de docente redirige a `/profe`
- [ ] Un usuario autenticado que no sea el docente no ve los controles

---

## Batch 8 — Sincronía en vivo: el docente marca el ritmo

El corazón del producto. El alumno debe seguir al docente sin adelantarse.

**Alcance**
- [ ] Canal privado de Realtime por sesión: `taller:{curso}:{sesion}`
- [ ] **Broadcast** para publicar cada movimiento del docente
- [ ] **Presence** para llevar la posición actual, de modo que quien se conecta
      reciba el estado de entrada. Es la pieza que hace innecesaria una tabla
      (ver [`CONVENTIONS.md`](CONVENTIONS.md) §11)
- [ ] La posición incluye el **paso interno**: quien llega tarde tiene que
      aterrizar en el mensaje 4 del diagrama, no al principio del diagrama
- [ ] El alumno puede navegar hacia atrás libremente; hacia adelante no
- [ ] El contenido posterior **no se envía** al cliente del alumno (ver
      [`CONVENTIONS.md`](CONVENTIONS.md) §4)
- [ ] Botón de "volver a donde va la clase" cuando el alumno se quedó atrás
- [ ] Indicador de conexión: en vivo, reconectando, sin conexión
- [ ] Al reconectar, el docente vuelve a publicar la posición que conserva su
      propia URL
- [ ] Interruptor de "clase en vivo": fuera de vivo, el alumno navega libre

**Fuera de alcance**
- Cualquier tabla. Nada de esto se persiste: se acaba cuando se acaba la clase.

**Requisitos externos**
- Realtime habilitado en el proyecto. `gen` no lo usa hoy.
- Política sobre `realtime.messages` que solo deje publicar la pauta al
  identificador del docente, según [`CONVENTIONS.md`](CONVENTIONS.md) §11.

**Tests esperados**
- [ ] Un alumno que se conecta a mitad de clase cae en la posición correcta,
      incluido el paso interno
- [ ] La carga del alumno no incluye ítems posteriores a la posición del docente
- [ ] Perder la conexión y recuperarla deja al alumno donde corresponde

---

## Batch 9 — Preguntas del alumno hacia el docente

Preguntar en voz alta cuesta. La mitad del valor de poder preguntar es que
nadie más te vea preguntarlo.

**Alcance**
- [ ] Subcanal de Broadcast para preguntas, dentro del canal de la sesión
- [ ] Botón de preguntar siempre a mano en la vista del alumno
- [ ] La pregunta viaja con el ítem y el paso donde se hizo: sin eso llega
      descontextualizada diez minutos después y ya nadie sabe de qué hablaba
- [ ] Nombre opcional: se puede preguntar sin firmar
- [ ] Las preguntas llegan **solo al cliente del docente**, y ahí se acumulan
      en memoria mientras dure la sesión
- [ ] Las preguntas **no** aparecen en la pantalla principal del docente
- [ ] Contador discreto de preguntas sin atender
- [ ] Marcar una pregunta como atendida

**Fuera de alcance**
- Persistencia. Si el docente recarga la página, las preguntas se pierden: son
  de la clase, no del curso. Si alguna vez hace falta conservarlas, se exportan
  a un archivo desde la segunda pantalla antes de cerrar.

**Tests esperados**
- [ ] Una pregunta publicada llega al cliente del docente con su contexto
- [ ] Un alumno no recibe las preguntas de otros alumnos

---

## Batch 10 — Preguntas del docente hacia los alumnos

Preguntar a la clase es la forma más barata de saber si alguien se perdió. Y
mostrar el resultado, cuando el docente decide mostrarlo, es la forma más
barata de que la clase se entere de que no estaba tan de acuerdo consigo misma
como creía.

**Alcance**
- [ ] Ítem `pregunta` de la pauta: al llegar, aparece en la pantalla del alumno
- [ ] Preguntas en vivo, lanzadas desde la segunda pantalla sin estar en la pauta
- [ ] Respuesta abierta o de opciones
- [ ] El alumno siempre puede decir explícitamente que prefiere no responder
- [ ] `visibilidad: privada | publica`

**Las públicas, y sus tres estados** (ver [`CONVENTIONS.md`](CONVENTIONS.md) §12)
- [ ] **Respondiendo** — la pantalla proyectada muestra la pregunta y *cuántos
      ya contestaron*. **Nunca qué contestaron**: si los resultados se ven
      mientras la gente responde, los que faltan copian al grupo y la pregunta
      deja de medir nada
- [ ] Contador de avance: "12 de 20 respondieron", y quiénes faltan si firmaron
- [ ] **Revelado** — por dos vías: un clic del docente, que puede cortar cuando
      quiera, o **automáticamente cuando ya respondieron todos**, porque a esa
      altura ya no hay a quién sesgar
- [ ] **En vivo** — ya revelado, el recuento sigue actualizándose si alguien
      responde tarde
- [ ] El denominador de "todos" sale de **Presence**: el canal ya sabe cuántos
      alumnos están conectados, así que no hay que declarar el tamaño del
      grupo. Si alguien se desconecta a mitad, el denominador baja con él
- [ ] Gráfico de barras legible proyectado, con el porcentaje y el conteo
- [ ] Si la pregunta tiene `respuesta` correcta, se marca **solo al revelar**

**Las privadas**
- [ ] El recuento llega únicamente a la segunda pantalla del docente

**Cómo viajan las respuestas sin tablas**
- [ ] Las respuestas van por Broadcast a un tema que los alumnos pueden
      **escribir pero no leer**, resuelto con la política de Realtime. Si
      pudieran leerlo, cualquiera con las herramientas de desarrollador vería
      las respuestas de los demás antes del revelado
- [ ] El revelado sí es público: lo publica el docente en el canal de la sesión
- [ ] La `respuesta` correcta nunca sale del servidor antes del revelado (ver
      [`CONVENTIONS.md`](CONVENTIONS.md) §3)

**Fuera de alcance**
- Persistencia. El recuento vive mientras dura la clase; si el docente recarga,
  se pierde. Son datos de la clase, no del curso.

**Tests esperados**
- [ ] `respuesta` no aparece en la carga del alumno
- [ ] Omitir queda registrado como omisión, no como falta de respuesta
- [ ] Antes del revelado, el cliente del alumno no tiene forma de conocer el
      recuento
- [ ] El recuento se actualiza al llegar respuestas tardías
- [ ] Con todos los conectados respondiendo, el revelado ocurre sin clic
- [ ] Un alumno que se desconecta baja el denominador y puede disparar el
      revelado

---

## Batch 11 — Segunda pantalla del docente

En clase, el docente comparte su pantalla por Zoom. Todo lo que necesita para
sí mismo —notas, preguntas que llegan, el reloj— no puede estar ahí.

**Alcance**
- [ ] Ruta de segunda pantalla, pensada para teléfono
- [ ] Controles de avance y retroceso que mueven la clase
- [ ] Notas privadas del ítem actual
- [ ] Vista previa del ítem siguiente
- [ ] Preguntas de alumnos, en vivo
- [ ] Lanzar una pregunta al vuelo
- [ ] Reloj: tiempo transcurrido, tiempo restante de la sesión, y si el ítem
      actual se está pasando de sus minutos
- [ ] Autenticada como el resto de lo del docente

---

## Batch 12 — Reloj de sesión y avisos de tiempo

Cuatro horas se van rápido, y el receso se olvida.

**Alcance**
- [ ] Reloj de sesión comparando lo planificado con lo real
- [ ] Aviso cuando toca el receso según la hora, no solo según la posición
- [ ] Aviso cuando una unidad se está pasando de sus minutos
- [ ] Todo esto solo en la segunda pantalla; el proyector no lo muestra

---

## Batch 13 — Diagramas de secuencia PlantUML, recorribles

Un diagrama de secuencia proyectado entero es una maraña. Nadie sigue nueve
flechas a la vez, y el que se pierde en la tercera ya no vuelve. Hace falta
poder recorrerlo mensaje por mensaje, viendo de dónde sale cada uno, a dónde
llega y qué lleva.

**Alcance**
- [ ] Tipo `diagrama-secuencia` con la fuente en PlantUML
- [ ] Render a imagen **en tiempo de construcción**, servida estática: PlantUML
      es Java y Vercel no lo ejecuta, y depender de un servicio externo en
      mitad de una clase es una forma innecesaria de quedarse sin material
- [ ] Parser de la fuente PlantUML para el subconjunto que usamos:
      participantes, mensajes, activaciones, notas
- [ ] Modo enfocado que dibuja el recorrido por su cuenta, resaltando un
      mensaje a la vez y atenuando el resto
- [ ] Cada mensaje puede llevar su `explicacion`, que aparece al enfocarlo
- [ ] El primer paso muestra el diagrama completo, sin nada enfocado: primero
      el mapa, después el recorrido
- [ ] Se apoya en los `pasos` del batch 6, no inventa su propia navegación
- [ ] `npm run diagramas` regenera las imágenes; el resultado se versiona

**Decisión a tomar al implementar**
Cómo se genera la imagen en construcción. Las opciones son un `plantuml.jar`
local, un contenedor, o un servicio tipo Kroki. Lo que no es negociable es que
la salida quede en disco antes de la clase.

**Tests esperados**
- [ ] El parser extrae los mensajes esperados de una fuente de ejemplo
- [ ] Una fuente PlantUML que el parser no entiende falla en validación, no en
      clase
- [ ] El número de pasos coincide con el número de mensajes más uno

**Fuera de alcance**
- Todo PlantUML. Solo el subconjunto de diagramas de secuencia que este curso
  usa; cualquier otra cosa debe fallar diciendo qué no entendió.
- Diagramas de clase, de componentes o de estados en PlantUML: para eso está
  `diagrama` con Mermaid.

---

## Batch 14 — Comandos anotados parte por parte

`docker compose run --rm -e EJECUTAR_ACCIONES=1 agente python -m agente run --verboso`
son doce palabras que un alumno lee como un bloque opaco. Cada una está ahí por
una razón, y esa razón es justamente lo que hay que enseñar.

**Alcance**
- [ ] Tipo `comando-anotado`: el comando completo, más una lista de segmentos
- [ ] Cada segmento con su explicación, y opcionalmente qué otros valores
      admite
- [ ] Modo enfocado: el segmento activo resaltado dentro del comando, con una
      llave o flecha señalándolo, al estilo de las anotaciones en ASCII
- [ ] El resto del comando queda visible pero atenuado: el punto es ver la
      parte **sin perder el todo**
- [ ] Los segmentos se declaran por texto, no por índice de caracteres — un
      índice se rompe en cuanto alguien corrige un espacio
- [ ] Un segmento que no aparece en el comando falla en validación
- [ ] Se apoya en los `pasos` del batch 6
- [ ] Funciona con comandos que ocupan más de una línea

**Tests esperados**
- [ ] Los segmentos se localizan correctamente dentro del comando
- [ ] Un segmento inexistente falla nombrando el ítem y el texto que no encontró
- [ ] Un segmento que aparece dos veces en el comando falla como ambiguo, en
      vez de elegir uno en silencio

---

## Batch 15 — Contenido · S1·U1 `repaso` — Dónde encaja esto, y la flota de 192 modelos

**Escribe una sola unidad.** No leas el resto del curso: la estructura
del batch 3 ya dice qué va dónde (ver [`CONVENTIONS.md`](CONVENTIONS.md) §13).

**Objetivo de la unidad**
Situar el taller en el programa y hacer que la clase entienda qué es vigilar 192 modelos desplegados, antes de que aparezca ningún agente.

**Duración** 60 minutos → del orden de 20 ítems.

**Material de origen** — repositorio `texai/taller-ia-uni-lab`
- `README.md` del laboratorio — la sección *El caso*
- `plataforma/config.py`, `datos.py`, `modelo.py` — cómo está hecha la flota
- El sílabo y los módulos previos del programa

**Tipos de ítem sugeridos**
- `titulo` para la apertura
- `transicion` con el mapa del programa: qué módulos ya vieron
- `diagrama` de componentes de la solución completa: fuentes de datos, ingesta, entrenamiento, job batch, telemetría, y dónde entrará el agente
- `modelo-datos` con las columnas de la telemetría
- `terminal` con `make arriba` y `make seed`
- `demo` de la interfaz en :8501
- `asistencia` al inicio
- `pausa-preguntas` al cerrar

**Criterios de aceptación**
- [ ] Explica qué es un artefacto entrenado y por qué la relación modelo↔contenedor no es 1 a 1
- [ ] Deja claro que los 192 modelos vienen dados y no se tocan
- [ ] Incluye el rescate de entornos rotos dentro de la unidad, no como bloque aparte
- [ ] Define `cobertura`, `MAPE` y `sesgo` antes de usarlos
- [ ] `objetivos` y `requisitos` de la unidad, escritos
- [ ] Los minutos de los ítems suman los 60 de la unidad
- [ ] Cada ítem que lo amerite lleva sus `notas` privadas para la segunda pantalla
- [ ] `npm run validar-contenido` pasa

**Fuera de alcance**
- Cualquier otra unidad. Un batch que toca dos unidades está mal partido.
- Inventar cifras. Las de este curso están medidas; si falta una, se pide.

---

## Batch 16 — Contenido · S1·U2 `reto` — Encontrar el problema a mano

**Escribe una sola unidad.** No leas el resto del curso: la estructura
del batch 3 ya dice qué va dónde (ver [`CONVENTIONS.md`](CONVENTIONS.md) §13).

**Objetivo de la unidad**
Que sientan en el cuerpo que revisar 192 modelos a mano no escala, y que la métrica que estaban mirando no era la que hablaba de plata.

**Duración** 40 minutos → del orden de 13 ítems.

**Material de origen** — repositorio `texai/taller-ia-uni-lab`
- `retos/README.md` — Reto 1
- `plataforma/escenario.py` — los cuatro escenarios
- Las cifras medidas: 13.8%→14.5% de MAPE, 7→14 modelos sobre umbral, +0.7%→+4.7% de sesgo, 36,567 unidades

**Tipos de ítem sugeridos**
- `comando-anotado` con la llamada a `/v1/metricas`
- `terminal` con `make romper ESCENARIO=campana_promocional`
- `tabla` comparando las dos degradaciones
- `metrica` con las 36,567 unidades
- `comparacion` entre lo que ve el MAPE y lo que ve el sesgo
- `pregunta` pública: ¿cuál de las dos alertarías?
- `pausa-preguntas`

**Criterios de aceptación**
- [ ] El escenario visible se resuelve rápido; el silencioso no se resuelve
- [ ] La pregunta del cierre es cuánto tardarías haciendo esto cada mañana para 192 modelos
- [ ] No se adelanta la solución: acá solo se sufre el problema
- [ ] `objetivos` y `requisitos` de la unidad, escritos
- [ ] Los minutos de los ítems suman los 40 de la unidad
- [ ] Cada ítem que lo amerite lleva sus `notas` privadas para la segunda pantalla
- [ ] `npm run validar-contenido` pasa

**Fuera de alcance**
- Cualquier otra unidad. Un batch que toca dos unidades está mal partido.
- Inventar cifras. Las de este curso están medidas; si falta una, se pide.

---

## Batch 17 — Contenido · S1·U3 `reto` — La herramienta de percepción

**Escribe una sola unidad.** No leas el resto del curso: la estructura
del batch 3 ya dice qué va dónde (ver [`CONVENTIONS.md`](CONVENTIONS.md) §13).

**Objetivo de la unidad**
Que entiendan que la calidad de un agente se decide antes del LLM: si la percepción miente, no hay arquitectura que lo salve.

**Duración** 60 minutos → del orden de 20 ítems.

**Material de origen** — repositorio `texai/taller-ia-uni-lab`
- `retos/README.md` — Reto 2
- `agente/herramientas.py` — `_sesgo`, `UMBRALES`, `comparar_periodos`
- Los máximos medidos de la flota sana por dimensión: categoría +19.6% y 1.05pp, región +15.2% y 2.31pp, tienda +48.4% y 3.54pp

**Tipos de ítem sugeridos**
- `codigo` con `_sesgo`, resaltando el cociente de totales
- `comparacion` entre promediar porcentajes y dividir totales, con el caso de panadería a +9.2% contra +0.7%
- `tabla` de umbrales por dimensión
- `criterios` con el de aceptación: cero banderas en la flota sana
- `error-comun` con las tres trampas
- `terminal` con `make verificar ARGS="--reto 2"`

**Criterios de aceptación**
- [ ] Las tres trampas quedan explicadas con las cifras medidas, no en abstracto
- [ ] Se explica por qué el umbral de tienda es más alto que el de categoría
- [ ] El criterio de aceptación es verificable por el alumno sin preguntar
- [ ] `objetivos` y `requisitos` de la unidad, escritos
- [ ] Los minutos de los ítems suman los 60 de la unidad
- [ ] Cada ítem que lo amerite lleva sus `notas` privadas para la segunda pantalla
- [ ] `npm run validar-contenido` pasa

**Fuera de alcance**
- Cualquier otra unidad. Un batch que toca dos unidades está mal partido.
- Inventar cifras. Las de este curso están medidas; si falta una, se pide.

---

## Batch 18 — Contenido · S1·U4 `reto` — El primer agente, sin arquitectura

**Escribe una sola unidad.** No leas el resto del curso: la estructura
del batch 3 ya dice qué va dónde (ver [`CONVENTIONS.md`](CONVENTIONS.md) §13).

**Objetivo de la unidad**
Ver fallar a un agente que funciona. Es diagnóstico, no construcción — y es la pregunta que abre la sesión 2.

**Duración** 55 minutos → del orden de 18 ítems.

**Material de origen** — repositorio `texai/taller-ia-uni-lab`
- `retos/README.md` — Reto 3
- `agente/llm.py` — `obtener_llm` y `bind_tools`
- Las cuatro patologías documentadas de corridas reales del ReAct pelado

**Tipos de ítem sugeridos**
- `codigo` con el bucle ReAct completo, que es corto a propósito
- `demo` corriendo el mismo escenario tres veces
- `cita-agente` con las salidas divergentes
- `tabla` con las cuatro patologías
- `titulo` de cierre: *nada de esto se arregla con un prompt más largo*
- `transicion` hacia la sesión 2

**Criterios de aceptación**
- [ ] Queda claro que el agente **funciona**: llama herramientas y encuentra cosas
- [ ] Las patologías se muestran con salidas reales, no descritas
- [ ] La unidad cierra con una pregunta abierta, no con una respuesta
- [ ] `objetivos` y `requisitos` de la unidad, escritos
- [ ] Los minutos de los ítems suman los 55 de la unidad
- [ ] Cada ítem que lo amerite lleva sus `notas` privadas para la segunda pantalla
- [ ] `npm run validar-contenido` pasa

**Fuera de alcance**
- Cualquier otra unidad. Un batch que toca dos unidades está mal partido.
- Inventar cifras. Las de este curso están medidas; si falta una, se pide.

---

## Batch 19 — Contenido · S2·U1 `repaso` — Qué le faltaba al bucle de ayer

**Escribe una sola unidad.** No leas el resto del curso: la estructura
del batch 3 ya dice qué va dónde (ver [`CONVENTIONS.md`](CONVENTIONS.md) §13).

**Objetivo de la unidad**
Recuperar el hilo tras una noche, y convertir las cuatro patologías de ayer en el planteamiento de la arquitectura.

**Duración** 25 minutos → del orden de 8 ítems.

**Material de origen** — repositorio `texai/taller-ia-uni-lab`
- La unidad 4 de la sesión 1
- `agente/grafo.py` — el diagrama del módulo

**Tipos de ítem sugeridos**
- `asistencia`
- `transicion` con el mapa: dónde quedamos
- `tabla` recordando las cuatro patologías
- `diagrama` del grafo completo, todavía sin explicar
- `pregunta` pública: ¿qué le agregarías?

**Criterios de aceptación**
- [ ] Se puede seguir sin haber estado el sábado
- [ ] Cada patología se empareja con la capa que la resuelve
- [ ] No se explica el grafo todavía: solo se presenta
- [ ] `objetivos` y `requisitos` de la unidad, escritos
- [ ] Los minutos de los ítems suman los 25 de la unidad
- [ ] Cada ítem que lo amerite lleva sus `notas` privadas para la segunda pantalla
- [ ] `npm run validar-contenido` pasa

**Fuera de alcance**
- Cualquier otra unidad. Un batch que toca dos unidades está mal partido.
- Inventar cifras. Las de este curso están medidas; si falta una, se pide.

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
