import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MainToUi } from "$shared/messages";

type Handler = (msg: MainToUi) => void;

const handlers = new Map<string, Set<Handler>>();
const sent: unknown[] = [];

function emit(msg: MainToUi): void {
  const set = handlers.get(msg.type);
  if (!set) return;
  for (const handler of [...set]) handler(msg);
}

vi.mock("$ui/lib/bus", () => ({
  send: (msg: unknown) => {
    sent.push(msg);
  },
  nextCorrelationId: () => "test-correlation",
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

import { requestPageConnectedNodes } from "$ui/lib/api/pageNodes";

beforeEach(() => {
  vi.useFakeTimers();
  handlers.clear();
  sent.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("requestPageConnectedNodes", () => {
  it("resolves with the nodes from a matching page-connected-nodes-result", async () => {
    const promise = requestPageConnectedNodes();
    emit({
      type: "page-connected-nodes-result",
      correlationId: "test-correlation",
      nodes: [{ id: "1:1" } as never],
    });

    await expect(promise).resolves.toEqual([{ id: "1:1" }]);
  });

  it("calls onProgress and resets the idle watchdog on page-connected-nodes-progress", async () => {
    const onProgress = vi.fn();
    const promise = requestPageConnectedNodes(undefined, onProgress);

    // Progress arrives every 4 minutes — each one should reset the 5-minute
    // idle window, so the cumulative silence between messages never actually
    // reaches 5 minutes and the request never times out.
    for (let i = 1; i <= 3; i++) {
      await vi.advanceTimersByTimeAsync(4 * 60_000);
      emit({
        type: "page-connected-nodes-progress",
        correlationId: "test-correlation",
        done: i * 50,
        total: 250,
      });
    }

    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress.mock.calls).toEqual([
      [50, 250],
      [100, 250],
      [150, 250],
    ]);

    emit({
      type: "page-connected-nodes-result",
      correlationId: "test-correlation",
      nodes: [],
    });
    await expect(promise).resolves.toEqual([]);
  });

  it("times out after 5 minutes of silence even after earlier progress", async () => {
    const onProgress = vi.fn();
    const promise = requestPageConnectedNodes(undefined, onProgress);
    // Attach the rejection assertion NOW, before advancing timers — otherwise
    // the promise rejects before anything is listening for it and Node flags
    // an unhandled rejection even though the test itself would pass.
    const rejection = expect(promise).rejects.toThrow(
      "Timed out waiting for the page's connected nodes.",
    );

    await vi.advanceTimersByTimeAsync(4 * 60_000);
    emit({
      type: "page-connected-nodes-progress",
      correlationId: "test-correlation",
      done: 50,
      total: 250,
    });

    // No further activity — the idle window (reset at the last progress
    // message) should now fully elapse and reject the request.
    await vi.advanceTimersByTimeAsync(5 * 60_000);

    await rejection;
  });

  it("ignores progress/result messages for a different correlationId", async () => {
    const onProgress = vi.fn();
    const promise = requestPageConnectedNodes(undefined, onProgress);

    emit({
      type: "page-connected-nodes-progress",
      correlationId: "other-correlation",
      done: 10,
      total: 500,
    });
    expect(onProgress).not.toHaveBeenCalled();

    emit({
      type: "page-connected-nodes-result",
      correlationId: "test-correlation",
      nodes: [],
    });
    await expect(promise).resolves.toEqual([]);
  });
});
