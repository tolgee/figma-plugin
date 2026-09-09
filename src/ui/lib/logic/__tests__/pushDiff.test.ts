import type { NodeInfo } from "$shared/types";
import {
  buildRemoteMapFromKeys,
  droppedConflictNodeIds,
  pushDiff,
  textOfNode,
} from "$ui/lib/logic/pushDiff";
import type { RemoteTranslationMap } from "$ui/lib/logic/pushDiff";
import { describe, expect, it } from "vitest";
import IntlMessageFormat from "intl-messageformat";

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

describe("pushDiff", () => {
  it("returns empty buckets for empty input", () => {
    const diff = pushDiff([], {}, { hasNamespacesEnabled: false });
    expect(diff.newKeys).toEqual([]);
    expect(diff.changedKeys).toEqual([]);
    expect(diff.unchangedKeys).toEqual([]);
    expect(diff.conflictingNodes).toEqual([]);
  });

  it("marks a node as unchanged when remote text matches", () => {
    const node = makeNode({
      id: "n1",
      key: "greeting",
      translation: "Hello",
    });
    const remote: RemoteTranslationMap = {
      "": {
        greeting: {
          translation: "Hello",
          keyIsPlural: false,
          keyTags: [],
        },
      },
    };
    const diff = pushDiff([node], remote, { hasNamespacesEnabled: false });
    expect(diff.unchangedKeys).toHaveLength(1);
    expect(diff.unchangedKeys[0]).toBe(node);
    expect(diff.newKeys).toEqual([]);
    expect(diff.changedKeys).toEqual([]);
  });

  it("marks a node as changed and surfaces the remoteText when text differs", () => {
    const node = makeNode({
      id: "n1",
      key: "greeting",
      translation: "Hi",
    });
    const remote: RemoteTranslationMap = {
      "": {
        greeting: {
          translation: "Hello",
          keyIsPlural: false,
          keyTags: [],
        },
      },
    };
    const diff = pushDiff([node], remote, { hasNamespacesEnabled: false });
    expect(diff.changedKeys).toHaveLength(1);
    expect(diff.changedKeys[0]?.node).toBe(node);
    expect(diff.changedKeys[0]?.remoteText).toBe("Hello");
    expect(diff.unchangedKeys).toEqual([]);
  });

  it("marks an UNCONNECTED node as new when remote has no entry for the key", () => {
    const node = makeNode({
      id: "n1",
      key: "new-key",
      translation: "Hello",
      connected: false,
    });
    const diff = pushDiff([node], {}, { hasNamespacesEnabled: false });
    expect(diff.newKeys).toHaveLength(1);
    expect(diff.newKeys[0]).toBe(node);
    expect(diff.missingKeys).toEqual([]);
  });

  it("marks a CONNECTED node as missing (not new) when remote has no entry — the key was deleted on the platform", () => {
    const node = makeNode({
      id: "n1",
      key: "deleted-key",
      translation: "Hello",
      connected: true,
    });
    const diff = pushDiff([node], {}, { hasNamespacesEnabled: false });
    expect(diff.missingKeys).toHaveLength(1);
    expect(diff.missingKeys[0]).toBe(node);
    expect(diff.newKeys).toEqual([]);
  });

  it("reports two nodes with the same (key, ns) but different text as conflicting", () => {
    const nodeA = makeNode({
      id: "a",
      key: "shared",
      ns: "ui",
      translation: "Hello",
    });
    const nodeB = makeNode({
      id: "b",
      key: "shared",
      ns: "ui",
      translation: "Hi",
    });
    const diff = pushDiff([nodeA, nodeB], {}, { hasNamespacesEnabled: true });

    expect(diff.conflictingNodes).toHaveLength(1);
    expect(diff.conflictingNodes[0]?.key).toBe("shared");
    expect(diff.conflictingNodes[0]?.ns).toBe("ui");
    expect(diff.conflictingNodes[0]?.nodes).toHaveLength(2);
    expect(diff.conflictingNodes[0]?.nodes).toContain(nodeA);
    expect(diff.conflictingNodes[0]?.nodes).toContain(nodeB);
  });

  it("does NOT report duplicate (key, ns) pairs when the text agrees", () => {
    const nodeA = makeNode({
      id: "a",
      key: "shared",
      translation: "Hello",
    });
    const nodeB = makeNode({
      id: "b",
      key: "shared",
      translation: "Hello",
    });
    const diff = pushDiff([nodeA, nodeB], {}, { hasNamespacesEnabled: false });
    expect(diff.conflictingNodes).toEqual([]);
  });

  it("does NOT report plural VARIANTS as conflicting (same key + ICU, different rendered text)", () => {
    // Two Figma layers legitimately share one plural key: identical ICU in
    // `translation`, but each renders a different sample form ("1 woman" /
    // "10 women") in `characters`. `textOfNode` uses the ICU for plural/advanced
    // strings, so this must NOT trip the same-key conflict heuristic.
    const icu = "{count, plural, one {# woman} other {# women}}";
    const nodeA = makeNode({
      id: "a",
      key: "plural-W",
      isPlural: true,
      translation: icu,
      characters: "1 woman",
    });
    const nodeB = makeNode({
      id: "b",
      key: "plural-W",
      isPlural: true,
      translation: icu,
      characters: "10 women",
    });
    const diff = pushDiff([nodeA, nodeB], {}, { hasNamespacesEnabled: false });
    expect(diff.conflictingNodes).toEqual([]);
  });

  it("does NOT report plural variants as conflicting even without a stored ICU translation", () => {
    // The screenshot case: two plural layers on one key, no ICU pulled yet, so
    // `translation` is empty and only the rendered `characters` differ. A plural
    // render is derived, never authoritative, so this must not be a conflict.
    const nodeA = makeNode({
      id: "a",
      key: "plural-W",
      isPlural: true,
      translation: "",
      characters: "1 woman",
    });
    const nodeB = makeNode({
      id: "b",
      key: "plural-W",
      isPlural: true,
      translation: "",
      characters: "10 women",
    });
    const diff = pushDiff([nodeA, nodeB], {}, { hasNamespacesEnabled: false });
    expect(diff.conflictingNodes).toEqual([]);
  });

  it("does NOT report plural variants as conflicting when each was pluralized independently (different PARTIAL ICUs)", () => {
    // The reported bug: three layers on one plural key, each pluralized from its
    // own single form → DIFFERENT partial ICUs. They are still the same plural,
    // so the same-key conflict must not fire (was flagged because the full ICU
    // differed between "one {…}" and "other {…}").
    const one = makeNode({
      id: "a",
      key: "test.plural.apple",
      isPlural: true,
      connected: false,
      translation: "{value, plural, one {# apple} other {}}",
      characters: "1 apple",
    });
    const other = makeNode({
      id: "b",
      key: "test.plural.apple",
      isPlural: true,
      connected: false,
      translation: "{value, plural, other {# apples}}",
      characters: "2 apples",
    });
    const other2 = makeNode({
      id: "c",
      key: "test.plural.apple",
      isPlural: true,
      connected: false,
      translation: "{value, plural, other {# apples}}",
      characters: "167 apples",
    });
    const diff = pushDiff([one, other, other2], {}, { hasNamespacesEnabled: false });
    expect(diff.conflictingNodes).toEqual([]);
  });

  it("MERGES plural forms across layers on one key into one complete ICU on push", () => {
    // The reported case: three layers on test.plural.apple, each pluralized from
    // its own sample form. Push must send the UNION of forms, not just the first
    // layer's partial ICU.
    const one = makeNode({
      id: "a",
      key: "test.plural.apple",
      isPlural: true,
      connected: false,
      translation: "{value, plural, one {# apple} other {}}",
      characters: "1 apple",
    });
    const other = makeNode({
      id: "b",
      key: "test.plural.apple",
      isPlural: true,
      connected: false,
      translation: "{value, plural, other {# apples}}",
      characters: "2 apples",
    });
    const other2 = makeNode({
      id: "c",
      key: "test.plural.apple",
      isPlural: true,
      connected: false,
      translation: "{value, plural, other {# apples}}",
      characters: "167 apples",
    });
    // New key (no remote) → the representative in newKeys carries the merged ICU.
    const diff = pushDiff([one, other, other2], {}, { hasNamespacesEnabled: false });
    expect(diff.newKeys).toHaveLength(1);
    expect(diff.newKeys[0]?.id).toBe("a"); // keeps the first layer's id
    expect(diff.newKeys[0]?.translation).toBe(
      "{value, plural, one {# apple} other {# apples}}",
    );
  });

  it("does NOT merge a single-layer plural key (nothing to combine)", () => {
    const only = makeNode({
      id: "a",
      key: "solo.apple",
      isPlural: true,
      connected: false,
      translation: "{value, plural, one {# apple} other {# apples}}",
      characters: "2 apples",
    });
    const diff = pushDiff([only], {}, { hasNamespacesEnabled: false });
    expect(diff.newKeys[0]?.translation).toBe(only.translation); // untouched
  });

  it("does NOT merge across a NON-plural group (plain duplicates keep their own text)", () => {
    // Two plain layers on one key are a conflict, never a merge — the plural
    // union must not touch them.
    const a = makeNode({ id: "a", key: "dup", connected: false, translation: "Hello", characters: "Hello" });
    const b = makeNode({ id: "b", key: "dup", connected: false, translation: "Hi", characters: "Hi" });
    const diff = pushDiff([a, b], {}, { hasNamespacesEnabled: false });
    // Conflicting → the representative is the untouched first node, no merged ICU.
    expect(diff.conflictingNodes).toHaveLength(1);
    const rep = diff.newKeys[0] ?? diff.changedKeys[0]?.node ?? diff.unchangedKeys[0];
    expect(rep?.translation).toBe("Hello");
  });

  it("STILL reports a plain layer sharing a plural layer's key as a conflict", () => {
    // A form-agnostic plural marker must not swallow a genuine mix: a plural and
    // a plain string on ONE key really do conflict (only one can upload).
    const plural = makeNode({
      id: "a",
      key: "shared",
      isPlural: true,
      translation: "{value, plural, other {# apples}}",
      characters: "2 apples",
    });
    const plain = makeNode({ id: "b", key: "shared", translation: "banana", characters: "banana" });
    const diff = pushDiff([plural, plain], {}, { hasNamespacesEnabled: false });
    expect(diff.conflictingNodes).toHaveLength(1);
  });

  it("flags plural mismatch as changed even when text matches", () => {
    const node = makeNode({
      id: "n1",
      key: "items",
      translation: "1 item",
      isPlural: true,
    });
    const remote: RemoteTranslationMap = {
      "": {
        items: {
          translation: "1 item",
          keyIsPlural: false,
          keyTags: [],
        },
      },
    };
    const diff = pushDiff([node], remote, { hasNamespacesEnabled: false });
    expect(diff.changedKeys).toHaveLength(1);
    expect(diff.changedKeys[0]?.node).toBe(node);
  });

  it("flags missing configuredTags as changed", () => {
    const node = makeNode({
      id: "n1",
      key: "greeting",
      translation: "Hello",
    });
    const remote: RemoteTranslationMap = {
      "": {
        greeting: {
          translation: "Hello",
          keyIsPlural: false,
          keyTags: ["existing"],
        },
      },
    };
    const diff = pushDiff([node], remote, {
      hasNamespacesEnabled: false,
      configuredTags: ["needs-this-tag"],
    });
    expect(diff.changedKeys).toHaveLength(1);
  });

  it("does NOT flag missing tags when no tags are configured", () => {
    // The contract the Push view relies on: with tag sync off it passes an
    // EMPTY list, and an otherwise-identical key must then come back
    // unchanged. Reported live — leaving tags configured while turning the
    // toggle off made every push report changes, because the diff kept
    // demanding tags the push would never apply.
    const node = makeNode({ id: "n1", key: "greeting", translation: "Hello" });
    const remote: RemoteTranslationMap = {
      "": {
        greeting: { translation: "Hello", keyIsPlural: false, keyTags: [] },
      },
    };

    for (const configuredTags of [[], undefined]) {
      const diff = pushDiff([node], remote, {
        hasNamespacesEnabled: false,
        configuredTags,
      });
      expect(diff.changedKeys).toHaveLength(0);
      expect(diff.unchangedKeys).toHaveLength(1);
    }
  });

  it("ignores nodes without a key", () => {
    const node = makeNode({ id: "n1", key: "", translation: "Hello" });
    const diff = pushDiff([node], {}, { hasNamespacesEnabled: false });
    expect(diff.newKeys).toEqual([]);
    expect(diff.changedKeys).toEqual([]);
    expect(diff.unchangedKeys).toEqual([]);
  });

  it("falls back to `characters` when `translation` is empty", () => {
    const node = makeNode({
      id: "n1",
      key: "greeting",
      translation: "",
      characters: "Hello",
    });
    const remote: RemoteTranslationMap = {
      "": {
        greeting: {
          translation: "Hello",
          keyIsPlural: false,
          keyTags: [],
        },
      },
    };
    const diff = pushDiff([node], remote, { hasNamespacesEnabled: false });
    expect(diff.unchangedKeys).toHaveLength(1);
  });
});

