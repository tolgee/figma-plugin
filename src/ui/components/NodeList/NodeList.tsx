import { ComponentChildren, h } from "preact";

import { PartialNodeInfo } from "@/types";
import styles from "./NodeList.css";
import { NodeRow } from "./NodeRow";
import { useRef } from "preact/hooks";

type Props<T extends PartialNodeInfo> = {
  nodes: T[];
  actionCallback?: (node: T) => ComponentChildren;
  keyComponent?: (node: T) => ComponentChildren;
  nsComponent?: (node: T) => ComponentChildren;
  compact?: boolean;
  onBottomReached?: () => void;
};

export function NodeList<T extends PartialNodeInfo>({
  nodes,
  actionCallback,
  keyComponent,
  nsComponent,
  compact,
}: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.container} ref={containerRef}>
      {nodes?.map((node) => (
        <NodeRow
          key={node.id}
          node={node}
          action={actionCallback?.(node)}
          keyComponent={keyComponent?.(node)}
          nsComponent={nsComponent?.(node)}
          compact={compact}
        />
      ))}
    </div>
  );
}
