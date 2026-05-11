import { TOLGEE_ANNOTATION_CATEGORY_KEY } from "$shared/constants";

const TOLGEE_CATEGORY_LABEL = "Tolgee";
/**
 * AnnotationCategoryColor in `@figma/plugin-typings` is a lowercase string
 * union (`'yellow' | 'orange' | ... | 'blue' | ...`). We intentionally keep the
 * value as a typed literal so a future typings change surfaces here.
 */
const TOLGEE_CATEGORY_COLOR = "blue" as const;

/**
 * Resolve the canonical "Tolgee" annotation category for this document.
 *
 * Order of preference:
 * 1. Re-use the cached id stored in document plugin data, if still valid.
 * 2. Match an existing category by label (covers older plugin sessions and
 *    sessions where the document was duplicated and the cache went stale).
 * 3. Create a fresh category and cache its id.
 */
export async function ensureTolgeeCategory(): Promise<string> {
  const cached = figma.root.getPluginData(TOLGEE_ANNOTATION_CATEGORY_KEY);
  if (cached) {
    const all = await figma.annotations.getAnnotationCategoriesAsync();
    if (all.some((c) => c.id === cached)) {
      return cached;
    }
  }

  const all = await figma.annotations.getAnnotationCategoriesAsync();
  const existing = all.find((c) => c.label === TOLGEE_CATEGORY_LABEL);
  if (existing) {
    figma.root.setPluginData(TOLGEE_ANNOTATION_CATEGORY_KEY, existing.id);
    return existing.id;
  }

  const created = await figma.annotations.addAnnotationCategoryAsync({
    label: TOLGEE_CATEGORY_LABEL,
    color: TOLGEE_CATEGORY_COLOR,
  });
  figma.root.setPluginData(TOLGEE_ANNOTATION_CATEGORY_KEY, created.id);
  return created.id;
}

/**
 * Forget the cached annotation-category id. The next `ensureTolgeeCategory`
 * call will rediscover or recreate it. Useful in tests / recovery flows.
 */
export function clearTolgeeCategoryCache(): void {
  figma.root.setPluginData(TOLGEE_ANNOTATION_CATEGORY_KEY, "");
}
