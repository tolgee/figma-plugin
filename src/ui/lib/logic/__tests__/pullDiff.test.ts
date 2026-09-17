import type { NodeInfo } from "$shared/types";
import type { PulledKey } from "$ui/lib/api/pull";
import {
  buildApplyUpdates,
  formatNodeText,
  pullDiff,
  skippedRenderMessage,
} from "$ui/lib/logic/pullDiff";
import { describe, expect, it } from "vitest";

function makeNode(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: overrides.id ?? "node-1",
    name: overrides.name ?? "Node",
    characters: overrides.characters ?? "",
    translation: overrides.translation ?? "",
    isPlural: overrides.isPlural ?? false,
    key: overrides.key ?? "",
    ns: overrides.ns,
    connected: overrides.connected ?? true,
    visible: overrides.visible,
    paramsValues: overrides.paramsValues,
    pluralParamValue: overrides.pluralParamValue,
  };
}

function makeRemoteKey(overrides: Partial<PulledKey> = {}): PulledKey {
  return {
    keyName: overrides.keyName ?? "",
    keyNamespace: overrides.keyNamespace,
    isPlural: overrides.isPlural ?? false,
    translations: overrides.translations ?? {},
  };
}

describe("pullDiff", () => {
  it("classifies a node as changed when remote text differs", () => {
    const node = makeNode({
      key: "greeting",
      translation: "Hello",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "greeting",
      translations: { en: { text: "Hi" } },
    });
    const diff = pullDiff([node], [remote], "en");

    expect(diff.changedNodes).toHaveLength(1);
    expect(diff.changedNodes[0]?.node).toBe(node);
    expect(diff.changedNodes[0]?.newText).toBe("Hi");
    expect(diff.changedNodes[0]?.isPlural).toBe(false);
    expect(diff.missingKeys).toEqual([]);
    expect(diff.unchangedNodes).toEqual([]);
  });

  it("classifies a node as missing when remote has no matching key", () => {
    const node = makeNode({
      key: "ghost",
      translation: "Hello",
      connected: true,
    });
    const diff = pullDiff([node], [], "en");

    expect(diff.missingKeys).toHaveLength(1);
    expect(diff.missingKeys[0]).toBe(node);
    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toEqual([]);
  });

  it("classifies a node as unchanged when remote text matches", () => {
    const node = makeNode({
      key: "greeting",
      translation: "Hello",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "greeting",
      translations: { en: { text: "Hello" } },
    });
    const diff = pullDiff([node], [remote], "en");

    expect(diff.unchangedNodes).toHaveLength(1);
    expect(diff.unchangedNodes[0]).toBe(node);
    expect(diff.changedNodes).toEqual([]);
    expect(diff.missingKeys).toEqual([]);
  });

  it("does NOT re-download a formatted string whose canvas is the tag-stripped render (Zuzka's perpetual '2 strings')", () => {
    // After a successful download, the canvas holds the PLAIN text ("Tučný
    // text" in a bold font) while `translation` holds the raw markup. The
    // drift check must compare against what apply would WRITE, not the raw
    // remote text — otherwise every formatted string re-downloads forever.
    const node = makeNode({
      key: "Advaced-BoldText",
      translation: "<b>Tučný text</b>",
      characters: "Tučný text",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "Advaced-BoldText",
      translations: { cs: { text: "<b>Tučný text</b>" } },
    });
    const diff = pullDiff([node], [remote], "cs");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toEqual([node]);
  });

  it("still re-applies a formatted string whose canvas GENUINELY drifted", () => {
    const node = makeNode({
      key: "Advaced-BoldText",
      translation: "<b>Tučný text</b>",
      characters: "někdo to přepsal",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "Advaced-BoldText",
      translations: { cs: { text: "<b>Tučný text</b>" } },
    });
    const diff = pullDiff([node], [remote], "cs");

    expect(diff.changedNodes).toHaveLength(1);
    expect(diff.changedNodes[0]?.newText).toBe("<b>Tučný text</b>");
  });

  it("treats <br> as the newline it becomes on canvas, not as drift", () => {
    const node = makeNode({
      key: "two-lines",
      translation: "první<br/>druhý",
      characters: "první\ndruhý",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "two-lines",
      translations: { cs: { text: "první<br/>druhý" } },
    });
    const diff = pullDiff([node], [remote], "cs");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toEqual([node]);
  });

  it("treats ICU quote-escaping ('' -> ') as rendered, not as drift", () => {
    const node = makeNode({
      key: "apostrophe",
      translation: "It''s done",
      characters: "It's done",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "apostrophe",
      translations: { en: { text: "It''s done" } },
    });
    const diff = pullDiff([node], [remote], "en");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toEqual([node]);
  });

  it("never flags drift when the remote ICU cannot be rendered", () => {
    const node = makeNode({
      key: "broken",
      translation: "{unclosed",
      characters: "whatever is on canvas",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "broken",
      translations: { en: { text: "{unclosed" } },
    });
    const diff = pullDiff([node], [remote], "en");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toEqual([node]);
  });

  it("classifies an empty remote translation as missing (no destructive overwrite)", () => {
    const node = makeNode({
      key: "greeting",
      translation: "Hello",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "greeting",
      translations: { en: { text: "" } },
    });
    const diff = pullDiff([node], [remote], "en");

    // Matches legacy plugin behaviour: a key without a translation for the
    // selected language is surfaced under "missing" so the user can see they
    // still need to translate it. We never overwrite a local string with "".
    expect(diff.missingKeys).toHaveLength(1);
    expect(diff.missingKeys[0]).toBe(node);
    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toEqual([]);
  });

  it("ignores nodes that are not connected", () => {
    const node = makeNode({
      key: "greeting",
      translation: "Hello",
      connected: false,
    });
    const diff = pullDiff([node], [], "en");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.missingKeys).toEqual([]);
    expect(diff.unchangedNodes).toEqual([]);
  });

  it("flags plural mismatch as changed even when text matches", () => {
    const node = makeNode({
      key: "items",
      translation: "1 item",
      isPlural: false,
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "items",
      isPlural: true,
      translations: { en: { text: "1 item" } },
    });
    const diff = pullDiff([node], [remote], "en");

    expect(diff.changedNodes).toHaveLength(1);
    expect(diff.changedNodes[0]?.isPlural).toBe(true);
  });

  it("disambiguates by namespace", () => {
    const nodeA = makeNode({
      id: "a",
      key: "greeting",
      ns: "ui",
      translation: "Hi (UI)",
      connected: true,
    });
    const nodeB = makeNode({
      id: "b",
      key: "greeting",
      ns: "marketing",
      translation: "Hi (mkt)",
      connected: true,
    });
    const remoteUi = makeRemoteKey({
      keyName: "greeting",
      keyNamespace: "ui",
      translations: { en: { text: "Hi (UI)" } },
    });
    const remoteMkt = makeRemoteKey({
      keyName: "greeting",
      keyNamespace: "marketing",
      translations: { en: { text: "Hello (mkt)" } },
    });
    const diff = pullDiff([nodeA, nodeB], [remoteUi, remoteMkt], "en");

    expect(diff.unchangedNodes).toContain(nodeA);
    expect(diff.changedNodes).toHaveLength(1);
    expect(diff.changedNodes[0]?.node).toBe(nodeB);
    expect(diff.changedNodes[0]?.newText).toBe("Hello (mkt)");
  });

  it("ignores a stale node ns when namespaces are disabled (matches push)", () => {
    // The write pipeline drops the stored ns on ns-disabled projects, so the
    // key lives in the default namespace — the diff lookup must follow, or
    // the node lands in missingKeys and its update is silently skipped.
    const node = makeNode({
      key: "greeting",
      ns: "stale-ns",
      translation: "Hello",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "greeting",
      translations: { en: { text: "Hi" } },
    });
    const diff = pullDiff([node], [remote], "en", false);

    expect(diff.missingKeys).toEqual([]);
    expect(diff.changedNodes).toHaveLength(1);
    expect(diff.changedNodes[0]?.newText).toBe("Hi");
  });

  it("still matches by exact ns when namespaces are enabled", () => {
    const node = makeNode({
      key: "greeting",
      ns: "web",
      translation: "Hello",
      connected: true,
    });
    // Remote key sits in the default namespace — with namespaces ON this must
    // NOT match the node's "web" ns.
    const remote = makeRemoteKey({
      keyName: "greeting",
      translations: { en: { text: "Hi" } },
    });
    const diff = pullDiff([node], [remote], "en", true);

    expect(diff.missingKeys).toEqual([node]);
    expect(diff.changedNodes).toEqual([]);
  });
});

