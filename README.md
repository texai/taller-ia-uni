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

## Las dos caras

| Ruta | Quién | Qué sirve |
|---|---|---|
| `/` | Cualquiera | El curso y sus sesiones |
| `/curso/{curso}/sesion/{sesion}` | Cualquiera | La sesión **como la ve un alumno** |
| `/profe` | — | La entrada del docente |
| `/profe/inicio` | Docente | Sus sesiones |
| `/profe/sesion/{sesion}` | Docente | La sesión **con todo**: notas, asistencia, respuestas |
| `/profe/sesion/{sesion}/revision` | Docente | La sesión de corrido, para escribir material |

**El acceso del docente está en `/profe`.** No aparece en ninguna navegación
—no tiene por qué distraer a un alumno— pero tampoco es un secreto: lo que
protege el acceso es la contraseña, no la URL.

La diferencia entre las dos caras no es cosmética. La ruta pública sirve una
carga distinta, filtrada **en el servidor**: sin notas del docente, sin la
respuesta correcta de las preguntas, y sin los ítems de asistencia. Lo que
llega al navegador es lo que un alumno puede leer con las herramientas de
desarrollador abiertas, y esa pantalla se proyecta por Zoom.

Desde `/profe` se llegará también a la **segunda pantalla**, pensada para el
teléfono: los controles de avance, las notas privadas del ítem que se está
explicando, las preguntas que van llegando, y el reloj de la sesión.

## Estado

En construcción. El backlog está en [`docs/TODO.md`](docs/TODO.md) y el proceso
de trabajo en [`docs/README.md`](docs/README.md).

## Desarrollo

```bash
npm install
npm run dev
```

Variables de entorno en `.env.example`.

Supabase se usa para dos cosas y nada más: **Auth**, para que el docente entre
por `/profe`, y **Realtime**, para el canal en vivo. **No hay tablas.** Todo el
material del curso vive versionado en `contenido/`, y lo que ocurre durante una
clase —dónde va el docente, qué preguntan los alumnos— es efímero por
naturaleza: se acaba cuando se acaba la clase.

El usuario del docente se crea a mano en *Authentication → Users*, con el
registro deshabilitado en *Authentication → Providers → Email*. Su `uuid` va
en `NEXT_PUBLIC_DOCENTE_UID`: Auth es compartida con la aplicación `gen`, así
que "estar autenticado" no alcanza como criterio para dictar.

Sin esas variables el sitio **sigue funcionando**: el curso se sirve igual y
lo único que deja de andar es la entrada del docente, que lo dice en pantalla.

## Licencia

Material docente. Todos los derechos reservados.
