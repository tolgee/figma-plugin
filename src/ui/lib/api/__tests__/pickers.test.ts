import { auth } from "$ui/lib/stores/auth.svelte";
import type { TolgeeClient } from "$ui/lib/api/client";
import { refreshNamespaces } from "$ui/lib/api/pickers";
import { beforeEach, describe, expect, it } from "vitest";

/** Minimal client whose GET resolves to `data` (or throws when `throws`). */
function fakeClient(opts: { data?: unknown; throws?: boolean }): TolgeeClient {
  return {
    GET: async () => {
      if (opts.throws) throw new Error("network");
      return { data: opts.data };
    },
  } as unknown as TolgeeClient;
}

beforeEach(() => {
  auth.setNamespaces([{ name: "existing" }]);
});

describe("refreshNamespaces", () => {
  it("replaces the store with the project's used namespaces (incl. a just-pushed one)", async () => {
    // The reported bug: after pushing a key under a new namespace, the picker
    // must offer it even when no selected node carries it.
    await refreshNamespaces(
      fakeClient({ data: { _embedded: { namespaces: [{ name: "common" }, { name: "new" }] } } }),
    );
    expect(auth.value.namespaces.map((n) => n.name)).toEqual(["common", "new"]);
  });

  it("KEEPS the existing list on a fetch failure (best-effort, unlike startup hydrate)", async () => {
    await refreshNamespaces(fakeClient({ throws: true }));
    expect(auth.value.namespaces.map((n) => n.name)).toEqual(["existing"]);
  });

  it("drops entries without a name", async () => {
    await refreshNamespaces(
      fakeClient({ data: { _embedded: { namespaces: [{ name: "a" }, {}, { name: "" }] } } }),
    );
    expect(auth.value.namespaces.map((n) => n.name)).toEqual(["a"]);
  });
});
