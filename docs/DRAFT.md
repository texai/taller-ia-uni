# DRAFT

Notas crudas de dictado por voz y decisiones de reunión, sin procesar.

Se vacía a medida que su contenido pasa a [`TODO.md`](TODO.md). El log
**Procesado** es append-only.

---

## Sin procesar

_(vacío)_

---

## Pendiente de definir

Cosas que salieron en el dictado y todavía no tienen respuesta. No son batches
porque falta una decisión, no trabajo.

- **Cuántas unidades de reto lleva cada sesión.** El dictado dice "no sé si hay
  dos o tres más de tipo reto" para la sesión 1. El Batch 3 asume tres retos en
  la sesión 1 y dos en la sesión 2, más repaso y cierre, tomado de la pauta ya
  acordada del laboratorio. Confirmar al revisar el esqueleto.
- **Si el contenido fino entra antes del sábado o se llena en caliente.** La
  estructura sí entra; el contenido definitivo de cada ítem es otra cosa.
- **Retención de preguntas y respuestas** al terminar el curso.
- **Dominio definitivo** de la aplicación.

---

## Procesado

### 2026-08-06 — Visualizaciones enfocadas

Transferido a [`TODO.md`](TODO.md) como batches 13 y 14, y a
[`CONVENTIONS.md`](CONVENTIONS.md) §10.

Lo que traía el dictado:

- Tipos de ítem que contengan un conjunto de pasos animados.
- Diagrama de secuencia escrito en PlantUML, con la aplicación generando la
  imagen — dicho explícitamente como requerimiento.
- Además de la imagen, una visualización que permita enfocar los mensajes uno
  por uno: de dónde viene, a dónde va, qué contiene.
- Duda abierta sobre la técnica: video, SVG animado, o una interfaz propia. El
  dictado dice que la implementación hay que discutirla pero el concepto vale.
- El mismo mecanismo para explicar un comando largo: un `docker compose` con
  varias palabras, poniendo una explicación por cada componente del comando, al
  estilo de las anotaciones en ASCII con flechitas señalando cada parte, y
  listando para qué sirve cada modificador y qué otros valores admite.

**Consecuencia de arquitectura, y es la parte importante:** un ítem con pasos
internos cambia la posición de la clase de `(unidad, ítem)` a
`(unidad, ítem, paso)`. Eso toca la navegación con flechas, la sincronía en
vivo y la tabla `estado_clase`. Como ninguno de esos batches está implementado
todavía, se enmendaron el 6 y el 8 en vez de agregar el arreglo después.

**Decisión sobre PlantUML:** es Java, y Vercel no ejecuta Java. La imagen se
genera al construir y se sirve estática. Depender de un servicio externo para
dibujar un diagrama en mitad de una clase es una forma innecesaria de quedarse
sin material.

**Decisión sobre el modo enfocado:** no se deriva de la imagen de PlantUML. El
SVG que produce no expone sus mensajes de forma que se puedan resaltar con
confianza, así que la fuente se parsea y el recorrido se dibuja aparte. Una
fuente de verdad, dos salidas.

### 2026-08-06 — Dictado inicial del producto

Transferido a [`TODO.md`](TODO.md) como batches 1 a 12, y a
[`CONVENTIONS.md`](CONVENTIONS.md) como reglas 1 a 9.

Lo que traía el dictado:

- Aplicación web pública para los alumnos, basta la URL. El docente se
  autentica. → Batches 1, 7
- Login oculto fuera de navegación, en `/profe`, documentado pero no enlazado.
  Solo contraseña. → Batch 7, `CONVENTIONS.md` §6
- Corrección posterior del mismo dictado: usar **Supabase Auth** en vez de un
  hash en variable de entorno, y **Supabase Realtime** en vez de WebSocket
  propio. Sin registro. → Batches 7, 8, `CONVENTIONS.md` §5, §6
- Jerarquía: curso → sesión → unidad → ítem. Un curso por ahora. Dos sesiones.
  Unidades de tipo `repaso` y `reto`, más una de `cierre`. → Batches 2, 3
- Objetivos a nivel de unidad. → Batch 2, 3
- Catálogo amplio de tipos de ítem: título, diagrama UML de secuencia, modelo
  de datos, comando de terminal, comando con salida, página web recomendada,
  bloque markdown, fragmento de código con resaltado, captura, y archivos
  descargables (PDF, Word, Excel, SVG). → `CONVENTIONS.md` §8, batch 4
- Ítems no de contenido sino de dictado: receso a mitad de sesión con aviso por
  hora, pausas intencionadas para preguntas, recordatorio de tomar asistencia.
  → `CONVENTIONS.md` §7, batch 5
- Navegación con flecha izquierda y derecha. → Batch 6
- El docente marca el ritmo; el alumno no puede adelantarse pero sí consultar
  hacia atrás. Sincronía en vivo hacia alumnos no autenticados. → Batch 8,
  `CONVENTIONS.md` §4
- El alumno puede enviar una pregunta al docente. → Batch 9
- Pregunta del docente hacia los alumnos, guardada en la pauta o lanzada en
  vivo; aparece en la pantalla del alumno hasta que responda, con opción
  explícita de no responder. → Batch 10
- Segunda pantalla para el docente —otra laptop o el teléfono— con los
  controles de avance, las notas internas del ítem, y las preguntas de los
  alumnos de forma discreta, sin publicarlas en la pantalla compartida por
  Zoom. → Batch 11, `CONVENTIONS.md` §3
- Tarea de npm para establecer la contraseña del docente, usable en local y en
  Vercel. → Batch 7
- Configuración en YAML: cursos, sesiones, unidades e ítems. Un markdown largo
  puede vivir en su propio archivo y referenciarse desde el YAML. → Batch 2,
  `CONVENTIONS.md` §1
- Pedido explícito de proponer más tipos de ítem valiosos para este contenido.

**Tipos de ítem propuestos además de los dictados**, todos en
[`CONVENTIONS.md`](CONVENTIONS.md) §8:

| Tipo | De dónde sale la necesidad |
|---|---|
| `comparacion` | La mitad del taller es un contraste: MAPE contra sesgo, el diagnóstico antes y después de la reflexión |
| `metrica` | Un número solo, grande: las 36,567 unidades |
| `cita-agente` | Citas literales de corridas reales, que no se pueden inventar |
| `criterios` | Los criterios de aceptación de cada reto |
| `error-comun` | Las trece incidencias reales del laboratorio |
| `demo` | Cuando el docente ejecuta en vivo, con respaldo por si falla |
| `transicion` | El puente entre unidades |
| `tabla` | Datos sin más |

**Decisión de arquitectura tomada durante el dictado:** Vercel no sostiene
WebSockets —una función serverless no mantiene una conexión abierta— así que el
canal en vivo va directo del navegador contra Supabase Realtime, sin pasar por
Vercel. Registrado en [`CONVENTIONS.md`](CONVENTIONS.md) §5.
