# CHANGELOG

Resumen de cambios por fecha, más reciente arriba. El detalle batch por batch
vive en [`docs/DONE.md`](docs/DONE.md).

## 2026-08-08

### Fuera los minutos de la barra lateral
- Quedaban dos sitios: el `· 12 min` del rótulo de la unidad —solo en modo
  docente— y el `3′` al final de cada ítem con tiempo, que **sí veían los dos**.
- Las dos barras nunca decían lo mismo. §3 se lleva los minutos de casi todos
  los ítems camino del alumno, y sobreviven los de `lectura` y `receso` porque
  son la instrucción a la clase; el resultado era una lista con tres números
  sueltos frente a otra con veinte.
- Y al docente le restaban más que sumar: la barra es para saber **dónde se
  está**, no cuánto falta. El cuánto falta lo llevan el reloj de la lámina y la
  escaleta del mando, que es donde el número está completo y se mira sin
  proyectarlo.
- Los títulos se leen mejor con esos once píxeles de vuelta.

### Un botón para copiar cada comando
- Los comandos de los retos se teclean **desde otra ventana**: la clase mira la
  lámina, cambia a la terminal y escribe `make verificar ARGS="--reto 1"` o
  `docker compose run --rm plataforma python -m plataforma escenario --nombre
  campana_promocional`. Un error de dedo ahí son tres minutos de reto perdidos
  averiguando por qué no corre, multiplicados por veinte personas.
- Seleccionar con el ratón tampoco servía: en una lámina proyectada el texto
  está a tamaño de leerse de lejos, y arrastrar sobre él se lleva media línea
  de al lado.
- Botón en las cuatro formas en que aparece un comando: `lectura`, `terminal`,
  `comando-anotado` y cada paso de una `demo`. **La línea de Windows tiene el
  suyo**, porque quien está en PowerShell necesita esa y no la de `make`.
- En una `demo` se saltan los pasos que no son comandos —comentarios, flechas,
  elipsis—: un botón que copia `# y para la peor tienda` es ruido.
- **Confirma copiando** («Copiado ✓» por 1.6 s), y esa es la mitad del valor.
  Sin la confirmación uno cambia de ventana, pega, no sale nada, y vuelve sin
  saber si falló el botón o el pegado.

### La navegación dice qué pasa en cada punto
- La barra lateral ya marcaba con **◆** los puntos de espera o interacción. Los
  demás ítems eran todos el mismo punto, así que **no se veía dónde hay que
  ejecutar algo** ni dónde hay un dibujo — y son justo los dos sitios donde el
  docente necesita anticiparse: la terminal en pie, el puerto :8501 abierto.
- Tres señales ahora: **◆** pausa, **▶** se ejecuta (demo, terminal, comando
  anotado, salida anotada) y **▦** gráfico (diagrama, secuencia, imagen, modelo
  de datos). Cada una con su color y su nombre para lectores de pantalla.
- **Leyenda bajo la cabecera de la sesión**, porque un símbolo sin glosa se
  aprende a la tercera lámina o no se aprende.
- La señal se deriva del tipo del ítem (§8), así que un ítem nuevo la hereda
  sin tocar nada. Y la ve **también el alumno**: el tipo no es campo privado.

## 2026-08-07

### Qué es `make`, explicado en pantalla
- Se usaba **desde el primer comando del taller y nunca se explicaba**: la
  definición vivía solo en las notas privadas, así que la sala veía `make X`
  diez veces sin que nadie dijera qué es. Rompía §18 — el vocabulario se abre
  antes de usarse.
- Tres láminas nuevas antes de la tabla de atajos: el **glosario** (`make`,
  `Makefile`, `taller.ps1`), **qué problema resuelve** —con y sin él, y la
  receta real del archivo— y **la alternativa de Windows**.
- Lo de Windows era el hueco más grande: `taller.ps1` aparecía en cada lámina
  que manda ejecutar algo, **sin que nadie hubiera dicho qué era**.
- La idea que se llevan, y que estaba sin decir: **el `Makefile` es la
  documentación que sí se mantiene.** Si el comando cambia y el archivo no,
  deja de funcionar y alguien lo arregla; un README puede llevar meses
  mintiendo.
- Dos preguntas para que el tramo respire, y las dos comprueban lo mismo: si
  gana la opción equivocada, `make` todavía se ve como magia.


### Lo que hay debajo de cada caja del diagrama
- El dibujo decía `make entrenar` y ahí se acababa: no se veía **qué herramienta
  corre por debajo ni en qué archivo está**.
- Cada caja de proceso lleva ahora una segunda línea con el archivo y la
  librería — `entrenar.py · sklearn`, `metricas.py · pandas`,
  `grafo.py · LangGraph`.
- Y una **lámina nueva justo después** con la cadena entera, que es donde cabe
  el comando de Docker sin apretar el dibujo: atajo → `docker compose run --rm
  … python -m …` → archivo → librería, las siete filas. El patrón se ve de una
  vez: quien lee una fila, lee las siete.

### Los diagramas se pueden abrir aparte
- Mermaid dibuja **SVG en línea**, no una `<img>`, así que el clic derecho no
  ofrecía «abrir imagen en una pestaña nueva»: no hay archivo que abrir, el
  dibujo lo acaba de construir el navegador.
- Botón **«Abrir aparte ↗»** en la esquina de cada diagrama. Serializa el SVG
  que ya está en pantalla, lo envuelve en un `Blob` y abre esa URL: mismo
  dibujo a pantalla completa, con el zoom del navegador y guardable.
- Sale de lo renderizado, así que **nunca puede quedar desincronizado con la
  lámina** — que es justo lo que pasaría exportando un `.svg` a mano. Y vale
  para los veinte diagramas del curso sin tocar ninguno.


### Una lámina que dice para qué sirve la aplicación
- Va **antes de pasar lista**, que es cuando todavía no han abierto el enlace.
  Seis cosas que solo funcionan desde su propio dispositivo: la lámina que se
  sigue sola, responder a las preguntas, preguntar sin levantar la mano, el
  glosario, los descargables y los relojes de las ventanas de trabajo.
- **El anonimato de las dos direcciones es lo que hay que decir en voz alta**:
  sus respuestas salen como totales y sus preguntas no llevan nombre si no
  quieren. Es lo que hace que pregunten de verdad. Una sala que no sabe que
  puede responder no responde, y las preguntas dejan de medir nada.

### Los diagramas se ven como el resto de la interfaz
- Un `subgraph` salía con el **gris claro opaco** del tema `dark` de Mermaid.
  Sobre este lienzo casi negro eso no se lee como «estos nodos van juntos»:
  se lee como un rectángulo recortado y mal pegado encima del diagrama.
  Ahora es solo un borde tenue y su rótulo, como el resto de las cajas.
- Igual con los rótulos de flecha, que traían un chip gris de resalte detrás
  —parecían subrayados con rotulador—. Va en el componente y no en el
  diagrama, así que cualquier `subgraph` futuro sale bien sin acordarse.

### El salto de la barra lateral, más suave
- `behavior: "smooth"` dura lo que el navegador decide, y con saltos cortos
  sale seco: arranca a velocidad máxima y se para en seco. En una barra que
  se mira de reojo mientras se habla, eso se lee como un tirón.
- Animación propia con `easeInOutCubic`: entra y sale despacio, y **la
  duración se escala con la distancia** — mover una línea no puede costar lo
  mismo que cruzar media sesión. Se cancela si la clase avanza otra vez antes
  de terminar; dos animaciones peleando por `scrollTop` tiemblan.
- Quien pidió al sistema no ver animaciones sigue sin verlas.


### El diagrama de arquitectura lleva los comandos
- Era un mapa de componentes: decía qué había, no **cómo se hace**. Cada caja
  de proceso lleva ahora el comando que la ejecuta —`make datos`,
  `make entrenar`, `make pronosticar`, `make metricas`, `make arriba`,
  `make ui`, `make agente`— así que el dibujo deja de ser una arquitectura de
  referencia y pasa a ser **la lista de comandos de la tarde**.
- Los cuatro de la izquierda van dentro de un recuadro rotulado **`make seed`**:
  se ve de un vistazo qué encadena, y por qué la primera vez tarda.
- MLflow entra en el recuadro, junto a `make entrenar`, que es donde se
  escribe. Fuera queda el servidor `:5000` con su propio `make mlflow` — que
  es la distinción que la lámina no hacía.
