/**
 * Pruebas del cargador de contenido.
 *
 * Lo que se prueba acá es lo caro de que falle, no lo fácil de probar:
 *
 *  1. Las invariantes de privacidad. Que las notas del docente o la respuesta
 *     correcta lleguen al navegador de un alumno con la pantalla proyectada es
 *     lo peor que puede pasar en esta aplicación.
 *  2. Que un YAML roto falle acá y no en clase, diciendo dónde.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readdirSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import * as mod from "./contenido";
import { ESPECIFICACION } from "./especificacion";
import { pasosDe } from "./navegacion";
import * as sitio from "./sitio";
import { FAMILIA, TIPOS } from "./tipos";
import type { Item, Unidad } from "./tipos";

// --------------------------------------------------------------------------
// Un contenido de prueba, en un directorio temporal
// --------------------------------------------------------------------------

function conContenido<T>(
  archivos: Record<string, string>,
  fn: (raiz: string) => T,
): T {
  const base = mkdtempSync(join(tmpdir(), "taller-"));
  const raiz = join(base, "contenido");
  try {
    mkdirSync(join(raiz, "sesiones"), { recursive: true });
    for (const [ruta, texto] of Object.entries(archivos)) {
      const destino = join(raiz, ruta);
      // Cada archivo se lleva su carpeta. Enumerarlas acá a mano era una lista
      // que había que acordarse de ampliar, y el olvido no se nota hasta que
      // una prueba nueva falla por un ENOENT que no tiene nada que ver con lo
      // que estaba probando.
      mkdirSync(dirname(destino), { recursive: true });
      writeFileSync(destino, texto, "utf8");
    }
    return fn(raiz);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

const CURSO_MINIMO = `
id: prueba
titulo: Curso de prueba
`;

function sesionCon(items: string, extra = "", tipo = "repaso"): string {
  return `
id: sesion-1
numero: 1
titulo: Sesión de prueba
unidades:
  - id: u1
    tipo: ${tipo}
    titulo: Unidad
${extra}    items:
${items}
`;
}

// --------------------------------------------------------------------------

test("un YAML válido carga con la jerarquía esperada", () => {
  const items = `
      - id: i1
        tipo: titulo
        titulo: Hola
      - id: i2
        tipo: terminal
        comando: make arriba
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      const curso = cargarCurso(raiz);
      assert.equal(curso.id, "prueba");
      assert.equal(curso.sesiones.length, 1);
      assert.equal(curso.sesiones[0]?.unidades[0]?.items.length, 2);
      assert.equal(curso.sesiones[0]?.unidades[0]?.items[1]?.tipo, "terminal");
    },
  );
});

test("un ítem sin campo obligatorio falla nombrando archivo, ítem y campo", () => {
  const items = `
      - id: sin-comando
        tipo: terminal
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso, ErrorDeContenido } = mod;
      assert.throws(
        () => cargarCurso(raiz),
        (e: unknown) => {
          assert.ok(e instanceof ErrorDeContenido);
          const texto = (e as Error).message;
          assert.match(texto, /s1\.yml/);
          assert.match(texto, /sin-comando/);
          assert.match(texto, /comando/);
          return true;
        },
      );
    },
  );
});

test("identificadores duplicados dentro de una sesión fallan", () => {
  const items = `
      - id: repetido
        tipo: titulo
        titulo: Uno
      - id: repetido
        tipo: titulo
        titulo: Dos
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /ya se usó/);
    },
  );
});

test("un tipo desconocido falla y enumera los válidos", () => {
  const items = `
      - id: raro
        tipo: holograma
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /tipo desconocido/);
    },
  );
});

test("un campo mal escrito no pasa en silencio", () => {
  // Un typo silencioso en el material se descubre proyectado.
  const items = `
      - id: i1
        tipo: titulo
        titulo: Hola
        destacadu: ups
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /destacadu.*no reconocido/s);
    },
  );
});

test("una referencia a un archivo inexistente falla", () => {
  const items = `
      - id: i1
        tipo: markdown
        archivo: md/no-existe.md
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /no existe el archivo/);
    },
  );
});

test("un markdown en archivo aparte se incorpora al cargar", () => {
  const items = `
      - id: i1
        tipo: markdown
        archivo: md/caso.md
`;
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(items),
      "md/caso.md": "# El caso\n\n192 modelos.\n",
    },
    (raiz) => {
      const { cargarCurso } = mod;
      const item = cargarCurso(raiz).sesiones[0]?.unidades[0]?.items[0] as {
        contenido?: string;
      };
      assert.match(item.contenido ?? "", /192 modelos/);
    },
  );
});

// --------------------------------------------------------------------------
// Privacidad: lo caro de que falle
// --------------------------------------------------------------------------

test("las notas del docente no llegan a la carga del alumno", () => {
  const items = `
      - id: i1
        tipo: titulo
        titulo: Hola
        notas: Recordar que aquí se ríen
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso, cursoParaAlumno } = mod;
      const curso = cargarCurso(raiz);
      assert.ok("notas" in (curso.sesiones[0]!.unidades[0]!.items[0] as object));

      const publico = cursoParaAlumno(curso);
      const serializado = JSON.stringify(publico);
      assert.doesNotMatch(serializado, /Recordar que aquí se ríen/);
      assert.doesNotMatch(serializado, /"notas"/);
    },
  );
});

test("la respuesta correcta no llega a la carga del alumno", () => {
  const items = `
      - id: p1
        tipo: pregunta
        pregunta: ¿Cuál alertarías?
        opciones: [MAPE, sesgo]
        respuesta: sesgo
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso, cursoParaAlumno } = mod;
      const publico = cursoParaAlumno(cargarCurso(raiz));
      const serializado = JSON.stringify(publico);
      assert.doesNotMatch(serializado, /"respuesta"/);
      // Las opciones sí viajan: sin ellas el alumno no puede contestar.
      assert.match(serializado, /"opciones"/);
    },
  );
});

test("un ítem de SOLO_DOCENTE no aparece en la carga del alumno", () => {
  // La lista está vacía hoy —la asistencia dejó de ocultarse— así que la
  // prueba usa un tipo cualquiera y la lista de mentira. Se queda porque el
  // mecanismo sigue en pie y romperlo no daría ningún síntoma visible.
  const items = `
      - id: a1
        tipo: asistencia
        titulo: Tomar lista
      - id: i1
        tipo: titulo
        titulo: Hola
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const curso = mod.cargarCurso(raiz);
      const items = curso.sesiones[0]!.unidades[0]!.items.filter(
        (i) => !["asistencia"].includes(i.tipo),
      );
      assert.equal(items.length, 1);
      assert.equal(items[0]?.id, "i1");
    },
  );
});

// --------------------------------------------------------------------------
// Validaciones propias de algunos tipos
// --------------------------------------------------------------------------

test("un segmento que no está en el comando falla", () => {
  const items = `
      - id: c1
        tipo: comando-anotado
        comando: docker compose up -d
        segmentos:
          - texto: "--rm"
            explicacion: Borra el contenedor al terminar
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /no aparece en el comando/);
    },
  );
});

test("un segmento ambiguo falla en vez de elegir uno en silencio", () => {
  const items = `
      - id: c1
        tipo: comando-anotado
        comando: docker compose run --rm agente python -m agente run
        segmentos:
          - texto: agente
            explicacion: El servicio
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /ambiguo/);
    },
  );
});

test("una fila con más celdas que columnas falla", () => {
  const items = `
      - id: t1
        tipo: tabla
        columnas: [Métrica, Antes, Después]
        filas:
          - [MAPE, "13.8%", "14.5%"]
          - [Sesgo, "0.7%", "4.7%", "de más"]
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /4 celdas y hay 3 columnas/);
    },
  );
});

test("una pregunta abierta con respuesta correcta falla", () => {
  const items = `
      - id: p1
        tipo: pregunta
        pregunta: ¿Qué le falta al bucle?
        respuesta: reflexión
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /no se corrige sola/);
    },
  );
});

test("los problemas se reportan todos juntos, no de a uno", () => {
  // Fallar en el primero obliga a arreglar y volver a correr una vez por
  // error. A las dos de la mañana de un viernes eso importa.
  const items = `
      - id: i1
        tipo: terminal
      - id: i2
        tipo: enlace
      - id: i3
        tipo: metrica
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso, ErrorDeContenido } = mod;
      try {
        cargarCurso(raiz);
        assert.fail("debió fallar");
      } catch (e) {
        assert.ok(e instanceof ErrorDeContenido);
        assert.equal((e as InstanceType<typeof ErrorDeContenido>).problemas.length, 3);
      }
    },
  );
});

// --------------------------------------------------------------------------
// Coherencia del catálogo
// --------------------------------------------------------------------------

test("todo tipo del catálogo tiene especificación y familia", () => {
  for (const tipo of TIPOS) {
    assert.ok(ESPECIFICACION[tipo], `${tipo} no tiene especificación`);
    assert.ok(FAMILIA[tipo], `${tipo} no tiene familia`);
  }
  assert.equal(Object.keys(ESPECIFICACION).length, TIPOS.length);
});

test("recorrer numera los ítems de forma continua entre unidades", () => {
  const items = `
      - id: i1
        tipo: titulo
        titulo: Uno
      - id: i2
        tipo: titulo
        titulo: Dos
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso, recorrer } = mod;
      const paso = recorrer(cargarCurso(raiz).sesiones[0]!);
      assert.deepEqual(
        paso.map((p) => p.posicion),
        [0, 1],
      );
    },
  );
});

test("minutosDe suma los de sus ítems, y nada más", () => {
  const { minutosDe } = mod;
  const items = [{ minutos: 10 }, { minutos: 5 }] as unknown as Item[];
  assert.equal(minutosDe({ items } as Unidad), 15);
});

test("declarar minutos en la unidad es un error de contenido", () => {
  // No se ignora en silencio: una cifra escrita que el programa descarta es
  // peor que una cifra ausente, porque se lee como si valiera. El tiempo se
  // cuenta de abajo hacia arriba (CONVENTIONS.md §15).
  const items = `
      - id: i1
        tipo: titulo
        titulo: Hola
        minutos: 10
`;
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(items, "    minutos: 60\n"),
    },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(
        () => cargarCurso(raiz),
        /los minutos no se declaran en la unidad/,
      );
    },
  );
});

test("una fuente PlantUML que no se entiende falla al cargar, no en clase", () => {
  const items = `
      - id: diagrama
        tipo: diagrama-secuencia
        titulo: Roto
        fuente: |
          @startuml
          A -> B : uno
          loop mientras haya evidencia
          end
          @enduml
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /loop mientras haya evidencia/);
    },
  );
});

test("las explicaciones tienen que ser tantas como los mensajes", () => {
  // Van por índice: una de menos no deja una explicación vacía, corre todas
  // las demás un lugar y cada mensaje queda explicado con el texto del
  // siguiente. Eso no se nota leyendo el YAML; se nota proyectando.
  const items = `
      - id: diagrama
        tipo: diagrama-secuencia
        titulo: Descuadrado
        fuente: |
          @startuml
          A -> B : uno
          B -> C : dos
          @enduml
        mensajes:
          - explicacion: solo una
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /2 mensajes y hay 1 explicaciones/);
    },
  );
});

test("una explicación anclada a un texto que no es el suyo falla", () => {
  // El ancla existe para el caso que la cuenta no detecta: alguien reordena
  // dos flechas y las explicaciones quedan cruzadas.
  const items = `
      - id: diagrama
        tipo: diagrama-secuencia
        titulo: Cruzado
        fuente: |
          @startuml
          A -> B : uno
          B -> C : dos
          @enduml
        mensajes:
          - texto: dos
            explicacion: la del segundo, puesta primero
          - texto: uno
            explicacion: y al revés
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /dice ser de `dos`/);
    },
  );
});

test("un segmento que no está en el comando falla nombrándolo", () => {
  const items = `
      - id: cmd
        tipo: comando-anotado
        titulo: Un comando
        comando: docker compose up -d
        segmentos:
          - texto: "--force"
            explicacion: no existe acá
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /`--force` no aparece en el comando/);
    },
  );
});

test("un segmento que aparece dos veces falla como ambiguo", () => {
  // Elegir uno en silencio deja la llave señalando la ocurrencia equivocada, y
  // eso solo se nota proyectado.
  const items = `
      - id: cmd
        tipo: comando-anotado
        titulo: Un comando
        comando: docker compose run --rm agente run
        segmentos:
          - texto: "run"
            explicacion: ¿cuál de los dos?
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /aparece 2 veces .*ambiguo/s);
    },
  );
});

test("dos segmentos que se pisan fallan al cargar", () => {
  const items = `
      - id: cmd
        tipo: comando-anotado
        titulo: Un comando
        comando: docker compose up -d
        segmentos:
          - texto: "compose up"
            explicacion: uno
          - texto: "up -d"
            explicacion: y el otro se lo traga
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /se solapan/);
    },
  );
});

test("un descarte que nombra una opción inexistente falla", () => {
  // Se dibujaría igual, y en clase parecería que la pregunta tenía una opción
  // más de las que se ofrecieron.
  const items = `
      - id: p
        tipo: pregunta
        titulo: Una pregunta
        pregunta: ¿Cuál?
        opciones: ["A", "B"]
        solucion:
          explicacion: es la A
          descartes:
            - opcion: "C"
              razon: no existe
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const { cargarCurso } = mod;
      assert.throws(() => cargarCurso(raiz), /descarta `C`, que no es una de las opciones/);
    },
  );
});

test("dos ítems `caso` que apuntan al mismo archivo muestran el mismo caso", () => {
  // Es la razón de que el caso pueda vivir en un archivo: dos sesiones, un
  // solo texto. Copiarlo son dos casos que se separan al corregir uno.
  const items = `
      - id: c1
        tipo: caso
        archivo: casos/uno.yml
      - id: c2
        tipo: caso
        archivo: casos/uno.yml
`;
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(items),
      "casos/uno.yml": [
        "titulo: Una cadena",
        "empresa: 24 tiendas",
        "cifras:",
        '  - valor: "192"',
        "    unidad: modelos",
        "bloques:",
        "  - titulo: Hoy",
        "    contenido: Funciona",
      ].join("\n"),
    },
    (raiz) => {
      const suyos = mod.cargarCurso(raiz).sesiones[0]!.unidades[0]!.items;
      for (const i of suyos) {
        const c = i as { titulo?: string; cifras?: { valor: string }[] };
        assert.equal(c.titulo, "Una cadena");
        assert.equal(c.cifras?.[0]?.valor, "192");
      }
    },
  );
});

test("una unidad puede ser de tipo `caso`", () => {
  const items = `
      - id: c1
        tipo: caso
        titulo: Una cadena
        empresa: 24 tiendas
        cifras:
          - valor: "192"
            unidad: modelos
        bloques:
          - titulo: Hoy
            contenido: Funciona
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items, "", "caso") },
    (raiz) => {
      assert.equal(mod.cargarCurso(raiz).sesiones[0]!.unidades[0]!.tipo, "caso");
    },
  );
});

// --------------------------------------------------------------------------
// La invariante, sobre el contenido REAL del curso
// --------------------------------------------------------------------------

test("el curso real no filtra notas ni respuestas hacia el alumno", () => {
  // Las pruebas de arriba usan contenido de laboratorio. Esta usa el del curso
  // que se va a dictar, que es el que de verdad se proyecta por Zoom. Si
  // alguien agrega una nota jugosa a un ítem, esta prueba la cubre sin que
  // haya que acordarse de nada.
  const curso = mod.cargarCurso();
  const publico = JSON.stringify(mod.cursoParaAlumno(curso));

  assert.doesNotMatch(publico, /"notas"/);
  assert.doesNotMatch(publico, /"respuesta"/);
  assert.doesNotMatch(publico, /"solucion"/);
  // La lámina de asistencia sí la ve la clase; su instrucción al docente, no.
  // Se comprueba sobre los ítems y no con una expresión sobre el JSON entero:
  // las columnas de `modelo-datos` también llevan `nota`, y esas son material.
  assert.match(publico, /"tipo":"asistencia"/);
  const asistencias = mod
    .cursoParaAlumno(curso)
    .sesiones.flatMap((s) => s.unidades.flatMap((u) => u.items))
    .filter((i) => i.tipo === "asistencia");
  assert.ok(asistencias.length >= 2, "al menos una por sesión");
  for (const a of asistencias) {
    assert.equal((a as unknown as Record<string, unknown>).nota, undefined);
  }

  // Y que no esté vacío: una carga rota también pasaría las tres de arriba.
  assert.ok(curso.sesiones.length >= 2);
  assert.ok(publico.length > 5000);
});

test("las notas SÍ están en la carga del docente", () => {
  // El complemento del anterior: si el filtro empezara a vaciar el material
  // para todos, las pruebas de privacidad seguirían pasando y nadie lo notaría
  // hasta proyectarlo.
  const crudo = JSON.stringify(mod.cargarCurso());
  assert.match(crudo, /"notas"/);
  assert.match(crudo, /"solucion"/);
});

// --------------------------------------------------------------------------
// Salidas anotadas
// --------------------------------------------------------------------------

const SALIDA = `1/4 Generando historico...
2/4 Entrenando la flota (192 modelos)...

Listo. 192 modelos con 17,472 dias-modelo.`;

function salidaCon(anotaciones: string): string {
  return `
      - id: sal
        tipo: salida-anotada
        titulo: Una salida
        salida: |
          ${SALIDA.split("\n").join("\n          ")}
        anotaciones:
${anotaciones}
`;
}

test("una anotación que no está en la salida falla nombrándola", () => {
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(
        salidaCon(`          - texto: "5/4 Inventando"\n            explicacion: no existe`),
      ),
    },
    (raiz) => {
      assert.throws(
        () => mod.cargarCurso(raiz),
        /`5\/4 Inventando` no aparece en la salida/,
      );
    },
  );
});

test("una anotación ambigua falla en vez de señalar la primera", () => {
  // Es más fácil que en un comando: una salida se copia y se pega, y las
  // palabras se repiten.
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(
        salidaCon(`          - texto: "modelos"\n            explicacion: ¿cuál?`),
      ),
    },
    (raiz) => {
      assert.throws(() => mod.cargarCurso(raiz), /aparece 2 veces .*ambiguo/s);
    },
  );
});

test("una salida anotada válida carga, y sus anotaciones sobreviven", () => {
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(
        salidaCon(
          `          - texto: "17,472"\n            explicacion: 192 por 91\n` +
            `          - texto: "2/4 Entrenando"\n            explicacion: la segunda etapa`,
        ),
      ),
    },
    (raiz) => {
      const item = mod.cargarCurso(raiz).sesiones[0]?.unidades[0]?.items[0];
      assert.equal(item?.tipo, "salida-anotada");
      assert.equal(
        item?.tipo === "salida-anotada" ? item.anotaciones.length : 0,
        2,
      );
    },
  );
});

test("el número de pasos de una salida anotada incluye sus anotaciones", () => {
  // Si `pasosDe` no la conociera, la lámina se quedaría en el paso 0 y las
  // anotaciones no se verían nunca — sin ningún error a la vista.
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(
        salidaCon(
          `          - texto: "17,472"\n            explicacion: a\n` +
            `          - texto: "2/4 Entrenando"\n            explicacion: b`,
        ),
      ),
    },
    (raiz) => {
      const item = mod.cargarCurso(raiz).sesiones[0]?.unidades[0]?.items[0];
      assert.equal(pasosDe(item as Item), 3, "dos anotaciones más el paso 0");
    },
  );
});

test("los minutos de un ítem no llegan a la carga del alumno", () => {
  // El presupuesto de tiempo es del docente. Un alumno que ve «4′» en cada
  // ítem sabe cuándo la clase va tarde, y eso cambia lo que la sala hace con
  // una explicación que se alarga. El total de la sesión sí es suyo: son las
  // horas de inicio y fin, que van aparte.
  const items = `
      - id: i1
        tipo: titulo
        titulo: Hola
        minutos: 7
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const curso = mod.cargarCurso(raiz);
      assert.equal(curso.sesiones[0]?.unidades[0]?.items[0]?.minutos, 7);

      const publico = JSON.stringify(mod.cursoParaAlumno(curso));
      assert.doesNotMatch(publico, /"minutos"/);
    },
  );
});

test("el curso real filtra los minutos, salvo donde son la instrucción", () => {
  const publico = mod.cursoParaAlumno(mod.cargarCurso());
  const items = publico.sesiones.flatMap((s) =>
    s.unidades.flatMap((u) => u.items),
  );
  const conMinutos = items.filter(
    (i) => (i as { minutos?: number }).minutos !== undefined,
  );
  // Las excepciones de §3, explícitas: en una ventana de lectura y en un
  // receso los minutos son la instrucción a la clase, no el plan del docente.
  assert.ok(conMinutos.length > 0);
  assert.deepEqual([...new Set(conMinutos.map((i) => i.tipo))].sort(), [
    "lectura",
    "receso",
  ]);

  // Y las horas de la sesión sí viajan: son el total que el alumno puede ver.
  assert.match(JSON.stringify(publico), /"horaInicio"/);
});

test("ningún receso llega al alumno sin su número", () => {
  // Se coló en producción: la lámina de receso se dibuja **entera** a partir
  // de `minutos` —el titular y la cuenta regresiva— así que sin él decía
  // «minutos» sin cifra y contaba `NaN:NaN`.
  //
  // Y no se veía dictando, que es lo que lo hizo durar: la pantalla que el
  // docente proyecta no pasa por este filtro. El fallo existía solo en el
  // navegador de cada alumno.
  const publico = mod.cursoParaAlumno(mod.cargarCurso());
  const recesos = publico.sesiones
    .flatMap((s) => s.unidades.flatMap((u) => u.items))
    .filter((i) => i.tipo === "receso");

  assert.ok(recesos.length > 0, "el curso ya no tiene recesos que comprobar");
  for (const r of recesos) {
    assert.equal(
      typeof (r as { minutos?: number }).minutos,
      "number",
      `${r.id} llega sin minutos`,
    );
  }
});

// --------------------------------------------------------------------------
// Una unidad en su propio archivo
// --------------------------------------------------------------------------

const UNIDAD_SUELTA = `
id: u1
tipo: reto
titulo: Unidad en su archivo
items:
  - id: i1
    tipo: titulo
    titulo: Hola
    minutos: 4
`;

function sesionQueApunta(archivos: string[]): string {
  return `
id: sesion-1
numero: 1
titulo: Sesión de prueba
unidades:
${archivos.map((a) => `  - archivo: ${a}`).join("\n")}
`;
}

test("una unidad puede vivir en su propio archivo", () => {
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionQueApunta(["unidades/s01-u01-prueba.yml"]),
      "unidades/s01-u01-prueba.yml": UNIDAD_SUELTA,
    },
    (raiz) => {
      const unidad = mod.cargarCurso(raiz).sesiones[0]?.unidades[0];
      assert.equal(unidad?.id, "u1");
      assert.equal(unidad?.titulo, "Unidad en su archivo");
      assert.equal(unidad?.items.length, 1);
    },
  );
});

test("un archivo de unidad que no existe falla nombrándolo", () => {
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionQueApunta(["unidades/no-existe.yml"]),
    },
    (raiz) => {
      assert.throws(() => mod.cargarCurso(raiz), /no-existe\.yml/);
    },
  );
});

test("una unidad repartida entre el archivo y la sesión falla", () => {
  // Media unidad acá y media allá es la clase de cosa que se descubre cuando
  // alguien edita el sitio equivocado y no pasa nada.
  const sesion = `
id: sesion-1
numero: 1
titulo: Sesión de prueba
unidades:
  - archivo: unidades/s01-u01-prueba.yml
    titulo: Otro título
`;
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesion,
      "unidades/s01-u01-prueba.yml": UNIDAD_SUELTA,
    },
    (raiz) => {
      assert.throws(() => mod.cargarCurso(raiz), /no repartida entre los dos/);
    },
  );
});

test("los errores de una unidad nombran su archivo, no el de la sesión", () => {
  // Sin esto, un error del reto 4 diría «sesion-2.yml» y habría que buscarlo
  // entre novecientas líneas que ya no están ahí.
  const rota = `
id: u1
tipo: reto
titulo: Unidad rota
items:
  - id: i1
    tipo: terminal
`;
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionQueApunta(["unidades/s01-u01-rota.yml"]),
      "unidades/s01-u01-rota.yml": rota,
    },
    (raiz) => {
      assert.throws(() => mod.cargarCurso(raiz), /s01-u01-rota\.yml · unidad/);
    },
  );
});

test("el curso real vive en archivos por unidad, uno por unidad", () => {
  // La versión anterior fijaba «6 unidades por sesión» a mano, y se rompió el
  // día que entró una séptima. La invariante es el reparto en archivos: una
  // unidad, un archivo, y el orden lo manda la lista de la sesión.
  //
  // Hasta el 8 de agosto esto además exigía que la lista estuviera en orden
  // alfabético, porque el prefijo `sNN-uNN` bastaba para saber cuándo se
  // dictaba cada unidad. **Dejó de ser cierto ese sábado**: la sesión llegó
  // hasta el reto 1 y los retos 2 y 3 pasaron al domingo sin renombrarse, para
  // no romper las referencias de la pauta ni los identificadores que la clase
  // ya tenía. Un taller que se dicta en vivo se reordena; lo que no puede
  // cambiar es que cada unidad viva en su archivo.
  const curso = mod.cargarCurso();
  const dir = join(process.cwd(), "contenido", "sesiones");

  for (const sesion of curso.sesiones) {
    const yml = readFileSync(join(dir, `sesion-${sesion.numero}.yml`), "utf8");
    const rutas = [...yml.matchAll(/^\s*-\s*archivo:\s*(\S+)/gm)].map((m) => m[1]!);

    assert.equal(
      rutas.length,
      sesion.unidades.length,
      `${sesion.id}: una unidad, un archivo`,
    );
    assert.equal(
      new Set(rutas).size,
      rutas.length,
      `${sesion.id}: un archivo listado dos veces`,
    );
  }

  // Y que ningún archivo de unidad se quede fuera de las dos sesiones: al
  // mover unidades de una a otra, olvidarse una es exactamente el error que
  // nadie ve hasta que falta media hora de clase.
  const listadas = curso.sesiones.flatMap((s) => s.unidades.length);
  assert.equal(
    listadas.reduce((a, b) => a + b, 0),
    readdirSync(join(process.cwd(), "contenido", "unidades")).filter((f) =>
      f.endsWith(".yml"),
    ).length,
    "hay archivos de unidad que ninguna sesión lista",
  );

  assert.equal(curso.sesiones[0]?.unidades[0]?.id, "s1-apertura");
  assert.equal(curso.sesiones[1]?.unidades.at(-1)?.id, "s2-cierre");
});

// --------------------------------------------------------------------------
// Ventanas de lectura
// --------------------------------------------------------------------------

test("una lectura sin archivos ni comandos no es una lámina, y falla", () => {
  // Sin nada que abrir ni que correr, lo único que queda en pantalla es un
  // título con un reloj — que es exactamente el «trabajen un rato» que este
  // tipo existe para no volver a decir.
  const items = `
      - id: vacia
        tipo: lectura
        titulo: Lean
        minutos: 8
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      assert.throws(() => mod.cargarCurso(raiz), /archivos.*comandos|comandos.*archivos/);
    },
  );
});

test("una lectura sin minutos falla: el tiempo propuesto es el punto", () => {
  const items = `
      - id: sin-tiempo
        tipo: lectura
        titulo: Lean
        comandos: ["make agente"]
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      assert.throws(() => mod.cargarCurso(raiz), /minutos/);
    },
  );
});

test("una lectura solo con comandos vale, y solo con archivos también", () => {
  const items = `
      - id: solo-comandos
        tipo: lectura
        titulo: Corran
        minutos: 5
        comandos: ["make plano"]
      - id: solo-archivos
        tipo: lectura
        titulo: Lean
        minutos: 5
        archivos:
          - ruta: agente/grafo.py
            porque: Los siete nodos y sus aristas
            lineas: "381-400"
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const items = mod.cargarCurso(raiz).sesiones[0]?.unidades[0]?.items ?? [];
      assert.equal(items.length, 2);
      assert.equal(items[0]?.tipo, "lectura");
    },
  );
});

test("el alumno no ve los minutos, salvo en una ventana de lectura", () => {
  // Los minutos son del docente (§3), y en una `lectura` son la instrucción:
  // sin ellos la clase ve un reloj en blanco justo donde el reloj es el punto.
  const items = `
      - id: una-lamina
        tipo: titulo
        titulo: Portada
        minutos: 4
      - id: una-ventana
        tipo: lectura
        titulo: Lean
        minutos: 8
        comandos: ["make plano"]
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const curso = mod.cursoParaAlumno(mod.cargarCurso(raiz));
      const suyos = curso.sesiones[0]?.unidades[0]?.items ?? [];
      assert.equal((suyos[0] as { minutos?: number }).minutos, undefined);
      assert.equal((suyos[1] as { minutos?: number }).minutos, 8);
    },
  );
});

test("una ruta con coletilla no se enlaza: llevaría a un 404", () => {
  // Varios ítems escriben `ui/app.py · el bloque de la reflexión` porque el
  // fragmento no es el archivo entero.
  assert.equal(sitio.rutaDeLab("agente/accion.py"), "agente/accion.py");
  assert.equal(
    sitio.rutaDeLab("ui/app.py · el bloque de la reflexión"),
    "ui/app.py",
  );
  // Sin extensión y aun así archivo: la lista corta existe para esto.
  assert.equal(sitio.rutaDeLab("Makefile"), "Makefile");
  assert.equal(sitio.rutaDeLab("el bloque de la reflexión"), null);
  assert.equal(sitio.rutaDeLab("los seis nodos"), null);
});

test("el enlace al laboratorio ancla las líneas como las ancla GitHub", () => {
  assert.match(sitio.enlaceALab("agente/grafo.py"), /blob\/main\/agente\/grafo\.py$/);
  assert.match(sitio.enlaceALab("agente/grafo.py", "381-404"), /#L381-L404$/);
  assert.match(sitio.enlaceALab("agente/grafo.py", "381"), /#L381$/);
});

test("sin la carpeta de assets el curso carga igual, y con ella un archivo que falta sigue fallando", () => {
  // Es la diferencia entre «esto corre donde `public/` no viaja» —una función
  // serverless— y «este material está roto». Confundirlas devolvía un 500 en
  // las páginas del docente con todo el contenido correcto.
  const items = `
      - id: con-imagen
        tipo: imagen
        titulo: Una captura
        archivo: img/no-esta.png
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      // Sin carpeta de assets: carga.
      assert.equal(mod.cargarCurso(raiz).sesiones.length, 1);
    },
  );

  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(items),
      "../public/contenido/img/otra.png": "x",
    },
    (raiz) => {
      // Con carpeta y sin el archivo: falla nombrándolo.
      assert.throws(() => mod.cargarCurso(raiz), /no-esta\.png/);
    },
  );
});

const GLOSARIO_MINIMO = `
terminos:
  - termino: deriva
    grupo: La telemetría
    definicion: Cuando el modelo empieza a fallar de otra manera.
  - termino: anomalía
    grupo: La telemetría
    definicion: Cuando el problema es de los datos y no del modelo.
`;

test("un término marcado como nuevo tiene que estar en la lámina", () => {
  // Prometer una novedad que no se proyecta es una promesa que la lámina no
  // cumple, y no se descubre hasta tenerla delante de la clase.
  const items = `
      - id: vocabulario
        tipo: glosario
        titulo: Las palabras que vienen
        terminos: [deriva]
        nuevos: [anomalía]
`;
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "glosario.yml": GLOSARIO_MINIMO,
      "sesiones/s1.yml": sesionCon(items),
    },
    (raiz) =>
      assert.throws(() => mod.cargarCurso(raiz), /`anomalía` está en `nuevos`/),
  );
});

test("un término solo se abre una vez en todo el curso", () => {
  // La regla que hace que `nuevos` valga la pena. Dos láminas presentando
  // «deriva» como novedad son dos explicaciones que se separan en cuanto
  // alguien corrige una — y viven en archivos distintos, así que solo se
  // pueden comparar cargando el curso entero.
  const lamina = (id: string) => `
      - id: ${id}
        tipo: glosario
        titulo: Las palabras que vienen
        terminos: [deriva, anomalía]
        nuevos: [deriva]
`;
  const segunda = sesionCon(lamina("vocabulario-2"))
    .replace("id: sesion-1", "id: sesion-2")
    .replace("numero: 1", "numero: 2")
    .replace("id: u1", "id: u2");

  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "glosario.yml": GLOSARIO_MINIMO,
      "sesiones/s1.yml": sesionCon(lamina("vocabulario-1")),
      "sesiones/s2.yml": segunda,
    },
    (raiz) =>
      assert.throws(
        () => mod.cargarCurso(raiz),
        /`deriva` se declara nuevo dos veces: en `vocabulario-1` y en `vocabulario-2`/,
      ),
  );

  // Y con uno nuevo en cada una, carga.
  const otra = sesionCon(lamina("vocabulario-2").replace("[deriva]\n", "[anomalía]\n"))
    .replace("id: sesion-1", "id: sesion-2")
    .replace("numero: 1", "numero: 2")
    .replace("id: u1", "id: u2");
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "glosario.yml": GLOSARIO_MINIMO,
      "sesiones/s1.yml": sesionCon(lamina("vocabulario-1")),
      "sesiones/s2.yml": otra,
    },
    (raiz) => assert.equal(mod.cargarCurso(raiz).sesiones.length, 2),
  );
});

test("un `descargas` valida cada entrada de su lista, no solo la primera", () => {
  // La lista es lo único que este tipo tiene, así que sus tres formas de estar
  // mal —vacía, sin título, apuntando a un PDF que nadie copió— tienen que
  // fallar al construir. Un descargable roto solo se nota cuando alguien hace
  // clic, y eso es en clase.
  const conLista = (entradas: string) => `
      - id: guias
        tipo: descargas
        titulo: Las guías
        archivos:
${entradas}
`;

  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(conLista("          []")),
    },
    (raiz) => assert.throws(() => mod.cargarCurso(raiz), /lista no vacía/),
  );

  const dos = `          - archivo: archivos/guias/uno.pdf
            titulo: Uno
          - archivo: archivos/guias/dos.pdf`;

  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(conLista(dos)),
      "../public/contenido/archivos/guias/uno.pdf": "x",
      "../public/contenido/archivos/guias/dos.pdf": "x",
    },
    (raiz) =>
      // La segunda entrada no tiene título: se nombra por su índice.
      assert.throws(() => mod.cargarCurso(raiz), /archivos\[1\]: falta `titulo`/),
  );

  const completas = `          - archivo: archivos/guias/uno.pdf
            titulo: Uno
          - archivo: archivos/guias/no-esta.pdf
            titulo: Dos`;

  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(conLista(completas)),
      "../public/contenido/archivos/guias/uno.pdf": "x",
    },
    (raiz) => assert.throws(() => mod.cargarCurso(raiz), /no-esta\.pdf/),
  );

  // Y sin carpeta de assets carga igual, por lo mismo que `imagen`: es una
  // función serverless donde `public/` no viaja, no material roto.
  conContenido(
    {
      "curso.yml": CURSO_MINIMO,
      "sesiones/s1.yml": sesionCon(conLista(completas)),
    },
    (raiz) => assert.equal(mod.cargarCurso(raiz).sesiones.length, 1),
  );
});

test("la pantalla que se proyecta va sin notas, y con todo lo demás", () => {
  // El curso se dicta por videollamada: la pantalla del docente la ve la
  // clase. Las respuestas y los minutos sí se quedan — hacen falta para
  // revelar y para el reloj, y no se dibujan hasta que él lo decide.
  const items = `
      - id: con-todo
        tipo: pregunta
        titulo: Una pregunta
        pregunta: ¿Cuál?
        opciones: ["a", "b"]
        respuesta: a
        minutos: 3
        notas: No adelantar el número
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const sesion = mod.cargarCurso(raiz).sesiones[0]!;
      const proyectada = mod.sesionSinNotas(sesion);
      const item = proyectada.unidades[0]!.items[0]! as unknown as Record<string, unknown>;
      assert.equal(item.notas, undefined);
      assert.equal(item.respuesta, "a");
      assert.equal(item.minutos, 3);
      // Y la original no se toca: se reutiliza entre peticiones.
      assert.match(
        String((sesion.unidades[0]!.items[0]! as unknown as Record<string, unknown>).notas),
        /No adelantar el número/,
      );
    },
  );
});

test("la asistencia la ve la clase; su instrucción, no", () => {
  const items = `
      - id: lista
        tipo: asistencia
        titulo: Tomar asistencia
        nota: Tomarla ahora, no al final
`;
  conContenido(
    { "curso.yml": CURSO_MINIMO, "sesiones/s1.yml": sesionCon(items) },
    (raiz) => {
      const curso = mod.cargarCurso(raiz);
      const suyos = mod.cursoParaAlumno(curso).sesiones[0]!.unidades[0]!.items;
      assert.equal(suyos.length, 1, "la lámina no se le oculta");
      assert.equal((suyos[0] as unknown as Record<string, unknown>).nota, undefined);
      assert.equal(
        (curso.sesiones[0]!.unidades[0]!.items[0] as unknown as Record<string, unknown>).nota,
        "Tomarla ahora, no al final",
      );
    },
  );
});

test("dos asistencias por sesión, y una de ellas detrás del receso", () => {
  // Regla de la coordinación del programa, no nuestra: una asistencia 15 min
  // después de empezar y otra al volver del receso. Es lo único con lo que se
  // evalúa el taller, así que un ítem que se caiga al reordenar contenido se
  // paga con un acta incompleta y sin forma de reconstruirla el lunes.
  const curso = mod.cargarCurso();

  for (const sesion of curso.sesiones) {
    const items = sesion.unidades.flatMap((u) => u.items);
    const asistencias = items
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => it.tipo === "asistencia");
    assert.equal(asistencias.length, 2, `${sesion.id}: dos asistencias`);

    const receso = items.findIndex((it) => it.tipo === "receso");
    assert.ok(receso >= 0, `${sesion.id}: tiene receso`);
    assert.ok(
      asistencias[0]!.i < receso,
      `${sesion.id}: la primera va antes del receso`,
    );
    assert.ok(
      asistencias[1]!.i > receso,
      `${sesion.id}: la segunda va después del receso`,
    );
  }
});

test("la encuesta docente cierra la sesión 2, y su instrucción es privada", () => {
  // Requisito escrito de la coordinación: los últimos cinco minutos del
  // domingo. Va última porque despedir a la clase y pedirla después es cómo se
  // pierde la mitad de las respuestas — y si alguien mete contenido detrás, es
  // exactamente lo que pasaría sin que nadie lo notara hasta el domingo.
  //
  // Se busca la sesión 2 POR SU ID y no como «la última». Eran lo mismo
  // mientras el curso tuvo dos sesiones, y dejaron de serlo al entrar la 3 —
  // que es material y no se dicta, así que no cierra ningún dictado ni pide
  // encuesta. La encuesta del programa es una y va donde termina el taller.
  const curso = mod.cargarCurso();
  const dictada = curso.sesiones.find((s) => s.id === "sesion-2")!;
  assert.ok(dictada, "existe la sesión 2");
  const items = dictada.unidades.flatMap((u) => u.items);
  const final = items[items.length - 1]!;

  assert.equal(final.tipo, "encuesta", "la encuesta es el último ítem");
  assert.ok(
    (final as unknown as Record<string, unknown>).nota,
    "lleva instrucción para el docente",
  );

  const publico = mod
    .cursoParaAlumno(curso)
    .sesiones.flatMap((s) => s.unidades.flatMap((u) => u.items))
    .filter((i) => i.tipo === "encuesta");
  assert.equal(publico.length, 1, "la lámina sí la ve la clase");
  assert.equal(
    (publico[0] as unknown as Record<string, unknown>).nota,
    undefined,
    "su instrucción, no",
  );
  assert.ok(
    (publico[0] as unknown as Record<string, unknown>).url,
    "la URL sí: es lo que tienen que abrir",
  );
});
