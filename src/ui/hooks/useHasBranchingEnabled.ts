import { useApiQuery } from "../client/useQueryApi";

export const useHasBranchingEnabled = () => {
  const apiKeyInfo = useApiQuery({
    url: "/v2/api-keys/current",
    method: "get",
    options: {
      cacheTime: 60000,
      staleTime: 60000,
    },
  });

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

  return projectQuery.data?.useBranching ?? false;
};
