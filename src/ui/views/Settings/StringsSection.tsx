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

function getPreview(
  format: string,
  variableCasing: TolgeeConfig["variableCasing"]
) {
  let newFormat = format;
  for (const key of Object.keys(TOLGEE_KEY_FORMAT_PLACEHOLDERS)) {
    const replaceString = formatString(
      TOLGEE_KEY_FORMAT_PLACEHOLDERS_EXAMPLES[
        key as keyof typeof TOLGEE_KEY_FORMAT_PLACEHOLDERS
      ],
      variableCasing
    );
    if (replaceString === "") {
      newFormat = newFormat.replace(new RegExp(`{${key}}[^{]*`, "g"), "");
    } else {
      newFormat = newFormat.replace(
        new RegExp(`\\{${key}\\}`, "g"),
        replaceString
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
        <li>section (nearest section)</li>
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
  const [format, setFormat] = useState(tolgeeConfig.keyFormat || "");
  const [prefill, setPrefill] = useState(
    tolgeeConfig.prefillKeyFormat ?? false
  );
  const [ignoreNumbers, setIgnoreNumbers] = useState(
    tolgeeConfig.ignoreNumbers ?? false
  );
  const [ignoreHiddenLayers, setIgnoreHiddenLayers] = useState(
    tolgeeConfig.ignoreHiddenLayers ?? false
  );
  const [ignoreTextLayers, setIgnoreTextLayers] = useState(
    tolgeeConfig.ignoreTextLayers ?? false
  );
  const [ignorePrefix, setIgnorePrefix] = useState("");

  const preview = useMemo(() => {
    return getPreview(format, tolgeeConfig.variableCasing);
  }, [format, tolgeeConfig.variableCasing]);

  const handleFormatChange = (val: string) => {
    setFormat(val);
    setTolgeeConfig({ ...tolgeeConfig, keyFormat: val });
  };

  const handlePrefillChange = (e: any) => {
    const checked = e.currentTarget.checked;
    setPrefill(checked);
    setTolgeeConfig({ ...tolgeeConfig, prefillKeyFormat: checked });
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
    event: TargetedEvent<HTMLInputElement, Event>
  ): void {
    setIgnoreNumbers(event.currentTarget.checked);
    setTolgeeConfig({
      ...tolgeeConfig,
      ignoreNumbers: event.currentTarget.checked,
    });
  }

  function handleIgnoreHiddenLayersChange(
    event: TargetedEvent<HTMLInputElement, Event>
  ): void {
    setIgnoreHiddenLayers(event.currentTarget.checked);
    setTolgeeConfig({
      ...tolgeeConfig,
      ignoreHiddenLayers: event.currentTarget.checked,
    });
  }

  function handleTextLayersChange(
    event: TargetedEvent<HTMLInputElement, Event>
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
          <Text style={{ fontSize: "16px" }}>
            <Bold>Strings and keys</Bold>
          </Text>
          <VerticalSpace space="small" />
        </Fragment>
      )}
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
      <VerticalSpace space="small" />
      {prefill && (
        <Fragment>
          <VerticalSpace space="extraSmall" />

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
                  (e.target as HTMLInputElement).value
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
          <VerticalSpace space="small" />
          {preview && (
            <div>
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
        <Text>
          <Bold>numbers</Bold>
        </Text>
      </Checkbox>
      <VerticalSpace space="small" />
      <Checkbox
        value={ignoreHiddenLayers}
        onChange={handleIgnoreHiddenLayersChange}
      >
        <Text>
          <Bold>hidden layers</Bold>
        </Text>
      </Checkbox>
      <div class={styles.textLayers}>
        <Checkbox
          data-cy="settings_checkbox_ignore_text_layers"
          style={{ flex: 0 }}
          value={ignoreTextLayers}
          onChange={handleTextLayersChange}
        >
          <Text>
            <Bold>text layers with prefix</Bold>
          </Text>
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