- Y las notas señalan lo que **no** tiene comando propio: `romper` y `reparar`
  son `pronosticar` + `metricas` otra vez con el mundo cambiado, y ninguno
  vuelve a pasar por `entrenar`.


### El mapa de la transición ya no enseña minutos
- Las dos pantallas **no coincidían**: el docente veía «128 min» en una unidad
  donde el alumno veía «33». No era un fallo del cálculo — era el filtro de §3
  funcionando: al alumno se le quita `minutos` de cada ítem salvo en lecturas
  y recesos, así que la suma de su unidad es **parcial**, y una suma parcial
  con pinta de total es peor que ninguna.
- Se podría enseñar solo en modo docente, como en la barra lateral. **No se
  hace, porque esta lámina se proyecta**: el reparto del tiempo es del
  docente, y una sala que lee «128 min» sabe cuánto se va retrasando.
- Los otros sitios se quedan como estaban: el receso y la ventana de lectura
  sí dicen su tiempo, porque ahí el número **es la instrucción a la clase**.

### La lista de archivos del caso, en bullets
- Cinco archivos con sus cifras venían como un párrafo corrido. Proyectados,
  eso obliga a leerlo entero para encontrar el que interesa.


### La barra lateral deja ver la estructura del curso
- Eran **236 líneas casi iguales**: el árbol del curso estaba ahí y no se veía.
  Ahora cada unidad es un bloque —cabecera separada del cuerpo, y sus ítems
  colgando de una **guía vertical**— y la unidad en curso se distingue por
  fondo y por color sin tener que leerla.
- **El ítem activo se marcaba con fondo y negrita**, y eso ya lo llevaban el
  título de la unidad y cualquier ítem con texto claro: había media docena de
  líneas compitiendo por parecer «la actual». Ahora lo distingue una **barra de
  acento a la izquierda**, que no la tiene nada más. Es una señal de forma, no
  de peso: se reconoce sin leer.
- Y al avanzar con la flecha, **el activo queda centrado verticalmente** en la
  barra, no pegado a un borde. `scrollIntoView` con `block: "nearest"` lo
  dejaba en la última línea visible, sin nada delante — leyendo siempre el
  borde, sin poder anticipar lo que viene. No se usa `block: "center"` porque
  mueve **todos** los ancestros desplazables y arrastraría la página entera:
  se calcula contra la caja del propio panel.

### Los enlaces del material abren en una pestaña nueva
- Pulsar el GitHub de la ficha del docente **navegaba fuera de la lámina**.
  Proyectando eso no es una molestia: es perder la posición del dictado
  delante de la clase y volver con el botón de atrás mientras veinte personas
  miran.
- Vale para todo el markdown del curso, no solo la ficha. **Solo los
  externos** — un ancla interna que abriera pestaña sería peor que el problema
  que resuelve. Con prueba de los tres casos.


### Cada comando de un reto dice qué significa su resultado
- Un comando produce números, y **los números no dicen nada solos**: «sesgo
  +4.7%» es una cifra hasta que alguien la traduce a **36,981 unidades de más
  en almacén en catorce días**. La sala hace esa traducción sola las primeras
  veces y deja de hacerla a media tarde, que es cuando llegan los retos que
  importan.
- Campo **`significa: {negocio, modelo}`**, público y en la lámina, en los
  cinco tipos que llevan comando. **Dos campos y no un párrafo**, porque son
  dos preguntas distintas y la primera —qué le cuesta a la cadena— es la que se
  olvida.
- Los **17 comandos significativos** de los cinco retos, rellenos con las
  cifras del ensayo de hoy. Y una cosa que se vio al escribirlos: la respuesta
  de `modelo` es **«nada, y ese es el punto»** más veces de las que parece —en
  el reto 1 los 192 no se tocan, en `feed_caido` los de arequipa están sanos—,
  y escribirlo evita que la sala concluya que hay que reentrenar cada vez que
  un número se mueve.
- Las notas privadas llevan **cómo decirlo**, no qué dice la lámina.
- `validar-contenido` **falla el build** si falta. Listaba los 17 antes de
  rellenarlos.

### El número de conectados, en la pantalla que se proyecta
- Es **un número y nada más**: no lleva nombres, así que no cae bajo §14 —lo
  que no puede proyectarse es lo que identifica a alguien— y a la clase le
  sirve verlo. En una sesión en línea, saber que hay veintiuno mirando cambia
  cómo se pregunta y cómo se responde, a los dos lados.
- Al docente le sirve además para decidir: si el contador de una pregunta dice
  12 y hay 21 conectados, **faltan nueve y no es momento de revelar**.


### El contador de la esquina es ahora el salto
- «79 / 144» llevaba toda la clase en pantalla **sin servir para nada**. Para
  llegar a una lámina concreta solo había dos caminos: el índice lateral —que
  obliga a reconocer un título entre 234— o la flecha, cuarenta veces. En
  vivo, cuando alguien pregunta por algo de hace media hora, ninguno sirve.
- Se pulsa el contador y se abre el salto, **con las dos formas y no es
  indecisión**: la **caja** para cuando se sabe el número (se teclea y Enter,
  que es lo que se usa con la escaleta al lado), y el **deslizador** para
  cuando no se sabe — se arrastra viendo el número hasta reconocerlo. Buscar
  sin saber el número es el caso más común de los dos.
- **No salta mientras se arrastra, solo al soltar.** Con la pantalla
  proyectada, saltar en cada píxel dejaría a la clase pasando cuarenta láminas
  en dos segundos.
- **Solo para el docente.** El alumno ve el mismo contador y no lo puede
  pulsar: saltar es marcar el ritmo, y el ritmo lo marca quien dicta (§4).
- Detrás va `posicionDeIndice`, la inversa de `indiceDeItem`, con prueba de
  ida y vuelta **sobre los 234 ítems reales** — que es donde se vería un error
  de acarreo entre unidades. Fuera de rango se acota en vez de fallar: quien
  teclea 999 quiere el final.


### La pauta, ensayada de verdad
- Se ejecutó contra un mundo real —sembrado, roto y reparado— en vez de leerse.
  **Las once evidencias numéricas que declara son correctas**, hasta la última
  cifra: sano 13.8 / +0.8 / 8 de 192 / 6,532 unidades; `campana_promocional`
  16.0 / −10.6; `sesgo_silencioso` 14.5 / +4.7 / 16 de 192 / 36,981;
  `feed_caido` 17,473 → 17,305 filas, «faltan 168». Y `make reparar` devuelve
  los cuatro números **exactos**, que es lo que lo hace servir de sonda.
- Cuatro cosas que no cuadraban:
  - **`feed_caido` delata más de lo que la pauta decía.** La sonda no solo da
    13.7 / +0.8: da «7 de **184** modelos», no de 192. Los ocho que faltan son
    arequipa entera. Decir «la flota se ve sana» con un 184 proyectado es
    perder el mejor momento del escenario, así que ahora lo señala.
  - **La versión del registro no se reinicia.** La pauta prometía `"version":
    1 → 2`, y eso solo vale en un mundo recién sembrado: sobrevive a `entrenar`
    y a `reparar` —solo la borra `make reset`—, así que el segundo ensayo da
    3 → 4. La evidencia es **que sube en uno**, no la cifra.
  - El encabezado decía «los 33 comandos» cuando ya son 36.
  - Y «correrlo de una sentada», que se había quedado fuera del barrido del
    verbo porque ese solo tocó `contenido/`.
- **La pauta no parseaba como shell.** Las dos líneas de pandas del bloque
  nuevo son Python, y sueltas entre comandos son un error de sintaxis. Van
  comentadas —que es lo que son: se teclean dentro del intérprete— y
  `validar-pauta` ahora corre `bash -n` sobre el archivo. Comprobado
  descomentándolas.
- La cadena de estado del mundo se revisó bloque a bloque: no tiene saltos.


### El reto 1 ya dice dónde corre pandas
- «Sin agente, sin LLM. Tú, la API y pandas» — y el material **nunca decía
  dónde**. El paso de la demo era un marcador de posición (`python -c "…" o un
  cuaderno`), y la lámina leía `datos/metricas.csv`, una ruta relativa que **no
  existe en ninguna parte**: los datos viven en un volumen de Docker, no en el
  disco de nadie. En la práctica el reto solo se podía hacer por la interfaz de
  :8501, que estaba escrita como respaldo y no como camino.
- Nuevo **`make consola`** / `.\taller.ps1 consola`: abre un Python dentro del
  contenedor de la plataforma, con pandas puesto y `/datos` montado. No pide
  instalar Python ni pandas en la máquina de nadie, que es la premisa del
  laboratorio.