describe("formatNodeText", () => {
  it("formats a plural using the named sample from paramsValues (this UI's edit path)", () => {
    const node = makeNode({
      key: "items",
      paramsValues: { count: "3" }, // count edited as the plural var's sample
      isPlural: true,
    });
    const out = formatNodeText(node, "{count, plural, one {1 item} other {# items}}", "en");
    expect(out.text).toBe("3 items");
    expect(out.error).toBeUndefined();
  });

  it("uses a numeric pluralParamValue as the sample COUNT (original-file compat)", () => {
    // Files written by the published plugin store the count in pluralParamValue.
    const node = makeNode({
      key: "items",
      pluralParamValue: "10",
      isPlural: true,
    });
    const out = formatNodeText(node, "{count, plural, one {1 item} other {# items}}", "en");
    expect(out.error).toBeUndefined();
    expect(out.text).toBe("10 items");
  });

  it("defaults the plural count to 1 when nothing is stored", () => {
    const node = makeNode({ key: "items", isPlural: true });
    const out = formatNodeText(node, "{count, plural, one {# item} other {# items}}", "en");
    expect(out.error).toBeUndefined();
    expect(out.text).toBe("1 item");
  });

  it("ignores a non-numeric pluralParamValue left over as a name (no 'value items')", () => {
    const node = makeNode({ key: "items", pluralParamValue: "value", isPlural: true });
    const out = formatNodeText(node, "{count, plural, one {1 item} other {# items}}", "en");
    expect(out.error).toBeUndefined();
    expect(out.text).toBe("1 item");
    expect(out.text).not.toContain("value");
  });

  it("formats with explicit paramsValues taking precedence", () => {
    const node = makeNode({
      key: "greet",
      paramsValues: { name: "Alice" },
    });
    const out = formatNodeText(node, "Hello, {name}!", "en");
    expect(out.text).toBe("Hello, Alice!");
    expect(out.error).toBeUndefined();
  });

  it("seeds a missing named param with its own name (never literal braces)", () => {
    const node = makeNode({ key: "greet" }); // no sample stored
    const out = formatNodeText(node, "Hello, {name}!", "en");
    expect(out.text).toBe("Hello, name!");
    expect(out.text).not.toContain("{");
    expect(out.error).toBeUndefined();
  });

  it("does not overwrite an existing `count` in paramsValues", () => {
    // An explicit sample value in paramsValues wins over the seeded default.
    const node = makeNode({
      key: "items",
      pluralParamValue: "count",
      paramsValues: { count: "7" },
      isPlural: true,
    });
    const out = formatNodeText(node, "{count, plural, one {1 item} other {# items}}", "en");
    expect(out.text).toBe("7 items");
    expect(out.error).toBeUndefined();
  });

  it("keeps the node's canvas text (not raw ICU) and reports the Error on malformed ICU", () => {
    const node = makeNode({
      key: "broken",
      characters: "current canvas text",
      paramsValues: { name: "Alice" },
    });
    const out = formatNodeText(node, "Hello {name", "en");
    expect(out.text).toBe("current canvas text");
    expect(out.text).not.toContain("{name");
    expect(out.error).toBeInstanceOf(Error);
  });

  it("returns the raw text untouched when there are no params at all", () => {
    const node = makeNode({ key: "k" });
    const out = formatNodeText(node, "Just a string", "en");
    expect(out.text).toBe("Just a string");
    expect(out.error).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Task 59: a `keyNames`-filtered remote payload must diff identically to the
// unfiltered (full-project) one, for the exact same local nodes. `pullDiff`
// itself doesn't know or care how `remoteKeys` was fetched — this pins that
// invariant so the filtering change in `pull.ts` can never silently alter
// what counts as changed/unchanged/missing.
// ---------------------------------------------------------------------------

describe("pullDiff — filtered vs. full remote payload equivalence", () => {
  it("produces the identical diff whether remoteKeys is the full project or filtered to just the local nodes' keys", () => {
    const changed = makeNode({ id: "a", key: "greeting", translation: "Hello" });
    const unchanged = makeNode({ id: "b", key: "farewell", translation: "Bye" });
    const missing = makeNode({ id: "c", key: "deleted-key", translation: "Gone" });
    const localNodes = [changed, unchanged, missing];

    // The "full project" payload includes keys belonging to OTHER nodes not
    // in this selection at all (simulating everything else in the project).
    const fullRemote: PulledKey[] = [
      makeRemoteKey({ keyName: "greeting", translations: { en: { text: "Hi" } } }),
      makeRemoteKey({ keyName: "farewell", translations: { en: { text: "Bye" } } }),
      makeRemoteKey({ keyName: "unrelated-key", translations: { en: { text: "Noise" } } }),
    ];
    // The filtered payload contains only what `keyNames` (built from
    // localNodes) would have asked the server for — i.e. never
    // "unrelated-key", and (like the real API) never a payload entry for the
    // deleted key either.
    const filteredRemote: PulledKey[] = fullRemote.filter((k) => k.keyName !== "unrelated-key");

    const fullDiff = pullDiff(localNodes, fullRemote, "en");
    const filteredDiff = pullDiff(localNodes, filteredRemote, "en");

    expect(filteredDiff).toEqual(fullDiff);
    expect(filteredDiff.missingKeys.map((n) => n.id)).toEqual(["c"]);
    expect(filteredDiff.changedNodes.map((c) => c.node.id)).toEqual(["a"]);
    expect(filteredDiff.unchangedNodes.map((n) => n.id)).toEqual(["b"]);
  });
});

describe("buildApplyUpdates", () => {
  // A node whose ICU cannot render. `formatNodeText` deliberately falls back to
  // the node's CURRENT canvas text so raw ICU never lands on the design — which
  // is exactly why the update must not be sent: it would rewrite the text
  // already there while recording `translation` as applied, leaving the node
  // permanently "up to date" and unable to retry.
  const BROKEN_ICU = "Hello {name";

  it("keeps a renderable node in the updates", () => {
    const node = makeNode({ id: "n1", key: "greet", paramsValues: { name: "Alice" } });
    const { updates, skipped } = buildApplyUpdates(
      [{ node, newText: "Hello, {name}!", isPlural: false }],
      "en",
    );
    expect(skipped).toEqual([]);
    expect(updates).toEqual([
      { id: "n1", text: "Hello, Alice!", translation: "Hello, {name}!", isPlural: false },
    ]);
  });

  it("holds a failed render OUT of the updates instead of persisting it", () => {
    const node = makeNode({
      id: "n2",
      key: "broken",
      characters: "current canvas text",
      paramsValues: { name: "Alice" },
    });
    const { updates, skipped } = buildApplyUpdates(
      [{ node, newText: BROKEN_ICU, isPlural: false }],
      "en",
    );
    expect(updates).toEqual([]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0]?.node.id).toBe("n2");
    expect(skipped[0]?.error).toBeInstanceOf(Error);
  });

  it("applies the good nodes of a mixed batch and reports only the bad ones", () => {
    const ok = makeNode({ id: "ok", key: "greet", paramsValues: { name: "Alice" } });
    const bad = makeNode({ id: "bad", key: "broken", characters: "untouched" });
    const { updates, skipped } = buildApplyUpdates(
      [
        { node: ok, newText: "Hello, {name}!", isPlural: false },
        { node: bad, newText: BROKEN_ICU, isPlural: false },
      ],
      "en",
    );
    expect(updates.map((u) => u.id)).toEqual(["ok"]);
    expect(skipped.map((s) => s.node.id)).toEqual(["bad"]);
  });

  it("summarises the skipped nodes for the user", () => {
    const skipped = ["a", "b", "c", "d"].map((k) => ({
      node: makeNode({ id: k, key: k }),
      error: new Error("boom"),
    }));
    expect(skippedRenderMessage(skipped.slice(0, 1))).toBe(
      "1 string could not be rendered and was left unchanged (a).",
    );
    expect(skippedRenderMessage(skipped)).toBe(
      "4 strings could not be rendered and were left unchanged (a, b, c, +1 more).",
    );
  });
});

describe("nodes left stale by the published plugin", () => {
  // The published plugin stores the remote translation even when its own ICU
  // render threw (`src/ui/views/Pull/Pull.tsx` — `catch` returns
  // `formatted: n.characters`, and `setNodesDataMutation` then writes
  // `translation: changedNode.translation` regardless). That leaves a node
  // whose cached translation already MATCHES the remote while its canvas still
  // shows the old text — so the first pullDiff branch sees nothing to do, and
  // only the drift branch can rescue it.
  //
  // An embedded plural is exactly the shape that used to fail that render, so
  // these nodes arrive stale on migration. `canvasDrifted` swallows a render
  // error as "no drift" (re-applying on unknowns loops forever), which meant
  // the node stayed stale on every future pull too. Seeding the plural count
  // for embedded plurals is what lets the render — and so the rescue — work.
  const EMBEDDED = "{count, plural, one {# day} other {# days}} left";

  it("re-applies a stale node whose translation already matches the remote", () => {
    const node = makeNode({
      key: "trial",
      translation: EMBEDDED,
      characters: "old stale text",
      pluralParamValue: "10",
    });
    const remote = makeRemoteKey({
      keyName: "trial",
      translations: { en: { text: EMBEDDED } },
    });

    const result = pullDiff([node], [remote], "en", false);
    expect(result.changedNodes).toHaveLength(1);
    expect(result.changedNodes[0]?.newText).toBe(EMBEDDED);
    expect(result.unchangedNodes).toHaveLength(0);
  });

  it("leaves the node alone once its canvas shows the rendered text", () => {
    // The other half of the same property: having rescued it, a second pull
    // must report nothing — that regression ("Downloaded 2 strings" forever)
    // is what the drift branch's render-through-the-apply-pipeline is for.
    const node = makeNode({
      key: "trial",
      translation: EMBEDDED,
      characters: "10 days left",
      pluralParamValue: "10",
    });
    const remote = makeRemoteKey({
      keyName: "trial",
      translations: { en: { text: EMBEDDED } },
    });

    const result = pullDiff([node], [remote], "en", false);
    expect(result.changedNodes).toHaveLength(0);
    expect(result.unchangedNodes).toHaveLength(1);
  });
});

describe("the plural exclusion in the drift branch", () => {
  const PLURAL = "{count, plural, one {# day} other {# days}}";

  it("does NOT re-apply a migrated plural layer whose sample is unusable", () => {
    // The published plugin stored the argument NAME in `pluralParamValue`
    // instead of a count. `numericCount` rejects it, so the sample falls back
    // to 1 — a layer showing "10 days" renders as "1 day" and looks drifted.
    // Re-applying would overwrite the design with the wrong plural form, on
    // every single pull. This exclusion is what stops that, so it must not be
    // "relaxed" to rescue stale nodes.
    const node = makeNode({
      key: "trial",
      isPlural: true,
      translation: PLURAL,
      characters: "10 days",
      pluralParamValue: "count", // the arg name, as the original wrote it
    });
    const remote = makeRemoteKey({
      keyName: "trial",
      isPlural: true,
      translations: { en: { text: PLURAL } },
    });

    const result = pullDiff([node], [remote], "en", false);

    expect(result.changedNodes).toHaveLength(0);
    expect(result.unchangedNodes).toHaveLength(1);
  });

  it("does NOT re-apply a parametric layer with no stored params", () => {
    // Same shape: the render seeds `{name}` with its own name, so the canvas
    // never matches and the layer would be rewritten to "Hello, name!".
    const node = makeNode({
      key: "greet",
      translation: "Hello, {name}!",
      characters: "Hello, Alice!",
      paramsValues: { name: "Alice" },
    });
    const remote = makeRemoteKey({
      keyName: "greet",
      translations: { en: { text: "Hello, {name}!" } },
    });

    const result = pullDiff([node], [remote], "en", false);

    expect(result.changedNodes).toHaveLength(0);
  });

  it("still re-applies a plain layer that genuinely drifted", () => {
    // The case the branch exists for stays working.
    const node = makeNode({
      key: "title",
      translation: "Welcome",
      characters: "typed over",
    });
    const remote = makeRemoteKey({
      keyName: "title",
      translations: { en: { text: "Welcome" } },
    });

    const result = pullDiff([node], [remote], "en", false);

    expect(result.changedNodes).toHaveLength(1);
    expect(result.changedNodes[0]?.newText).toBe("Welcome");
  });
});
