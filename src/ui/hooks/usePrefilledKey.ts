import { useQuery } from "react-query";
import { preformatKeyEndpoint } from "@/main/endpoints/preformatKey";

/**
 * Hook, der das Key-Format über einen Endpoint im Figma-Kontext berechnen lässt.
 * Wird direkt mit NodeInfo und keyFormat aufgerufen und gibt { key, isLoading } zurück.
 */
export function usePrefilledKey(
  nodeId: string,
  keyFormat: string,
  nodeKey?: string
) {
  const result = useQuery<string, undefined, string>(
    [preformatKeyEndpoint.name, nodeId, keyFormat],
    async () => {
      if (!nodeId || !keyFormat) return "";
      return preformatKeyEndpoint.call({ keyFormat, nodeId });
    },
    {
      enabled: !!nodeId && !!keyFormat && !nodeKey,
      structuralSharing: false,
    }
  );

  return { key: result.data, isLoading: result.isLoading };
}
