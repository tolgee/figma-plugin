import { h, FunctionComponent, Fragment } from "preact";
import { useEffect, useState, useMemo } from "preact/hooks";
import { Bold, Checkbox, Text, VerticalSpace } from "@create-figma-plugin/ui";
import { TolgeeConfig } from "@/types";
import { AutocompleteSelect } from "../../components/AutocompleteSelect/AutocompleteSelect";
import { useAllTags } from "../../hooks/useAllTags";

export interface PushSectionProps {
  showHeadline: boolean;
  tolgeeConfig: Partial<TolgeeConfig> & { apiUrl: string };
  setTolgeeConfig: (c: Partial<TolgeeConfig> & { apiUrl: string }) => void;
  onTagsChange?: (tags: string[]) => void;
}

export const PushSection: FunctionComponent<PushSectionProps> = ({
  showHeadline,
  tolgeeConfig,
  setTolgeeConfig,
  onTagsChange,
}) => {
  const [tags, setTags] = useState<string[]>(tolgeeConfig.tags || []);

  const allTags = useAllTags();

  // Get tag names as options
  const tagOptions = useMemo(() => {
    return allTags.tagsData
      .map((t) => t.name)
      .sort((a, b) => a.localeCompare(b));
  }, [allTags.tagsData]);

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

  return (
    <Fragment>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {showHeadline && (
          <Fragment>
            <Text style={{ fontSize: "14px" }}>
              <Bold>Push</Bold>
            </Text>
          </Fragment>
        )}
        <VerticalSpace space="medium" />
        <Checkbox
          data-cy="settings_checkbox_update_screenshots"
          value={tolgeeConfig.updateScreenshots ?? true}
          onChange={(e) =>
            setTolgeeConfig({
              ...tolgeeConfig,
              updateScreenshots: e.currentTarget.checked,
            })
          }
        >
          <Text>Update screenshots</Text>
        </Checkbox>
        <VerticalSpace space="small" />
        <Checkbox
          data-cy="settings_checkbox_add_tags"
          value={tolgeeConfig.addTags ?? false}
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
            <AutocompleteSelect
              value={tags}
              options={tagOptions}
              placeholder="Add tag..."
              existingOptionsPlaceholder="Tags existing in project"
              noOptionsPlaceholder="No tags found"
              onChange={setTags}
              dataCy="settings_input_tag"
              singleSelect={false}
            />
          </div>
        )}
      </div>
    </Fragment>
  );
};
