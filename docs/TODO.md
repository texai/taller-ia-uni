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
| 1 | Esqueleto Next.js y despliegue en Vercel | ⬜ Pendiente |
| 2 | Modelo de contenido en YAML y cargador | ⬜ Pendiente |
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

Estados: ⬜ Pendiente · 🔵 En curso · ✅ Completado · ⬛ No usado

**Ruta mínima para dictar el sábado:** batches 1 a 8. Del 9 al 14 mejoran el
dictado pero la clase se puede dar sin ellos.

Los batches 13 y 14 dependen de los `pasos` internos que introduce el batch 6
(ver [`CONVENTIONS.md`](CONVENTIONS.md) §10).

### Decisiones pendientes

| Decisión | Bloquea | Detalle |
|---|---|---|
| Proyecto Supabase creado | Batches 7, 8 | Hace falta el proyecto, sus llaves (`URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`) y el registro deshabilitado en Authentication → Providers → Email |
| Dominio de la aplicación | — (ajuste posterior) | Afecta a la URL que se comparte con los alumnos y a los `redirectTo` de Supabase Auth |
| Cuánto contenido fino entra antes del sábado | Batch 3 | El batch deja la estructura de las 8 horas. Llenar cada ítem con su contenido definitivo es trabajo aparte, y puede hacerse en caliente entre sesión y sesión |
| Retención de preguntas y respuestas | Batch 9, 10 | Si se borran al terminar el curso o quedan como registro. Por ahora quedan |

---

## Batch 1 — Esqueleto Next.js y despliegue en Vercel

No existe aplicación. Hace falta la base sobre la que se apoya todo lo demás,
desplegada y accesible por URL, porque los alumnos entran sin instalar nada.

**Alcance**
- [ ] Next.js 15 con App Router, TypeScript en modo estricto, Tailwind
- [ ] Estructura de carpetas: `src/app/`, `src/lib/`, `src/components/`, `contenido/`
- [ ] Página raíz que lista los cursos disponibles (por ahora, uno)
- [ ] Layout con tipografía y tema claro/oscuro respetando el sistema
- [ ] `npm run dev`, `npm run build`, `npm run typecheck` y `npm run lint` pasando
- [ ] Despliegue en Vercel desde `main`
- [ ] `.env.example` con las variables que van a hacer falta

**Fuera de alcance**
- Supabase, autenticación, sincronía. Nada de eso todavía.
- Contenido real del curso: basta con datos de prueba.

**Requisitos externos**
- Proyecto en Vercel conectado a `texai/taller-ia-uni`.

---

## Batch 2 — Modelo de contenido en YAML y cargador

El contenido del curso tiene que poder escribirse a mano, revisarse en un diff
y validarse antes de proyectarse. Un error de tipeo en el YAML no puede
descubrirse en vivo delante de veinte personas.

**Alcance**
- [ ] `src/lib/tipos.ts` con la jerarquía: `Curso`, `Sesion`, `Unidad`, `Item`
- [ ] Unión discriminada de tipos de ítem según el catálogo de [`CONVENTIONS.md`](CONVENTIONS.md) §8
- [ ] Cargador que lee `contenido/curso.yml` y `contenido/sesiones/*.yml`
- [ ] Resolución de referencias a archivo: `archivo: md/el-caso.md` se lee y se
      incorpora
- [ ] Validación con mensajes útiles: qué archivo, qué ítem, qué campo falta
- [ ] `npm run validar-contenido` que falla con código distinto de cero
- [ ] La validación corre dentro de `npm run build`: un YAML roto no llega a
      producción
- [ ] Filtro del servidor que elimina `notas` y `respuesta` de la carga pública
      (ver [`CONVENTIONS.md`](CONVENTIONS.md) §3)

**Tests esperados**
- [ ] Un YAML válido carga con la jerarquía esperada
- [ ] Un ítem sin campo obligatorio falla nombrando archivo, ítem y campo
- [ ] Identificadores duplicados dentro de una sesión fallan
- [ ] `notas` y `respuesta` no aparecen en la carga pública

**Fuera de alcance**
- Renderizar los ítems. Este batch solo carga y valida.

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

Sesión 1 · sábado 15:00–19:00 · *El mundo y la percepción*
1. `repaso` — Dónde encaja esto y qué es una flota de modelos en producción
2. `reto` — Encontrar el problema a mano
3. `reto` — La herramienta de percepción
4. `reto` — El primer agente, sin arquitectura

