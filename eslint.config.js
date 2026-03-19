// Flat ESLint config for ESLint v9+, migrated from .eslintrc.json
import preactConfig from "eslint-config-preact";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import prettierPlugin from "eslint-plugin-prettier";
import jestPlugin from "eslint-plugin-jest";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: ["build", ".vscode"],
  },
  {
    files: ["src/**/*.{ts,tsx,js,jsx}", "scripts/**/*.{ts,js}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      globals: {
        // Browser + ES2021 env equivalent
        ...preactConfig.languageOptions?.globals,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      prettier: prettierPlugin,
      jest: jestPlugin,
    },
    rules: {
      // Start from preact + recommended + TS recommended
      ...(preactConfig.rules || {}),
      ...tsPlugin.configs.recommended.rules,

      // Project-specific rules from .eslintrc.json
      "prettier/prettier": "error",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "jest/expect-expect": "off",

      // Globally ignore unused `h` (JSX pragma for Preact)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^h$",
        },
      ],
    },
    settings: {
      react: {
        pragma: "h",
        version: "detect",
      },
    },
  },
];

