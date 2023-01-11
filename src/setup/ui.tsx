import { render } from "@create-figma-plugin/ui";
import { FunctionComponent, h } from "preact";

import "!../styles.css";
import { Node, TolgeeConfig } from "../types";
import {
  GlobalState,
  useGlobalActions,
  useGlobalState,
} from "./state/GlobalState";
import { Router } from "./views/Router";
import { SWRConfig } from "swr";
import { PublicConfiguration } from "swr/_internal";

type Props = {
  config: Partial<TolgeeConfig> | null;
  nodes: Array<Node>;
};

const SWRConfigProvider: FunctionComponent = ({ children }) => {
  const config = useGlobalState((c) => c.config);
  const { setGlobalError } = useGlobalActions();

  const swrConfig: Partial<PublicConfiguration> = {
    refreshInterval: 0,
    dedupingInterval: 0,
    fetcher: async (resource: string, init: any) => {
      const baseUrl = init?.baseUrl || config?.url;
      const url =
        (baseUrl?.endsWith("/") ? baseUrl?.slice(0, -1) : baseUrl) + resource;

      const headers = {
        "x-api-key": config?.apiKey,
        "content-type": "application/json",
        ...init?.headers,
      };

      const response = await fetch(url, { ...init, headers });

      if (response.status === 401) {
        setGlobalError("Invalid Tolgee API key");
      } else if (!response.ok) {
        setGlobalError(response.statusText);
      } else {
        return response.json();
      }
    },
  };

  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
};

function Plugin({ config, nodes }: Props) {
  return (
    <GlobalState initialSelection={nodes} initialConfig={config}>
      <SWRConfigProvider>
        <Router />
      </SWRConfigProvider>
    </GlobalState>
  );
}

export default render(Plugin);
