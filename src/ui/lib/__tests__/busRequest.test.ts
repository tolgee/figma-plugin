import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createIdleTimeout } from "$ui/lib/busRequest";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createIdleTimeout", () => {
  it("does not fire before the timeout elapses", () => {
    const onTimeout = vi.fn();
    createIdleTimeout(1000, onTimeout);

    vi.advanceTimersByTime(999);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("fires after the timeout with no activity (the simple single-result case)", () => {
    const onTimeout = vi.fn();
    createIdleTimeout(1000, onTimeout);

    vi.advanceTimersByTime(1000);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("does not fire if clear() is called before the timeout (resolves normally)", () => {
    const onTimeout = vi.fn();
    const watchdog = createIdleTimeout(1000, onTimeout);

    vi.advanceTimersByTime(500);
    watchdog.clear();
    vi.advanceTimersByTime(10_000);

    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("resets the timer on touch() and does not fire while activity keeps arriving (streamed case)", () => {
    const onTimeout = vi.fn();
    const watchdog = createIdleTimeout(1000, onTimeout);

    // Simulate progress messages arriving every 700ms — each one resets the
    // idle window, so the cumulative elapsed time (2100ms) safely exceeds the
    // 1000ms timeout without ever firing, as long as no single gap does.
    vi.advanceTimersByTime(700);
    watchdog.touch();
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(700);
    watchdog.touch();
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(700);
    watchdog.touch();
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("fires if activity stops, even mid-stream", () => {
    const onTimeout = vi.fn();
    const watchdog = createIdleTimeout(1000, onTimeout);

    vi.advanceTimersByTime(700);
    watchdog.touch();
    expect(onTimeout).not.toHaveBeenCalled();

    // No further touch() — the stream went quiet. The idle window (armed at
    // the last touch) should now elapse and fire.
    vi.advanceTimersByTime(1000);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("fires onTimeout at most once even if the timer somehow ticks again", () => {
    const onTimeout = vi.fn();
    createIdleTimeout(1000, onTimeout);

    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(10_000);

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("ignores touch() calls after the timeout has already fired", () => {
    const onTimeout = vi.fn();
    const watchdog = createIdleTimeout(1000, onTimeout);

    vi.advanceTimersByTime(1000);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    // A late, stale message arriving after the watchdog gave up must not
    // resurrect it.
    watchdog.touch();
    vi.advanceTimersByTime(10_000);

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("ignores touch() calls after clear()", () => {
    const onTimeout = vi.fn();
    const watchdog = createIdleTimeout(1000, onTimeout);
    watchdog.clear();

    watchdog.touch();
    vi.advanceTimersByTime(10_000);

    expect(onTimeout).not.toHaveBeenCalled();
  });
});
