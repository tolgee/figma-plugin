import { h, FunctionComponent, Fragment } from "preact";
import { useMemo, useState } from "preact/hooks";
import {
  Text,
  Muted,
  VerticalSpace,
  Textbox,
  Checkbox,
  Bold,
  Inline,
} from "@create-figma-plugin/ui";
import { useQueryClient } from "react-query";
import styles from "./Settings.css";
import { TargetedEvent } from "preact/compat";
import { TolgeeConfig } from "@/types";
import { formatString } from "@/utilities";
import { StringsEditor } from "./StringsEditor";
import {
  TOLGEE_KEY_FORMAT_PLACEHOLDERS,
  TOLGEE_KEY_FORMAT_PLACEHOLDERS_EXAMPLES,
} from "@/constants";
import { InfoTooltip } from "../../components/InfoTooltip/InfoTooltip";
import { clearPrefilledKeysEndpoint } from "@/main/endpoints/clearPrefilledKeys";
import { getConnectedNodesEndpoint } from "@/main/endpoints/getConnectedNodes";

function getPreview(
  format: string,
  variableCasing: TolgeeConfig["variableCasing"],
) {
  let newFormat = format;
  for (const key of Object.keys(TOLGEE_KEY_FORMAT_PLACEHOLDERS)) {
    const replaceString = formatString(
      TOLGEE_KEY_FORMAT_PLACEHOLDERS_EXAMPLES[
        key as keyof typeof TOLGEE_KEY_FORMAT_PLACEHOLDERS
      ],
      variableCasing,
    );
    if (replaceString === "") {
      newFormat = newFormat.replace(new RegExp(`{${key}}[^{]*`, "g"), "");
    } else {
      newFormat = newFormat.replace(
        new RegExp(`\\{${key}\\}`, "g"),
        replaceString,
      );
    }
  }
  return newFormat;
}

export interface StringsSectionProps {
  showHeadline: boolean;
  tolgeeConfig: Partial<TolgeeConfig> & { apiUrl: string };
  setTolgeeConfig: (c: Partial<TolgeeConfig> & { apiUrl: string }) => void;
}

const keyFormatHelpText = (
  <Fragment>
    <div>
      Define your key format to be consistent and fast.
      <br />
      You can use variables, text and separators.
      <br />
      Variables will allow you to use names (values) of Figma structure:
      <br />
      <ul>
        <li>element name (name of the string)</li>
        <li>...</li>
        <li>section (name of thenearest section)</li>
        <li>separtators can be “.” “:” “_” “-” etc.</li>
      </ul>
      <br />
      Read more in our guide{" "}
      <a
        href="https://docs.tolgee.io/blog/naming-translation-keys"
        target="_blank"
        rel="noreferrer"
      >
        How to name translation keys
      </a>
      .
    </div>
  </Fragment>
);

const hiddenLayersHelpText = (
  <Fragment>
    <div>
      Skips layers with visibility turned off in Figma.
      <br />
      <br />
      With "Including all child texts" enabled,
      <br />
      all text layers inside hidden layers are
      <br />
      also ignored, even if individually set to visible.
      <br />
      <br />
      Otherwise, only the hidden layer itself is ignored.
    </div>
  </Fragment>
);

const formattingStyleHelpText = (
  <Fragment>
    <div>
      This will help you preserve the same format style.
      <br />
      Your style will be automatically applied to the variables.
      <br />
      <br />
      E.g. style "element_name"
      <br />
      "My cool button"→"my_cool_button"
    </div>
  </Fragment>
);

const variableCasingOptions: Array<{ value: string; text: string }> = [
  { value: "", text: "keep original format" },
  { value: "snake_case", text: "element_name" },
  { value: "snake_case_capitalized", text: "Element_name" },
  { value: "camelCase", text: "elementName" },
  { value: "PascalCase", text: "ElementName" },
  { value: "noSpaces", text: "elementname" },
];

