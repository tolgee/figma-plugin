import { ComponentChildren, h } from "preact";

import { PartialNodeInfo } from "@/types";
import styles from "./NodeList.css";
import { NodeRow } from "./NodeRow";

type Props<T extends PartialNodeInfo> = {
  nodes: T[];
  actionCallback?: (node: T) => ComponentChildren;
  placeholderNoKey?: ComponentChildren;
  placeholderNoNs?: ComponentChildren;
};

export function NodeList<T extends PartialNodeInfo>({
  nodes,
  actionCallback,
  placeholderNoKey,
  placeholderNoNs,
}: Props<T>) {
  return (
    <div className={styles.container}>
      {nodes?.map((node) => (
        <NodeRow
          key={node.id}
          node={node}
          action={actionCallback?.(node)}
          placeholderNoKey={placeholderNoKey}
          placeholderNoNs={placeholderNoNs}
        />
      ))}
    </div>
  );
}
