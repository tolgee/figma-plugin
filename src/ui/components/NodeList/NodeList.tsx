import { ComponentChildren, h } from "preact";

import styles from "./NodeList.css";
import { NodeRow } from "./NodeRow";
import { useRef } from "preact/hooks";

type Props<T extends { id: string }> = {
  items: T[];
  actionCallback?: (item: T) => ComponentChildren;
  keyComponent?: (item: T) => ComponentChildren;
  nsComponent?: (item: T) => ComponentChildren;
  compact?: boolean;
  onClick?: (item: T) => void;
  onBottomReached?: () => void;
};

export function NodeList<T extends { id: string }>({
  items,
  actionCallback,
  keyComponent,
  nsComponent,
  compact,
  onClick,
}: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.container} ref={containerRef}>
      {items?.map((item) => (
        <NodeRow
          key={item.id}
          node={item}
          action={actionCallback?.(item)}
          keyComponent={keyComponent?.(item)}
          nsComponent={nsComponent?.(item)}
          compact={compact}
          onClick={onClick ? () => onClick?.(item) : undefined}
        />
      ))}
    </div>
  );
}
