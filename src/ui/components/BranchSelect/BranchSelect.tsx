import { FunctionComponent, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { IconButton } from "@create-figma-plugin/ui";
import { Refresh } from "@/ui/icons/SvgIcons";
import styles from "./BranchSelect.css";

type Props = {
  branches: Array<{ name: string; isDefault: boolean }>;
  value: string;
  onChange: (value: string) => void;
  onRefresh?: () => Promise<void> | void;
};

export const BranchSelect: FunctionComponent<Props> = ({
  value,
  branches,
  onChange,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const options = useMemo<{ text: string; value: string }[]>(
    () =>
      [...branches]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((b) => ({
          text: b.isDefault ? `${b.name} (default)` : b.name,
          value: b.name,
        })),
    [branches],
  );

  const handleRefresh = async (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <select
        value={
          value && branches.find((b) => b.name === value) ? value : undefined
        }
        onChange={(e) => onChange(e.currentTarget.value)}
        data-cy="general_branch_select_input"
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
      {onRefresh && (
        <IconButton
          onClick={handleRefresh}
          className={`${styles.refreshButton} ${isRefreshing ? styles.rotating : ""}`}
          title="Refresh branches"
          disabled={isRefreshing}
          data-refresh-button
        >
          <Refresh width={16} height={16} />
        </IconButton>
      )}
    </div>
  );
};
