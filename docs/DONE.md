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
