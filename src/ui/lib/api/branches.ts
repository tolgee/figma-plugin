import type { TolgeeClient } from "./client";

export type BranchInfo = { name: string };

export async function fetchBranches(
  client: TolgeeClient,
): Promise<BranchInfo[]> {
  const { data } = await client.GET("/v2/projects/branches", {});
  const raw = data as {
    _embedded?: { branches?: Array<{ name?: string; active?: boolean }> };
  };
  return (raw._embedded?.branches ?? [])
    .filter((b): b is { name: string; active?: boolean } => Boolean(b.name))
    .map((b) => ({ name: b.name }));
}
