/**
 * Force-close channel for tooltips.
 *
 * The plugin UI runs inside Figma's iframe. When the pointer leaves that iframe
 * in one motion — out of the Figma window, or onto the canvas beside the panel
 * — the trigger element never receives `pointerleave`, so the tooltip library
 * has no event to close on and the tooltip stays up indefinitely (reported
 * live: "every tooltip sometimes stays forever, when the mouse leaves the
 * area/iframe completely").
 *
 * The DOM wiring is one line with no branching; the registry below is the part
 * with actual logic, so it is kept separate and unit-tested. `ensureListening`
 * is a no-op without a `window`, which is also what lets those tests run in
 * this repo's `node` environment.
 */

const subscribers = new Set<() => void>();
let listening = false;

/** Close every currently-registered tooltip. */
export function dismissAllTooltips(): void {
  // Snapshot first: a subscriber that unregisters itself while closing would
  // otherwise mutate the set mid-iteration.
  for (const close of [...subscribers]) close();
}

function ensureListening(): void {
  if (listening || typeof window === "undefined") return;
  listening = true;
  // `blur` catches the pointer (or focus) leaving the iframe altogether;
  // `pointerleave` on the document catches it exiting through an edge while
  // the iframe keeps focus. Either alone leaves a gap.
  window.addEventListener("blur", dismissAllTooltips);
  document.addEventListener("pointerleave", dismissAllTooltips);
}

/**
 * Register `close` to run whenever tooltips must be dismissed. Returns an
 * unsubscribe function suitable for returning straight out of an `$effect`.
 */
export function onTooltipDismiss(close: () => void): () => void {
  ensureListening();
  subscribers.add(close);
  return () => {
    subscribers.delete(close);
  };
}
