import { Fragment, h } from "preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import {
  Banner,
  Button,
  Container,
  Divider,
  IconWarning32,
  LoadingIndicator,
  Muted,
  Text,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { useGlobalActions, useGlobalState } from "@/state/GlobalState";
import { useApiMutation } from "@/client/useQueryApi";
import { ActionsBottom } from "@/components/ActionsBottom/ActionsBottom";
import { TopBar } from "../../components/TopBar/TopBar";
import styles from "./Settings.css";
import { ProjectSettings } from "./ProjectSettings";

const DEFAULT_TOLGEE_URL = "https://app.tolgee.io";

export const Settings = () => {
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

  const [validated, setValidated] = useState(false);

  const { setRoute, setConfig } = useGlobalActions();

  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setError(undefined);
  }, [tolgeeConfig]);

  const validateTolgeeCredentials = async () => {
    try {
      const res = await mutateAsync({});
      if (res && res.scopes?.includes("translations.view")) {
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
      setError(e.message || e);
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
      setError(e.message || e);
    }
  };

  const handleGoBack = useCallback(() => {
    setRoute("index");
  }, []);

  return (
    <Fragment>
      <TopBar onBack={handleGoBack} leftPart={<div>Settings</div>} />
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
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
          <Button onClick={handleValidate}>Validate</Button>
        )}

        {validated && (
          <ProjectSettings
            apiUrl={tolgeeConfig.apiUrl}
            apiKey={tolgeeConfig.apiKey || ""}
            onChange={(data) => setTolgeeConfig({ ...tolgeeConfig, ...data })}
            initialData={tolgeeConfig}
          />
        )}

        <VerticalSpace space="medium" />
        {isLoading ? (
          <LoadingIndicator />
        ) : error ? (
          <Banner icon={<IconWarning32 />}>{error}</Banner>
        ) : null}
        <VerticalSpace space="extraLarge" />
        {!isLoading && (
          <ActionsBottom>
            <Button onClick={handleGoBack} secondary>
              Close
            </Button>
            <Button onClick={handleSubmit} disabled={!validated}>
              Save
            </Button>
          </ActionsBottom>
        )}
        <VerticalSpace space="small" />
      </Container>
    </Fragment>
  );
};