describe("droppedConflictNodeIds", () => {
  it("returns every conflict-group loser (all but the first) so they skip connect-back AND screenshots", () => {
    // "Ahoy" / "Ahoy2" share one key with different text → conflict. Only the
    // first uploads/connects; the loser must not be captured or boxed on the
    // key's screenshot.
    const win = makeNode({ id: "ahoy", key: "greet", translation: "Ahoy", characters: "Ahoy" });
    const lose = makeNode({ id: "ahoy2", key: "greet", translation: "Ahoy2", characters: "Ahoy2" });
    const diff = pushDiff([win, lose], {}, { hasNamespacesEnabled: false });
    expect(diff.conflictingNodes).toHaveLength(1);
    expect([...droppedConflictNodeIds(diff)]).toEqual(["ahoy2"]);
  });

  it("is empty when there are no conflicts", () => {
    const diff = pushDiff(
      [makeNode({ id: "x", key: "k", translation: "hi", connected: false })],
      {},
      { hasNamespacesEnabled: false },
    );
    expect(droppedConflictNodeIds(diff).size).toBe(0);
  });
});

describe("buildRemoteMapFromKeys", () => {
  it("returns an empty object when keys is undefined", () => {
    expect(buildRemoteMapFromKeys(undefined, "en")).toEqual({});
  });

  it("indexes by namespace ('' for default) and key", () => {
    const map = buildRemoteMapFromKeys(
      [
        {
          keyName: "greeting",
          translations: { en: { text: "Hello" } },
        },
        {
          keyName: "greeting",
          keyNamespace: "ui",
          keyIsPlural: true,
          keyTags: [{ name: "foo" }],
          translations: { en: { text: "Hi" } },
        },
      ],
      "en",
    );

    expect(map[""]?.greeting?.translation).toBe("Hello");
    expect(map[""]?.greeting?.keyIsPlural).toBe(false);
    expect(map.ui?.greeting?.translation).toBe("Hi");
    expect(map.ui?.greeting?.keyIsPlural).toBe(true);
    expect(map.ui?.greeting?.keyTags).toEqual(["foo"]);
  });

  it("returns undefined translation when no language entry is present", () => {
    const map = buildRemoteMapFromKeys([{ keyName: "k", translations: {} }], "en");
    expect(map[""]?.k?.translation).toBeUndefined();
  });
});

