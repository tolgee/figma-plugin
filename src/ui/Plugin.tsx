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
      cacheTime: 0,
      staleTime: 0,
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
