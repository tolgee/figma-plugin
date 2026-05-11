import type { TolgeeConfig } from "$shared/types";

// TODO: Merge config from clientStorage (global), document pluginData, and
// current page pluginData. Page-level values should win, then document, then
// global. Returns a partial — caller must apply defaults.
export function readMergedConfig(): Partial<TolgeeConfig> {
  // TODO
  return {};
}

// TODO: Persist config by splitting fields across the right scope (global vs.
// document vs. page) using TOLGEE_PLUGIN_CONFIG_NAME as the key.
export function writeConfig(_config: Partial<TolgeeConfig>): void {
  // TODO
}
