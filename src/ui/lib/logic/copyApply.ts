import { renderIcuForNode } from "$shared/interpolate";
import type { UiToMain } from "$shared/messages";
import type { PhaseTimer } from "$shared/perf";
import type { NodeInfo } from "$shared/types";
import type { TolgeeClient } from "$ui/lib/api/client";
import { fetchAllTranslations, type PulledKey } from "$ui/lib/api/pull";
import { nextCorrelationId, on, send } from "$ui/lib/bus";
import { createIdleTimeout } from "$ui/lib/busRequest";
import { nsKeyIndex } from "$ui/lib/logic/namespaces";

/**
 * UI half of the language-copy flow. The main thread only CLONES the page and
 * returns its connected nodes (`create-copy-result.pages`) — it can't render
 * ICU itself, Figma's main-thread sandbox has no `Intl` (plural rules), so
 * every `{param}`/plural render silently failed there and copies came out
 * half in the source language. This module renders each node exactly like
 * the Download flow and writes the results back through the ordinary
 * `apply-translations` request, which also persists the raw `translation`
 * into plugin data — making a fresh copy identical to clone + Download all
 * (an immediate Download afterwards reports "No changes found").
 */

export type CopyTranslations = Record<string, { text: string; isPlural: boolean }>;

/** One freshly cloned page as `create-copy-result.pages` reports it. */
export type CopyPage = { pageId: string; language: string; nodes: NodeInfo[] };

/** The minimum `fetchCopyTranslations` needs per node — just its key identity,
 *  not a full `NodeInfo` (a `CopyPage`'s `nodes` satisfy this too). Lets a
 *  caller that only has `ConnectedKeyRef`s (from the cheap
 *  `requestPageConnectedKeys`, not a full node scan) pre-fetch without first
 *  paying for a full `NodeInfo` per node. */
type KeyRef = { connected?: boolean; key: string; ns?: string };

type ApplyUpdate = Extract<UiToMain, { type: "apply-translations" }>["updates"][number];

/**
 * Per-language translations map, keyed by `nsKeyIndex` so each cloned node
 * (which has a fresh ID) is matched back to its Tolgee key + namespace.
 * Carries `isPlural` alongside the raw text — a per-KEY Tolgee property,
 * trusted over the copied node's own (possibly stale) flag. Keys whose
 * translation in a language is empty are left OUT of that language's map, so
 * they count as "no translation yet" downstream instead of writing "".
 */
export function buildTranslationsMap(
  keys: PulledKey[],
  languages: string[],
): Record<string, CopyTranslations> {
  const map: Record<string, CopyTranslations> = {};
  for (const lang of languages) {
    const perLang: CopyTranslations = {};
    for (const k of keys) {
      const text = k.translations[lang]?.text;
      if (text) {
        perLang[nsKeyIndex(k.keyNamespace, k.keyName)] = { text, isPlural: k.isPlural };
      }
    }
    map[lang] = perLang;
  }
  return map;
}

/**
 * Fetch the translations a copy needs — by KEY NAMES, exactly like Download
 * does, not by paginating the whole project (the slowest possible fetch on a
 * large project, and the one place that trusted "every key of the project" to
 * come back). One batched, URL-length-safe fetch across every language.
 *
 * The copy flows call this BEFORE anything touches the canvas (scanning the
 * page about to be copied / the copy about to be recreated for its key names):
 * fetching after the clone meant a failed fetch — network down, or Tolgee's
 * translations rate limit — left orphan source-language pages behind, and
 * Recreate had by then already DELETED the old translated copy. Fetch-first
 * fails before anything is created or removed. Keys the fresh clone turns out
 * to carry that the pre-fetch didn't cover (connected mid-flight / since the
 * copy was made) are topped up afterwards by `topUpCopyTranslations`.
 */
/** A copy's fetched translations plus WHICH key names the fetch covered — a
 *  key with no translation in a language is absent from `translations` yet
 *  fetched, so `topUpCopyTranslations` must not ask for it again. */
export type CopyFetch = {
  translations: Record<string, CopyTranslations>;
  fetchedKeyNames: Set<string>;
};

