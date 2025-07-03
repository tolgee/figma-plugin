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
  RadioButtons,
} from "@create-figma-plugin/ui";
import styles from "./Settings.css";
import { TargetedEvent } from "preact/compat";
import { TolgeeConfig } from "@/types";
import { formatString } from "@/utilities";
import { StringsEditor } from "./StringsEditor";
import { TOLGEE_KEY_FORMAT_PLACEHOLDERS } from "@/constants";
import { InfoTooltip } from "../../components/InfoTooltip/InfoTooltip";

function getPreview(
  format: string,
  variableCasing:
    | "snake_case"
    | "camelCase"
    | "PascalCase"
    | "noSpaces"
    | undefined
) {
  let newFormat = format;
  for (const key of Object.keys(TOLGEE_KEY_FORMAT_PLACEHOLDERS)) {
    newFormat = newFormat.replace(
      new RegExp(`\\${key}\\}`, "g"),
      formatString(key, variableCasing)
    );
  }
  return newFormat;
}

export interface StringsSectionProps {
  tolgeeConfig: Partial<TolgeeConfig> & { apiUrl: string };
  setTolgeeConfig: (c: Partial<TolgeeConfig> & { apiUrl: string }) => void;
}

export const StringsSection: FunctionComponent<StringsSectionProps> = ({
  tolgeeConfig,
  setTolgeeConfig,
}) => {
  const [format, setFormat] = useState(
    tolgeeConfig.keyFormat || "{page}.{frame}.{element}"
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
  const [textLayersPrefix, setTextLayersPrefix] = useState("");

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
      variableCasing: "camelCase",
      keyFormat: "{page}.{frame}.{element}",
    });
  };

  function handleTextLayersPrefixChange(value: string): void {
    setTextLayersPrefix(value);
    setTolgeeConfig({ ...tolgeeConfig, textLayersPrefix: value });
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
              Key format{" "}
              <InfoTooltip>
                Start typing or type <strong>ctrl + space</strong> for all
                available placeholders.
              </InfoTooltip>
            </Muted>
            <VerticalSpace space="extraSmall" />

            <StringsEditor
              mode="placeholders"
              value={format}
              onChange={handleFormatChange}
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
          <VerticalSpace space="small" />
          <div>
            <Muted>Variable formatting (optional)</Muted>
            <VerticalSpace space="extraSmall" />
            <div style={{ marginLeft: 16 }}>
              <RadioButtons
                value={tolgeeConfig.variableCasing ?? ""}
                options={[
                  { value: "", children: <Text>none</Text> },
                  { value: "snake_case", children: <Text>snake_case</Text> },
                  { value: "camelCase", children: <Text>camelCase</Text> },
                  { value: "PascalCase", children: <Text>PascalCase</Text> },
                  { value: "noSpaces", children: <Text>nospaces</Text> },
                ]}
                onValueChange={(value) => {
                  if (value === tolgeeConfig.variableCasing) {
                    setTolgeeConfig({
                      ...tolgeeConfig,
                      variableCasing: undefined,
                    });
                  } else {
                    setTolgeeConfig({
                      ...tolgeeConfig,
                      variableCasing:
                        value as (typeof tolgeeConfig)["variableCasing"],
                    });
                  }
                }}
              />
            </div>
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
          value={textLayersPrefix}
          onValueInput={handleTextLayersPrefixChange}
        />
      </div>
    </Fragment>
  );
};
