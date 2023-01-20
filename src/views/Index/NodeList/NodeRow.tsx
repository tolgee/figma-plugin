import { h } from "preact";
import clsx from "clsx";

import { useGlobalActions } from "@/state/GlobalState";
import { AddCircle, InsertLink } from "@/icons/SvgIcons";
import { NodeInfo } from "@/types";
import styles from "./NodeRow.css";

type Props = {
  node: NodeInfo;
};

export const NodeRow = ({ node }: Props) => {
  const { setRoute } = useGlobalActions();

  const handleConnect = () => {
    setRoute("connect", { node });
  };

  return (
    <div className={styles.container}>
      <div className={styles.text}>{node.characters}</div>
      <div className={styles.connect}>
        <div
          role="button"
          title={node.key ? "Connect to a key" : "Edit connection"}
          onClick={handleConnect}
          className={styles.connectButton}
        >
          {node.key ? (
            <InsertLink width={16} height={16} />
          ) : (
            <AddCircle width={16} height={16} />
          )}
        </div>
      </div>
      <div className={clsx({ [styles.disabled]: !node.key })}>
        {node.key ? node.key : "not connected"}
      </div>
      <div className={clsx({ [styles.disabled]: !node.ns })}>
        {node.ns || (node.key && "<no namespace>")}
      </div>
    </div>
  );
};
