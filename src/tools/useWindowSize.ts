import { emit } from "@/utilities";
import { useEffect } from "preact/hooks";

import { ResizeHandler } from "@/types";
export const DEFAULT_SIZE = { width: 500, height: 400 };
export const COMPACT_SIZE = { width: 500, height: 160 };

type WindowSize = {
  width: number;
  height: number;
};

export const useWindowSize = (size: WindowSize) => {
  useEffect(() => {
    emit<ResizeHandler>("RESIZE", size);
    return () => emit<ResizeHandler>("RESIZE", DEFAULT_SIZE);
  }, [size]);
};
