import type { NodeInfo } from "$shared/types";

/**
 * The `set-nodes-data` patch that unlinks a string from its Tolgee key.
 *
 * Clears not only the link (key / ns / connected) but also everything the link
 * brought with it — the stored ICU `translation`, the plural flag and the
 * sample values for Figma. Without that, a disconnected string kept counting
 * as ADVANCED (plural / params): editing its text in Figma raised the red
 * "edited in Figma" warning, and a later push sent the stale ICU instead of the
 * canvas text. After disconnecting, the canvas text is the only value, exactly
 * like a string that was never connected.
 *
 * Every field is a JSON-safe "empty" rather than `undefined`: the bus
 * round-trips messages through JSON, which drops `undefined`, and `setNodeInfo`
 * would then keep the old persisted value. `{}` / `""` for the samples are read
 * back as "no samples" everywhere (`isAdvancedString` checks for keys).
 *
 * Re-connecting fetches the translation from Tolgee again; only locally typed
 * sample values have to be re-entered.
 */
export function disconnectedInfo(): Partial<NodeInfo> {
  return {
    key: "",
    ns: "",
    connected: false,
    translation: "",
    isPlural: false,
    paramsValues: {},
    pluralParamValue: "",
  };
}
