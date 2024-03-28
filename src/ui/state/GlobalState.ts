import { emit, on } from "@/utilities";
import { useEffect, useState } from "preact/hooks";

import {
  ConfigChangeHandler,
  NodeInfo,
  ResetHandler,
  SetLanguageHandler,
  SetupHandle,
  TolgeeConfig,
} from "@/types";
import { Route } from "../views/routes";
import { createProvider } from "@/tools/createProvider";

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
      setGlobalError,
    };

    globalState.actions = actions;

    return [data, actions];
  }
);
