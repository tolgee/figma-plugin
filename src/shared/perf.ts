/**
 * Phase timing for the slow, multi-step flows (page copies, staleness check),
 * printed to the plugin console as ONE line per run — so a slow run on a
 * large file can be attributed to its phase (Figma's clone? the text writes?
 * a scan?) from a pasted console line instead of a DevTools trace. Costs a
 * handful of `Date.now()` calls per run; nothing per node.
 *
 * Output shape: `[tolgee:perf] recreate: page keys 120 ms, fetch 340 ms; total 460 ms`.
 */
export const PERF_PREFIX = "[tolgee:perf]";

export type PhaseTimer = {
  /** Close the current phase under `name` (optionally annotated, e.g. a count). */
  mark(name: string, extra?: string | number): void;
  /** One summary line for `label`, phases in order plus the total. */
  summary(label: string): string;
};

export function createPhaseTimer(now: () => number = Date.now): PhaseTimer {
  const start = now();
  let last = start;
  const phases: string[] = [];
  return {
    mark(name, extra) {
      const t = now();
      phases.push(`${name} ${t - last} ms${extra !== undefined ? ` (${extra})` : ""}`);
      last = t;
    },
    summary(label) {
      return `${PERF_PREFIX} ${label}: ${phases.join(", ")}; total ${now() - start} ms`;
    },
  };
}