- La lámina usa la ruta buena, `/datos/metricas.csv`, y la demo trae los
  comandos de verdad, incluida la segunda pregunta —la peor tienda dentro de la
  categoría— que antes era un comentario.
- Y **ya no imprime un `FutureWarning`**. El `groupby().apply()` lo emite en la
  pandas que el laboratorio fija, y eso son cuatro líneas de ruido proyectadas.
  Reescrito con `.agg()`, que además hace más visible lo que la lámina enseña:
  el MAPE se promedia, el sesgo se saca de dos sumas.
- Todo medido, no supuesto: mundo sembrado, `campana_promocional` aplicado y el
  bloque ejecutado. Da bebidas 30.8 / −32.4 y 18 de 24 tiendas sobre el 20%,
  que son exactamente los números que ya estaban en las notas.
- `make consola` entra también en la lista de `make ayuda`, en la pauta del
  docente y en `retos/README.md`. El validador de Windows lo pidió solo en
  cuanto apareció en el contenido.


### Ningún comando deja fuera a Windows
- El laboratorio traía `taller.ps1` desde el principio y **el curso no lo
  usaba**: de los 103 `make` del material, uno solo llevaba su equivalente
  escrito a mano. Proyectar `make verificar ARGS="--reto 1"` deja fuera a media
  sala — Windows no trae `make`, y montar WSL2 en clase cuesta la primera hora.
- Ahora toda lámina que **manda ejecutar** un `make` enseña las dos formas:
  `lectura`, `demo` y `terminal`. La de Windows va debajo y en pequeño, no al
  lado ni tras una pestaña: dos comandos con el mismo peso obligan a elegir
  antes de leer, y una pestaña esconde media clase detrás de un clic que nadie
  da mientras el docente habla.
- **No se escribe: se deriva.** Ciento tres líneas a mano se desincronizan el
  primer día que alguien renombre un `target`, y una línea de Windows que no
  existe es peor que ninguna — la sala la teclea y no corre.
- Y había un agujero de verdad: **`taller.ps1` no tenía `plano` ni `senales`**,
  que son el reto 3 y la sonda de la pauta. En Windows contestaban «No conozco
  el comando». Agregados.
- El validador cierra el círculo por los dos lados: falla el build si un `make`
  del material no sabe traducirse, y si la lista de `windows.ts` promete
  comandos que el `.ps1` no tiene. Comprobado rompiendo cada uno.
- `docker compose` y `curl` no llevan segunda línea: se teclean igual. (`curl
  … | head` **sí** rompe en PowerShell, pero eso es contenido, no traducción, y
  va aparte.)

### El botón de lanzar una pregunta improvisada no hacía nada
- Una pregunta lanzada al vuelo se dibujaba en la pantalla proyectada con su
  enunciado, sus alternativas y un «Enviar pregunta a la clase» **muerto**:
  `Dictado` no le pasaba `onAbrir`, y `onAbrir?.()` se evapora sin error. Las
  pauteadas sí lo traían, así que el fallo solo aparecía improvisando — delante
  de la sala, esperando una pregunta que no se abría nunca.
- Las dos rutas no se parecían y por eso divergieron: la pauteada se dibuja
  dentro de `Item` con un objeto `vivo`, la improvisada monta `<Pregunta>`
  directa. Ahora las dos llevan `apertura` y `onAbrir`, y hay prueba de que
  **ninguna de las dos** se queda sin ellos.
- Y la defensa de fondo: **un control que no puede hacer su trabajo ya no se
  pinta**. Sin `onAbrir` no hay botón, en vez de un botón que miente.

### El receso, sin hora de regreso y de veinte minutos
- Decía «Volvemos a las 18:06», calculado sobre el reloj de la máquina que
  proyecta. En una clase en vivo esa hora no es la que va a pasar: el receso
  empieza cuando el docente lo abre y la sala vuelve cuando vuelve. Un anuncio
  que se incumple —siempre se incumple— convierte la pantalla en la cosa del
  aula que miente. Queda la cuenta regresiva, que dice lo mismo sin
  comprometer una hora.
- Los dos recesos pasan de 15 a **20 minutos**.
- Y de paso, un fallo que solo existía **en el navegador de los alumnos**: el
  filtro de §3 les quitaba `minutos`, y la lámina de receso se dibuja entera a
  partir de ese número. En sus pantallas decía «minutos» sin cifra y contaba
  `NaN:NaN`. No se veía dictando porque la pantalla proyectada no pasa por el
  filtro. Ahora es una excepción declarada, como la ventana de lectura: ahí el
  número es la instrucción a la clase, no el plan del docente.

### Dos verbos y una entradilla
- «Antes de correrlo» pasa a **«Antes de ejecutarlo»**, en las dos láminas que
  lo decían.
- La ventana de lectura del laboratorio ya no dice que «se mira por mirar»:
  dice para qué sirve — reconocer la forma del repositorio antes de trabajar
  dentro de él.


### El plazo de la pregunta ya cuenta lo mismo en las dos pantallas
- Al enviar una pregunta, **la clase veía quince segundos menos** que el
  docente: el contador del alumno se cerraba mientras el del profesor todavía
  bajaba.
- No era la red. El instante de cierre viaja como **marca de tiempo absoluta**
  —a propósito, es lo que hace que quien se conecte a mitad vea el tiempo que
  queda de verdad— pero se calcula en el reloj del docente y se restaba contra
  el del alumno. Dos relojes desfasados quince segundos dan quince segundos de
  diferencia, exactos.
- Ahora la apertura lleva también **`emitido`**, el `Date.now()` de quien la
  manda, y cada pantalla traduce el plazo a su propio reloj al recibirlo. La
  latencia de red **sí** se descuenta, y es lo correcto: ese tiempo el alumno
  lo perdió esperando el mensaje.
- Al reconectar, el docente reemite la pregunta abierta con `emitido` **vuelto
  a sellar**. Con el de la primera emisión, lo que duró la reconexión se habría
  sumado al plazo.
- Con prueba, y comprobada rompiéndola: sin la corrección fallan tres casos.

### La lámina de glosario dice que es un glosario
- Proyectada, una lámina de glosario **se ve como cuatro párrafos con un
  borde**: nada la distingue de prosa cualquiera, y la sala no sabe que lo que
  tiene delante es vocabulario que va a hacer falta después.
- Ahora lleva una ceja **«GLOSARIO»** encima del título, con el mismo estilo
  que la de la lámina de pregunta: pequeña, en versalitas y en el color de
  acento.
- `Marco` gana una `etiqueta` opcional para eso. **Casi ninguna lámina la
  lleva, y es a propósito**: un `markdown` o una `tabla` se reconocen solos, y
  anunciar «Tabla» encima de una tabla es ruido. Vale la pena solo donde la
  lámina no dice sola lo que es.

### Una frase
- «Pausa · ¿a alguien no le levantó?» pasa a **«Pausa · ¿alguien se quedó
  bloqueado?»**. La pausa es para quien está atascado, sea por lo que sea; la
  anterior solo recogía un fallo concreto y dejaba fuera al resto.

### El mando, en el orden de la mano
- Al cambiar de lámina lo primero que hace falta es **qué decir**. Las notas
  privadas suben a lo más alto de la columna; debajo va **el atraso**, y los
  botones de avanzar al final.
- Iba al revés: reloj, avisos, y un bloque que mezclaba el título con los
  botones — las notas quedaban debajo de todo eso, que es bajar la vista para
  encontrar lo único que se lee en cada transición.
- Lo que **sí** se queda arriba es la identidad de la lámina —qué unidad, qué
  título, cuál de cuántas—, porque unas notas sin saber de qué lámina son no se
  pueden leer. El bloque se partió en dos: identidad arriba, controles abajo.
- Y los controles recuerdan que **las flechas del teclado siguen funcionando
  desde cualquier parte de la página**, que es lo que evita que dejarlos abajo
  cueste un desplazamiento con las notas largas.

### La respuesta correcta ya no se proyecta antes de preguntar
- La pantalla del docente **se comparte por Zoom**, y en la lámina de pregunta
  pintaba la opción correcta en verde y con un ✓ **antes de enviarla**. La
  clase la leía a la vez que el enunciado, así que preguntar dejaba de medir
  nada.
- Ahora las cuatro opciones se ven iguales hasta el revelado. Quien sí necesita
  saberla es el docente, y la tiene **en el mando**, junto a las notas
  privadas: es el reparto de §14 — lo que no puede proyectarse vive en la
  pantalla que nadie más ve.
