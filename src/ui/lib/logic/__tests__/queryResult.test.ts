import { describe, expect, it, vi } from "vitest";

import { settleQuery } from "$ui/lib/logic/queryResult";

describe("settleQuery", () => {
  it("wraps a resolved value as { ok: true }", async () => {
    const out = await settleQuery(async () => 42, { toMessage: () => "nope" });
    expect(out).toEqual({ ok: true, value: 42 });
  });

  it("converts a thrown error into { ok: false } with the mapped message", async () => {
    const out = await settleQuery(
      async () => {
        throw new Error("500");
      },
      { retries: 0, toMessage: (e) => `msg:${(e as Error).message}` },
    );
    expect(out).toEqual({ ok: false, error: "msg:500" });
  });

  it("never rejects — a failing run resolves rather than throwing", async () => {
    // Regression for finding 62: the whole point is that queryFn resolves so
    // the view can read the error off `.data` instead of a (broken) `.error`.
    await expect(
      settleQuery(
        async () => {
          throw new Error("network");
        },
        { retries: 0, toMessage: () => "handled" },
      ),
    ).resolves.toEqual({ ok: false, error: "handled" });
  });

  it("retries once by default, then reports the last failure", async () => {
    const run = vi.fn(async () => {
      throw new Error("boom");
    });
    const out = await settleQuery(run, { toMessage: () => "failed" });
    expect(run).toHaveBeenCalledTimes(2); // first attempt + one retry
    expect(out).toEqual({ ok: false, error: "failed" });
  });

  it("succeeds on the retry when the first attempt was a transient blip", async () => {
    let calls = 0;
    const out = await settleQuery(
      async () => {
        calls++;
        if (calls === 1) throw new Error("blip");
        return "recovered";
      },
      { toMessage: () => "failed" },
    );
    expect(calls).toBe(2);
    expect(out).toEqual({ ok: true, value: "recovered" });
  });

  it("re-throws (does NOT swallow) when the signal is aborted — a cancelled query must not cache an error", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      settleQuery(
        async () => {
          throw new Error("aborted fetch");
        },
        { signal: controller.signal, toMessage: () => "handled" },
      ),
    ).rejects.toThrow("aborted fetch");
  });

  it("does not retry once the signal aborts mid-flight", async () => {
    const controller = new AbortController();
    let calls = 0;
    await expect(
      settleQuery(
        async () => {
          calls++;
          controller.abort();
          throw new Error("late abort");
        },
        { signal: controller.signal, retries: 3, toMessage: () => "handled" },
      ),
    ).rejects.toThrow("late abort");
    expect(calls).toBe(1); // aborted → re-thrown immediately, no further attempts
  });
});
