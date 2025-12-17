import { useApiQuery } from "../client/useQueryApi";

export const useHasNamespacesEnabled = () => {
  try {
    // First, get the project ID from the API key info (relevant for legacy api keys)
    const apiKeyInfo = useApiQuery({
      url: "/v2/api-keys/current",
      method: "get",
      options: {
        cacheTime: 60000,
        staleTime: 60000,
      },
    });

    // Then get the project info if we have a project ID
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const projectQuery = useApiQuery({
      url: "/v2/projects/{projectId}",
      method: "get",
      path: {
        projectId: apiKeyInfo.data?.projectId ?? 0,
      },
      options: {
        cacheTime: 60000,
        staleTime: 60000,
        enabled: apiKeyInfo.data?.projectId !== undefined,
      },
    });

    return projectQuery.data?.useNamespaces ?? false;
  } catch (error) {
    console.error(error);
    return false;
  }
};
