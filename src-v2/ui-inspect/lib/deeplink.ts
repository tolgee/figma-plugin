import type { NodeInfo, TolgeeConfig } from "$shared/types";

/**
 * Strip any trailing slash from `apiUrl` so we can append paths safely without
 * producing `//`. `URL` would normalize this for us, but constructing a `URL`
 * throws on invalid inputs — and the inspect panel must render gracefully
 * even when the connection has never been configured.
 */
function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Build a deep link to the Tolgee web UI translations view, pre-filtered to
 * the selected node's key (and namespace, when present).
 *
 * When the document has been connected and a `projectId` was persisted, the
 * link targets that project directly (`/projects/:id/translations`).
 * Otherwise it falls back to the generic project-selector translations view,
 * which still lets the user search by key inside the app once a project is
 * picked. Returns `null` when the config is too incomplete to build a link
 * (missing `apiUrl`) or the node has no key to filter on.
 */
export function buildKeyDeepLink(
  config: Partial<TolgeeConfig> | null,
  node: NodeInfo,
): string | null {
  if (!config?.apiUrl || !node.key) return null;
  const base = trimTrailingSlash(config.apiUrl);
  const path = config.projectId
    ? `/projects/${config.projectId}/translations`
    : `/projects/translations`;
  const params = new URLSearchParams();
  params.set("search", node.key);
  if (node.ns) params.set("filterNamespace", node.ns);
  return `${base}${path}?${params.toString()}`;
}

/**
 * Build a deep link to the project dashboard, used by the footer "Open
 * project" action. Falls back to the project list when no `projectId` is
 * available so the user can still navigate into the right place.
 */
export function buildProjectDashboardLink(
  config: Partial<TolgeeConfig> | null,
): string | null {
  if (!config?.apiUrl) return null;
  const base = trimTrailingSlash(config.apiUrl);
  return config.projectId ? `${base}/projects/${config.projectId}` : `${base}/projects`;
}
