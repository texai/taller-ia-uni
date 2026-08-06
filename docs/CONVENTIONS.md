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

**Excepción:** un ítem de markdown largo vive en su propio `.md` bajo
`contenido/md/` y el YAML lo referencia por ruta. Meter tres párrafos dentro de
una cadena YAML hace ilegibles ambas cosas.

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
| `pregunta` | El docente pregunta a los alumnos | `pregunta`, `opciones`, `respuesta`, `permiteOmitir` |

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

## 11 · El proyecto de Supabase es compartido con `gen`

Esta aplicación no tiene proyecto propio: vive en el mismo que `gen`, que usa
Postgres y Auth pero no Realtime. Compartirlo está bien —hay un solo usuario en
ambas— pero tiene dos consecuencias que hay que respetar.

### Todas nuestras tablas llevan el prefijo `taller_`

`taller_estado_clase`, `taller_preguntas`, `taller_respuestas`,
`taller_docentes`.

Nombres como `preguntas` o `respuestas` son de los que dos aplicaciones
distintas eligen sin consultarse. Una colisión acá no da un error de
compilación: da una tabla que ya existía, con otras columnas y otras políticas,
y el descubrimiento llega tarde.

Un esquema de Postgres aparte sería más limpio, pero obliga a exponerlo en la
configuración de la API de Supabase. Con el prefijo se consigue lo mismo sin
tocar configuración.

### Las políticas NO pueden decir `auth.role() = 'authenticated'`

Ese es el error de seguridad que trae compartir proyecto, y es fácil de no ver.
Auth es común a las dos aplicaciones: cualquiera que se autentique en `gen`
queda autenticado también acá. Una política que solo pide "estar autenticado"
le daría a un futuro usuario de `gen` el control de la clase — mover la
posición, leer las preguntas de los alumnos, ver las respuestas correctas.

Hoy no ocurre porque el usuario es uno solo. Pero es una bomba de relojería:
explota el día que `gen` sume a alguien, y para entonces nadie va a recordar
que la política estaba escrita así.

La regla es una lista explícita:

```sql
create table if not exists taller_docentes (
  usuario uuid primary key references auth.users (id) on delete cascade,
  nota    text
);

-- Y toda politica de docente se escribe contra ella:
create policy "solo el docente marca el ritmo"
  on taller_estado_clase for all
  using (exists (select 1 from taller_docentes where usuario = auth.uid()))
  with check (exists (select 1 from taller_docentes where usuario = auth.uid()));
```

`npm run clave-docente` crea al usuario **y lo inscribe en `taller_docentes`**.
Un usuario que no esté en esa tabla puede iniciar sesión y no puede hacer nada.

### La llave de servicio abre las dos aplicaciones

`SUPABASE_SERVICE_ROLE_KEY` salta todas las políticas de todo el proyecto, así
que también da acceso a los datos de `gen`. Solo en el servidor y en los
scripts de mantenimiento. Nunca en el repositorio, nunca en un componente
cliente.
