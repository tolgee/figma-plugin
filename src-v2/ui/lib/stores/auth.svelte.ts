import type { TolgeeClient } from "$ui/lib/api/client";

type AuthState = {
  client: TolgeeClient | null;
  apiUrl: string;
  apiKey: string;
  projectId: number | null;
  scopes: string[];
  authenticated: boolean;
  branchingEnabled: boolean;
  namespacesEnabled: boolean;
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
    clear() {
      state.client = null;
      state.apiUrl = "";
      state.apiKey = "";
      state.projectId = null;
      state.scopes = [];
      state.authenticated = false;
      state.branchingEnabled = false;
      state.namespacesEnabled = false;
    },
    hasScope(scope: string): boolean {
      return state.scopes.includes(scope);
    },
  };
}

export const auth = createAuth();
