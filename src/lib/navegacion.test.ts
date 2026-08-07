import { test } from "node:test";
import assert from "node:assert/strict";

import {
  acotar,
  avanzar,
  buscarPorId,
  comparar,
  indiceDeItem,
  minutosDeSesion,
  minutosDeUnidad,
  minutosHasta,
  pasosDe,
  retroceder,
  totalItems,
} from "./navegacion";
import type { Item, Sesion } from "./tipos";

function item(id: string, extra: Partial<Item> = {}): Item {
  return { id, tipo: "titulo", titulo: id, ...extra } as Item;
}

const CON_PASOS = {
  id: "cmd",
  tipo: "comando-anotado",
  comando: "docker compose up -d",
  segmentos: [
    { texto: "docker", explicacion: "a" },
    { texto: "-d", explicacion: "b" },
  ],
} as Item;

const SESION: Sesion = {
  id: "s1",
  numero: 1,
  titulo: "Prueba",
  unidades: [
    { id: "u1", tipo: "repaso", titulo: "Uno", items: [item("a"), item("b")] },
    { id: "u2", tipo: "reto", titulo: "Dos", items: [CON_PASOS, item("c")] },
  ],
};

// --------------------------------------------------------------------------

test("un ítem sin pasos internos tiene exactamente uno", () => {
  assert.equal(pasosDe(item("x")), 1);
});

test("un ítem con pasos incluye el paso del conjunto completo", () => {
  // Primero el mapa, después el recorrido: dos segmentos son tres pasos.
  assert.equal(pasosDe(CON_PASOS), 3);
});

test("avanzar recorre ítems y cruza a la unidad siguiente", () => {
  let p = { unidad: 0, item: 0, paso: 0 };
  p = avanzar(SESION, p);
  assert.deepEqual(p, { unidad: 0, item: 1, paso: 0 });
  p = avanzar(SESION, p);
  assert.deepEqual(p, { unidad: 1, item: 0, paso: 0 });
});

test("avanzar entra en los pasos antes de saltar de ítem", () => {
  let p = { unidad: 1, item: 0, paso: 0 };
  p = avanzar(SESION, p);
  assert.deepEqual(p, { unidad: 1, item: 0, paso: 1 });
  p = avanzar(SESION, p);
  assert.deepEqual(p, { unidad: 1, item: 0, paso: 2 });
  p = avanzar(SESION, p);
  assert.deepEqual(p, { unidad: 1, item: 1, paso: 0 });
});

test("retroceder a un ítem con pasos cae en su último paso", () => {
  // Retroceder es deshacer: quien retrocede quiere ver lo que acaba de pasar,
  // no volver al principio del diagrama.
  const p = retroceder(SESION, { unidad: 1, item: 1, paso: 0 });
  assert.deepEqual(p, { unidad: 1, item: 0, paso: 2 });
});

test("retroceder cruza a la unidad anterior por su último ítem", () => {
  const p = retroceder(SESION, { unidad: 1, item: 0, paso: 0 });
  assert.deepEqual(p, { unidad: 0, item: 1, paso: 0 });
});

test("el final de la sesión no tira a una pantalla en blanco", () => {
  // En clase se pulsa la flecha mirando a la audiencia, no a la pantalla.
  const fin = { unidad: 1, item: 1, paso: 0 };
  assert.deepEqual(avanzar(SESION, fin), fin);
});

test("el principio tampoco", () => {
  const inicio = { unidad: 0, item: 0, paso: 0 };
  assert.deepEqual(retroceder(SESION, inicio), inicio);
});

test("avanzar y retroceder son inversas a lo largo de toda la sesión", () => {
  // La comprobación que de verdad importa: recorrer entero y volver.
  const visitadas = [];
  let p = { unidad: 0, item: 0, paso: 0 };
  for (let i = 0; i < 20; i++) {
    visitadas.push({ ...p });
    const siguiente = avanzar(SESION, p);
    if (comparar(siguiente, p) === 0) break;
    p = siguiente;
  }
  for (let i = visitadas.length - 2; i >= 0; i--) {
    p = retroceder(SESION, p);
    assert.deepEqual(p, visitadas[i], `al retroceder al paso ${i}`);
  }
});

