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
