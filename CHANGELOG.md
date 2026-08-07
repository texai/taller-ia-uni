# CHANGELOG

Resumen de cambios por fecha, más reciente arriba. El detalle batch por batch
vive en [`docs/DONE.md`](docs/DONE.md).

## 2026-08-07

### Segunda pantalla del docente (batch 11)
- Nueva ruta `/profe/sesion/[sesion]/mando`, para el **segundo portátil**: el
  que no se comparte por Zoom. Controles de avance y retroceso —también con las
  flechas—, notas privadas del ítem, vista previa del siguiente, salto por
  índice, y el panel de preguntas de los alumnos abierto, que es la mitad de la
  razón de dictar con dos máquinas.
- **Las dos pantallas del docente se escuchan entre sí.** La principal dejó de
  solo publicar: ahora también sigue la pauta. Para que eso no se convierta en
  un bucle, el canal usa `broadcast: { self: false }`, la pantalla principal no
  reemite la pauta que acaba de recibir, y `publicar` devuelve lo que emitió
  para que las dos comparen marcas de tiempo del mismo reloj.
- El interruptor **Dictando / Ensayando** vive en los dos lados y gana el más
  reciente, igual que la posición.
- El mando **no se mueve a ciegas**: hasta que llega la primera pauta, avanzar
  y retroceder están deshabilitados, con un botón aparte para empezar la sesión
  desde el principio.

### Preguntas lanzadas al vuelo
- Nuevo tipo de mensaje `PreguntaViva` y evento `pregunta-viva`: el docente
  puede preguntar algo que no está en el material. Viaja entero por el canal
  —la pauta solo sabe señalar ítems que existen en el YAML— y se dibuja
  **reutilizando el componente `Pregunta`**, así que hereda los mismos tres
  estados y no abre un segundo camino por el que unos resultados puedan
  filtrarse antes del revelado.

### Reloj
- `minutosEntre` y `comoDuracion` en `reloj.ts`; `minutosDeSesion` y
  `minutosHasta` en `navegacion.ts`, los cuatro con tests. El mando muestra
  cuánto queda de sesión, lo planificado contra lo transcurrido, y cuánto lleva
  en pantalla el ítem actual — esto último a partir de la marca de tiempo de la
  pauta, no de un cronómetro local, para que sea correcto aunque el mando se
  abra a mitad de clase.
- `minutosEntre` no da la vuelta al reloj: antes de la hora de inicio devuelve
  negativo, porque un número negativo es información y "23 h 30 min" es un
  error escondido.

### Contenido · S2·U2, la arquitectura cognitiva (batch 20)
- 25 ítems, 105 minutos: la unidad más larga del curso. El diagrama de
  secuencia recorrible por fin tiene sus trece explicaciones.
- **El receso se movió al medio.** El esqueleto lo tenía al final, dejando
  noventa minutos seguidos de grafo; la segunda parte es la difícil.
- Cuatro ítems seguidos construyen el argumento de `revision`: las tres salidas
  de la reflexión, el tope de vueltas, por qué hace falta el nodo, y la cita
  real donde el agente sabía la respuesta con el titular en `sin_hallazgos`.
  La comparación cierra con el detalle que más cuesta creer: no miró una
  herramienta más.
- Las dos trampas de cableado, anticipadas por ser **mudas**: el estado que no
  se propaga, y `ToolNode` leyendo `messages` en vez de `mensajes` — el agente
  responde perfectamente y no ejecutó ni una herramienta.

### Contenido · S2·U1, qué le faltaba al bucle (batch 19)
- 8 ítems, 25 minutos. Abre el domingo emparejando cada patología del sábado
  con la capa que la resuelve, y presenta el grafo sin explicarlo.
- Nuevo `s2-para-quien-no-vino`: tres minutos con el caso y el problema, no con
  la historia del sábado. Es el ítem que hace que la sesión 2 se pueda seguir
  sin haber estado en la 1.
- La tabla de patologías gana una columna "cómo": nombrar la capa sin decir el
  mecanismo no enseña nada. Y una nota señala lo que la tabla no puede — falta
  la acción, que no arregla ninguna patología porque es capacidad nueva.
