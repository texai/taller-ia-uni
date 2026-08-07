# Convenciones del repo

Reglas que NO son derivables del código. Mantener corto — si una convención
deja de aplicarse, borrarla.

---

## 1 · El contenido vive en YAML, no en la base de datos

La jerarquía completa del curso —curso, sesiones, unidades, ítems— se define en
archivos YAML dentro de `contenido/`. La base de datos **solo** guarda lo que
cambia durante una clase en vivo: dónde va el docente, qué preguntan los
alumnos, qué responden.

Por qué: el material del curso es código. Se revisa en un diff, se versiona con
el resto del repo, y se puede volver atrás. Un panel de administración para
editar contenido sería más trabajo y peor herramienta que un editor de texto.

**Excepción:** un contenido largo vive en su propio archivo y el YAML lo
referencia por ruta. Markdown bajo `contenido/md/`, fuentes PlantUML bajo
`contenido/puml/`, casos bajo `contenido/casos/`, y lo que haga falta después.
Meter tres párrafos —o un diagrama de nueve mensajes— dentro de una cadena YAML
hace ilegibles ambas cosas.

**Y cada unidad vive en su propio archivo.** El de la sesión es la cabecera y
el orden, nada más:

    contenido/sesiones/sesion-1.yml       cabecera + la lista de unidades
    contenido/unidades/s01-u04-reto1-a-mano.yml

El nombre carga tres cosas: `sNN` la sesión, `uNN` el orden dentro de ella, y
el resto una palabra que diga de qué trata. Así el listado alfabético **es** el
orden del dictado, y `git log` sobre un archivo es la historia de una unidad y
no de media sesión.

La razón es de edición, no de estética: un archivo de novecientas líneas se
edita con miedo. Se busca a ciegas, se pega en el sitio equivocado, y el diff
de un cambio de tres palabras entra en un archivo que otro cambio también
tocó. Partido, cada unidad se abre entera en una pantalla.

Dos reglas que lo sostienen, las dos con test:

- **Una unidad se escribe en un sitio o en el otro, no repartida.** Un
  `- archivo:` que además declare `titulo` se rechaza; media unidad acá y media
  allá es lo que se descubre cuando alguien edita el sitio equivocado y no pasa
  nada.
- **Los errores nombran el archivo de la unidad**, no el de la sesión. Un fallo
  del reto 4 que dijera «sesion-2.yml» obligaría a buscarlo entre novecientas
  líneas que ya no están ahí.

Las **imágenes y los descargables** son la única excepción a la raíz: viven en
`public/contenido/`, porque lo que se sirve por URL sale de `public/`. La ruta
del YAML es la de la URL sin traducción.

Lo que no cambia es la regla: **todo el material está versionado en el
repositorio**. No hay tablas de contenido, no hay panel de administración, no
hay nada que se edite en producción sin dejar rastro en un diff.

## 2 · Español para el dominio, inglés para lo técnico

Los nombres del dominio van en español: `curso`, `sesion`, `unidad`, `item`,
`docente`, `pauta`. Las APIs de terceros y los idiomas de programación quedan
como son: `useState`, `createClient`, `SELECT`.

Razón práctica: el YAML lo escribe una persona que enseña en español. Que el
archivo de contenido diga `unidades:` y no `units:` no es cosmético — es la
diferencia entre editarlo con confianza o con dudas.

## 3 · Las notas del docente nunca llegan al cliente del alumno

Cualquier ítem puede llevar `notas`. Esas notas se filtran **en el servidor**,
antes de serializar la respuesta. Nunca se envían y se ocultan con CSS.

Esta es una invariante de seguridad, no una preferencia: la pantalla del
docente se comparte por Zoom, y un alumno con las herramientas de desarrollador
abiertas leería en el HTML lo que el docente escribió para sí mismo. Vale lo
mismo para `respuesta` y `solucion` en los ítems de tipo `pregunta`.

**Y vale para `minutos`.** No es un secreto, es que no es información suya: el
presupuesto de tiempo lo escribe el docente para dictar, y un alumno que ve
«4′» en cada ítem sabe cuándo la clase va tarde. Eso cambia lo que la sala hace
con una explicación que se alarga — y con el reloj a la vista, una pregunta
buena a las 18:50 no se hace. Lo que el alumno sí tiene es el total de la
sesión, que ya está en la cabecera: las horas de inicio y de fin.

La lista completa vive en `CAMPOS_PRIVADOS`, en `especificacion.ts`, y hay un
test que la comprueba contra el curso real.

## 4 · El alumno puede mirar atrás, nunca adelante

El docente marca el ritmo. El alumno navega libremente hacia atrás; hacia
adelante, no.

Es una decisión pedagógica: si el material completo está a un clic, media clase
se adelanta y deja de escuchar.

**Y es una barrera de comportamiento, no de seguridad.** Conviene decirlo con
todas las letras, porque la primera versión de esta convención prometía que el
contenido posterior "no se le envía", y eso no se puede cumplir con las
decisiones que tomamos:

- La página del alumno es estática y lleva la sesión entera dentro.
- Para enviar solo lo ya visto, el servidor tendría que saber por dónde va la
  clase. Esa posición vive en Realtime (§11), que el servidor no puede
  consultar.
- Enfocarlo de verdad exigiría un store en el servidor, es decir, una tabla —
  justo lo que §11 descarta.

