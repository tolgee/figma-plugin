import type { KeySearchResult } from "$ui/lib/api/keys";

/**
 * Client-side relevance ranking for the Connect view's key search.
 *
 * Tolgee's `/v2/projects/keys/search` is a fuzzy trigram search whose ORDER is
 * unusable: it sorts by trigram DISTANCE descending (least similar first) and
 * every key without a namespace sorts ahead of all namespaced keys (a NULL
 * distance sum sorts first under DESC). With a short query in a large project
 * the exact string the designer is looking for can land last — or outside the
 * fetched page entirely. So the plugin fetches the candidates (see
 * `searchKeysByPhrase` + `searchKeys`) and decides the order itself.
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
    .replace(/<br\s*\/?>/gi, " ")
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

function scoreCandidate(text: string, q: string, qWords: string[]): Omit<Scored, "index"> {
  const t = normalizeForSearch(text);
  const length = t.length;
  if (!t) return { tier: TIER.FUZZY, wordHits: 0, length: Number.MAX_SAFE_INTEGER };
  if (t === q) return { tier: TIER.EXACT, wordHits: qWords.length, length };
  if (t.startsWith(q)) return { tier: TIER.STARTS_WITH, wordHits: qWords.length, length };
  if (t.includes(q)) return { tier: TIER.CONTAINS_PHRASE, wordHits: qWords.length, length };
  const tWords = new Set(t.split(" "));
  // A query word counts as present when some text word starts with it, so a
  // half-typed last word ("fibril") still counts.
  const wordHits = qWords.filter(
    (w) => tWords.has(w) || [...tWords].some((tw) => tw.startsWith(w)),
  ).length;
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
  const qWords = wordsOf(q);
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
 * tier → more query words present → shorter text → original order.
 */
export function rankKeySearch(lists: KeySearchResult[][], query: string): KeySearchResult[] {
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
  const scored = merged.map((r, index) => ({ r, s: { ...scoreResult(r, query), index } }));
  scored.sort(
    (a, b) =>
      a.s.tier - b.s.tier ||
      b.s.wordHits - a.s.wordHits ||
      a.s.length - b.s.length ||
      a.s.index - b.s.index,
  );
  return scored.map((x) => x.r);
}
