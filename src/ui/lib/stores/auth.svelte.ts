import type { TolgeeClient } from "$ui/lib/api/client";
import type { BranchInfo } from "$ui/lib/api/branches";

type LanguageInfo = { tag: string; name: string };
type NamespaceInfo = { name: string };

type AuthState = {
  client: TolgeeClient | null;
  apiUrl: string;
  apiKey: string;
  projectId: number | null;
  projectName: string | null;
  scopes: string[];
  authenticated: boolean;
  branchingEnabled: boolean;
  namespacesEnabled: boolean;
  languages: LanguageInfo[];
  /** The project's base (main) language tag, used to pre-fill "Current
   *  language" on first setup — matches the original plugin. "" when unknown. */
  baseLanguage: string;
  namespaces: NamespaceInfo[];
  branches: BranchInfo[];
  /** Branch to pre-select when none is chosen (isDefault → "main" → first). */
  defaultBranch: string;
  /**
   * True only after `branches` reflects a SUCCESSFUL fetch. Distinguishes
   * "list is empty because it hasn't loaded / the fetch failed" from "list
   * really is what the server has" — the missing-branch warning must only
   * trust the latter.
   */
  branchesLoaded: boolean;
};

function createAuth() {
  const state = $state<AuthState>({
    client: null,
    apiUrl: "",
    apiKey: "",
    projectId: null,
    projectName: null,
    scopes: [],
    authenticated: false,
    branchingEnabled: false,
    namespacesEnabled: false,
    languages: [],
    baseLanguage: "",
    namespaces: [],
    branches: [],
    defaultBranch: "",
    branchesLoaded: false,
  });

  return {
    get value() {
      return state;
    },
    setAuth(opts: {
      client: TolgeeClient;
      apiUrl: string;
      apiKey: string;
      projectId: number;
      scopes: string[];
    }) {
      state.client = opts.client;
      state.apiUrl = opts.apiUrl.replace(/\/$/, "");
      state.apiKey = opts.apiKey;
      state.projectId = opts.projectId;
      state.scopes = opts.scopes;
      state.authenticated = true;
    },
    setProjectFeatures(features: {
      branchingEnabled: boolean;
      namespacesEnabled: boolean;
      projectName?: string;
    }): void {
      state.branchingEnabled = features.branchingEnabled;
      state.namespacesEnabled = features.namespacesEnabled;
      if (features.projectName !== undefined) {
        state.projectName = features.projectName;
      }
    },
    setLanguages(langs: LanguageInfo[], baseLanguage = ""): void {
      state.languages = langs;
      state.baseLanguage = baseLanguage;
    },
    setNamespaces(nss: NamespaceInfo[]): void {
      state.namespaces = nss;
    },
    setBranches(branches: BranchInfo[], defaultBranch = "", loaded = true): void {
      state.branches = branches;
      state.defaultBranch = defaultBranch;
      state.branchesLoaded = loaded;
    },
    clear() {
      state.client = null;
      state.apiUrl = "";
      state.apiKey = "";
      state.projectId = null;
      state.projectName = null;
      state.scopes = [];
      state.authenticated = false;
      state.branchingEnabled = false;
      state.namespacesEnabled = false;
      state.languages = [];
      state.baseLanguage = "";
      state.namespaces = [];
      state.branches = [];
      state.defaultBranch = "";
      state.branchesLoaded = false;
    },
    hasScope(scope: string): boolean {
      return state.scopes.includes(scope);
    },
  };
}

export const auth = createAuth();
