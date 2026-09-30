import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Código generado y builds de la app de escritorio
    "lib/generated/**",
    "dist/**",
    "dist-installer/**",
    "resources-standalone/**",
    // Script de Google Apps Script (sus funciones las llama Google, no el código)
    "docs/google-apps-script.js",
  ]),
  // Reglas pensadas para el React Compiler (el proyecto no lo usa). Marcan como error
  // el patrón clásico de cargar datos con fetch dentro de useEffect, que funciona bien.
  // Quedan como advertencia hasta migrar esa carga de datos (ej: a Server Components).
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  // Scripts de Node (CommonJS): usan require()
  {
    files: ["electron/**/*.js", "scripts/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
