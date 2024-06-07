import { emit, on } from "@/utilities";
import { useEffect, useState } from "preact/hooks";

import {
  ConfigChangeHandler,
  NodeInfo,
  ResetHandler,
  ResizeHandler,
  SetLanguageHandler,
  SetupHandle,
  TolgeeConfig,
  WindowSize,
} from "@/types";
import type { Route } from "../views/routes";
import { createProvider } from "@/tools/createProvider";
import { DEFAULT_SIZE } from "./sizes";

type Props = {
  initialConfig: Partial<TolgeeConfig> | null;
};

export const globalState = {
  actions: undefined as unknown as ReturnType<typeof useGlobalActions>,
};

export const [GlobalState, useGlobalActions, useGlobalState] = createProvider(
  ({ initialConfig }: Props) => {
    const [route, _setRoute] = useState<Route>(["index"]);
    const routeKey = route[0];
    const [config, _setConfig] = useState(initialConfig);
    const [globalError, setGlobalError] = useState<string | undefined>(
      undefined
    );
    const [sizeStack, setSizeStack] = useState<WindowSize[]>([]);

    useEffect(() => {
      console.log(sizeStack);
      const size = sizeStack[sizeStack.length - 1] ?? DEFAULT_SIZE;
      emit<ResizeHandler>("RESIZE", size);
      return () => emit<ResizeHandler>("RESIZE", DEFAULT_SIZE);
    }, [sizeStack]);

    const [editedKeys, setEditedKeys] = useState<Record<string, string>>({});

    useEffect(() => {
      return on<ConfigChangeHandler>("CONFIG_CHANGE", (data) => {
        _setConfig(data);
      });
    }, []);

    const data = {
      route,
      routeKey,
      selection: [] as NodeInfo[],
      config,
      globalError,
      editedKeys,
      sizeStack,
    };

    const actions = {
      setRoute(...route: Route) {
        setGlobalError(undefined);
        _setRoute(route);
      },
      setConfig(config: Partial<TolgeeConfig>) {
        _setConfig(config);
        emit<SetupHandle>("SETUP", config);
      },
      setLanguage(language: string) {
        _setConfig({ ...config, language });
        emit<SetLanguageHandler>("SET_LANGUAGE", language);
      },
      setEditedKey(id: string, key: string) {
        setEditedKeys((keys) => ({ ...keys, [id]: key }));
      },
      resetConfig() {
        emit<ResetHandler>("RESET");
      },
      setSizeStack,
      setGlobalError,
    };

    globalState.actions = actions;

    return [data, actions];
  }
);
export { DEFAULT_SIZE };
