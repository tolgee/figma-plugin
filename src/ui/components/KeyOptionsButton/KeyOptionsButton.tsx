import { h } from "preact";

import styles from "./KeyOptionsButton.css";
import { Edit, More, MyLocation, X } from "@/ui/icons/SvgIcons";
import { useRef } from "preact/hooks";
import Popover from "../Popover/Popover";
import { useHighlightNodeMutation } from "../../hooks/useHighlightNodeMutation";
import { useGlobalActions } from "../../state/GlobalState";
import { NodeInfo } from "../../../types";

type Props = {
  node: NodeInfo;
};

export const KeyOptionsButton = ({ node }: Props) => {
  const moreOptionsRef = useRef<HTMLDivElement>(null);

  const highlightMutation = useHighlightNodeMutation();
  const { setRoute } = useGlobalActions();

  const handleHighlight = () => {
    highlightMutation.mutate({ id: node.id });
  };

  return (
    <div
      data-cy="index_highlight_button"
      role="button"
      title="Locate on the page"
      ref={moreOptionsRef}
      className={styles.highlightButton}
    >
      <More width={16} height={16} />
      <Popover
        popoverTrigger={moreOptionsRef}
        items={[
          {
            label: "String details",
            icon: <Edit width={16} height={16} />,
            onClick: () => {
              setRoute("string_details", { node });
            },
          },
          {
            label: "Move to String",
            icon: <MyLocation width={16} height={16} />,
            onClick: () => {
              handleHighlight();
            },
          },
          {
            label: "Ignore String",
            icon: <X width={16} height={16} />,
            onClick: () => {
              console.log("Ignore String");
            },
          },
        ]}
      />
    </div>
  );
};
