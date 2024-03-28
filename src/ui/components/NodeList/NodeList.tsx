import { ComponentChildren, h } from "preact";

import { PartialNodeInfo } from "@/types";
import styles from "./NodeList.css";
import { NodeRow } from "./NodeRow";
import { useEffect, useRef } from "preact/hooks";

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
  onBottomReached,
}: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current!;
    const handler = () => {
      if (el.scrollTop === el.scrollHeight - el.offsetHeight) {
        onBottomReached?.();
      }
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [containerRef.current, onBottomReached]);

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
