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

El docente marca el ritmo. El cliente del alumno conoce su posición actual y
puede navegar libremente hacia atrás, pero el contenido posterior no se le
envía. El filtro es del servidor, por la misma razón que el punto 3.

Es una decisión pedagógica con consecuencia técnica: si el material completo
está disponible, la mitad de la clase se adelanta y deja de escuchar.

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
