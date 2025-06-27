import { h, FunctionComponent } from "preact";
import {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useMemo,
} from "preact/hooks";
import {
  Checkbox,
  Muted,
  Text,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { TolgeeConfig } from "@/types";
import { Badge } from "../../components/Badge/Badge";
import styles from "./Settings.css";
import { useAllTags } from "../../hooks/useAllTags";

export interface PushSectionProps {
  tolgeeConfig: Partial<TolgeeConfig> & { apiUrl: string };
  setTolgeeConfig: (c: Partial<TolgeeConfig> & { apiUrl: string }) => void;
  onTagsChange?: (tags: string[]) => void;
}

export const PushSection: FunctionComponent<PushSectionProps> = ({
  tolgeeConfig,
  setTolgeeConfig,
  onTagsChange,
}) => {
  const [tags, setTags] = useState<string[]>(tolgeeConfig.tags || ["figma"]);
  const [tagInput, setTagInput] = useState("");
  const [showTagDropDown, setShowTagDropDown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownDirection, setDropdownDirection] = useState<"down" | "up">(
    "down"
  );
  useLayoutEffect(() => {
    if (!showTagDropDown || !inputRef.current) return;
    const inputRect = inputRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight || 180;
    const spaceBelow = window.innerHeight - inputRect.bottom - 49; // padding of actionbar
    const spaceAbove = inputRect.top;
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownDirection("up");
    } else {
      setDropdownDirection("down");
    }
  }, [tagInput, showTagDropDown]);

  const allTags = useAllTags();

  const filteredTags = useMemo(() => {
    return allTags.tagsData.filter(
      (t) =>
        t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tags.includes(t.name)
    );
  }, [allTags.tagsData, tagInput, tags]);

  useEffect(() => {
    allTags.getData().catch((e) => {
      console.error("Error loading tags", e);
    });
  }, []);

  useEffect(() => {
    setTolgeeConfig({ ...tolgeeConfig, tags });
    if (onTagsChange) onTagsChange(tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags]);

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Checkbox
        value={tolgeeConfig.updateScreenshots ?? true}
        checked={tolgeeConfig.updateScreenshots ?? true}
        onChange={(e) =>
          setTolgeeConfig({
            ...tolgeeConfig,
            updateScreenshots: e.currentTarget.checked,
          })
        }
      >
        <Text>Update screenshots</Text>
      </Checkbox>
      <Checkbox
        value={tolgeeConfig.addTags ?? false}
        checked={tolgeeConfig.addTags ?? false}
        onChange={(e) => {
          setTolgeeConfig({
            ...tolgeeConfig,
            addTags: e.currentTarget.checked,
          });
          allTags.getData();
        }}
      >
        <Text>Add tags</Text>
      </Checkbox>
      {(tolgeeConfig.addTags ?? false) && (
        <div>
          <VerticalSpace space="small" />
          <Text style={{ fontSize: "14px" }}>Tags</Text>
          <VerticalSpace space="extraSmall" />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              margin: "8px 0",
            }}
          >
            {tags.map((tag) => (
              <Badge
                bold={true}
                onRemove={() => handleRemoveTag(tag)}
                key={tag}
              >
                {tag}
              </Badge>
            ))}
            <div style={{ position: "relative", flex: 1, minWidth: 120 }}>
              <Textbox
                ref={inputRef}
                placeholder="Add tag..."
                value={tagInput}
                variant="border"
                onFocus={() => {
                  setShowTagDropDown(true);
                }}
                onBlur={() => {
                  setShowTagDropDown(false);
                }}
                onChange={(e) => setTagInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTag();
                }}
              />
              {showTagDropDown && (
                <div
                  ref={dropdownRef}
                  className={`${styles.tagAutocompleteDropdown} ${styles[dropdownDirection]}`}
                >
                  {filteredTags.length > 0 ? (
                    <div className={styles.tagAutocompleteDropdownHeader}>
                      Tags existing in project
                    </div>
                  ) : (
                    <div className={styles.tagAutocompleteDropdownHeaderEmpty}>
                      <Muted>No tags found</Muted>
                    </div>
                  )}
                  {filteredTags.map((t) => {
                    const matchIndex = t.name
                      .toLowerCase()
                      .indexOf(tagInput.toLowerCase());
                    const isExact =
                      t.name.toLowerCase() === tagInput.trim().toLowerCase();
                    if (matchIndex === -1) {
                      return (
                        <div
                          key={t.id}
                          className={styles.tagAutocompleteDropdownItem}
                          onMouseDown={() => {
                            setTags([...tags, t.name]);
                            setTagInput("");
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{t.name}</span>
                          {isExact && (
                            <span
                              className={styles.tagAutocompleteDropdownAddHint}
                            >
                              Enter
                            </span>
                          )}
                        </div>
                      );
                    }
                    const before = t.name.slice(0, matchIndex);
                    const match = t.name.slice(
                      matchIndex,
                      matchIndex + tagInput.length
                    );
                    const after = t.name.slice(matchIndex + tagInput.length);
                    return (
                      <div
                        key={t.id}
                        className={styles.tagAutocompleteDropdownItem}
                        onMouseDown={() => {
                          setTags([...tags, t.name]);
                          setTagInput("");
                        }}
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
                          <span
                            className={styles.tagAutocompleteDropdownAddHint}
                          >
                            Enter
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {(() => {
                    const alreadyExists =
                      tags.includes(tagInput.trim()) ||
                      allTags.tagsData.some(
                        (t) =>
                          t.name.toLowerCase() === tagInput.trim().toLowerCase()
                      );
                    if (!tagInput || alreadyExists) return null;
                    return (
                      <div
                        className={styles.tagAutocompleteDropdownAdd}
                        onMouseDown={() => {
                          if (!alreadyExists) handleAddTag();
                        }}
                        style={{
                          opacity: alreadyExists ? 0.5 : 1,
                          pointerEvents: alreadyExists ? "none" : "auto",
                        }}
                      >
                        <span>
                          Add <b>"{tagInput}"</b>
                        </span>
                        <span className={styles.tagAutocompleteDropdownAddHint}>
                          Enter
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
