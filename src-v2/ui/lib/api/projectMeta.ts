import type { TolgeeClient } from "./client";

export type ProjectMeta = {
  namespacesFeaturesEnabled: boolean;
  branchingEnabled: boolean;
};

/**
 * Returns project-level metadata required to decide which UI features are
 * available (namespaces, branching, ...).
 *
 * The generated OpenAPI schema (API-key access) does not expose a direct
 * `GET /v2/projects/{projectId}` endpoint, so we fall back to raw `fetch`
 * against the client's internal `baseUrl` and headers.
 *
 * TODO: schema missing /v2/projects/{projectId} — swap to a typed client
 * call once the generated schema includes it.
 */
export async function getProjectMeta(
  client: TolgeeClient,
  projectId: number,
): Promise<ProjectMeta> {
  const { baseUrl, headers } = readClientInternals(client);
  const url = `${baseUrl}/v2/projects/${projectId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...headers,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load project meta (status ${response.status})`,
    );
  }

  const body = (await response.json()) as {
    useNamespaces?: boolean;
    useBranching?: boolean;
  };

  return {
    namespacesFeaturesEnabled: Boolean(body.useNamespaces),
    branchingEnabled: Boolean(body.useBranching),
  };
}

type ClientInternals = {
  baseUrl: string;
  headers: Record<string, string>;
};

/**
 * Extracts `baseUrl` and default headers from an `openapi-fetch` client.
 *
 * `openapi-fetch` does not formally expose this configuration, but the
 * shape has been stable across versions. We narrow with a runtime check
 * and throw an explanatory error otherwise.
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
    throw new Error(
      "Could not determine baseUrl for raw project meta fetch fallback",
    );
  }
  return { baseUrl, headers };
}
