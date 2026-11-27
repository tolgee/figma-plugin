import type { MainToUi, UiToMain } from "$shared/messages";
import type { NodeInfo } from "$shared/types";
import { afterEach, describe, expect, it, vi } from "vitest";

// Module-level bus mock: handlers registered via `on` are triggerable from the
// test through `emit`, mimicking main→UI messages. Crucially there is NO
// component lifecycle here — exactly the property finishCopyRecreate needs
// (CopyView unmounts mid-recreate; the job must keep working regardless).
const sent: UiToMain[] = [];
type Handler = (msg: MainToUi) => void;
const handlers = new Map<string, Set<Handler>>();
let correlationCounter = 0;

vi.mock("$ui/lib/bus", () => ({
  send: (msg: UiToMain) => {
    sent.push(msg);
  },
  nextCorrelationId: () => `apply-${++correlationCounter}`,
  on: (type: string, handler: Handler) => {
    let set = handlers.get(type);
    if (!set) {
      set = new Set();
      handlers.set(type, set);
    }
    set.add(handler);
    return () => set?.delete(handler);
  },
}));

import { nsKeyIndex } from "$ui/lib/logic/namespaces";
import {
  COPY_FETCH_TIMEOUT_MS,
  type CopyTranslations,
  finishCopyRecreate,
  isCopyRecreateInFlight,
  sampleValuesByKey,
} from "$ui/lib/logic/copyApply";

function emit(type: string, msg: Record<string, unknown>): void {
  for (const h of [...(handlers.get(type) ?? [])]) h({ type, ...msg } as MainToUi);
}

/** Let the job's queued async work (the post-result apply chain) run. */
async function flushAsync(): Promise<void> {
  for (let i = 0; i < 10; i++) await Promise.resolve();
}

function makeNode(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: overrides.id ?? "n1",
    name: "Node",
    characters: overrides.characters ?? "Hello",
    translation: overrides.translation ?? "",
    isPlural: false,
    key: overrides.key ?? "greeting",
    ns: overrides.ns,
    connected: overrides.connected ?? true,
  };
}

afterEach(() => {
  sent.length = 0;
  handlers.clear();
});

describe("finishCopyRecreate — survives the initiating view unmounting", () => {
  it("applies the fetched language onto the clone and toasts, with no component alive", async () => {
    const translations: Record<string, CopyTranslations> = {
      cs: { [nsKeyIndex(undefined, "greeting")]: { text: "Ahoj", isPlural: false } },
    };
    const done = vi.fn();
    finishCopyRecreate({ correlationId: "rc1", loadTranslations: async () => translations, onDone: done });

    // The result arrives AFTER CopyView would have unmounted (page switch) —
    // nothing here but the module job is listening.
    emit("create-copy-result", {
      correlationId: "rc1",
      ok: true,
      pages: [{ pageId: "p2", language: "cs", nodes: [makeNode()] }],
    });
    await flushAsync();

    // The job rendered + sent the apply batch for the clone's node…
    const apply = sent.find((m) => m.type === "apply-translations") as Extract<
      UiToMain,
      { type: "apply-translations" }
    >;
    expect(apply).toBeDefined();
    expect(apply.updates).toEqual([
      { id: "n1", text: "Ahoj", translation: "Ahoj", isPlural: false },
    ]);

    // …and once the write confirms, it toasts and reports success.
    emit("apply-translations-result", { correlationId: apply.correlationId, ok: true, errors: [] });
    await flushAsync();
    expect(sent.some((m) => m.type === "notify" && m.text === "Copy recreated.")).toBe(true);
    expect(done).toHaveBeenCalledWith({ ok: true, skipped: 0 });
  });

  it("keeps the sample values the OLD copy had (not the source's) on the recreated page", async () => {
    const translations: Record<string, CopyTranslations> = {
      en: { [nsKeyIndex(undefined, "hello")]: { text: "Hello, {name}", isPlural: false } },
    };
    finishCopyRecreate({
      correlationId: "rc-samples",
      loadTranslations: async () => translations,
      samples: sampleValuesByKey([{ key: "hello", paramsValues: { name: "John" } }]),
    });
    emit("create-copy-result", {
      correlationId: "rc-samples",
      ok: true,
      pages: [
        {
          pageId: "p2",
          language: "en",
          // The clone carries the SOURCE page's value.
          nodes: [{ ...makeNode({ key: "hello" }), paramsValues: { name: "Zuzko" } }],
        },
      ],
    });
    await flushAsync();

    const apply = sent.find((m) => m.type === "apply-translations") as Extract<
      UiToMain,
      { type: "apply-translations" }
    >;
    expect(apply.updates[0]?.text).toBe("Hello, John");
    expect(apply.updates[0]?.paramsValues).toEqual({ name: "John" });
  });

  it("a keys copy (null translations) skips the apply and still completes", async () => {
    const done = vi.fn();
    finishCopyRecreate({ correlationId: "rc2", loadTranslations: null, onDone: done });
    emit("create-copy-result", {
      correlationId: "rc2",
      ok: true,
      pages: [{ pageId: "p2", language: "", nodes: [makeNode()] }],
    });
    await flushAsync();
    expect(sent.some((m) => m.type === "apply-translations")).toBe(false);
    expect(sent.some((m) => m.type === "notify" && m.text === "Copy recreated.")).toBe(true);
    expect(done).toHaveBeenCalledWith({ ok: true, skipped: 0 });
  });

  it("surfaces a failed clone through onDone", async () => {
    const done = vi.fn();
    finishCopyRecreate({ correlationId: "rc3", loadTranslations: null, onDone: done });
    emit("create-copy-result", { correlationId: "rc3", ok: false, error: "boom" });
    await flushAsync();
    expect(done).toHaveBeenCalledWith({ ok: false, error: "boom" });
    expect(sent.some((m) => m.type === "notify")).toBe(false);
  });

  it("ignores results for other correlation ids", async () => {
    const done = vi.fn();
    finishCopyRecreate({ correlationId: "rc4", loadTranslations: null, onDone: done });
    emit("create-copy-result", { correlationId: "other", ok: true, pages: [] });
    await flushAsync();
    expect(done).not.toHaveBeenCalled();
    // Complete it properly so the job's watchdog is cleaned up.
    emit("create-copy-result", { correlationId: "rc4", ok: true, pages: [] });
    await flushAsync();
    expect(done).toHaveBeenCalledWith({ ok: true, skipped: 0 });
  });
});