export async function fetchCopyTranslations(
  client: TolgeeClient,
  pages: Array<{ language: string; nodes: readonly KeyRef[] }>,
  branch: string | undefined,
): Promise<CopyFetch> {
  const keyNames = new Set<string>();
  const languages = new Set<string>();
  for (const page of pages) {
    languages.add(page.language);
    // `connected` is omitted (not `=== false`) by callers that only have key
    // REFS (already filtered to connected keys by `collectConnectedKeyRefs`),
    // so its absence means "connected", not "unknown".
    for (const n of page.nodes) if (n.connected !== false && n.key) keyNames.add(n.key);
  }
  if (keyNames.size === 0) return { translations: {}, fetchedKeyNames: keyNames };
  const keys = await fetchAllTranslations(client, {
    languages: [...languages],
    branch: branch || undefined,
    keyNames: [...keyNames],
  });
  return { translations: buildTranslationsMap(keys, [...languages]), fetchedKeyNames: keyNames };
}

/**
 * Top `fetched` up with the keys `pages` (the FRESH clones) carry that the
 * pre-clone fetch didn't ask for — keys connected on the source since the
 * recreated copy was made, or mid-flight. Decided by key NAME, not by the
 * presence of a translation: a fetched key that simply has no translation yet
 * must not cost another request on every copy. Best-effort: a failed top-up
 * returns `fetched` as-is, and the uncovered strings are counted as "skipped"
 * (they keep the source text; a later Download picks them up) instead of
 * failing a copy whose canvas work already happened.
 */
export async function topUpCopyTranslations(
  client: TolgeeClient,
  pages: CopyPage[],
  fetched: CopyFetch,
  branch: string | undefined,
): Promise<CopyFetch> {
  const missing = pages
    .map((p) => ({
      ...p,
      nodes: p.nodes.filter((n) => n.connected && n.key && !fetched.fetchedKeyNames.has(n.key)),
    }))
    .filter((p) => p.nodes.length > 0);
  if (missing.length === 0) return fetched;
  let extra: CopyFetch;
  try {
    extra = await fetchCopyTranslations(client, missing, branch);
  } catch {
    return fetched;
  }
  const translations: Record<string, CopyTranslations> = { ...fetched.translations };
  for (const [lang, perLang] of Object.entries(extra.translations)) {
    translations[lang] = { ...perLang, ...translations[lang] };
  }
  return {
    translations,
    fetchedKeyNames: new Set([...fetched.fetchedKeyNames, ...extra.fetchedKeyNames]),
  };
}

/** Reject `promise` with `message` after `ms` of no settlement — the copy
 *  flows' network fetches have no progress pings to feed an idle watchdog, so
 *  a silently hung fetch would otherwise leave the job stuck forever. */
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e: unknown) => {
        clearTimeout(timer);
        reject(e instanceof Error ? e : new Error(String(e)));
      },
    );
  });
}

/** How long a copy flow waits for one translations fetch. Wall-clock, not
 *  idle: these fetches are small (filtered to the page's key names). */
export const COPY_FETCH_TIMEOUT_MS = 2 * 60_000;

/**
 * The text to write for each connected node of a fresh language copy: the
 * remote translation for its key, rendered through THIS node's own
 * plural/param samples — same pipeline as the regular Download. `isPlural`
 * comes from the remote key when available (a per-KEY Tolgee property) since
 * it's more trustworthy than the cloned node's own possibly-stale flag.
 *
 * A connected node whose key has no translation in `translationsForLang` (key
 * missing from the response, or empty in that language) is reported in
 * `skipped` and NOT written. It used to fall back to the node's own persisted
 * `translation` — which on a clone is whatever the SOURCE page last pulled,
 * i.e. usually the source-language text — and persist THAT as the copy's
 * translation. The string then looked "copied but untranslated" while the
 * translation existed in Tolgee all along, and the write masked the miss.
 * Skipping leaves the clone's source text in place (visually identical) with
 * nothing persisted, so a later Download still sees the node as outdated and
 * the caller can tell the user how many strings were left behind.
 *
 * An unrenderable ICU is skipped the same way — the clone keeps its source
 * text rather than getting raw ICU dumped onto the canvas.
 */
