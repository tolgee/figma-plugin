import { useEffect, useRef } from "preact/hooks";

import { useGlobalActions, useGlobalState } from "../state/GlobalState";

type WindowSize = {
  width: number;
  height: number;
};

export const useWindowSize = (newSize: WindowSize) => {
  const lastSize = useRef<WindowSize>();
  const { setSizeStack } = useGlobalActions();
  const sizeStack = useGlobalState((c) => c.sizeStack);
  useEffect(() => {
    const addedSize = { ...newSize };
    if (sizeStack.includes(lastSize.current!)) {
      setSizeStack((stack) =>
        stack.map((i) => {
          if (i === lastSize.current) {
            return addedSize;
          }
          return i;
        })
      );
    } else {
      setSizeStack((stack) => [...stack, addedSize]);
    }
    lastSize.current = addedSize;
  }, [newSize.width, newSize.height]);

  useEffect(() => {
    return () => {
      setSizeStack((stack) => stack.filter((i) => i !== lastSize.current));
    };
  }, []);
};
