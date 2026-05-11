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

const rootDir = path.resolve(__dirname, 'src-v2/ui-inspect');
const outDir = path.resolve(__dirname, 'dist');

// Opt-in bundle analysis: `ANALYZE=1 pnpm run build:ui-inspect`.
const analyze = process.env.ANALYZE === '1';

export default defineConfig({
  root: rootDir,
  plugins: [
    svelte(),
    tailwindcss(),
    viteSingleFile(),
    analyze &&
      visualizer({
        filename: path.join(outDir, 'stats-ui-inspect.html'),
        template: 'treemap',
        gzipSize: true,
        brotliSize: false,
        sourcemap: false,
        emitFile: false,
      }),
    {
      name: 'rename-ui-inspect-html',
      apply: 'build',
      closeBundle() {
        const from = path.join(outDir, 'index.html');
        const to = path.join(outDir, 'ui-inspect.html');
        if (fs.existsSync(from)) {
          fs.renameSync(from, to);
        }
      },
    },
    {
      // Strip only `crossorigin`, keep `type="module"`. See vite.config.ui.ts.
      name: 'figma-strip-crossorigin',
      apply: 'build',
      closeBundle() {
        const file = path.join(outDir, 'ui-inspect.html');
        if (!fs.existsSync(file)) return;
        const html = fs.readFileSync(file, 'utf-8');
        const patched = html.replace(
          /<script(\s+type="module")?\s+crossorigin\s*>/g,
          '<script$1>'
        );
        fs.writeFileSync(file, patched);
      },
    },
  ],
  resolve: {
    alias: {
      $shared: path.resolve(__dirname, 'src-v2/shared'),
      $inspect: path.resolve(__dirname, 'src-v2/ui-inspect'),
    },
  },
  build: {
    outDir,
    emptyOutDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    target: "es2020",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
