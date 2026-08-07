import { test } from "node:test";
import assert from "node:assert/strict";

import { ErrorDePlantUml, leerSecuencia } from "./plantuml";

const FUENTE = `@startuml
' Un comentario, que no cuenta.

skinparam backgroundColor transparent

participant Percepcion as P
participant "Herramientas del agente" as H
participant Diagnostico as D

P -> H : comparar_periodos(14, 45)
H --> P : banderas por categoria
P -> D : evidencia reunida
D -> D : se lo piensa
@enduml
`;

test("lee participantes, con y sin alias", () => {
  const s = leerSecuencia(FUENTE);
  assert.deepEqual(s.participantes, [
    { alias: "P", nombre: "Percepcion" },
    { alias: "H", nombre: "Herramientas del agente" },
    { alias: "D", nombre: "Diagnostico" },
  ]);
});

test("lee los mensajes en orden, con su texto", () => {
  const s = leerSecuencia(FUENTE);
  assert.equal(s.mensajes.length, 4);
  assert.deepEqual(s.mensajes[0], {
    de: "P",
    a: "H",
    texto: "comparar_periodos(14, 45)",
    punteada: false,
    propio: false,
  });
});

test("distingue la respuesta punteada de la llamada", () => {
  const s = leerSecuencia(FUENTE);
  assert.equal(s.mensajes[0]?.punteada, false);
  assert.equal(s.mensajes[1]?.punteada, true);
});

test("un mensaje de alguien a sí mismo se marca como propio", () => {
  const s = leerSecuencia(FUENTE);
  assert.equal(s.mensajes[3]?.propio, true);
  assert.equal(s.mensajes[0]?.propio, false);
});

test("un participante que solo aparece en una flecha existe igual", () => {
  // PlantUML los declara sobre la marcha, y escribir un diagrama de cuatro
  // flechas sin declarar nada es algo que se hace constantemente.
  const s = leerSecuencia("@startuml\nAlfa -> Beta : hola\n@enduml");
  assert.deepEqual(
    s.participantes.map((p) => p.alias),
    ["Alfa", "Beta"],
  );
});

test("las notas se anclan al mensaje que las precede", () => {
  const s = leerSecuencia(`@startuml
A -> B : uno
note over A, B : lo importante pasa acá
B -> A : dos
@enduml`);
  assert.deepEqual(s.anotaciones, [
    { sobre: ["A", "B"], texto: "lo importante pasa acá", tras: 0 },
  ]);
});

test("una nota antes del primer mensaje se ancla en -1", () => {
  const s = leerSecuencia(`@startuml
note over A : antes de empezar
A -> B : uno
@enduml`);
  assert.equal(s.anotaciones[0]?.tras, -1);
});

test("una nota de varias líneas se junta en una", () => {
  const s = leerSecuencia(`@startuml
A -> B : uno
note right of B
  la primera parte
  y la segunda
end note
@enduml`);
  assert.equal(s.anotaciones[0]?.texto, "la primera parte y la segunda");
});

test("las activaciones se guardan como rangos de mensajes", () => {
  const s = leerSecuencia(`@startuml
A -> B : uno
activate B
B -> C : dos
C --> B : tres
deactivate B
B --> A : cuatro
@enduml`);
  assert.deepEqual(s.activaciones, [
    { participante: "B", desde: 1, hasta: 2 },
  ]);
});

// --------------------------------------------------------------------------
// Lo que NO entiende tiene que doler acá, no en clase
// --------------------------------------------------------------------------

test("una línea que no se entiende falla nombrándola", () => {
  assert.throws(
    () =>
      leerSecuencia(`@startuml
A -> B : uno
loop mientras haya evidencia
B -> C : dos
end
@enduml`),
    (e: unknown) => {
      assert.ok(e instanceof ErrorDePlantUml);
      assert.match((e as Error).message, /línea 3/);
      assert.match((e as Error).message, /loop mientras haya evidencia/);
      return true;
    },
  );
});

test("se reportan todas las líneas malas, no la primera", () => {
  try {
    leerSecuencia(`@startuml
A -> B : uno
alt caso raro
else
end
@enduml`);
    assert.fail("debería haber fallado");
  } catch (e) {
    const texto = (e as Error).message;
    assert.match(texto, /línea 3/);
    assert.match(texto, /línea 4/);
    assert.match(texto, /línea 5/);
  }
});

test("un diagrama sin mensajes es un error", () => {
  // Casi siempre significa que las flechas se escribieron con una sintaxis
  // que este lector no cubre, y se vería como un diagrama vacío proyectado.
  assert.throws(
    () => leerSecuencia("@startuml\nparticipant A\nparticipant B\n@enduml"),
    /no tiene ningún mensaje/,
  );
});

test("una activación sin cerrar es un error", () => {
  assert.throws(
    () => leerSecuencia("@startuml\nA -> B : uno\nactivate B\n@enduml"),
    /sin su `deactivate`/,
  );
});

test("un `deactivate` suelto es un error", () => {
  assert.throws(
    () => leerSecuencia("@startuml\nA -> B : uno\ndeactivate B\n@enduml"),
    /sin un `activate` antes/,
  );
});

test("una nota sin cerrar es un error", () => {
  assert.throws(
    () => leerSecuencia("@startuml\nA -> B : uno\nnote over A\n  algo\n@enduml"),
    /falta `end note`/,
  );
});

// --------------------------------------------------------------------------

test("el diagrama del curso se lee entero", () => {
  // El de verdad, el que se proyecta el domingo. Si este lector deja de
  // entenderlo, el test lo dice antes que la clase.
  const s = leerSecuencia(`@startuml
skinparam backgroundColor transparent
skinparam shadowing false

participant Percepcion as P
participant Herramientas as H
participant Diagnostico as D
participant Reflexion as R
participant Revision as V
participant Recomendacion as C
participant Accion as A

P -> H : comparar_periodos(14, 45, categoria)
H --> P : banderas por categoria
P -> H : detectar_anomalias(21)
H --> P : sin anomalias
P -> D : evidencia reunida
D -> R : hipotesis con alcance y severidad
R -> P : falta evidencia, vuelve a mirar
P -> D : evidencia ampliada
D -> R : hipotesis revisada
R -> V : la critica quedo en pie
V -> C : diagnostico reescrito
C -> A : recomendaciones
A -> A : la politica decide que se ejecuta

@enduml`);
  assert.equal(s.participantes.length, 7);
  assert.equal(s.mensajes.length, 13);
  assert.equal(s.mensajes.at(-1)?.propio, true);
});
