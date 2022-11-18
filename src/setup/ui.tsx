import {
  Banner,
  Button,
  Columns,
  Container,
  Disclosure,
  Dropdown,
  DropdownOption,
  IconWarning32,
  LoadingIndicator,
  MiddleAlign,
  Muted,
  render,
  Text,
  Textbox,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { sendTolgeeRequest } from '../tolgee'
import '!../styles.css';
import { CloseHandler, SetupHandle, TolgeeConfig } from '../types'


function Plugin({ config }: { config: Partial<TolgeeConfig> | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [previousConfig, setPreviousConfig] = useState(config ?? {});
  const [tolgeeConfig, setTolgeeConfig] = useState(config ?? {});
  const [languages, setLanguages] = useState<Array<DropdownOption>>([]);
  const [open, setOpen] = useState(!config || !!config.apiKey && !!config.url);

  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setError(undefined);
  }, [tolgeeConfig]);

  useEffect(() => {
    if (config && config.apiKey && config.url) {
      validateTolgeeCredentials();
    }
  }, [config])

  const validateTolgeeCredentials = async () => {
    setIsLoading(true);
    try {
      const res = await sendTolgeeRequest("v2/api-keys/current", "GET", tolgeeConfig as TolgeeConfig);
      if (res && res.status === 200 && res.data?.scopes?.includes("translations.view") && res.data?.scopes?.includes("translations.view")) {
        getTolgeeLanguages();
        setOpen(false);
        setPreviousConfig(tolgeeConfig);
      } else if (res && res.status === 200) {
        setOpen(true);
        setError("Missing token scopes. The token should have translations.view and translations.edit scopes.");
      } else {
        setOpen(true);
        setError("Wrong credentials");
      }
    } catch (_) {
      setError("Invalid values. Please check the entered values");
    } finally {
      setIsLoading(false);
    }
  }

  const getTolgeeLanguages = async () => {
    try {
      const res = await sendTolgeeRequest("v2/projects/languages", "GET", tolgeeConfig as TolgeeConfig);
      if (res && res.status === 200 && res.data?._embedded?.languages?.length) {
        setLanguages(res.data._embedded.languages.map((e: any) => ({ value: e.tag, text: e.name })));
        setTolgeeConfig({ ...tolgeeConfig, lang: tolgeeConfig.lang ?? res.data._embedded.languages[0].tag });
      } else {
        setError("An error occurred while fetching the available languages.");
      }
    } catch (e) {
      setError("An error occurred while fetching the available languages.");
    }
  }

  const handleSubmit = () => {
    if (!tolgeeConfig.apiKey) {
      setError("Missing API key");
      return;
    } else if (!tolgeeConfig.url) {
      setError("Missing API url");
      return;
    }
    if (tolgeeConfig.apiKey !== previousConfig.apiKey || tolgeeConfig.url !== previousConfig.url) {
      validateTolgeeCredentials();
      return;
    }
    if (tolgeeConfig.lang) {
      emit<SetupHandle>("SETUP", tolgeeConfig);
    }
  };

  const handleClose = useCallback(function () {
    emit<CloseHandler>('CLOSE')
  }, []);

  if (isLoading) {
    return <MiddleAlign><LoadingIndicator /></MiddleAlign>
  }

  return (
    <Container space="medium" >
      <VerticalSpace space="large" />
      <Disclosure onClick={() => setOpen(!open)} open={open} title="Tolgee Credentials">
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
      </Disclosure>
      {error ? <Banner icon={<IconWarning32 />}>{error}</Banner> : <div />}
      <VerticalSpace space="medium" />
      <Text>
        <Muted>Language</Muted>
      </Text>
      <VerticalSpace space="small" />
      <Dropdown placeholder='Language' disabled={!languages.length} onChange={({ currentTarget: { value: lang } }) => setTolgeeConfig({ ...tolgeeConfig, lang })} options={languages} value={languages.find((e: any) => e.value === tolgeeConfig.lang) ? tolgeeConfig.lang ?? null : null} />
      <VerticalSpace space="extraLarge" />
      <Columns space="extraSmall" style={{ bottom: "12px", position: "absolute", left: "12px", right: "12px" }}>
        <Button fullWidth onClick={handleSubmit}>
          {languages.length ? "Save" : "Get languages"}
        </Button>
        <Button fullWidth onClick={handleClose} secondary>
          Close
        </Button>
      </Columns>
      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin)