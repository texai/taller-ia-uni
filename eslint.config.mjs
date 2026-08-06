// Next 16 publica su configuracion de ESLint en formato plano, asi que se
// importa directamente. `next lint` ya no existe: el script llama a eslint.
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...(Array.isArray(nextVitals) ? nextVitals : [nextVitals]),
  ...(Array.isArray(nextTs) ? nextTs : [nextTs]),
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];

export default config;
