import type { TolgeeClient } from "./client";

export type BranchInfo = { name: string; isDefault?: boolean };

export async function fetchBranches(client: TolgeeClient): Promise<BranchInfo[]> {
  // `openapi-fetch` RESOLVES on 4xx/5xx with an `error` field instead of
  // throwing. Discarding it turned a failed request into an empty branch list
  // on the SUCCESS path: `hydrateBranches` then set `loaded: true`, and
  // `isConfiguredBranchMissing` announced that the user's configured branch
  // had been deleted — offering an empty picker to replace it — when all that
  // had happened was a request failing.
  const { data, error } = await client.GET("/v2/projects/branches", {});
  if (error) {
    throw new Error(
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message)
        : "Failed to load branches.",
    );
  }
  const raw = data as {
    _embedded?: { branches?: Array<{ name?: string; isDefault?: boolean }> };
  };
  return (raw._embedded?.branches ?? [])
    .filter((b): b is { name: string; isDefault?: boolean } => Boolean(b.name))
    .map((b) => ({ name: b.name, isDefault: b.isDefault }));
}

/**
 * Whether the CONFIGURED branch was deleted in Tolgee: it is set, the fetched
 * branch list is trustworthy (`branchesLoaded` — a successful fetch, not a
 * pending/failed one), and the list doesn't contain it. Mirrors the original
 * plugin's `isBranchMissing` warning on the Index view — without it every API
 * call would silently target a nonexistent branch.
 */
export function isConfiguredBranchMissing(
  configuredBranch: string,
  branches: BranchInfo[],
  branchesLoaded: boolean,
): boolean {
  return (
    branchesLoaded &&
    configuredBranch !== "" &&
    !branches.some((b) => b.name === configuredBranch)
  );
}

/**
 * The branch to pre-select when none is chosen yet: the project's default
 * branch (`isDefault`, same rule as the original plugin), else the
 * conventional "main", else the first — so a branching-enabled project never
 * sits on an empty branch. "" only when there are no branches at all.
 * NOT `active` — that flag just means "not archived" and can be true for many
 * branches at once, so it would pick an arbitrary feature branch.
 */
export function pickDefaultBranch(branches: BranchInfo[]): string {
  if (branches.length === 0) return "";
  return (
    branches.find((b) => b.isDefault)?.name ??
    branches.find((b) => b.name === "main")?.name ??
    branches[0]?.name ??
    ""
  );
}
