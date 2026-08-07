# DONE

Histórico de batches implementados, en orden de finalización. Fuente de verdad
para el [`CHANGELOG.md`](../CHANGELOG.md).

Cada bloque se mueve acá completo desde [`TODO.md`](TODO.md) al terminarse, con
la fecha y lo que efectivamente se hizo — incluidas las desviaciones respecto
de lo planificado, que suelen ser lo más útil de releer.

---

## Batch 1 — Esqueleto Next.js y despliegue en Vercel
**2026-08-06**

## Batch 1 — Esqueleto Next.js y despliegue en Vercel

No existe aplicación. Hace falta la base sobre la que se apoya todo lo demás,
desplegada y accesible por URL, porque los alumnos entran sin instalar nada.

**Alcance** (todo hecho)
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

### Cómo quedó, y en qué se desvió de lo planificado

- **Next 16, no 15.** `next@15.1.3` trae la vulnerabilidad CVE-2025-66478 y npm
  lo avisa al instalar. Se subió a la última, que es 16.3.0. Consecuencias:
  - `next lint` **ya no existe** en 16. El script `lint` llama a `eslint .`
    directamente.
  - `eslint-config-next` publica configuración en formato plano, así que se
    importa sin `FlatCompat`.
  - Next 16 trae su documentación empaquetada en `node_modules/next/dist/docs/`.
    Vale la pena consultarla ahí antes de escribir código: está sincronizada
    con la versión instalada, cosa que un buscador no garantiza.
- **Tailwind 4**, que ya no lleva archivo de configuración: los colores y
  tipografías se declaran en `@theme` dentro de `globals.css`.
- **Tema doble.** Oscuro por omisión y claro respetando el sistema. El oscuro
  no es preferencia estética: un aula a media luz con un proyector en blanco
  encandila. El claro existe para preparar material a plena luz.
- `noUncheckedIndexedAccess` activado en TypeScript. Con contenido que viene de
  YAML, indexar un arreglo y confiar en que hay algo es la forma más fácil de
  reventar en clase.

### Verificado

- `npm run typecheck`, `npm run lint` y `npm run build` limpios
- La página se abre en navegador real, en tema claro y oscuro, sin errores de
  JavaScript

### Pendiente del batch

- **El despliegue en Vercel lo hace Ernesto**: hay que conectar el proyecto a
  `texai/taller-ia-uni` y registrar las variables de `.env.example`.

---

## Batch 2 — Modelo de contenido en YAML y cargador
**2026-08-06**

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

### Cómo quedó

- **`src/lib/tipos.ts`** — los 23 tipos del catálogo como unión discriminada,
  más `Curso`, `Sesion` y `Unidad`.
- **`src/lib/especificacion.ts`** — qué campos exige cada tipo, dirigido por
  datos. Agregar un tipo cuesta una línea acá, una interfaz y un componente.
  Si validar un tipo nuevo exigiera escribir un validador a mano, el catálogo
  dejaría de crecer y la apuesta del producto se cae.
- **`src/lib/contenido.ts`** — carga, valida, resuelve referencias a archivo, y
  filtra lo privado.
- **`scripts/validar-contenido.ts`** — corre dentro de `npm run build`.

### Decisiones que se apartaron de lo previsto

- **La raíz del contenido es un parámetro, no una constante de módulo.** La
  primera versión la fijaba al importar, y las pruebas tuvieron que recurrir a
  `process.chdir`, que con pruebas en paralelo produce fallos que no se
  reproducen. `cargarCurso(raiz)` resolvió el problema y quedó mejor diseño.
- **Los problemas se acumulan y se reportan todos juntos.** Fallar en el
  primero obliga a arreglar y volver a correr una vez por error.
- **Un campo no reconocido es un error, no un aviso.** Casi siempre es un typo,
  y un typo silencioso en el material se descubre proyectado. `destacadu` en
  vez de `destacado` habría dejado la lámina muda.
- **Validaciones propias de tres tipos**, que salieron de pensar cómo fallan:
  - `comando-anotado` comprueba que cada segmento exista en el comando y sea
    inequívoco. Un segmento que aparece dos veces falla como ambiguo en vez de
    elegir uno en silencio.
  - `tabla` comprueba que cada fila tenga tantas celdas como columnas.
  - `pregunta` con `respuesta` correcta pero sin `opciones` falla: una pregunta
    abierta no se corrige sola.

### Verificado

- 18 pruebas, todas pasando. Las tres que más importan comprueban que `notas`,
  `respuesta` y los ítems de `asistencia` **no aparecen en el JSON** que va al
  alumno — serializando y buscando, no inspeccionando el objeto.
- `lint`, `typecheck` y `build` limpios.
- Un YAML roto a mano produce los tres problemas juntos, cada uno con archivo,
  unidad, posición, identificador y campo.

---

## Batch 3 — Estructura completa del curso
**2026-08-06**

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

### Cómo quedó

**8 unidades · 84 ítems · 240 + 240 minutos exactos.**

| Sesión | Unidades | Ítems |
|---|---|---|
| 1 · El mundo y la percepción | repaso 60 · reto‑1 55 · reto‑2 60 · reto‑3 65 | 46 |
| 2 · La arquitectura cognitiva | repaso 25 · reto‑4 105 · reto‑5 60 · cierre 50 | 38 |

### Decisiones de estructura

- **El receso es un ítem, no un bloque suelto.** Vive dentro de la unidad que
  lo precede — al final del reto 1 en la sesión 1, al final del reto 4 en la
  sesión 2. Una unidad "receso" habría partido la jerarquía en dos para
  representar quince minutos de nada.
- **El cierre del sábado son los últimos ítems del reto 3**, no una unidad
  aparte. Diez minutos no sostienen una unidad con objetivos y requisitos.
- **Los minutos de cada unidad cuadran con la suma de sus ítems**, y el
  validador ahora lo comprueba. No es un error de estructura, pero un desajuste
  significa que la unidad no dura lo que dice — y el reloj de la segunda
  pantalla se apoya en ese número.
- **Ningún ítem inventa contenido.** Donde el valor es real —los comandos, los
  umbrales medidos, las 36,567 unidades, el `1.5s` del reentrenamiento— está el
  valor real. Donde falta, dice `Pendiente — batch N` con el número del batch
  que lo escribe. Ver `CONVENTIONS.md` §13.
- **`diagrama-secuencia` estrena su archivo**: `contenido/puml/grafo-agente.puml`
  lleva el recorrido de una corrida en PlantUML, con doce mensajes. Es la fuente
  que el batch 13 va a parsear para el modo enfocado.

### Verificado

- `npm run validar-contenido` carga las dos sesiones sin problemas, y no
  reporta descuadres de minutos.
- 18 pruebas, `lint`, `typecheck` y `build` limpios.

---

## Batch 4 — Renderizadores: familia `contenido`
**2026-08-06**

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

### Añadido al alcance: la vista de revisión

`/curso/[curso]/sesion/[sesion]` muestra la sesión entera de corrido, con todos
los ítems renderizados uno debajo de otro.

**No es la vista de dictado** —esa va de a un ítem, con flechas y sincronía, y
llega con el batch 6— sino una hoja de contactos para escribir material. Ver
ochenta ítems en una sola página es la única forma razonable de darse cuenta de
que dos unidades explican lo mismo, o de que a la tercera hora no queda nada
proyectable.

Muestra el contenido **completo, incluidas las notas privadas**. Es deliberado
y es la razón de que el batch 7 tenga que protegerla; hasta entonces, esa URL
no se comparte. Lleva un aviso visible que lo dice.

La portada también quedó conectada al YAML real: se borró `src/lib/cursos.ts`,
que era un maniquí del batch 1.

### Decisiones

- **El resaltado corre en el servidor.** Shiki resuelve al construir y devuelve
  HTML; al navegador no llega ni una línea de JavaScript para pintar código. En
  una aplicación que se proyecta desde el portátil del docente sobre el wifi de
  un aula, cada kilobyte que no se envía es un problema que no puede ocurrir.
