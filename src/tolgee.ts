import { TolgeeConfig } from "./types";

export const TOLGEE_PREFIX = "t:";

export const TOLGEE_PLUGIN_CONFIG_NAME = "tolgee_config";

export async function sendTolgeeRequest(
  endpoint: string,
  method: "POST" | "PUT" | "GET" | "DELETE",
  tolgeeConfig: Omit<TolgeeConfig, "lang">,
  body?: string
): Promise<{ status: number; data: any | null } | null> {
  if (!tolgeeConfig) {
    console.log("ABORT: NO CONFIG");
    return null;
  }
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(method, `${tolgeeConfig.apiUrl}/${endpoint}`);
    request.setRequestHeader("X-API-Key", tolgeeConfig.apiKey);
    request.setRequestHeader("Content-Type", "application/json");
    request.responseType = "json";
    request.onloadend = () => {
      resolve({ status: request.status, data: request.response });
    };
    request.onerror = () => {
      reject();
    };
    request.send(body);
  });
}