export function buildCopyUpdates(
  nodes: NodeInfo[],
  translationsForLang: CopyTranslations,
  language: string,
): { updates: ApplyUpdate[]; skipped: NodeInfo[] } {
  const updates: ApplyUpdate[] = [];
  const skipped: NodeInfo[] = [];
  for (const node of nodes) {
    if (!node.connected || !node.key) continue;
    const remote = translationsForLang[nsKeyIndex(node.ns, node.key)];
    if (!remote?.text) {
      skipped.push(node);
      continue;
    }
    const out = renderIcuForNode(remote.text, { ...node, isPlural: remote.isPlural }, language);
    if (out.error) {
      skipped.push(node);
      continue;
    }
    const update: ApplyUpdate = {
      id: node.id,
      text: out.text,
      translation: remote.text,
      isPlural: remote.isPlural,
    };
    // Persist the sample values the text was rendered with — on a Recreate
    // they may be ones carried over from the old copy (`withCarriedSamples`),
    // which the fresh clone doesn't hold yet. Same values otherwise: a no-op.
    if (node.paramsValues && Object.keys(node.paramsValues).length > 0) {
      update.paramsValues = node.paramsValues;
    }
    if (node.pluralParamValue) update.pluralParamValue = node.pluralParamValue;
    updates.push(update);
  }
  return { updates, skipped };
}

/** A copy text's sample ICU values (`{name}` → "John", plural count). */
export type SampleValues = { paramsValues?: Record<string, string>; pluralParamValue?: string };

/**
 * Sample values per key, read off an EXISTING copy right before it is
 * replaced. A language copy may hold values the user set for that language
 * ("Hello, John" while the source says "Ahoj, Zuzko"); a Recreate deletes the
 * copy and the fresh clone inherits the SOURCE page's values, so without this
 * every Recreate silently reset them. First occurrence wins for a key used
 * several times; keys without values are left out.
 */
export function sampleValuesByKey(
  refs: readonly { key: string; ns?: string; paramsValues?: Record<string, string>; pluralParamValue?: string }[],
): Map<string, SampleValues> {
  const out = new Map<string, SampleValues>();
  for (const ref of refs) {
    const hasParams = ref.paramsValues && Object.keys(ref.paramsValues).length > 0;
    if (!hasParams && !ref.pluralParamValue) continue;
    const id = nsKeyIndex(ref.ns, ref.key);
    if (out.has(id)) continue;
    const values: SampleValues = {};
    if (hasParams) values.paramsValues = ref.paramsValues;
    if (ref.pluralParamValue) values.pluralParamValue = ref.pluralParamValue;
    out.set(id, values);
  }
  return out;
}

/** The fresh clone's pages with carried sample values applied by key —
 *  `buildCopyUpdates` then renders AND persists them. */
export function withCarriedSamples(pages: CopyPage[], samples: Map<string, SampleValues> | undefined): CopyPage[] {
  if (!samples || samples.size === 0) return pages;
  return pages.map((page) => ({
    ...page,
    nodes: page.nodes.map((node) => {
      const carried = samples.get(nsKeyIndex(node.ns, node.key));
      return carried ? { ...node, ...carried } : node;
    }),
  }));
}

/** User-facing tail for a copy notice when some strings could not be written. */
export function copySkippedSuffix(skipped: number): string {
  if (skipped === 0) return "";
  return ` ${skipped} string${skipped === 1 ? "" : "s"} skipped — no translation in Tolgee yet.`;
}

// Same idle-timeout rationale as CopyView's own apply watchdog: progress
// messages keep resetting the clock, so only a genuinely silent write trips
// it — large pages legitimately take a while between pings.
const APPLY_TIMEOUT_MS = 5 * 60_000;

/**
 * Send one `apply-translations` batch and resolve with its result. Mirrors
 * `requestPageConnectedNodes`' promise-wrapper shape (correlation id pairing,
 * idle watchdog touched by progress). `onProgress` forwards the write's
 * done/total (only emitted by the main thread for batches > 100 nodes).
 */
