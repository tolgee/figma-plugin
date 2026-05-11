import type { TolgeeClient } from "$ui/lib/api/client";

export type UploadScreenshotInfo = {
  /**
   * Stable per-source identifier used by Tolgee to deduplicate uploads from
   * the same Figma frame across multiple pushes. The legacy plugin uses
   * `figma-${frameId}`.
   */
  location: string;
};

export type UploadedScreenshot = {
  /** Image id Tolgee assigns to the uploaded blob. */
  id: number;
};

/**
 * Uploads a PNG screenshot to Tolgee via `POST /v2/image-upload`.
 *
 * This is implemented with raw `fetch` rather than `openapi-fetch`: the
 * generated schema types the multipart body in a way that is awkward to
 * satisfy from TypeScript (it expects a `string` for the `image` part and a
 * typed object for `info`), and the actual wire format Tolgee accepts is the
 * standard multipart payload built below. `Blob` and `FormData` are part of
 * the iframe's DOM and are therefore safe to use here (they are not
 * available inside the plugin sandbox).
 */
export async function uploadScreenshot(
  client: TolgeeClient,
  image: Uint8Array,
  info: UploadScreenshotInfo,
): Promise<UploadedScreenshot> {
  const { baseUrl, headers } = readClientInternals(client);

  const formData = new FormData();
  // `Uint8Array` -> `Blob` so the underlying ArrayBuffer is properly framed
  // as multipart binary data on the wire. We narrow the buffer to a fresh
  // `ArrayBuffer` slice so TypeScript's strict `BlobPart` typing (which
  // forbids `SharedArrayBuffer`-backed views) accepts the value.
  const imageBuffer = image.buffer.slice(
    image.byteOffset,
    image.byteOffset + image.byteLength,
  ) as ArrayBuffer;
  formData.append(
    "image",
    new Blob([imageBuffer], { type: "image/png" }),
    "screenshot.png",
  );
  formData.append(
    "info",
    new Blob([JSON.stringify(info)], { type: "application/json" }),
  );

  // Strip any `Content-Type` from the inherited headers — the browser must
  // be allowed to add the multipart boundary.
  const { "Content-Type": _ct, "content-type": _ct2, ...rest } = headers;
  void _ct;
  void _ct2;

  const response = await fetch(`${baseUrl}/v2/image-upload`, {
    method: "POST",
    headers: { ...rest, Accept: "application/json" },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Screenshot upload failed (status ${response.status}: ${response.statusText})`,
    );
  }

  const body = (await response.json()) as { id?: number };
  if (typeof body.id !== "number") {
    throw new Error("Screenshot upload returned no image id");
  }
  return { id: body.id };
}

type ClientInternals = {
  baseUrl: string;
  headers: Record<string, string>;
};

/**
 * Read `baseUrl` and default headers from an `openapi-fetch` client. The same
 * trick is used by `projectMeta.ts`; both call sites should be kept in sync
 * if the upstream shape ever changes.
 */
function readClientInternals(client: TolgeeClient): ClientInternals {
  const candidate = client as unknown as {
    baseUrl?: string;
    headers?: Record<string, string>;
    clientOptions?: {
      baseUrl?: string;
      headers?: Record<string, string>;
    };
  };
  const baseUrl =
    candidate.baseUrl ?? candidate.clientOptions?.baseUrl ?? "";
  const headers = candidate.headers ?? candidate.clientOptions?.headers ?? {};
  if (!baseUrl) {
    throw new Error("Could not determine baseUrl for screenshot upload");
  }
  return { baseUrl, headers };
}
