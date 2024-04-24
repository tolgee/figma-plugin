import { h } from "preact";

import styles from "./DeselectNodeButton.css";
import { RemoveFromList } from "@/ui/icons/SvgIcons";
import { useDeselectNodeMutation } from "@/ui/hooks/useDeselectNodeMutation";

type Props = {
  nodeId: string;
};

export const DeselectNodeButton = ({ nodeId }: Props) => {
  const deselectMutation = useDeselectNodeMutation();

  const handleDeselect = () => {
    deselectMutation.mutate({ id: nodeId });
  };

  return (
    <div
      data-cy="index_deselect_button"
      role="button"
      title="Remove from selection"
      onClick={handleDeselect}
      className={styles.deselectButton}
    >
      <RemoveFromList width={16} height={16} />
    </div>
  );
};
