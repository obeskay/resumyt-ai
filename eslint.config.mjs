import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  // React Compiler rules that arrived with eslint-config-next 16. The app does not
  // use the compiler, and they flag established patterns (setState in an effect,
  // merged refs, per-frame mutation in three.js), not bugs.
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
    },
  },
]);
