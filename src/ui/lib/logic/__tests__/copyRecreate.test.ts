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
  type CopyTranslations,
  finishCopyRecreate,
  isCopyRecreateInFlight,
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
    finishCopyRecreate({ correlationId: "rc1", translations, onDone: done });

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
    expect(done).toHaveBeenCalledWith({ ok: true });
  });

  it("a keys copy (null translations) skips the apply and still completes", async () => {
    const done = vi.fn();
    finishCopyRecreate({ correlationId: "rc2", translations: null, onDone: done });
    emit("create-copy-result", {
      correlationId: "rc2",
      ok: true,
      pages: [{ pageId: "p2", language: "", nodes: [makeNode()] }],
    });
    await flushAsync();
    expect(sent.some((m) => m.type === "apply-translations")).toBe(false);
    expect(sent.some((m) => m.type === "notify" && m.text === "Copy recreated.")).toBe(true);
    expect(done).toHaveBeenCalledWith({ ok: true });
  });

  it("surfaces a failed clone through onDone", async () => {
    const done = vi.fn();
    finishCopyRecreate({ correlationId: "rc3", translations: null, onDone: done });
    emit("create-copy-result", { correlationId: "rc3", ok: false, error: "boom" });
    await flushAsync();
    expect(done).toHaveBeenCalledWith({ ok: false, error: "boom" });
    expect(sent.some((m) => m.type === "notify")).toBe(false);
  });

  it("ignores results for other correlation ids", async () => {
    const done = vi.fn();
    finishCopyRecreate({ correlationId: "rc4", translations: null, onDone: done });
    emit("create-copy-result", { correlationId: "other", ok: true, pages: [] });
    await flushAsync();
    expect(done).not.toHaveBeenCalled();
    // Complete it properly so the job's watchdog is cleaned up.
    emit("create-copy-result", { correlationId: "rc4", ok: true, pages: [] });
    await flushAsync();
    expect(done).toHaveBeenCalledWith({ ok: true });
  });
});

describe("recreate re-entrancy", () => {
  it("reports itself in flight until the job settles", () => {
    // The guard has to live here, not in the view: recreating unmounts
    // CopyView, so a second click lands on a fresh instance whose own state
    // says "idle" — and a second run deletes the page the first is writing.
    expect(isCopyRecreateInFlight()).toBe(false);

    finishCopyRecreate({ correlationId: "r-1", translations: null });
    expect(isCopyRecreateInFlight()).toBe(true);

    emit("create-copy-result", { correlationId: "r-1", ok: true, pages: [] });
    expect(isCopyRecreateInFlight()).toBe(false);
  });

  it("clears the flag when the job fails", () => {
    finishCopyRecreate({ correlationId: "r-2", translations: null });

    emit("create-copy-result", { correlationId: "r-2", ok: false, error: "nope" });

    expect(isCopyRecreateInFlight()).toBe(false);
  });

  it("an older job settling does not clear a newer one's flag", () => {
    finishCopyRecreate({ correlationId: "r-3", translations: null });
    finishCopyRecreate({ correlationId: "r-4", translations: null });

    // r-3 answers late; r-4 is the current job and must stay marked.
    emit("create-copy-result", { correlationId: "r-3", ok: true, pages: [] });

    expect(isCopyRecreateInFlight()).toBe(true);

    emit("create-copy-result", { correlationId: "r-4", ok: true, pages: [] });
    expect(isCopyRecreateInFlight()).toBe(false);
  });
});