- Nuevo `s2-que-no-es`, contra la objeción que siempre aparece: a un prompt no
  se le puede preguntar si lo cumplió; a un nodo sí.
- El grafo se dibujó dos veces. Con la memoria como dos aristas se forma un
  ciclo y Mermaid la manda al extremo con la flecha cruzando todo el dibujo.
  Una sola arista bidireccional —"lee antes, escribe después"— dice lo mismo y
  la deja junto al nodo con el que habla.

### Contenido · S1·U4, el primer agente sin arquitectura (batch 18)
- 14 ítems, 65 minutos. **Con esto la sesión del sábado queda escrita entera**:
  cuatro unidades, 67 ítems, 240 minutos.
- El brief decía 55 minutos y la estructura reserva 65. Lo cazó la comprobación
  que el batch 15 agregó a `validar-contenido` — los ítems sumaban 230 contra
  las cuatro horas de la sesión.
- Nuevo `s1-r3-que-hace-bien`: antes de romperlo, decir que el bucle funciona.
  Sin eso la clase se lleva la lección equivocada — ReAct es un piso muy alto
  por muy poco código, y el problema aparece al confiar en él sin mirar.
- Las dos `cita-agente` son transcripciones literales de `incidencias.md`, con
  una advertencia en las notas: el agente dijo eso **reflexionando**, con un
  nodo que el bucle pelado no tiene.
- La pregunta de cierre no lleva `respuesta` a propósito.

### Una cifra más del laboratorio, corregida
- `incidencias.md` decía que panadería marcaba "+9.2% promediando y +0.7% por
  cociente de totales". **Son dos cantidades distintas**: +9.2% es el nivel a 14
  días promediando porcentajes (medido +9.4%) y +0.7% es el delta contra la
  base de 45 días por cociente de totales (medido +0.70, exacto). Juntas
  sugieren una inflación de trece veces que no existe: es 1.4× en el nivel y 3×
  en el delta. Corregido con las cuatro cifras en `texai/taller-ia-uni-lab`.

### Los ítems de código reventaban la lámina al hidratar
- `Codigo`, `Terminal` y `Demo` llamaban a Shiki con `await` dentro del
  componente. Correcto en un componente de servidor — pero `Dictado` es de
  cliente y se los lleva al navegador, donde un componente asíncrono no es
  esperable: React renderiza bien en el servidor y **revienta al hidratar**.
  Afectaba también a los ítems del esqueleto original.
- Nada de lo que teníamos podía verlo: la construcción pasa, el HTML sale
  completo y `curl` devuelve 200. El único síntoma es un error minificado en la
  consola y la pantalla en blanco.
- Arreglado con el patrón que ya usaba `diagrama-secuencia`: `resaltarSesion`
  precalcula el HTML en el servidor y los componentes quedan síncronos.
- **Nuevo `npm run humo`**: abre las 122 pantallas del curso en un navegador de
  verdad —cada ítem y cada paso interno— y falla si alguna tira un error.

### Contenido · S1·U3, la herramienta de percepción (batch 17)
- 18 ítems, 60 minutos. Cada trampa se explica **con su medición al lado**: la
  tabla de las ocho categorías donde ninguna infla hacia abajo, el +20% de MAPE
  que la flota sana se mueve sola, y los `UMBRALES` comparados fila por fila
  contra los máximos medidos.
- Se verificaron los máximos por dimensión contra el simulador. La estructura
  se sostiene exacta: tienda se mueve 2.5× más que categoría en MAPE y 3× en
  sesgo, sin que nada esté roto.
- Apareció el umbral que faltaba en el batch 16: `modelos_con_mape_sobre_25` en
  `herramientas.py`. Es 25%.

### Cifras del caso, auditadas contra el simulador
- Se corrió el pipeline del laboratorio dos veces, con el mundo anclado al 7 y
  al 12 de agosto. **El MAPE y el sesgo se sostienen al primer decimal**
  (13.78/13.82 → 14.47/14.45 y +0.80/+0.64 → +4.73/+4.65) y se usan tal cual.
- **Las unidades de sobre-stock y el conteo de modelos sobre umbral no son
  reproducibles**: el mundo se genera contra `date.today()`. La métrica dice
  36,000 en vez de 36,567, y las notas privadas llevan el rango medido.
