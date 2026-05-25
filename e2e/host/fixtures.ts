/**
 * Test fixtures shared between Playwright specs and the host shim.
 *
 * Mirrors `cypress/common/tools.ts` + `src/web/urlConfig.ts` from v1 but
 * targets the v2 message bus (no `@create-figma-plugin/utilities`).
 */
import type { NodeInfo, TolgeeConfig } from "../../src/shared/types";

/** Default credentials matching the Tolgee container in `docker-compose.yml`. */
export const DEFAULT_CREDENTIALS = {
  apiUrl: "http://localhost:8080",
  /**
   * Implicit API key minted by the `examples` import data. Requires
   * `tolgee.import.create-implicit-api-key=true` on the platform side.
   */
  apiKey: "examples-admin-imported-project-implicit",
};

/** Pre-canned config presets used across specs. */
export const SIGNED_IN: Partial<TolgeeConfig> = {
  ...DEFAULT_CREDENTIALS,
  language: "en",
  namespace: "",
  pageInfo: true,
  documentInfo: true,
};

export const SIGNED_IN_NO_PAGE: Partial<TolgeeConfig> = {
  ...DEFAULT_CREDENTIALS,
  documentInfo: true,
};

export const PAGE_COPY: Partial<TolgeeConfig> = {
  ...DEFAULT_CREDENTIALS,
  namespace: "",
  documentInfo: true,
  pageCopy: true,
};

export const PAGE_STRING_DETAILS: Partial<TolgeeConfig> = {
  ...DEFAULT_CREDENTIALS,
  language: "en",
  namespace: "",
  documentInfo: true,
  pageStringDetails: true,
};

type NodeProps = {
  text: string;
  key?: string;
  ns?: string;
  connected?: boolean;
  translation?: string;
  isPlural?: boolean;
  id?: string;
};

export function createTestNode(props: NodeProps): NodeInfo {
  return {
    name: props.text,
    characters: props.text,
    id: props.id ?? Math.random().toString(36).slice(2),
    translation: props.translation ?? props.text,
    isPlural: props.isPlural ?? false,
    key: props.key ?? "",
    ns: props.ns,
    connected: Boolean(props.connected),
  };
}

export type HostInitState = {
  config?: Partial<TolgeeConfig> | null;
  allNodes?: NodeInfo[];
  selectedNodes?: NodeInfo[];
  hasUserSelection?: boolean;
  editorType?: "figma" | "dev";
  annotationsEnabled?: boolean;
  /** Optional initial route to navigate to immediately after init (used by E2E tests). */
  route?: string;
};

/**
 * Build the `?state=…` query string the E2E host page expects.
 *
 * Mirrors v1's `createShortcutUrl` so call sites read the same way:
 *
 *   await page.goto(hostUrl(SIGNED_IN, { selectedNodes: [...] }));
 */
export function hostUrl(
  config: Partial<TolgeeConfig> | null,
  rest: Omit<HostInitState, "config"> = {},
): string {
  const state: HostInitState = { config, ...rest };
  return `/?state=${encodeURIComponent(JSON.stringify(state))}`;
}
