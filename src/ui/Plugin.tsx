import { h } from "preact";

import "!./styles.css";
import { QueryClient, QueryClientProvider } from "react-query";

import { InitialState } from "../types";
import { GlobalState } from "./state/GlobalState";
import { Router } from "./views/Router";

type Props = InitialState;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      cacheTime: 5 * 60 * 1000,
      staleTime: 30 * 1000,
    },
  },
});

export function Plugin({ config }: Props) {
  return (
    <GlobalState initialConfig={config}>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </GlobalState>
  );
}
