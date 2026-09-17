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
  // Matches the published Tolgee plugin's identity, so a local/dev build is the
  // same plugin to Figma (shares its stored data) rather than a separate one.
  id: '1212381421658754793',
  name: 'Tolgee',
  main: 'main.js',
  // ONE shared UI bundle for both editors — matching production, which ships
  // a single `ui` for figma and dev alike. Dev-Mode safety lives in code, not
  // in a separate bundle: the message-impact guard ($shared/messagePolicy +
  // $main/bus.ts) blocks canvas writes, the navigation gate + per-component
  // hiding keep design-only affordances out of the dev UI. The per-editor map
  // form is kept (vs a plain string) so a future dev-specific bundle would be
  // a one-line change.
  ui: { figma: 'ui.html', dev: 'ui.html' },
  editorType: ['figma', 'dev'],
  // Required for plugins built after 2024 — forces async page access, which is
  // what our `getNodeByIdAsync` / `page.loadAsync()` code already assumes.
  documentAccess: 'dynamic-page',
  // `vscode` makes the existing read-only inspect panel (above) also launchable
  // from the Figma-for-VS-Code extension — no extra code needed, `figma.vscode`
  // is an empty marker interface. Matches production; dropped here by omission.
  capabilities: ['inspect', 'vscode'],
  networkAccess: {
    allowedDomains: ['*'],
    reasoning: 'Self-hosted Tolgee instances may run on arbitrary domains.',
  },
  // No `menu`: with one, Figma shows a submenu on launch instead of opening the
  // plugin directly. No `relaunchButtons`: a canvas-level "Edit Tolgee key"
  // shortcut was scaffolded but never wired (nothing ever called
  // `setRelaunchData`, so the button never appeared) — dropped to match
  // upstream, which has none.
};

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Wrote ${path.relative(rootDir, manifestPath)}`);
