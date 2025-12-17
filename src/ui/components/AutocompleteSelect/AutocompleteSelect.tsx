import { FunctionComponent, h } from "preact";
import {
  useRef,
  useState,
  useLayoutEffect,
  useMemo,
  useEffect,
} from "preact/hooks";
import { Textbox, Muted } from "@create-figma-plugin/ui";
import { Badge } from "../Badge/Badge";
import styles from "./AutocompleteSelect.css";

type Props =
  | {
      value: string;
      options: string[];
      placeholder?: string;
      existingOptionsPlaceholder?: string;
      noOptionsPlaceholder?: string;
      onChange: (value: string) => void;
      displayValue?: (value: string) => string;
      dataCy?: string;
      singleSelect: true; // When true, shows value in input instead of as badge
      inputRef?: preact.RefObject<HTMLInputElement>; // Expose input ref for external control
    }
  | {
      value: string[];
      options: string[];
      placeholder?: string;
      existingOptionsPlaceholder?: string;
      noOptionsPlaceholder?: string;
      onChange: (value: string[]) => void;
      displayValue?: (value: string) => string;
      dataCy?: string;
      singleSelect?: false; // Multi-select mode
      inputRef?: preact.RefObject<HTMLInputElement>; // Expose input ref for external control
    };

export const AutocompleteSelect: FunctionComponent<Props> = (props) => {
  const {
    options,
    placeholder = "Add...",
    existingOptionsPlaceholder = "Existing options",
    noOptionsPlaceholder = "No options found",
    displayValue = (v) => v || "<none>",
    dataCy,
    singleSelect = false,
    inputRef: externalInputRef,
  } = props;

  const isMultiSelect = !singleSelect;
  const singleValue = singleSelect ? (props.value as string) : "";
  const multiValues = isMultiSelect ? (props.value as string[]) : [];
  const singleOnChange = singleSelect
    ? (props.onChange as (value: string) => void)
    : null;
  const multiOnChange = isMultiSelect
    ? (props.onChange as (value: string[]) => void)
    : null;

  const [inputValue, setInputValue] = useState(
    singleSelect ? singleValue ?? "" : ""
  );
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownDirection, setDropdownDirection] = useState<"down" | "up">(
    "down"
  );

  // For single-select mode, show value in input when not focused, otherwise show inputValue
  // Ensure we always return a string, not undefined
  const displayInputValue = singleSelect
    ? isFocused
      ? inputValue ?? ""
      : singleValue ?? ""
    : inputValue ?? "";

  useLayoutEffect(() => {
    if (!showDropdown || !inputRef.current) return;
    const inputRect = inputRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight || 180;
    const spaceBelow = window.innerHeight - inputRect.bottom - 49; // padding of actionbar
    const spaceAbove = inputRect.top;
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownDirection("up");
    } else {
      setDropdownDirection("down");
    }
  }, [inputValue, showDropdown]);

  // Sync inputValue with value prop when not focused (for single-select mode)
  useEffect(() => {
    if (!singleSelect || isFocused) return;
    // Sync inputValue with value when not focused
    setInputValue(singleValue ?? "");
  }, [singleSelect, singleValue, isFocused]);

  const filteredOptions = useMemo(() => {
    const filtered = options.filter((opt) =>
      opt.toLowerCase().includes(inputValue.toLowerCase())
    );
    // In multi-select mode, exclude already selected values
    if (isMultiSelect) {
      return filtered.filter((opt) => !multiValues.includes(opt));
    }
    return filtered;
  }, [options, inputValue, isMultiSelect, multiValues]);

  const exactMatch = useMemo(() => {
    return filteredOptions.find(
      (opt) => opt.toLowerCase() === inputValue.trim().toLowerCase()
    );
  }, [filteredOptions, inputValue]);

  const alreadyExists = isMultiSelect
    ? multiValues.includes(inputValue.trim()) ||
      options.some(
        (opt) => opt.toLowerCase() === inputValue.trim().toLowerCase()
      )
    : singleValue === inputValue.trim() ||
      options.some(
        (opt) => opt.toLowerCase() === inputValue.trim().toLowerCase()
      );

  const canAdd = inputValue.trim() && !alreadyExists;

  const handleSelect = (selectedValue: string) => {
    if (singleSelect && singleOnChange) {
      singleOnChange(selectedValue);
      setInputValue(selectedValue);
    } else if (isMultiSelect && multiOnChange) {
      multiOnChange([...multiValues, selectedValue]);
      setInputValue("");
    }
    setShowDropdown(false);
    setIsFocused(false);
  };

  const handleAdd = () => {
    const newValue = inputValue.trim();
    if (singleSelect && singleOnChange) {
      if (newValue && newValue !== singleValue) {
        singleOnChange(newValue);
        setInputValue(newValue);
      }
    } else if (isMultiSelect && multiOnChange) {
      if (newValue && !multiValues.includes(newValue)) {
        multiOnChange([...multiValues, newValue]);
        setInputValue("");
      }
    }
    setShowDropdown(false);
    setIsFocused(false);
  };

  const handleRemove = (removedValue?: string) => {
    if (singleSelect && singleOnChange) {
      singleOnChange("");
      setInputValue("");
    } else if (isMultiSelect && multiOnChange && removedValue) {
      multiOnChange(multiValues.filter((v) => v !== removedValue));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (singleSelect && !inputValue) {
      setInputValue(singleValue ?? "");
    }
    setShowDropdown(true);
  };

  const handleBlur = (e: FocusEvent) => {
    // Don't close if clicking on the refresh button or its parent
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest("[data-refresh-button]")) {
      return;
    }

    setIsFocused(false);
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      setShowDropdown(false);
      if (singleSelect) {
        setInputValue(singleValue ?? "");
      }
    }, 200);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {isMultiSelect &&
        multiValues.map((val) => (
          <Badge key={val} bold={true} onRemove={() => handleRemove(val)}>
            {displayValue(val)}
          </Badge>
        ))}
      <div style={{ position: "relative", flex: 1, minWidth: 120 }}>
        <Textbox
          data-cy={dataCy}
          ref={inputRef}
          placeholder={placeholder}
          value={displayInputValue ?? ""}
          variant="border"
          role="combobox"
          aria-expanded={!!inputValue}
          aria-autocomplete="list"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (exactMatch) {
                handleSelect(exactMatch);
              } else if (canAdd) {
                handleAdd();
              }
            } else if (e.key === "Escape") {
              if (singleSelect) {
                setInputValue("");
                setIsFocused(false);
                setShowDropdown(false);
                inputRef.current?.blur();
              }
            }
          }}
        />
        {showDropdown && (
          <div
            ref={dropdownRef}
            className={`${styles.autocompleteDropdown} ${styles[dropdownDirection]}`}
          >
            {filteredOptions.length > 0 ? (
              <div className={styles.autocompleteDropdownHeader}>
                {existingOptionsPlaceholder}
              </div>
            ) : (
              <div className={styles.autocompleteDropdownHeaderEmpty}>
                <Muted>{noOptionsPlaceholder}</Muted>
              </div>
            )}
            {filteredOptions.map((opt) => {
              const matchIndex = opt
                .toLowerCase()
                .indexOf(inputValue.toLowerCase());
              const isExact =
                opt.toLowerCase() === inputValue.trim().toLowerCase();
              if (matchIndex === -1) {
                return (
                  <div
                    key={opt}
                    className={styles.autocompleteDropdownItem}
                    onMouseDown={() => handleSelect(opt)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{displayValue(opt)}</span>
                    {isExact && (
                      <span className={styles.autocompleteDropdownAddHint}>
                        Enter
                      </span>
                    )}
                  </div>
                );
              }
              const before = opt.slice(0, matchIndex);
              const match = opt.slice(
                matchIndex,
                matchIndex + inputValue.length
              );
              const after = opt.slice(matchIndex + inputValue.length);
              return (
                <div
                  key={opt}
                  className={styles.autocompleteDropdownItem}
                  onMouseDown={() => handleSelect(opt)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {before}
                    <b>{match}</b>
                    {after}
                  </span>
                  {isExact && (
                    <span className={styles.autocompleteDropdownAddHint}>
                      Enter
                    </span>
                  )}
                </div>
              );
            })}
            {canAdd && (
              <div
                className={styles.autocompleteDropdownAdd}
                onMouseDown={() => handleAdd()}
              >
                <span>
                  Add <b>"{inputValue}"</b>
                </span>
                <span className={styles.autocompleteDropdownAddHint}>
                  Enter
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