- Con **prueba**, porque esto se rompe con un cambio de estilo de tres
  caracteres y no se descubre hasta tenerlo delante de veinte personas. Se
  comprobó rompiéndola a propósito.
- Y de paso: **revelar desde el mando dejaba fuera el «Por qué»**. El proyector
  pasaba `solucion` al revelar y el mando no, así que según desde dónde se
  cerrara la pregunta la clase veía el razonamiento o solo el conteo.

### El indicador ya no parpadea cada segundo
- Con el dictado activo, la esquina alternaba **«En vivo»** y **«Sin conexión»**
  a intervalos exactos de un segundo. No era la red: **el bucle se lo hacía a
  sí mismo**.
- `limpiar()` corría **antes** de subir la generación, así que el `CLOSED` que
  emite un canal al desmontarlo pasaba el filtro y se leía como una caída:
  pintaba «Sin conexión» y programaba un reintento. Un segundo después el
  reintento volvía a abrir, a limpiar, a emitir `CLOSED`… indefinidamente.
- La pista fue que **nunca pasaba por «Reconectando»**: ese estado sale de un
  error o de un tiempo agotado, y «Sin conexión» solo de un `CLOSED` — es
  decir, de un cierre que pedimos nosotros.
- Y la espera entre reintentos **no crecía nunca**, porque el contador se
  ponía a cero con cada `SUBSCRIBED`. Ahora una conexión cuenta como
  recuperada solo si **se sostiene cinco segundos**: un canal que conecta y se
  cae en bucle ya sube por la escalera hasta los diez segundos.
- `setAuth` solo se llama cuando el token **cambia de verdad**. Se disparaba
  también con el `INITIAL_SESSION` del montaje, y cada llamada empuja el token
  a los canales ya unidos — pedir una reunión justo mientras el canal se está
  suscribiendo es un buen candidato a haber encendido la mecha.

### El laboratorio, entero y de una vez
- **Unidad nueva en la sesión 1**, entre la flota y el reto 1. Hasta ahora el
  repositorio se enseñaba en trozos y nunca completo: al empezar el reto 1 la
  sala había visto fragmentos de siete archivos sin saber cómo está organizado
  el sitio del que salen, y la primera vez que abría uno por su cuenta era con
  el reloj corriendo.
- Va ahí y no junto al caso a propósito: **un mapa antes de haber pisado nada
  es una lista de carpetas que nadie retiene**. Después de los trozos y antes
  de la primera exploración, cierra y abre a la vez.
- **El árbol**: cuatro carpetas, 3,339 líneas. Con un número que sorprende —
  `agente/` pesa más que `plataforma/`: vigilar cuesta más que producir.
- **El mapa carpeta ↔ componente** es el diagrama de arquitectura otra vez, con
  nombres de archivo. Lo que enseña es la única flecha que cruza de una carpeta
  a otra: `api.py → herramientas.py`. El agente no lee el disco de la
  plataforma — y eso explica dos cosas que el curso afirmaba sin justificar.
- **La tabla reto → archivo**, los cinco antes de empezar el primero. Es por lo
  que existe la unidad: convierte cada referencia posterior en «ah, ese».
- `make ayuda`, y tres archivos que nadie había nombrado: los dos README y
  **`retos/incidencias.md`**, la bitácora que el cierre del domingo cita.
- Los tres retos de la sesión 1 se renumeran a `u05`, `u06` y `u07`. Los `id`
  no cambian; lo que se renumera es el nombre del archivo.
- Un test que fijaba «6 unidades por sesión» a mano ahora comprueba lo que su
  título dice: una unidad por archivo, y el orden alfabético como orden del
  dictado.
- Y dos retoques de la apertura: «se ejecuta» en vez de «se corre», y los años
  de experiencia con cifras.

### La pauta de comandos del docente
- **`docs/pauta-de-comandos.sh`**: los 31 comandos del curso en 25 bloques, en
  orden de escaleta, para ensayar el taller entero antes de dictarlo. **No se
  ejecuta entera** — un guardián aborta con el motivo.
- Cada comando va **envuelto en sondas**: el estado antes, el comando, y **la
  misma línea** después. Porque casi ninguno crea archivos — reescriben un CSV
  y mueven un número dentro, y `ls` da idéntico las dos veces.
- **`make senales`** en el laboratorio: los cuatro números de la flota. Era la
  única sonda que había que construir, porque la API no tiene ninguna ruta
  agregada. Antes de romper 13.8 / +0.8 / 8; después 14.5 / **+4.7** / 16.
- Y sube a contenido, en el reto 1: *mira los cuatro números, rompe el mundo,
  míralos otra vez* es el reto entero en dos comandos.
- Cada bloque declara **de qué estado del mundo parte y en cuál lo deja**. Dos
  `romper` sin `reparar` se apilan, y `make verificar` deja `feed_caido`.
- **`npm run validar-pauta`**, dentro de `build`: falla si el contenido gana un
  comando que la pauta no tiene, y si un comando que mueve el mundo no tiene
  sonda a los dos lados.

### Cada reto cierra su círculo
- **El reto 1 tiene criterios**, y el cuarto es el que cambia la media hora:
  *«y en el segundo, no encontraste nada — eso no es fallar el reto, es
  aprobarlo»*. Sin decirlo antes, a los diez minutos del sesgo silencioso
  alguien levanta la mano creyendo que se le rompió algo.
- **Y comprueba el entorno antes de empezar**: `make verificar ARGS="--reto 1"`,
  veinte segundos, contra cuarenta minutos de ejercicio sobre un mundo a medio
  poblar. Hasta ahora el único filtro era la mano alzada del trabajo previo.
- **El reto 3 comprueba la llave**, y no que exista: manda una petición de
  verdad y mira si el modelo **pide una herramienta**. Una llave con la cuota
  agotada responde; lo que no hace es funcionar. Evita el peor momento posible
  del sábado — descubrirlo a las 18:10 con la demo en pantalla.
- Detrás va la **lámina de rescate** con los tres caminos, en un orden que no
  es el de la comodidad: la llave gratuita primero, porque `mock` no razona y
  con él la demo de las tres ejecuciones no funciona.
- En el laboratorio, el verificador ya no dice «Las 1 comprobaciones pasaron».

### Ninguna palabra se usa antes de abrirse
- El glosario tenía **39 términos y tres láminas cubriendo 13**. Los otros 26
  vivían solo en el panel flotante — a mano si alguien lo abre, y nadie lo abre
  en mitad de una explicación. Ahora hay **once láminas y la cobertura es
  completa**.
- La que más falta hacía es la del reto 2: media unidad se va en tres trampas
  de estadística, y el material proyectaba `p < 0.01` **sin que nadie hubiera
  dicho qué es un p-valor**. Entran línea base, Kolmogorov-Smirnov, p-valor y
  significativo-contra-relevante, en ese orden, que cuenta una historia.
- Y dos palabras que el material declaraba como concepto propio y no definía
  nunca: **ReAct**, objetivo del reto 3, y **arquitectura cognitiva**, título
  de la sesión 2 entera.
- **Campo `nuevos`**, no un tipo nuevo. Distingue las láminas de apertura
  —«estas cuatro palabras se van a usar en lo que viene»— de las de referencia:
  lo ya visto se dibuja apagado y marcado. Con los cinco términos iguales, el
  docente los explica los cinco otra vez.
- Dos reglas con prueba: `nuevos` tiene que estar en la lámina, y **un término
  se abre una sola vez en todo el curso** — dos láminas estrenando «deriva» son
  dos explicaciones que se separan, y viven en archivos distintos.
- `validar-contenido` avisa de los términos que ninguna lámina abre.
- El reto 1 prometía enseñar *por qué el sesgo no se promedia* y no lo enseñaba
  —eso es el reto 2, trampa 1—. El objetivo bajó a donde se cumple.

### Con qué se fabrica un modelo
- **La cadena, nombrada donde se usa.** pandas construye las features,
  `Ridge` de **scikit-learn** ajusta, **joblib** guarda el `.joblib` y
  **MLflow** registra la versión. Ninguna de las cuatro se nombraba: sobre 199
  ítems, scikit-learn, joblib, LangChain, numpy, scipy y FastAPI tenían **cero
  menciones**.
