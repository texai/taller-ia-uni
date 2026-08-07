import type { NextConfig } from "next";

const config: NextConfig = {
  // El contenido del curso se lee del sistema de archivos en tiempo de
  // construccion. `contenido/` queda fuera de src/ a proposito: lo edita una
  // persona que escribe material, no codigo.
  outputFileTracingIncludes: {
    // `contenido/` porque el curso se lee del sistema de archivos, y también
    // en tiempo de petición: las páginas del docente son dinámicas.
    //
    // Y `public/contenido/` porque el cargador comprueba que cada imagen y
    // cada descargable existan. En una función serverless `public/` no está
    // —lo sirve el CDN—, así que sin esta línea esa comprobación fallaba sobre
    // archivos que sí existen y sí se ven, y tumbaba la página entera.
    "/**": ["./contenido/**/*", "./public/contenido/**/*"],
  },
};

export default config;
