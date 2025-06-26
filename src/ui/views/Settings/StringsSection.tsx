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
} from "@create-figma-plugin/ui";
import styles from "./Settings.css";
import { TargetedEvent } from "preact/compat";
import { TolgeeConfig } from "@/types";

function getPreview(format: string) {
  return format
    .replace(/\[%page\]/g, "Registration")
    .replace(/\[%frame\]/g, "frame")
    .replace(/\[%element\]/g, "button")
    .replace(/\[%component\]/g, "component")
    .replace(/\[%section\]/g, "section");
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
    tolgeeConfig.keyFormat || "[%page].[%frame].[%element]"
  );
  const [prefill, setPrefill] = useState(tolgeeConfig.prefillKeyName ?? true);
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
    setTolgeeConfig({ ...tolgeeConfig, prefillKeyName: checked });
  };

  const handleResetPlaceholder = () => {
    handleFormatChange("[%page].[%frame].[%element]");
    setTolgeeConfig({
      ...tolgeeConfig,
      keyFormat: "[%page].[%frame].[%element]",
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
          <div className={styles.keyFormat}>
            <div>
              <Muted>Key format</Muted>
              <VerticalSpace space="extraSmall" />

              <Textbox
                value={format}
                onValueInput={handleFormatChange}
                variant="border"
                style={{ cursor: "text" }}
                placeholder="[%page].[%frame].[%element]"
              />
            </div>
            <div>
              <Muted>Preview</Muted>
              <VerticalSpace space="extraSmall" />

              <Muted>
                <Bold>{getPreview(format)}</Bold>
              </Muted>
            </div>
          </div>
          <VerticalSpace space="extraSmall" />
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
