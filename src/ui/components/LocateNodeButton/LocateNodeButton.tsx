import { useHighlightNodeMutation } from "@/ui/hooks/useHighlightNodeMutation";
import { h } from "preact";

import styles from "./LocateNodeButton.css";
import { MyLocation } from "@/ui/icons/SvgIcons";

type Props = {
  nodeId: string;
};

export const LocateNodeButton = ({ nodeId }: Props) => {
  const highlightMutation = useHighlightNodeMutation();

  const handleHighlight = () => {
    highlightMutation.mutate({ id: nodeId });
  };

  return (
    <div
      data-cy="index_highlight_button"
      role="button"
      title="Locate on the page"
      onClick={handleHighlight}
      className={styles.highlightButton}
    >
      <MyLocation width={16} height={16} />
    </div>
  );
};
