import { useApiQuery } from "@/client/useQueryApi";
import { ActionsBottom } from "@/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/components/FullPageLoading/FullPageLoading";
import { TopBar } from "@/components/TopBar/TopBar";
import { useGlobalActions, useGlobalState } from "@/state/GlobalState";
import { COMPACT_SIZE, useWindowSize } from "@/tools/useWindowSize";
import { CurrentPageSettings } from "@/types";
import {
  VerticalSpace,
  Text,
  Muted,
  Container,
  Button,
  Divider,
} from "@create-figma-plugin/ui";
import { Fragment, FunctionComponent, h } from "preact";
import { useState } from "preact/hooks";

export const PageSetup: FunctionComponent = () => {
  const config = useGlobalState((c) => c.config) || {};
  const { setRoute, setConfig } = useGlobalActions();

  const [settings, setSettings] = useState<
    Partial<CurrentPageSettings> | undefined
  >({ language: "" });

  const languagesLoadable = useApiQuery({
    url: "/v2/projects/languages",
    method: "get",
    options: {
      cacheTime: 0,
      staleTime: 0,
    },
  });

  const languages = languagesLoadable.data?._embedded?.languages;

  const handleSubmit = async () => {
    setConfig({ ...config, ...settings });
    setRoute("index");
  };

  const validated = Boolean(settings?.language);

  useWindowSize(COMPACT_SIZE);

  if (languagesLoadable.isLoading) {
    return <FullPageLoading />;
  }

  return (
    <Fragment>
      <Container space="medium">
        <TopBar leftPart={<div>Page setup</div>} />
      </Container>
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        <Text>
          <Muted>Language</Muted>
        </Text>
        <VerticalSpace space="small" />
        <select
          data-cy="page_setup_input_language"
          value={settings?.language}
          onChange={(e) =>
            setSettings((settings) => ({
              ...settings!,
              language: e.currentTarget.value || "",
            }))
          }
        >
          <option value={""}>Select language...</option>
          {languages?.map((language) => (
            <option key={language.id} value={language.tag}>
              {language.name}
            </option>
          ))}
        </select>

        <ActionsBottom>
          <Button
            data-cy="page_setup_button_save"
            onClick={handleSubmit}
            disabled={!validated}
          >
            Save
          </Button>
        </ActionsBottom>
      </Container>
    </Fragment>
  );
};