- **Mermaid sí es cliente**, porque dibuja midiendo texto y necesita un DOM. Se
  carga diferido, y un diagrama mal escrito muestra el error y su fuente en vez
  de tumbar la lámina.
- **Un tipo sin renderizador tampoco rompe nada**: sale un aviso que dice cuál
  fue y con qué batch llega. El material se escribe hasta el último minuto, y
  una excepción convertiría un ítem a medio hacer en una clase interrumpida.
- **`transicion` deriva su mapa** de dónde está el ítem, como fija
  `CONVENTIONS.md` §8. Reordenar unidades en el YAML cambia el mapa sin tocar
  el ítem.

### Dos tropiezos, ambos del bundler y del YAML

- **`js-yaml` no publica export por defecto en su paquete ESM.** Funcionaba con
  `tsx` por la interoperabilidad de Node y falló al construir con Turbopack. Se
  cambió a import con nombre.
- **YAML lee `"Algo: otra cosa"` como un mapa, no como texto.** Dos objetivos
  del curso lo tenían, y el síntoma era un error de React —*Objects are not
  valid as a React child*— que no menciona el YAML por ningún lado. Además de
  arreglarlos, el cargador ahora valida que `objetivos` y `requisitos` sean
  texto, y el mensaje explica lo de los dos puntos. Los ocho batches de
  contenido iban a tropezar con esto.

### Verificado

- Las dos sesiones prerenderizan. La página de la sesión 1 mide 20,777 px de
  alto y no tiene errores de JavaScript.
- Los 8 avisos de "sin renderizador" son exactamente los ítems de la familia
  `dictado`, que llegan con el batch 5.
- 18 pruebas, `lint`, `typecheck` y `build` limpios.

---

## Batch 5 — Renderizadores: familia `dictado`
**2026-08-06**

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

### Cómo quedó

Los cuatro tipos de la familia comparten un envoltorio, `Interrupcion`, que
ocupa la pantalla y lleva su propio color. **Interrumpen; no informan** — un
receso que se parece a una lámina más es un receso que la mitad de la clase no
toma.

- **`receso`** — cuenta regresiva y la hora de regreso calculada.
- **`pausa-preguntas`** — pone en pantalla que es el momento, y lista los
  disparadores para cuando nadie dice nada.
- **`asistencia`** — el alumno no llega nunca a este componente: el servidor
  quita el ítem en `cursoParaAlumno`. Solo se dibuja en las vistas del docente.
- **`pregunta`** — la pregunta, las opciones o el campo abierto, y el botón de
  omitir. Enviar la respuesta y contar quién respondió es el batch 10; hasta
  entonces la respuesta se queda en esa pantalla, y el ítem lo dice.

### La aritmética de reloj vive aparte, y con pruebas

`src/lib/reloj.ts` es lo único de esta familia que puede equivocarse en
silencio. Un receso que anuncia mal la hora de regreso divide la clase en dos
grupos que vuelven en momentos distintos, y nadie nota que el error estaba en
un `+ minutos`.

Siete pruebas cubren el cruce de hora, la vuelta a medianoche —para que nunca
salga `24:10` ni `-1:50`— y que una hora ilegible devuelva `null` **en vez de
inventar una**: anunciar una hora equivocada es peor que no anunciar ninguna.

### Un tropiezo con React

La primera versión ponía el estado inicial del reloj en el cuerpo del efecto, y
el linter de React lo rechaza: encadena renders. Reescrito con un solo estado
que escribe únicamente el intervalo, y el primer tic en el siguiente turno del
bucle de eventos. Durante ese instante no se pinta reloj, que es preferible a
pintar la hora del servidor y corregirla al hidratar — la hora del servidor no
significa nada acá.

### Verificado

- La sesión 1 renderiza **los 23 tipos del catálogo**: cero avisos de "sin
  renderizador", donde antes había ocho.
- El receso calcula bien: a las 23:05 anuncia regreso a las 23:20, con la
  cuenta arrancando en 15:00.
- 25 pruebas, `lint`, `typecheck` y `build` limpios, sin errores de JavaScript
  en navegador.

---

## Batch 6 — Vista de dictado y navegación por teclado
**2026-08-06**

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

### Cómo quedó

`/curso/[curso]/sesion/[sesion]` es ahora la vista de dictado: **índice a la
izquierda, un ítem a la vez a la derecha**. La vista de corrido se mudó a
`/revision`, que sigue sirviendo para escribir material.

El índice muestra las unidades con su tipo y minutos, y los ítems con su
duración. Los de la familia `dictado` llevan un rombo ámbar en vez de un punto:
de un vistazo se ve dónde caen los recesos y las pausas.

### Decisiones

- **La URL es la fuente de verdad de la posición**, no un espejo del estado.
  Se lee con `useSyncExternalStore`, que es exactamente para eso: una fuente
  mutable externa a React. La primera versión guardaba la posición en estado y
  la sincronizaba con un efecto; el linter de React lo rechazó por encadenar
  renders, y tenía razón por una segunda razón que el linter no menciona — ese
  diseño rompe el botón de atrás del navegador, que en clase es justo lo que
  uno pulsa al pasarse de ítem.
- **`replaceState`, no `pushState`.** Avanzar de ítem no debe apilar una
  entrada de historial por cada flecha.
- **Las flechas no se le roban a quien está escribiendo.** Si el foco está en
  un campo de texto —respondiendo una pregunta— las flechas mueven el cursor,
  no la clase.
- **El final de la sesión no tira a una pantalla en blanco.** Pulsar de más se
  queda donde está. En clase se pulsa la flecha mirando a la audiencia.
- **Retroceder a un ítem con pasos cae en su último paso**, no en el primero:
  retroceder es deshacer, y quien retrocede quiere ver lo que acaba de pasar.
- Espacio y AvPág/RePág también mueven, porque es lo que hace un presentador
  de diapositivas y lo que envían los mandos a distancia.

### La navegación vive aparte, con pruebas

`src/lib/navegacion.ts`, por la misma razón que el reloj: es lógica que el
docente maneja a ciegas. La prueba que más vale recorre la sesión entera hacia
adelante y vuelve, comprobando que avanzar y retroceder son inversas en cada
posición — un ítem que se salta o un paso que se atasca solo se descubre
dictando.

### Verificado en navegador

- Cinco flechas avanzan cinco ítems, y la URL queda en `item=s1-telemetria`.
- El comando anotado tiene **4 pasos** (3 segmentos más el conjunto completo);
  las flechas los recorren antes de saltar al ítem siguiente, la cabecera dice
  `paso 2/4` y la URL lleva `&paso=1`.
- Retroceder vuelve al paso anterior dentro del mismo ítem.
- 39 pruebas, `lint`, `typecheck` y `build` limpios, sin errores de JavaScript.

---

## Batch 7 — Autenticación del docente en `/profe`
**2026-08-06**

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

### El batch reordenó las rutas, y esa es su parte importante

Hasta acá **todo servía el contenido completo, con notas incluidas**. Ahora hay
dos caras:

| Ruta | Quién | Qué sirve |
|---|---|---|
| `/curso/{c}/sesion/{s}` | Público, estático | La carga del alumno: sin notas, sin respuestas, sin asistencia |
| `/profe/sesion/{s}` | Docente, dinámico | Todo |
| `/profe/sesion/{s}/revision` | Docente, dinámico | Todo, de corrido |

**La ruta del docente es dinámica a propósito.** Una página estática con notas
dentro quedaría en la caché de Vercel al alcance de cualquiera que acierte la
URL, y el middleware no protege lo que ya está servido.

**El filtrado lo hace la ruta, no el componente.** `Dictado` recibe la sesión
ya filtrada y un `modoDocente` que solo cambia enlaces y avisos. Una vista que
decide en el render qué ocultar acaba mostrándolo en el HTML.

### Decisiones

