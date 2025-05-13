import { Fragment, h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import {
  Button,
  Checkbox,
  Columns,
  Container,
  Divider,
  IconButton,
  IconChevronDown16,
  Muted,
  Text,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";

import { TopBar } from "@/ui/components/TopBar/TopBar";
import { NodeInfo } from "@/types";
import { PluralEditor } from "@/ui/components/Editor/PluralEditor";
import {
  getTolgeeFormat,
  TolgeeFormat,
  tolgeeFormatGenerateIcu,
} from "@tginternal/editor";
import { useTranslation } from "@/ui/hooks/useTranslation";
import { useSetNodesDataMutation } from "@/ui/hooks/useSetNodesDataMutation";
import { useSelectedNodes } from "@/ui/hooks/useSelectedNodes";
import { useFormatText } from "@/ui/hooks/useFormatText";
import { InfoTooltip } from "@/ui/components/InfoTooltip/InfoTooltip";
import styles from "./StringDetails.css";
import { useInterpolatedTranslation } from "@/ui/hooks/useInterpolatedTranslation";
import { Info } from "@/ui/icons/SvgIcons";
import { HtmlText } from "../../components/Shared/HtmlText";

interface StringDetailsProps {
  node: NodeInfo | undefined;
}

export const StringDetails = ({ node: initialNode }: StringDetailsProps) => {
  const { setRoute } = useGlobalActions();
  const config = useGlobalState((c) => c.config);

  const formatText = useFormatText();
  const setNodesDataMutation = useSetNodesDataMutation();
  const selectedNodes = useSelectedNodes();

  // Used to prevent navigation when changes have been made and not saved
  const [needsSubmission, setNeedsSubmission] = useState(false);

  /** The selected node is alway the last one of the currently selected nodes or null, if no nodes are selected */
  const selectedNode = useMemo(() => {
    if ((selectedNodes.data?.items.length ?? 0) === 1) {
      return { ...selectedNodes.data!.items[0] } as NodeInfo;
    }
    return (
      selectedNodes.data?.items.find((i) => i.id === initialNode?.id) ?? null
    );
  }, [selectedNodes.data?.items]);

  const [currentNode, setCurrentNode] = useState<NodeInfo>();

  const isSimpleNode = (node: NodeInfo) =>
    node &&
    !node.isPlural &&
    Object.keys(node.paramsValues ?? {}).length === 0 &&
    !/<[^>]*>/g.test(node.translation ?? "");

  const translationLoadable = useTranslation({
    language: config?.language ?? "en",
    namespace: config?.namespace ?? "default",
    key: currentNode?.key,
  });
  const [translation, setTranslation] = useState<string>();

  const [editorValue, setEditorValue] = useState<TolgeeFormat>();

  useEffect(() => {
    if (selectedNode) {
      if (
        needsSubmission &&
        currentNode &&
        translation &&
        selectedNode.id !== currentNode?.id
      ) {
        const currentTranslation = translation;
        const res = confirm(
          `TOLGEE\nYou have unsaved changes for the translation\n${currentNode.key}\nDo you want to save them?`
        );
        if (res) {
          updateNodeDataAndText(currentNode, currentTranslation);
        }
      }

      const currentTranslation = isSimpleNode(selectedNode)
        ? (selectedNode.characters || selectedNode.translation) ?? ""
        : selectedNode?.translation ||
          translationLoadable.translation?.translation ||
          "";

      const newNode = { ...selectedNode, translation: currentTranslation };

      setTranslation(currentTranslation);
      setCurrentNode(newNode);
    } else if (!selectedNode) {
      setCurrentNode(undefined);
    }
  }, [selectedNode]);

  useEffect(() => {
    const tolgeeValue = getTolgeeFormat(
      translation ?? currentNode?.translation ?? currentNode?.characters ?? "",
      currentNode?.isPlural ?? false,
      true
    );

    setEditorValue({
      ...tolgeeValue,
      parameter:
        currentNode?.isPlural && tolgeeValue.parameter == null
          ? "value"
          : tolgeeValue.parameter,
    });

    if (currentNode) {
      refreshTranslation(
        currentNode,
        currentNode.translation ?? currentNode.characters
      );
    }
  }, [currentNode]);

  useEffect(() => {
    if (!selectedNode) {
      return;
    }
    const currentTranslation = isSimpleNode(selectedNode)
      ? (selectedNode.characters || selectedNode.translation) ?? ""
      : selectedNode?.translation ||
        translationLoadable.translation?.translation ||
        "";

    setNeedsSubmission(currentTranslation !== selectedNode.translation);

    setTranslation(currentTranslation);
  }, [selectedNode, translationLoadable.translation?.translation]);

  const refreshTranslation = (node: NodeInfo, currentTranslation: string) => {
    updateInterpolatedTranslation({
      currentTranslation,
      pluralParamValue: node.pluralParamValue,
      paramsValues: node.paramsValues || {},
    });
  };

  /** Updates the textnode content and the node data */
  const updateNodeDataAndText = (
    node: NodeInfo,
    currentTranslation: string
  ): string => {
    const newTranslation = getInterpolatedTranslation({
      currentTranslation,
      pluralParamValue: node.pluralParamValue,
      paramsValues: node.paramsValues || {},
    });

    if (newTranslation != null) {
      formatText.mutate({
        formatted: newTranslation,
        nodeInfo: node,
      });
      updateNodeData({
        characters: newTranslation,
        translation: currentTranslation,
        paramsValues: node.paramsValues,
        pluralParamValue: node.pluralParamValue,
        isPlural: node.isPlural,
      });
      setNeedsSubmission(false);
    }
    return newTranslation || currentTranslation;
  };

  /** Updates nodes properties with the partial data and mutates the data state within figma */
  const updateNodeData = (data: Partial<NodeInfo>) => {
    if (currentNode == null) {
      return;
    }
    setNodesDataMutation.mutate({
      nodes: [{ ...currentNode, ...data }],
    });
  };

  const {
    previewText,
    previewTextIsError,
    translationDiffersFromNode,
    placeholders,
    tolgeeValue,
    getInterpolatedTranslation,
    updateInterpolatedTranslation,
  } = useInterpolatedTranslation(currentNode);

  if (translationLoadable.isLoading || formatText.isLoading) {
    return <FullPageLoading text="Updating translations" />;
  }

  const infoString = (
    <Fragment>
      <div>
        You can use basic HTML tags such as &lt;strong&gt;, &lt;b&gt;,
        &lt;em&gt;,
        <br />
        &lt;i&gt;, &lt;u&gt;, &lt;br&gt; and also parameters as
        <br />
        &#123;parameter&#125; and # as plural placeholder
        <br />
        <button
          className={styles.infoLink}
          onClick={() =>
            window.open(
              "https://docs.tolgee.io/platform/projects_and_organizations/editing_translations",
              "_blank"
            )
          }
        >
          Read the docs
        </button>
      </div>
    </Fragment>
  );

  const valuesForFigmaString = `These values will be used to preview\nthe translation for figma.\nThey will not be saved.`;

  return (
    <Fragment>
      <Container
        space="medium"
        style={{ paddingBlock: "var(--space-extra-small)" }}
      >
        <TopBar
          leftPart={
            <Fragment>
              <IconButton
                onClick={() => setRoute("index")}
                style={{ transform: "rotate(90deg)" }}
              >
                <IconChevronDown16 />
              </IconButton>
              <Text data-cy="string_details_headline">STRING DETAILS</Text>
            </Fragment>
          }
          rightPart={
            needsSubmission && currentNode && translation ? (
              <Button
                onClick={() => {
                  updateNodeDataAndText(currentNode, translation);
                }}
              >
                {needsSubmission ? "Save changes" : "Back to list"}
              </Button>
            ) : undefined
          }
        />
      </Container>
      <Divider />
      {currentNode == null ? (
        <Container space="medium" style={{ marginTop: 16 }}>
          {selectedNodes.data?.items.length === 0 && (
            <Text>Please select a node to edit the translation.</Text>
          )}
          {(selectedNodes.data?.items.length ?? 0) > 1 && (
            <Text>Please select only one node to edit the translation.</Text>
          )}
        </Container>
      ) : (
        <Container space="medium">
          {((translationDiffersFromNode && !needsSubmission) ||
            currentNode.isPlural ||
            placeholders.length > 0) && (
            <Container
              className={
                translationDiffersFromNode && !needsSubmission
                  ? styles.warningContainer
                  : styles.warningNoticeContainer
              }
              space="small"
            >
              <Columns space="small">
                <Info
                  width={16}
                  height={16}
                  className={
                    translationDiffersFromNode && !needsSubmission
                      ? styles.warningContainerIcon
                      : styles.warningNoticeContainerIcon
                  }
                />
                <Muted>
                  Advanced text format detected. Edit the string via plugin to
                  preserve formatting.
                </Muted>
              </Columns>
              {translationDiffersFromNode && !needsSubmission && (
                <Button
                  secondary
                  onClick={() => {
                    if (translation != null) {
                      updateNodeDataAndText(currentNode, translation);
                    }
                  }}
                >
                  Revert string in design
                </Button>
              )}
            </Container>
          )}
          <VerticalSpace space="large" />
          <Text>
            <Muted>Key name</Muted>
          </Text>
          <VerticalSpace space="small" />
          <Textbox
            data-cy="string_details_input_key"
            placeholder="Key name"
            value={currentNode.key}
            onChange={(e) => {
              setCurrentNode({ ...currentNode, key: e.currentTarget.value });
            }}
            variant="border"
          />
          <VerticalSpace space="medium" />
          <div className={styles.checkboxWrapper}>
            <Checkbox
              disabled={currentNode.connected}
              onChange={() => {
                const newPlural = !currentNode.isPlural;
                const newTranslation = tolgeeFormatGenerateIcu(
                  {
                    ...tolgeeValue,
                    parameter:
                      newPlural && tolgeeValue.parameter == null
                        ? "value"
                        : newPlural
                        ? tolgeeValue.parameter
                        : undefined,
                  },
                  false
                );
                const newNode: NodeInfo = {
                  ...currentNode,
                  isPlural: newPlural,
                  pluralParamValue: newPlural ? "10" : undefined,
                  translation: newTranslation,
                };
                setNeedsSubmission(true);
                setCurrentNode(newNode);
              }}
              value={currentNode.isPlural}
            >
              <Text>is plural</Text>
            </Checkbox>
            {currentNode.connected && (
              <InfoTooltip>
                You cannot change this setting here.
                <br />
                Head over to you Tolgee platform and change it there.
              </InfoTooltip>
            )}
          </div>
          <VerticalSpace space="medium" />
          <Muted className={styles.editorHeadline}>
            Translation ({config?.language ?? "Unknown"})
            <InfoTooltip>{infoString}</InfoTooltip>
          </Muted>
          <VerticalSpace space="small" />
          {editorValue && (
            <PluralEditor
              onChange={(value) => {
                const currentVariants = Object.entries(editorValue.variants);
                const newVariants = Object.entries(value.variants);
                if (
                  value.parameter === editorValue.parameter &&
                  currentVariants.length === newVariants.length &&
                  currentVariants.every(
                    ([key, value], index) =>
                      key === newVariants[index][0] &&
                      value === newVariants[index][1]
                  )
                ) {
                  return;
                }

                setEditorValue(value);
                const generatedIcuString = tolgeeFormatGenerateIcu(
                  value,
                  false
                );

                if (generatedIcuString !== translation) {
                  setTranslation(generatedIcuString);
                  setNeedsSubmission(true);
                }
              }}
              onBlur={() => {
                if (!editorValue) {
                  return;
                }

                const generatedIcuString = tolgeeFormatGenerateIcu(
                  editorValue,
                  false
                );

                if (generatedIcuString !== currentNode.translation) {
                  setTranslation(generatedIcuString);
                  setCurrentNode({
                    ...currentNode,
                    translation: generatedIcuString,
                  });
                }
              }}
              value={editorValue}
              locale={config?.language ?? "en"}
              mode="placeholders"
            />
          )}
          <VerticalSpace space="medium" />
          <div className={styles.bottomContainer}>
            {(placeholders.length > 0 || tolgeeValue.parameter) && (
              <div className={styles.paramsContainer}>
                <Muted className={styles.valuesText}>
                  Values for Figma{" "}
                  <InfoTooltip>{valuesForFigmaString}</InfoTooltip>
                </Muted>
                {tolgeeValue.parameter && (
                  <Textbox
                    data-cy="string_details_plural_paramter_value"
                    placeholder={tolgeeValue.parameter}
                    value={currentNode.pluralParamValue ?? ""}
                    type="number"
                    onChange={({ currentTarget }) => {
                      setNeedsSubmission(true);
                      if (currentTarget.value !== "") {
                        currentNode.pluralParamValue = currentTarget.value;
                        const newNode: NodeInfo = {
                          ...currentNode,
                          pluralParamValue: currentTarget.value,
                        };
                        if (translation != null) {
                          setCurrentNode(newNode);
                        }
                      }
                    }}
                    variant="border"
                  />
                )}
                {placeholders
                  .filter(
                    (p) =>
                      tolgeeValue.parameter == null ||
                      p.name != tolgeeValue.parameter
                  )
                  .map((p) => (
                    <Fragment key={p}>
                      <div className={styles.paramRow}>
                        <Text>
                          <Muted>Variable</Muted> {p.name}
                        </Text>
                        <Textbox
                          style={{ flex: 1 }}
                          data-cy={`string_details_paramter_value_${p.name}`}
                          placeholder={p.name}
                          value={currentNode.paramsValues?.[p.name] ?? ""}
                          onChange={({ currentTarget }) => {
                            setNeedsSubmission(true);
                            const newNode: NodeInfo = {
                              ...currentNode,
                              paramsValues: {
                                ...currentNode.paramsValues,
                                [p.name]: currentTarget.value,
                              },
                            };
                            if (translation != null) {
                              setCurrentNode(newNode);
                            }
                          }}
                          variant="border"
                        />
                      </div>
                    </Fragment>
                  ))}
              </div>
            )}

            <div className={styles.previewRow}>
              <Muted>Preview</Muted>
              <Muted>
                <HtmlText
                  dataCy="string_details_preview_text"
                  style={{
                    color: previewTextIsError ? "red" : undefined,
                    whiteSpace: "pre-wrap",
                  }}
                  text={previewText}
                />
              </Muted>
            </div>
          </div>

          <VerticalSpace space="large" />
        </Container>
      )}
    </Fragment>
  );
};
