import type { TolgeeClient } from "$ui/lib/api/client";
import type { components } from "$ui/lib/api/schema.generated";

export type SingleStepImportResolvableItemRequest =
  components["schemas"]["SingleStepImportResolvableItemRequest"];
export type SimpleImportConflictResult =
  components["schemas"]["SimpleImportConflictResult"];

export type PushOptions = {
  branch?: string;
  /**
   * Controls how Tolgee treats protected REVIEWED translations:
   *
   *   - `RECOMMENDED` (default) — fails for DISABLED translations and
   *     protected REVIEWED translations.
   *   - `FORCE_OVERRIDE` — re-submit after explicit user resolution; mapped
   *     to the server-side `ALL` value (tries to update protected REVIEWED
   *     translations).
   */
  resolutionMode: "RECOMMENDED" | "FORCE_OVERRIDE";
  /**
   * When `true`, the server fails the entire import on the first unresolved
   * conflict (used for the initial submission). When `false`, the server
   * applies what it can and returns the remaining conflicts in the response
   * (used for the post-resolution re-submit).
   */
  errorOnUnresolvedConflict?: boolean;
};

export type PushKeysResult = {
  unresolvedConflicts: SimpleImportConflictResult[];
};

/**
 * Submit a batch of translation upserts via
 * `POST /v2/projects/single-step-import-resolvable`.
 *
 * The endpoint is designed for "submit-once with conflict resolution":
 * callers send a payload, inspect `unresolvedConflicts`, optionally prompt
 * the user, and resubmit (typically with `resolutionMode: "FORCE_OVERRIDE"`
 * and per-key `resolution` set to `OVERRIDE`).
 */
export async function pushKeys(
  client: TolgeeClient,
  payload: SingleStepImportResolvableItemRequest[],
  options: PushOptions,
): Promise<PushKeysResult> {
  const { data, error, response } = await client.POST(
    "/v2/projects/single-step-import-resolvable",
    {
      body: {
        keys: payload,
        // `errorOnUnresolvedConflict` defaults to `false` so the first call
        // collects the conflicts instead of failing fast.
        errorOnUnresolvedConflict: options.errorOnUnresolvedConflict ?? false,
        overrideMode:
          options.resolutionMode === "FORCE_OVERRIDE" ? "ALL" : "RECOMMENDED",
        branch: options.branch || undefined,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Push failed (status ${response?.status ?? "?"})`,
    );
  }

  // TODO: tighten when schema refined — the response shape varies in the
  // generated schema; this defensively widens it for older API revisions.
  const raw = data as { unresolvedConflicts?: SimpleImportConflictResult[] };
  return {
    unresolvedConflicts: raw.unresolvedConflicts ?? [],
  };
}
