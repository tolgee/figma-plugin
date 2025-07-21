import { h, FunctionComponent, Fragment } from "preact";
import { useState } from "preact/hooks";
import {
  Text,
  Muted,
  VerticalSpace,
  Textbox,
  Checkbox,
  Bold,
  Button,
  DropdownOption,
  Dropdown,
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

const variableCasingOptions: Array<DropdownOption> = [
  { value: "", text: "Keep original format" },
  { value: "snake_case", text: "snake_case" },
  { value: "camelCase", text: "camelCase" },
  { value: "PascalCase", text: "PascalCase" },
  { value: "noSpaces", text: "nospaces" },
];

export const StringsSection: FunctionComponent<StringsSectionProps> = ({
  tolgeeConfig,
  setTolgeeConfig,
}) => {
  const [format, setFormat] = useState(
    tolgeeConfig.keyFormat || "{page}.{frame}.{elementName}"
  );
  const [prefill, setPrefill] = useState(tolgeeConfig.prefillKeyFormat ?? true);
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

  const handleFormatChange = (val: string) => {
    setFormat(val);
    setTolgeeConfig({ ...tolgeeConfig, keyFormat: val });
  };

  const handlePrefillChange = (e: any) => {
    const checked = e.currentTarget.checked;
    setPrefill(checked);
    setTolgeeConfig({ ...tolgeeConfig, prefillKeyFormat: checked });
  };

  const handleResetPlaceholder = () => {
    handleFormatChange("{page}.{frame}.{element}");
    setTolgeeConfig({
      ...tolgeeConfig,
      variableCasing: "snake_case",
      keyFormat: "{page}.{frame}.{element}",
    });
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
      <Text className={styles.sectionTitle}>Key name</Text>
      <VerticalSpace space="medium" />
      <Checkbox value={prefill} onChange={handlePrefillChange}>
        <Text>
          <Bold>prefill key name</Bold>
        </Text>
      </Checkbox>
      <VerticalSpace space="small" />
      {prefill && (
        <Fragment>
          <VerticalSpace space="extraSmall" />

          <div>
            <Muted
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              Key format <InfoTooltip>{keyFormatHelpText}</InfoTooltip>
            </Muted>
            <VerticalSpace space="extraSmall" />

            <StringsEditor value={format} onChange={handleFormatChange} />
          </div>
          <VerticalSpace space="small" />
          <div>
            <Muted
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              Formatting style{" "}
              <InfoTooltip>{formattingStyleHelpText}</InfoTooltip>
            </Muted>
            <VerticalSpace space="extraSmall" />

            <Dropdown
              style={{ justifyContent: "space-between" }}
              options={variableCasingOptions}
              value={tolgeeConfig.variableCasing ?? ""}
              onValueChange={handleVariableCasingChange}
              variant="border"
            />
          </div>
          <VerticalSpace space="small" />
          <div>
            <Muted>Preview</Muted>
            <VerticalSpace space="extraSmall" />

            <Muted>
              <Bold>{getPreview(format, tolgeeConfig.variableCasing)}</Bold>
            </Muted>
          </div>
          <VerticalSpace space="medium" />
          <Button secondary onClick={() => handleResetPlaceholder()}>
            <Text>Default</Text>
          </Button>
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
          style={{ flex: 0 }}
          value={ignoreTextLayers}
          onChange={handleTextLayersChange}
        >
          <Text>
            <Bold>text layers with prefix</Bold>
          </Text>
        </Checkbox>
        <Textbox
          style={{ flex: 1, cursor: "text" }}
          variant="border"
          value={ignorePrefix}
          onValueInput={handleIgnorePrefixChange}
        />
      </div>
    </Fragment>
  );
};
