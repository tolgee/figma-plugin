import { emit, on } from "@create-figma-plugin/utilities";
import { useEffect, useMemo, useState } from "preact/hooks";
import useSWR from "swr";

import {
  ConfigChangeHandler,
  Node,
  ResizeHandler,
  SelectionChangeHandler,
  SetLanguageHandler,
  TolgeeConfig,
} from "../../types";
import { PAGES, Route } from "../views/data";
import { createProvider } from "../tools/createProvider";

type LanguageType = {
  name: string;
  tag: string;
};

type Props = {
  initialSelection: Array<Node>;
  initialConfig: Partial<TolgeeConfig> | null;
};

export const [GlobalState, useGlobalActions, useGlobalState] = createProvider(
  ({ initialSelection, initialConfig }: Props) => {
    const [selection, setSelection] = useState<Node[]>(initialSelection);
    const [route, setRoute] = useState<Route>("index");
    const [config, setConfig] = useState(initialConfig);
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
        setConfig(data);
      });
    }, []);

    useMemo(() => {
      emit<ResizeHandler>("RESIZE", PAGES[route]);
    }, [route]);

    function setLanguage(language: string) {
      emit<SetLanguageHandler>("SET_LANGUAGE", language);
    }

    const data = {
      route,
      selection,
      config,
      globalError,
    };

    const actions = {
      setRoute,
      setLanguage,
      setGlobalError,
    };

    return [data, actions];
  }
);
