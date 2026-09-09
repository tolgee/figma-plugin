/**
 * Timeout watchdog for UI -> main round-trips over `bus.ts`.
 *
 * Every UI -> main request (`send()` + a correlated `on()` listener waiting
 * for the matching result) would otherwise wait forever. Main-thread error
 * handling covers the expected failures (the bus dispatch wraps handlers and
 * answers with `handler-error`; `applyTranslations`/`setNodesData` collect
 * per-node errors instead of throwing) — this is the safety net for the rest:
 * if a response is ever lost for a reason NOT covered by that handling (Figma
 * killing the sandboxed process, a future regression), the UI hangs on a
 * spinner with no recovery except force-quitting the plugin.
 *
 * (That claim about the bus was written before the wrapping existed — the
 * dispatch had no try/catch at all, which is exactly how a thrown handler
 * could strand a request with no trace.)
 *
 * This module is intentionally just the "give up after N seconds of
 * silence" timer. Call sites keep wiring their own `on()` listeners for the
 * message types they care about — the shapes differ too much (single result
 * vs. streamed progress + terminal message) to force through one generic
 * `request()` function. A shared timeout MECHANISM matters more than a
 * shared request SHAPE.
 */

export interface RequestWatchdog {
  /**
   * (Re)start the idle timer. Call once when the request is sent, and again
   * on every intermediate/progress message for streamed round-trips so a
   * slow-but-progressing operation isn't killed while it's still active.
   */
  touch(): void;
  /**
   * Stop the timer for good. Call as soon as the round-trip settles
   * (terminal message received, or the caller otherwise gives up) so the
   * timeout can never fire after the fact.
   */
  clear(): void;
}

/**
 * Starts an idle timeout that invokes `onTimeout` if `touch()` isn't called
 * again within `timeoutMs`. The timer starts armed immediately (equivalent to
 * an implicit `touch()` at request time) — callers don't need to call
 * `touch()` before the first wait.
 *
 * `onTimeout` fires at most once; after it fires (or after `clear()`) further
 * `touch()` calls are ignored to avoid resurrecting a settled/timed-out
 * request.
 */
export function createIdleTimeout(
  timeoutMs: number,
  onTimeout: () => void,
): RequestWatchdog {
  let handle: ReturnType<typeof setTimeout> | undefined;
  let settled = false;

  const arm = (): void => {
    if (settled) return;
    if (handle !== undefined) clearTimeout(handle);
    handle = setTimeout(() => {
      settled = true;
      handle = undefined;
      onTimeout();
    }, timeoutMs);
  };

  const clear = (): void => {
    settled = true;
    if (handle !== undefined) {
      clearTimeout(handle);
      handle = undefined;
    }
  };

  arm();
  return { touch: arm, clear };
}
