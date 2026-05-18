export { ensureTolgeeCategory, clearTolgeeCategoryCache } from "./category";
export {
  applyAnnotations,
  removeAnnotations,
  syncCurrentPage,
  clearCurrentPage,
} from "./sync";
export { scheduleReconcile } from "./reconcile";

/**
 * Setting key used inside `tolgee_config`-flavoured persistence. Currently
 * exported only for downstream UI bindings that mirror this flag.
 */
export const ANNOTATIONS_ENABLED_KEY = "showCanvasAnnotations";

/**
 * clientStorage key for the toggle. Stored separately from `tolgee_config`
 * because (a) it's a pure per-user preference and (b) we can't extend the
 * shared `GlobalSettings` type from this allow-list.
 */
const CLIENT_STORAGE_KEY = "tolgee_annotations_enabled";

export async function isAnnotationsEnabled(): Promise<boolean> {
  const v = await figma.clientStorage.getAsync(CLIENT_STORAGE_KEY);
  return v === true;
}

export async function setAnnotationsEnabled(enabled: boolean): Promise<void> {
  await figma.clientStorage.setAsync(CLIENT_STORAGE_KEY, enabled);
}
