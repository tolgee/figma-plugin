/**
 * Release info shown as the quiet version tag in the Settings action bar
 * (bottom-left, next to Cancel/Save).
 *
 * Policy: bump when we ship NEW functionality — not for pure bug-fix builds.
 * Kept as plain constants (not the build date) so a rebuild without a version
 * change stays byte-identical, which the delivery sync relies on. Keep
 * `package.json`'s `version` in step for tooling.
 */
export const APP_VERSION = "2.0.0";

/** ISO date of this release. */
export const APP_RELEASED = "2026-07-24";

/**
 * The plugin's Figma Community page. Derived from the manifest plugin id
 * (`scripts/build-manifest.mjs`). If the published slug differs, set the full
 * URL here.
 */
export const FIGMA_PLUGIN_URL = "https://www.figma.com/community/plugin/1212381421658754793";