- **El "152 modelos que nadie mira" no cerraba** con "las cinco categorías más
  grandes" (5 × 24 = 120 vigilados → 72 sin mirar). Sale de cinco **tiendas**.
  Corregido en los dos `README.md` de `texai/taller-ia-uni-lab`.

### Contenido · S1·U2, encontrar el problema a mano (batch 16)
- 14 ítems: 40 minutos de contenido más el receso. El arco es sufrir, no
  resolver — escenario visible que se resuelve en cinco minutos, expectativas
  bajadas a propósito, escenario silencioso, diez minutos sin encontrar nada, y
  recién entonces la tabla de las dos degradaciones.
- Dos ítems nuevos sostienen ese arco: la métrica "cinco minutos" y la segunda
  búsqueda, la que no encuentra nada.
- La pregunta pública gana su `respuesta`: "ninguno de los dos solo".

### Contenido · S1·U1, la unidad de apertura (batch 15)
- La primera unidad escrita de verdad: 21 ítems, 60 minutos exactos. El
  esqueleto tenía 12 ítems de ~5 minutos y casi todos eran tres cosas juntas —
  `s1-metricas-definidas` declaraba MAPE, sesgo y cobertura en una sola lámina,
  y ahora son tres ítems, con el del sesgo como `comparacion` contra el MAPE
  porque la diferencia entre los dos **es** el contenido.
- El rescate de entornos rotos entra como tres `error-comun` en medio de la
  unidad, sacados de las incidencias reales del laboratorio.
- Nuevo `s1-modelo-vs-contenedor`: una imagen / un modelo / un endpoint contra
  una imagen / 192 modelos / ningún endpoint. Como prosa no funcionaba.
- `s1-donde-estamos` se ancló a lo verificable: el taller de Docker, GitHub
  Actions y Kubernetes del mismo programa, y MLflow como el registro del
  Módulo 2.
- No se adelanta ninguna cifra del reto 1. Y una del material de origen quedó
  fuera por no cerrar la aritmética — ver `DONE.md`.
- **Corregido un `-.texto.->` de Mermaid** que renderizaba "registr" en vez de
  "registro": se parte el token. La forma `-.->|texto|` no es ambigua.

### Comandos anotados parte por parte (batch 14)
- `src/lib/anotaciones.ts`, puro y con 14 tests: ubicar un segmento dentro del
  comando, partir el comando en trozos, dibujar la llave y detectar
  solapamientos.
- El modo enfocado resalta una parte con una **llave debajo, dibujada con
  caracteres** —el comando va en monoespaciada, así que contar columnas alinea
  exacto— y deja el resto visible pero atenuado. Funciona con comandos de
  varias líneas: la llave cae bajo la suya, con la sangría respetada.
- **Segmentos que se solapan ahora fallan al cargar.** Era el caso que faltaba
  y el peor de los tres: si uno se traga a otro, esa explicación nunca llega a
  enfocarse y lo único que se ve es un paso que parece repetido.
- El comando **se encoge para caber** en vez de desplazarse. Una barra
  horizontal proyectando obliga a arrastrar con el ratón delante de la clase;
  envolver rompería la alineación de la llave.

### Diagramas de secuencia recorribles (batch 13)
- `src/lib/plantuml.ts`: lector del subconjunto de PlantUML que este curso usa
  —participantes, mensajes, notas y activaciones— con 16 tests. Lo que no
  entiende **falla nombrando la línea**, al cargar el contenido y no en clase.
- **No se genera ninguna imagen.** El plan era `plantuml.jar` en construcción
  para el diagrama completo y un dibujo propio para el recorrido enfocado; son
  dos dibujantes para la misma figura, y el cambio ocurre en medio del ítem
  delante de la clase. Ahora se dibuja todo en SVG desde la fuente parseada:
  sin Java, sin imágenes versionadas que puedan desfasarse, sin servicio
  externo. PlantUML queda como formato de escritura, que es para lo que sirve.
- El paso 0 muestra el diagrama entero; del 1 en adelante se enfoca un mensaje
  y se atenúa el resto, con su explicación debajo.
