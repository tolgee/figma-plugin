import { useApiQuery } from "@/ui/client/useQueryApi";
import { ActionsBottom } from "@/ui/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { TopBar } from "@/ui/components/TopBar/TopBar";
import { useGlobalActions } from "@/ui/state/GlobalState";
import { getPullChanges } from "@/tools/getPullChanges";
import {
  VerticalSpace,
  Text,
  Muted,
  Container,
  Button,
  Divider,
  RadioButtons,
  Checkbox,
} from "@create-figma-plugin/ui";
import { Fragment, FunctionComponent, h } from "preact";
import { useState } from "preact/hooks";
import { useCopyPage } from "@/ui/hooks/useCopyPage";
import { useConnectedNodes } from "@/ui/hooks/useConnectedNodes";
import { useAllTranslations } from "@/ui/hooks/useAllTranslations";

type CopyType = "language" | "keys";

export const CreateCopy: FunctionComponent = () => {
  const { setRoute } = useGlobalActions();

  const [copyType, setCopyType] = useState<CopyType>("keys");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const connectedNodes = useConnectedNodes({ ignoreSelection: true });

  const languagesLoadable = useApiQuery({
    url: "/v2/projects/languages",
    method: "get",
    options: {
      cacheTime: 0,
      staleTime: 0,
    },
  });

  const allTranslationsLoadable = useAllTranslations();

  const copyPageMutation = useCopyPage();

  const languages = languagesLoadable.data?._embedded?.languages;

  const handleSubmit = async () => {
    if (copyType === "keys") {
      copyPageMutation.mutate(undefined, {
        onSuccess: goToIndex,
      });
    } else {
      for (const language of selectedLanguages) {
        const response = await allTranslationsLoadable.getData({
          language,
        });

        const { changedNodes } = getPullChanges(
          connectedNodes.data?.items || [],
          language,
          response
        );

        copyPageMutation.mutate(
          {
            language,
            nodes: changedNodes,
          },
          { onSuccess: goToIndex }
        );
      }
    }
  };

  const goToIndex = () => {
    setRoute("index");
  };

  const handleToggleLanguage = (lang: string) => {
    setSelectedLanguages((langs) => {
      if (langs.includes(lang)) {
        return langs.filter((l) => l !== lang);
      }
      return [...langs, lang];
    });
  };

  const validated = Boolean(copyType === "keys" || selectedLanguages.length);

  if (connectedNodes.isLoading) {
    return <FullPageLoading text="Analyzing document" />;
  }

  if (languagesLoadable.isLoading || copyPageMutation.isLoading) {
    return <FullPageLoading text="Copying page(s)" />;
  }

  return (
    <Fragment>
      <TopBar leftPart={<div>Create new page</div>} onBack={goToIndex} />
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
              <Muted>Languages</Muted>
            </Text>
            <VerticalSpace space="small" />

            {languages?.map((language) => (
              <div key={language.id}>
                <Checkbox
                  value={selectedLanguages.includes(language.tag)}
                  onChange={() => handleToggleLanguage(language.tag)}
                >
                  <Text>{language.name}</Text>
                </Checkbox>
                <VerticalSpace space="small" />
              </div>
            ))}
          </Fragment>
        )}

        <ActionsBottom>
          <Button
            data-cy="create_copy_button_close"
            onClick={goToIndex}
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
