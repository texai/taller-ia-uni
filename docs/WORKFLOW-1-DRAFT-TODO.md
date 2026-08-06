# WORKFLOW 1 — Actualiza `TODO.md` a partir de `DRAFT.md`

## Archivos a revisar
- `docs/DRAFT.md`
- `docs/TODO.md`
- `docs/DONE.md`
- `docs/CONVENTIONS.md`
- `CHANGELOG.md`

## Instrucción principal
Lee por completo `DRAFT.md`, interpreta su contenido y transfiere a `TODO.md`
toda la información útil que aún no esté organizada ni implementada.

## Consideraciones sobre `DRAFT.md`
`DRAFT.md` proviene de dictado por voz mientras se prepara o se dicta el curso,
por lo que puede contener:
- errores de transcripción,
- redundancias,
- ideas fuera de orden,
- frases ambiguas,
- información incompleta pero recuperable por contexto,
- correcciones que contradicen algo dicho antes en el mismo dictado.

No copies literalmente si eso empeora la claridad. Reescribe, reorganiza y
consolida. **Cuando el dictado se corrija a sí mismo, gana lo último dicho** —
y déjalo anotado en el log Procesado, porque la corrección suele explicar por
qué la decisión es la que es.

Cuando el dictado mencione un tipo de ítem, verifícalo contra el catálogo de
[`CONVENTIONS.md`](CONVENTIONS.md) §8 y usa el nombre real. Si el tipo no
existe todavía, el batch debe decir explícitamente que hay que agregarlo al
catálogo.

## Objetivo de `TODO.md`
`TODO.md` debe quedar preparado para que sus batches puedan enviarse uno por
uno a un asistente de codificación y resolverse en conversaciones
independientes.

Cada batch debe ser:
- claro,
- autocontenido,
- implementable,
- coherente en alcance.

Cuando un batch toque contenido del curso, debe dejar explícito:
- qué archivo de `contenido/` se agrega o cambia,
- si introduce un tipo de ítem nuevo (y entonces también toca `CONVENTIONS.md`),
- si el cambio afecta lo que ve el alumno o solo lo que ve el docente.

## Restricciones
- No modifiques batches ya implementados.
- Sí puedes reorganizar batches pendientes.
- Evita duplicar trabajo ya registrado en `DONE.md` o `CHANGELOG.md`.
- Una idea que necesita una decisión del docente NO es un batch: va a la
  sección **Pendiente de definir** de `DRAFT.md` o a la tabla de **Decisiones
  pendientes** de `TODO.md`.

## Acción sobre `DRAFT.md`
Elimina de `DRAFT.md` todo lo que ya haya sido incorporado correctamente a
`TODO.md`. Conserva únicamente ideas aún no procesadas, y registra la
transferencia en la sección **Procesado** con fecha.

## Entregable
Devuelve los archivos actualizados:
- `docs/TODO.md`
- `docs/DRAFT.md`
- `docs/CONVENTIONS.md`, si el dictado introdujo una regla o un tipo nuevo
