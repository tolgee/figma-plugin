import { FunctionComponent, h } from "preact";
import { useMemo, useState, useRef } from "preact/hooks";
import { AutocompleteSelect } from "../AutocompleteSelect/AutocompleteSelect";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const branchNames = useMemo(
    () => branches.map((b) => b.name).sort((a, b) => a.localeCompare(b)),
    [branches],
  );

  const defaultBranchName = useMemo(
    () => branches.find((b) => b.isDefault)?.name,
    [branches],
  );

  const handleRefresh = async (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!onRefresh || isRefreshing) return;

    const wasFocused = document.activeElement === inputRef.current;

    setIsRefreshing(true);
    try {
      await onRefresh();
      if (wasFocused && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        }, 100);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <AutocompleteSelect
          existingOptionsPlaceholder="Existing branches"
          noOptionsPlaceholder="No branches found"
          value={value}
          options={branchNames}
          placeholder="Select branch..."
          onChange={onChange}
          displayValue={(v) =>
            v === defaultBranchName ? `${v} (default)` : v
          }
          dataCy="general_branch_select_input"
          singleSelect={true}
          inputRef={inputRef}
        />
        {onRefresh && (
          <IconButton
            onClick={handleRefresh}
            className={`${styles.refreshButton} ${
              isRefreshing ? styles.rotating : ""
            }`}
            title="Refresh branches"
            disabled={isRefreshing}
            data-refresh-button
          >
            <Refresh width={16} height={16} />
          </IconButton>
        )}
      </div>
    </div>
  );
};
