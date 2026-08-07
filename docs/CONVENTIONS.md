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
`contenido/puml/`, y lo que haga falta después. Meter tres párrafos —o un
diagrama de nueve mensajes— dentro de una cadena YAML hace ilegibles ambas
cosas.

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
mismo para `respuesta` en los ítems de tipo `pregunta`.

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
| `cita-agente` | Cita textual de una corrida real | `cita`, `procedencia`, `comentario` |
| `criterios` | Criterios de aceptación de un reto | `criterios[]` |
| `error-comun` | Un error que va a ocurrir, con su arreglo | `sintoma`, `causa`, `arreglo` |
| `demo` | Momento de demostración en vivo | `pasos[]`, `observar`, `respaldo` |
| `transicion` | Qué vimos, qué viene ahora, y dónde estamos | `vimos`, `viene` (el mapa se deriva) |
| `diagrama-secuencia` | Secuencia PlantUML, recorrible mensaje a mensaje | `fuente`, `mensajes[].explicacion` |
| `comando-anotado` | Un comando largo, explicado parte por parte | `comando`, `segmentos[]` |

### Familia `dictado`

| Tipo | Para qué | Campos propios |
|---|---|---|
| `receso` | Descanso, con reloj | `minutos` |
| `pausa-preguntas` | Pausa deliberada para preguntas | `disparadores[]` |
| `asistencia` | Recordatorio de tomar lista. Solo el docente | `nota` |
| `pregunta` | El docente pregunta a los alumnos | `pregunta`, `opciones`, `respuesta`, `permiteOmitir`, `visibilidad` |

### Comunes a todos

`id`, `tipo`, `titulo`, `entradilla`, `notas` (privadas), `minutos`.

### Cuatro tipos que merecen justificación

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

### Sobre las cifras

Este curso tiene números medidos —36,567 unidades, 13.8% a 14.5% de MAPE, los
umbrales por dimensión— y citas literales de corridas reales del agente. **No
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
