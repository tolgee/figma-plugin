import { ComponentChildren, h } from "preact";

import { PartialNodeInfo } from "@/types";
import styles from "./NodeRow.css";
import { Badge } from "../Badge/Badge";
import { useInterpolatedTranslation } from "@/ui/hooks/useInterpolatedTranslation";
import { useEffect, useMemo } from "preact/hooks";
import { InfoTooltip } from "../InfoTooltip/InfoTooltip";
import { stringFormatter } from "@/main/utils/textFormattingTools";
import { Edit, X } from "../../icons/SvgIcons";

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

  const { interpolatedTranslation } = useInterpolatedTranslation(
    node.translation ?? node.characters ?? "",
    node.characters ?? "",
    node.isPlural ?? false,
    node.pluralParamValue ?? "1",
    node.paramsValues ?? {},
    node.selectedPluralVariant
  );
  const {
    previewText,
    previewTextIsError,
    interpolatedTranslation: charactersInterpolatedTranslation,
  } = useInterpolatedTranslation(
    node.characters ?? "",
    node.characters ?? "",
    node.isPlural ?? false,
    node.pluralParamValue ?? "1",
    node.paramsValues ?? {},
    node.selectedPluralVariant
  );

  const hasChangesOutsideFromTolgee = useMemo(
    () =>
      charactersInterpolatedTranslation.current !=
        interpolatedTranslation.current &&
      (Object.keys(node.paramsValues ?? {}).length > 0 || node.isPlural),
    [
      interpolatedTranslation.current,
      charactersInterpolatedTranslation.current,
      node.paramsValues,
      node.isPlural,
    ]
  );

  useEffect(() => {
    if (hasChangesOutsideFromTolgee) {
      console.log(
        node.translation,
        stringFormatter(node.translation ?? ""),
        stringFormatter(node.characters ?? "")
      );
    }
  }, [hasChangesOutsideFromTolgee, interpolatedTranslation.current]);

  const infoString =
    "This translation has been changed directly within Figma.\nPlease accept the change to push it to Tolgee or revert it.";

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
              color: previewTextIsError ? "red" : undefined,
              whiteSpace: "pre-wrap",
            }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: previewText ?? "",
            }}
          />

          {hasChangesOutsideFromTolgee && (
            <InfoTooltip
              color="var(--figma-color-bg-brand)"
              items={[
                {
                  label: "Accept translation change",
                  icon: <Edit width={16} height={16} />,
                  onClick: () => {
                    console.log("AHHH");
                  },
                },
                {
                  label: "Revert translation change",
                  icon: <X width={16} height={16} />,
                  onClick: () => {
                    console.log("AHHH");
                  },
                },
              ]}
            >
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