Así que el bloqueo lo aplica el cliente. Un alumno con las herramientas de
desarrollador abiertas puede leer lo que viene. Es un costo aceptado: el riesgo
real es que alguien se adelante, no que se filtre nada — porque **lo que sí es
de seguridad son las notas del docente y las respuestas correctas, y esas no
salen del servidor** (§3). Esa distinción es la que importa: una cosa es que un
alumno curioso vea la siguiente lámina, y otra que lea lo que escribiste para
ti mismo.

## 5 · Realtime va directo contra Supabase

El canal en vivo NO pasa por Vercel. El navegador del alumno abre su WebSocket
contra Supabase Realtime y escucha los cambios de `estado_clase`.

Esto no es una preferencia de arquitectura: una función serverless no puede
sostener una conexión abierta, así que un WebSocket servido desde Vercel no
existe como opción. Supabase resuelve el problema porque el socket termina en
su infraestructura, no en la nuestra.

## 6 · No hay registro. Hay un docente

Supabase Auth con el registro **deshabilitado** en el panel del proveedor. El
único usuario se crea con `npm run clave-docente`, que usa la clave de servicio.

La ruta `/profe` no aparece en ninguna navegación, pero **sí está documentada**
en el README. Una URL secreta no es un mecanismo de seguridad; lo que protege
es la contraseña. Ocultarla de la navegación solo evita que un alumno curioso
se distraiga con un formulario que no le sirve.

## 7 · Los ítems de dictado son parte del material

El catálogo tiene dos familias:

| Familia | Qué es |
|---|---|
| `contenido` | Lo que el alumno ve y el docente explica |
| `dictado` | Lo que marca el ritmo: recesos, pausas para preguntas, asistencia |

Los de dictado no son decoración. Un docente concentrado en el tema se olvida
del receso, se olvida de tomar asistencia, y sobre todo se olvida de parar a
preguntar si alguien se perdió. Ponerlos en la pauta los convierte en material
en vez de en un acto de memoria.

## 8 · Catálogo de tipos de ítem

Agregar un tipo nuevo cuesta poco a propósito: una interfaz en `lib/tipos.ts`,
un renderizador en `components/items/`, una entrada en el registro. La apuesta
del producto es que crear material se parezca a escribir una lista, y eso solo
funciona si el catálogo cubre lo que un docente realmente necesita.

### Familia `contenido`

| Tipo | Para qué | Campos propios |
|---|---|---|
| `titulo` | Un corte de sección. Una idea sola | `destacado` |
| `markdown` | Prosa renderizada | `contenido` \| `archivo` |
| `codigo` | Fragmento con resaltado | `lenguaje`, `contenido` \| `archivo`, `lineas`, `resaltar`, `ruta` |
| `terminal` | Un comando, con su salida | `comando`, `salida`, `comandoWindows`, `duracion` |
| `diagrama` | Mermaid: secuencia, flujo, ER, componentes | `contenido` \| `archivo`, `clase` |
| `modelo-datos` | Tablas con sus columnas | `tablas[]` |
| `imagen` | Captura o figura | `archivo`, `pie`, `destacar` |
| `enlace` | Página que vale la pena visitar | `url`, `descripcion` |
| `archivo` | Descargable: PDF, Excel, Word, SVG, CSV | `archivo`, `descripcion` |
| `comparacion` | Dos lados, uno al lado del otro | `izquierda`, `derecha` |
| `metrica` | Un número grande y lo que significa | `valor`, `unidad`, `contexto`, `tono` |
| `tabla` | Datos, sin más | `columnas`, `filas`, `resaltar` |
| `cita-agente` | Cita textual de una ejecución real | `cita`, `procedencia`, `comentario` |
| `criterios` | Criterios de aceptación de un reto | `criterios[]` |
| `error-comun` | Un error que va a ocurrir, con su arreglo | `sintoma`, `causa`, `arreglo` |
| `demo` | Momento de demostración en vivo | `pasos[]`, `observar`, `respaldo` |
| `transicion` | Qué vimos, qué viene ahora, y dónde estamos | `vimos`, `viene` (el mapa se deriva) |
| `diagrama-secuencia` | Secuencia PlantUML, recorrible mensaje a mensaje | `fuente`, `mensajes[].explicacion` |
| `comando-anotado` | Un comando largo, explicado parte por parte | `comando`, `segmentos[]` |
| `salida-anotada` | Una salida de terminal, explicada trozo a trozo | `salida`, `anotaciones[]`, `comando` |
| `glosario` | Una selección del glosario, como lámina | `terminos[]` \| `grupo` |
| `caso` | El marco de negocio dentro del cual ocurre todo lo demás | `empresa`, `cifras[]`, `bloques[]`, `archivo` |
| `diff` | Un cambio, enseñado como cambio: antes y después | `antes`, `despues`, `ruta`, `lenguaje`, `explicacion` |

### Familia `dictado`

| Tipo | Para qué | Campos propios |
|---|---|---|
| `lectura` | Ventana para leer código y ejecutar, con reloj ajustable | `minutos`, `archivos[]`, `comandos[]`, `observar` |
| `receso` | Descanso, con reloj | `minutos` |
| `pausa-preguntas` | Pausa deliberada para preguntas | `disparadores[]` |
| `asistencia` | Recordatorio de tomar lista. Solo el docente | `nota` |
| `pregunta` | El docente pregunta a los alumnos | `pregunta`, `opciones`, `respuesta`, `permiteOmitir`, `visibilidad` |