- **`getUser`, no `getSession`.** `getSession` lee la galleta sin comprobar
  nada, y una galleta es precisamente lo que un alumno puede fabricar.
  `getUser` la verifica contra Supabase.
- **Ser docente no es estar autenticado.** Auth es compartida con `gen`, así
  que se compara contra `NEXT_PUBLIC_DOCENTE_UID`. Alguien puede autenticarse
  legítimamente y no dictar este taller; en ese caso se cierra la sesión y se
  lo dice.
- **Un solo mensaje para credenciales malas.** Distinguir "ese correo no
  existe" de "la contraseña no es esa" le regala a quien prueba la mitad de la
  respuesta.
- **Sin configuración, el sitio no se cae.** Falta Supabase → el curso se sirve
  igual y solo la entrada del docente deja de andar, diciéndolo en pantalla.
  Reventar el arranque por una variable ausente convertiría un despliegue mal
  configurado en un sitio caído. Las rutas del docente quedan cerradas, que es
  la lectura segura.
- **El middleware solo cubre `/profe/*`.** Hacer pasar el sitio público por él
  le costaría una llamada a Supabase a cada alumno, para no proteger nada.

### Verificado

- **Sobre el HTML generado**: la página pública de la sesión 1 tiene **cero**
  apariciones de la nota del docente, cero ítems de asistencia y cero
  ocurrencias de la palabra `notas`.
- **Dos pruebas nuevas sobre el contenido REAL del curso**, no sobre uno de
  laboratorio: la carga pública no lleva `notas`, `respuesta` ni ítems de
  asistencia; y la del docente **sí** lleva notas — porque si el filtro
  empezara a vaciar el material para todos, las pruebas de privacidad
  seguirían pasando y nadie lo notaría hasta proyectarlo.
- **Sobre las rutas**: lo público responde 200, `/profe` responde 200 porque es
  el formulario, y `/profe/inicio` y `/profe/sesion/…/revision` responden 307
  hacia `/profe`.
- 41 pruebas, `lint`, `typecheck` y `build` limpios.

### Pendiente de Ernesto

- Deshabilitar el registro en *Authentication → Providers → Email*.
- Crear el usuario en *Authentication → Users* y pasar su `uuid`.
- Registrar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  y `NEXT_PUBLIC_DOCENTE_UID` en Vercel y en `.env.local`.

---

## Batches 8, 9 y 10 — El canal en vivo
**2026-08-07** · verificados en producción

Los tres se implementaron sin poder probarse: la red del contenedor de
desarrollo deniega las conexiones a Supabase. Se verificaron en el despliegue
de Vercel, con el docente en `/profe/sesion/sesion-1` y un alumno en incógnito.

**Funciona:** el docente entra, activa el dictado, y el alumno lo sigue solo.
Con el dictado apagado, el alumno queda libre.

### El fallo que apareció al verlo funcionar

La cabecera del docente decía **"Sin conexión"** mientras el alumno decía
"Siguiendo la clase" — y el alumno lo seguía sin problema. El canal estaba
vivo; mentía el indicador.

Es una carrera de las que no se ven leyendo el código: al reejecutarse el
efecto, el canal anterior emite `CLOSED` mientras se cierra, y ese aviso llega
**después** del `SUBSCRIBED` del canal nuevo. El estado quedaba en
"sin-conexión" con todo funcionando.

Arreglado con una bandera `vigente` que descarta los avisos de un canal ya
limpiado. Se aplica a los seis manejadores, no solo al del estado: una pauta
o una pregunta de un canal muerto tampoco deben entrar.

### Y un segundo problema, encontrado buscando el primero

El docente publicaba su posición **al montar**, antes de que el canal
terminara de suscribirse. Enviar por un canal no suscrito falla y en algunos
casos lo cierra — posible causa concurrente del mismo síntoma.

Ahora la pauta se guarda y se emite en cuanto llega `SUBSCRIBED`. Eso arregla
además algo que nadie había notado: **quien entraba antes del primer
movimiento del docente se quedaba sin pauta** y aterrizaba en el primer ítem.
Con veinte alumnos abriendo la URL a la vez al empezar la clase, eso les habría
pasado a todos.

---

## Batch 11 — Segunda pantalla del docente
**2026-08-07**

En clase, el docente comparte su pantalla por Zoom. Todo lo que necesita para
sí mismo —notas, preguntas que llegan, el reloj— no puede estar ahí.

**Alcance** (todo hecho)
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

### Cómo quedó, y en qué se desvió de lo planificado

- **No es un teléfono: es el segundo portátil.** El docente dicta con dos
  máquinas —una proyecta y se comparte por Zoom, la otra la mira solo él—, así
  que la pantalla se diseñó para un teclado y un monitor: dos columnas en
  pantalla ancha, y las flechas ← → moviendo la clase igual que en la
  principal. Sigue plegándose a una columna, que es lo que la hace utilizable
  desde el teléfono si hiciera falta, pero ese ya no es el caso de uso.
  Consecuencia práctica: el panel de preguntas de los alumnos está **abierto**
  acá, mientras que en la pantalla principal sigue cerrado por omisión. Ahí
  está la mitad de la razón de tener dos máquinas — moderar sin que la clase
  vea quién preguntó qué.

- **Las dos pantallas se escuchan entre sí.** Hasta ahora la del docente solo
  publicaba. Para que el mando mueva la clase, la principal tiene que seguir la
  pauta como la sigue un alumno. Eso trajo tres consecuencias, y ninguna era
  obvia:

  1. **`broadcast: { self: false }`** en el canal. Sin eso, publicar y escuchar
     en el mismo cliente es un bucle.
  2. **La principal no reemite lo que le acaba de llegar.** Al moverse por una
     pauta recibida volvía a publicar la misma posición con una marca de tiempo
     más nueva — que es exactamente la que pisaría el movimiento siguiente si
     el docente pulsa dos veces seguidas en el mando. Ahora compara `itemId`,
     `paso` y `enVivo` con la pauta vigente antes de publicar.
  3. **`publicar` devuelve la pauta que emitió.** El mando decide su posición
     tomando la más reciente entre lo que él mandó y lo que llegó del canal, y
     esa comparación solo es correcta si las dos marcas de tiempo salen del
     mismo sitio.

- **El interruptor de "Dictando / Ensayando" también está en los dos lados**, y
  por lo mismo se resolvió igual: gana el más reciente. Antes era estado local
  de la pantalla principal, y habría vuelto a imponer su valor cada vez que el
  mando cambiara el suyo.

- **El mando no se mueve a ciegas.** Al abrirlo todavía no sabe dónde va la
  clase, y avanzar desde una posición supuesta arrastraría a todos al segundo
  ítem. Los controles de avance y retroceso quedan deshabilitados hasta que
  llega la primera pauta, con un botón aparte —"Empezar desde el principio"—
  para el caso legítimo de ser el primero en abrir la sesión. Saltar por el
  índice sí funciona desde el arranque: elegir un ítem de la lista es decir a
  dónde ir, no moverse desde donde uno cree que está.

- **La pregunta al vuelo viaja entera por el canal.** La pauta solo sabe
  señalar ítems que existen en el YAML, así que una pregunta improvisada no
  cabía ahí. Se agregó `PreguntaViva` y el evento `pregunta-viva`, y en las
  pantallas se dibuja **reutilizando el mismo componente `Pregunta`** de un
  ítem del material: así hereda gratis los tres estados —respondiendo,
  revelado, en vivo— y no hay un segundo camino por el que unos resultados
  puedan filtrarse antes de tiempo. Las respuestas y el revelado usan la
  maquinaria existente sin cambios.
  - Limitación aceptada: viaja solo por broadcast, no por presence. Quien
    recargue la página con una pregunta lanzada en pantalla no la verá. Meterla
    en presence obligaría a que la presencia del docente cargara dos cosas
    distintas y a decidir cuál gana al cerrarse una; no vale ese precio para
    algo que dura dos minutos.

