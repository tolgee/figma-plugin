import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest config for the src-v2 rewrite.
 *
 * Aliases mirror `tsconfig.json#compilerOptions.paths` so unit tests can use
 * the same `$shared/...`, `$main/...`, `$ui/...`, `$inspect/...` imports as
 * the production source.
 */
export default defineConfig({
  resolve: {
    alias: {
      $shared: path.resolve(here, "src-v2/shared"),
      $main: path.resolve(here, "src-v2/main"),
      $ui: path.resolve(here, "src-v2/ui"),
      $inspect: path.resolve(here, "src-v2/ui-inspect"),
    },
  },
  test: {
    include: ["src-v2/**/*.test.ts", "src-v2/**/__tests__/**/*.test.ts"],
    environment: "node",
  },
});
