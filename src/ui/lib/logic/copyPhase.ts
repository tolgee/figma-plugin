/**
 * Human labels for the phases a copy run goes through — shown above the
 * progress bar in Create copy and Recreate copy so the user can tell what the
 * plugin is doing during the long silent stretches (deleting the old copy and
 * cloning the page inside Figma took ~15 s on the customer-sized test file,
 * with nothing moving on screen).
 *
 * `phase` strings come from `create-copy-progress` (main thread) and from the
 * UI's own fetch/write stages. Unknown phases fall back to `fallback`.
 */
export function copyPhaseLabel(phase: string | null | undefined, fallback: string): string {
  if (!phase) return fallback;
  if (phase === "fetching" || phase === "top-up") return "Loading translations from Tolgee…";
  if (phase === "preparing") return "Preparing the copy…";
  if (phase === "removing") return "Removing the old copy…";
  if (phase === "updating") return "Updating frames…";
  if (phase === "cloning") return "Cloning the page in Figma… (large pages take a while)";
  if (phase.startsWith("scanning")) return "Scanning the copy for connected keys…";
  if (phase === "writing-keys") return "Writing key names…";
  if (phase === "writing") return "Writing translations…";
  return fallback;
}

/**
 * What the progress bar shows for one phase of a copy run. Each phase gets
 * its OWN bar: the real counter where the phase has one (the scan's
 * per-language 0–100 scale, the write's node count), the side-to-side
 * indeterminate glide where it has none (a network fetch, the old copy's
 * removal, Figma's synchronous clone). The glide is compositor-animated (see
 * `progressBar.svelte`), so it keeps moving even while Figma blocks the
 * plugin window during the clone — Zuzka: "nepotřebuju procenta, ale
 * movement". The counter text is only shown where the numbers are nodes
 * (the write phases).
 */
export function copyPhaseBar(
  p: { current: number; total: number; phase: string } | null,
): { loaded: number; total: number | null; detail: string | null } {
  if (!p || p.total <= 0) return { loaded: 0, total: null, detail: null };
  const counted = p.phase === "writing" || p.phase === "writing-keys";
  return {
    loaded: p.current,
    total: p.total,
    detail: counted ? `${Math.min(p.current, p.total)} / ${p.total}` : null,
  };
}