- **`make entrenar`, corrido solo.** Hasta ahora solo existía como la barra
  `2/4` dentro de `seed`, y es el único comando de las ocho horas que reescribe
  un modelo. Lo que enseña es que **la fecha no se mueve**: `entrenado_hasta`
  sigue en mayo y solo sube la `version`. Reentrenar arregla el ajuste, no la
  ignorancia — y de ahí sale la pregunta nueva, que engancha con el reto 5.
- **La persistencia es una línea**, `joblib.dump(modelo, ruta)`, y el registro
  de al lado es el que hereda e incrementa la `version`.
- **El job de madrugada, en código**: `joblib.load` sobre los 192 de una vez.
- **MLflow, abierto.** El material lo prometía dos veces —una nota del recap y
  una arista punteada del diagrama— y no se veía nunca. Entra con su código,
  su servicio en `docker-compose.yml` (que explica de paso por qué `make
  arriba` no lo levanta: `profiles`) y **una captura real** con las 192
  ejecuciones.
- `docker-compose.yml` se abre por primera vez, y la tabla de comandos suma
  `make entrenar`, `make mlflow` y `make ollama`.

### El caso, recorrido y no contado
- **La cadena, en código.** `plataforma/config.py` entra en la unidad del caso:
  las 24 tiendas con su región y su factor de tamaño, y las 8 categorías con su
  demanda base. Hasta ahora 16 de las 24 tiendas no se nombraban nunca y las
  otras 8 aparecían por primera vez **dentro de un JSON**.
- Lo que enseña no es la lista, son los dos números de cada renglón:
  `miraflores` vende 1.35 veces la tienda media y `juliaca` 0.75 —de ahí sale
  que promediar porcentajes esté mal—, y bebidas oscila 0.34 contra 0.12 de
  abarrotes, que es **por qué la campaña del reto 1 se hace justo sobre
  bebidas**.
- **Los 192 artefactos, listados.** 1 KB cada uno, 856 KB la flota entera. La
  palabra «artefacto» se usaba las ocho horas y no tenía imagen.
- **`ventas.csv`, por dentro.** Seis días de una tienda, y el del 6 de agosto
  dice `271.42, 396.01, 0, 1`: se vendieron 271 y se querían 396. La venta
  observada no es la demanda — está topada por el almacén.
- Con eso, **el cierre del reto 5 deja de ser una queja**. La señal del quiebre
  existe desde el sábado, y de hecho le llega al agente dentro de las fichas de
  los peores modelos: lo que falta no es el dato, es que esté en el resumen y
  que alguien le diga qué significa.

### Lo que no cuadraba
- **El ancla del caso, unificada.** El mundo sano decía `+0.8%` y `8 / 192` en
  la lámina del caso y `+0.7%` y `7 / 192` en la tabla del reto 1 — dos de los
  cuatro números que la sala anota y que vuelven seis veces. Se resolvió
  **midiendo**: sembrar, medir, romper, medir, reparar. Salen 13.782 / 0.801 /
  8, y tras `sesgo_silencioso` 14.468 / 4.733 / 16.
- La misma cifra estaba en el comentario de `escenario.py` del laboratorio, que
  una lámina cita **literal**, así que el arreglo cruzó los dos repositorios —
  y en su `README.md` y en `retos/README.md`.
- **Las horas de las unidades se calculan, no se escriben.** Cada archivo abría
  con la hora en un comentario, y esa hora es la suma de todo lo anterior:
  envejecía con cada ítem nuevo. Había dos unidades del domingo declarando
  09:06 y 09:05 *en ese orden*, dos sin ninguna, y las del sábado corridas
  hasta hora y media. Se quitaron las trece y ahora salen de `npm run
  escaleta`.
- El bucle de ayer está en `agente/plano.py`, no en `agente/__main__.py`. Era
  la frase dirigida a quien no vino el sábado, sobre el único archivo que se le
  pide abrir.

### Las seis guías, descargables desde la clase
- Las guías del laboratorio —seis hojas de dos caras— se bajan ahora **desde la
  propia lámina**, sin salir a la intranet ni al repositorio con la clase
  empezada. Los PDF viven en `public/contenido/archivos/guias/`.
- **Tipo `descargas`**: varias descargas en una lámina, en rejilla, cada fila
  con su sello, su título y su porqué. Seis `archivo` seguidos habrían sido
  seis láminas que la sala pasa a golpe de flecha, y para la sexta ya nadie
  está bajando la primera.
- Van en **dos sitios y los dos hacen falta**: juntas al abrir cada sesión
  —para bajarlas de una vez— y **cada una en su momento**, con el tipo
  `archivo`, en la lámina que la usa: Docker antes de los comandos, «si algo
  falla» tras los tres rescates, la telemetría tras el glosario de las tres
  señales, los escenarios al empezar el reto 1, las siete herramientas tras sus
  tres reglas, y la anatomía del agente justo antes de leer el grafo.
- La lámina del domingo lleva **otro orden**: primero la del día, después las
  que hoy se dan por sabidas. Quien llega el segundo día las necesita todas.
- Cada entrada de la lista se valida contra `public/contenido/` al construir,
  con la misma guarda que evita el 500 de las páginas dinámicas: que falte el
  PDF es material roto; que falte la carpeta entera no dice nada del contenido.

### Las preguntas se leen antes de poder contestarlas
- **Cuatro estados en vez de tres.** Al llegar a la lámina, la clase ve el
  enunciado y nada más: ni opciones ni caja de texto. Antes salían juntos, y
  media sala pulsa antes de terminar de leer.
- El docente pulsa **«Enviar pregunta a la clase»** y ahí se abre. Los dos
  lados ven la misma **cuenta atrás con barra**; el docente ve además cuántos
  van sobre cuántos hay conectados.
- Los **segundos vienen del contenido** —`segundos:`, uno por pregunta, según
  si es una cuenta mental o una discusión— y se mueven en la propia lámina con
  −15 / +15 antes de enviarla.
- Al agotarse el plazo se cierra sola: los alumnos dejan de poder responder
  mirando su propio reloj, y los resultados salen **en porcentaje, con la
  respuesta correcta**, la gane o no. Nunca aparece quién respondió qué.
- El plazo viaja como **instante y no como duración**, así que quien se conecta
  a mitad ve el tiempo que queda de verdad. Y el recuento lo hace solo la
  pantalla del docente: es la única que tiene todas las respuestas.
- El enunciado se dibuja como markdown. Salía con los acentos graves puestos.

### El índice sigue al cursor
- Con casi doscientos ítems, avanzar unas cuantas láminas dejaba el ítem actual
  fuera de la parte visible del panel. Ahora se desplaza solo, suave, y con
  `nearest`: solo se mueve cuando hace falta, para no agitar el índice en cada
  flecha.


### Los fragmentos de código llevan los números del archivo
- Un `codigo` con `ruta` se numera con las líneas **del laboratorio**. Entre
  bloques no contiguos, un separador punteado: el fragmento se salta un trozo y
  lo dice.
- Los números **no se escriben a mano**. `npm run numerar` los calcula leyendo
  el archivo y `validar-contenido` comprueba que sigan cuadrando — probado
  rompiéndolo.
- Eso obliga a que **el fragmento sea literal**, y ahí estaba el problema real:
  de los 19 fragmentos con ruta, **solo 5 eran fieles al archivo**. Los otros
  14 se habían ido adaptando —comentarios añadidos para la lámina, sangrías
  aplastadas, líneas reescritas— y nadie sabía cuáles. Ahora los 19 son
  literales y las explicaciones viven en `notas`.
- El localizador elige la aparición que da el bloque más largo: un fragmento
  que empieza por `@tool` se anclaba en el primer `@tool` del archivo, que es
  otra herramienta, y numeraba mal sin avisar.


### `/profe/inicio` devolvía un error de servidor en producción
- La causa no era el material: **eran cuatro imágenes que sí existen y sí se
  ven.** El cargador comprueba que cada `imagen` y cada `archivo` existan bajo
  `public/contenido/`, y las páginas del docente son dinámicas — cargan el
  curso en cada petición, dentro de una función serverless donde `public/` no
  viaja porque lo sirve el CDN. La comprobación fallaba y tumbaba la carga
  entera del curso.
- Arreglado por los dos lados: `public/contenido/**` entra en el trazado de
  archivos, y la comprobación **se salta si la carpeta de assets no existe**.
  Que falte un archivo suelto sigue siendo un error —eso es material roto y se
  ve al construir—; que falte la carpeta entera no dice nada del contenido,
  dice dónde está corriendo.
