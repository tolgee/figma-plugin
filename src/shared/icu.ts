import IntlMessageFormat from "intl-messageformat";

export type IcuFormatResult = {
  result: string;
  error: Error | null;
};

/**
 * Formats an ICU message with the given parameters and locale.
 *
 * - When `params` is empty, returns the original `message` untouched.
 * - When parsing or formatting fails, returns the original `message` with
 *   `error` populated so callers can surface diagnostics without breaking
 *   the UI.
 */
export function formatIcuMessage(
  message: string,
  params: Record<string, string>,
  locale: string,
): IcuFormatResult {
  if (!params || Object.keys(params).length === 0) {
    return { result: message, error: null };
  }

  try {
    const formatter = new IntlMessageFormat(message, locale);
    const formatted = formatter.format(params);
    const result = typeof formatted === "string" ? formatted : String(formatted);
    return { result, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { result: message, error };
  }
}
