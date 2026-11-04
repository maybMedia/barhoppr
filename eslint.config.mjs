import { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";
import enableLegacyMinimatch from "./tools/minimatch-compat.cjs";

enableLegacyMinimatch();
const { FlatCompat } = createRequire(import.meta.url)("@eslint/eslintrc");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["tools/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-qa/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