### Los fragmentos de código llevan los números del archivo

Un `codigo` con `ruta` se numera con las líneas **del laboratorio**, no con un
1, 2, 3 del fragmento. Un fragmento numerado desde uno invita a buscar la línea
4 de un archivo donde esa línea es otra cosa.

Los números viven en `numeros: ["13-21", "32-33"]` —un rango por bloque
contiguo— y **no se escriben a mano**: los calcula `npm run numerar` leyendo el
archivo, y `validar-contenido` comprueba que sigan cuadrando. Entre dos bloques
la lámina dibuja un separador punteado, porque decir «aquí falta un trozo» es
parte de no mentir sobre el archivo.

La consecuencia es la regla: **un fragmento numerado tiene que ser literal.**
Nada de comentarios explicativos añadidos para la lámina — en cuanto se añade
uno, el fragmento deja de encontrarse y se queda sin numerar. Las explicaciones
van en `notas`, que es donde el docente las lee de todas formas. Costó
reescribir catorce fragmentos que se habían ido adaptando poco a poco, y ese es
exactamente el problema que la regla evita: nadie sabía cuáles eran fieles.

Un `codigo` sin `ruta`, o cuyo contenido no es una cita —la forma de un objeto,
un ejemplo inventado—, no lleva números y no debería llevar `ruta`.

### Por qué `diff` y no `comparacion`

`comparacion` enfrenta dos **ideas** en prosa: lo que vio el MAPE contra lo que
vio el sesgo. En un `diff` los dos lados son el **mismo código en dos
momentos**, y lo que importa es exactamente lo que se movió entre uno y otro.

Se dibuja en una sola columna, no en dos paneles enfrentados: dos paneles
obligan a la vista a saltar buscando la línea equivalente, y proyectado eso no
funciona. Y va sin resaltado de sintaxis, porque acá el color significa «esto
cambió» — dos sistemas de color en el mismo bloque compiten y la única
distinción que importa se pierde.

La diferencia se calcula por subsecuencia común (`src/lib/diff.ts`) y no
comparando posición a posición: con lo segundo, insertar una línea marca como
cambiadas todas las de abajo, y un diff con todo en rojo no se lee.

### Por qué `lectura` es de la familia `dictado`

Muestra código y manda correr comandos, así que la tentación es ponerla en
`contenido`. No lo es por lo mismo que un receso no lo es: **no informa,
interrumpe**. Durante esos minutos el docente no habla y la sala trabaja, y la
lámina existe para decir en qué y por cuánto tiempo.

De ahí salen sus tres decisiones. Cuenta como momento de interacción y corta el
tramo en `ritmoDe` —trabajar sí es participar—; es un solo paso, porque la
lista tiene que estar entera a la vista y no descubrirse de a poco; y su reloj
se puede mover sin salir del ítem. Esto último no es un adorno: una cuenta
regresiva que no se puede alargar es una que el docente apaga la primera vez
que la sala va lenta, y a partir de ahí no sirve el resto del día.

El reloj es **local a cada pantalla** y arranca cuando cada uno llega al ítem,
igual que el del receso. Sincronizarlo entre todas sería un mensaje más por el
canal de la pauta, y no está decidido que haga falta.

### Comunes a todos

`id`, `tipo`, `titulo`, `entradilla`, `notas` (privadas), `minutos`.

### Dónde vale escribir markdown

En **el cuerpo de cualquier campo de prosa**: `contenido`, las notas del
docente, la explicación de un segmento anotado, el `observar` y el `respaldo`
de una demo, las celdas de una tabla, los bloques de un caso. Todos pasan por
`Markdown` o por `Prosa`.

En **`titulo` y `entradilla`, no**. Son texto plano a propósito: además de
proyectarse, viajan al índice lateral y a la vista previa del mando, donde un
asterisco suelto se vería tal cual.

La regla vale la pena porque el fallo es silencioso en la peor dirección: una
comilla invertida en un campo que no la interpreta no rompe nada, no falla en
validación, y se descubre proyectada delante de la clase.

### Los tipos que merecen justificación

- **`comparacion`** — la mitad de lo que enseña este taller es un contraste:
  MAPE contra sesgo, el diagnóstico antes y después de la reflexión, lo que el
  tablero ve contra lo que está pasando. Dos ítems de markdown seguidos pierden
  justo lo que importa.
- **`cita-agente`** — el taller tiene material que no se puede inventar: el
  agente acusándose de dramatizar, o insistiendo en que sí hay deriva mientras
  su propio titular decía lo contrario. Necesita un tipo propio que deje claro
  que es literal y no una paráfrasis nuestra.
- **`error-comun`** — trece incidencias reales salieron construyendo el
  laboratorio. Anticiparlas convierte "se me rompió" en "ah, es la del pipe".
- **`demo`** — distinto de `terminal`: acá el docente ejecuta delante de todos.
  Lleva los comandos, lo que debería salir, cuánto tarda, y un respaldo por si
  falla en vivo.
