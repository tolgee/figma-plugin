import { ComponentChildren, h } from "preact";

import { PartialNodeInfo } from "@/types";
import styles from "./NodeRow.css";
import { Badge } from "../Badge/Badge";
import { useInterpolatedTranslation } from "@/ui/hooks/useInterpolatedTranslation";
import { InfoTooltip } from "../InfoTooltip/InfoTooltip";
import DOMPurify from "dompurify";

type Props = {
  node: PartialNodeInfo;
  action?: ComponentChildren;
  keyComponent?: ComponentChildren;
  nsComponent?: ComponentChildren;
  compact?: boolean;
  onClick?: () => void;
};

export const NodeRow = ({
  node,
  action,
  keyComponent,
  nsComponent,
  compact,
  onClick,
}: Props) => {
  const showText = node.characters || !compact || action;

  const { translationDiffersFromNode } = useInterpolatedTranslation(node);

  const infoString =
    "Manual changes have been detected.\nGo to details to see more.";

  return (
    <div
      data-cy="general_node_list_row"
      className={styles.container}
      style={{
        gridTemplateColumns: action ? "1fr 1fr auto" : "1fr 1fr",
        cursor: onClick ? "pointer" : "default",
      }}
      role={onClick ? "button" : undefined}
      onClick={onClick}
    >
      {showText && (
        <div
          title="Translation text"
          className={styles.text}
          data-cy="general_node_list_row_text"
        >
          {/* eslint-disable-next-line react/no-danger */}
          <span
            style={{
              whiteSpace: "pre-wrap",
            }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(node.characters ?? ""),
            }}
          />

          {translationDiffersFromNode && (
            <InfoTooltip rotated color="var(--figma-color-bg-brand)">
              {infoString}
            </InfoTooltip>
          )}
          {node.isPlural && <Badge>plural</Badge>}
          {Object.keys(node.paramsValues ?? {}).length > 0 && (
            <Badge>parameters</Badge>
          )}
        </div>
      )}
      <div className={styles.action} data-cy="general_node_list_row_action">
        {action}
      </div>
      <div
        title="Translation key"
        data-cy="general_node_list_row_key"
        className={styles.key}
      >
        {keyComponent ? keyComponent : node.key}
      </div>
      <div
        title="Translation namespace"
        data-cy="general_node_list_row_namespace"
      >
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