- `Secuencia.notas` se llama `anotaciones`: chocaba con las `notas` privadas del
  docente, y en este proyecto esa palabra significa "lo que no se proyecta".
- El cargador **exige** que haya tantas explicaciones como mensajes, y admite
  `texto` como ancla. El esqueleto tenía 12 para 13 y nadie lo había notado:
  como van por índice, una de menos explica cada mensaje con el texto del
  siguiente.
- `pasosDe` cuenta los mensajes de la fuente y no las explicaciones escritas.
  Antes, olvidar una escondía un mensaje entero del recorrido.

### Políticas de Realtime, corregidas antes de aplicarlas
- Fuera el `alter table realtime.messages enable row level security`: esa tabla
  es de Supabase y el editor SQL responde `42501: must be owner of table
  messages`. No hacía falta — ahí la RLS ya viene activada.
- **El canal `:respuestas` no estaba contemplado.** Se escribió en el batch 9 y
  el 10 agregó un canal más. Con las políticas viejas, las respuestas de los
  alumnos quedaban legibles para todos —justo lo que `CONVENTIONS.md` §12
  prohíbe— y además ningún alumno podía enviarlas, porque insertar ahí caía
  bajo la política de la pauta, que es solo del docente.
- **La presencia habría dejado de funcionar.** Un broadcast y un anuncio de
  presencia son los dos un INSERT en `realtime.messages`. Sin distinguirlos por
  la columna `extension`, cerrar el canal principal al docente dejaba a los
  alumnos sin poder anunciarse — y con ellos se iba el denominador de
  "respondieron todos", que sale de Presence.
- Ahora son siete políticas, con los tres canales nombrados explícitamente.

### Avisos de tiempo en el mando (batch 12)
- Nuevo `src/lib/avisos.ts`, puro y con 14 tests: `avisosDeTiempo` devuelve lo
  que hay que decir ahora mismo, de lo más urgente a lo menos. Tres avisos —
  el receso pendiente **por la hora** y no por la posición, la unidad que se
  pasó de la suya, y el desvío acumulado **con qué recortar**: las unidades que
  quedan, ordenadas de la más cara a la más barata.
- **"Empezamos ahora"**: el mando permite fijar la hora real de arranque y medir
  desde ahí. Casi ninguna clase empieza a la hora del sílabo, y medir contra una
  hora que no ocurrió vuelve ruido todo lo demás. Se guarda en `localStorage` y
  se lee con `useSyncExternalStore`.
- El tic del reloj subió a `Mando`: el reloj y los avisos leen el mismo segundo.
- El panel de avisos no existe cuando no hay nada que decir. Uno permanente que
  dice "todo en orden" deja de leerse, y entonces tampoco se lee el que importa.

### El tiempo se cuenta de abajo hacia arriba (`CONVENTIONS.md` §15)
- **Los minutos los declara solo el ítem.** La unidad vale la suma de sus
  ítems, la sesión la de sus unidades. Ningún total se escribe a mano.
- `Unidad` pierde el campo `minutos` y el cargador **rechaza** un YAML que lo
  declare, diciendo dónde van. Los ocho `minutos:` de nivel unidad salieron de
  los dos archivos de sesión; cuadraban exactamente con sus ítems, así que los
  240 minutos por sesión siguen intactos.
- `minutosDeUnidad`, `minutosDeSesion` y `minutosHasta` viven en
  `navegacion.ts`; `contenido.ts` reexporta la primera como `minutosDe`.
- `npm run build` ya no vigila el descuadre entre dos cifras del YAML —no hay
  dos— sino la suma de los ítems contra lo que dura la sesión según sus horas.

## 2026-08-06

### Documentación
- Se define el proceso de trabajo del repo: `DRAFT.md` → batches de `TODO.md` →
  implementación → `DONE.md`, con los cuatro workflows adaptados desde
  `texai/f1services` y `texai/dyd`.
- `CONVENTIONS.md` fija dónde vive el contenido, las invariantes de privacidad
  del material de clase, y el catálogo de tipos de ítem.
- `TODO.md` abre con doce batches. Los ocho primeros son la ruta mínima para
  dictar el sábado 8 de agosto.