- Ninguna promesa de `reto-N-solucion` queda en pie: sobrevivía una en la
  apertura del sábado —«incluida la solución de cada reto, en su propia rama»—
  y con ella toda la expectativa vieja: «se escribe código en tres de los
  cinco», «Reto 2 · Escribe la herramienta», los objetivos de los retos 4 y 5.
  Ahora el minuto tres del sábado dice lo que el taller es de verdad.
- El caso decía «cuatro archivos» y nombraba tres. Son cinco y una carpeta, y
  ahora dicen dónde viven: el volumen `datos`, montado en `/datos`.


### El hilo narrativo, cosido (batches 38 a 42)
- **El reto 1 ya enseña lo que pedía hacer**: ocho líneas de pandas escritas, y
  tres salidas reales medidas contra los tres estados del mundo. La que rescata
  el reto es la del sesgo silencioso, con el mundo sano entre paréntesis: **las
  ocho categorías movieron el sesgo hacia arriba** mientras el MAPE se quedaba
  quieto. Ocho de ocho en la misma dirección — el ruido no tiene dirección.
- **El caso deja de ser prosa**: de qué está hecho en disco, y su estado
  inicial medido. El par 13.8 / +0.8 tiene por fin una lámina donde señalarlo.
- **La cadena de comandos, en pantalla**: `romper` y `reparar` son la misma
  receta con la primera línea cambiada, y **ninguna reentrena**. Con la
  pregunta que hace aterrizar la consecuencia: si los modelos no cambian nunca,
  todo lo que se mueve es el mundo.
- Dos snippets que ilustran la intención: el `feed_caido` que **borra filas** en
  vez de escribir ceros, y el comentario que confiesa que el sesgo silencioso
  estaba calibrado a 0.18 y gritaba.
- **`ruta:` enlaza** al archivo y a la línea; las rutas con coletilla no, porque
  llevarían a un 404. Y entra el tipo **`diff`**, estrenado con
  `messages_key="mensajes"`: veintiséis caracteres contra una hora perdida.
- **Los conceptos que se usaban sin nombre**: las features reales con el
  `shift(1)` que evita la fuga de datos, el `p ± 1.96σ` del que sale la
  cobertura, y el corte de validación por tiempo que hace honesta la
  comparación 10.4 contra 13.8.
- Queda una cosa abierta y no se disimuló: las tres ejecuciones divergentes del
  reto 3 necesitan una llave de LLM. Con el proveedor simulado saldrían
  idénticas, e inventarlas sería escribir un razonamiento que nadie produjo.


### La ventana de lectura, y el taller que es de verdad (batch 37)
- **El bucle ReAct pelado no existía.** `make agente` levanta el grafo
  completo, así que el sábado la sala habría visto la arquitectura del domingo
  y ninguna de las cuatro patologías del reto 3. Ahora vive en
  `agente/pelado.py`, con `make pelado`.
- **Tipo `lectura`**: qué archivos abrir —con su enlace y sus líneas—, qué
  comandos correr, en qué fijarse, y un reloj que se alarga, se pausa y se
  reinicia sin salir de la lámina. Cinco ventanas, una por reto.
- Ninguna promesa de `reto-N-solucion` sobrevive: esas ramas no existen y el
  material las prometía seis veces, una abriendo el domingo a las 09:00.
- Los minutos de una `lectura` son la única excepción de §3: acá el número es
  la instrucción a la clase, no el plan del docente. Y por eso el total de
  unidad pasó a verse solo en modo docente — la suma pública quedó parcial, y
  un total parcial miente.
- `validar-contenido` comprueba que cada archivo citado exista y que sus líneas
  no se salgan del final. Se probó rompiéndolo: la primera versión no detectaba
  nada, y dos de los once rangos estaban mal.


### La portada, y cómo entran los alumnos
- Fuera el título **«Cursos»**: hay uno solo, y encabezar la página con el
  plural de algo que no se repite es una etiqueta que no informa.
- Dos tarjetas. La izquierda es el curso; la derecha existe para el primer
  minuto de clase, proyectada: **un código QR** y la dirección escrita.
- El QR se genera a un archivo (`npm run qr`), no en el navegador. La portada
  se proyecta justo cuando el aula puede no tener red, y un QR que depende de
  cargar una librería es un QR que a veces no aparece.
- La dirección vive en un solo sitio, `src/lib/sitio.ts`, de donde salen el
  enlace y el QR. Y `npm run qr:leer` lo **decodifica desde la página servida**
  y falla si no lleva a donde debe: un QR es opaco, y el momento de enterarse
  no puede ser con veinte personas escaneándolo.


### Las tres herramientas que faltaban (batch 36)
- De las siete herramientas de percepción, tres nunca se mostraban:
  `listar_modelos` y `detalle_modelo` no aparecían, y `agregado_por` estaba
  nombrada una vez. Ahora las siete se ven, con salida real medida contra el
  mundo sano.
- **`listar_modelos`** cierra la brecha laboratorio/producción en dos números:
  MAPE de validación **10.4%** contra el **13.8%** de producción, y una flota
  sin reentrenar desde mayo.
- **`agregado_por`**, en el reto 2, es la herramienta que produjo la tabla de
  umbrales. Con la flota *sana*, ORIENTE (8 modelos) tiene sesgo +8.7% y LIMA
  (112) tiene −0.3%: el ruido no tiene signo, tiene tamaño de muestra. Va
  precedida de una pregunta a la sala, que además parte un tramo de 27 minutos
  sin respiro.
- **`detalle_modelo`** entra por su camino de error: `quiza_buscabas`. Si la
  docstring es prompt, el valor de retorno también — y el de error, más que
  ninguno.
- La sesión 1 pasa a 253 minutos sobre 240. Es deliberado y el validador lo
  avisa.

### La palabra es ejecución, también en la salida de las herramientas
- `estado_del_job` devolvía `corridas` y `fecha_corrida`, y eso se proyecta.
  Cambiar solo la lámina habría sido mentir sobre lo que imprime el comando,
  así que la palabra se cambió en el laboratorio: `/v1/job/ejecuciones`,
  `ejecuciones_job.csv`, `fecha_ejecucion`. El endpoint lee el archivo viejo si
  el nuevo no existe, para que a nadie se le vacíe la herramienta en clase.

### El vocabulario, y un SQL que se puede correr dos veces (batch 35)
- **Kolmogorov-Smirnov se explica en vez de desaparecer**: está en el código
  del taller y el alumno lo va a ver ahí igual. Tres entradas nuevas al
  glosario (test KS, p-valor, percentil) y la explicación pegada a las dos
  menciones en prosa.
- **«corrida» → «ejecución»** en todo el contenido. `fecha_corrida` y
  `"corridas"` se saltaron por ser la salida real del laboratorio; ese salto se
  corrigió después renombrando en el laboratorio (ver arriba).
- **«tubería» → «pipeline»** donde significa un pipeline de datos (tres sitios).
  Donde no lo significaba se usó la palabra correcta: «el pipe» para el pipe de
  shell, «cableado» para «todo lo demás de este dibujo es fontanería».
  `pipeline` entra al glosario.
- **`npm run humo` corre fuera del contenedor.** Traía cableada la ruta de
  Playwright de la máquina donde se escribió, así que en cualquier otra moría
  con `ERR_MODULE_NOT_FOUND` apuntando a una carpeta inexistente. Ahora lo
  busca local, luego en `PLAYWRIGHT_MODULO`, luego ahí; y si no está, dice el
  comando para instalarlo. El README explica las cuatro comprobaciones.
- **`supabase/politicas.sql` es idempotente.** Corría una sola vez: la segunda
  moría con `42710 … already exists`, y moría en la primera política, dejando
  aplicado a medias lo que hubiera. Los siete `drop policy if exists` subieron
  al principio del archivo y dejaron de estar comentados.

### El glosario (batch 34)
- **35 términos**, de MAPE a «el mundo», en `contenido/glosario.yml`.
- Se dibuja de dos maneras y las dos hacen falta: **un panel siempre a mano**
  en las dos vistas, con buscador, que se abre sin tocar la posición de la
  clase; y **tres láminas** donde el vocabulario es la clase. Un término
  explicado a las 15:40 no sirve a las 18:20.
- Una lámina **nombra** los términos, no los copia: dos láminas que definan
  «sesgo» con palabras distintas es lo que el tipo existe para impedir. Un
  término que no está falla con la lista de los que sí están.
- El campo `ojo` es la mitad útil de varias entradas: no es un matiz, es la
  corrección de lo que la sala cree que significa el término.
