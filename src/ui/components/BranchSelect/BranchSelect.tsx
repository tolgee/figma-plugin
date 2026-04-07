import { FunctionComponent, h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Dropdown, DropdownOption, IconButton } from "@create-figma-plugin/ui";
import { Branch, Refresh } from "@/ui/icons/SvgIcons";
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

  const options = useMemo<DropdownOption[]>(
    () =>
      [...branches]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((b) => ({
          text: b.isDefault ? `${b.name} (default)` : b.name,
          value: b.name,
        })),
    [branches],
  );

  useEffect(() => {
    console.log("branches", branches);
  }, [branches]);

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
      <Dropdown
        icon={<Branch width={12} height={12} />}
        options={options}
        value={value && branches.find((b) => b.name === value) ? value : null}
        placeholder="Select branch..."
        onValueChange={onChange}
        data-cy="general_branch_select_input"
      />
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
