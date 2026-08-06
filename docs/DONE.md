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

