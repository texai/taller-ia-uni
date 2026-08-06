# WORKFLOW 3 — Auditoría de cobertura de pruebas

Analizar los huecos, proponer un plan, y recién entonces implementar.

## Archivos a revisar
- Todo `src/`
- `contenido/`
- `docs/CONVENTIONS.md`

## Qué importa probar en esta aplicación

No todo merece una prueba. Lo que sí, por orden de gravedad si falla:

### 1 · Las invariantes de privacidad
Lo más caro que puede pasar es que las notas del docente, o la respuesta
correcta de una pregunta, terminen en el HTML que ve un alumno mientras la
pantalla está proyectada.

- La carga pública nunca incluye `notas`
- La carga pública nunca incluye `respuesta`
- La carga pública nunca incluye ítems posteriores a la posición del docente
- Un ítem `asistencia` no aparece en la carga del alumno
- La clave de servicio no aparece en ningún bundle de cliente

### 2 · La validación del contenido
Un YAML roto descubierto en vivo cuesta la clase.

- Un ítem sin campo obligatorio falla nombrando archivo, ítem y campo
- Identificadores duplicados fallan
- Una referencia a un archivo inexistente falla
- Un tipo de ítem desconocido falla en validación, y en render cae al fallback
  sin tumbar la página

### 3 · La sincronía
- Quien se conecta a mitad de clase aterriza en la posición correcta
- El alumno puede retroceder y volver a la posición del docente
- Perder la conexión y recuperarla deja al alumno donde corresponde

### 4 · Lo que no vale la pena probar
- Que un componente de presentación dibuje el `<h1>` esperado
- El estilo, los colores, los márgenes
- Mermaid, Shiki, react-markdown: son de terceros y ya están probados

## Método
1. Enumera lo que existe y lo que falta, agrupado por las cuatro categorías.
2. Propón un plan con prioridad, diciendo qué queda deliberadamente sin cubrir
   y por qué.
3. **Espera aprobación** antes de escribir pruebas.
4. Implementa lo aprobado.

## Entregable de la fase de análisis
Un documento con los huecos y el plan. Nada de código todavía.
