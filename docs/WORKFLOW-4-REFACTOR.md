# WORKFLOW 4 — Auditoría de código

Solo plan. Este workflow **no** implementa.

## Archivos a revisar
- Todo `src/`
- `docs/CONVENTIONS.md`

## Qué buscar

- **Duplicación real**, no parecido superficial. Dos renderizadores de ítem se
  parecen entre sí por naturaleza; eso no es duplicación.
- **Lógica de negocio filtrada a los componentes.** El filtrado de lo que ve el
  alumno vive en el servidor, en un solo lugar. Si aparece repartido, es un
  hallazgo grave y no de estilo.
- **Componentes que crecieron de más.** La vista de dictado es la candidata
  natural.
- **Tipos que mienten.** `any`, aserciones, campos opcionales que en realidad
  nunca faltan.
- **Convenciones dejadas atrás.** Código que ya no sigue `CONVENTIONS.md`, o
  convenciones que el código abandonó y habría que borrar del documento.

## Qué NO es un hallazgo

- Preferencias de estilo que el linter no marca
- Abstracciones que "podrían generalizarse" sin un segundo caso de uso real
- Renombrar por gusto

## Método
1. Recorre el código y anota hallazgos con archivo, línea y por qué importa.
2. Ordénalos por lo que costaría que fallen, no por lo que molestan de leer.
3. Para cada uno, propón el cambio concreto.
4. **Entrega el plan y espera.** No toques código.

## Entregable
Una lista priorizada de hallazgos con su remedio propuesto. Los aprobados se
convierten en batches de `TODO.md`.