- **`salida-anotada`** — es la mitad que faltaba de enseñar un comando. Saber
  qué hace `docker compose run --rm` es media clase; la otra media es saber
  leer lo que imprime, y `terminal` la dibuja en bloque, sin señalar nada. Es
  un tipo aparte y no un campo de `comando-anotado` porque una salida larga y
  su comando **no caben en la misma lámina** —la ejecución verbosa del agente son
  cuarenta líneas, y hubo que partirla en dos— y porque hay salidas que valen
  solas, como la de `make memoria`.
- **`diagrama-secuencia`** y **`comando-anotado`** — ver §10. Un diagrama
  completo proyectado se lee como una maraña, y un comando de doce palabras se
  lee como una sola cosa opaca. Los dos necesitan poder mirarse de a una parte.
- **`transicion`** — es el tipo más aburrido del catálogo y probablemente el
  más útil. En un taller de cuatro horas la gente se pierde en las costuras, no
  en el contenido. Además de la prosa, **dibuja el mapa**: qué unidades del
  mismo nivel quedaron cerradas y cuál viene. Ese mapa NO se declara en el
  YAML — la aplicación sabe dónde está el ítem dentro del curso y lo deriva
  sola. Declararlo sería pedirle al docente que mantenga a mano una
  información que el programa ya tiene, y que quedaría desactualizada la
  primera vez que se reordene una unidad.
- **`caso`** — ver abajo.

### El glosario sí es un atributo del curso

Y conviene decir por qué, porque el caso deliberadamente **no** lo es y la
distinción no es caprichosa:

| | El caso | El glosario |
|---|---|---|
| Qué es | Contenido | Referencia |
| Ocupa minutos | Sí | No |
| Cuántos puede haber | Cero, uno o varios | Uno |
| Cuándo está disponible | En su sitio de la escaleta | Siempre |

El glosario vive en `contenido/glosario.yml` y llega entero a `Curso.glosario`.
Se dibuja de dos maneras, y las dos hacen falta:

- **Como lámina**, con el tipo `glosario`, que **nombra** términos en vez de
  copiarlos. Dos láminas que definan «sesgo» con palabras distintas es
  exactamente lo que ese tipo existe para impedir, y un término que no está en
  el archivo falla en validación con la lista de los que sí están.
- **Como panel**, siempre a mano en las dos vistas. Es la mitad que importa: un
  término explicado a las 15:40 no sirve a las 18:20, y en clase nadie levanta
  la mano para preguntar qué era la cobertura. Se abre y se cierra sin tocar la
  posición de la clase.

Cada entrada admite un campo `ojo`, y en varias es la mitad útil: no es un
matiz de la definición, es la corrección de lo que la sala **cree** que
significa el término. Va en su propia caja por eso.

### El caso es contenido, no un atributo del curso

`caso` es el único nombre que aparece en las dos listas de tipos: es un
`TipoItem` y también un `TipoUnidad` (`repaso | reto | cierre | caso`).

La alternativa era un campo `caso` en `Curso`, y no sirve: hay cursos sin
ningún caso —que tendrían que declararlo vacío— y cursos con varios —que no
tendrían dónde poner el segundo. Un campo en la jerarquía obliga a que haya
exactamente uno. El caso es contenido, igual que un reto o un repaso, y por eso
ocupa un renglón del índice en vez de una propiedad de la cabecera.

Dos reglas que sostiene el cargador:

- **Las `cifras` son obligatorias.** Un caso sin números es una anécdota. Lo
  que sostiene ocho horas de taller es que sean 192 modelos, no "muchos".
- **Un caso que se cuenta dos veces se escribe una.** El texto va en
  `contenido/casos/*.yml` y los ítems lo referencian con `archivo:`. Las dos
  sesiones de este taller abren con el mismo caso —el domingo existe para que
  quien no vino oiga *lo mismo*, no un resumen—, y escrito dos veces serían dos
  casos que se separan en cuanto alguien corrige uno. Las `notas` privadas
  siguen siendo de cada ítem: el mismo caso se lee en cinco minutos el sábado y
  en tres, cronometrados, el domingo.

## 9 · Los identificadores son estables

`id` de curso, sesión, unidad e ítem no se reciclan ni se renumeran. La posición
del docente se guarda por `id`, y las preguntas de los alumnos quedan atadas al
ítem donde se hicieron. Renumerar rompe el historial de una clase ya dictada.

Para reordenar, se mueve el bloque en el YAML: el orden lo da la posición en el
archivo, no el identificador.

## 10 · Ítems con pasos internos

Algunos ítems no se explican de una sola vez. Un diagrama de secuencia
proyectado entero es una maraña que nadie sigue; un comando de doce palabras
se lee como un bloque opaco. Lo que falta en los dos casos es lo mismo: poder
enfocar **una parte a la vez**, sabiendo de dónde viene y a dónde va.

Por eso un ítem puede declarar `pasos`, y la posición de la clase deja de ser
`(unidad, ítem)` para ser `(unidad, ítem, paso)`.

Consecuencias, y son la razón de que esto sea una convención y no un detalle:

- **La flecha derecha avanza al paso siguiente**, y solo salta al ítem
  siguiente cuando se acabaron los pasos. Al revés con la izquierda.
- **La sincronía transporta el paso.** Un alumno que llega tarde tiene que
  aterrizar en el mensaje 4 del diagrama, no al principio del diagrama.
