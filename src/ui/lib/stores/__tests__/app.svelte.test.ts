import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NodeInfo } from "$shared/types";

// The store only reaches the bus through the save queue's flush; stub it so a
// flushed edit in a test never tries to postMessage anywhere.
vi.mock("$ui/lib/bus", () => ({
  send: () => {},
  on: () => () => {},
  nextCorrelationId: () => "test-correlation",
}));

import { appState } from "$ui/lib/stores/app.svelte";
import { flushNodeSaves, queueNodeSave } from "$ui/lib/logic/saveQueue";

/**
 * `appState` is a module-level singleton (mirrors how the real app imports
 * it), so each test resets the one bit of state it exercises instead of
 * re-creating the store.
 */
beforeEach(() => {
  appState.clearWriteProgress();
  appState.setEditorType("figma");
  appState.navigate({ name: "index" });
});

describe("appState selection — key-prefill suggestions are overlaid, not written", () => {
  const raw: NodeInfo = {
    id: "s:1",
    name: "Layer",
    characters: "Sign in",
    key: "",
    ns: undefined,
    translation: "",
    isPlural: false,
    connected: false,
  };

  it("shows the suggested key with prefill on, keeps the raw node untouched, and lists it as pending", () => {
    appState.setConfig({ prefillKeyFormat: true, keyFormat: "{elementText}", namespace: "web" });
    appState.setSelection([raw], true);
    expect(appState.value.selectedNodes[0]).toMatchObject({ key: "Sign in", ns: "web" });
    expect(appState.value.rawSelectedNodes[0]).toBe(raw);
    expect(appState.value.pendingSuggestions.get("s:1")).toEqual({ key: "Sign in", ns: "web" });
  });

  it("once the suggestion is persisted (patched back from the main thread) it is no longer pending", () => {
    appState.setConfig({ prefillKeyFormat: true, keyFormat: "{elementText}" });
    appState.setSelection([raw], true);
    appState.patchNodes([{ ...raw, key: "Sign in", prefilledKey: "Sign in" }]);
    expect(appState.value.selectedNodes[0]?.key).toBe("Sign in");
    expect(appState.value.pendingSuggestions.size).toBe(0);
  });

  it("a flushed inline edit counts immediately: the typed key replaces the suggestion and is NOT pending", () => {
    // Push opened right after typing: `navigate()` flushes the queue, but the
    // main thread hasn't confirmed yet. Without the optimistic patch the raw
    // node still had key "" and Push would persist the SUGGESTION over the
    // typed key (and mark it auto).
    appState.setConfig({ prefillKeyFormat: true, keyFormat: "{elementText}" });
    appState.setSelection([raw], true);
    expect(appState.value.pendingSuggestions.has("s:1")).toBe(true);
    queueNodeSave("s:1", { key: "checkout.title", ns: "", connected: false });
    flushNodeSaves();
    expect(appState.value.rawSelectedNodes[0]?.key).toBe("checkout.title");
    expect(appState.value.selectedNodes[0]?.key).toBe("checkout.title");
    expect(appState.value.pendingSuggestions.size).toBe(0);
  });

  it("with prefill off the selection is exactly the raw snapshots", () => {
    appState.setConfig({ prefillKeyFormat: false, keyFormat: "{elementText}" });
    appState.setSelection([raw], true);
    expect(appState.value.selectedNodes[0]).toBe(raw);
    expect(appState.value.pendingSuggestions.size).toBe(0);
  });
});

describe("appState write progress (nodes-set-progress / nodes-set-result glue)", () => {
  it("starts out clear", () => {
    expect(appState.value.writeProgress).toBeNull();
  });

  it("setWriteProgress reflects an in-flight nodes-set-progress message", () => {
    appState.setWriteProgress(50, 250);
    expect(appState.value.writeProgress).toEqual({ done: 50, total: 250 });

    // Later progress messages for the same write just replace the value.
    appState.setWriteProgress(100, 250);
    expect(appState.value.writeProgress).toEqual({ done: 100, total: 250 });
  });

  it("clearWriteProgress resets to null once the matching nodes-set-result arrives", () => {
    appState.setWriteProgress(250, 250);
    expect(appState.value.writeProgress).not.toBeNull();

    appState.clearWriteProgress();
    expect(appState.value.writeProgress).toBeNull();
  });

  it("clearing when already null is a no-op (a small write with no progress messages still clears fine)", () => {
    expect(appState.value.writeProgress).toBeNull();
    appState.clearWriteProgress();
    expect(appState.value.writeProgress).toBeNull();
  });
});

describe("appState.navigate Dev-Mode gate (ROUTE_AVAILABILITY)", () => {
  const node: NodeInfo = {
    id: "1:1",
    name: "Layer",
    characters: "Hello",
    translation: "Hello",
    isPlural: false,
    key: "greeting",
    ns: undefined,
    connected: true,
  };

  it("silently refuses a design-only route in dev, keeping the current route", () => {
    appState.setEditorType("dev");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    appState.navigate({ name: "stringDetails", node });
    expect(appState.value.route).toEqual({ name: "index" });

    appState.navigate({ name: "createCopy" });
    expect(appState.value.route).toEqual({ name: "index" });

    appState.navigate({ name: "pull", lang: "en" });
    expect(appState.value.route).toEqual({ name: "index" });

    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });

  it("allows shared routes in dev (settings, push, connect, copyView)", () => {
    appState.setEditorType("dev");

    appState.navigate({ name: "settings" });
    expect(appState.value.route).toEqual({ name: "settings" });

    appState.navigate({ name: "push" });
    expect(appState.value.route).toEqual({ name: "push" });

    appState.navigate({ name: "connect", node });
    expect(appState.value.route.name).toBe("connect");

    appState.navigate({ name: "copyView" });
    expect(appState.value.route).toEqual({ name: "copyView" });
  });

  it("allows every route in the design editor", () => {
    appState.navigate({ name: "stringDetails", node });
    expect(appState.value.route.name).toBe("stringDetails");

    appState.navigate({ name: "createCopy" });
    expect(appState.value.route).toEqual({ name: "createCopy" });

    appState.navigate({ name: "pull", lang: "en" });
    expect(appState.value.route.name).toBe("pull");
  });
});
