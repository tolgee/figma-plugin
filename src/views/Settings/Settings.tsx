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

  const handleSubmit = async () => {
    try {
      await validateTolgeeCredentials();
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
          onValueInput={(apiUrl) =>
            setTolgeeConfig({ ...tolgeeConfig, apiUrl })
          }
          value={tolgeeConfig.apiUrl}
          variant="border"
        />
        <VerticalSpace space="medium" />
        <Text>
          <Muted>Tolgee API key</Muted>
        </Text>
        <VerticalSpace space="small" />
        <Textbox
          onValueInput={(apiKey) =>
            setTolgeeConfig({ ...tolgeeConfig, apiKey })
          }
          value={tolgeeConfig.apiKey ?? ""}
          variant="border"
        />
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
            <Button onClick={handleSubmit}>Save</Button>
          </ActionsBottom>
        )}
        <VerticalSpace space="small" />
      </Container>
    </Fragment>
  );
};