- **El paso va en la URL**, para poder recargar sin perder el lugar.
- **Un ítem sin `pasos` se comporta como siempre.** La capacidad es opcional y
  no complica los diecisiete tipos que no la usan.

El primer paso de un ítem con pasos muestra siempre el conjunto completo, sin
nada enfocado: primero el mapa, después el recorrido.

Los usan tres tipos: `diagrama-secuencia`, `comando-anotado` y
`salida-anotada`. Los dos últimos comparten el dibujo —resaltar una parte,
atenuar el resto, y una llave de caracteres debajo señalando la columna— y por
eso comparten componente. Lo que cambia es el reparto de la lámina: en un
comando la línea es una y larga, y se encoge hasta caber a lo ancho; en una
salida son veinte cortas, y lo que se sale de la pantalla es por abajo, así que
el tamaño se calcula **reservando sitio para la explicación**. Una salida que
empuja su propia explicación fuera de cuadro no explica nada.

**Y los pasos se cuentan en un solo sitio**: `pasosDe`, en `navegacion.ts`. Un
tipo nuevo con pasos que se olvide de aparecer ahí se queda en el paso 0 para
siempre — la lámina se dibuja, no falla nada, y las explicaciones no se ven
nunca. Hay un test que lo cuida.

### PlantUML se renderiza en construcción, no en clase

`diagrama-secuencia` se escribe en PlantUML. PlantUML es Java y Vercel no
ejecuta Java, así que la imagen se genera **al construir** y se sirve estática.

No es solo una limitación de la plataforma: depender de un servicio externo
para dibujar un diagrama en mitad de una clase es una forma innecesaria de
quedarse sin material. Lo que se proyecta ya está en disco antes de que empiece
la sesión.

El modo enfocado **no** se deriva de esa imagen. La fuente PlantUML se parsea y
el recorrido se dibuja aparte, porque el SVG que produce PlantUML no expone sus
mensajes de forma que se puedan resaltar con confianza. Una sola fuente de
verdad, dos salidas.

### El dibujo es nuestro, la fuente es PlantUML

`diagrama-secuencia` se escribe en PlantUML y se **dibuja en SVG desde la
fuente parseada**. No se genera ninguna imagen, ni en construcción ni en
tiempo de ejecución.

La razón es el paso 0. Si el diagrama completo lo dibujara PlantUML y el
recorrido enfocado lo dibujáramos nosotros, habría dos dibujantes para la
misma figura y el cambio de uno al otro ocurriría a mitad del ítem, delante de
la clase. De paso se evita depender de Java —que Vercel no ejecuta—, de un
servicio externo en mitad de una clase, y de una carpeta de imágenes
versionadas que puede quedar desfasada de su fuente sin que nadie lo note
hasta proyectarla.

El lector cubre solo lo que el curso usa: participantes, mensajes, notas y
activaciones. **Cualquier otra construcción de PlantUML falla al cargar el
contenido, nombrando la línea.** Ignorarla en silencio dibujaría un diagrama al
que le faltan flechas.

Las explicaciones de los mensajes van **por índice**, al revés que los
segmentos de `comando-anotado`, porque dos flechas pueden decir lo mismo y el
texto no las distinguiría. El precio es que se descolocan si alguien inserta
una flecha en medio, así que el cargador exige que la cuenta coincida con la
fuente y admite un `texto` de ancla. Y los pasos se cuentan sobre los mensajes
de la fuente, nunca sobre las explicaciones escritas: contarlos al revés haría
que olvidar una explicación escondiera un mensaje entero del recorrido.

### Un comando anotado se declara por texto, y se ve entero

`comando-anotado` declara sus partes **por texto**, nunca por índice de
caracteres: un índice se rompe en cuanto alguien corrige un espacio, y se rompe
en silencio. El precio es que hay tres formas de equivocarse, y el cargador
falla con las tres — un segmento que no aparece, uno que aparece dos veces (es
ambiguo cuál anotar) y dos que se solapan (uno se traga al otro, y esa
explicación nunca llega a enfocarse).

Al enfocar una parte, **el resto del comando sigue en pantalla**, atenuado. El
punto es ver la parte sin perder el todo; citar el trozo suelto en una viñeta
es exactamente lo que no enseña dónde va.

La llave que señala la parte se dibuja **con caracteres**, contando columnas,
porque el comando va en monoespaciada y una llave desalineada es peor que
ninguna. Por lo mismo el comando se encoge para caber en vez de desplazarse
horizontalmente: envolverlo rompería la alineación, y una barra horizontal
obliga a arrastrar con el ratón delante de la clase.

## 11 · No creamos tablas. Ninguna

Supabase se usa para **dos cosas y nada más**: Auth, para que el docente entre
por `/profe`, y Realtime, para el canal en vivo. No hay tablas nuestras en la
base.

Es una decisión deliberada, no una etapa. Todo el material del curso vive
versionado en el repositorio (§1), y lo único que ocurre durante una clase
—dónde va el docente, qué preguntan los alumnos— es efímero por naturaleza: se
acaba cuando se acaba la clase. Guardarlo en una tabla sería inventar un
problema de retención, de migraciones y de políticas para datos que nadie va a
consultar el lunes.

### Cómo se sincroniza sin base de datos

Realtime tiene dos mecanismos que no tocan Postgres:

