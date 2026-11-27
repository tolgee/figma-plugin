import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MainToUi, UiToMain } from "$shared/messages";

type Handler = (msg: MainToUi) => void;
const handlers = new Map<string, Set<Handler>>();
const sent: UiToMain[] = [];

function emit(msg: MainToUi): void {
  for (const h of [...(handlers.get(msg.type) ?? [])]) h(msg);
}

vi.mock("$ui/lib/bus", () => ({
  send: (msg: UiToMain) => {
    sent.push(msg);
  },
  nextCorrelationId: () => "persist-1",
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

import { persistSuggestedKeys } from "$ui/lib/logic/persistSuggestions";

beforeEach(() => {
  vi.useFakeTimers();
  handlers.clear();
  sent.length = 0;
});
afterEach(() => {
  vi.useRealTimers();
});

const pending = new Map([
  ["1:1", { key: "Sign in", ns: "web" }],
  ["1:2", { key: "Cancel", ns: "" }],
  ["1:3", { key: "Other", ns: "" }],
]);

describe("persistSuggestedKeys", () => {
  it("writes ONLY the asked ids as one batched set-nodes-data with the auto marker, and resolves on the result", async () => {
    const promise = persistSuggestedKeys(pending, ["1:1", "1:2", "not-pending"]);
    const msg = sent[0] as Extract<UiToMain, { type: "set-nodes-data" }>;
    expect(msg.type).toBe("set-nodes-data");
    expect(msg.nodes).toEqual([
      { id: "1:1", info: { key: "Sign in", ns: "web", connected: false, prefilledKey: "Sign in" } },
      { id: "1:2", info: { key: "Cancel", ns: "", connected: false, prefilledKey: "Cancel" } },
    ]);
    emit({ type: "nodes-set-result", correlationId: "persist-1", ok: true, nodes: [] });
    await expect(promise).resolves.toEqual({ ok: true, count: 2 });
  });

  it("sends nothing and resolves immediately when none of the ids is pending", async () => {
    await expect(persistSuggestedKeys(pending, ["zzz"])).resolves.toEqual({ ok: true, count: 0 });
    expect(sent).toHaveLength(0);
  });

  it("reports a failed write as ok: false instead of throwing", async () => {
    const promise = persistSuggestedKeys(pending, ["1:3"]);
    emit({ type: "nodes-set-result", correlationId: "persist-1", ok: false, nodes: [] });
    await expect(promise).resolves.toEqual({ ok: false, count: 1 });
  });

  it("ignores results of other writes and gives up after 5 silent minutes", async () => {
    const promise = persistSuggestedKeys(pending, ["1:3"]);
    emit({ type: "nodes-set-result", correlationId: "someone-else", ok: true, nodes: [] });
    await vi.advanceTimersByTimeAsync(5 * 60_000);
    await expect(promise).resolves.toEqual({ ok: false, count: 1 });
  });
});
