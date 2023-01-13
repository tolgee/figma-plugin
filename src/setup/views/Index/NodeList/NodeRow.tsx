import { Fragment, h } from "preact";
import { NodeInfo, SetNodeConnectionHandler } from "@/types";
import { Button, Textbox } from "@create-figma-plugin/ui";
import { useGlobalActions, useGlobalState } from "@/setup/state/GlobalState";
import { emit } from "@create-figma-plugin/utilities";
import { InsertLink } from "@/setup/icons/SvgIcons";

import styles from "./NodeList.css";

type Props = {
  node: NodeInfo;
};

export const NodeRow = ({ node }: Props) => {
  const { setEditedKey } = useGlobalActions();
  const editedKeyText = useGlobalState((c) => c.editedKeys[node.id] || "");

  const handleConnect = () => {
    emit<SetNodeConnectionHandler>(
      "SET_NODE_CONNECTION",
      node.id,
      editedKeyText
    );
  };

  const handleNodeDisconnect = () => {
    setEditedKey(node.id, "");
    emit<SetNodeConnectionHandler>("SET_NODE_CONNECTION", node.id, "");
  };

  return (
    <Fragment key={node.id}>
      <div className={styles.row_text}>{node.characters}</div>
      <div className={styles.row_key}>
        {node.key ? (
          node.key
        ) : (
          <Textbox
            variant="border"
            placeholder="No key connected"
            value={editedKeyText}
            onChange={(e) =>
              setEditedKey(node.id, (e.target as HTMLInputElement).value)
            }
          />
        )}
      </div>
      {node.key ? (
        <div className={styles.row_connect} title="Disconnect">
          <Button
            secondary
            onClick={handleNodeDisconnect}
            className={styles.key_present}
          >
            <InsertLink width={16} height={16} />
          </Button>
        </div>
      ) : (
        <div className={styles.row_connect} title="Connect to a key">
          <Button
            secondary
            onClick={handleConnect}
            className={styles.key_missing}
            disabled={!editedKeyText}
          >
            <InsertLink width={16} height={16} />
          </Button>
        </div>
      )}
    </Fragment>
  );
};