| Mecanismo | Para qué acá |
|---|---|
| **Broadcast** | El docente publica cada movimiento. Las preguntas de los alumnos viajan por el mismo canal |
| **Presence** | Lleva la posición actual del docente. Quien se conecta recibe el estado completo de entrada, y así el que llega tarde aterriza donde va la clase |

Presence es la pieza que hace innecesaria la tabla. Sin ella habría que
persistir la posición en algún lado para que un alumno que abre el navegador a
las 16:20 supiera dónde está la clase; con ella, ese estado lo mantiene el
propio canal.

**Consecuencia que hay que aceptar:** si el docente pierde la conexión, el
estado de presencia se va con él. Al reconectar vuelve a publicar su posición,
que su propio cliente conserva en la URL. Un alumno que se conecte durante esos
segundos ve "reconectando" en vez de una posición vieja, que es la lectura
correcta de lo que está pasando.

### El proyecto es compartido con `gen`

No hay proyecto propio: se usa el de `gen`, que ya tiene Postgres y Auth pero
no Realtime. Auth es **común a las dos aplicaciones**, y ahí está el filo.

Cualquiera que se autentique en `gen` queda autenticado también acá. Así que
"estar autenticado" no alcanza como criterio para mover la clase: le daría a un
futuro usuario de `gen` el control del dictado. Hoy no ocurre porque el usuario
es uno solo, y eso es justamente lo que lo vuelve fácil de olvidar.

Los canales de Realtime son **privados**, y la autorización se resuelve con una
política sobre `realtime.messages` —que es una tabla de Supabase, no nuestra—
comparando contra el identificador del docente:

```sql
create policy "solo el docente publica la pauta"
  on realtime.messages for insert
  to authenticated
  with check (
    realtime.topic() like 'taller:%'
    and auth.uid() = 'UUID-DEL-DOCENTE'
  );
```

El identificador va en una variable de entorno del servidor y en esa política.
Un usuario de `gen` puede iniciar sesión y no puede publicar nada.

Los alumnos **leen** el canal sin autenticarse, y pueden publicar únicamente en
el subcanal de preguntas.

### Nombres de canal con prefijo

Los temas de Realtime llevan prefijo: `taller:{curso}:{sesion}`. El proyecto es
compartido, y un nombre de canal genérico es de los que dos aplicaciones eligen
sin consultarse.

### La llave de servicio abre las dos aplicaciones

`SUPABASE_SERVICE_ROLE_KEY` salta todas las políticas de todo el proyecto, así
que también da acceso a los datos de `gen`. Solo en el servidor y en los
scripts de mantenimiento. Nunca en el repositorio, nunca en un componente
cliente.

## 12 · Una pregunta se revela cuando el docente lo decide

Un ítem `pregunta` puede ser **privada** —el recuento llega solo a la segunda
pantalla— o **pública**, y entonces se proyecta.

En las públicas hay tres estados, y el orden importa:

1. **Respondiendo.** En la pantalla proyectada se ve la pregunta y *cuántas
   personas ya contestaron*. **Nunca qué contestaron.**
2. **Revelado.** Ocurre por una de dos vías: **un clic del docente**, que puede
   cortar cuando quiera, o **automáticamente cuando ya respondieron todos**,
   porque a esa altura ya no hay a quién sesgar.
3. **En vivo.** Ya revelado, el recuento sigue actualizándose si alguien
   responde tarde.

El primer estado es toda la razón de la convención. Si los resultados se
proyectan mientras la gente contesta, los que faltan copian al grupo y la
pregunta deja de medir lo que quería medir. El contador sí puede verse —sirve
para saber cuándo cortar— porque no dice hacia dónde va la respuesta.

**El denominador sale de Presence.** No hay que declarar el tamaño del grupo:
el canal ya sabe cuántos alumnos están conectados, así que "respondieron todos"
se calcula solo. Si alguien se desconecta a mitad, el denominador baja con él,
que es la lectura correcta — no tiene sentido esperar por una pantalla que se
fue.

## 13 · Una unidad por iteración

El contenido del curso se escribe **una unidad por conversación**, nunca varias
a la vez.

No es una preferencia de orden: es que la calidad se degrada con el tamaño del
contexto. Una iteración que tiene que sostener las ocho unidades a la vez
escribe ocho unidades mediocres; una que solo sostiene la suya escribe una
buena. El batch de estructura (§3 de `TODO.md`) existe justamente para que cada
batch de contenido pueda ignorar al resto: la estructura ya dice qué unidad va
dónde y cuánto dura, así que escribir la de adentro no necesita mirar afuera.

Reglas para un batch de contenido:

- **Toca un solo archivo de unidad.** Si un batch modifica dos unidades, está
  mal partido.
- **No lee el resto del curso.** Lee su unidad, la estructura, y el material de
  origen en `texai/taller-ia-uni-lab`.
- **Respeta los minutos de la estructura.** Como referencia, entre dos y cuatro
  minutos por ítem: una unidad de 60 minutos lleva del orden de 20 ítems. Muy
  por encima significa que hay relleno; muy por debajo, que hay ítems que en
  realidad son tres.
- **Los identificadores no se reciclan** (§9), porque una unidad reescrita
  después de una clase ya dictada rompería el historial de esa clase.

### La excepción: lo que hay que hacer de una sola vez