### Documentación · visualizaciones enfocadas
- Se agregan los tipos `diagrama-secuencia` y `comando-anotado`, y con ellos el
  concepto de **ítems con pasos internos** (`CONVENTIONS.md` §10): la posición
  de la clase pasa de `(unidad, ítem)` a `(unidad, ítem, paso)`.
- Se enmiendan los batches 6 y 8 para transportar el paso, en vez de dejarlo
  como arreglo posterior.
- Batches 13 y 14 abiertos.
- `transicion` dibuja además el mapa de la sesión —unidades cerradas, actual y
  siguiente— derivado de la estructura del curso y no declarado en el YAML.

### Documentación · proyecto Supabase compartido
- El proyecto se comparte con `gen`. Todas las tablas llevan prefijo `taller_`,
  y las políticas se escriben contra una lista explícita `taller_docentes` en
  vez de contra `auth.role()`: Auth es común a las dos aplicaciones, así que
  "estar autenticado" no alcanza como criterio (`CONVENTIONS.md` §11).
- El reparto de las ocho horas queda fijado en el batch 3, cuadrado contra los
  cinco retos que ya existen en el laboratorio.

### Documentación · cero tablas, y preguntas públicas
- Supabase queda reducido a Auth y Realtime. **No hay tablas.** El estado de la
  clase viaja por Broadcast y Presence; el que llega tarde se sincroniza con
  Presence, que es la pieza que hace innecesaria la persistencia
  (`CONVENTIONS.md` §11).
- Se elimina la tarea de npm para la contraseña: el docente se crea a mano en
  el panel de Supabase.
- Las preguntas del docente pueden ser públicas, con tres estados: respondiendo
  —solo el contador, nunca las respuestas—, revelado por clic o al completarse,
  y recuento en vivo (`CONVENTIONS.md` §12).

### Documentación · contenido unidad por unidad
- Se abren ocho batches de contenido, uno por unidad (15 a 22), separados de
  los de código. Se hacen después de que la funcionalidad esté en pie y **uno
  por conversación**: una iteración que sostiene las ocho unidades a la vez
  escribe ocho unidades mediocres (`CONVENTIONS.md` §13).
- Cada batch trae su objetivo pedagógico, el material de origen en el
  repositorio del laboratorio, los tipos de ítem sugeridos y sus criterios de
  aceptación.

### Batch 1 — Esqueleto de la aplicación
- Next 16 con App Router, TypeScript estricto y Tailwind 4. Página raíz con el
  listado de cursos.
- Se sube de Next 15.1.3 a 16 por CVE-2025-66478. `next lint` ya no existe en
  16: el script usa `eslint` directo, y la configuración de Next se importa en
  formato plano.
- Tema oscuro por omisión, claro según el sistema.

### Batch 2 — Modelo de contenido y cargador
- Los 23 tipos del catálogo como unión discriminada, con una especificación
  dirigida por datos: agregar un tipo cuesta una línea.
- Cargador que lee YAML, resuelve referencias a archivos markdown y PlantUML, y
  acumula todos los problemas en vez de fallar en el primero.
- Filtro de servidor que quita `notas`, `respuesta` y los ítems de `asistencia`
  de lo que viaja al alumno, con pruebas que lo comprueban sobre el JSON.
- `npm run validar-contenido`, dentro de `npm run build`.

### Batch 3 — Estructura completa del curso
- Las ocho horas enunciadas: 8 unidades, 84 ítems, 240 minutos exactos por
  sesión. El receso y el cierre del sábado son ítems dentro de su unidad, no
  unidades sueltas.
- El validador comprueba que los minutos de los ítems cuadren con los de su
  unidad.
- Primer archivo PlantUML: el recorrido de una corrida del agente, que el batch
  13 va a parsear para el modo enfocado.

### Batch 4 — Renderizadores de contenido
- Los 19 tipos de la familia `contenido`, con resaltado de código en el
  servidor y Mermaid diferido en el cliente.
- Vista de revisión en `/curso/[curso]/sesion/[sesion]`: la sesión entera de
  corrido, para escribir material. Muestra las notas privadas; el batch 7 la
  protege.
