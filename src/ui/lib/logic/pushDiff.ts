import type { NodeInfo } from "$shared/types";
import IntlMessageFormat from "intl-messageformat";
import { isAdvancedString } from "./manualChange";
// Local mini-implementation of `getTolgeeFormat` from `@tginternal/editor`.
// The upstream package transitively pulls in `@codemirror/{state,view}`
// (~500 kB raw / ~125 kB gzip) — see `$shared/tolgeeFormat.ts` for the rationale.
import { getTolgeeFormat, tolgeeFormatGenerateIcu } from "$shared/tolgeeFormat";
import { nsKeyIndex } from "$ui/lib/logic/namespaces";

/**
 * Subset of `KeyWithTranslationsModel` we depend on for diffing. Kept narrow
 * so callers can build it from any shape (search results, paged translations
 * response, cached map, ...) without coupling to the generated schema.
 */
export type RemoteTranslation = {
  /** Translation text as stored in Tolgee (may be ICU / plural source). */
  translation: string | undefined;
  /** Whether the key is marked as plural on the server. */
  keyIsPlural: boolean;
  /** Tag names attached to the key on the server. */
  keyTags: string[];
};

/**
 * Map of `namespace -> keyName -> remote translation`. The empty string is
 * used as the namespace lookup key for the default namespace.
 */
export type RemoteTranslationMap = Record<string, Record<string, RemoteTranslation>>;

export type PushDiffOptions = {
  /** Whether the project has namespaces feature enabled. */
  hasNamespacesEnabled: boolean;
  /** Tags configured by the user — used to flag key as "changed" when missing. */
  configuredTags?: string[];
};

/**
 * WHY a key counts as changed. Reported so the UI can say so: a key changed
 * only by tags or by the plural flag renders as a text diff whose two halves
 * are IDENTICAL, which reads as a bug. That ambiguity is not hypothetical —
 * it was reported as "push always shows changes" with the cause guessed wrong,
 * and cost a round of manual testing to tell correct behaviour from a defect.
 */
export type ChangeReason = "text" | "plural" | "tags";

export type ChangedKey = {
  node: NodeInfo;
  /** Existing translation text in Tolgee. */
  remoteText: string;
  /** What made this key changed — see `ChangeReason`. */
  reason: ChangeReason;
};

export type ConflictingNodes = {
  key: string;
  /** Undefined when namespaces are disabled or the key sits in default ns. */
  ns?: string;
  /** All Figma nodes that share the same `(key, ns)` pair. */
  nodes: NodeInfo[];
};

export type PushDiff = {
  newKeys: NodeInfo[];
  changedKeys: ChangedKey[];
  unchangedKeys: NodeInfo[];
  /**
   * Connected keys that no longer exist in Tolgee (deleted on the platform).
   * Deliberately NOT pushed — silently re-creating a key the user removed is
   * surprising; they should reconnect or delete the layer instead.
   */
  missingKeys: NodeInfo[];
  /**
   * Groups of Figma nodes that share `(key, ns)` but disagree on the
   * translation text — the deduplication picks the first one, so the user
   * should be warned.
   */
  conflictingNodes: ConflictingNodes[];
};

/**
 * Compute a diff between Figma `nodes` and the latest `remote` translations.
 *
 * Pure function — no API calls, no side effects. The caller is responsible for
 * collecting the remote map (typically via `GET /v2/projects/translations`)
 * and the screenshot map (handled separately during push).
 *
 * The function deduplicates Figma nodes that share a `(key, ns)` pair. When
 * the duplicates disagree on the displayed text, they are reported in
 * `conflictingNodes` so the UI can warn the user before pushing.
 */
