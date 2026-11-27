import type { KeySearchResult } from "$ui/lib/api/keys";
import { LINE_BREAK_TAG_REGEX } from "$shared/richText";

/**
 * Client-side relevance ranking for the Connect view's key search.
 *
 * Tolgee's `/v2/projects/keys/search` is a fuzzy trigram search whose ORDER is
 * unusable: it sorts by trigram DISTANCE descending (least similar first) and
 * every key without a namespace sorts ahead of all namespaced keys (a NULL
 * distance sum sorts first under DESC). With a short query in a large project
 * the exact string the designer is looking for can land last — or outside the
 * fetched page entirely. So the plugin searches its own copy of the project's
 * keys (`keyIndex.ts`) plus the fuzzy `searchKeys`, and decides the order itself.
 */

/** Relevance tiers, best first. */
export const TIER = {
  EXACT: 0,
  STARTS_WITH: 1,
  CONTAINS_PHRASE: 2,
  ALL_WORDS: 3,
  SOME_WORDS: 4,
  FUZZY: 5,
} as const;

/**
 * Fold a string for comparison: markup dropped (`<br>` counts as a space so
 * the words around it don't fuse), lower case, diacritics removed (`síní` ≡
 * `sini`, as Tolgee's own search treats it), whitespace collapsed.
 */