- La portada lee el YAML real.
- El cargador valida que `objetivos` y `requisitos` sean texto: YAML convierte
  "Algo: otra cosa" en un mapa, y el síntoma aparecía como un error de React.

### Batch 5 — Renderizadores de dictado
- Receso con cuenta regresiva y hora de regreso, pausa de preguntas con
  disparadores, asistencia solo para el docente, y la pregunta con su botón de
  omitir.
- `src/lib/reloj.ts` con la aritmética de hora y siete pruebas: cruce de hora,
  vuelta a medianoche, y `null` antes que inventar una hora.
- El catálogo completo se renderiza: cero tipos sin componente.

### Batch 6 — Vista de dictado
- La sesión es ahora índice a la izquierda y un ítem a la vez a la derecha; la
  vista de corrido se mudó a `/revision`.
- Navegación con flechas, espacio y AvPág, incluidos los pasos internos de los
  ítems que los declaran.
- La URL es la fuente de verdad de la posición, leída con
  `useSyncExternalStore`: se puede recargar, compartir y usar el botón de atrás.
- `src/lib/navegacion.ts` con 14 pruebas, entre ellas que avanzar y retroceder
  son inversas a lo largo de toda la sesión.

### Batch 7 — Autenticación del docente
- Entrada en `/profe`, fuera de navegación y documentada. Sin registro ni
  recuperación: el usuario se crea a mano en Supabase.
- Las rutas se parten en dos caras: la pública sirve la carga del alumno
  —filtrada en el servidor— y `/profe/sesion/…` sirve el material completo,
  dinámica para que no quede en caché.
- Ser docente no es estar autenticado: Auth es compartida con `gen`, así que se
  compara contra `NEXT_PUBLIC_DOCENTE_UID`.
- Dos pruebas nuevas sobre el contenido real del curso, en ambos sentidos.

### Batch 8 — Sincronía en vivo (implementado, sin verificar)
- Canal de Realtime por sesión, con Broadcast para cada movimiento y Presence
  para que quien llega tarde aterrice donde va la clase, paso interno incluido.
- El alumno puede retroceder libremente y no puede adelantarse; botón para
  volver a donde va la clase, e indicador de conexión.
- Interruptor "Dictando / Ensayando": fuera de vivo el alumno navega libre.
- `CONVENTIONS.md` §4 corregida: el bloqueo hacia adelante es una barrera de
  comportamiento, no de seguridad. Prometía que el contenido posterior no se
  envía, y eso no se puede cumplir sin un store en el servidor.
- **No verificado contra Supabase**: la red del contenedor de desarrollo
  deniega las conexiones salientes al proyecto.

### Batch 9 — Preguntas del alumno (implementado, sin verificar)
- Canal aparte y asimétrico: los alumnos escriben y no leen. Lo corta la
  política sobre `realtime.messages`, no el cliente.
- Botón discreto en la vista del alumno, con nombre opcional recordado entre
  preguntas; la pregunta viaja con el ítem y el paso donde se hizo.
- En el docente, contador en la cabecera y panel cerrado por omisión: esa
  pantalla se proyecta.
- `supabase/politicas.sql` cierra además el canal de la pauta: publicar solo el
  docente, leer cualquiera.

### Batch 10 — Preguntas del docente (implementado, sin verificar)
- Tres estados: respondiendo —solo el contador—, revelado por clic, y recuento
  en vivo después.
- El denominador de "respondieron todos" sale de Presence; nunca se declara el
  tamaño del grupo.
- Las respuestas van por su propio tema, asimétrico como el de preguntas.
- Una respuesta por alumno, la última gana: quien cambia de opinión no cuenta
  dos veces.
- La respuesta correcta sale del servidor solo dentro del revelado.

### Batches 8, 9 y 10 verificados en producción
- El docente entra, activa el dictado y el alumno lo sigue. Con el dictado
  apagado, el alumno queda libre.
- Corregido: la cabecera del docente decía "Sin conexión" con el canal vivo. Un
  canal ya limpiado emitía `CLOSED` después del `SUBSCRIBED` del nuevo.
- Corregido: la pauta se publicaba antes de que el canal estuviera suscrito.
  Ahora se encola y se emite al suscribirse, así quien entra antes del primer
  movimiento del docente ya recibe la posición.
