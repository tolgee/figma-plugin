import { Fragment, h } from "preact";
import {
  Checkbox,
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

import { TopBar } from "../../components/TopBar/TopBar";
import { useConnectedMutation } from "@/ui/hooks/useConnectedMutation";
import { NodeInfo } from "../../../types";
import { useEffect, useMemo, useState } from "preact/hooks";
import { PluralEditor } from "../../components/Editor/PluralEditor";
import {
  getPlaceholders,
  getTolgeeFormat,
  Placeholder,
  selectPluralRule,
  tolgeeFormatGenerateIcu,
} from "@tginternal/editor";
import { useTranslation } from "../../hooks/useTranslation";
import { useSetNodesDataMutation } from "../../hooks/useSetNodesDataMutation";
import { createFormatIcu } from "../../../createFormatIcu";
import { useSelectedNodes } from "../../hooks/useSelectedNodes";
import { useFormatText } from "../../hooks/useFormatText";
import { InfoTooltip } from "../../components/InfoTooltip/InfoTooltip";
import styles from "./StringDetails.css";

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

  const node = useMemo(() => {
    return (
      selectedNodes.data?.items.find((n) => n.id === initialNode.id) ??
      selectedNodes.data?.items[0] ??
      initialNode
    );
  }, [selectedNodes.data?.items, initialNode.id]);

  const translationLoadable = useTranslation({
    language: config?.language ?? "en",
    namespace: config?.namespace ?? "default",
    key: node.key,
  });

  const [isPlural, setIsPlural] = useState(node.isPlural ?? false);
  const [processing, setProcessing] = useState(false);
  const [pluralParamValue, setPluralParamValue] = useState(
    node.pluralParamValue ?? "1"
  );
  const [previewText, setPreviewText] = useState("");
  const [previewTextIsError, setPreviewTextIsError] = useState(false);
  const [translation, setTranslation] = useState(
    node.translation || translationLoadable.translation?.translation || ""
  );

  useEffect(() => {
    const newTranslation =
      node.translation || translationLoadable.translation?.translation || "";
    if (newTranslation !== translation) {
      setTranslation(newTranslation);
    }
    updateTranslation(node, node.paramsValues || {}, newTranslation, true);
  }, [translationLoadable.translation?.translation, node.translation]);

  /** Used to show empty placeholder */
  const noSelectedNode = useMemo(
    () =>
      !selectedNodes.isLoading &&
      selectedNodes.data != null &&
      !selectedNodes.data?.items.find((n) => n.id === initialNode.id) &&
      !selectedNodes.data?.items[0],
    [selectedNodes.isLoading, selectedNodes.data?.items, initialNode.id]
  );

  /** Updates nodes properties with the partial data and mutates the data state within figma */
  const updateNodeData = (data: Partial<NodeInfo>) => {
    setNodesDataMutation.mutate({
      nodes: [{ ...node, ...data }],
    });
    Object.entries(data).forEach(([key, value]) => {
      (node as any)[key] = value;
    });
  };

  /** The selectedPluralRole based on the pluralParamValue */
  const selectedPluralRole = useMemo(() => {
    const selectedPluralVariant = selectPluralRule(
      config?.language ?? "en",
      parseInt(pluralParamValue, 10)
    );
    updateNodeData({
      selectedPluralVariant,
    });

    return selectedPluralVariant;
  }, [pluralParamValue, config?.language]);

  /** Array of all placeholders within the current tolgeeValue plural variant */
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);

  /** The Tolgee format of the current translation */
  const tolgeeValue = useMemo(
    () => getTolgeeFormat(translation, isPlural, false),
    [translation, selectedPluralRole, isPlural]
  );

  /** Updates the translation parameters, the preview text and the node, in relevant cases. */
  const updateTranslation = (
    node: NodeInfo,
    paramsValues: Record<string, string>,
    currentTranslation: string,
    updateNode = false
  ) => {
    if (updateNode) {
      setProcessing(true);
    }
    const tolgeeValue = getTolgeeFormat(
      currentTranslation,
      node.isPlural,
      false
    );

    const placeholders =
      getPlaceholders(
        tolgeeValue.variants[selectedPluralRole] ||
          tolgeeValue.variants["other"] ||
          Object.values(tolgeeValue.variants)[0] ||
          ""
      )?.filter((p) => p.type === "variable") ?? [];

    setPlaceholders(placeholders);

    const formatter = createFormatIcu();

    const newParamValues: typeof paramsValues = {};
    // remove paramsValues that are not in the current placeholders
    Object.keys(paramsValues).forEach((key) => {
      if (placeholders.find((p) => p.name === key)) {
        newParamValues[key] = paramsValues[key];
      }
    });

    try {
      const pluralParam: Record<string, string> = {};
      if (tolgeeValue.parameter) {
        pluralParam[tolgeeValue.parameter] = pluralParamValue;
      }
      const formatted = formatter.format({
        language: config?.language ?? "en",
        translation: currentTranslation,
        params: {
          ...newParamValues,
          ...pluralParam,
        },
      });

      // To keep things fast, only update the node in relevant cases -> on blur of text-fields
      if (updateNode) {
        formatText.mutate({
          formatted,
          nodeInfo: node,
        });
        updateNodeData({
          characters: formatted,
          paramsValues: newParamValues,
        });
      }

      setPreviewText(formatted);
      setPreviewTextIsError(false);
    } catch (e) {
      // Add an error message as preview text if the formatting fails
      if ("message" in (e as any)) {
        setPreviewText((e as any).message);
        setPreviewTextIsError(true);
      } else {
        console.error(e);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Used to prevent navigation when changes have been made and not saved
  const [preventReturn, setPreventReturn] = useState(false);

  if (
    connectedNodesLoadable.isLoading ||
    translationLoadable.isLoading ||
    formatText.isLoading ||
    processing
  ) {
    return <FullPageLoading text="Updating translations" />;
  }

  const infoString = `You can use basic HTML tags such as\n<strong>, <b>, <em>, <i>, <u>, <br>\nand also parameters as {parameter}`;

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
                onClick={preventReturn ? undefined : () => setRoute("index")}
                style={{ transform: "rotate(90deg)" }}
              >
                <IconChevronDown16 />
              </IconButton>
              <Text>STRING DETAILS</Text>
            </Fragment>
          }
        />
      </Container>
      <Divider />
      <VerticalSpace space="large" />
      {noSelectedNode ? (
        <Container space="medium" style={{ marginTop: 16 }}>
          <Text>No texts selected</Text>
        </Container>
      ) : (
        <Container space="medium">
          <Text>
            <Muted>Key name</Muted>
          </Text>
          <VerticalSpace space="small" />
          <Textbox
            data-cy="string_details_input_key"
            placeholder="Key name"
            value={node.key}
            onChange={() => {
              // onChange(e.currentTarget.value);
            }}
            variant="border"
          />
          <VerticalSpace space="medium" />
          <Checkbox
            onChange={() => {
              updateNodeData({
                isPlural: !isPlural,
              });
              setIsPlural(!isPlural);
            }}
            value={isPlural}
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
              setPreventReturn(true);
              const generatedIcuString = tolgeeFormatGenerateIcu(value, false);
              if (generatedIcuString !== translation) {
                setTranslation(generatedIcuString);
              }
              updateTranslation(
                node,
                node.paramsValues || {},
                generatedIcuString,
                false
              );
            }}
            onBlur={() => {
              updateNodeData({
                translation,
              });
              updateTranslation(
                node,
                node.paramsValues || {},
                translation,
                true
              );
              setPreventReturn(false);
            }}
            value={tolgeeValue}
            locale={config?.language ?? "en"}
            mode="placeholders"
          />
          <VerticalSpace space="medium" />
          <div className={styles.bottomContainer}>
            {(placeholders.length > 0 || tolgeeValue.parameter) && (
              <div className={styles.paramsContainer}>
                <Muted className={styles.valuesText}>
                  Values for Figma{" "}
                  <InfoTooltip>
                    The value will be displayed in the Figma design
                  </InfoTooltip>
                </Muted>
                {tolgeeValue.parameter && (
                  <Textbox
                    data-cy="string_details_plural_paramter_value"
                    placeholder={tolgeeValue.parameter}
                    value={node.pluralParamValue ?? ""}
                    onChange={({ currentTarget }) => {
                      setPreventReturn(true);
                      setPluralParamValue(currentTarget.value);
                      updateNodeData({
                        pluralParamValue: currentTarget.value,
                      });
                    }}
                    onBlur={() => {
                      updateTranslation(
                        node,
                        node.paramsValues || {},
                        translation,
                        true
                      );
                      setPreventReturn(false);
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
                          setPreventReturn(true);
                          if (node.paramsValues) {
                            node.paramsValues[p.name] = currentTarget.value;
                          } else {
                            node.paramsValues = {
                              [p.name]: currentTarget.value,
                            };
                          }
                          updateTranslation(
                            node,
                            node.paramsValues || {},
                            translation
                          );
                        }}
                        onBlur={() => {
                          updateTranslation(
                            node,
                            node.paramsValues || {},
                            translation,
                            true
                          );
                          setPreventReturn(false);
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
                  style={{ color: previewTextIsError ? "red" : undefined }}
                  dangerouslySetInnerHTML={{ __html: previewText }}
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
