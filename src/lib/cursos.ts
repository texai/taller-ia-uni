/**
 * Inventario de cursos.
 *
 * Provisional: el batch 2 lo reemplaza por un cargador que lee `contenido/`.
 * Existe para que el batch 1 tenga algo que listar sin adelantar el modelo de
 * contenido, que es trabajo del batch siguiente.
 */

export interface ResumenCurso {
  id: string;
  titulo: string;
  subtitulo: string;
  programa: string;
  institucion: string;
  docente: string;
  descripcion: string;
  sesiones: { numero: number; titulo: string; cuando: string }[];
}

export const CURSOS: ResumenCurso[] = [
  {
    id: "taller-02",
    titulo: "Caso aplicado de IA en industria",
    subtitulo: "Un agente que vigila 192 modelos en producción",
    programa: "II Programa de Especialización en IA Generativa y MLOps",
    institucion: "Universidad Nacional de Ingeniería",
    docente: "Ernesto Anaya",
    descripcion:
      "Una cadena de retail pronostica su demanda todas las noches con 192 " +
      "modelos. Funcionan, hasta que dejan de funcionar. Vamos a construir el " +
      "agente que los vigila: percibe, recuerda, razona, se cuestiona a sí " +
      "mismo, y actúa.",
    sesiones: [
      {
        numero: 1,
        titulo: "El mundo y la percepción",
        cuando: "Sábado 8 de agosto · 15:00–19:00",
      },
      {
        numero: 2,
        titulo: "La arquitectura cognitiva",
        cuando: "Domingo 9 de agosto · 09:00–13:00",
      },
    ],
  },
];
