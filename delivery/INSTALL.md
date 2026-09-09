# Tolgee Figma Plugin — Preview build

Thanks for helping test the new version of the Tolgee Figma plugin! This is a
private preview build. You install it locally — it is **not** published to the
Figma Community and only appears on your own machine.

## Requirements

- **Figma desktop app** (Windows or macOS). Importing a local plugin is only
  possible in the desktop app, not in the browser.
  Download: https://www.figma.com/downloads/
- A Tolgee account and a **Project API key** (see step 4).

## 1. Unzip

Unzip `tolgee-plugin.zip` somewhere permanent (e.g. `Documents/tolgee-plugin`).
**Keep the folder** — Figma loads the plugin from these files every time, so
don't delete or move them after importing.

The folder contains: `manifest.json`, `main.js`, `ui.html`, `ui-inspect.html`.

## 2. Import into Figma

1. Open the **Figma desktop app**.
2. Open any file (or create a new one).
3. Top menu → **Plugins → Development → Import plugin from manifest…**
   (Or right‑click canvas → **Plugins → Development → Import plugin from manifest…**)
4. Select the **`manifest.json`** file from the unzipped folder.

The plugin now appears under **Plugins → Development → Tolgee**.

## 3. ⚠️ Test on a copy first

For your first run, please test on a **duplicate** of a file, not a critical
production file:

- In the Figma file browser, right‑click your file → **Duplicate**, and work in
  the copy.

Why: this preview shares plugin data with the regular Tolgee plugin, so your
existing key connections show up automatically (great for testing) — but until
you've confirmed everything works for you, it's safest to try it on a copy.

## 4. Connect your Tolgee project

1. Run the plugin: **Plugins → Development → Tolgee**.
2. Open **Settings / Connect** and paste your **Project API key**.
   - In Tolgee: your project → **Integrate** / **Developer settings → API keys**
     → create a key with the scopes the plugin asks for.
   - Self‑hosted Tolgee? Also set your instance URL in the plugin settings.
3. That's it — your keys and translations load from your project.

Your API key is stored **only on your machine** (Figma client storage) and is
never shared with anyone.

## 5. Using it

- Select a text layer → connect it to an existing Tolgee key, or create a new one.
- Pull to update the canvas from Tolgee; Push to send changes back.
- Dev Mode: the plugin also works in Figma **Dev Mode** (inspect panel).

## Updating to a newer build

When you get a new zip:

1. Replace the old files with the new ones (same folder is fine).
2. In Figma: **Plugins → Development**, right‑click **Tolgee → Remove**, then
   re‑import via **Import plugin from manifest…** (step 2).
   (If you kept the same folder path, Figma often just picks up the new files on
   next run — re‑import only if something looks stale.)

## Troubleshooting

- **"Import plugin from manifest" is missing** → you're in the browser. Use the
  **desktop app**.
- **Plugin loads but can't reach Tolgee** → check the API key and, for
  self‑hosted, the instance URL in settings.
- **Nothing happens / errors** → open the plugin's console:
  **Plugins → Development → Open console**, and send us the messages.

Questions or bugs — just reply to us with a screenshot and, if possible, the
console output. Thank you! 🙏