export function normalizeForSearch(s: string | undefined | null): string {
  return (s ?? "")
    .replace(LINE_BREAK_TAG_REGEX, " ")
    .replace(/<[^>]*>/g, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Distinct words of a normalised string — "síní síní" searches like "síní". */
function wordsOf(normalized: string): string[] {
  return [...new Set(normalized.split(" ").filter(Boolean))];
}

type Scored = { tier: number; wordHits: number; length: number; index: number };

/** A candidate text, normalised once and reused across searches. */
type Prepared = { t: string; words: Set<string> };
const preparedCache = new Map<string, Prepared>();
const PREPARED_CACHE_MAX = 100_000;

function prepare(text: string): Prepared {
  let p = preparedCache.get(text);
  if (!p) {
    const t = normalizeForSearch(text);
    p = { t, words: new Set(t.split(" ").filter(Boolean)) };
    if (preparedCache.size >= PREPARED_CACHE_MAX) preparedCache.clear();
    preparedCache.set(text, p);
  }
  return p;
}

function scoreCandidate(text: string, q: string, qWords: string[]): Omit<Scored, "index"> {
  const { t, words } = prepare(text);
  const length = t.length;
  if (!t) return { tier: TIER.FUZZY, wordHits: 0, length: Number.MAX_SAFE_INTEGER };
  if (t === q) return { tier: TIER.EXACT, wordHits: qWords.length, length };
  if (t.startsWith(q)) return { tier: TIER.STARTS_WITH, wordHits: qWords.length, length };
  if (t.includes(q)) return { tier: TIER.CONTAINS_PHRASE, wordHits: qWords.length, length };
  // Whole-word hits; only the LAST query word may also match as a prefix, so a
  // half-typed word ("fibril") still counts without scanning every word of
  // every text for every query word.
  let wordHits = 0;
  const last = qWords.length - 1;
  for (let i = 0; i <= last; i++) {
    const w = qWords[i] as string;
    if (words.has(w)) wordHits++;
    else if (i === last) {
      for (const tw of words) {
        if (tw.startsWith(w)) {
          wordHits++;
          break;
        }
      }
    }
  }
  if (qWords.length > 1 && wordHits === qWords.length) {
    return { tier: TIER.ALL_WORDS, wordHits, length };
  }
  if (wordHits > 0) return { tier: TIER.SOME_WORDS, wordHits, length };
  return { tier: TIER.FUZZY, wordHits: 0, length };
}

function better(a: Omit<Scored, "index">, b: Omit<Scored, "index">): boolean {
  if (a.tier !== b.tier) return a.tier < b.tier;
  if (a.wordHits !== b.wordHits) return a.wordHits > b.wordHits;
  return a.length < b.length;
}

/**
 * Score one result: the best of its translation, base translation and key
 * name (so typing a key name still finds the key first).
 */
export function scoreResult(r: KeySearchResult, query: string): Omit<Scored, "index"> {
  const q = normalizeForSearch(query);
  return scoreNormalized(r, q, wordsOf(q));
}

function scoreNormalized(r: KeySearchResult, q: string, qWords: string[]): Omit<Scored, "index"> {
  let best = scoreCandidate(r.translation ?? "", q, qWords);
  for (const text of [r.baseTranslation, r.name]) {
    const s = scoreCandidate(text ?? "", q, qWords);
    if (better(s, best)) best = s;
  }
  return best;
}

/** Is this result an exact match for the query (same rules as the ranking)? */
export function isExactResult(r: KeySearchResult, query: string): boolean {
  return normalizeForSearch(query) !== "" && scoreResult(r, query).tier === TIER.EXACT;
}

/**
 * Merge result lists (earlier lists win on duplicate key ids), then sort:
 * tier → the string's own namespace first (when `preferredNamespace` is given;
 * "" = no namespace) → more query words present → shorter text → original
 * order. The namespace only breaks ties WITHIN a tier: an exact match in
 * another namespace still beats a partial one in the string's own.
 */
export function rankKeySearch(
  lists: KeySearchResult[][],
  query: string,
  preferredNamespace?: string,
): KeySearchResult[] {
  const seen = new Set<number>();
  const merged: KeySearchResult[] = [];
  for (const list of lists) {
    for (const r of list) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      merged.push(r);
    }
  }
  const q = normalizeForSearch(query);
  if (!q) return merged;
  const otherNs = (r: KeySearchResult): number =>
    preferredNamespace === undefined || (r.namespace ?? "") === preferredNamespace ? 0 : 1;
  const qWords = wordsOf(q);
  const scored = merged.map((r, index) => ({
    r,
    s: { ...scoreNormalized(r, q, qWords), index, otherNs: otherNs(r) },
  }));
  scored.sort(
    (a, b) =>
      a.s.tier - b.s.tier ||
      a.s.otherNs - b.s.otherNs ||
      b.s.wordHits - a.s.wordHits ||
      a.s.length - b.s.length ||
      a.s.index - b.s.index,
  );
  return scored.map((x) => x.r);
}

/**
 * Canonical form for deciding that two FORMATTED strings are the same text —
 * stricter than `normalizeForSearch` (formatting and diacritics still count),
 * but tolerant of spelling differences that change nothing:
 * - every line-break spelling (`<br>`, `<br/>`, `<br />`, `<br></br>`, a real
 *   newline) is one break, and spaces around a break don't matter;
 * - tag names ignore case and attributes (`<B class="x">` ≡ `<b>`);
 * - runs of spaces / non-breaking spaces count as one; case is ignored.
 */
export function canonicalFormatted(s: string | undefined | null): string {
  return (s ?? "")
    .replace(LINE_BREAK_TAG_REGEX, "\n")
    .replace(/<\s*(\/?)\s*([a-z][\w-]*)[^>]*>/gi, (_, slash: string, name: string) =>
      `<${slash}${name.toLowerCase()}>`,
    )
    .replace(/[ \t ]*\r?\n[ \t ]*/g, "\n")
    .replace(/[ \t ]+/g, " ")
    .trim()
    .toLowerCase();
}

/** Same text for auto-connect purposes (see `canonicalFormatted`). */
export function sameFormattedText(a: string | undefined | null, b: string | undefined | null): boolean {
  const ca = canonicalFormatted(a);
  return ca !== "" && ca === canonicalFormatted(b);
}

/** At most this many local hits are kept (best first). */
export const LOCAL_SEARCH_LIMIT = 300;

/**
 * Search the locally loaded key index: every key whose text or name contains
 * the query, all its words, or at least half of them, optionally only in one
 * namespace, ranked like `rankKeySearch`. `total` counts all hits, so the UI
 * can tell the user to narrow a very common query down.
 */
export function searchKeyIndex(
  keys: readonly KeySearchResult[],
  query: string,
  opts: { namespace?: string; preferredNamespace?: string; limit?: number } = {},
): { results: KeySearchResult[]; total: number } {
  const q = normalizeForSearch(query);
  if (!q) return { results: [], total: 0 };
  const { namespace, preferredNamespace, limit = LOCAL_SEARCH_LIMIT } = opts;
  const qWords = wordsOf(q);
  // A partial match must share at least half of the query's words — with a
  // long query, "shares a word" alone would list nearly the whole project
  // ("a", "je", "the" are everywhere).
  const minWordHits = Math.max(1, Math.ceil(qWords.length / 2));
  const hits: KeySearchResult[] = [];
  for (const k of keys) {
    if (namespace !== undefined && (k.namespace ?? "") !== namespace) continue;
    const sc = scoreNormalized(k, q, qWords);
    if (sc.tier < TIER.SOME_WORDS || (sc.tier === TIER.SOME_WORDS && sc.wordHits >= minWordHits)) {
      hits.push(k);
    }
  }
  return {
    results: rankKeySearch([hits], query, preferredNamespace).slice(0, limit),
    total: hits.length,
  };
}

/**
 * Lookup table for auto-connect: canonical text (`canonicalFormatted`) → the
 * keys whose design-language text, base text or name has it. Built once per
 * run over the whole index, so each string is matched without a request.
 */
export function buildExactTextIndex(
  keys: readonly KeySearchResult[],
): Map<string, KeySearchResult[]> {
  const map = new Map<string, KeySearchResult[]>();
  for (const k of keys) {
    const seen = new Set<string>();
    for (const text of [k.translation, k.baseTranslation, k.name]) {
      const c = canonicalFormatted(text);
      if (!c || seen.has(c)) continue;
      seen.add(c);
      const list = map.get(c);
      if (list) list.push(k);
      else map.set(c, [k]);
    }
  }
  return map;
}