export function pushDiff(
  nodes: NodeInfo[],
  remote: RemoteTranslationMap,
  options: PushDiffOptions,
): PushDiff {
  const { hasNamespacesEnabled, configuredTags } = options;

  // Group nodes by `(key, ns)` so we can detect duplicate-but-different
  // entries (a common source of confusion when several Figma layers reuse
  // the same Tolgee key but were translated inconsistently in Figma).
  const groups = new Map<string, NodeInfo[]>();
  for (const node of nodes) {
    if (!node.key) continue;
    const nsKey = hasNamespacesEnabled ? (node.ns ?? "") : "";
    const groupKey = nsKeyIndex(nsKey, node.key);
    let list = groups.get(groupKey);
    if (!list) {
      list = [];
      groups.set(groupKey, list);
    }
    list.push(node);
  }

  const newKeys: NodeInfo[] = [];
  const changedKeys: ChangedKey[] = [];
  const unchangedKeys: NodeInfo[] = [];
  const missingKeys: NodeInfo[] = [];
  const conflictingNodes: ConflictingNodes[] = [];

  for (const [, group] of groups) {
    const first = group[0];
    if (!first) continue;

    // Flag any group whose text differs across duplicates.
    if (group.length > 1) {
      const firstText = conflictText(first);
      const hasMismatch = group.some((n) => conflictText(n) !== firstText);
      if (hasMismatch) {
        conflictingNodes.push({
          key: first.key,
          ns: hasNamespacesEnabled ? first.ns : undefined,
          nodes: group.slice(),
        });
      }
    }

    // PLURALS ONLY: when several layers hold one plural key, each may carry a
    // different FORM (`one {# apple}` vs `other {# apples}`) because it was
    // pluralized from its own sample. Assemble every form into ONE complete ICU
    // so the push sends the whole plural, not just the first layer's partial
    // one. Gated hard on the WHOLE group being plural, so plain / param / markup
    // groups are untouched. The representative keeps `first`'s id — only its
    // `translation` changes — so id-keyed bookkeeping (screenshots, unchanged
    // set) is unaffected.
    let representative = first;
    if (group.length > 1 && group.every(isPluralLayer)) {
      const merged = mergePluralForms(group);
      if (merged) representative = { ...first, translation: merged };
    }

    const nsLookup = hasNamespacesEnabled ? (first.ns ?? "") : "";
    const remoteEntry = remote[nsLookup]?.[first.key];

    if (!remoteEntry) {
      // Absent remotely. If EVERY node on this key is connected, the key was
      // deleted on the platform → skip it (don't re-create). If any node is
      // unconnected, it's a genuinely new local key someone wants created, so
      // don't drop it just because a stale connected node shares the key.
      if (group.every((n) => n.connected)) missingKeys.push(representative);
      else newKeys.push(representative);
      continue;
    }

    const reason = changeReason(representative, remoteEntry, configuredTags);
    if (reason) {
      changedKeys.push({
        node: representative,
        remoteText: remoteEntry.translation ?? "",
        reason,
      });
    } else {
      unchangedKeys.push(representative);
    }
  }

  return { newKeys, changedKeys, unchangedKeys, missingKeys, conflictingNodes };
}

/**
 * Picks the text we consider authoritative for a Figma node, mirroring the
 * legacy heuristic in `getPushChanges.ts`:
 *
 *   - prefer the explicit Tolgee translation when present
 *   - otherwise fall back to the rendered `characters` value
 */
export function textOfNode(node: NodeInfo): string {
  // PLAIN strings: the live `characters` ARE the value, and they reflect direct
  // Figma-canvas edits that the stale stored `translation` would miss (so a
  // connected string edited in Figma is correctly detected as changed + the new
  // text is what gets pushed — matching the old plugin). ADVANCED strings: the
  // stored `translation` is the authoritative ICU code (`characters` is only its
  // rendered form, which must NOT be pushed as the value).
  return isAdvancedString(node)
    ? node.translation || node.characters || ""
    : node.characters || node.translation || "";
}

/**
 * Text used to decide whether two Figma layers that share one `(key, ns)`
 * genuinely CONFLICT (and so only one could upload).
 *
 * For ADVANCED strings (plural / params / markup) the authoritative value is the
 * shared Tolgee ICU in `translation` — the canvas `characters` is only a derived
 * render, so two forms of one plural ("1 woman" / "10 women") must NOT count as
 * a conflict. When the ICU is absent (e.g. not pulled yet) there is no
 * distinguishing value, so such layers simply don't conflict.
 *
 * PLAIN strings conflict on their canvas `characters` — two different Figma
 * texts mapped to one key ("brown 111" vs "brown") is a real conflict.
 *
 * Distinct from `textOfNode` (which keeps a `characters` fallback for detecting
 * plain canvas edits); this one deliberately does NOT fall back for advanced
 * strings. Shared by the Push diff and the Index warning banner so they agree.
 */