- **El reloj salió de aritmética probada, no de un `Date` en el componente.**
  `minutosEntre` y `comoDuracion` en `reloj.ts`; `minutosDeSesion` y
  `minutosHasta` en `navegacion.ts`. Los cuatro con tests. El reloj muestra
  cuánto queda de sesión, lo planificado contra lo transcurrido —"holgura" en
  verde, "atrasado" en ámbar— y cuánto lleva en pantalla el ítem actual.
  - **Cuánto lleva el ítem sale de `pauta.momento`**, no de un cronómetro
    local: es el instante en que la clase llegó ahí, publicado por la pantalla
    que se movió. Funciona igual aunque el mando se abra a mitad de sesión.
  - `minutosEntre` **no da la vuelta al reloj**. Antes de la hora de inicio
    devuelve negativo, porque "−30 min" es información y "23 h 30 min" es un
    error escondido.
  - Una sesión sin `horaInicio` u `horaFin` legibles muestra "—" en vez de un
    reloj inventado, igual que `horaDeRegreso`.

- **Los minutos se declaraban dos veces, y eso resultó ser el error.** La
  unidad llevaba su presupuesto —el del reparto de las ocho horas— y cada ítem
  su estimación. `minutosDe` prefería el presupuesto; el reloj recién escrito
  sumaba ítems. Dos pantallas del mismo curso a punto de anunciar totales
  distintos.
  - El primer arreglo fue reconciliar las dos cifras: presupuesto para las
    unidades cerradas, ítems acotados dentro de la que está en curso. Funciona,
    pero mantiene vivas dos fuentes para el mismo número.
  - **El arreglo definitivo fue quitar una.** Los minutos los declara solo el
    ítem y todo lo que lo contiene suma (`CONVENTIONS.md` §15). `Unidad` perdió
    el campo, el cargador rechaza un YAML que lo declare, y los ocho `minutos:`
    de nivel unidad salieron de los dos YAML — cuadraban exactamente con sus
    ítems, así que no se perdió nada.
  - `minutosDeUnidad`, `minutosDeSesion` y `minutosHasta` viven en
    `navegacion.ts` (puras, sin `node:fs`, usables en el navegador) y
    `contenido.ts` reexporta la primera como `minutosDe`.
  - `scripts/validar-contenido.ts` vigilaba el descuadre entre las dos cifras.
    Que hiciera falta un vigilante era la señal de que sobraba una: ahora
    compara la suma de los ítems contra lo que dura la sesión según su
    `horaInicio` y `horaFin`, que sí son dos cosas distintas.

**Verificación**
- `npm test` (61 pasan), `npm run typecheck`, `npm run lint` y `npm run build`
  limpios.
- La verificación en vivo la hace el docente en producción: la política de red
  de este contenedor bloquea la salida hacia Supabase, la misma limitación que
  tuvieron los batches 8, 9 y 10.

---

## Batch 12 — Reloj de sesión y avisos de tiempo
**2026-08-07**

Cuatro horas se van rápido, y el receso se olvida. El batch 11 dejó el reloj;
este deja los avisos — el reloj informa, pero no interrumpe, y lo que se olvida
es justo lo que nadie mira.

**Alcance** (todo hecho)
- [ ] Aviso cuando toca el receso según la hora, no solo según la posición
- [ ] Aviso cuando una **unidad** se está pasando de sus minutos
- [ ] Aviso cuando el desvío acumulado pasa de un umbral, con qué recortar
- [ ] Todo esto solo en el mando; el proyector no lo muestra

---

### Cómo quedó, y en qué se desvió de lo planificado

- **Toda la lógica en `src/lib/avisos.ts`, pura y probada.** `avisosDeTiempo`
  recibe la sesión, la posición y la hora, y devuelve una lista ordenada de lo
  más urgente a lo menos. Vive fuera de los componentes por lo mismo que
  `reloj.ts`: es de lo poco que puede estar mal sin que se note. **Un aviso que
  salta cuando no toca se aprende a ignorar en diez minutos**, y a partir de ahí
  tampoco sirve el que sí toca. 14 tests.

- **Tres avisos, y ninguno duplica al otro:**
  - *Receso*, por la **hora** y no por la posición. La posición ya se ve en el
    índice; lo que no se ve es que son las 16:52 y el receso era a las 16:40,
    porque justamente se está explicando algo. Solo el primero que quede por
    delante — avisar de los dos recesos del día a la vez no ayuda a nadie.
  - *Unidad*, cuando pasó la hora a la que debía cerrar. Dice cuál y cuánto.
  - *Desvío acumulado*, a partir de 10 minutos (urgente a los 20), **con qué
    recortar**: las unidades que quedan por dictar, ordenadas de la más cara a
    la más barata. Un aviso que dice "vas tarde" sin decir qué soltar es un
    aviso que solo agrega ansiedad.

- **Apareció una pieza que no estaba en el alcance: la hora cero.** El primer
  esbozo medía contra `horaInicio`, la del sílabo. Probado contra el contenido
  real, la conclusión fue inmediata: casi ninguna clase empieza a la hora
  programada, y medir contra una hora que no ocurrió convierte el reloj en
  ruido — diría "12 min de atraso" durante cuatro horas por algo que pasó
  mientras la gente se conectaba, y que ya nadie puede recuperar. El mando
  tiene ahora un botón **"Empezamos ahora"**, y a partir de ahí todo se mide
  desde ahí.
  - Se guarda en `localStorage` (recargar el mando no debe perderla) y se lee
    con `useSyncExternalStore`, que es lo que `localStorage` es: una fuente
    mutable externa a React. De paso, escuchando `storage`, dos pestañas del
    mando coinciden.
  - `avisosDeTiempo` recibe `inicio` como parámetro y no sabe de dónde salió.
    El test que lo fija es que la misma clase corrida diez minutos produce
    exactamente los mismos avisos.

- **El tic del reloj se subió a `Mando`.** Antes vivía dentro del componente
  `Reloj`; ahora el reloj y los avisos leen el mismo segundo, porque dos
  intervalos independientes acaban mostrando horas distintas en la misma
  pantalla.

- **El panel de avisos no existe cuando no hay nada que decir.** Un panel
  permanente que dice "todo en orden" deja de leerse a los veinte minutos, y
  entonces tampoco se lee el día que dice otra cosa.

**Comprobado contra el contenido real del curso**
El receso del sábado cae a las 16:40. Con la clase detenida en el primer ítem a
las 16:55, el mando dice: *«El receso tocaba a las 16:40 — van 15 min de más
antes de pararlo»*, *«"Dónde encaja esto, y la flota de 192 modelos" se pasó 55
min»* y *«100 min de atraso acumulado»* con las tres unidades restantes
ordenadas por lo que cuestan.

**Verificación**
- `npm test` (74 pasan), `npm run typecheck`, `npm run lint` y `npm run build`
  limpios.
- Falta verlo en clase, que es donde se sabe si los umbrales están bien puestos.

---

## Batch 13 — Diagramas de secuencia PlantUML, recorribles
**2026-08-07**

Un diagrama de secuencia proyectado entero es una maraña. Nadie sigue nueve
flechas a la vez, y el que se pierde en la tercera ya no vuelve.

**Alcance** (todo hecho, salvo una desviación grande — ver abajo)
- [ ] Tipo `diagrama-secuencia` con la fuente en PlantUML
- [ ] ~~Render a imagen en tiempo de construcción~~ → se dibuja en SVG
- [ ] Parser del subconjunto: participantes, mensajes, activaciones, notas
- [ ] Modo enfocado, un mensaje a la vez, el resto atenuado
- [ ] `explicacion` por mensaje, visible al enfocarlo
- [ ] El primer paso muestra el diagrama completo
- [ ] Se apoya en los pasos del batch 6
- [ ] ~~`npm run diagramas`~~ → no hace falta

---

### La desviación: no se genera ninguna imagen

