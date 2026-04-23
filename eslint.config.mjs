import { config } from "@vanya2h/eslint-config/react";

export default [
  {
    ignores: [".claude/", ".agents/", "leads/"],
  },
  ...config,
  {
    // @react-pdf/renderer renders to PDF, not HTML — unescaped entities are fine
    files: ["packages/cv/**/*.tsx"],
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];
