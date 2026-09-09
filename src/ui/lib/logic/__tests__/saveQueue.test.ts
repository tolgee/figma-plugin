import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UiToMain } from "$shared/messages";

const sent: UiToMain[] = [];

vi.mock("$ui/lib/bus", () => ({
  send: (msg: UiToMain) => {
    sent.push(msg);
  },
  nextCorrelationId: () => "test-correlation",
}));

import { cancelNodeSave, flushNodeSaves, queueNodeSave } from "$ui/lib/logic/saveQueue";

type SetNodesData = Extract<UiToMain, { type: "set-nodes-data" }>;

beforeEach(() => {
  vi.useFakeTimers();
  sent.length = 0;
});

afterEach(() => {
  // Drain anything a test left queued so cases stay independent.
  flushNodeSaves();
  sent.length = 0;
  vi.useRealTimers();
});

describe("queueNodeSave", () => {
  it("coalesces saves for many nodes into one message", () => {
    queueNodeSave("1:1", { key: "a", connected: false });
    queueNodeSave("1:2", { key: "b", connected: false });
    queueNodeSave("1:3", { key: "c", connected: false });

    expect(sent).toHaveLength(0);
    vi.advanceTimersByTime(300);

    expect(sent).toHaveLength(1);
    const msg = sent[0] as SetNodesData;
    expect(msg.type).toBe("set-nodes-data");
    expect(msg.nodes.map((n) => n.id)).toEqual(["1:1", "1:2", "1:3"]);
  });

  it("merges repeated saves for the same node, last value winning", () => {
    queueNodeSave("1:1", { key: "draft" });
    queueNodeSave("1:1", { key: "final", ns: "app" });
    vi.advanceTimersByTime(300);

    const msg = sent[0] as SetNodesData;
    expect(msg.nodes).toEqual([{ id: "1:1", info: { key: "final", ns: "app" } }]);
  });

  it("restarts the debounce on every enqueue", () => {
    queueNodeSave("1:1", { key: "a" });
    vi.advanceTimersByTime(200);
    queueNodeSave("1:2", { key: "b" });
    vi.advanceTimersByTime(200);
    expect(sent).toHaveLength(0);

    vi.advanceTimersByTime(100);
    expect(sent).toHaveLength(1);
    expect((sent[0] as SetNodesData).nodes).toHaveLength(2);
  });

  it("cancelNodeSave drops a queued intermediate edit", () => {
    queueNodeSave("1:1", { key: "typo" });
    cancelNodeSave("1:1");
    vi.advanceTimersByTime(300);

    expect(sent).toHaveLength(0);
  });

  it("cancelling one node keeps the others queued", () => {
    queueNodeSave("1:1", { key: "typo" });
    queueNodeSave("1:2", { key: "keep" });
    cancelNodeSave("1:1");
    vi.advanceTimersByTime(300);

    expect(sent).toHaveLength(1);
    expect((sent[0] as SetNodesData).nodes).toEqual([{ id: "1:2", info: { key: "keep" } }]);
  });

  it("flushNodeSaves sends immediately and empties the queue", () => {
    queueNodeSave("1:1", { key: "a" });
    flushNodeSaves();

    expect(sent).toHaveLength(1);
    vi.advanceTimersByTime(300);
    expect(sent).toHaveLength(1); // nothing left to fire
  });
});
