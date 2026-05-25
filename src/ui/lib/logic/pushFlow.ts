import type { FrameScreenshot, NodeInfo } from "$shared/types";
import type { TolgeeClient } from "$ui/lib/api/client";
import { fetchRemoteKeys } from "$ui/lib/api/keysByName";
import {
  type PushKeysResult,
  type SimpleImportConflictResult,
  type SingleStepImportResolvableItemRequest,
  pushKeys,
} from "$ui/lib/api/push";
import type { components } from "$ui/lib/api/schema.generated";
import { uploadScreenshot } from "$ui/lib/api/screenshots";
import { applyTags } from "$ui/lib/api/tags";

/**
 * How the user resolved a translation conflict. Lives here (not in the
 * `.svelte` view) so plain TS modules can reference it without depending on
 * Svelte's compiler magic for type re-exports.
 */
export type PushConflictResolution = "OVERRIDE" | "KEEP" | "FORCE_OVERRIDE";

type KeyScreenshotDto = components["schemas"]["KeyScreenshotDto"];

export type PushContext = {
  client: TolgeeClient;
  apiUrl: string;
  apiKey: string;
  language: string;
  branch?: string;
  hasNamespacesEnabled: boolean;
};

export type CanonicalKeyState = {
  translation: string;
  isPlural: boolean;
};

export function canonicalKey(n: NodeInfo): string {
  return `${n.ns ?? ""}|${n.key}`;
}

export function resolutionKey(keyName: string, keyNamespace: string | undefined): string {
  return `${keyNamespace ?? ""}|${keyName}`;
}

/**
 * After a successful push, pull the same keys back so we can persist the
 * exact translation Tolgee owns plus the canonical plural flag. The next
 * diff then compares like-for-like — without this, Tolgee's own canonical
 * rewrites (e.g. shared suffix extraction across plural variants) show as
 * phantom diffs forever.
 */
export async function fetchCanonicalAfterPush(
  ctx: PushContext,
  nodes: NodeInfo[],
): Promise<Map<string, CanonicalKeyState>> {
  const result = new Map<string, CanonicalKeyState>();
  const keysToFetch = new Set(nodes.map((n) => n.key).filter(Boolean));
  if (keysToFetch.size === 0) return result;

  const filterNamespace = ctx.hasNamespacesEnabled
    ? Array.from(new Set(nodes.map((n) => n.ns ?? "")))
    : undefined;

  const fetched = await fetchRemoteKeys(ctx.client, {
    filterKeyName: Array.from(keysToFetch),
    filterNamespace,
    language: ctx.language,
    branch: ctx.branch,
  });
  for (const k of fetched) {
    const text = k.translations?.[ctx.language]?.text;
    if (typeof text !== "string") continue;
    result.set(`${k.keyNamespace ?? ""}|${k.keyName}`, {
      translation: text,
      isPlural: Boolean(k.keyIsPlural),
    });
  }
  return result;
}

/**
 * Build the `screenshots` array of the import payload for one local node.
 * Each captured screenshot's `keys` may reference multiple Figma layers; we
 * keep only those that match the (key, ns) we are pushing and record their
 * positions.
 */
function mapScreenshotsForNode(
  node: NodeInfo,
  screenshots: FrameScreenshot[],
  uploadedImageIdByScreenshot: Map<FrameScreenshot, number>,
): KeyScreenshotDto[] {
  const out: KeyScreenshotDto[] = [];
  for (const screenshot of screenshots) {
    const positions = screenshot.keys
      .filter((k) => k.key === node.key && (k.ns ?? "") === (node.ns ?? ""))
      .map((k) => ({ x: k.x, y: k.y, width: k.width, height: k.height }));
    if (positions.length === 0) continue;
    const uploadedImageId = uploadedImageIdByScreenshot.get(screenshot);
    if (uploadedImageId === undefined) continue;
    out.push({
      text: node.translation || node.characters,
      uploadedImageId,
      positions,
    });
  }
  return out;
}

export type BuildPayloadOptions = {
  ctx: PushContext;
  nodes: NodeInfo[];
  screenshots: FrameScreenshot[];
  uploadedImageIdByScreenshot: Map<FrameScreenshot, number>;
  resolutionFor?: (key: string, ns: string | undefined) => PushConflictResolution | undefined;
};

