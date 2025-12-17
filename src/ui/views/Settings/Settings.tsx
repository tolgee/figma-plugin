import { Fragment, FunctionComponent, h } from "preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import {
  Banner,
  Button,
  Container,
  Divider,
  IconWarning32,
  LoadingIndicator,
  Modal,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { useApiMutation, useApiQuery } from "@/ui/client/useQueryApi";
import { ActionsBottom } from "@/ui/components/ActionsBottom/ActionsBottom";
import { TopBar } from "../../components/TopBar/TopBar";
import { useQueryClient } from "react-query";
import { Expandable } from "./Expandable";
import { ProjectSection } from "./ProjectSection";
import { PushSection } from "./PushSection";
import { StringsSection } from "./StringsSection";
import { getProjectIdFromApiKey } from "../../client/decodeApiKey";

const DEFAULT_TOLGEE_URL = "https://app.tolgee.io";

type Props = {
  noNavigation?: boolean;
};

export const Settings: FunctionComponent<Props> = ({ noNavigation }) => {
  const queryClient = useQueryClient();
  const config = useGlobalState((c) => c.config) || {};
  const [tolgeeConfig, setTolgeeConfig] = useState({
    apiUrl: DEFAULT_TOLGEE_URL,
    ...config,
  });
  const [setupStep, setSetupStep] = useState<
    "project" | "strings" | "push" | null
  >(noNavigation ? "project" : null);

  const { mutateAsync, isLoading } = useApiMutation({
    url: "/v2/api-keys/current",
    method: "get",
    clientOptions: {
      config: {
        apiKey: tolgeeConfig.apiKey,
        apiUrl: tolgeeConfig.apiUrl,
        apiTimeout: 15000,
      },
    },
  });

  const [validated, setValidated] = useState(false);

  const { setRoute, setConfig, resetConfig } = useGlobalActions();

  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setError(undefined);
  }, [tolgeeConfig]);

  const [projectName, setProjectName] = useState<string | undefined>();
  const [projectId, setProjectId] = useState<number | undefined>();
  const [forgetDialogOpen, setForgetDialogOpen] = useState(false);

  const validateTolgeeCredentials = async () => {
    try {
      setError(undefined);
      const res = await mutateAsync({});
      if (
        res &&
        res.scopes?.includes("translations.view") &&
        res.scopes?.includes("translations.edit")
      ) {
        setProjectName(res.projectName);
        setProjectId(res.projectId);
        return true;
      }
      throw new Error(
        "Missing token scopes. The token should have translations.view and translations.edit scopes."
      );
    } catch (e: any) {
      if (e === "Forbidden") {
        throw new Error("Invalid API key");
      }
      throw e;
    }
  };

  const handleValidate = async () => {
    try {
      await validateTolgeeCredentials();
      setValidated(true);
    } catch (e: any) {
      setError(
        (e === "invalid_project_api_key"
          ? "Invalid project API key"
          : e.message) || e
      );
    }
  };

  useEffect(() => {
    if (tolgeeConfig.apiKey && tolgeeConfig.apiUrl) {
      handleValidate();
    }
  }, []);

  const handleSubmit = async () => {
    try {
      setConfig(tolgeeConfig);
      setRoute("index");
    } catch (e: any) {
      setError(
        (e === "invalid_project_api_key"
          ? "Invalid project API key"
          : e.message) || e
      );
    }
    queryClient.clear();
  };

  const handleGoBack = useCallback(() => {
    setRoute("index");
  }, []);

  const handleForget = () => {
    resetConfig();
    setValidated(false);
    setTolgeeConfig({
      apiUrl: DEFAULT_TOLGEE_URL,
    });
    setForgetDialogOpen(false);
  };

  function handleOpenButtonClick() {
    setForgetDialogOpen(true);
  }

  const handleNextStep = () => {
    if (setupStep === "project") {
      setSetupStep("strings");
    } else if (setupStep === "strings") {
      setSetupStep("push");
    } else if (setupStep === "push") {
      handleSubmit();
    }
  };

  const renderSection = (
    step: "project" | "strings" | "push" | null = setupStep,
    isSetup = false
  ) => {
    switch (step) {
      case "project":
        return (
          <ProjectSection
            showHeadline={isSetup}
            projectName={projectName}
            projectId={projectId}
            tolgeeConfig={tolgeeConfig}
            setTolgeeConfig={setTolgeeConfig}
            validated={validated}
            setValidated={setValidated}
            handleValidate={handleValidate}
          />
        );
      case "strings":
        return (
          <StringsSection
            showHeadline={isSetup}
            tolgeeConfig={tolgeeConfig}
            setTolgeeConfig={setTolgeeConfig}
          />
        );
      case "push":
        return (
          <PushSection
            showHeadline={isSetup}
            tolgeeConfig={tolgeeConfig}
            setTolgeeConfig={setTolgeeConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Fragment>
      {noNavigation ? (
        <Container space="medium">
          <TopBar leftPart={<div>Settings</div>} />
        </Container>
      ) : (
        <TopBar onBack={handleGoBack} leftPart={<div>Settings</div>} />
      )}
      <Divider />
      <VerticalSpace space="large" />
      {setupStep == null ? (
        <Container space="medium">
          <Expandable
            dataCy="settings_expandable_project"
            title="Project"
            defaultOpen={!tolgeeConfig.apiKey}
          >
            {renderSection("project")}
          </Expandable>
          <Expandable
            dataCy="settings_expandable_strings"
            title="Strings and Keys"
          >
            {renderSection("strings")}
          </Expandable>
          <Expandable dataCy="settings_expandable_push" title="Push">
            {renderSection("push")}
          </Expandable>
          <VerticalSpace space="extraLarge" />
          {isLoading ? (
            <LoadingIndicator />
          ) : error ? (
            <Banner icon={<IconWarning32 />}>{error}</Banner>
          ) : null}
          <VerticalSpace space="extraLarge" />
          {!isLoading && (
            <ActionsBottom>
              {config.documentInfo && (
                <div style={{ marginRight: "auto" }}>
                  <Button
                    data-cy="settings_button_forget"
                    onClick={handleOpenButtonClick}
                    secondary
                  >
                    Forget credentials
                  </Button>
                </div>
              )}
              {!noNavigation && (
                <Button
                  data-cy="settings_button_close"
                  onClick={handleGoBack}
                  secondary
                >
                  Close
                </Button>
              )}
              <Button
                data-cy="settings_button_save"
                onClick={handleSubmit}
                disabled={!validated}
              >
                Save
              </Button>
            </ActionsBottom>
          )}
          <VerticalSpace space="small" />
        </Container>
      ) : (
        <Container space="medium">
          {renderSection(setupStep, true)}
          <VerticalSpace space="extraLarge" />
          {isLoading ? (
            <LoadingIndicator />
          ) : error ? (
            <Banner icon={<IconWarning32 />}>{error}</Banner>
          ) : null}
          <VerticalSpace space="extraLarge" />
          {!isLoading && (
            <ActionsBottom>
              {config.documentInfo && (
                <div style={{ marginRight: "auto" }}>
                  <Button
                    data-cy="settings_button_forget"
                    onClick={handleOpenButtonClick}
                    secondary
                  >
                    Forget credentials
                  </Button>
                </div>
              )}
              {setupStep !== "project" && (
                <Button
                  data-cy="settings_button_close"
                  onClick={() => {
                    if (setupStep === "strings") setSetupStep("project");
                    else if (setupStep === "push") setSetupStep("strings");
                  }}
                  secondary
                >
                  Back
                </Button>
              )}
              <Button
                data-cy="settings_button_save"
                onClick={handleNextStep}
                disabled={!validated}
              >
                {setupStep !== "push" ? "Next" : "Save"}
              </Button>
            </ActionsBottom>
          )}
          <VerticalSpace space="small" />
        </Container>
      )}
      <Modal
        open={forgetDialogOpen}
        title="Forget credentials for this project?"
        onCloseButtonClick={() => setForgetDialogOpen(false)}
      >
        <div style={{ padding: "16px" }}>
          <p>
            Project "{projectName}" will be disconnected from the Figma plugin.
          </p>
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
              marginTop: "16px",
            }}
          >
            <Button onClick={() => setForgetDialogOpen(false)} secondary>
              Cancel
            </Button>
            <Button onClick={handleForget}>Continue</Button>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};
