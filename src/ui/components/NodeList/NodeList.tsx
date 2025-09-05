import { ComponentChildren, Fragment, h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import styles from "./NodeList.css";
import { NodeRow } from "./NodeRow";

type Props<T extends { id: string }> = {
  items: T[];
  actionCallback?: (item: T) => ComponentChildren;
  keyComponent?: (item: T) => ComponentChildren;
  nsComponent?: (item: T) => ComponentChildren;
  compact?: boolean;
  onClick?: (item: T) => void;
  row?: (node: T) => ComponentChildren;
  virtualized?: boolean;
  rowHeight?: number;
  minVisibleRows?: number;
};

const DEFAULT_ROW_HEIGHT = 60;
const MIN_VISIBLE_ROWS = 8;

export function NodeList<T extends { id: string }>({
  items,
  actionCallback,
  keyComponent,
  nsComponent,
  compact,
  onClick,
  row,
  rowHeight = DEFAULT_ROW_HEIGHT,
  minVisibleRows = MIN_VISIBLE_ROWS,
}: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  // Calculate container height based on available space
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top - 20; // 20px padding
      const calculatedHeight = Math.max(
        minVisibleRows * rowHeight,
        Math.min(availableHeight, items.length * rowHeight)
      );
      setContainerHeight(calculatedHeight);
    }
  }, [items.length, rowHeight, minVisibleRows]);

  // Handle scroll for virtualization
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Render a single item
  const renderItem = (item: T) => {
    if (row) {
      return <Fragment key={item.id}>{row(item)}</Fragment>;
    }

    return (
      <NodeRow
        key={item.id}
        node={item}
        action={actionCallback?.(item)}
        keyComponent={keyComponent?.(item)}
        nsComponent={nsComponent?.(item)}
        compact={compact}
        onClick={onClick ? () => onClick?.(item) : undefined}
      />
    );
  };

  // If we have few items, render normally
  if (items.length <= minVisibleRows) {
    return (
      <div className={styles.container} ref={containerRef}>
        {items?.map(renderItem)}
      </div>
    );
  }

  // Virtualized rendering
  const overscan = 3;
  const visibleStart = Math.floor(scrollTop / rowHeight);
  const visibleEnd = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight)
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);
  const visibleItems = items.slice(startIndex, endIndex + 1);

  const totalHeight = items.length * rowHeight;
  const offsetY = startIndex * rowHeight;

  return (
    <div
      className={styles.container}
      ref={containerRef}
      style={{
        overflow: "auto",
        position: "relative",
      }}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item) => (
            <div
              key={item.id}
              style={{
                width: "100%",
              }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