// A plural ICU, detected from the string itself (`{x, plural, …}`) — robust to a
// stale `isPlural` flag (see the plural render notes in interpolate.ts).
const PLURAL_ICU_RE = /,\s*plural\s*,/i;

export function conflictText(node: NodeInfo): string {
  // PLURAL: the forms (one / other / …) legitimately vary across layers of one
  // key, and pluralizing each layer independently can even yield DIFFERENT
  // partial ICUs ("1 apple" → `one {# apple}`, "2 apples" → `other {# apples}`).
  // They are still the SAME plural on the SAME key, so they must NEVER count as a
  // conflict — collapse every plural layer to one form-agnostic marker. (Was
  // comparing the full ICU, which wrongly flagged those partial-ICU variants.)
  if (node.isPlural || PLURAL_ICU_RE.test(node.translation ?? "")) {
    return "\0plural";
  }
  // Other ADVANCED (params / markup): the ICU is authoritative — two different
  // param strings on one key DO conflict; no `characters` fallback (a render is
  // derived). PLAIN: same as `textOfNode`.
  return isAdvancedString(node)
    ? (node.translation ?? "")
    : node.characters || node.translation || "";
}

/** A layer participating in a plural key — same detection `conflictText` uses. */
function isPluralLayer(node: NodeInfo): boolean {
  return node.isPlural || PLURAL_ICU_RE.test(node.translation ?? "");
}

/**
 * Ids of the same-key conflict LOSERS — every layer of a conflict group except
 * the first, which is the one that actually uploads/connects. Push excludes
 * these from BOTH connect-back and screenshot capture, so a layer that lost its
 * key isn't marked connected, nor boxed on that key's uploaded screenshot.
 */
export function droppedConflictNodeIds(diff: PushDiff): Set<string> {
  return new Set(diff.conflictingNodes.flatMap((g) => g.nodes.slice(1).map((n) => n.id)));
}

/**
 * Merge the plural FORMS of several layers on one key into a single complete
 * ICU. Each layer, pluralized from its own sample, may hold only the form its
 * count selects (`one {# apple}` / `other {# apples}`); this unions them so the
 * push carries every form instead of just the first layer's. The first NON-empty
 * body per category wins (so the empty `other {}` placeholder partial generation
 * appends never shadows a real `other`). Returns null when NO layer parses as a
 * plural — the caller only reaches it for all-plural groups, but this keeps it
 * inert for anything else.
 */
function mergePluralForms(nodes: NodeInfo[]): string | null {
  const variants: Record<string, string> = {};
  let parameter: string | undefined;
  for (const n of nodes) {
    const fmt = getTolgeeFormat(n.translation ?? "", true, false);
    if (fmt.parameter === undefined) continue; // not a parseable plural ICU
    parameter ??= fmt.parameter;
    for (const [category, body] of Object.entries(fmt.variants)) {
      if (body && variants[category] === undefined) variants[category] = body;
    }
  }
  if (parameter === undefined || Object.keys(variants).length === 0) return null;
  return tolgeeFormatGenerateIcu({ parameter, variants }, false);
}

/**
 * Why the Figma node differs from the remote translation in a way that
 * warrants a push — text (after ICU normalization), plural flag flipped, or a
 * configured `tagFiltered` tag missing. `null` when nothing differs.
 *
 * Returns the REASON rather than a boolean so the diff can be explained: the
 * two non-text reasons produce a row whose before and after are the same
 * string, and without a label there is no way to tell that from a broken diff.
 */
