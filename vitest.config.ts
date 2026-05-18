import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest config for the src rewrite.
 *
 * Aliases mirror `tsconfig.json#compilerOptions.paths` so unit tests can use
 * the same `$shared/...`, `$main/...`, `$ui/...`, `$inspect/...` imports as
 * the production source.
 */
export default defineConfig({
  resolve: {
    alias: {
      $shared: path.resolve(here, "src/shared"),
      $main: path.resolve(here, "src/main"),
      $ui: path.resolve(here, "src/ui"),
      $inspect: path.resolve(here, "src/ui-inspect"),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/__tests__/**/*.test.ts"],
    environment: "node",
  },
});