La regla protege contra la degradación de contexto al escribir **prosa**. Hay
trabajo que es lo contrario, y partirlo por unidades lo empeora:

- **Un conjunto de diagramas que comparten lenguaje visual.** Cinco diagramas
  dibujados en cinco conversaciones son cinco dibujos distintos, y el alumno lo
  nota antes que nadie.
- **Un reparto global**, como el del ritmo de preguntas y pausas. Decidirlo
  unidad por unidad es exactamente lo que produce que una unidad de 105 minutos
  se quede sin ninguna.

Un batch que cruza unidades por una de estas razones **lo dice y la justifica en
su propio texto**. Si no puede justificarlo, está mal partido.

### Sobre las cifras

Este curso tiene números medidos —36,567 unidades, 13.8% a 14.5% de MAPE, los
umbrales por dimensión— y citas literales de ejecuciones reales del agente. **No
se inventan ni se redondean para que suenen mejor.** Si un batch necesita una
cifra que no está en el material de origen, la pide; no la estima.

## 14 · El docente dicta con dos pantallas, y solo una se proyecta

La sesión se dicta desde dos máquinas. Una proyecta y se comparte por Zoom; la
otra —el **mando**, en `/profe/sesion/[sesion]/mando`— la mira solo el docente.

De ahí sale una regla que decide dónde va cada cosa nueva: **si algo no debe
verlo la clase, va en el mando y solo en el mando.** Las preguntas que llegan
en privado, el reloj que dice que la unidad se está pasando, el aviso de que
toca el receso. La pantalla proyectada muestra el material y nada más — con la
excepción deliberada del recuento de una pregunta, que se proyecta porque
sirve para saber cuándo cortar y no dice hacia dónde va la respuesta (§12).

Esto **no** reemplaza a §3. Las notas del docente se siguen filtrando en el
servidor para la carga del alumno: la separación entre las dos pantallas es de
ergonomía, no de seguridad, y las dos son cargas del docente.

**Las dos pantallas son pares, no maestro y esclavo.** Cualquiera de las dos
mueve la clase y la otra la sigue. Eso obliga a tres cosas, y las tres se
descubren rompiéndolas:

- El canal va con `broadcast: { self: false }`, o publicar y escuchar en el
  mismo cliente es un bucle.
- Una pantalla **no reemite la pauta que acaba de recibir**. Si lo hace, la
  reemisión lleva una marca de tiempo más nueva que la del movimiento que la
  causó — y pisa el movimiento siguiente si el docente pulsa dos veces
  seguidas en la otra máquina.
- Cualquier estado que se pueda cambiar desde las dos (la posición, el paso, el
  interruptor de dictado) se resuelve **por marca de tiempo: gana el más
  reciente**, y las marcas tienen que salir del mismo reloj. Por eso `publicar`
  devuelve la pauta que emitió en vez de que cada pantalla se invente la suya.

## 15 · El tiempo se cuenta de abajo hacia arriba

**Los minutos los declara el ítem. Nada más.** La unidad vale la suma de sus
ítems, la sesión vale la suma de sus unidades, y el curso vale la suma de sus
sesiones. Ningún total se escribe a mano: todos se calculan.

La razón es que el ítem es la pieza más pequeña y la única que alguien puede
estimar de verdad — "esto se explica en cuatro minutos" es una frase que se
puede sostener; "esta unidad dura sesenta" es un presupuesto, y un presupuesto
no es una medida.

Y la razón práctica: **dos cifras sobre lo mismo terminan siempre en
desacuerdo.** Durante un tiempo la unidad declaró sus minutos *y* sus ítems los
suyos. Cuadraban el día que se escribieron, y el reloj del mando se escribió
sumando ítems mientras el índice del docente prefería el presupuesto de la
unidad — dos pantallas del mismo curso a punto de anunciar totales distintos.
Había hasta un script que vigilaba el descuadre, que es la señal de que el
modelo estaba mal: cuando hace falta un vigilante para que dos números no se
contradigan, sobra uno de los dos números.

Consecuencias:

- `Unidad` **no tiene** campo `minutos`, y el cargador **rechaza** un YAML que
  lo declare, con un mensaje que dice dónde van. Ignorarlo en silencio sería
  peor: una cifra escrita que el programa descarta se lee como si valiera.
- `minutosDeUnidad`, `minutosDeSesion` y `minutosHasta` viven en
  `navegacion.ts` —puras, sin `node:fs`, usables en el navegador— y
  `contenido.ts` reexporta la primera como `minutosDe`. Una sola regla, un solo
  sitio.
- Un ítem sin `minutos` suma cero. Es el caso normal de un título o una
  transición, y no hay que inventarle una duración.
- Lo que sí se compara es la suma contra el mundo: `npm run build` avisa si los
  ítems de una sesión no suman lo que dura la sesión según `horaInicio` y
  `horaFin`. Esa comparación es legítima porque las dos cifras miden cosas
  distintas — una es el plan y la otra es el aula.

## 16 · Los diagramas que abren algo comparten una gramática

Los dibujos que abren algo —el recap de cada sesión, el mapa de pasos de cada
reto— **no son ilustraciones sueltas**. Se leen en veinte segundos porque la
sala ya reconoce su forma, y eso solo pasa si todos los de su clase tienen la
misma. Son dos clases, y cada una tiene su forma.

### El recap de sesión: abanico, `flowchart LR`