export const StringsSection: FunctionComponent<StringsSectionProps> = ({
  showHeadline,
  tolgeeConfig,
  setTolgeeConfig,
}) => {
  const queryClient = useQueryClient();
  const [format, setFormat] = useState(tolgeeConfig.keyFormat || "");
  const [prefill, setPrefill] = useState(
    tolgeeConfig.prefillKeyFormat ?? false,
  );
  const [ignoreNumbers, setIgnoreNumbers] = useState(
    tolgeeConfig.ignoreNumbers ?? true,
  );
  const [ignoreHiddenLayers, setIgnoreHiddenLayers] = useState(
    tolgeeConfig.ignoreHiddenLayers ?? true,
  );
  const [
    ignoreHiddenLayersIncludingChildren,
    setIgnoreHiddenLayersIncludingChildren,
  ] = useState(tolgeeConfig.ignoreHiddenLayersIncludingChildren ?? false);

  const [ignoreTextLayers, setIgnoreTextLayers] = useState(
    tolgeeConfig.ignoreTextLayers ?? false,
  );
  const [ignorePrefix, setIgnorePrefix] = useState(
    tolgeeConfig.ignorePrefix ?? "",
  );

  const preview = useMemo(() => {
    try {
      return getPreview(format, tolgeeConfig.variableCasing);
    } catch (error) {
      console.error("Preview generation error:", error);
      return format;
    }
  }, [format, tolgeeConfig.variableCasing]);

  const handleFormatChange = (val: string) => {
    setFormat(val);
    setTolgeeConfig({ ...tolgeeConfig, keyFormat: val });
  };

  const handlePrefillChange = async (e: any) => {
    const checked = e.currentTarget.checked;
    setPrefill(checked);
    setTolgeeConfig({ ...tolgeeConfig, prefillKeyFormat: checked });
    if (!checked) {
      // Drop auto-prefilled values that were persisted to node pluginData while
      // the toggle was on so they don't keep showing up after disabling.
      try {
        await clearPrefilledKeysEndpoint.call();
        queryClient.invalidateQueries([getConnectedNodesEndpoint.name]);
      } catch (err) {
        console.error("Failed to clear prefilled keys", err);
      }
    }
  };

  const handleVariableCasingChange = (value: string) => {
    setTolgeeConfig({
      ...tolgeeConfig,
      variableCasing: value as (typeof tolgeeConfig)["variableCasing"],
    });
  };

  function handleIgnorePrefixChange(value: string): void {
    setIgnorePrefix(value);
    setTolgeeConfig({ ...tolgeeConfig, ignorePrefix: value });
  }

  function handleIgnoreNumbersChange(
    event: TargetedEvent<HTMLInputElement, Event>,
  ): void {
    setIgnoreNumbers(event.currentTarget.checked);
    setTolgeeConfig({
      ...tolgeeConfig,
      ignoreNumbers: event.currentTarget.checked,
    });
  }

  function handleIgnoreHiddenLayersChange(
    event: TargetedEvent<HTMLInputElement, Event>,
  ): void {
    setIgnoreHiddenLayers(event.currentTarget.checked);
    setTolgeeConfig({
      ...tolgeeConfig,
      ignoreHiddenLayers: event.currentTarget.checked,
    });
  }

  function handleIgnoreHiddenLayersIncludingChildrenChange(
    event: TargetedEvent<HTMLInputElement, Event>,
  ): void {
    setIgnoreHiddenLayersIncludingChildren(event.currentTarget.checked);
    setTolgeeConfig({
      ...tolgeeConfig,
      ignoreHiddenLayersIncludingChildren: event.currentTarget.checked,
    });
  }

  function handleTextLayersChange(
    event: TargetedEvent<HTMLInputElement, Event>,
  ): void {
    setIgnoreTextLayers(event.currentTarget.checked);
    setTolgeeConfig({
      ...tolgeeConfig,
      ignoreTextLayers: event.currentTarget.checked,
    });
  }

  return (
    <Fragment>
      {showHeadline && (
        <Fragment>
          <Text style={{ fontSize: "14px" }}>
            <Bold>Strings and keys</Bold>
          </Text>
        </Fragment>
      )}
      <VerticalSpace space="medium" />
      <Text className={styles.sectionTitle}>Key name</Text>
      <VerticalSpace space="medium" />
      <Checkbox
        value={prefill}
        data-cy="settings_checkbox_prefill_key_name"
        onChange={handlePrefillChange}
      >
        <Text>
          <Bold>prefill key name</Bold>
        </Text>
      </Checkbox>
      {prefill && (
        <Fragment>
          <VerticalSpace space="small" />

          <div>
            <Inline className={styles.headerRow}>
              <Muted
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                Key format
              </Muted>
              <InfoTooltip>{keyFormatHelpText}</InfoTooltip>
            </Inline>
            <VerticalSpace space="extraSmall" />
            <StringsEditor value={format} onChange={handleFormatChange} />
          </div>
          <VerticalSpace space="small" />
          <div>
            <Inline className={styles.headerRow}>
              <Muted
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                Formatting style
              </Muted>
              <InfoTooltip>{formattingStyleHelpText}</InfoTooltip>
            </Inline>
            <VerticalSpace space="extraSmall" />

            <select
              data-cy="settings_dropdown_variable_casing"
              value={tolgeeConfig.variableCasing ?? ""}
              onChange={(e) => {
                handleVariableCasingChange(
                  (e.target as HTMLInputElement).value,
                );
              }}
            >
              {variableCasingOptions.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.text}
                </option>
              ))}
            </select>
          </div>
          {preview && (
            <div>
              <VerticalSpace space="small" />
              <Muted>Preview</Muted>
              <VerticalSpace space="extraSmall" />

              <Muted data-cy="settings_text_preview">
                <Bold>{preview}</Bold>
              </Muted>
            </div>
          )}
        </Fragment>
      )}
      <VerticalSpace space="medium" />
      <Text className={styles.sectionTitle}>Ignore strings</Text>
      <VerticalSpace space="medium" />
      <Checkbox value={ignoreNumbers} onChange={handleIgnoreNumbersChange}>
        <Text>numbers</Text>
      </Checkbox>
      <VerticalSpace space="small" />
      <Inline style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Checkbox
          value={ignoreHiddenLayers}
          onChange={handleIgnoreHiddenLayersChange}
        >
          <Text>hidden layers</Text>
        </Checkbox>
        <InfoTooltip>{hiddenLayersHelpText}</InfoTooltip>
      </Inline>
      {ignoreHiddenLayers && (
        <Fragment>
          <VerticalSpace space="small" />
          <div style={{ paddingLeft: "20px" }}>
            <Checkbox
              value={ignoreHiddenLayersIncludingChildren}
              onChange={handleIgnoreHiddenLayersIncludingChildrenChange}
            >
              <Text>including all child texts</Text>
            </Checkbox>
          </div>
        </Fragment>
      )}
      <div class={styles.textLayers}>
        <Checkbox
          data-cy="settings_checkbox_ignore_text_layers"
          style={{ flex: 0 }}
          value={ignoreTextLayers}
          onChange={handleTextLayersChange}
        >
          <Text>text layers with prefix</Text>
        </Checkbox>
        <Textbox
          data-cy="settings_input_ignore_prefix"
          style={{ flex: 1, cursor: "text" }}
          variant="border"
          value={ignorePrefix}
          onValueInput={handleIgnorePrefixChange}
        />
      </div>
    </Fragment>
  );
};