function changeReason(
  node: NodeInfo,
  remote: RemoteTranslation,
  configuredTags: string[] | undefined,
): ChangeReason | null {
  const text = textOfNode(node);
  const remoteText = remote.translation ?? "";

  // Use `getTolgeeFormat` so equivalent ICU representations (e.g. extra
  // whitespace inside an ICU placeholder) don't show up as fake diffs.
  let remoteNormalized: unknown;
  let localNormalized: unknown;
  try {
    remoteNormalized = getTolgeeFormat(remoteText, remote.keyIsPlural, false);
    localNormalized = getTolgeeFormat(text, node.isPlural, false);
  } catch {
    // If normalization throws (malformed ICU on either side) fall back to
    // a plain string compare — better to report a spurious change than to
    // silently drop a real one.
    remoteNormalized = remoteText;
    localNormalized = text;
  }

  if (JSON.stringify(remoteNormalized) !== JSON.stringify(localNormalized)) {
    // For plural keys, Tolgee normalises the ICU on its side and may extract
    // a shared suffix out of the plural variants. Both forms render to the
    // same output for every plural case, so a string-level mismatch isn't a
    // real change. Fall back to rendering each case and comparing — only
    // when both sides actually differ in the produced output we flag it.
    if ((node.isPlural || remote.keyIsPlural) && pluralRendersAreEqual(text, remoteText)) {
      // fall through to other checks (plural-flag, tags) below
    } else {
      return "text";
    }
  }

  if (remote.keyIsPlural !== node.isPlural) return "plural";

  if (configuredTags?.length) {
    const remoteTags = new Set(remote.keyTags);
    if (configuredTags.some((t) => !remoteTags.has(t))) {
      return "tags";
    }
  }

  return null;
}

/**
 * Convenience helper: turn a `KeysWithTranslationsPageModel` response into the
 * shape `pushDiff` consumes.
 *
 * Accepts a loose shape so it can be fed either the typed openapi response or
 * a plain object built in tests. Translation key is the requested language
 * tag (the API only ever returns one entry per key when a single language is
 * requested).
 */
// TODO: tighten when schema refined — this currently accepts the raw paged
// response shape and assumes a single language was requested.
export function buildRemoteMapFromKeys(
  keys:
    | Array<{
        keyName: string;
        keyNamespace?: string;
        keyIsPlural?: boolean;
        keyTags?: Array<{ name: string }>;
        translations?: Record<string, { text?: string } | undefined>;
      }>
    | undefined,
  language: string,
): RemoteTranslationMap {
  const out: RemoteTranslationMap = {};
  if (!keys) return out;
  for (const k of keys) {
    const ns = k.keyNamespace ?? "";
    if (!out[ns]) out[ns] = {};
    const bucket = out[ns];
    bucket[k.keyName] = {
      translation: k.translations?.[language]?.text,
      keyIsPlural: Boolean(k.keyIsPlural),
      keyTags: (k.keyTags ?? []).map((t) => t.name),
    };
  }
  return out;
}

/**
 * Render two ICU strings against a fixed set of plural-trigger values and
 * compare the outputs. Two ICU forms that produce the same rendered output
 * for every probed value are functionally identical even if their source
 * strings differ. Used to suppress spurious "changed" diffs when Tolgee
 * re-emits a plural with a different (but equivalent) ICU shape — most
 * commonly when Tolgee extracts a shared suffix out of every variant.
 *
 * Tries every parameter name the local string declares; if neither side
 * declares a name we fall back to the conventional `count`.
 */
function pluralRendersAreEqual(local: string, remote: string): boolean {
  if (local === remote) return true;
  const params = new Set<string>();
  extractParam(local, params);
  extractParam(remote, params);
  if (params.size === 0) params.add("count");

  const probes = [0, 1, 2, 5, 11, 100];
  try {
    for (const param of params) {
      const lhs = new IntlMessageFormat(local, "en");
      const rhs = new IntlMessageFormat(remote, "en");
      for (const n of probes) {
        if (lhs.format({ [param]: n }) !== rhs.format({ [param]: n })) {
          return false;
        }
      }
    }
    return true;
  } catch {
    // Malformed ICU on either side — let the normal string compare decide.
    return false;
  }
}

/**
 * Extract the plural parameter name from an ICU source. Looks for the first
 * `{name, plural, ...}` occurrence at any nesting level.
 */
function extractParam(input: string, out: Set<string>): void {
  const re = /\{\s*([A-Za-z_][\w]*)\s*,\s*plural\s*,/g;
  let match = re.exec(input);
  while (match !== null) {
    if (match[1]) out.add(match[1]);
    match = re.exec(input);
  }
}
