import { Fragment, h } from "preact";
import DOMPurify from "dompurify";
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
import { useConnectedMutation } from "@/ui/hooks/useConnectedMutation";
import { NodeInfo } from "@/types";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { PluralEditor } from "@/ui/components/Editor/PluralEditor";
import { tolgeeFormatGenerateIcu } from "@tginternal/editor";
import { useTranslation } from "@/ui/hooks/useTranslation";
import { useSetNodesDataMutation } from "@/ui/hooks/useSetNodesDataMutation";
import { useSelectedNodes } from "@/ui/hooks/useSelectedNodes";
import { useFormatText } from "@/ui/hooks/useFormatText";
import { InfoTooltip } from "@/ui/components/InfoTooltip/InfoTooltip";
import styles from "./StringDetails.css";
import { useInterpolatedTranslation } from "@/ui/hooks/useInterpolatedTranslation";
import { stringFormatter } from "@/main/utils/textFormattingTools";
import { Info } from "../../icons/SvgIcons";

type StringDetailsProps = {
  node: NodeInfo;
};

export const StringDetails = ({ node: initialNode }: StringDetailsProps) => {
  const { setRoute } = useGlobalActions();
  const config = useGlobalState((c) => c.config);
  const connectedNodesLoadable = useConnectedMutation({
    ignoreSelection: false,
  });

  const formatText = useFormatText();
  const setNodesDataMutation = useSetNodesDataMutation();

  const selectedNodes = useSelectedNodes();

  // Used to prevent navigation when changes have been made and not saved
  const [needsSubmission, setNeedsSubmission] = useState(false);

  // When the component is first rendered, we want to check wether the node text has been manually changed
  const [isInitial, setIsInitial] = useState(true);

  /** Updates the translation parameters, the preview text and the node, in relevant cases. */
  const updateTranslationValue = (
    node: NodeInfo,
    currentTranslation: string,
    updateNode = false
  ): string | null => {
    const newTranslation = updateTranslation({
      currentTranslation,
      pluralParamValue: node.pluralParamValue,
      paramsValues: node.paramsValues || {},
    });

    // To keep things fast, only update the node in relevant cases -> on blur of text-fields
    if (updateNode && newTranslation != null) {
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
    }
    return newTranslation;
  };

  const currentNode = useRef<NodeInfo | null>(initialNode);

  const [node, setNode] = useState<NodeInfo>(initialNode);

  useEffect(() => {
    setIsInitial(true);
    setNode({
      ...(selectedNodes.data?.items.find((n) => n.id === initialNode.id) ??
        selectedNodes.data?.items[0] ??
        initialNode),
    });
  }, [selectedNodes.data?.items, initialNode.id]);

  const translationLoadable = useTranslation({
    language: config?.language ?? "en",
    namespace: config?.namespace ?? "default",
    key: node.key,
  });
  const [translation, setTranslation] = useState(
    node.translation ||
      translationLoadable.translation?.translation ||
      node.characters
  );

  const [confirmTextChange, setConfirmTextChange] = useState<boolean>(false);
  const [hasChangesOutsideFromTolgee, setHasChangesOutsideFromTolgee] =
    useState<boolean | null>(null);

  useEffect(() => {
    if (
      needsSubmission &&
      currentNode.current &&
      currentNode.current.connected
    ) {
      // Update previous node before switching to a new one
      updateTranslationValue(currentNode.current, translation, true);
    }
    currentNode.current = node;
    // if node changes, reset to defaults
    setTranslation(
      node.translation || translationLoadable.translation?.translation || ""
    );
    setConfirmTextChange(false);
  }, [node]);

  /** Updates nodes properties with the partial data and mutates the data state within figma */
  const updateNodeData = (data: Partial<NodeInfo>) => {
    setNodesDataMutation.mutate({
      nodes: [{ ...node, ...data }],
    });
    setNode({ ...node, ...data });
  };

  const {
    previewText,
    previewTextIsError,
    textHasChanged,
    translationDiffersFromNode,
    placeholders,
    tolgeeValue,
    updateTranslation,
  } = useInterpolatedTranslation(node);

  useEffect(() => {
    setHasChangesOutsideFromTolgee(
      translationDiffersFromNode && node.connected
    );
  }, [node]);

  useEffect(() => {
    if (textHasChanged && !confirmTextChange) {
      return;
    }
    const newTranslation = stringFormatter(
      node.translation ||
        translationLoadable.translation?.translation ||
        node.characters,
      { replaceHtmlTags: false, replaceNewlines: true }
    );

    const previousCharacters = stringFormatter(node.characters);

    if (isInitial) {
      const newCharacters = stringFormatter(
        updateTranslationValue(node, newTranslation, true) ?? ""
      );

      if (newCharacters != null && newCharacters !== previousCharacters) {
        return;
      }
      setIsInitial(false);
    }

    if (confirmTextChange || !textHasChanged) {
      if (newTranslation !== translation) {
        setTranslation(newTranslation);
        updateTranslationValue(node, newTranslation, true);
      }
      setConfirmTextChange(false);
    }
  }, [
    translationLoadable.translation?.translation,
    node.translation,
    textHasChanged,
  ]);

  /** Used to show empty placeholder */
  const noSelectedNode = useMemo(
    () =>
      !selectedNodes.isLoading &&
      selectedNodes.data != null &&
      !selectedNodes.data?.items.find((n) => n.id === initialNode.id) &&
      !selectedNodes.data?.items[0],
    [selectedNodes.isLoading, selectedNodes.data?.items, initialNode.id]
  );

  if (
    connectedNodesLoadable.isLoading ||
    translationLoadable.isLoading ||
    formatText.isLoading
  ) {
    return <FullPageLoading text="Updating translations" />;
  }

  const infoString = `You can use basic HTML tags such as\n<strong>, <b>, <em>, <i>, <u>, <br>\nand also parameters as {parameter}`;

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
            needsSubmission ? (
              <Button
                onClick={() => {
                  updateNodeData({
                    translation,
                  });
                  updateTranslationValue(node, translation, true);
                  setNeedsSubmission(false);
                }}
              >
                {needsSubmission ? "Save changes" : "Back to list"}
              </Button>
            ) : undefined
          }
        />
      </Container>
      <Divider />
      {noSelectedNode ? (
        <Container space="medium" style={{ marginTop: 16 }}>
          <Text>No texts selected</Text>
        </Container>
      ) : (
        <Container space="medium">
          {(hasChangesOutsideFromTolgee ||
            node.isPlural ||
            placeholders.length > 0) && (
            <Container
              className={
                hasChangesOutsideFromTolgee
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
                    hasChangesOutsideFromTolgee
                      ? styles.warningContainerIcon
                      : styles.warningNoticeContainerIcon
                  }
                />
                <Muted>
                  Advanced text format detected. Edit the string via plugin to
                  preserve formatting.
                </Muted>
              </Columns>
              {hasChangesOutsideFromTolgee && (
                <Button
                  secondary
                  onClick={() => {
                    updateTranslationValue(node, translation, true);
                    setHasChangesOutsideFromTolgee(false);
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
            value={node.key}
            onChange={(e) => {
              node.key = e.currentTarget.value;
              updateNodeData({
                key: e.currentTarget.value,
              });
            }}
            variant="border"
          />
          <VerticalSpace space="medium" />
          <Checkbox
            disabled={node.connected}
            onChange={() => {
              const newPlural = !node.isPlural;
              updateNodeData({
                isPlural: newPlural,
                pluralParamValue: newPlural ? "value" : undefined,
              });
              updateTranslationValue(
                {
                  ...node,
                  isPlural: newPlural,
                  pluralParamValue: newPlural ? "value" : undefined,
                },
                tolgeeFormatGenerateIcu(
                  {
                    ...tolgeeValue,
                    parameter: newPlural ? "value" : undefined,
                  },
                  false
                ),
                true
              );
            }}
            value={node.isPlural}
          >
            <Text>is plural</Text>
          </Checkbox>
          <VerticalSpace space="medium" />
          <Muted className={styles.editorHeadline}>
            Translation ({config?.language ?? "Unknown"})
            <InfoTooltip>{infoString}</InfoTooltip>
          </Muted>
          <VerticalSpace space="small" />
          <PluralEditor
            onChange={(value) => {
              setNeedsSubmission(true);
              const generatedIcuString = tolgeeFormatGenerateIcu(value, false);
              if (generatedIcuString !== translation) {
                setTranslation(generatedIcuString);
              }
              updateTranslationValue(node, generatedIcuString, false);
            }}
            value={{
              ...tolgeeValue,
              parameter: node.isPlural ? node.pluralParamValue : undefined,
            }}
            locale={config?.language ?? "en"}
            mode="placeholders"
          />
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
                    value={node.pluralParamValue ?? ""}
                    onChange={({ currentTarget }) => {
                      setNeedsSubmission(true);
                      updateTranslationValue(
                        { ...node, pluralParamValue: currentTarget.value },
                        translation
                      );
                      updateNodeData({
                        pluralParamValue: currentTarget.value,
                      });
                    }}
                    variant="border"
                  />
                )}
                {placeholders.map((p) => (
                  <Fragment key={p}>
                    <div className={styles.paramRow}>
                      <Text>
                        <Muted>Variable</Muted> {p.name}
                      </Text>
                      <Textbox
                        style={{ flex: 1 }}
                        data-cy={`string_details_paramter_value_${p.name}`}
                        placeholder={p.name}
                        value={node.paramsValues?.[p.name] ?? ""}
                        onChange={({ currentTarget }) => {
                          setNeedsSubmission(true);
                          if (node.paramsValues) {
                            node.paramsValues[p.name] = currentTarget.value;
                          } else {
                            node.paramsValues = {
                              [p.name]: currentTarget.value,
                            };
                          }
                          updateTranslationValue(node, translation);
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
                <span
                  data-cy="string_details_preview_text"
                  style={{
                    color: previewTextIsError ? "red" : undefined,
                    whiteSpace: "pre-wrap",
                  }}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(previewText),
                  }}
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
