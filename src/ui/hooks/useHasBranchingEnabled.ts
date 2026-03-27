import { useEffect } from "preact/hooks";
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

  const hasBranching = projectQuery.data?.useBranching ?? false;

  useEffect(() => {
    if (projectQuery.data) {
      // eslint-disable-next-line no-console
      console.info(
        `[Tolgee] Branching feature: ${hasBranching ? "ENABLED" : "DISABLED — enable it in your Tolgee project settings (Settings → General → Branching)"}`
      );
    }
  }, [projectQuery.data, hasBranching]);

  return hasBranching;
};