test("acotar arregla una posición imposible", () => {
  assert.deepEqual(acotar(SESION, { unidad: 9, item: 9, paso: 9 }), {
    unidad: 1,
    item: 1,
    paso: 0,
  });
  assert.deepEqual(acotar(SESION, { unidad: -3, item: -1, paso: -1 }), {
    unidad: 0,
    item: 0,
    paso: 0,
  });
});

test("acotar recorta el paso al máximo del ítem", () => {
  assert.deepEqual(acotar(SESION, { unidad: 1, item: 0, paso: 99 }), {
    unidad: 1,
    item: 0,
    paso: 2,
  });
});

test("indiceDeItem numera de forma continua entre unidades", () => {
  assert.equal(indiceDeItem(SESION, { unidad: 0, item: 0, paso: 0 }), 0);
  assert.equal(indiceDeItem(SESION, { unidad: 1, item: 0, paso: 0 }), 2);
  assert.equal(indiceDeItem(SESION, { unidad: 1, item: 1, paso: 2 }), 3);
  assert.equal(totalItems(SESION), 4);
});

test("buscarPorId encuentra el ítem, y devuelve null si no está", () => {
  assert.deepEqual(buscarPorId(SESION, "cmd"), {
    unidad: 1,
    item: 0,
    paso: 0,
  });
  assert.equal(buscarPorId(SESION, "no-existe"), null);
});

test("comparar ordena por unidad, ítem y paso", () => {
  const a = { unidad: 0, item: 1, paso: 0 };
  const b = { unidad: 1, item: 0, paso: 0 };
  assert.ok(comparar(a, b) < 0);
  assert.ok(comparar(b, a) > 0);
  assert.equal(comparar(a, { ...a }), 0);
  assert.ok(
    comparar({ unidad: 0, item: 0, paso: 1 }, { unidad: 0, item: 0, paso: 2 }) <
      0,
  );
});

// -------------------------------------------------------------- el reloj

const CON_MINUTOS: Sesion = {
  id: "s2",
  numero: 2,
  titulo: "Con minutos",
  unidades: [
    {
      id: "u1",
      tipo: "repaso",
      titulo: "Uno",
      items: [
        item("a", { minutos: 10 }),
        item("b", { minutos: 5 }),
        item("b2", { minutos: 3 }),
      ],
    },
    {
      id: "u2",
      tipo: "reto",
      titulo: "Dos",
      // El último no declara minutos: es el caso normal de un título.
      items: [item("c", { minutos: 20 }), item("d")],
    },
  ],
};

test("una unidad vale la suma de sus ítems", () => {
  assert.equal(minutosDeUnidad(CON_MINUTOS.unidades[0]!), 18);
  assert.equal(minutosDeUnidad(CON_MINUTOS.unidades[1]!), 20);
});

test("una sesión vale la suma de sus unidades", () => {
  assert.equal(minutosDeSesion(CON_MINUTOS), 38);
});

test("una sesión sin minutos declarados suma cero, no falla", () => {
  assert.equal(minutosDeSesion(SESION), 0);
});

test("minutosHasta incluye el ítem actual", () => {
  assert.equal(minutosHasta(CON_MINUTOS, { unidad: 0, item: 0, paso: 0 }), 10);
  assert.equal(minutosHasta(CON_MINUTOS, { unidad: 0, item: 1, paso: 0 }), 15);
});

test("minutosHasta arrastra las unidades anteriores completas", () => {
  assert.equal(minutosHasta(CON_MINUTOS, { unidad: 1, item: 0, paso: 0 }), 38);
});

test("minutosHasta al final coincide con el total", () => {
  // La invariante que hace que el reloj y el índice nunca se contradigan:
  // recorrer la sesión entera suma exactamente lo que suma la sesión.
  const ultima = { unidad: 1, item: 1, paso: 0 };
  assert.equal(minutosHasta(CON_MINUTOS, ultima), minutosDeSesion(CON_MINUTOS));
});

test("los totales se calculan, nunca se declaran", () => {
  // Sumar unidad por unidad tiene que dar lo mismo que sumar la sesión. Es
  // trivialmente cierto mientras nadie meta un total declarado en el medio, y
  // ese es exactamente el día en que este test avisa.
  const porUnidades = CON_MINUTOS.unidades.reduce(
    (t, u) => t + minutosDeUnidad(u),
    0,
  );
  assert.equal(porUnidades, minutosDeSesion(CON_MINUTOS));
});
