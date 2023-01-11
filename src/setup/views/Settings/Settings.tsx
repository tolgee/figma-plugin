import { useState, useEffect, useCallback } from "preact/hooks";
import {
  Banner,
  Button,
  Columns,
  Container,
  IconWarning32,
  LoadingIndicator,
  Muted,
  Text,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import { emit } from "@create-figma-plugin/utilities";
import { useSWRConfig } from "swr";

import styles from "./Settings.css";
import { SetupHandle } from "../../../types";
import { useGlobalActions, useGlobalState } from "../../state/GlobalState";

export const Settings = () => {
  const config = useGlobalState((c) => c.config) || {};
  const [tolgeeConfig, setTolgeeConfig] = useState(config ?? {});
  const [isLoading, setIsLoading] = useState(false);
  const { fetcher } = useSWRConfig();

  const { setRoute } = useGlobalActions();

  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setError(undefined);
  }, [tolgeeConfig]);

  const validateTolgeeCredentials = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetcher!("/v2/api-keys/current", {
        headers: { "x-api-key": tolgeeConfig.apiKey },
        baseUrl: tolgeeConfig.url,
      });

      if (res && res.scopes?.includes("translations.view")) {
        return true;
      } else if (res) {
        throw new Error(
          "Missing token scopes. The token should have translations.view and translations.edit scopes."
        );
      } else {
        throw new Error("Wrong credentials");
      }
    } catch (_) {
      throw new Error("Invalid values. Please check the entered values");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!tolgeeConfig.apiKey) {
      setError("Missing API key");
      return;
    } else if (!tolgeeConfig.url) {
      setError("Missing API url");
      return;
    }

    try {
      await validateTolgeeCredentials();
      emit<SetupHandle>("SETUP", { ...tolgeeConfig });
      setRoute("index");
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleClose = useCallback(function () {
    setRoute("index");
  }, []);

  return (
    <Container space="medium">
      <VerticalSpace space="large" />

      <Text>
        <Muted>Tolgee URL</Muted>
      </Text>
      <VerticalSpace space="small" />
      <Textbox
        onValueInput={(url) => setTolgeeConfig({ ...tolgeeConfig, url })}
        value={tolgeeConfig.url ?? ""}
        variant="border"
      />
      <VerticalSpace space="medium" />
      <Text>
        <Muted>Tolgee API key</Muted>
      </Text>
      <VerticalSpace space="small" />
      <Textbox
        onValueInput={(apiKey) => setTolgeeConfig({ ...tolgeeConfig, apiKey })}
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
        <Columns space="extraSmall" className={styles.controlsContainer}>
          <Button fullWidth onClick={handleSubmit}>
            Save
          </Button>
          <Button fullWidth onClick={handleClose} secondary>
            Close
          </Button>
        </Columns>
      )}
      <VerticalSpace space="small" />
    </Container>
  );
};
