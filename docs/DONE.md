# DONE

Histórico de batches implementados, en orden de finalización. Fuente de verdad
para el [`CHANGELOG.md`](../CHANGELOG.md).

Cada bloque se mueve acá completo desde [`TODO.md`](TODO.md) al terminarse, con
la fecha y lo que efectivamente se hizo — incluidas las desviaciones respecto
de lo planificado, que suelen ser lo más útil de releer.

---

## Batch 1 — Esqueleto Next.js y despliegue en Vercel
**2026-08-06**

## Batch 1 — Esqueleto Next.js y despliegue en Vercel

No existe aplicación. Hace falta la base sobre la que se apoya todo lo demás,
desplegada y accesible por URL, porque los alumnos entran sin instalar nada.

**Alcance** (todo hecho)
- [ ] Next.js 15 con App Router, TypeScript en modo estricto, Tailwind
- [ ] Estructura de carpetas: `src/app/`, `src/lib/`, `src/components/`, `contenido/`
- [ ] Página raíz que lista los cursos disponibles (por ahora, uno)
- [ ] Layout con tipografía y tema claro/oscuro respetando el sistema
- [ ] `npm run dev`, `npm run build`, `npm run typecheck` y `npm run lint` pasando
- [ ] Despliegue en Vercel desde `main`
- [ ] `.env.example` con las variables que van a hacer falta

**Fuera de alcance**
- Supabase, autenticación, sincronía. Nada de eso todavía.
- Contenido real del curso: basta con datos de prueba.

**Requisitos externos**
- Proyecto en Vercel conectado a `texai/taller-ia-uni`.

---

### Cómo quedó, y en qué se desvió de lo planificado

- **Next 16, no 15.** `next@15.1.3` trae la vulnerabilidad CVE-2025-66478 y npm
  lo avisa al instalar. Se subió a la última, que es 16.3.0. Consecuencias:
  - `next lint` **ya no existe** en 16. El script `lint` llama a `eslint .`
    directamente.
  - `eslint-config-next` publica configuración en formato plano, así que se
    importa sin `FlatCompat`.
  - Next 16 trae su documentación empaquetada en `node_modules/next/dist/docs/`.
    Vale la pena consultarla ahí antes de escribir código: está sincronizada
    con la versión instalada, cosa que un buscador no garantiza.
- **Tailwind 4**, que ya no lleva archivo de configuración: los colores y
  tipografías se declaran en `@theme` dentro de `globals.css`.
- **Tema doble.** Oscuro por omisión y claro respetando el sistema. El oscuro
  no es preferencia estética: un aula a media luz con un proyector en blanco
  encandila. El claro existe para preparar material a plena luz.
- `noUncheckedIndexedAccess` activado en TypeScript. Con contenido que viene de
  YAML, indexar un arreglo y confiar en que hay algo es la forma más fácil de
  reventar en clase.

### Verificado

- `npm run typecheck`, `npm run lint` y `npm run build` limpios
- La página se abre en navegador real, en tema claro y oscuro, sin errores de
  JavaScript

### Pendiente del batch

- **El despliegue en Vercel lo hace Ernesto**: hay que conectar el proyecto a
  `texai/taller-ia-uni` y registrar las variables de `.env.example`.

---

## Batch 2 — Modelo de contenido en YAML y cargador
**2026-08-06**

## Batch 2 — Modelo de contenido en YAML y cargador

El contenido del curso tiene que poder escribirse a mano, revisarse en un diff
y validarse antes de proyectarse. Un error de tipeo en el YAML no puede
descubrirse en vivo delante de veinte personas.

**Alcance**
- [ ] `src/lib/tipos.ts` con la jerarquía: `Curso`, `Sesion`, `Unidad`, `Item`
- [ ] Unión discriminada de tipos de ítem según el catálogo de [`CONVENTIONS.md`](CONVENTIONS.md) §8
- [ ] Cargador que lee `contenido/curso.yml` y `contenido/sesiones/*.yml`
- [ ] Resolución de referencias a archivo: `archivo: md/el-caso.md` se lee y se
      incorpora
- [ ] Validación con mensajes útiles: qué archivo, qué ítem, qué campo falta
- [ ] `npm run validar-contenido` que falla con código distinto de cero
- [ ] La validación corre dentro de `npm run build`: un YAML roto no llega a
      producción
- [ ] Filtro del servidor que elimina `notas` y `respuesta` de la carga pública
      (ver [`CONVENTIONS.md`](CONVENTIONS.md) §3)

**Tests esperados**
- [ ] Un YAML válido carga con la jerarquía esperada
- [ ] Un ítem sin campo obligatorio falla nombrando archivo, ítem y campo
- [ ] Identificadores duplicados dentro de una sesión fallan
- [ ] `notas` y `respuesta` no aparecen en la carga pública

**Fuera de alcance**
- Renderizar los ítems. Este batch solo carga y valida.

---

### Cómo quedó

- **`src/lib/tipos.ts`** — los 23 tipos del catálogo como unión discriminada,
  más `Curso`, `Sesion` y `Unidad`.
- **`src/lib/especificacion.ts`** — qué campos exige cada tipo, dirigido por
  datos. Agregar un tipo cuesta una línea acá, una interfaz y un componente.
  Si validar un tipo nuevo exigiera escribir un validador a mano, el catálogo
  dejaría de crecer y la apuesta del producto se cae.
- **`src/lib/contenido.ts`** — carga, valida, resuelve referencias a archivo, y
  filtra lo privado.
- **`scripts/validar-contenido.ts`** — corre dentro de `npm run build`.

### Decisiones que se apartaron de lo previsto

- **La raíz del contenido es un parámetro, no una constante de módulo.** La
  primera versión la fijaba al importar, y las pruebas tuvieron que recurrir a
  `process.chdir`, que con pruebas en paralelo produce fallos que no se
  reproducen. `cargarCurso(raiz)` resolvió el problema y quedó mejor diseño.
- **Los problemas se acumulan y se reportan todos juntos.** Fallar en el
  primero obliga a arreglar y volver a correr una vez por error.
- **Un campo no reconocido es un error, no un aviso.** Casi siempre es un typo,
  y un typo silencioso en el material se descubre proyectado. `destacadu` en
  vez de `destacado` habría dejado la lámina muda.
- **Validaciones propias de tres tipos**, que salieron de pensar cómo fallan:
  - `comando-anotado` comprueba que cada segmento exista en el comando y sea
    inequívoco. Un segmento que aparece dos veces falla como ambiguo en vez de
    elegir uno en silencio.
  - `tabla` comprueba que cada fila tenga tantas celdas como columnas.
  - `pregunta` con `respuesta` correcta pero sin `opciones` falla: una pregunta
    abierta no se corrige sola.

### Verificado

- 18 pruebas, todas pasando. Las tres que más importan comprueban que `notas`,
  `respuesta` y los ítems de `asistencia` **no aparecen en el JSON** que va al
  alumno — serializando y buscando, no inspeccionando el objeto.
- `lint`, `typecheck` y `build` limpios.
- Un YAML roto a mano produce los tres problemas juntos, cada uno con archivo,
  unidad, posición, identificador y campo.