describe("textOfNode — authoritative text (shared with String details)", () => {
  it("prefers the live canvas `characters` for a PLAIN string", () => {
    // The reported bug: a connected string whose canvas text was overwritten
    // (e.g. a duplicated node) must resolve to the NEW canvas text, not the
    // stale stored translation it inherited. String details loads this too, so
    // the editor shows exactly what Push will upload.
    const node = makeNode({
      key: "test.myNameIsZuzka",
      translation: "My name is Zuzka",
      characters: "2 apples",
    });
    expect(textOfNode(node)).toBe("2 apples");
  });

  it("prefers the stored ICU `translation` for an ADVANCED string", () => {
    // Plural: `characters` is only the rendered form ("2 apples"), the ICU in
    // `translation` is authoritative and must not be clobbered by the render.
    const node = makeNode({
      isPlural: true,
      translation: "{count, plural, one {# apple} other {# apples}}",
      characters: "2 apples",
    });
    expect(textOfNode(node)).toBe("{count, plural, one {# apple} other {# apples}}");
  });

  it("prefers the canvas edit for a plain string holding ICU-escaped braces", () => {
    // The consequence of the brace-pair misclassification: `Use '{'braces'}'`
    // is PLAIN text (the braces are escaped literals, not an argument), so a
    // canvas edit must win here exactly as it does for any other plain string.
    // While it read as advanced, the stale stored value won and the edit was
    // silently dropped from the push.
    const node = makeNode({
      translation: "Use '{'braces'}' here",
      characters: "Use {braces} there",
    });
    expect(textOfNode(node)).toBe("Use {braces} there");
  });

  it("falls back across the missing side for both kinds", () => {
    // Plain with no canvas text → the stored translation.
    expect(textOfNode(makeNode({ translation: "only stored", characters: "" }))).toBe(
      "only stored",
    );
    // Advanced (markup) with no stored translation → the canvas render.
    expect(textOfNode(makeNode({ translation: "", characters: "<b>bold</b>" }))).toBe(
      "<b>bold</b>",
    );
  });
});

