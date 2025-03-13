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
  }, [translationLoadable.translation?.translation, node.translation]);

  /** The selectedPluralRole based on the pluralParamValue */
  const selectedPluralRole = useMemo(() => {
    const pluralRole = selectPluralRule(
      config?.language ?? "en",
      parseInt(pluralParamValue, 10)
    );

    return pluralRole;
  }, [pluralParamValue, config?.language]);

  /** The Tolgee format of the current translation */
  const [editorValue, setEditorValue] = useState(() =>
    getTolgeeFormat(translation, isPlural, false)
  );

  /** Array of all placeholders within the current tolgeeValue plural variant */
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);

  /** The Tolgee format of the current translation */
  const tolgeeValue = useMemo(() => {
    const tolgeeFormat = getTolgeeFormat(translation, isPlural, false);
    setPlaceholders(
      getPlaceholders(
        tolgeeFormat.variants[selectedPluralRole] ||
          tolgeeFormat.variants["other"] ||
          Object.values(tolgeeFormat.variants)[0] ||
          ""
      )?.filter((p) => p.type === "variable") ?? []
    );
    return tolgeeFormat;
  }, [translation, selectedPluralRole, isPlural]);

  useEffect(() => {
    updateTranslation(node, node.paramsValues || {}, translation, true);
  }, [node.id]);

  useEffect(() => {
    node.selectedPluralVariant = selectedPluralRole;
    updateNodeData({
      selectedPluralVariant: selectedPluralRole,
    });
  }, [selectedPluralRole]);

  const updateNodeData = (data: Partial<NodeInfo>) => {
    setNodesDataMutation.mutate({
      nodes: [{ ...node, ...data }],
    });
  };

  const updateTranslation = (
    node: NodeInfo,
    paramsValues: Record<string, string>,
    currentTranslation: string,
    updateNode = false
  ) => {
    const tolgeeValue = getTolgeeFormat(currentTranslation, isPlural, false);

    const formatter = createFormatIcu();

    const newParamValues: typeof paramsValues = {};
    // remove paramsValues that are not in the current placeholders
    Object.keys(paramsValues).forEach((key) => {
      if (placeholders.find((p) => p.name === key)) {
        newParamValues[key] = paramsValues[key];
      }
    });

    try {
      const formatted = formatter.format({
        language: config?.language ?? "en",
        translation: currentTranslation,
        params: {
          ...newParamValues,
          [tolgeeValue.parameter ?? ""]: pluralParamValue,
        },
      });

      if (updateNode) {
        console.log("UPDATING NODE");
        formatText.mutate({
          formatted,
          nodeInfo: node,
        });
        console.log("UPDATING NODE DONE");

        node.paramsValues = newParamValues;
        updateNodeData({
          characters: formatted,
          paramsValues: newParamValues,
        });
        setEditorValue(getTolgeeFormat(currentTranslation, isPlural, false));
      }

      setPreviewText(formatted);
      setPreviewTextIsError(false);
    } catch (e) {
      if ("message" in (e as any)) {
        setPreviewText((e as any).message);
        setPreviewTextIsError(true);
      } else {
        console.error(e);
      }
    }
  };

  // Used to prevent navigation when changes have been made and not saved
  const [preventReturn, setPreventReturn] = useState(false);

  if (
    connectedNodesLoadable.isLoading ||
    translationLoadable.isLoading ||
    formatText.isLoading
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
            setEditorValue(getTolgeeFormat(translation, !isPlural, false));
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
            console.log("Setting node.translation to ", translation);
            node.translation = translation;
            updateNodeData({
              translation,
            });
            updateTranslation(node, node.paramsValues || {}, translation, true);
            setPreventReturn(false);
          }}
          value={editorValue}
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
                    node.pluralParamValue = currentTarget.value;
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
                          node.paramsValues = { [p.name]: currentTarget.value };
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
    </Fragment>
  );
};
