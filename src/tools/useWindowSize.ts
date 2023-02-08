import { emit } from "@create-figma-plugin/utilities";
import { useEffect, useMemo } from "preact/hooks";

import { ResizeHandler } from "@/types";
export const DEFAULT_SIZE = { width: 500, height: 400 };

type WindowSize = {
  width: number;
  height: number;
};

export const useWindowSize = (size: WindowSize) => {
  useMemo(() => {
    emit<ResizeHandler>("RESIZE", size);
  }, [size.height, size.width]);

  useEffect(() => {
    return () => emit<ResizeHandler>("RESIZE", DEFAULT_SIZE);
  }, []);
};
