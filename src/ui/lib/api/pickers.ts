import type { TolgeeClient } from "$ui/lib/api/client";
import { fetchBranches, pickDefaultBranch } from "$ui/lib/api/branches";
import { auth } from "$ui/lib/stores/auth.svelte";

/**
 * Fetch the project's languages and used namespaces into the auth store, so the
 * header/settings/onboarding pickers are populated without each one re-fetching.
 * Errors are swallowed — the UI falls back to "current value only".
 *
 * Called from BOTH the startup bootstrap (App.svelte, when config already has
 * valid credentials) AND a manual Connect (SettingsSectionConnection). Without
 * the manual-connect call, a first-time connect (onboarding, or Settings on a
 * fresh document) left the language/namespace selects empty until reopen.
 */
export async function hydratePickers(client: TolgeeClient): Promise<void> {
  try {
    const { data } = await client.GET("/v2/projects/languages", {
      params: { query: { size: 1000 } },
    });
    const raw = data as {
      _embedded?: {
        languages?: Array<{ tag?: string; name?: string; base?: boolean }>;
      };
    };
    const list = raw._embedded?.languages ?? [];
    const base = list.find((l) => l.base)?.tag ?? "";
    auth.setLanguages(
      list
        .filter((l): l is { tag: string; name?: string } => Boolean(l.tag))
        .map((l) => ({ tag: l.tag, name: l.name ?? l.tag })),
      base,
    );
  } catch {
    auth.setLanguages([]);
  }
  // Startup/reconnect: a failed fetch RESETS to [] — the previous project's
  // namespaces must not linger after switching projects.
  auth.setNamespaces((await fetchUsedNamespaces(client)) ?? []);
}

/** The project's used namespaces, or null on failure (caller decides whether a
 *  miss should reset or keep the existing list). */
async function fetchUsedNamespaces(
  client: TolgeeClient,
): Promise<{ name: string }[] | null> {
  try {
    const { data } = await client.GET("/v2/projects/used-namespaces", {});
    const raw = data as { _embedded?: { namespaces?: Array<{ name?: string }> } };
    return (raw._embedded?.namespaces ?? [])
      .filter((n): n is { name: string } => Boolean(n.name))
      .map((n) => ({ name: n.name }));
  } catch {
    return null;
  }
}

/**
 * Re-pull the project's used namespaces into the store — best-effort, so a
 * transient failure KEEPS the current list rather than wiping it (unlike the
 * startup hydrate). Call after a push: uploading a key under a brand-new
 * namespace creates it server-side, and the namespace picker (Index rows,
 * bulk "Set namespace") must offer it afterwards even when no currently
 * selected node carries it.
 */
export async function refreshNamespaces(client: TolgeeClient): Promise<void> {
  const list = await fetchUsedNamespaces(client);
  if (list) auth.setNamespaces(list);
}

/**
 * Fetch the project's branches into the auth store and remember the default
 * (isDefault → "main" → first). Call only when branching is enabled — so a
 * branching-enabled project can pre-fill "main" instead of an empty branch.
 * Best-effort; on failure the store is left with an empty list.
 */
export async function hydrateBranches(client: TolgeeClient): Promise<void> {
  try {
    const branches = await fetchBranches(client);
    auth.setBranches(branches, pickDefaultBranch(branches));
  } catch {
    // `loaded: false` — a failed fetch says nothing about which branches
    // exist, so the missing-branch warning must not fire off this state.
    auth.setBranches([], "", false);
  }
}