export function buildPayload(opts: BuildPayloadOptions): SingleStepImportResolvableItemRequest[] {
  const { ctx, nodes, screenshots, uploadedImageIdByScreenshot, resolutionFor } = opts;

  return nodes.map((node) => {
    const resolution = resolutionFor?.(node.key, node.ns);
    const text = node.translation || node.characters || "";
    const screenshotsForNode = mapScreenshotsForNode(
      node,
      screenshots,
      uploadedImageIdByScreenshot,
    );

    // `KEEP` -> omit translations (only updates screenshots/tags).
    const translations =
      resolution === "KEEP"
        ? {}
        : {
            [ctx.language]: {
              text,
              resolution: "OVERRIDE" as const,
            },
          };

    return {
      name: node.key,
      namespace: ctx.hasNamespacesEnabled ? node.ns || undefined : undefined,
      screenshots: screenshotsForNode,
      translations,
    } satisfies SingleStepImportResolvableItemRequest;
  });
}

export type ProgressEvent = {
  current: number;
  total: number;
  message: string;
};

export type UploadScreenshotsResult = {
  screenshots: FrameScreenshot[];
  uploadedById: Map<FrameScreenshot, number>;
};

/**
 * Upload a batch of frame screenshots sequentially. Sequential is the right
 * choice here: each request is large (multipart PNG) and Tolgee throttles
 * parallel uploads; the legacy plugin chained them too.
 */
export async function uploadScreenshots(
  ctx: PushContext,
  screenshots: FrameScreenshot[],
  onProgress: (event: ProgressEvent) => void,
): Promise<Map<FrameScreenshot, number>> {
  const uploadedById = new Map<FrameScreenshot, number>();
  onProgress({
    current: 0,
    total: screenshots.length,
    message: "Uploading screenshots…",
  });
  for (let i = 0; i < screenshots.length; i++) {
    const screenshot = screenshots[i];
    if (!screenshot) continue;
    const uploaded = await uploadScreenshot(ctx.apiUrl, ctx.apiKey, screenshot.image, {
      location: `figma-${screenshot.info.id}`,
    });
    uploadedById.set(screenshot, uploaded.id);
    onProgress({
      current: i + 1,
      total: screenshots.length,
      message: "Uploading screenshots…",
    });
  }
  return uploadedById;
}

export type SubmitPushOptions = {
  ctx: PushContext;
  nodes: NodeInfo[];
  screenshots: FrameScreenshot[];
  uploadedImageIdByScreenshot: Map<FrameScreenshot, number>;
  resolutionMode: "RECOMMENDED" | "FORCE_OVERRIDE";
  resolutionFor?: BuildPayloadOptions["resolutionFor"];
};

export async function submitPush(opts: SubmitPushOptions): Promise<PushKeysResult> {
  const payload = buildPayload({
    ctx: opts.ctx,
    nodes: opts.nodes,
    screenshots: opts.screenshots,
    uploadedImageIdByScreenshot: opts.uploadedImageIdByScreenshot,
    resolutionFor: opts.resolutionFor,
  });
  return pushKeys(opts.ctx.client, payload, {
    branch: opts.ctx.branch || undefined,
    resolutionMode: opts.resolutionMode,
    errorOnUnresolvedConflict: false,
  });
}

export type ApplyTagsOptions = {
  ctx: PushContext;
  tags: string[];
  nodes: NodeInfo[];
};

export async function applyConfiguredTags(opts: ApplyTagsOptions): Promise<void> {
  if (opts.tags.length === 0) return;
  await applyTags(
    opts.ctx.client,
    opts.tags,
    opts.nodes.map((n) => ({
      name: n.key,
      namespace: opts.ctx.hasNamespacesEnabled ? n.ns || undefined : undefined,
    })),
    opts.ctx.branch || undefined,
  );
}

/**
 * Build the default conflict-resolution map (override when allowed, keep
 * otherwise). The caller mutates this map as the user picks alternatives.
 */
export function defaultResolutions(
  list: SimpleImportConflictResult[],
): Record<string, PushConflictResolution> {
  const next: Record<string, PushConflictResolution> = {};
  for (const c of list) {
    next[resolutionKey(c.keyName, c.keyNamespace)] = c.isOverridable ? "OVERRIDE" : "KEEP";
  }
  return next;
}
