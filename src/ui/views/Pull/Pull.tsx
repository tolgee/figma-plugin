import { Fragment, FunctionalComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import clsx from "clsx";
import {
  Button,
  Container,
  Divider,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { ActionsBottom } from "@/ui/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { useGlobalActions } from "@/ui/state/GlobalState";
import { NodeList } from "@/ui/components/NodeList/NodeList";
import { getPullChanges } from "@/tools/getPullChanges";

import { TopBar } from "../../components/TopBar/TopBar";
import { RouteParam } from "../routes";
import styles from "./Pull.css";
import { useConnectedNodes } from "@/ui/hooks/useConnectedNodes";
import { useUpdateNodesMutation } from "@/ui/hooks/useUpdateNodesMutation";
import { useHighlightNodeMutation } from "@/ui/hooks/useHighlightNodeMutation";
import { useSetNodesDataMutation } from "@/ui/hooks/useSetNodesDataMutation";
import { useAllTranslations } from "@/ui/hooks/useAllTranslations";
import { getPlaceholders, getTolgeeFormat } from "@tginternal/editor";
import { createFormatIcu } from "../../../createFormatIcu";

type Props = RouteParam<"pull">;

export const Pull: FunctionalComponent<Props> = ({ lang }) => {
  const selectedNodes = useConnectedNodes({ ignoreSelection: false });
  const { setRoute, setLanguage } = useGlobalActions();

  const updateNodeLoadable = useUpdateNodesMutation();
  const setNodesDataMutation = useSetNodesDataMutation();
  const allTranslationsLoadable = useAllTranslations();
  const [diffData, setDiffData] = useState<ReturnType<typeof getPullChanges>>();

  async function computeDiff() {
    const translations = await allTranslationsLoadable.getData({
      language: lang ?? "",
    });
    setDiffData(
      getPullChanges(selectedNodes.data?.items || [], lang, translations)
    );
  }

  useEffect(() => {
    computeDiff();
  }, [selectedNodes.data, lang]);

  const handleProcess = async () => {
    if (diffData!.changedNodes.length !== 0) {
      const formatter = createFormatIcu();

      await updateNodeLoadable.mutateAsync({
        nodes: diffData!.changedNodes.map((n) => {
          const tolgeeValue = getTolgeeFormat(n.translation, n.isPlural, false);
          const paramValues = { ...(n.paramsValues ?? {}) };
          const placeholders = getPlaceholders(n.translation);

          for (const placeholder of placeholders ?? []) {
            if (paramValues[placeholder.name] == null) {
              paramValues[placeholder.name] = placeholder.name;
            }
          }

          try {
            const formatted = formatter.format({
              language: lang ?? "en",
              translation: n.translation,
              params: {
                ...paramValues,
                [tolgeeValue.parameter ?? ""]: n.pluralParamValue ?? "1",
              },
            });
            return {
              ...n,
              formatted,
            };
          } catch (e) {
            return {
              ...n,
              formatted: n.characters,
            };
          }
        }),
      });
    }

    await setNodesDataMutation.mutateAsync({
      nodes:
        selectedNodes.data?.items
          // .filter((n) => !n.connected)
          .map((n) => ({
            ...n,
            isPlural:
              diffData!.changedNodes.find((c) => c.key === n.key)?.isPlural ??
              n.isPlural,
            pluralParamValue:
              diffData!.changedNodes.find((c) => c.key === n.key)
                ?.pluralParamValue ?? n.pluralParamValue,
            translation:
              diffData!.changedNodes.find((c) => c.key === n.key)
                ?.translation ?? n.translation,
            paramsValues:
              diffData!.changedNodes.find((c) => c.key === n.key)
                ?.paramsValues ?? n.paramsValues,
            connected: true,
          })) ?? [],
    });
    setLanguage(lang);
    setRoute("index");
  };

  const handleGoBack = () => {
    setRoute("index");
  };

  const handleRepeat = () => {
    computeDiff();
  };

  const highlightNode = useHighlightNodeMutation();

  const isLoading =
    allTranslationsLoadable.isLoading || selectedNodes.isLoading;

  return (
    <Fragment>
      <TopBar
        onBack={handleGoBack}
        leftPart={<div>Pull translations from Tolgee ({lang})</div>}
      />
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        {isLoading || !diffData ? (
          <FullPageLoading text="Searching document for translations" />
        ) : allTranslationsLoadable.error ? (
          <Fragment>
            <div>
              {allTranslationsLoadable.error || "Cannot get translation data."}
            </div>
            <ActionsBottom>
              <Button onClick={handleRepeat}>Try again</Button>
            </ActionsBottom>
          </Fragment>
        ) : (
          <Fragment>
            <div>
              {diffData.changedNodes.length === 0
                ? "Everything up to date"
                : `This action will replace translations in ${diffData.changedNodes.length} text(s).`}
            </div>
            {diffData.missingKeys.length > 0 && (
              <Fragment>
                <div className={clsx(styles.sectionTitle)}>Missing keys:</div>
                <div className={clsx(styles.list, styles.missing)}>
                  <NodeList
                    items={diffData.missingKeys}
                    onClick={(item) => highlightNode.mutate({ id: item.id })}
                    compact
                  />
                </div>
              </Fragment>
            )}
            <ActionsBottom>
              {diffData.changedNodes.length === 0 ? (
                <Button data-cy="pull_ok_button" onClick={handleProcess}>
                  OK
                </Button>
              ) : (
                <Fragment>
                  <Button
                    data-cy="pull_cancel_button"
                    onClick={handleGoBack}
                    secondary
                  >
                    Cancel
                  </Button>
                  <Button data-cy="pull_submit_button" onClick={handleProcess}>
                    Replace
                  </Button>
                </Fragment>
              )}
            </ActionsBottom>
          </Fragment>
        )}
      </Container>
    </Fragment>
  );
};
