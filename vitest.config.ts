import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest config for the src rewrite.
 *
 * Aliases mirror `tsconfig.json#compilerOptions.paths` so unit tests can use
 * the same `$shared/...`, `$main/...`, `$ui/...` imports as
 * the production source.
 *
 * `svelte()` is here ONLY so `.svelte.ts` rune modules (the `stores/*`
 * files) compile when imported by a test — without it, `$state(...)` etc.
 * are untransformed and throw `ReferenceError: $state is not defined` at
 * import time (verified). This is NOT "Svelte component test infrastructure"
 * — no `.svelte` component is rendered, `environment` stays `"node"`, and no
 * DOM/jsdom/testing-library is involved; it just lets store logic (e.g.
 * `appState.setWriteProgress`/`clearWriteProgress`) be unit-tested directly.
 * Confirmed it doesn't change the existing suite: same pass count before and
 * after adding this plugin.
 */
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      $shared: path.resolve(here, "src/shared"),
      $main: path.resolve(here, "src/main"),
      $ui: path.resolve(here, "src/ui"),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/__tests__/**/*.test.ts"],
    environment: "node",
  },
});
