import { ApiClient, createApiClient, components } from "@tginternal/client";
import { languagesTestData } from "./languageTestData";

const API_URL = "http://localhost:22223";

export async function deleteProject(client: ApiClient | undefined) {
  await client?.DELETE("/v2/projects/{projectId}", {
    params: { path: { projectId: client?.getProjectId() } },
    parseAs: "stream",
  });
}

export type Options = {
  languages?: components["schemas"]["LanguageRequest"][];
} & Partial<Omit<components["schemas"]["EditProjectRequest"], "name">>;

export async function createProjectWithClient(
  name: string,
  data: components["schemas"]["SingleStepImportResolvableRequest"],
  options?: Options
) {
  const client = createApiClient({
    baseUrl: API_URL,
  });
  await client.login({ username: "admin", password: "admin" });
  const organizations = await client.GET("/v2/organizations");
  const { languages, ...editOptions } = options ?? {};

  const project = await client.POST("/v2/projects", {
    body: {
      name,
      organizationId: organizations.data!._embedded!.organizations![0].id,
      languages: languages ?? languagesTestData,
      icuPlaceholders: editOptions?.icuPlaceholders ?? true,
    },
  });

  client.setProjectId(project.data!.id);

  await client.PUT("/v2/projects/{projectId}", {
    params: {
      path: {
        projectId: client.getProjectId(),
      },
    },
    body: {
      icuPlaceholders: true,
      useNamespaces: true,
      suggestionsMode: "DISABLED",
      translationProtection: "NONE",
      ...editOptions,
      name,
    },
  });

  await client.POST("/v2/projects/{projectId}/single-step-import-resolvable", {
    params: { path: { projectId: client.getProjectId() } },
    body: data,
  });

  return client;
}

export const DEFAULT_SCOPES = [
  "keys.view",
  "translations.view",
  "translations.edit",
  "keys.edit",
  "keys.create",
  "screenshots.view",
  "screenshots.upload",
  "screenshots.delete",
  "translations.state-edit",
];

export async function createPak(client: ApiClient, scopes = DEFAULT_SCOPES) {
  const apiKey = await client.POST("/v2/api-keys", {
    body: { projectId: client.getProjectId(), scopes },
  });

  return apiKey.data!.key;
}

export async function createPat(client: ApiClient) {
  const apiKey = await client.POST("/v2/pats", {
    body: { description: "e2e test pat" },
  });

  return apiKey.data!.token;
}