export function applyTranslationsRequest(
  updates: ApplyUpdate[],
  onProgress?: (done: number, total: number) => void,
  options: { postClone?: boolean } = {},
): Promise<{ ok: boolean; errors: string[] }> {
  return new Promise((resolve) => {
    const correlationId = nextCorrelationId();
    const cleanup = (): void => {
      offResult();
      offProgress();
      watchdog.clear();
    };
    const watchdog = createIdleTimeout(APPLY_TIMEOUT_MS, () => {
      cleanup();
      resolve({ ok: false, errors: ["Timed out waiting for the translations to apply."] });
    });
    const offResult = on("apply-translations-result", (msg) => {
      if (msg.correlationId !== correlationId) return;
      cleanup();
      resolve({ ok: msg.ok, errors: msg.errors });
    });
    const offProgress = on("apply-translations-progress", (msg) => {
      if (msg.correlationId !== correlationId) return;
      watchdog.touch();
      onProgress?.(msg.done, msg.total);
    });
    send({ type: "apply-translations", correlationId, updates, postClone: options.postClone });
  });
}

/**
 * Render + apply the translations onto every freshly cloned page, one
 * `apply-translations` batch per page. Pages whose nodes all resolve to
 * "nothing to write" are skipped without a round-trip. Stops at the first
 * failing page and reports its first error — matching how the copy result
 * itself is surfaced (one error message, not a per-node report). `skipped`
 * counts the connected strings across all pages that had no translation to
 * write (see `buildCopyUpdates`), for the completion notice.
 */
export async function applyCopyPages(
  pages: CopyPage[],
  translationsByLang: Record<string, CopyTranslations>,
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: boolean; error?: string; skipped: number }> {
  let skippedTotal = 0;
  for (const page of pages) {
    const { updates, skipped } = buildCopyUpdates(
      page.nodes,
      translationsByLang[page.language] ?? {},
      page.language,
    );
    skippedTotal += skipped.length;
    if (updates.length === 0) continue;
    // Copy pages were cloned moments ago — see `apply-translations.postClone`.
    const result = await applyTranslationsRequest(updates, onProgress, { postClone: true });
    if (!result.ok) {
      return {
        ok: false,
        error: result.errors[0] ?? "Failed to write the copy's translations.",
        skipped: skippedTotal,
      };
    }
  }
  return { ok: true, skipped: skippedTotal };
}

const RECREATE_IDLE_TIMEOUT_MS = 5 * 60_000;

/**
 * Correlation id of the recreate currently in flight, or `null`.
 *
 * MODULE-scoped for the same reason the job itself is: recreating unmounts the
 * view that started it, so a "busy" flag held in component state dies with the
 * instance. A second Recreate could then start while the first was still
 * applying — and since recreating DELETES the existing copy page, the second
 * run would remove the fresh page the first one was midway through writing.
 */
let inFlightRecreate: string | null = null;

/** Whether a recreate is still running — including across the unmount of the
 *  view that started it. Callers must check this BEFORE sending `create-copy`;
 *  by the time the job is registered, the main thread is already deleting. */
export function isCopyRecreateInFlight(): boolean {
  return inFlightRecreate !== null;
}

/**
 * MODULE-SCOPED continuation for "Recreate copy": waits for this
 * `create-copy-result`, then renders + applies `translations` onto the fresh
 * clone and toasts "Copy recreated.".
 *
 * Why not in CopyView: recreating deletes the CURRENT page first (main switches
 * to the source page as fallback), and the source page isn't a copy — so
 * App.svelte routes away and CopyView UNMOUNTS mid-flight, tearing down any
 * `$effect`-registered result handler along with the held translations. The
 * clone then completed with nobody left to apply the fetched language onto it,
 * and the "recreated" page silently kept the source-language text. This job
 * lives outside the component lifecycle, so it survives that unmount/remount.
 * (Plain "Create copy" never hit this: it runs from the source page, which is
 * not removed, so CreateCopy stays mounted.)
 *
 * `onProgress`/`onDone` are best-effort UI hooks — after the unmount they
 * update a dead instance's state, which is harmless; the canvas work and the
 * toast don't depend on them.
 */
