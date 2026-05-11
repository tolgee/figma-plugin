#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const manifestPath = path.join(distDir, 'manifest.json');

// Minimal manifest while we triangulate the loader error. Once the plugin
// boots, we re-add: documentAccess, capabilities, per-editor UI bundles,
// menu entries, and relaunchButtons.
const manifest = {
  api: '1.0.0',
  id: '1212381421658754793',
  name: 'Tolgee',
  main: 'main.js',
  ui: 'ui.html',
  editorType: ['figma'],
  networkAccess: {
    allowedDomains: ['*'],
    reasoning: 'Self-hosted Tolgee instances may run on arbitrary domains.',
  },
};

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Wrote ${path.relative(rootDir, manifestPath)}`);
