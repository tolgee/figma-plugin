import { useApiQuery } from "@/client/useQueryApi";
import { ActionsBottom } from "@/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/components/FullPageLoading/FullPageLoading";
import { TopBar } from "@/components/TopBar/TopBar";
import { useGlobalActions } from "@/state/GlobalState";
import {
  VerticalSpace,
  Text,
  Muted,
  Container,
  Button,
  Divider,
  RadioButtons,
} from "@create-figma-plugin/ui";
import { Fragment, FunctionComponent, h } from "preact";
import { useState } from "preact/hooks";

type CopyType = "language" | "keys";

export const CreateCopy: FunctionComponent = () => {
  const { setRoute } = useGlobalActions();

  const [copyType, setCopyType] = useState<CopyType>("keys");
  const [language, setLanguage] = useState<string>();

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
    setRoute("index");
  };

  const handleGoBack = () => {
    setRoute("index");
  };

  const validated = Boolean(copyType === "keys" || language);

  if (languagesLoadable.isLoading) {
    return <FullPageLoading />;
  }

  return (
    <Fragment>
      <Container space="medium">
        <TopBar leftPart={<div>Create new page</div>} />
      </Container>
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        <RadioButtons
          value={copyType}
          onChange={(e) => setCopyType(e.currentTarget.value as CopyType)}
          options={[
            {
              value: "keys",
              children: <Text>Create page with key names</Text>,
            },
            {
              value: "language",
              children: <Text>Create page with languages</Text>,
            },
          ]}
        />

        <VerticalSpace space="large" />

        {copyType === "language" && (
          <Fragment>
            <Text>
              <Muted>Language</Muted>
            </Text>
            <VerticalSpace space="small" />
            <select
              data-cy="settings_input_language"
              value={language}
              onChange={(e) => setLanguage(e.currentTarget.value)}
            >
              {languages?.map((language) => (
                <option key={language.id} value={language.tag}>
                  {language.name}
                </option>
              ))}
            </select>
          </Fragment>
        )}

        <ActionsBottom>
          <Button
            data-cy="create_copy_button_close"
            onClick={handleGoBack}
            secondary
          >
            Close
          </Button>
          <Button
            data-cy="create_copy_button_submit"
            onClick={handleSubmit}
            disabled={!validated}
          >
            Create
          </Button>
        </ActionsBottom>
      </Container>
    </Fragment>
  );
};