describe("recreate re-entrancy", () => {
  it("reports itself in flight until the job SETTLES, not merely until the clone result arrives", async () => {
    // The guard has to live here, not in the view: recreating unmounts
    // CopyView, so a second click lands on a fresh instance whose own state
    // says "idle" — and a second run deletes the page the first is writing.
    expect(isCopyRecreateInFlight()).toBe(false);

    finishCopyRecreate({ correlationId: "r-1", loadTranslations: null });
    expect(isCopyRecreateInFlight()).toBe(true);

    emit("create-copy-result", { correlationId: "r-1", ok: true, pages: [] });
    await flushAsync();
    expect(isCopyRecreateInFlight()).toBe(false);
  });

  it("stays in flight while the fresh clone is still being written — un-marking early let a second Recreate delete it mid-write", async () => {
    const translations: Record<string, CopyTranslations> = {
      cs: { [nsKeyIndex(undefined, "greeting")]: { text: "Ahoj", isPlural: false } },
    };
    finishCopyRecreate({ correlationId: "r-write", loadTranslations: async () => translations });
    emit("create-copy-result", {
      correlationId: "r-write",
      ok: true,
      pages: [{ pageId: "p2", language: "cs", nodes: [makeNode()] }],
    });
    await flushAsync();

    // The clone result arrived, the apply batch is out — but not confirmed yet.
    const apply = sent.find((m) => m.type === "apply-translations") as Extract<
      UiToMain,
      { type: "apply-translations" }
    >;
    expect(apply).toBeDefined();
    expect(isCopyRecreateInFlight()).toBe(true);

    emit("apply-translations-result", { correlationId: apply.correlationId, ok: true, errors: [] });
    await flushAsync();
    expect(isCopyRecreateInFlight()).toBe(false);
  });

  it("clears the flag when the job fails", async () => {
    finishCopyRecreate({ correlationId: "r-2", loadTranslations: null });

    emit("create-copy-result", { correlationId: "r-2", ok: false, error: "nope" });
    await flushAsync();

    expect(isCopyRecreateInFlight()).toBe(false);
  });

  it("an older job settling does not clear a newer one's flag", async () => {
    finishCopyRecreate({ correlationId: "r-3", loadTranslations: null });
    finishCopyRecreate({ correlationId: "r-4", loadTranslations: null });

    // r-3 answers late; r-4 is the current job and must stay marked.
    emit("create-copy-result", { correlationId: "r-3", ok: true, pages: [] });
    await flushAsync();

    expect(isCopyRecreateInFlight()).toBe(true);

    emit("create-copy-result", { correlationId: "r-4", ok: true, pages: [] });
    await flushAsync();
    expect(isCopyRecreateInFlight()).toBe(false);
  });

  it("a silently hung translations load settles the job as a timeout instead of blocking recreate forever", async () => {
    vi.useFakeTimers();
    try {
      const done = vi.fn();
      finishCopyRecreate({
        correlationId: "r-hang",
        // Never settles — e.g. a dropped connection with no error event.
        loadTranslations: () => new Promise(() => {}),
        onDone: done,
      });
      emit("create-copy-result", {
        correlationId: "r-hang",
        ok: true,
        pages: [{ pageId: "p2", language: "cs", nodes: [makeNode()] }],
      });
      await vi.advanceTimersByTimeAsync(COPY_FETCH_TIMEOUT_MS + 1);

      expect(done).toHaveBeenCalledWith({
        ok: false,
        error: expect.stringContaining("Timed out loading translations"),
      });
      expect(isCopyRecreateInFlight()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
