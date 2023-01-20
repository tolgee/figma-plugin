import { ComponentChildren, h } from "preact";

import { PartialNodeInfo } from "@/types";
import styles from "./NodeRow.css";

type Props = {
  node: PartialNodeInfo;
  action?: ComponentChildren;
  placeholderNoKey?: ComponentChildren;
  placeholderNoNs?: ComponentChildren;
  compact?: boolean;
};

export const NodeRow = ({
  node,
  action,
  placeholderNoKey,
  placeholderNoNs,
  compact,
}: Props) => {
  return (
    <div
      className={styles.container}
      style={{
        gridTemplateColumns: action ? "1fr 1fr auto" : "1fr 1fr",
      }}
    >
      {node.characters && !action && !compact && (
        <div title="Translation text" className={styles.text}>
          {node.characters}
        </div>
      )}
      <div className={styles.action}>{action}</div>
      <div title="Translation key">
        {node.key ? node.key : placeholderNoKey}
      </div>
      <div title="Translation namespace">
        {node.ns || (node.key && placeholderNoNs)}
      </div>
    </div>
  );
};
