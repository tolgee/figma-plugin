import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

/**
 * Vite dev-/preview-server for E2E tests.
 *
 * Serves `e2e/host/index.html` (the Figma-free host shim) and the freshly
 * built UI bundle from `dist/ui.html` on the same origin so that the
 * iframe and parent can communicate via `postMessage` without CORS hops.
 *
 * The host page must always render against the production build of the UI
 * — that's what ships to Figma. We therefore mount `dist/` as the public
 * directory rather than re-bundling the Svelte sources for tests; CI runs
 * `pnpm build` before invoking Playwright.
 */
export default defineConfig({
  root: path.resolve(__dirname, "host"),
  publicDir: path.resolve(rootDir, "dist"),
  resolve: {
    alias: {
      $shared: path.resolve(rootDir, "src/shared"),
      $ui: path.resolve(rootDir, "src/ui"),
    },
  },
  server: {
    port: 4173,
    strictPort: true,
    fs: {
      // The host imports types from `src/shared`, which sits above the
      // configured `root`. Allow Vite to read it explicitly.
      allow: [rootDir],
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
