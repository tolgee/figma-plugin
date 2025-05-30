import { Fragment, FunctionalComponent, h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import clsx from "clsx";
import {
  Banner,
  Button,
  Container,
  Divider,
  IconWarning32,
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
import { NodeInfo } from "../../../types";

type Props = RouteParam<"pull">;

export const Pull: FunctionalComponent<Props> = ({ lang }) => {
  const selectedNodes = useConnectedNodes({ ignoreSelection: false });
  const { setRoute, setLanguage } = useGlobalActions();

  const updateNodeLoadable = useUpdateNodesMutation();
  const setNodesDataMutation = useSetNodesDataMutation();
  const allTranslationsLoadable = useAllTranslations();
  const [diffData, setDiffData] = useState<ReturnType<typeof getPullChanges>>();

  const [error, setError] = useState<string>();

  async function computeDiff() {
    try {
      const translations = await allTranslationsLoadable.getData({
        language: lang ?? "",
      });
      setDiffData(
        getPullChanges(selectedNodes.data?.items || [], lang, translations)
      );
      setError(undefined);
    } catch (e) {
      if (e === "invalid_project_api_key") {
        setError("Invalid project API key");
      } else {
        setError(`Cannot get translation data. ${e}`);
      }
    }
  }

  useEffect(() => {
    computeDiff();
  }, [selectedNodes.data, lang]);

  const formatter = useMemo(() => createFormatIcu(), [lang]);

  const getFormattedForNode = (n: NodeInfo) => {
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
      } as NodeInfo & { formatted: string };
    } catch (e) {
      return {
        ...n,
        formatted: n.characters,
      } as NodeInfo & { formatted: string };
    }
  };

  const handleProcess = async () => {
    if (diffData!.changedNodes.length !== 0) {
      await updateNodeLoadable.mutateAsync({
        nodes: diffData!.changedNodes.map(getFormattedForNode),
      });
    }

    await setNodesDataMutation.mutateAsync({
      nodes:
        selectedNodes.data?.items
          .filter((i) => i.connected)
          .map((n) => {
            const changedNode = diffData!.changedNodes.find(
              (c) => c.key === n.key
            );
            if (!changedNode) {
              return n;
            }
            const characters = getFormattedForNode(changedNode).formatted;
            const changed = {
              ...n,
              characters,
              isPlural: changedNode?.isPlural ?? n.isPlural,
              pluralParamValue:
                changedNode?.pluralParamValue ?? n.pluralParamValue,
              translation: changedNode?.translation ?? n.translation,
              paramsValues: changedNode?.paramsValues ?? n.paramsValues,
              connected: true,
            };
            return changed;
          }) ?? [],
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
        {error ? (
          <Banner icon={<IconWarning32 />}>{error}</Banner>
        ) : isLoading || !diffData ? (
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
