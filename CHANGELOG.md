# CHANGELOG

Resumen de cambios por fecha, más reciente arriba. El detalle batch por batch
vive en [`docs/DONE.md`](docs/DONE.md).

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
