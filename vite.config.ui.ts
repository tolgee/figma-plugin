import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { visualizer } from 'rollup-plugin-visualizer';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, 'src-v2/ui');
const outDir = path.resolve(__dirname, 'dist');

// Opt-in bundle analysis: `ANALYZE=1 pnpm run build:ui`. Kept off by default so
// regular builds stay fast and don't pollute `dist/` with a stats artifact.
const analyze = process.env.ANALYZE === '1';

export default defineConfig({
  root: rootDir,
  plugins: [
    svelte(),
    tailwindcss(),
    viteSingleFile(),
    analyze &&
      visualizer({
        filename: path.join(outDir, 'stats-ui.html'),
        template: 'treemap',
        gzipSize: true,
        brotliSize: false,
        sourcemap: false,
        emitFile: false,
      }),
    {
      name: 'rename-ui-html',
      apply: 'build',
      closeBundle() {
        const from = path.join(outDir, 'index.html');
        const to = path.join(outDir, 'ui.html');
        if (fs.existsSync(from)) {
          fs.renameSync(from, to);
        }
      },
    },
    {
      // Strip `crossorigin` and `type="module"` from inline script tags so the
      // Figma iframe (which runs at origin "null") can evaluate them. Figma's
      // own UI loader chokes on `<script type="module" crossorigin>` because
      // crossorigin requests against a null origin fail outright.
      name: 'figma-strip-script-attrs',
      apply: 'build',
      closeBundle() {
        const file = path.join(outDir, 'ui.html');
        if (!fs.existsSync(file)) return;
        const html = fs.readFileSync(file, 'utf-8');
        const patched = html
          .replace(/<script\s+type="module"\s+crossorigin>/g, '<script>')
          .replace(/<script\s+type="module">/g, '<script>')
          .replace(/<script\s+crossorigin>/g, '<script>');
        fs.writeFileSync(file, patched);
      },
    },
  ],
  resolve: {
    alias: {
      $shared: path.resolve(__dirname, 'src-v2/shared'),
      $ui: path.resolve(__dirname, 'src-v2/ui'),
    },
  },
  build: {
    outDir,
    emptyOutDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    // Figma's plugin iframe runs at origin "null"; the modulepreload polyfill
    // Vite injects tries to resolve preload candidates against that origin and
    // throws. Disable both the polyfill and the crossorigin attribute Vite
    // adds to the inline <script type="module">.
    modulePreload: false,
    target: "es2020",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
