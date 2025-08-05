import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { emit } from "@/utilities";
import { ResizeHandler, WindowSize } from "@/types";
import { DEFAULT_SIZE, MINIMUM_SIZE } from "@/ui/state/sizes";
import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { ResizeHandleIcon } from "../../icons/SvgIcons";
import classes from "./ResizeHandle.css";

const MIN_WIDTH = MINIMUM_SIZE.width;
const MIN_HEIGHT = MINIMUM_SIZE.height;
const MAX_WIDTH = 800;
const MAX_HEIGHT = 1000;

export const ResizeHandle = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [startSize, setStartSize] = useState<WindowSize | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const handleRef = useRef<HTMLDivElement>(null);
  const { setSizeStack } = useGlobalActions();
  const sizeStack = useGlobalState((c) => c.sizeStack);

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    const currentSize = sizeStack[sizeStack.length - 1] || DEFAULT_SIZE;
    setStartSize(currentSize);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !startPos || !startSize) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    const newWidth = Math.max(
      MIN_WIDTH,
      Math.min(MAX_WIDTH, startSize.width + deltaX)
    );
    const newHeight = Math.max(
      MIN_HEIGHT,
      Math.min(MAX_HEIGHT, startSize.height + deltaY)
    );

    const newSize: WindowSize = { width: newWidth, height: newHeight };
    emit<ResizeHandler>("RESIZE", newSize);

    // Update the global size stack to remember this size
    setSizeStack((stack) => {
      const newStack = [...stack];
      if (newStack.length > 0) {
        newStack[newStack.length - 1] = newSize;
      } else {
        newStack.push(newSize);
      }
      return newStack;
    });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setStartPos(null);
    setStartSize(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, startPos, startSize]);

  return (
    <div
      ref={handleRef}
      className={classes.resizeHandle}
      onMouseDown={handleMouseDown}
      title="Drag to resize"
      role="button"
      aria-label="Resize window"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Focus the handle to show it's interactive
          handleRef.current?.focus();
        }
      }}
    >
      <ResizeHandleIcon style={{ transform: "rotate(45deg)" }} />
    </div>
  );
};
