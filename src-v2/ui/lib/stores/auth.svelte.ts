import type { TolgeeClient } from "$ui/lib/api/client";

type LanguageInfo = { tag: string; name: string };
type NamespaceInfo = { name: string };

type AuthState = {
  client: TolgeeClient | null;
  apiUrl: string;
  apiKey: string;
  projectId: number | null;
  scopes: string[];
  authenticated: boolean;
  branchingEnabled: boolean;
  namespacesEnabled: boolean;
  languages: LanguageInfo[];
  namespaces: NamespaceInfo[];
};

function createAuth() {
  const state = $state<AuthState>({
    client: null,
    apiUrl: "",
    apiKey: "",
    projectId: null,
    scopes: [],
    authenticated: false,
    branchingEnabled: false,
    namespacesEnabled: false,
    languages: [],
    namespaces: [],
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
    }): void {
      state.branchingEnabled = features.branchingEnabled;
      state.namespacesEnabled = features.namespacesEnabled;
    },
    setLanguages(langs: LanguageInfo[]): void {
      state.languages = langs;
    },
    setNamespaces(nss: NamespaceInfo[]): void {
      state.namespaces = nss;
    },
    clear() {
      state.client = null;
      state.apiUrl = "";
      state.apiKey = "";
      state.projectId = null;
      state.scopes = [];
      state.authenticated = false;
      state.branchingEnabled = false;
      state.namespacesEnabled = false;
      state.languages = [];
      state.namespaces = [];
    },
    hasScope(scope: string): boolean {
      return state.scopes.includes(scope);
    },
  };
}

export const auth = createAuth();
