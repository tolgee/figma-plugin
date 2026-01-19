import { FunctionComponent, h } from "preact";
import { useState, useRef } from "preact/hooks";
import { AutocompleteSelect } from "../AutocompleteSelect/AutocompleteSelect";
import { IconButton } from "@create-figma-plugin/ui";
import { Refresh } from "@/ui/icons/SvgIcons";
import styles from "./NamespaceSelect.css";

type Props = {
  namespaces: string[];
  value: string;
  onChange: (value: string) => void;
  onRefresh?: () => Promise<void> | void;
};

export const NamespaceSelect: FunctionComponent<Props> = ({
  value,
  namespaces,
  onChange,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure all namespaces are included, plus the current value if it's not in the list
  const allNamespaces = [
    ...new Set([
      ...namespaces,
      ...(value && !namespaces.includes(value) ? [value] : []),
    ]),
  ]
    .filter(Boolean)
    .sort((a, b) => {
      // Sort alphabetically, but put empty string at the end
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });

  const handleRefresh = async (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!onRefresh || isRefreshing) return;

    // Store if input was focused before refresh
    const wasFocused = document.activeElement === inputRef.current;

    setIsRefreshing(true);
    try {
      await onRefresh();
      // Reopen the dropdown if it was open before
      if (wasFocused && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
          // Small delay to ensure the options are updated
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
          existingOptionsPlaceholder="Existing namespaces"
          noOptionsPlaceholder="No namespaces found"
          value={value}
          options={allNamespaces}
          placeholder="Add namespace..."
          onChange={onChange}
          displayValue={(v) => v || "<none>"}
          dataCy="general_namespace_select_input"
          singleSelect={true}
          inputRef={inputRef}
        />
        {onRefresh && (
          <IconButton
            onClick={handleRefresh}
            className={`${styles.refreshButton} ${
              isRefreshing ? styles.rotating : ""
            }`}
            title="Refresh namespaces"
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