El plan era `plantuml.jar` en construcción para el diagrama completo, y un
dibujo propio solo para el recorrido enfocado. **Son dos dibujantes distintos
para la misma figura, y el cambio de uno al otro ocurre EN MEDIO del ítem,
delante de la clase**: se pulsa la flecha y el diagrama cambia de tipografía,
de colores y de proporciones. Eso solo se ve al montarlo, y no hay forma de
arreglarlo manteniendo los dos.

Así que el dibujo es todo nuestro, en SVG, desde lo que leyó el parser. Lo que
se gana además de la coherencia:

- Sin `plantuml.jar`, sin contenedor y sin Kroki. Java existe en este
  contenedor de desarrollo, pero no en Vercel.
- Sin carpeta de imágenes versionadas que pueda quedar desfasada de su fuente.
  Ese desfase es invisible hasta que se proyecta.
- Sin servicio externo en mitad de una clase, que era la condición no
  negociable del batch.

PlantUML sigue siendo el formato de escritura, que es para lo que sirve:
escribir trece flechas en texto es mucho mejor que maquetarlas.

### El parser

`src/lib/plantuml.ts`, puro, 16 tests. Participantes (con y sin alias,
declarados o inferidos de una flecha), mensajes (`->` y `-->`, y de alguien a
sí mismo), notas (de una línea y de varias, ancladas al mensaje que las
precede) y activaciones como rangos de mensajes.

**Lo que no entiende, falla nombrando la línea** — y falla al cargar el
contenido, no en clase. `loop`, `alt`, `group`, `par` y todo lo demás de
PlantUML producen un error con el número de línea y su texto. Un parser que
ignora en silencio lo que no comprende dibuja un diagrama al que le faltan
flechas, y eso se descubre proyectado. Reporta todas las líneas malas juntas,
como el resto del cargador.

### Tres cosas que aparecieron al hacerlo

- **`Secuencia.notas` chocaba con `notas`.** El test de privacidad —el que
  comprueba que las notas del docente no llegan al alumno— falló porque busca
  la cadena `"notas"` en la carga y encontró las notas de PlantUML. Se
  renombró a `anotaciones`. La colisión no era solo del test: en este proyecto
  "notas" significa *lo que no se proyecta*, y usar la misma palabra para algo
  que sí se proyecta es pedir el error.

- **El esqueleto tenía 12 explicaciones para 13 mensajes**, y nadie lo había
  notado. Las explicaciones van por índice, así que una de menos no deja un
  hueco: corre todas las demás un lugar y cada mensaje queda explicado con el
  texto del siguiente. El cargador ahora **exige** que la cuenta coincida, y
  cada explicación puede llevar `texto` como ancla — que es lo que detecta el
  caso que la cuenta no ve: dos flechas reordenadas.

- **`pasosDe` contaba las explicaciones, no los mensajes.** Con eso, olvidar
  una explicación escondía un mensaje entero del recorrido, y nadie repara en
  el mensaje que nunca se mostró. Ahora cuenta los mensajes de la fuente.

### Y dos que solo se vieron mirándolo en el navegador

- El lazo de `Accion -> Accion` sale hacia la derecha con su etiqueta, y como
  `Accion` es el último participante, el texto quedaba **cortado por el borde
  del lienzo**. El ancho ahora cuenta ese desborde.
- Con trece mensajes, el diagrama a tamaño natural dejaba la explicación
  debajo del pliegue: en clase eso significa desplazar la página con la sala
  mirando. El SVG tiene tope de altura, y es mayor en el paso 0 —donde no hay
  texto debajo— que en los pasos enfocados.

**Verificación**
- `npm test` (95 pasan), typecheck, lint y build limpios.
- Comprobado en el navegador, con capturas del paso 0 y del paso 8 sobre el
  diagrama real del curso.

---

## Batch 14 — Comandos anotados parte por parte
**2026-08-07**

`docker compose run --rm -e EJECUTAR_ACCIONES=1 agente python -m agente run
--verboso` son doce palabras que un alumno lee como un bloque opaco. Cada una
está ahí por una razón, y esa razón es justamente lo que hay que enseñar.

**Alcance** (todo hecho)
- [ ] Tipo `comando-anotado`: el comando completo, más una lista de segmentos
- [ ] Cada segmento con su explicación y qué otros valores admite
- [ ] Modo enfocado, con una llave señalando la parte, al estilo ASCII
- [ ] El resto queda visible pero atenuado: la parte **sin perder el todo**
- [ ] Los segmentos se declaran por texto, no por índice de caracteres
- [ ] Un segmento que no aparece falla en validación
- [ ] Se apoya en los pasos del batch 6
- [ ] Funciona con comandos de más de una línea

---

### Cómo quedó

- **`src/lib/anotaciones.ts`, puro, 14 tests.** `ubicar` dice dónde cae un
  texto —desplazamiento, línea y columna—, `trocear` parte el comando en
  trozos marcando cuáles son segmentos, `llave` dibuja el señalador y
  `solapamientos` detecta dos partes que se pisan.

- **La llave se dibuja con caracteres, no con CSS.** El comando va en
  monoespaciada, así que contar columnas alinea exacto — y una llave que no
  queda debajo de su parte es peor que ninguna llave. De paso es como se anota
  en un terminal, que es donde el alumno va a ver estos comandos.

- **`trocear` devuelve los trozos en el orden del COMANDO**, no en el que están
  escritos en el YAML. Quien escribe el material anota primero lo que le parece
  más importante, y eso no tiene por qué ser la primera palabra.

- **Un segmento inexistente se ignora al trocear**, no rompe. El cargador ya
  falló por él con un mensaje mejor; que la lámina reviente además solo empeora
  el momento en que se descubre.

- El paso 0 lista todas las anotaciones —el mapa antes del recorrido, igual que
  en el diagrama de secuencia— y del 1 en adelante queda solo la de la parte
  enfocada, grande.

### Dos cosas que se agregaron sobre lo planificado

- **Segmentos que se solapan ahora fallan al cargar.** El alcance pedía
  detectar el que no aparece y el ambiguo; faltaba el tercer caso, que es peor
  porque no da ninguna señal: si un segmento se traga a otro, esa explicación
  nunca llega a enfocarse y lo único que se ve es un paso que parece repetido.

- **El comando se encoge para caber, en vez de desplazarse.** Noventa
  caracteres no entran a 17px, y una barra horizontal es la peor salida
  proyectando: hay que arrastrar con el ratón delante de la clase, y media
  instrucción queda fuera justo cuando se explica la otra media. Envolver
  rompería la alineación de la llave; encoger no, porque la llave usa la misma
  tipografía y se encoge con él. El tamaño sale del largo de la línea más
  larga, acotado entre 11 y 19 px.

