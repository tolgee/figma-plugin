import type { GlobalSettings } from "./types";

/**
 * Context values used to substitute placeholders in a key-format template.
 *
 * Mirrors the placeholders defined in `constants.ts` /
 * `TOLGEE_KEY_FORMAT_PLACEHOLDERS`.
 */
export type KeyFormatContext = {
  artboard?: string;
  frame?: string;
  elementName?: string;
  elementText?: string;
  component?: string;
  section?: string;
  group?: string;
};

/**
 * Applies the requested casing transformation to a free-form string.
 *
 * Reference implementation: `src/utilities.ts#formatString`.
 *
 * TODO(phase-4): port full implementation including separator handling for
 * empty placeholder values (see `src/main/endpoints/preformatKey.ts`).
 */
export function applyCasing(input: string, casing: GlobalSettings["variableCasing"]): string {
  const str = input ?? "";
  switch (casing) {
    case "camelCase":
      return str
        .split(/\s+/)
        .filter(Boolean)
        .map((word, index) =>
          index > 0
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase(),
        )
        .join("");
    case "PascalCase":
      return str
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
    case "snake_case":
      return str
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.toLowerCase())
        .join("_");
    case "snake_case_capitalized":
      return str
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("_");
    case "noSpaces":
      return str.replace(/\s/g, "");
    default:
      // Default to snake_case while the full implementation is being ported.
      return str
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.toLowerCase())
        .join("_");
  }
}

/**
 * Formats a Tolgee key from a template string and a context object.
 *
 * Reference implementation: `src/main/endpoints/preformatKey.ts`.
 *
 * TODO(phase-4): port full implementation, including:
 *   - separator-aware placeholder removal when a value is empty
 *   - regex-escaped placeholder replacement
 *   - support for all placeholders defined in `TOLGEE_KEY_FORMAT_PLACEHOLDERS`
 */
export function formatKey(
  template: string,
  context: KeyFormatContext,
  casing: GlobalSettings["variableCasing"],
): string {
  // TODO(phase-4): replace this naive implementation with the full
  // placeholder-and-separator handling logic.
  let result = template;
  const replacements: Array<[string, string | undefined]> = [
    ["{artboard}", context.artboard],
    ["{frame}", context.frame],
    ["{elementName}", context.elementName],
    ["{elementText}", context.elementText],
    ["{component}", context.component],
    ["{section}", context.section],
    ["{group}", context.group],
  ];

  for (const [placeholder, raw] of replacements) {
    const value = applyCasing(raw ?? "", casing);
    result = result.split(placeholder).join(value);
  }

  return result;
}
