import IntlMessageFormat from "intl-messageformat";

export type IcuFormatResult = {
  result: string;
  error: Error | null;
};

// Constructing an `IntlMessageFormat` parses the ICU string and loads locale
// data — by far the costliest step here. The same (locale, message) pairs recur
// constantly (e.g. the Index list rebuilds its manual-change set on every
// selection re-emit, re-formatting unchanged advanced strings), so we memoize
// the parsed formatter. Bounded with simple FIFO eviction so a long-lived main
// thread can't grow it without limit.
const FORMATTER_CACHE_MAX = 500;
const formatterCache = new Map<string, IntlMessageFormat>();

function getFormatter(message: string, locale: string): IntlMessageFormat {
  const key = `${locale}\0${message}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;
  // `ignoreTag: true` keeps inline markup (`<b>`, `<i>`, …) as LITERAL text
  // instead of parsing it as a rich-text tag that would require a `b`/`i`/…
  // handler in the values (intl-messageformat throws "variable 'b' was not
  // provided" otherwise). We never pass tag handlers — the preview renders the
  // markup as HTML and the canvas writer re-applies it — so literals are exactly
  // what we want, and params still fill normally.
  const formatter = new IntlMessageFormat(message, locale, undefined, {
    ignoreTag: true,
  });
  if (formatterCache.size >= FORMATTER_CACHE_MAX) {
    const oldest = formatterCache.keys().next().value;
    if (oldest !== undefined) formatterCache.delete(oldest);
  }
  formatterCache.set(key, formatter);
  return formatter;
}

/**
 * Formats an ICU message with the given parameters and locale.
 *
 * - Plain text with no `'` (ICU escape marker) and no `{` (start of any
 *   placeholder/plural/tag) can't need unescaping or formatting, so it's
 *   returned untouched without invoking the parser — the common case, kept
 *   cheap. Any other message ALWAYS goes through the formatter, even with
 *   empty `params`: Tolgee itself emits ICU-escaped literals (`'{'`, `''`,
 *   …) for plain text containing braces/apostrophes, and skipping the
 *   parser for those wrote the escaped source straight to the canvas
 *   instead of the intended literal text (H10).
 * - When parsing or formatting fails (e.g. real placeholders left unfilled
 *   with empty `params`), returns the original `message` with `error`
 *   populated so callers can surface diagnostics without breaking the UI.
 */
export function formatIcuMessage(
  message: string,
  params: Record<string, string>,
  locale: string,
): IcuFormatResult {
  if (!message.includes("'") && !message.includes("{")) {
    return { result: message, error: null };
  }

  try {
    const formatter = getFormatter(message, locale);
    const formatted = formatter.format(params ?? {});
    const result = typeof formatted === "string" ? formatted : String(formatted);
    return { result, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { result: message, error };
  }
}
