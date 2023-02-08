import { ComponentChildren, h } from "preact";

import { PartialNodeInfo } from "@/types";
import styles from "./NodeRow.css";

type Props = {
  node: PartialNodeInfo;
  action?: ComponentChildren;
  keyComponent?: ComponentChildren;
  nsComponent?: ComponentChildren;
  compact?: boolean;
};

export const NodeRow = ({
  node,
  action,
  keyComponent,
  nsComponent,
  compact,
}: Props) => {
  const showText = node.characters || !compact || action;

  return (
    <div
      className={styles.container}
      style={{
        gridTemplateColumns: action ? "1fr 1fr auto" : "1fr 1fr",
      }}
    >
      {showText && (
        <div title="Translation text" className={styles.text}>
          {node.characters}
        </div>
      )}
      <div className={styles.action}>{action}</div>
      <div title="Translation key">
        {keyComponent ? keyComponent : node.key}
      </div>
      <div title="Translation namespace">
        {nsComponent
          ? nsComponent
          : node.ns && (
              <span>
                <span className={styles.disabled}>ns:</span>
                {node.ns}
              </span>
            )}
      </div>
    </div>
  );
};
