/**
 * The memory heads-up shown before a copy of a very large page is made.
 *
 * Figma keeps a per-file memory budget the plugin can't read; what it CAN
 * see is the page's size (text count — a proxy for layers) and how many
 * plugin-made copies of it the file already holds. On the customer-sized
 * test file (14k–36k texts/page) Figma ran out of memory only once the file
 * held THREE or more copies of the page (two others + the one being made or
 * recreated); one other copy always went through. So the note appears only
 * from two other copies up, and reads as a heads-up, not a warning — users
 * will (and may) make the copy anyway; the point is that they know what to
 * do if Figma does run low.
 *
 * A Recreate counts the copy being recreated among `existingCopies`, so it
 * is left out: recreating the only copy of a page never asks.
 */
/** Zuzka's call (2026-11-16): her 35k-text test page is the extreme; 3 000
 *  caught ordinary big designs too. 10 000 texts is "really big". */
export const LARGE_PAGE_TEXTS = 10000;
/** Layers are what Figma's memory actually counts (Manage memory: ~700k
 *  layers ≈ 100 % on the test file; one of its pages ≈ 120k). Either
 *  threshold makes the page "big" — texts catch dense UI, layers catch
 *  image/vector-heavy pages with few texts. */
export const LARGE_PAGE_LAYERS = 100000;
/** Other copies (beyond the one being made/recreated) from which to ask. */
export const OTHER_COPIES_TO_ASK = 2;

export type CopyGuardInput = {
  textCount: number;
  layerCount?: number;
  existingCopies: number;
  /** Names of those copies (any language — every one costs memory). */
  copyNames?: string[];
  recreate: boolean;
  /** The page being recreated, left out of the list it shows. */
  currentPageName?: string;
};

export function copyMemoryWarning(input: CopyGuardInput): string | null {
  const big = input.textCount >= LARGE_PAGE_TEXTS || (input.layerCount ?? 0) >= LARGE_PAGE_LAYERS;
  if (!big) return null;
  const otherCopies = input.recreate ? input.existingCopies - 1 : input.existingCopies;
  if (otherCopies < OTHER_COPIES_TO_ASK) return null;
  const texts = input.textCount.toLocaleString("en-US");
  const layers = (input.layerCount ?? 0).toLocaleString("en-US");
  const size = input.layerCount ? `${layers} layers, ${texts} texts` : `${texts} texts`;
  // Two short paragraphs (facts, then what to do) — rendered with
  // `whitespace-pre-line`, so the blank line is real. The copies are not
  // listed by name (Zuzka: it made the dialog long and scary).
  return `This page is big (${size}) and the file already has ${otherCopies} copies of it.\n\nKeep only the copies you need, so Figma doesn't run low on memory.`;
}
