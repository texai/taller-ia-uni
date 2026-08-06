# `docs/` — Índice

Mapa rápido de los documentos de `docs/`. Los marcadores indican **estado**, no
prioridad.

- 🎯 **activo** — work-in-progress; consultar de cabecera
- 🔄 **vigente** — proceso o referencia siempre aplicable
- ✅ **done** — implementado; queda como log/referencia
- 📝 **scratch** — borradores / dictados / notas informales

---

## 🔄 Vigente — Proceso

Workflows de cómo se trabaja en este repo. Aplicables en cualquier momento.

- [`WORKFLOW-1-DRAFT-TODO.md`](WORKFLOW-1-DRAFT-TODO.md) — Convertir notas crudas de [`DRAFT.md`](DRAFT.md) en batches de [`TODO.md`](TODO.md).
- [`WORKFLOW-2-TODO-CODE.md`](WORKFLOW-2-TODO-CODE.md) — Implementar el siguiente batch pendiente, con lint/typecheck/build/validación obligatorios.
- [`WORKFLOW-3-TESTING.md`](WORKFLOW-3-TESTING.md) — Auditoría de cobertura: huecos → plan → implementar.
- [`WORKFLOW-4-REFACTOR.md`](WORKFLOW-4-REFACTOR.md) — Auditoría de código. Solo plan.

## 🔄 Vigente — Operación

- [`CONVENTIONS.md`](CONVENTIONS.md) — Reglas no derivables del código: dónde vive el contenido, invariantes de privacidad del material, y el **catálogo de tipos de ítem**.
- [`TODO.md`](TODO.md) — Backlog de batches + plantilla.
- [`DONE.md`](DONE.md) — Histórico batch por batch.
- [`../CHANGELOG.md`](../CHANGELOG.md) — Resumen por fecha (vive en la raíz).
- [`../README.md`](../README.md) — Qué es la aplicación, cómo se corre y cómo se despliega.

## 🎯 Activo

- [`TODO.md`](TODO.md) — Los batches 1 a 8 son la ruta mínima para dictar el sábado.

## 📝 Scratch

- [`DRAFT.md`](DRAFT.md) — Notas crudas de dictado, sin procesar. Se vacía a medida que su contenido pasa a `TODO.md`; el log "Procesado" es append-only.