- Sí es un atributo del curso, y el caso deliberadamente no: es referencia y no
  contenido, no ocupa minutos, hay uno, y está disponible siempre.

### Un archivo por unidad, y la ficha del docente (batch 33)
- Cada unidad pasa a su archivo bajo `contenido/unidades/`, con prefijo
  `sNN-uNN` y una palabra que diga de qué trata: el listado alfabético es el
  orden del dictado. El archivo de sesión queda como cabecera y orden.
- El corte se hizo por texto y no parseando el YAML, para no perder los
  comentarios. La prueba de que no se perdió nada es un diff del curso cargado
  antes y después: **cero líneas de diferencia**.
- Ficha del docente entre la presentación del taller y el trabajo previo.

### Los cuatro huecos de la auditoría (batch 32)
- **`imagen` y `archivo` no funcionaban.** Llevaban dos meses sin usarse y el
  camino nunca se había terminado: el componente pedía `/contenido/…` y el
  cargador validaba contra `contenido/…`, y nada servía esa URL. Los assets
  viven ahora en `public/contenido/`, que es de donde Next sirve.
- **La interfaz del reto 5 se lee, no solo se ejecuta.** Su docstring —que es
  una tesis: *un panel que solo mostrara el diagnóstico final sería un tablero
  más*—, veinte líneas del bloque de la reflexión donde lo que importa es que
  ninguna decide nada, y un enlace al archivo entero en GitHub.
- **Tres capturas de una corrida real**: la flota sana, la flota con el sesgo
  silencioso —con el MAPE recuadrado, 14.5% contra 13.8%— y la flota con
  quiebre de stock. La del sesgo cierra el reto 1: la sala acaba de pasar diez
  minutos sin encontrar nada, y la imagen les dice que no era culpa suya.
- **`estado_del_job` entra al curso.** El material prometía tres veces que un
  modelo puede estar sano y el job caído; ahora enseña la herramienta, con la
  línea que lo dice todo: `"estado": "ok"` y 17,304 predicciones en vez de
  17,472. Son 168 filas, que es la tienda que dejó de reportar.
- **`quiebre_stock`, el mundo que la política no frena.** Es el reverso del
  sesgo silencioso: aquel no sonaba y había que actuar, este grita y no hay que
  reentrenar. Y pasa las dos reglas de la política, porque el diagnóstico va a
  ser `deriva`. Cierra el reto 5 diciendo dónde está el borde de lo que
  construyeron.
- El trabajo previo entra como descargable al inicio de la sesión 1. La salida
  de `make seed` se corrigió contra la corrida real. `modelo-datos` gana su
  segundo uso en la bitácora de reentrenamientos.

### Los minutos son del docente, y una sesión se ve cliqueable (batch 31)
- **`minutos` pasa a campo privado.** Un alumno que ve «4′» en cada ítem sabe
  cuándo la clase va tarde, y con el reloj a la vista una pregunta buena a las
  18:50 no se hace. Se filtra en el servidor, como las notas. Lo que el alumno
  sí tiene es el total de la sesión: las horas de inicio y de fin.
- Sin la columna de minutos, los títulos del índice dejan de truncarse.
- **La portada.** Las dos sesiones eran cliqueables en toda la fila y no lo
  parecían: sin borde, sin flecha, y con el único indicio en el `hover`, que en
  una pantalla táctil no existe. Ahora cada una es una tarjeta con su borde, su
  franja de acento con el horario, y una flecha.

### La salida anotada (batch 30)
- Nuevo tipo **`salida-anotada`**: una salida de terminal explicada trozo a
  trozo, con el mismo recorrido por pasos que un comando anotado — se resalta
  una parte, se atenúa el resto, y una llave de caracteres señala la columna.
- **Es un tipo aparte y no un campo de `comando-anotado`**, y lo decidió el
  material: la corrida verbosa del agente son cuarenta líneas y hubo que
  partirla en dos láminas, así que obligar a llevar el comando encima habría
  producido un ítem que no cabe en pantalla. El `comando` va como contexto
  opcional, en pequeño. El dibujo sí se comparte.
- **Las cinco salidas del curso, migradas**: 22 anotaciones que antes eran un
  párrafo de notas del docente. Antes se señalaban con el dedo hacia una
  pantalla compartida por Zoom, que es exactamente lo que no funciona.
- La validación exige que cada anotación exista y sea inequívoca, como los
  segmentos de un comando — y hace más falta, porque una salida se copia y se
  pega y un espacio de más se cuela solo.

### El ritmo: preguntas y pausas repartidas (batch 29)
- Había **ocho momentos de interacción en ocho horas**, y `s2-reto-4` eran 107
  minutos con cero. Ahora son **veintiuno**, y ningún tramo pasa de 25 minutos.
- **El criterio está escrito y se comprueba solo**: nada dura más de 25 minutos
  seguidos, y una unidad de más de 40 necesita al menos dos momentos.
  `validar-contenido` avisa, `CONVENTIONS.md` §17 lo explica, y `ritmoDe` /
  `reprochesDeRitmo` lo calculan con nueve tests. El curso real es uno de ellos.
- **Siete preguntas nuevas, todas antes del contenido que responden.** Ninguna
  es control de lectura: se apuesta antes de correr el escenario silencioso, se
  elige qué acción dejarías que un agente dispare solo, y se contesta qué pasa
  con una cobertura del 97% en un intervalo del 90%. Cada una con su solución y
  sus descartes.
- **Cinco pausas, todas antes de algo caro** y no después: antes de teclear,
  antes de cablear el grafo, después de levantar el entorno.
- 33 minutos comprados y 33 pagados, sacados de un minuto aquí y allá en
  treinta ítems de prosa. Las dos sesiones siguen en 240.

### Diagrama de pasos al abrir cada reto (batch 28)
- Los cinco retos abren ahora con **`Los pasos de este reto`**: pasos numerados
  en columna y un hexágono al final con lo que se llevan — el criterio de
  aceptación cuando lo hay, la pregunta abierta cuando no. Es el mapa del
  trabajo, no de la solución.
- Tres de ellos hacen un trabajo que la prosa no hacía: el del reto 1 enseña
  que el reto es hacer lo mismo dos veces y que la segunda no encuentra nada;
  el del 3, que es el único donde no se escribe una línea; el del 5 pone el
  freno **antes** del permiso, que es el argumento de la unidad.
- Van en `flowchart TD` y no `LR`: cinco cajas repartidas a lo ancho dejan el
  texto ilegible proyectado. Las dos gramáticas —abanico para relacionar,
  columna para enumerar— están en `CONVENTIONS.md` §16.
- **Todos los diagramas del curso se ven más grandes.** Mermaid escribía un
  `max-width` con el ancho natural del dibujo en el `style` del propio SVG:
  correcto en un documento, contraproducente proyectando. Ahora ocupan el ancho
  de la lámina, con un tope de altura para que uno alto no se salga.

### El recap de apertura, con diagramas (batch 27)
- Las dos sesiones abren ahora con un **diagrama de conjunto**, después de la
  asistencia y antes del caso. El sábado repasa el programa —Docker, GitHub
  Actions, Kubernetes, MLflow → la flota de 192 → ¿y ahora, quién los mira?—;
  el domingo repasa lo construido —3 herramientas, un LLM, 20 líneas de ReAct →
  el agente de ayer → ¿y ahora, se puede confiar?
- **Los dos tienen la misma forma**, y ahí está el valor: entradas en abanico,
  un nodo central, un rombo con la pregunta de la que cuelga la sesión, y una
  flecha punteada al futuro con el tiempo que falta como etiqueta. Quien estuvo
  el sábado reconoce el dibujo del domingo sin que se lo expliquen. La gramática
  queda escrita en `CONVENTIONS.md` §16.
- Los recaps en cadena no funcionan: seis nodos en fila los escala Mermaid hasta
  hacerlos ilegibles proyectados. En abanico ocupan el ancho y se leen desde el
  fondo del aula.
- `s1-arquitectura` se queda donde estaba: es la planta de la plataforma, no un
  repaso del programa, y hace falta para leer la telemetría que viene después.

### Los comandos, desenvueltos · sesión 2 (batch 26)
- **La anatomía de una corrida verbosa, en dos láminas** con la salida real del
  agente: lo que hizo —memoria, llamadas a herramienta, diagnóstico— y lo que
  concluyó —reflexión, recomendaciones, cierre del bucle. Partida en dos porque
  cuarenta líneas no entran proyectadas, y unas líneas fuera de cuadro en la
  lámina que enseña a leer una salida sería una broma.
