import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, 'src-v2/ui');
const outDir = path.resolve(__dirname, 'dist');

export default defineConfig({
  root: rootDir,
  plugins: [
    svelte(),
    tailwindcss(),
    viteSingleFile(),
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
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
