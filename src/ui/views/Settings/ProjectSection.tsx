import { h, FunctionComponent, Fragment } from "preact";
import {
  Text,
  Muted,
  VerticalSpace,
  Textbox,
  Button,
} from "@create-figma-plugin/ui";
import { ProjectSettings } from "./ProjectSettings";
import styles from "./Settings.css";

export interface ProjectSectionProps {
  tolgeeConfig: any;
  setTolgeeConfig: (c: any) => void;
  validated: boolean;
  setValidated: (v: boolean) => void;
  handleValidate: () => void;
  error?: string;
}

export const ProjectSection: FunctionComponent<ProjectSectionProps> = ({
  tolgeeConfig,
  setTolgeeConfig,
  validated,
  setValidated,
  handleValidate,
}) => (
  <Fragment>
    <Text>
      <Muted>Tolgee URL</Muted>
    </Text>
    <VerticalSpace space="small" />
    <Textbox
      data-cy="settings_input_api_url"
      onValueInput={(apiUrl) => {
        setValidated(false);
        setTolgeeConfig({ ...tolgeeConfig, apiUrl });
      }}
      value={tolgeeConfig.apiUrl}
      variant="border"
    />
    <VerticalSpace space="medium" />
    <Text>
      <Muted>Tolgee API key</Muted>
    </Text>
    <VerticalSpace space="small" />
    <Textbox
      data-cy="settings_input_api_key"
      onValueInput={(apiKey) => {
        setValidated(false);
        setTolgeeConfig({ ...tolgeeConfig, apiKey });
      }}
      value={tolgeeConfig.apiKey ?? ""}
      variant="border"
    />
    <VerticalSpace space="small" />
    {validated ? (
      <Text className={styles.success}>Credentials valid</Text>
    ) : (
      <Button data-cy="settings_button_validate" onClick={handleValidate}>
        Validate
      </Button>
    )}
    {validated && (
      <ProjectSettings
        apiUrl={tolgeeConfig.apiUrl}
        apiKey={tolgeeConfig.apiKey || ""}
        onChange={(data) => setTolgeeConfig({ ...tolgeeConfig, ...data })}
        initialData={tolgeeConfig}
      />
    )}
  </Fragment>
);
