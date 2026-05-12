export type ProjectMeta = {
  namespacesFeaturesEnabled: boolean;
  branchingEnabled: boolean;
};

/**
 * Returns project-level metadata required to decide which UI features are
 * available (namespaces, branching).
 *
 * The generated OpenAPI schema (API-key access) does not expose a direct
 * `GET /v2/projects/{projectId}` endpoint, so we fall back to raw `fetch`.
 */
export async function getProjectMeta(
  apiUrl: string,
  apiKey: string,
  projectId: number,
): Promise<ProjectMeta> {
  const baseUrl = apiUrl.replace(/\/$/, "");
  const url = `${baseUrl}/v2/projects/${projectId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
      "X-Tolgee-SDK-Type": "Figma",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load project meta (status ${response.status})`);
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