La gramática es de cuatro piezas:

    cajas de lo que ya existe   →   [(lo que se construyó con ellas)]
                                          ↓
                                    {la pregunta incómoda}
                                       ↙            ⇢ (punteada)
                          la respuesta de hoy    lo que viene

- **Las entradas van en abanico a la izquierda**, no en cadena. Una cadena de
  seis cajas en fila la escala Mermaid hasta hacerla ilegible proyectada; un
  abanico de tres o cuatro sobre un nodo central ocupa el ancho y se lee.
- **El rombo es lo único que se señala con el dedo.** Es la pregunta de la que
  cuelga la sesión.
- **La flecha punteada es siempre el futuro**, con el tiempo que falta como
  etiqueta: `-.->|las proximas 4 horas|`.
- **Sin acentos en las etiquetas**, como en el resto de los diagramas del
  curso.

Cuando el sábado abre con "Docker, GitHub Actions, Kubernetes, MLflow → la
flota → ¿quién los mira?" y el domingo con "herramientas, LLM, bucle → el
agente de ayer → ¿se puede confiar?", nadie tiene que explicar el segundo
dibujo: ya se aprendió a leerlo.

### El mapa de pasos de un reto: columna, `flowchart TD`

Los cinco retos abren con el mismo dibujo:

- **Pasos numerados** —`1 ·`, `2 ·`— de arriba abajo, entre cuatro y cinco.
- **Un hexágono al final** —`{{...}}`— con lo que se llevan: el criterio de
  aceptación si el reto lo tiene, y si no, la pregunta que queda abierta.
- **Es el mapa del trabajo, no de la solución.** Dice qué se va a hacer; cómo,
  lo descubren ellos. Un paso que revele la respuesta sobra.

Va en vertical y no en horizontal por una razón que solo se ve proyectando:
cinco cajas en fila las encoge Mermaid hasta dejar el texto a menos de la mitad
del tamaño del resto de la lámina. En columna cada caja usa el ancho que
necesita, y el dibujo crece hasta el tope de altura.

### Por qué el ancho importa tanto

Mermaid escribe un `max-width` en el atributo `style` del propio SVG, con el
ancho natural del dibujo. Eso es correcto para un documento y es lo contrario
de lo que uno quiere proyectando. `Mermaid` lo pisa después de dibujar
(`ocuparElAncho`, en `components/items/diagrama.tsx`) y le pone un tope de
altura para que un diagrama alto no se salga de la pantalla.

Queda un caso que ninguna de las dos gramáticas arregla: **una cadena larga es
ancha y punto.** `s1-arquitectura` son diez nodos en cadena, y ni el abanico ni
la columna le sirven — es literalmente el recorrido de un dato. Se queda como
está, y es la excepción consciente a esta sección.

### Dos trampas de Mermaid

Costaron encontrar y conviene no volver a pisarlas: una etiqueta escrita
`-.texto.->` se dibuja truncada, así que va como `-.->|texto|`; y dos aristas
que forman un ciclo reordenan el grafo entero, que es cómo `memoria` terminó
una vez en el extremo derecho del dibujo.

## 17 · Ninguna unidad se queda sin respirar

Dos reglas, y las comprueba `validar-contenido` en cada construcción:

- **Nada dura más de 25 minutos seguidos.** Preguntas, pausas y el receso
  cortan el tramo; todo lo demás lo alarga.
- **Una unidad de más de 40 minutos necesita al menos dos momentos.** Una sola
  pregunta al final de una hora no es ritmo, es una despedida.

El número no sale de ninguna teoría: sale de que a partir de la media hora la
sala deja de preguntar aunque tenga preguntas. Está en `navegacion.ts`
—`TRAMO_MAXIMO`, `UNIDAD_LARGA`— para que el descuadre se vea al construir y no
en el aula. Es un **aviso y no un error**: hay unidades donde un tramo largo se
justifica, pero se justifica *a sabiendas*. El desbalance que encontró la
auditoría —una unidad de 105 minutos con cero interacciones— no lo decidió
nadie, se coló.

### Dónde va una pregunta

**Donde hay algo que decidir o predecir, nunca como control de lectura.** Una
pregunta cuya respuesta acaba de estar en pantalla no mide nada y le dice a la
sala que esto va de prestar atención.

Las que funcionan son de tres clases, y las tres piden que la sala se
comprometa **antes** de ver:

| Clase | Qué hace | Ejemplo |
|---|---|---|
| Predicción | Apostar antes de correr algo | *¿Qué señal se va a mover?* antes del escenario silencioso |
| Decisión de diseño | Elegir, y defenderlo | *¿Cuál dejarías que el agente ejecute solo?* |
| Intuición equivocada | Sacar a la luz una creencia razonable y falsa | *97% de cobertura en un intervalo del 90%, ¿qué pasa?* |

Y la regla que las hace baratas: **una pregunta sin `solucion` no es una
pregunta, es una encuesta** (§12). Si al escribirla no aparece la explicación,
la pregunta no estaba lista.

### Dónde va una pausa

Antes de algo caro, no después. Dos minutos antes de que veinte personas
empiecen a teclear valen por diez de depuración con el laboratorio corriendo.
Los `disparadores` no son decoración: si nadie levanta la mano, el docente
lanza uno y la pausa ocurre igual.