describe("two layers of one plural key that disagree WITHIN a category", () => {
  // The headline trade-off in this PR's own description, and the one thing in
  // the plural merge path with no test: the original plugin raised a conflict
  // on any plural-form difference, which drowned the legitimate case (each
  // layer pluralised from its own sample carries only the form its count
  // selects). Suppressing that was a product decision — but it means a REAL
  // disagreement inside one category now resolves first-wins, silently.
  //
  // Pinning it matters because `mergePluralForms` regenerates the whole ICU,
  // which is exactly where the escaping bug in 7bc393e lived.
  const FIRST = "{count, plural, one {# apple} other {# apples}}";
  const SECOND = "{count, plural, one {# pear} other {# pears}}";

  function twoLayers() {
    return [
      // Unconnected: with an empty remote map, connected nodes read as "the
      // key was deleted on the platform" and land in `missingKeys` instead.
      makeNode({ id: "a", key: "fruit", isPlural: true, translation: FIRST, connected: false }),
      makeNode({ id: "b", key: "fruit", isPlural: true, translation: SECOND, connected: false }),
    ];
  }

  it("does NOT report them as conflicting", () => {
    const diff = pushDiff(twoLayers(), {}, { hasNamespacesEnabled: false });
    expect(diff.conflictingNodes).toHaveLength(0);
  });

  it("uploads the FIRST layer's body for every category they both define", () => {
    // First-wins, per category. The second layer's text is dropped without a
    // word — that is the accepted behaviour, not an oversight, so assert it
    // rather than leaving it to be rediscovered.
    const diff = pushDiff(twoLayers(), {}, { hasNamespacesEnabled: false });

    expect(diff.newKeys).toHaveLength(1);
    const uploaded = diff.newKeys[0]?.translation ?? "";
    expect(uploaded).toContain("# apple");
    expect(uploaded).toContain("# apples");
    expect(uploaded).not.toContain("pear");
  });

  it("still unions categories the layers do NOT share", () => {
    // The case the merge exists for: each layer pluralised from its own sample
    // holds only the form its count selected, and the push must carry both.
    const one = makeNode({
      id: "a",
      key: "fruit",
      isPlural: true,
      connected: false,
      translation: "{count, plural, one {# apple}}",
    });
    const other = makeNode({
      id: "b",
      key: "fruit",
      isPlural: true,
      connected: false,
      translation: "{count, plural, other {# apples}}",
    });

    const diff = pushDiff([one, other], {}, { hasNamespacesEnabled: false });
    const uploaded = diff.newKeys[0]?.translation ?? "";

    expect(uploaded).toContain("# apple}");
    expect(uploaded).toContain("# apples");
  });

  it("produces ICU that still parses after the merge", () => {
    // The merge regenerates the whole string through `tolgeeFormatGenerateIcu`
    // — the path that used to corrupt nested arguments and double-escape.
    const withArg = makeNode({
      id: "a",
      key: "fruit",
      isPlural: true,
      connected: false,
      translation: "{count, plural, one {# apple for {name}} other {# apples}}",
    });
    const partial = makeNode({
      id: "b",
      key: "fruit",
      isPlural: true,
      connected: false,
      translation: "{count, plural, other {# pears}}",
    });

    const diff = pushDiff([withArg, partial], {}, { hasNamespacesEnabled: false });
    const uploaded = diff.newKeys[0]?.translation ?? "";

    // The nested argument must survive the regeneration, not become literal.
    expect(uploaded).toContain("{name}");
    expect(() => {
      new IntlMessageFormat(uploaded, "en", undefined, { ignoreTag: true }).format({
        count: 1,
        name: "Zuzka",
      });
    }).not.toThrow();
  });
});

