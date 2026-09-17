import type { UiToMain } from "./messages";

/**
 * The single source of truth for what each UI→main message DOES to the
 * document — the central safety layer for Dev Mode (Figma's inspect-only
 * editor), where the plugin must never change anything a designer can see.
 *
 * Every message type MUST be classified here: the `Record` over
 * `UiToMain["type"]` is exhaustive, so adding a new message without
 * classifying it is a compile error, not a silently-unguarded hole. The
 * main-thread bus derives its Dev-Mode blocking from this map (see
 * `$main/bus.ts`), and the UI derives visibility from the same value — no
 * scattered `if (editorType === "dev")` conditions as the only defence.
 *
 * How to classify a NEW message:
 * - `canvas`   — changes something VISIBLE on the design (text, layers,
 *                pages). Blocked outright in Dev Mode. When unsure between
 *                `canvas` and `metadata`, pick `canvas` — a reviewer can
 *                relax it with evidence, but a leaked canvas write in Dev
 *                Mode is the exact bug this map exists to prevent.
 * - `metadata` — writes only invisible state: pluginData, plugin config,
 *                clientStorage. Safe everywhere; production's Dev Mode
 *                allows the same (its Push flow writes pluginData).
 * - `read`     — reads the document (or moves the viewport) without
 *                changing it. `scroll-to-node` sits here: the highlight
 *                flash is already skipped on non-design editors inside
 *                `$main/nodes/highlight.ts`, the scroll itself is a
 *                viewport move, not a document change.
 * - `ui`       — iframe housekeeping (resize, close, toasts, opening
 *                external URLs). Never touches the document at all.
 */
export type MessageImpact = "canvas" | "metadata" | "read" | "ui";

export const MESSAGE_IMPACT: Record<UiToMain["type"], MessageImpact> = {
  // canvas — rewrites TextNode.characters ("apply-translations") or clones/
  // deletes whole pages ("create-copy"). The two ways this plugin can change
  // what a designer sees.
  "apply-translations": "canvas",
  "create-copy": "canvas",

  // metadata — pluginData / config / clientStorage writes only.
  "save-config": "metadata",
  "persist-project-id": "metadata",
  reset: "metadata",
  "set-language": "metadata",
  "set-branch": "metadata",
  "set-nodes-data": "metadata",

  // read — document reads (scans, screenshots' exportAsync) + viewport moves.
  "request-page-connected-nodes": "read",
  "resolve-parent-names": "read",
  "request-screenshots": "read",
  "scroll-to-node": "read",
  "request-copy-staleness": "read",

  // ui — iframe housekeeping.
  "ui-ready": "ui",
  resize: "ui",
  close: "ui",
  notify: "ui",
  "open-external": "ui",
};

/** Impacts the Dev-Mode editor may process — everything except `canvas`. */
export const DEV_ALLOWED_IMPACTS: ReadonlySet<MessageImpact> = new Set([
  "read",
  "metadata",
  "ui",
]);
