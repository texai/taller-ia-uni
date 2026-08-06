# WORKFLOW 2 — Implementa el siguiente batch de `TODO.md` (el menor no implementado aún)

## Archivos a revisar
- `docs/TODO.md`
- `docs/CONVENTIONS.md` — **obligatorio**: contiene el catálogo de tipos de ítem
  y las invariantes de privacidad del material

## Instrucciones
1. Implementa el batch completo en el código.
2. Mantén coherencia con la arquitectura y convenciones existentes.
3. No adelantes trabajo de batches futuros, salvo dependencias mínimas
   inevitables.
4. Si hay pequeñas ambigüedades, resuélvelas con criterio técnico consistente.
5. Pregunta lo que no esté claro.
6. Verifica que se pueda llegar a lo nuevo en un flujo natural: desde la lista
   de cursos, a la sesión, a la unidad, al ítem.

## Invariantes que no se negocian
Están en [`CONVENTIONS.md`](CONVENTIONS.md) y ningún batch las relaja:

- Las `notas` del docente y las `respuesta` correctas se filtran **en el
  servidor**. Nunca se envían al cliente del alumno para ocultarse con CSS: la
  pantalla del docente se proyecta por Zoom y el HTML es legible.
- El contenido posterior a la posición del docente **no se envía** al cliente
  del alumno.
- `SUPABASE_SERVICE_ROLE_KEY` solo existe en el servidor y en los scripts. Si
  aparece en un componente cliente, el batch está mal.
- Los identificadores de curso, sesión, unidad e ítem no se reciclan ni se
  renumeran.

## Validación final obligatoria
Ejecuta y deja pasando:
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run validar-contenido`

## Documentación obligatoria
Actualiza:
- `CHANGELOG.md`
- `docs/TODO.md`
- `docs/DONE.md`

## Reglas de documentación
- En `CHANGELOG.md`, registra los cambios siguiendo el formato actual
  (cronológico, más reciente arriba, agrupado por fecha y categoría semántica).
- En `TODO.md`, marca el batch como completado en la tabla de resumen.
- En `DONE.md`, mueve el bloque completo implementado desde `TODO.md`.

## Entregable
Devuelve:
- código implementado,
- validaciones ejecutadas,
- documentación actualizada,
- aviso explícito si necesito:
  - crear o cambiar tablas y políticas en Supabase,
  - habilitar Realtime para una tabla,
  - cambiar la configuración de Authentication (proveedores, registro),
  - regenerar la contraseña del docente (`npm run clave-docente`),
  - agregar variables de entorno en local y en Vercel,
  - instalar o actualizar dependencias,
  - cualquier otro requisito para que funcione todo ok.
