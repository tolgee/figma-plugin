import { h, FunctionComponent, Fragment } from "preact";
import {
  Text,
  Muted,
  VerticalSpace,
  Textbox,
  Button,
  Bold,
} from "@create-figma-plugin/ui";
import { ProjectSettings } from "./ProjectSettings";
import styles from "./Settings.css";
import { CheckCircle } from "@/ui/icons/SvgIcons";

export interface ProjectSectionProps {
  showHeadline: boolean;
  tolgeeConfig: any;
  setTolgeeConfig: (c: any) => void;
  validated: boolean;
  projectName: string | undefined;
  projectId: number | undefined;
  setValidated: (v: boolean) => void;
  handleValidate: () => void;
  error?: string;
}

export const ProjectSection: FunctionComponent<ProjectSectionProps> = ({
  showHeadline,
  tolgeeConfig,
  setTolgeeConfig,
  validated,
  projectName,
  projectId,
  setValidated,
  handleValidate,
}) => (
  <Fragment>
    {showHeadline && (
      <Fragment>
        <Text style={{ fontSize: "14px" }}>
          <Bold>Project</Bold>
        </Text>
      </Fragment>
    )}
    <VerticalSpace space="medium" />
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
      <Muted>Tolgee Project API key</Muted>
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
      <Text className={styles.success}>
        <CheckCircle height={16} width={16} />{" "}
        <a
          href={`${tolgeeConfig.apiUrl}/projects/${projectId}`}
          target="_blank"
          rel="noreferrer"
        >
          {projectName}
        </a>{" "}
        <Muted>was successfully connected</Muted>
      </Text>
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
