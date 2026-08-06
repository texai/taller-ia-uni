# taller-ia-uni

Plataforma de dictado en vivo para el **Taller 02 de caso aplicado de IA en
industria** — II Programa de Especialización en IA Generativa y MLOps, UNI.

Sábado 8 de agosto, 15:00–19:00 · Domingo 9 de agosto, 09:00–13:00

---

## Qué es

Una aplicación web donde el material del curso se recorre ítem por ítem, y
donde **el docente marca el ritmo**: los alumnos siguen su posición en vivo,
pueden consultar lo ya visto, y no pueden adelantarse.

La diferencia con un mazo de diapositivas es que acá el material es datos. Cada
ítem tiene un tipo —un comando de terminal, un diagrama, una cita literal de
una corrida del agente, un receso, una pregunta a la clase— y la aplicación
sabe cómo mostrarlo y cómo comportarse con él.

## Cómo está organizado

```
curso  →  sesión  →  unidad  →  ítem
```

- **Curso** — por ahora uno: este taller
- **Sesión** — dos, una por día
- **Unidad** — de tipo `repaso`, `reto` o `cierre`, con sus objetivos
- **Ítem** — la unidad mínima de dictado

Todo eso se define en YAML bajo `contenido/`, versionado junto al código. La
base de datos solo guarda lo que cambia durante una clase: dónde va el docente
y qué preguntan los alumnos.

## Para el docente

El acceso está en **`/profe`**. No aparece en ninguna navegación —no tiene por
qué distraer a un alumno— pero tampoco es un secreto: lo que protege el acceso
es la contraseña, no la URL.

Desde ahí se llega a los controles de dictado y a la **segunda pantalla**,
pensada para el teléfono: los controles de avance, las notas privadas del ítem
que se está explicando, las preguntas que van llegando, y el reloj de la
sesión. Nada de eso aparece en la pantalla que se comparte por Zoom.

## Estado

En construcción. El backlog está en [`docs/TODO.md`](docs/TODO.md) y el proceso
de trabajo en [`docs/README.md`](docs/README.md).

## Desarrollo

```bash
npm install
npm run dev
```

Variables de entorno en `.env.example`. Hace falta un proyecto de Supabase con
el registro deshabilitado; el docente se crea con:

```bash
npm run clave-docente
```

## Licencia

Material docente. Todos los derechos reservados.
