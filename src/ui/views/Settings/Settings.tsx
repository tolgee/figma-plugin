import { Fragment, FunctionComponent, h } from "preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import {
  Banner,
  Button,
  Container,
  Divider,
  IconWarning32,
  LoadingIndicator,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { useApiMutation } from "@/ui/client/useQueryApi";
import { ActionsBottom } from "@/ui/components/ActionsBottom/ActionsBottom";
import { TopBar } from "../../components/TopBar/TopBar";
import { useQueryClient } from "react-query";
import { useWindowSize } from "@/ui/hooks/useWindowSize";
import { Expandable } from "./Expandable";
import { ProjectSection } from "./ProjectSection";
import { PushSection } from "./PushSection";
import { StringsSection } from "./StringsSection";

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

  const { mutateAsync, isLoading } = useApiMutation({
    url: "/v2/api-keys/current",
    method: "get",
    clientOptions: {
      config: {
        apiKey: tolgeeConfig.apiKey,
        apiUrl: tolgeeConfig.apiUrl,
      },
    },
  });

  useWindowSize({ width: 500, height: 500 });

  const [validated, setValidated] = useState(false);

  const { setRoute, setConfig, resetConfig } = useGlobalActions();

  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setError(undefined);
  }, [tolgeeConfig]);

  const validateTolgeeCredentials = async () => {
    try {
      const res = await mutateAsync({});
      if (
        res &&
        res.scopes?.includes("translations.view") &&
        res.scopes?.includes("translations.edit")
      ) {
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
      <Container space="medium">
        <Expandable title="Project">
          <ProjectSection
            tolgeeConfig={tolgeeConfig}
            setTolgeeConfig={setTolgeeConfig}
            validated={validated}
            setValidated={setValidated}
            handleValidate={handleValidate}
          />
        </Expandable>
        <Expandable title="Strings and Keys">
          <StringsSection
            tolgeeConfig={tolgeeConfig}
            setTolgeeConfig={setTolgeeConfig}
          />
        </Expandable>
        <Expandable title="Push">
          <PushSection
            tolgeeConfig={tolgeeConfig}
            setTolgeeConfig={setTolgeeConfig}
          />
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
              <Button
                data-cy="settings_button_forget"
                onClick={handleForget}
                secondary
              >
                Forget credentials
              </Button>
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
    </Fragment>
  );
};
