import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import {
  getPlaceholders,
  getTolgeeFormat,
  Placeholder,
  selectPluralRule,
  TolgeeFormat,
} from "@tginternal/editor";
import { createFormatIcu } from "../../createFormatIcu";
import { useGlobalState } from "../state/GlobalState";
import { PartialNodeInfo } from "../../types";

export const useInterpolatedTranslation = (node: PartialNodeInfo) => {
  const config = useGlobalState((c) => c.config);
  const nodeCharacters = node.characters ?? "";
  const rawTranslation = (node.translation || node.characters) ?? "";
  const paramsValues = node.paramsValues ?? {};

  const isPlural = node.isPlural ?? false;
  const selectedPluralVariant = useMemo(() => {
    if (!node.isPlural) {
      return "other";
    }
    return selectPluralRule(
      config?.language ?? "en",
      parseInt(node.pluralParamValue || "1", 10)
    );
  }, [node, node.pluralParamValue, config?.language]);

  const interpolatedTranslation = useRef<string>(nodeCharacters);
  const textHasChanged = useRef<boolean>(false);
  const [previewText, setPreviewText] = useState<string>("");
  const [previewTextIsError, setPreviewTextIsError] = useState<boolean>(false);
  /** Array of all placeholders within the current tolgeeValue plural variant */
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [tolgeeValue, setTolgeeValue] = useState<TolgeeFormat>({
    variants: {},
  });

  const updateTranslation = (args: {
    paramsValues: Record<string, string>;
    pluralParamValue?: string;
    currentTranslation: string;
  }): string | null => {
    const { paramsValues, currentTranslation } = args;
    const tolgeeValue = getTolgeeFormat(currentTranslation, isPlural, false);
    setTolgeeValue(tolgeeValue);

    const newPlaceholders =
      getPlaceholders(
        selectedPluralVariant &&
          tolgeeValue.variants[selectedPluralVariant] != null
          ? tolgeeValue.variants[selectedPluralVariant]!
          : tolgeeValue.variants["other"] ||
              Object.values(tolgeeValue.variants)[0] ||
              ""
      )?.filter((p) => p.type === "variable") ?? [];

    if (
      newPlaceholders.some(
        (p) => placeholders.find((p2) => p2.name === p.name) == null
      ) ||
      placeholders.some(
        (p) => newPlaceholders.find((p2) => p2.name === p.name) == null
      )
    ) {
      setPlaceholders(newPlaceholders);
    }

    const formatter = createFormatIcu();

    const newParamValues: typeof paramsValues = {};
    // remove paramsValues that are not in the current placeholders
    Object.keys(paramsValues).forEach((key) => {
      if (newPlaceholders.find((p) => p.name === key)) {
        newParamValues[key] = paramsValues[key];
      }
    });

    try {
      const pluralParam: Record<string, string> = {};
      if (tolgeeValue.parameter) {
        pluralParam[tolgeeValue.parameter] =
          args.pluralParamValue ?? (node.pluralParamValue || "1");
      }
      const newInterpolatedTranslation: string = formatter.format({
        language: config?.language ?? "en",
        translation: currentTranslation,
        params: {
          ...newParamValues,
          ...pluralParam,
        },
      });

      setPreviewText(newInterpolatedTranslation);
      setPreviewTextIsError(false);
      interpolatedTranslation.current = newInterpolatedTranslation;
      return newInterpolatedTranslation;
    } catch (e) {
      // Add an error message as preview text if the formatting fails
      if ("message" in (e as any)) {
        setPreviewText((e as any).message);
        setPreviewTextIsError(true);
      } else {
        console.error(e);
      }
    }
    return null;
  };
  const newTranslation = rawTranslation.replace(/\u2028|\u8233/g, "\n\n");

  const previousCharacters = nodeCharacters.replace(/\u2028|\u8233/g, "\n\n");

  useEffect(() => {
    previousCharacters != newTranslation &&
    !isPlural &&
    placeholders.length === 0
      ? previousCharacters ?? newTranslation ?? ""
      : newTranslation ?? previousCharacters ?? "";

    const newCharacters = updateTranslation({
      paramsValues: paramsValues || {},
      currentTranslation: newTranslation,
    })?.replace(/<[^>]*>/g, "");

    if (newCharacters != null && newCharacters !== previousCharacters) {
      interpolatedTranslation.current = newCharacters;
      textHasChanged.current = true;
      return;
    }
  }, [rawTranslation, node.isPlural]);

  const translationDiffersFromNode = useMemo(() => {
    const res =
      nodeCharacters != interpolatedTranslation.current &&
      (Object.keys(paramsValues ?? {}).length > 0 || isPlural);
    return res;
  }, [
    interpolatedTranslation.current,
    newTranslation,
    nodeCharacters,
    paramsValues,
    isPlural,
    selectedPluralVariant,
    node,
  ]);

  return {
    placeholders,
    textHasChanged,
    interpolatedTranslation,
    previewText,
    previewTextIsError,
    translationDiffersFromNode,
    tolgeeValue,
    updateTranslation,
  };
};
