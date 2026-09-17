import path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "gallery");

/**
 * Standalone dev server for the component gallery / design-system page.
 *
 * Unlike the Figma plugin bundles, this is meant to run in a normal browser
 * with full Vite HMR so the UI can be tuned live. The Figma color tokens that
 * the components rely on (`--figma-color-*`) don't exist outside Figma, so
 * `gallery/theme.css` supplies light/dark fallbacks that approximate Figma's
 * own palette.
 */
export default defineConfig({
  root: rootDir,
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      $shared: path.resolve(__dirname, "src/shared"),
      $ui: path.resolve(__dirname, "src/ui"),
      // Only used to reuse the pure `shouldIgnoreNode` filter so the gallery
      // demonstrates the real ignore behaviour without duplicating its logic.
      $main: path.resolve(__dirname, "src/main"),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    open: true,
    fs: {
      // The gallery imports components from `src/ui`, which sits above `root`.
      allow: [__dirname],
    },
  },
});
