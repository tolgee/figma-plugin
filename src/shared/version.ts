/**
 * Release info shown as the quiet version tag in the Settings action bar
 * (bottom-left, next to Cancel/Save).
 *
 * Policy: the number Figma Community shows for the release ("Version 41"),
 * so the footer matches the plugin page users compare it with. Figma assigns
 * it on publish (one up from the last one), so set it to the NEXT Community
 * version before publishing. `package.json`'s semver (2.1.0 for v41) is for
 * tooling only.
 * No release date on purpose (Zuzka, 2026-11-27): the tag links to the
 * Community page, which shows the real publish date — a hard-coded one went
 * stale whenever publishing slipped a day.
 * Kept as a plain constant (not the build date) so a rebuild without a version
 * change stays byte-identical, which the delivery sync relies on.
 */
export const APP_VERSION = "41";

/**
 * The plugin's Figma Community page. Derived from the manifest plugin id
 * (`scripts/build-manifest.mjs`). If the published slug differs, set the full
 * URL here.
 */
export const FIGMA_PLUGIN_URL = "https://www.figma.com/community/plugin/1212381421658754793";
