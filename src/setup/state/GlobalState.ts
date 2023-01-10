import { emit, on } from "@create-figma-plugin/utilities";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Node, TolgeeConfig } from "../../types";
import { PAGES, Route } from "../pages/data";
import { createProvider } from "../tools/createProvider";

type Props = {
  initialSelection: Array<Node>;
  config: Partial<TolgeeConfig> | null;
};

const updateSize = (size: { width: number; height: number }) => {
  emit("RESIZE", size);
};

export const [GlobalState, useGlobalActions, useGlobalState] = createProvider(
  ({ initialSelection, config }: Props) => {
    const [selection, setSelection] = useState<Node[]>(initialSelection);
    const [route, setRoute] = useState<Route>("index");

    useEffect(() => {
      return on("SELECTION_CHANGE", (data) => {
        setSelection(data);
      });
    }, []);

    useMemo(() => {
      updateSize(PAGES[route]);
    }, [route]);

    const data = {
      route,
      selection,
      config,
    };

    const actions = {
      setRoute,
    };

    return [data, actions];
  }
);
