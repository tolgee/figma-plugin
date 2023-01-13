import { h } from "preact";

import { NodeInfo } from "@/types";
import styles from "./NodeList.css";
import { NodeRow } from "./NodeRow";

type Props = {
  nodes: NodeInfo[];
};

export const NodeList = ({ nodes }: Props) => {
  return (
    <div className={styles.container}>
      {nodes?.map((node) => (
        <NodeRow key={node.id} node={node} />
      ))}
    </div>
  );
};