**Verificación**
- `npm test` (112 pasan), typecheck, lint y build limpios.
- Comprobado en el navegador sobre el comando real del curso, y **también con
  una versión temporal del mismo comando partida en tres líneas con `\`**,
  para ver que la llave cae bajo la línea que le toca y respeta la sangría.

---

## Batch 15 — Contenido · S1·U1 `repaso` — Dónde encaja esto, y la flota de 192 modelos
**2026-08-07**

La primera unidad escrita de verdad. Sitúa el taller en el programa y hace que
la clase entienda qué es vigilar 192 modelos desplegados, antes de que aparezca
ningún agente.

**Criterios de aceptación** (todos cumplidos)
- [ ] Artefacto entrenado, y por qué modelo↔contenedor no es 1 a 1
- [ ] Los 192 modelos vienen dados y no se tocan
- [ ] El rescate de entornos rotos, dentro de la unidad
- [ ] `cobertura`, `MAPE` y `sesgo` definidos antes de usarlos
- [ ] `objetivos` y `requisitos` escritos
- [ ] Los minutos suman los 60 de la unidad
- [ ] `notas` privadas donde lo amerita
- [ ] La validación de contenido pasa

---

### Cómo quedó

**21 ítems, 60 minutos exactos.** El esqueleto tenía 12 ítems de ~5 minutos
cada uno; la §13 pide entre dos y cuatro, y partirlos no fue relleno: casi
todos los ítems del esqueleto eran tres cosas juntas. `s1-metricas-definidas`
declaraba "MAPE, sesgo y cobertura" en una sola lámina de cinco minutos, y las
tres definiciones son justamente lo que el resto de la sesión usa — ahora son
tres ítems, uno por métrica, y el del sesgo es una `comparacion` contra el MAPE
porque la diferencia entre los dos ES el contenido.

**El rescate quedó como tres `error-comun` en medio de la unidad**, después de
`make arriba` y antes de la telemetría — no como un bloque aparte al principio.
Salen de las incidencias reales registradas al preparar el laboratorio: el
motor de Docker cerrado (W1/T5), el contenedor sirviendo el código con el que
arrancó (T1) y el disco lleno (T3). El segundo lleva nota privada explicando
que apareció tres veces con tres caras distintas y era el mismo error.

**`s1-modelo-vs-contenedor` es nuevo y hace el trabajo del criterio más difícil
de cumplir.** Una `comparacion`: a la izquierda lo que la clase vio en el
taller de Docker y Kubernetes —una imagen, un modelo, un endpoint— y a la
derecha lo de acá: una imagen, 192 modelos, ningún endpoint. Decirlo como prosa
no funcionaba; puesto en dos columnas se ve solo.

**`s1-donde-estamos` se ancló a algo verificable.** Antes decía "Fundamentos,
MLOps, despliegue, generativa y agentes", que es una lista que no se puede
comprobar. Ahora engancha con lo que sí consta: el taller de Docker, GitHub
Actions y Kubernetes del mismo programa —cuyo último bloque es "monitoreo
básico y operación de modelos en producción", y este taller empieza donde lo
básico deja de alcanzar— y con MLflow, que el propio laboratorio documenta como
"el mismo registro que usaron en el Módulo 2".

### Decisiones sobre las cifras

- **No se adelanta ningún número del reto 1.** El caso menciona la campaña
  promocional y el sesgo silencioso como historias, sin las cifras. El
  13.8% → 14.5%, el 7 → 14 de 192 y el sesgo × 6 son el golpe de la unidad
  siguiente, y darlos acá lo desactiva.
- **`17,472` lleva su explicación en las notas**: 192 modelos × 91 días. Es el
  número que sale en pantalla al hacer `make seed`, y un alumno que vea otro
  casi seguro dejó el mundo roto de una prueba.
- **Una cifra del material de origen quedó fuera.** El `README.md` del
  laboratorio dice "los otros 152 modelos nadie los mira", y esa resta no cierra
  con "las cinco categorías más grandes" (5 × 24 = 120, que dejaría 72). En vez
  de propagar un número que no se puede reconstruir, el ítem dice "el resto no
  lo mira nadie". **Queda pendiente que el docente decida el número correcto.**

### Un error del componente, encontrado escribiendo contenido

El diagrama de componentes usaba `-.registro.->` para etiquetar una arista de
Mermaid, y Mermaid renderizó **"registr"** — se comió la última letra al partir
el token. Se cambió a la forma `-.->|registro|`, que no es ambigua. Solo se ve
mirando el diagrama; ninguna validación lo habría atrapado.

**Verificación**
- `npm run validar-contenido` pasa: 55 ítems en la sesión 1, 240 minutos.
- `npm test` (112), typecheck, lint y build limpios.
- Comprobado en el navegador: el diagrama de componentes, la comparación del
  sesgo, un `error-comun` de rescate y el `modelo-datos` de la telemetría.

---

## Batch 16 — Contenido · S1·U2 `reto` — Encontrar el problema a mano
**2026-08-07**

Que sientan en el cuerpo que revisar 192 modelos a mano no escala, y que la
métrica que estaban mirando no era la que hablaba de plata.

**Criterios de aceptación** (todos cumplidos)
- [ ] El escenario visible se resuelve rápido; el silencioso no se resuelve
- [ ] La pregunta del cierre es cuánto tardarías haciendo esto cada mañana
- [ ] No se adelanta la solución: acá solo se sufre el problema
- [ ] `objetivos` y `requisitos` escritos
- [ ] Los minutos suman los 55 de la unidad (40 de contenido + el receso)
- [ ] `notas` privadas donde lo amerita
- [ ] La validación de contenido pasa

---

### Antes de escribir: se auditaron las cifras del caso

El docente pidió cuadrar los números. Se corrió el pipeline completo del
laboratorio **dos veces**, con el mundo anclado al 7 y al 12 de agosto, para
separar lo que está medido de lo que además es reproducible.

| | mundo 7-ago | mundo 12-ago | material |
|---|---|---|---|
| MAPE flota sana | 13.78% | 13.82% | 13.8% ✓ |
| MAPE flota rota | 14.47% | 14.45% | 14.5% ✓ |
| sesgo sano | +0.80% | +0.64% | +0.7% ✓ |
| sesgo roto | +4.73% | +4.65% | +4.7% ✓ |
| unidades de más | 36,981 | 36,338 | 36,567 ✗ |
| modelos sobre umbral | 8 → 16 | 8 → 16 | 7 → 14 ✗ |

- **El MAPE y el sesgo son sólidos** y se usan tal cual. El sesgo de la fila es
  el cociente de totales, no el promedio de porcentajes — el promedio da +2.9%
  y +6.6%, y confundirlos cambiaría la tabla.
- **Las unidades no son reproducibles.** `datos.py` genera el mundo contra
  `date.today()`, así que cada alumno tiene el suyo según el día en que corrió
  `make seed`. La métrica dice **36,000** y la nota privada lleva el rango
  medido.
- **El "7 a 14" no se pudo reproducir**, y además **no hay ningún umbral
  definido en el código**. Con MAPE > 25% se mide 8 → 16 en los dos mundos. Lo
  que se sostiene —y lo que enseña— es que se duplican. La fila se conserva con
  las cifras del docente y la nota explica por qué la pantalla del alumno puede
  decir otra cosa.
- **El "152" no cerraba.** "Revisa las cinco categorías más grandes" son 5 × 24
  = 120 modelos vigilados, que dejarían 72 sin mirar. Los 152 salen de cinco
  **tiendas**: 5 × 8 = 40. Se corrigió la frase y no el número, en los dos
  `README.md` del laboratorio (commit aparte en `texai/taller-ia-uni-lab`).

### Cómo quedó la unidad

**14 ítems: 40 minutos de contenido más el receso de 15.** El esqueleto tenía
11, y los dos que faltaban son los que sostienen el arco: `s1-r1-visible` —una
métrica que dice "cinco minutos, una categoría, encontrada a ojo"— y
`s1-r1-a-mano-2`, la segunda búsqueda, la que no encuentra nada.

**El arco es sufrir, no resolver.** Escenario visible → se resuelve fácil →
bajar las expectativas a propósito → escenario silencioso → diez minutos sin
encontrar nada → recién ahí la tabla. Las notas privadas insisten dos veces en
no adelantar la pista del sesgo: si sale antes, la tabla deja de golpear.

**`s1-r1-a-mano` lleva medido lo que van a ver** en la nota privada: el MAPE de
la flota sube de 13.8% a 16.0%, bebidas pasa de 12.9% a 30.8% y 18 de sus 24
tiendas cruzan el 20%. Y el sesgo de bebidas se va a **−32%**: la promoción
disparó la venta real y el modelo pronosticó de menos. El signo contrario al
del escenario silencioso, que es lo que después hace que la respuesta correcta
de la pregunta sea "ninguno de los dos solo".

**La pregunta pública ahora tiene `respuesta`.** El esqueleto no la traía. Es
"ninguno de los dos solo", y casi nadie la elige antes de discutirla — un
umbral sobre el sesgo tampoco alcanza, porque la campaña lo movió en la
dirección opuesta y una tienda muda no mueve ninguna de las dos.

**Verificación**
- `npm run validar-contenido` pasa: 58 ítems en la sesión 1, 240 minutos.
- `npm test` (112), typecheck, lint y build limpios.
- Comprobado en el navegador: la tabla de las dos degradaciones con su fila
  resaltada, el comando anotado de la API y la comparación de las dos señales.

---

## Batch 17 — Contenido · S1·U3 `reto` — La herramienta de percepción
**2026-08-07**

Que entiendan que la calidad de un agente se decide **antes** del LLM: si la
percepción miente, no hay arquitectura que lo salve.

**Criterios de aceptación** (todos cumplidos)
- [ ] Las tres trampas explicadas con cifras medidas, no en abstracto
- [ ] Se explica por qué el umbral de tienda es más alto que el de categoría
- [ ] El criterio de aceptación es verificable por el alumno sin preguntar
- [ ] `objetivos` y `requisitos` escritos
- [ ] Los minutos suman los 60 de la unidad
- [ ] `notas` privadas donde lo amerita
- [ ] La validación de contenido pasa

---

### 18 ítems, 60 minutos

El esqueleto tenía 11. Los siete nuevos son casi todos consecuencia de una
decisión: **cada trampa se explica con su medición al lado**, no como
advertencia.

- `s1-r2-sesgo-tabla` — las ocho categorías de la flota sana, con el sesgo
  calculado de las dos maneras. **Ninguna infla hacia abajo.** Ese es el
  argumento: no es ruido, es un sesgo sistemático de la cuenta. Panadería es el
  extremo, +9.4% promediando porcentajes contra +6.7% por cociente de totales.
- `s1-r2-envejecimiento` — el +20% de MAPE que la peor categoría se mueve sola
  en un mundo intacto. Es la cifra que justifica el umbral de 25%, y sin ella
  "significativo no es relevante" es una frase bonita.
- `s1-r2-umbrales-elegidos` — los `UMBRALES` del laboratorio, para comparar
  fila por fila contra la tabla de máximos medidos.
- `s1-r2-tres-reglas`, `s1-r2-sesgo-codigo`, `s1-r2-por-que-tienda`,
  `s1-r2-banderas` completan el arco.

### Las cifras, verificadas

Se corrió el pipeline sobre el mundo sano y se recalculó todo lo que la unidad
afirma:

| dimensión | modelos/grupo | máx Δ MAPE medido | documentado | máx Δ sesgo medido | documentado |
|---|---|---|---|---|---|
| categoría | 24 | +20.8% | +19.6% | 1.06 pp | 1.05 pp |
| región | 8 a 112 | +15.0% | +15.2% | 2.41 pp | 2.31 pp |
| tienda | 8 | +51.3% | +48.4% | 3.21 pp | 3.54 pp |

Coinciden en forma y en orden de magnitud; las diferencias son el mismo
corrimiento por fecha del batch 16. **La estructura, que es lo que enseña, se
sostiene exacta**: tienda se mueve dos veces y media más que categoría en MAPE
y tres veces más en sesgo, sin que nada esté roto.

**Región resultó ser heterogénea** y la tabla lo dice: LIMA tiene 14 tiendas y
112 modelos, ORIENTE tiene una y ocho. Su columna no es un número solo.

**Apareció el umbral que faltaba en el batch 16.** El "7 a 14 modelos sobre el
umbral" no decía cuál era el umbral, y no estaba en `escenario.py`. Está en
`herramientas.py`: `modelos_con_mape_sobre_25`. Es 25% — exactamente el que se
había usado para medir 8 → 16.

**La cifra del brief que no cerraba.** El batch pedía "el caso de panadería a
+9.2% contra +0.7%". Medido, panadería da +9.4% promediando porcentajes y
+6.7% por cociente de totales; el +0.7% es el sesgo de la **flota**, no el de
panadería. La tabla usa lo medido, que además es más fuerte: las ocho
categorías inflan, entre +1.1 y +3.4 pp.

### Y un fallo del renderizador, encontrado acá

Con la consola abierta se vio que **todos los ítems `codigo` dejan la página en
blanco al hidratar**, incluidos los del esqueleto original. Está arreglado en
un commit aparte, junto con `npm run humo`, que abre las 122 pantallas del
curso en un navegador de verdad.

**Verificación**
- `npm run validar-contenido` pasa: 65 ítems en la sesión 1, 240 minutos.
- `npm run humo`: 122 pantallas, 0 con error.
- `npm test` (112), typecheck, lint y build limpios.

---

## Batch 18 — Contenido · S1·U4 `reto` — El primer agente, sin arquitectura
**2026-08-07**

Ver fallar a un agente que **funciona**. Es diagnóstico, no construcción — y es
la pregunta que abre la sesión 2. Con esto la sesión del sábado queda escrita
entera.

**Criterios de aceptación** (todos cumplidos)
- [ ] Queda claro que el agente funciona: llama herramientas y encuentra cosas
- [ ] Las patologías se muestran con salidas reales, no descritas
- [ ] La unidad cierra con una pregunta abierta, no con una respuesta
- [ ] `objetivos` y `requisitos` escritos
- [ ] Los minutos suman los de la unidad
- [ ] `notas` privadas donde lo amerita
- [ ] La validación de contenido pasa

---

### 14 ítems, 65 minutos

**El brief decía 55 y la estructura reserva 65.** Lo cazó la comprobación que
el batch 15 agregó a `validar-contenido`: los ítems de la sesión sumaban 230 y
la sesión dura 240. Los diez minutos que faltaban fueron a donde más rinden —
la comparación de las tres corridas pasó de 8 a 12— y el resto se repartió en
las patologías, las citas y la pausa.

### La decisión de fondo: primero decir que funciona

`s1-r3-que-hace-bien` es nuevo y no estaba en el esqueleto. Llama las
herramientas correctas sin que nadie le diga cuáles, encadena, encuentra cosas
de verdad y suena convincente — con veinte líneas y ninguna arquitectura.

Sin ese ítem la clase sale creyendo que ReAct es malo, y esa es la lección
equivocada: ReAct es un piso muy alto por muy poco código. El problema aparece
cuando hay que confiar en él sin mirar.

### Las citas son literales, y se dice de dónde salen

Las dos `cita-agente` son transcripciones de `retos/incidencias.md`, no
paráfrasis. Y las dos llevan una advertencia honesta en sus `notas`: **el
agente dijo eso reflexionando sobre su propio diagnóstico**, o sea con un nodo
que el bucle pelado no tiene. Es material real de la patología y a la vez un
adelanto de lo que se construye mañana, y confundirlo sería vender como salida
del ReAct algo que no lo es.

La primera es la mejor del taller: *"Dije '9,436 unidades de sobre-stock' pero
eso es el error acumulado del pronóstico"*. El número era real y la frase era
falsa — que es exactamente lo que hace peligrosa a esa patología.

### Otras decisiones

- **`s1-r3-divergencia` es nuevo** y dice qué diverge exactamente: por dónde
  entró, dónde paró, y qué severidad puso. Las tres corridas son *defendibles*;
  no es que una acierte. La frase que sostiene la unidad —"ninguna sabe cuándo
  tiene suficiente evidencia"— vive acá, y mañana tiene nombre: reflexión.
- **Temperatura cero, dicho en voz alta.** La reacción natural en clase es
  "bájale la temperatura", y ya está en cero. Lo que varía no es el muestreo,
  es por dónde entró a mirar.
- **La tabla de patologías ganó una tercera columna, "qué cuesta"**, y resalta
  la de dramatizar: un agente que se equivoca en el diagnóstico se corrige; uno
  que infla el impacto entrena a todos a desconfiar también de los números
  correctos.
- **La pregunta no lleva `respuesta` a propósito.** Tres de las cuatro opciones
  son piezas reales de lo de mañana, y la cuarta —el prompt más largo— es la
  que hay que discutir.
- **El bucle del ítem `codigo` está completo**, no insinuado: son doce líneas y
  ahí está todo ReAct.

**Verificación**
- `npm run validar-contenido` pasa: 67 ítems en la sesión 1, 240 minutos, sin
  avisos.
- `npm run humo`: 124 pantallas, 0 con error.
- `npm test` (112), typecheck, lint y build limpios.

---

## Batch 19 — Contenido · S2·U1 `repaso` — Qué le faltaba al bucle de ayer
**2026-08-07**

Recuperar el hilo tras una noche, y convertir las cuatro patologías del sábado
en el planteamiento de la arquitectura.

**Criterios de aceptación** (todos cumplidos)
- [ ] Se puede seguir sin haber estado el sábado
- [ ] Cada patología se empareja con la capa que la resuelve
- [ ] No se explica el grafo todavía: solo se presenta
- [ ] `objetivos` y `requisitos` escritos
- [ ] Los minutos suman los 25 de la unidad
- [ ] `notas` privadas donde lo amerita
- [ ] La validación de contenido pasa

---

### 8 ítems, 25 minutos

**`s2-para-quien-no-vino` es el ítem que cumple el criterio difícil.** Tres
minutos cronometrados con el caso y el problema, no con la historia del sábado.
La nota privada lo dice explícito, porque la tentación real en clase es
recontarlo todo: quien no vino no necesita el relato, necesita saber que hay
192 modelos, que hay una forma de fallar que no suena, y que dos corridas del
mismo mundo dan dos diagnósticos distintos.

### El emparejamiento, que es el corazón de la unidad

La tabla ganó una tercera columna —**cómo** lo resuelve— porque nombrar la capa
sin decir el mecanismo no enseña nada:

| patología | capa | cómo |
|---|---|---|
| Concluye con lo primero | Reflexión | Intenta refutar; si falta evidencia, devuelve el control a percepción |
| Ordena por la ruidosa | Percepción | La herramienta ordena por la señal cara y pone el recuento primero |
| Dramatiza | **Reflexión + revisión** | Cuestionarse no basta: hace falta poder reescribir |
| Redescubre lo mismo | Memoria | Consulta el historial antes de diagnosticar, y lo escribe después |

La tercera fila está resaltada porque es la que explica por qué hay dos capas y
no una — **cuestionarse sin poder corregirse no sirve de nada**, que es la
tesis de la unidad siguiente.

Y la nota privada señala lo que la tabla no puede: **falta una capa**. La
acción no arregla ninguna patología, es capacidad nueva y trae sus propios
problemas. Es el reto 5.

### El grafo, y una decisión de dibujo

`s2-que-no-es` es nuevo y responde a la objeción que siempre aparece: qué es
"una capa" y en qué se diferencia de una instrucción mejor. La respuesta que
funciona no es conceptual sino práctica — **a un prompt no se le puede
preguntar si lo cumplió; a un nodo sí**.

El diagrama se dibujó dos veces. La primera versión ponía la memoria con dos
aristas —una hacia `diagnostico` y otra desde `recomendacion`—, que es lo que
de verdad pasa, pero eso forma un ciclo y Mermaid mandó la memoria al extremo
derecho con su flecha cruzando el dibujo entero. En un ítem cuyo único trabajo
es *verse una vez*, eso no sirve. Quedó una sola arista bidireccional
etiquetada "lee antes, escribe después": misma información, y la memoria se
sitúa al lado del nodo con el que habla.

**Verificación**
- `npm run validar-contenido` pasa: 41 ítems en la sesión 2, 240 minutos.
- `npm run humo`: 127 pantallas, 0 con error.
- Comprobado en el navegador: el grafo en sus dos versiones, y la tabla.

---

## Batch 20 — Contenido · S2·U2 `reto` — La arquitectura cognitiva
**2026-08-07**

El corazón del taller: cada nodo hace un trabajo y solo uno, y una reflexión
que no puede corregir es decorativa. La unidad más larga del curso.

**Criterios de aceptación** (todos cumplidos)
- [ ] El diagrama de secuencia se recorre paso a paso
- [ ] Se explica **por qué existe `revision`** con el caso real
- [ ] Las dos trampas de cableado quedan anticipadas
- [ ] `objetivos` y `requisitos` escritos
- [ ] Los minutos suman los 105 de la unidad (90 de contenido + receso)
- [ ] `notas` privadas donde lo amerita
- [ ] La validación de contenido pasa

---

### 25 ítems, 105 minutos

El esqueleto tenía 14. Los once nuevos no son relleno: cada uno cierra un
hueco que se veía al escribir el de al lado.

**El diagrama de secuencia es la pieza central**, y por fin tiene sus trece
explicaciones. Las dos que importan son la 7 —la reflexión devolviendo el
control a percepción— y la 10, la crítica que queda en pie; las notas privadas
dicen que hay que dejarlas respirar y que el resto es tubería. Recorrerlo son
12 de los 90 minutos.

**El receso se movió al medio.** El esqueleto lo tenía al final de la unidad,
lo que dejaba noventa minutos seguidos de grafo. El brief pedía "receso a
mitad" y tiene razón: la segunda parte —por qué existe `revision`— es la
difícil, y nadie la sigue después de hora y media sin parar.

### La cadena que explica `revision`

Cuatro ítems seguidos construyen el argumento, y ese orden es la unidad:

1. **`_tras_reflexion`**, las tres salidas. Toda la arquitectura cabe en cinco
   líneas de código.
2. **`MAX_VUELTAS = 2`** — un agente que puede pedir más evidencia
   indefinidamente no termina. El tope no es una limitación técnica: es la
   decisión de que en algún momento hay que emitir.
3. **Por qué existe `revision`** — sin ese nodo, cuando la crítica demuele el
   diagnóstico y se acaban las vueltas, el agente emite igual la hipótesis
   demolida. Y las recomendaciones se calculan sobre ese titular, o sea sobre
   lo que su propia crítica ya declaró insostenible.
4. **La cita real**: *"Tengo banderas de sesgo encendidas en 8/8 categorías y
   4/5 regiones. SÍ hay hallazgo: hay DERIVA"* — dicha con el titular en
   `sin_hallazgos`. Sabía la respuesta y el grafo no lo dejaba decirla.

La `comparacion` del antes y después cierra con el detalle que más cuesta
creer: **no miró una herramienta más**. La instrucción de `revision` lo dice
explícitamente — con la evidencia que hay alcanza, y es la misma que sostiene
las objeciones.

### Las dos trampas, anticipadas

Las dos son **mudas**, y esa es la razón de dedicarles ocho minutos:

- **El estado que no se propaga**: el agente responde bien y perdió el encargo.
- **`ToolNode` lee `messages`, no `mensajes`**: el agente responde
  perfectamente y no ejecutó ni una herramienta. El diagnóstico está escrito
  sobre la nada.

La nota de la segunda añade lo que no es obvio: quien escriba el estado en
inglés no las sufre, y la conclusión no es "escriban en inglés" sino que un
nombre distinto al que espera una librería es una trampa que no avisa.

### Otros ítems nuevos

- **`s2-r4-los-seis`**, la tabla de nodos, resaltando `accion` porque es el
  único sin LLM — siembra el reto 5.
- **`s2-r4-estado-por-que`**: `add_messages` es una anotación de tres palabras
  y es la diferencia entre un grafo y seis llamadas independientes.
- **`s2-r4-alcance`**: la forma importa más que el tamaño. Ocho categorías con
  bandera no son ocho problemas, son uno — que es exactamente lo que separa el
  escenario de la campaña del sesgo silencioso.
- **`s2-r4-feed-caido`**: "vendimos cero" y "no sabemos cuánto vendimos" son
  cosas distintas. Es el cuarto mundo del criterio y el que más gente falla.
- **`s2-r4-memoria-tres`**: las tres frases que un tablero nunca dice. Es el
  argumento más fácil de vender a quien ya tiene un dashboard.

**Verificación**
- `npm run validar-contenido` pasa: 52 ítems en la sesión 2, 240 minutos.
- `npm run humo`: 138 pantallas, 0 con error — incluidos los 14 pasos del
  diagrama de secuencia.
- Comprobado en el navegador el recorrido del diagrama, mensaje 7 y mensaje 10.