export function finishCopyRecreate(opts: {
  correlationId: string;
  /** Fetches the per-language map for the FRESH clone's pages (by their key
   *  names — see `fetchCopyTranslations`); null for a keys copy. Runs after
   *  the clone exists, so it must not depend on the initiating view. */
  loadTranslations: ((pages: CopyPage[]) => Promise<Record<string, CopyTranslations>>) | null;
  /** `phase` names what the run is doing (see `copyPhaseLabel`). */
  onProgress?: (current: number, total: number, phase: string) => void;
  onDone?: (result: { ok: boolean; error?: string; skipped?: number }) => void;
  /** Phase timer started by the initiating view; this job closes the phases
   *  it runs and logs the one-line summary when the run succeeds. */
  perf?: PhaseTimer;
  /** Perf summary label and success toast — "Update changed frames" reuses
   *  this whole continuation with its own wording. */
  summaryLabel?: string;
  doneText?: string;
  /** Sample values read off the copy being replaced (`sampleValuesByKey`). */
  samples?: Map<string, SampleValues>;
}): void {
  inFlightRecreate = opts.correlationId;
  // The job is "in flight" until it SETTLES — not merely until the clone
  // result arrives. The render/apply continuation below is still writing the
  // fresh page then; un-marking early let a second Recreate start and delete
  // the page the first one was midway through writing.
  const settle = (result: { ok: boolean; error?: string; skipped?: number }): void => {
    // Only clear if this job is still the current one — a later recreate that
    // somehow started must not be un-marked by an older job settling.
    if (inFlightRecreate === opts.correlationId) inFlightRecreate = null;
    opts.onDone?.(result);
  };
  const cleanup = (): void => {
    offResult();
    offProgress();
    watchdog.clear();
  };
  // Idle timeout, not wall-clock: create-copy-progress pings keep resetting it,
  // so only a genuinely silent recreate trips it (same shape as the apply
  // watchdogs above).
  const watchdog = createIdleTimeout(RECREATE_IDLE_TIMEOUT_MS, () => {
    cleanup();
    settle({ ok: false, error: "Timed out waiting for the copy to be recreated." });
  });
  const offProgress = on("create-copy-progress", (msg) => {
    if (msg.correlationId !== opts.correlationId) return;
    watchdog.touch();
    opts.onProgress?.(msg.current, msg.total, msg.phase);
  });
  const offResult = on("create-copy-result", (msg) => {
    if (msg.correlationId !== opts.correlationId) return;
    cleanup();
    opts.perf?.mark("clone + scan (main thread)");
    void (async () => {
      if (!msg.ok) {
        settle({ ok: false, error: msg.error ?? "Failed to recreate the copy." });
        return;
      }
      const pages = msg.pages ?? [];
      let skipped = 0;
      if (pages.length > 0 && opts.loadTranslations) {
        // Bounded: this is the one network step with no progress pings to feed
        // an idle watchdog — hung silently, the job (and its in-flight mark)
        // would otherwise never settle.
        opts.onProgress?.(0, 0, "top-up");
        const translations = await withTimeout(
          opts.loadTranslations(pages),
          COPY_FETCH_TIMEOUT_MS,
          "Timed out loading translations from Tolgee." +
            " The recreated copy keeps the source text — use Download on it.",
        );
        opts.perf?.mark("top-up fetch");
        const applied = await applyCopyPages(
          withCarriedSamples(pages, opts.samples),
          translations,
          (done, total) => opts.onProgress?.(done, total, "writing"),
        );
        if (!applied.ok) {
          settle({ ok: false, error: applied.error ?? "Failed to recreate the copy." });
          return;
        }
        skipped = applied.skipped;
        opts.perf?.mark("write texts", `${skipped} skipped`);
      }
      if (opts.perf) console.log(opts.perf.summary(opts.summaryLabel ?? "recreate"));
      send({ type: "notify", text: `${opts.doneText ?? "Copy recreated."}${copySkippedSuffix(skipped)}` });
      settle({ ok: true, skipped });
    })().catch((err: unknown) => {
      // Fire-and-forget, so a throw in here would otherwise surface only as an
      // unhandled rejection — leaving the view stuck on its "recreating" state
      // with no message (and the job marked in flight forever).
      console.error("[tolgee:ui] copy recreate failed", err);
      settle({
        ok: false,
        error: err instanceof Error ? err.message : "Failed to recreate the copy.",
      });
    });
  });
}