describe("why a key is reported as changed", () => {
  // Without a reason on the entry, a key changed only by tags or by the plural
  // flag renders as a diff whose two halves are the same string — which reads
  // as a broken diff. That ambiguity was reported as "push always shows
  // changes" with the cause guessed wrong, so the reason is part of the data.
  const node = () => makeNode({ id: "n1", key: "greeting", translation: "Hello" });

  function remote(over: Partial<{ translation: string; keyIsPlural: boolean; keyTags: string[] }> = {}) {
    return {
      "": {
        greeting: {
          translation: over.translation ?? "Hello",
          keyIsPlural: over.keyIsPlural ?? false,
          keyTags: over.keyTags ?? [],
        },
      },
    } as RemoteTranslationMap;
  }

  it("reports `text` when the translation itself differs", () => {
    const diff = pushDiff([node()], remote({ translation: "Bonjour" }), {
      hasNamespacesEnabled: false,
    });
    expect(diff.changedKeys[0]?.reason).toBe("text");
  });

  it("reports `tags` when only a configured tag is missing", () => {
    const diff = pushDiff([node()], remote(), {
      hasNamespacesEnabled: false,
      configuredTags: ["needs-this"],
    });
    expect(diff.changedKeys).toHaveLength(1);
    expect(diff.changedKeys[0]?.reason).toBe("tags");
    // The text is identical on both sides — which is exactly why the row can't
    // render a strike-through diff for this case.
    expect(diff.changedKeys[0]?.remoteText).toBe(textOfNode(node()));
  });

  it("reports `plural` when only the plural flag differs", () => {
    const diff = pushDiff([node()], remote({ keyIsPlural: true }), {
      hasNamespacesEnabled: false,
    });
    expect(diff.changedKeys[0]?.reason).toBe("plural");
  });

  it("prefers `text` when the text differs AND a tag is missing", () => {
    // Text is the informative one — a strike-through diff shows real content,
    // whereas the tag note would hide it.
    const diff = pushDiff([node()], remote({ translation: "Bonjour" }), {
      hasNamespacesEnabled: false,
      configuredTags: ["needs-this"],
    });
    expect(diff.changedKeys[0]?.reason).toBe("text");
  });

  it("reports nothing changed when text, plural and tags all match", () => {
    const diff = pushDiff([node()], remote({ keyTags: ["already"] }), {
      hasNamespacesEnabled: false,
      configuredTags: ["already"],
    });
    expect(diff.changedKeys).toHaveLength(0);
    expect(diff.unchangedKeys).toHaveLength(1);
  });
});
