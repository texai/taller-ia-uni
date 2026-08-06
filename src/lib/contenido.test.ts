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
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import * as mod from "./contenido";
import { ESPECIFICACION } from "./especificacion";
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
    mkdirSync(join(raiz, "md"), { recursive: true });
    for (const [ruta, texto] of Object.entries(archivos)) {
      writeFileSync(join(raiz, ruta), texto, "utf8");
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

function sesionCon(items: string, extra = ""): string {
  return `
id: sesion-1
numero: 1
titulo: Sesión de prueba
unidades:
  - id: u1
    tipo: repaso
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

test("un ítem de asistencia no aparece en la carga del alumno", () => {
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
      const { cargarCurso, cursoParaAlumno } = mod;
      const publico = cursoParaAlumno(cargarCurso(raiz));
      const items = publico.sesiones[0]!.unidades[0]!.items;
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

test("minutosDe usa los de la unidad, o suma los de sus ítems", () => {
  const { minutosDe } = mod;
  const items = [{ minutos: 10 }, { minutos: 5 }] as unknown as Item[];
  assert.equal(minutosDe({ minutos: 60, items } as Unidad), 60);
  assert.equal(minutosDe({ items } as Unidad), 15);
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
  assert.doesNotMatch(publico, /"tipo":"asistencia"/);

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
});