- **`make memoria` entra al curso**, con el JSON real. El gancho es que el
  archivo ya tiene contenido antes de empezar el domingo: lo escribió el agente
  del sábado. La memoria deja de ser una promesa del diseño.
- **`make actuar` contra `make agente` es una palabra**, `-e
  EJECUTAR_ACCIONES=1`, y dónde va importa: a la izquierda del nombre del
  servicio está Docker, a la derecha el programa.
- `s2-r5-comparacion` dejó de describir los dos resultados y ahora los muestra
  — los dos bloques `ACCIÓN` reales, lado a lado. Con la advertencia de que el
  texto del que frena no lo escribió el LLM: está literal en `accion.py`.
- Dos errores del material corregidos: **`--verboso` no imprime las llamadas a
  herramienta** —salen siempre— y **`make reentrenamientos` no existe**; la
  bitácora se lee por la API o en la interfaz.

### Los comandos, desenvueltos · sesión 1 (batch 25)
- De 26 comandos del curso, 22 eran `make X` sin abrir. La sesión 1 abre ahora
  con una **tabla de los siete atajos y lo que cada uno ejecuta de verdad**, y
  cinco `comando-anotado` explican el comando real —no el atajo— parte por
  parte: `up` contra `run`, `--rm`, `-d`, `-e`, la costura entre el servicio y
  el programa que corre dentro, y el `run` que aparece dos veces en la misma
  línea sin ser el mismo.
- **Dos salidas reales, con su lectura**: la de `make seed` —cuyas cuatro
  etapas son las cuatro flechas del diagrama de arquitectura, en orden— y la de
  `make verificar --reto 2`.
- La receta de `make romper` se muestra tal cual está en el Makefile, con las
  líneas que importan resaltadas. Lo que enseña es lo que **no** está: no hay
  `entrenar`. El mundo cambió y los modelos siguen igual.
- Corregido un error del material: `--verboso` no imprime las llamadas a
  herramienta —esas salen siempre— sino un resumen al final. Lo encontró abrir
  el comando.
- Los 16 minutos que esto cuesta salieron de donde sobraban, casi todos del
  reto 3. Las dos sesiones siguen en 240.

### El markdown llega a donde hacía falta
- Nuevo componente `Prosa`: la explicación de un segmento anotado, el "qué hay
  que ver" de una demo y las celdas de una tabla se dibujaban como texto plano.
  El material tenía comillas invertidas ahí desde el batch 16, y salían
  proyectadas con las comillas a la vista.
- **`resaltar:` en un ítem de código ya funciona.** El campo existía desde el
  batch 4 y ningún renderizador lo miraba. Ahora Shiki marca las líneas y el CSS
  las pinta; las líneas se cuentan sobre lo mostrado, no sobre el archivo.

### `npm run humo` ya no pasa contra una construcción vieja
- Enumeraba los ítems leyendo el YAML y los abría contra el servidor que
  hubiera levantado. Con uno viejo, un `?item=` inexistente no da error: la
  página cae en el primer ítem y devuelve 200, así que las pantallas nuevas
  pasaban sin haberse abierto. Ahora comprueba primero que el servidor conoce
  todos los identificadores y aborta diciendo cuál falta.

### El caso, como contenedor propio (batch 24)
- Nuevo tipo **`caso`**, y no solo de ítem: también de **unidad**. Los cinco
  retos ocurren dentro de una misma cadena de retail, y ese marco era hasta hoy
  un `markdown` de tres minutos perdido entre veinte.
- **El caso no es un atributo del curso.** Hay cursos sin ninguno y cursos con
  varios; un campo `Curso.caso` obliga a que haya exactamente uno. Es
  contenido, igual que un reto o un repaso, y por eso vive en la jerarquía de
  unidades e ítems.
- El texto vive **una sola vez**, en `contenido/casos/retail-192.yml`, y las dos
  sesiones lo referencian con `archivo:`. El domingo existe para que quien no
  vino el sábado oiga lo mismo, no un resumen.
- Se dibuja como una tarjeta con borde de acento: las **cifras** en grande
  arriba —192 modelos, 14 días, 1 job— y los cuatro bloques del relato en dos
  columnas. Las cifras son obligatorias en validación: un caso sin números es
  una anécdota.
- Las dos aperturas quedaron partidas en tres unidades cortas —apertura, caso,
  repaso— en vez de una larga que mezclaba asistencia, marco y telemetría. Los
  minutos no se movieron: se cuentan de abajo hacia arriba, así que reagrupar
  ítems no puede alterar ningún total. Las dos sesiones siguen en 240.
- Se cayó `s1-el-numero`: era un ítem entero para decir que son 192 modelos, y
  la tarjeta del caso ya lo dice en grande.

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

### La solución dentro del ítem de pregunta (batch 23)
- `ItemPregunta` gana `solucion`, con su explicación y sus `descartes` — por qué
  las otras opciones no, que en tres de las cuatro preguntas del curso es donde
  está el razonamiento interesante.
- **Viaja dentro del revelado**, no con la carga de la página: es el mismo trato
  que `correcta`, y por la misma razón — en el HTML cualquiera la leería antes
  de contestar. `solucion` entra en `CAMPOS_PRIVADOS`.
- Los descartes se anclan por el texto de la opción y el cargador exige que
  exista: uno inventado se dibujaría igual y parecería una opción más.
- Las cuatro preguntas del curso ganan la suya.

### Batch 25, simplificado antes de implementarlo
- Decisión del docente: para explicar lo que `make` envuelve **no hace falta un
  tipo de "capas"** — bastan dos `comando-anotado` seguidos, el que se teclea y
  el que eso ejecuta. El batch queda reducido a lo que sí falta: **poder anotar
  una salida**, que hoy no existe en ningún tipo.

### Auditoría del contenido, y una segunda ronda de ocho batches
- Revisado el material completo —131 ítems— contra seis requisitos del docente:
  **cinco no estaban y uno estaba a medias.** Ninguno era un fallo de ejecución
  de los batches 15 a 22; son cosas que aquellos batches nunca incluyeron.
- Inventario publicado con la hora de reloj de cada ítem, para usarlo de guion.
- Abiertos los batches 23 a 30. El hueco mayor es el 25–27: **22 de los 26
  comandos del curso son `make X` sin abrir**, y hay un solo ítem que muestra
  una salida, sin anotar.
- `CONVENTIONS.md` §13 gana su excepción: un batch puede cruzar unidades cuando
  el trabajo es un conjunto de diagramas con lenguaje visual común, o un reparto
  global como el del ritmo. Debe justificarlo en su propio texto.

### Contenido · S2·U4, el cierre (batch 22) — y el curso queda escrito
- 13 ítems, 50 minutos. **131 ítems y 480 minutos en total, sin un solo
  `Pendiente` en el contenido.**
- La tabla de los nueve errores lleva una sola columna a la derecha: dónde vivía
  el arreglo. Leída entera, la conclusión la saca la sala — y el ítem siguiente
  es una métrica con un solo número, **0**, y la unidad "estaban en el modelo de
  lenguaje".
- Las dos citas que quedaban sin usar son las mejores para esta tesis: el umbral
  mal calibrado que criticó el propio agente, y las tres objeciones gastadas
  contra un campo que nadie había definido.
- Ítem nuevo que el brief no pedía: cinco cosas para hacer el lunes, ninguna de
  las cuales necesita un agente. Es lo que queda si no vuelven a tocar
  LangGraph.

### Contenido · S2·U3, de la recomendación a la acción (batch 21)
- 18 ítems, 60 minutos. Las dos reglas de la política se explican por separado,
  el interruptor tiene su propio ítem, y la traducción del objetivo también.
- El error propio —frenar por la urgencia que declara el agente— con la lección
  que generaliza: **no des permisos contra un campo que el propio agente
  redacta**.
- De ahí salió un ítem no planificado: el código respeta `urgencia: monitorear`,
  que en apariencia contradice esa regla. La resolución es la asimetría — se
  acepta lo que el agente diga para frenar, nunca para avanzar. Sin ese ítem,
  un alumno atento encuentra la contradicción y no tiene respuesta.
- Cifra verificada: los **24 modelos** por categoría son exactos y
  estructurales; los segundos que citaba el brief (1.5s, 1.4s) no son estables
  — medido acá dio 2.4s y 0.6s, así que el ítem no cita cronómetro.

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
