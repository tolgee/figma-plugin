import { emit, on } from "@create-figma-plugin/utilities";
import { useEffect, useMemo, useState } from "preact/hooks";

import {
  ConfigChangeHandler,
  Node,
  ResizeHandler,
  SelectionChangeHandler,
  SetLanguageHandler,
  SetupHandle,
  TolgeeConfig,
} from "../../types";
import { PAGES, Route } from "../views/data";
import { createProvider } from "../tools/createProvider";

type Props = {
  initialSelection: Array<Node>;
  initialConfig: Partial<TolgeeConfig> | null;
};

export const globalState = {
  actions: undefined as unknown as ReturnType<typeof useGlobalActions>,
};

export const [GlobalState, useGlobalActions, useGlobalState] = createProvider(
  ({ initialSelection, initialConfig }: Props) => {
    const [selection, setSelection] = useState<Node[]>(initialSelection);
    const [route, _setRoute] = useState<Route>("index");
    const [config, _setConfig] = useState(initialConfig);
    const [globalError, setGlobalError] = useState<string | undefined>(
      undefined
    );

    useEffect(() => {
      return on<SelectionChangeHandler>("SELECTION_CHANGE", (data) => {
        setSelection(data);
      });
    }, []);

    useEffect(() => {
      return on<ConfigChangeHandler>("CONFIG_CHANGE", (data) => {
        _setConfig(data);
      });
    }, []);

    useMemo(() => {
      emit<ResizeHandler>("RESIZE", PAGES[route]);
    }, [route]);

    function setConfig(config: Partial<TolgeeConfig>) {
      _setConfig(config);
      emit<SetupHandle>("SETUP", config);
    }

    function setLanguage(language: string) {
      _setConfig({ ...config, lang: language });
      emit<SetLanguageHandler>("SET_LANGUAGE", language);
    }

    function setRoute(route: Route) {
      setGlobalError(undefined);
      _setRoute(route);
    }

    const data = {
      route,
      selection,
      config,
      globalError,
    };

    const actions = {
      setRoute,
      setConfig,
      setLanguage,
      setGlobalError,
    };

    globalState.actions = actions;

    return [data, actions];
  }
);
