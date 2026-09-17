import { afterEach, describe, expect, it, vi } from "vitest";

import { TOLGEE_NODE_INFO } from "$shared/constants";
import { clearPrefilledKeys } from "$main/nodes/clearPrefilled";

/** A TEXT-node stand-in whose pluginData is a live map, so a `setPluginData`
 *  from `clearPrefilledKeys` is observable via `getPluginData` afterward. */
function makeTextNode(id: string, info: Record<string, unknown> | null) {
  const store = new Map<string, string>();
  if (info) store.set(TOLGEE_NODE_INFO, JSON.stringify(info));
  return {
    id,
    type: "TEXT" as const,
    getPluginData: (key: string) => store.get(key) ?? "",
    setPluginData: (key: string, value: string) => {
      store.set(key, value);
    },
    /** Test helper (not part of the Figma API) — read back the parsed data. */
    _data: () => {
      const raw = store.get(TOLGEE_NODE_INFO);
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    },
  };
}

type FakeNode = ReturnType<typeof makeTextNode>;

/** Installs a fake `figma` whose pages return `nodes` from the pluginData-
 *  filtered `findAllWithCriteria` (the same filter the real code relies on). */
function installFigma(pages: FakeNode[][]): void {
  const figma = {
    root: {
      children: pages.map((nodes) => ({
        type: "PAGE" as const,
        loadAsync: async () => {},
        findAllWithCriteria: (_criteria: unknown) => nodes,
      })),
    },
  };
  (globalThis as unknown as { figma: unknown }).figma = figma;
}

afterEach(() => {
  (globalThis as unknown as { figma?: unknown }).figma = undefined;
  vi.restoreAllMocks();
});

describe("clearPrefilledKeys", () => {
  it("clears an UNTOUCHED auto key (key === prefilledKey), dropping the marker", () => {
    const node = makeTextNode("1:1", {
      key: "auto.generated",
      prefilledKey: "auto.generated",
      connected: false,
      translation: "Hello",
      ns: "web",
    });
    installFigma([[node]]);

    return clearPrefilledKeys().then((cleared) => {
      expect(cleared).toBe(1);
      // Key wiped, marker dropped, other fields untouched.
      expect(node._data()).toEqual({
        key: "",
        connected: false,
        translation: "Hello",
        ns: "web",
      });
    });
  });

  it("PRESERVES an edited key (key !== prefilledKey) — the reported bug", async () => {
    // Prefill generated "auto.generated", the user edited it to "my.custom.key".
    const node = makeTextNode("1:1", {
      key: "my.custom.key",
      prefilledKey: "auto.generated",
      connected: false,
    });
    installFigma([[node]]);

    const cleared = await clearPrefilledKeys();
    expect(cleared).toBe(0);
    expect(node._data()?.key).toBe("my.custom.key");
  });

  it("PRESERVES a manually-typed key that was never auto (no marker)", async () => {
    const node = makeTextNode("1:1", { key: "hand.typed", connected: false });
    installFigma([[node]]);

    const cleared = await clearPrefilledKeys();
    expect(cleared).toBe(0);
    expect(node._data()?.key).toBe("hand.typed");
  });

  it("never touches CONNECTED nodes, even if key === prefilledKey", async () => {
    const node = makeTextNode("1:1", {
      key: "linked",
      prefilledKey: "linked",
      connected: true,
    });
    installFigma([[node]]);

    const cleared = await clearPrefilledKeys();
    expect(cleared).toBe(0);
    expect(node._data()?.key).toBe("linked");
  });

  it("skips unconnected nodes that already have no key", async () => {
    const node = makeTextNode("1:1", { key: "", connected: false });
    installFigma([[node]]);

    expect(await clearPrefilledKeys()).toBe(0);
  });

  it("clears matching auto keys across every page, keeping edited and connected ones", async () => {
    const autoP1 = makeTextNode("1:1", { key: "a", prefilledKey: "a", connected: false });
    const editedP2 = makeTextNode("2:1", { key: "b.edited", prefilledKey: "b", connected: false });
    const autoP2 = makeTextNode("2:2", { key: "c", prefilledKey: "c", connected: false });
    const connectedP2 = makeTextNode("2:3", { key: "d", prefilledKey: "d", connected: true });
    installFigma([[autoP1], [editedP2, autoP2, connectedP2]]);

    const cleared = await clearPrefilledKeys();
    expect(cleared).toBe(2);
    expect(autoP1._data()?.key).toBe("");
    expect(autoP2._data()?.key).toBe("");
    expect(editedP2._data()?.key).toBe("b.edited"); // edited → kept
    expect(connectedP2._data()?.key).toBe("d"); // connected → kept
  });

  it("ignores nodes whose pluginData is unparseable, without throwing", async () => {
    const bad = makeTextNode("1:1", null);
    bad.setPluginData(TOLGEE_NODE_INFO, "{not json");
    const good = makeTextNode("1:2", { key: "x", prefilledKey: "x", connected: false });
    installFigma([[bad, good]]);

    const cleared = await clearPrefilledKeys();
    expect(cleared).toBe(1);
    expect(good._data()?.key).toBe("");
  });
});
