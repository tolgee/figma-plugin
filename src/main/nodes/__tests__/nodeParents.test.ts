import { type MainComponentNameCache, resolveParentNames } from "$main/nodes/nodeParents";
import { describe, expect, it } from "vitest";

/**
 * Minimal live-node stand-in: only `type`, `name`, `id` and the `parent` link
 * are read by the ancestor walk. Built root→leaf so `parent` is set at creation.
 */
type FakeNode = {
  type: string;
  name: string;
  id: string;
  parent: FakeNode | null;
  getMainComponentAsync?: () => Promise<unknown>;
};

function n(type: string, name: string, parent: FakeNode | null = null): FakeNode {
  return { type, name, id: name, parent };
}

/** An INSTANCE whose `getMainComponentAsync` resolves to `main`. */
function inst(
  name: string,
  main: unknown,
  parent: FakeNode | null = null,
): FakeNode {
  return { type: "INSTANCE", name, id: name, parent, getMainComponentAsync: async () => main };
}

const resolve = (node: FakeNode, cache?: MainComponentNameCache) =>
  resolveParentNames(node as unknown as BaseNode, cache);

describe("resolveParentNames", () => {
  it("takes the nearest FRAME as `frame` and the topmost FRAME as `artboard`", async () => {
    const outer = n("FRAME", "Outer");
    const inner = n("FRAME", "Inner", outer);
    const text = n("TEXT", "t", inner);

    const r = await resolve(text);
    expect(r.frame).toBe("Inner");
    expect(r.artboard).toBe("Outer");
  });

  it("uses the same frame for both when there is only one", async () => {
    const frame = n("FRAME", "Only");
    const r = await resolve(n("TEXT", "t", frame));
    expect(r.frame).toBe("Only");
    expect(r.artboard).toBe("Only");
  });

  it("reads a real COMPONENT ancestor into `component`", async () => {
    const card = n("COMPONENT", "Card");
    const r = await resolve(n("TEXT", "t", card));
    expect(r.component).toBe("Card");
  });

  it("fills `instance` from the instance layer and `component` from its main", async () => {
    const instance = inst("card-1", { name: "Card" });
    const r = await resolve(n("TEXT", "t", instance));
    expect(r.instance).toBe("card-1");
    expect(r.component).toBe("Card");
  });

  it("uses the COMPONENT_SET name when the instance's main is a variant", async () => {
    const instance = inst("btn", {
      name: "State=Hover",
      parent: { type: "COMPONENT_SET", name: "Button" },
    });
    const r = await resolve(n("TEXT", "t", instance));
    expect(r.component).toBe("Button");
  });

  it("leaves `component` undefined when the instance has no main", async () => {
    const instance = inst("orphan", null);
    const r = await resolve(n("TEXT", "t", instance));
    expect(r.instance).toBe("orphan");
    expect(r.component).toBeUndefined();
  });

  it("prefers a nearer real COMPONENT over an outer instance's main", async () => {
    const instance = inst("inst", { name: "MainOfInstance" });
    const real = n("COMPONENT", "RealComponent", instance);
    const r = await resolve(n("TEXT", "t", real));
    expect(r.component).toBe("RealComponent"); // nearest COMPONENT wins
    expect(r.instance).toBe("inst"); // instance name still captured
  });

  it("captures SECTION and GROUP ancestors", async () => {
    const section = n("SECTION", "Hero");
    const group = n("GROUP", "Buttons", section);
    const r = await resolve(n("TEXT", "t", group));
    expect(r.section).toBe("Hero");
    expect(r.group).toBe("Buttons");
  });

  it("returns undefined placeholders when there are no relevant ancestors", async () => {
    const r = await resolve(n("TEXT", "t", null));
    expect(r).toEqual({
      frame: undefined,
      artboard: undefined,
    });
  });

  it("resolves each instance's main once per shared batch cache", async () => {
    let calls = 0;
    const instance: FakeNode = {
      type: "INSTANCE",
      name: "shared",
      id: "shared",
      parent: null,
      getMainComponentAsync: async () => {
        calls++;
        return { name: "Card" };
      },
    };
    const cache: MainComponentNameCache = new Map();
    const a = await resolve(n("TEXT", "a", instance), cache);
    const b = await resolve(n("TEXT", "b", instance), cache);

    expect(a.component).toBe("Card");
    expect(b.component).toBe("Card");
    expect(calls).toBe(1); // second lookup served from the batch cache
  });
});
