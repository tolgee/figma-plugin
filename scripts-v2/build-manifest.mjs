#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const manifestPath = path.join(distDir, 'manifest.json');

const manifest = {
  api: '1.0.0',
  id: '1212381421658754793',
  name: 'Tolgee',
  main: 'main.js',
  // Per-editor UI bundles: `figma` for design mode, `dev` for the Dev-Mode
  // inspect panel. Figma's manifest schema specifically uses these keys.
  ui: { figma: 'ui.html', dev: 'ui-inspect.html' },
  editorType: ['figma', 'dev'],
  // Required for plugins built after 2024 — forces async page access, which is
  // what our `getNodeByIdAsync` / `page.loadAsync()` code already assumes.
  documentAccess: 'dynamic-page',
  capabilities: ['inspect'],
  networkAccess: {
    allowedDomains: ['*'],
    reasoning: 'Self-hosted Tolgee instances may run on arbitrary domains.',
  },
  menu: [
    { name: 'Open Tolgee', command: 'open' },
    { separator: true },
    { name: 'Toggle Canvas Annotations', command: 'toggle-annotations' },
    { name: 'Refresh Annotations', command: 'refresh-annotations' },
  ],
  relaunchButtons: [
    { command: 'open-on-node', name: 'Edit Tolgee key', multipleSelection: false },
  ],
};

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Wrote ${path.relative(rootDir, manifestPath)}`);
