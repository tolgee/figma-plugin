import { render } from "@create-figma-plugin/ui";
import { h } from "preact";

import "!../styles.css";
import { QueryClient, QueryClientProvider } from "react-query";

import { NodeInfo, TolgeeConfig } from "../types";
import { GlobalState } from "./state/GlobalState";
import { Router } from "./views/Router";

type Props = {
  config: Partial<TolgeeConfig> | null;
  nodes: Array<NodeInfo>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

function Plugin({ config, nodes }: Props) {
  return (
    <GlobalState initialSelection={nodes} initialConfig={config}>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </GlobalState>
  );
}

export default render(Plugin);
