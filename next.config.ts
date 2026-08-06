import type { NextConfig } from "next";

const config: NextConfig = {
  // El contenido del curso se lee del sistema de archivos en tiempo de
  // construccion. `contenido/` queda fuera de src/ a proposito: lo edita una
  // persona que escribe material, no codigo.
  outputFileTracingIncludes: {
    "/**": ["./contenido/**/*"],
  },
};

export default config;