Sesión 2 · domingo 09:00–13:00 · *La arquitectura cognitiva*
1. `repaso` — Qué le faltaba al bucle de ayer
2. `reto` — La arquitectura cognitiva
3. `reto` — De la recomendación a la acción
4. `cierre` — Los errores, y dónde estaban de verdad

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
- [ ] Todos legibles proyectados: mínimo 18px de cuerpo, contraste alto

**Tests esperados**
- [ ] Cada tipo del catálogo renderiza sin romper
- [ ] Un tipo desconocido muestra el fallback y no tumba la página

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
- [ ] `/profe` con formulario de contraseña, fuera de toda navegación
- [ ] Registro deshabilitado; sin recuperación por correo
- [ ] Sesión en cookie, con renovación en el middleware
- [ ] `npm run clave-docente` que crea o actualiza al docente usando la clave de
      servicio, y explica cómo dejar la variable en Vercel
- [ ] Middleware que protege las rutas de docente
- [ ] `/profe` documentada en el README

**Requisitos externos**
- Proyecto Supabase con el proveedor de correo activo y **el registro
  deshabilitado**.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
  `SUPABASE_SERVICE_ROLE_KEY` en local y en Vercel.

**Tests esperados**
- [ ] Sin sesión, una ruta de docente redirige a `/profe`
- [ ] La clave de servicio nunca se expone al cliente

---

## Batch 8 — Sincronía en vivo: el docente marca el ritmo

El corazón del producto. El alumno debe seguir al docente sin adelantarse.

**Alcance**
- [ ] Tabla `estado_clase` con `unidad_id`, `item_id`, `paso` y `posicion`, y sus políticas
- [ ] El docente publica su posición al moverse, **incluido el paso interno**:
      quien llega tarde tiene que aterrizar en el mensaje 4 del diagrama, no al
      principio del diagrama
- [ ] El alumno se suscribe por Supabase Realtime y sigue esa posición
- [ ] Quien llega tarde recibe la posición actual al conectarse
- [ ] El alumno puede navegar hacia atrás libremente; hacia adelante no
- [ ] El contenido posterior **no se envía** al cliente del alumno (ver
      [`CONVENTIONS.md`](CONVENTIONS.md) §4)
- [ ] Botón de "volver a donde va la clase" cuando el alumno se quedó atrás
- [ ] Indicador de conexión: en vivo, reconectando, sin conexión
- [ ] Interruptor de "clase en vivo": fuera de vivo, el alumno navega libre

**Requisitos externos**
- Realtime habilitado para `estado_clase` en el proyecto Supabase.

**Tests esperados**
- [ ] Un alumno que se conecta a mitad de clase cae en la posición correcta
- [ ] La carga del alumno no incluye ítems posteriores a la posición del docente

---

## Batch 9 — Preguntas del alumno hacia el docente

Preguntar en voz alta cuesta. La mitad del valor de poder preguntar es que
nadie más te vea preguntarlo.

**Alcance**
- [ ] Tabla `preguntas` con sus políticas
- [ ] Botón de preguntar siempre a mano en la vista del alumno
- [ ] La pregunta queda atada al ítem donde se hizo
- [ ] Nombre opcional: se puede preguntar sin firmar
- [ ] Las preguntas **no** se muestran en la pantalla principal del docente
- [ ] Contador discreto de preguntas sin atender
- [ ] Marcar una pregunta como atendida

**Tests esperados**
- [ ] Un alumno sin sesión puede insertar una pregunta
- [ ] Un alumno sin sesión NO puede leer las preguntas de otros

---

## Batch 10 — Preguntas del docente hacia los alumnos

Preguntar a la clase es la forma más barata de saber si alguien se perdió.

**Alcance**
- [ ] Ítem `pregunta` de la pauta: al llegar, aparece en la pantalla del alumno
- [ ] Preguntas en vivo, lanzadas desde la segunda pantalla sin estar en la pauta
- [ ] Respuesta abierta o de opciones
- [ ] El alumno siempre puede decir explícitamente que prefiere no responder
- [ ] El docente ve el recuento en su segunda pantalla, no en el proyector
- [ ] Tabla `respuestas` con sus políticas

**Tests esperados**
- [ ] `respuesta` (la correcta) nunca llega al cliente del alumno
- [ ] Omitir queda registrado como omisión, no como falta de respuesta

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
