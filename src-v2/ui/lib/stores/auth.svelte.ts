import type { TolgeeClient } from "$ui/lib/api/client";

type AuthState = {
  client: TolgeeClient | null;
  projectId: number | null;
  scopes: string[];
  authenticated: boolean;
};

function createAuth() {
  const state = $state<AuthState>({
    client: null,
    projectId: null,
    scopes: [],
    authenticated: false,
  });

  return {
    get value() {
      return state;
    },
    setAuth(opts: {
      client: TolgeeClient;
      projectId: number;
      scopes: string[];
    }) {
      state.client = opts.client;
      state.projectId = opts.projectId;
      state.scopes = opts.scopes;
      state.authenticated = true;
    },
    clear() {
      state.client = null;
      state.projectId = null;
      state.scopes = [];
      state.authenticated = false;
    },
    hasScope(scope: string): boolean {
      return state.scopes.includes(scope);
    },
  };
}

export const auth = createAuth();
