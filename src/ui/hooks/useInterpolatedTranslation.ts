import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import {
  getPlaceholders,
  getTolgeeFormat,
  Placeholder,
} from "@tginternal/editor";
import { createFormatIcu } from "../../createFormatIcu";
import { useGlobalState } from "../state/GlobalState";

export const useInterpolatedTranslation = (
  rawTranslation: string,
  nodeCharacters: string,
  isPlural: boolean,
  pluralParamValue: string,
  paramsValues: Record<string, string>,
  selectedPluralVariant?: Intl.LDMLPluralRule
) => {
  const config = useGlobalState((c) => c.config);

  const interpolatedTranslation = useRef<string>(nodeCharacters);
  const textHasChanged = useRef<boolean>(false);
  const [previewText, setPreviewText] = useState<string>("");
  const [previewTextIsError, setPreviewTextIsError] = useState<boolean>(false);
  /** Array of all placeholders within the current tolgeeValue plural variant */
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);

  const updateTranslation = (args: {
    paramsValues: Record<string, string>;
    currentTranslation: string;
  }): string | null => {
    const { paramsValues, currentTranslation } = args;
    const tolgeeValue = getTolgeeFormat(currentTranslation, isPlural, false);

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
        pluralParam[tolgeeValue.parameter] = pluralParamValue ?? "1";
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
    const newCharacters = updateTranslation({
      paramsValues: paramsValues || {},
      currentTranslation: newTranslation,
    })?.replace(/<[^>]*>/g, "");

    if (newCharacters != null && newCharacters !== previousCharacters) {
      interpolatedTranslation.current = newCharacters;
      textHasChanged.current = true;
      return;
    }
  }, [rawTranslation]);

  const hasChangesOutsideFromTolgee = useMemo(
    () =>
      nodeCharacters != interpolatedTranslation.current &&
      (Object.keys(paramsValues ?? {}).length > 0 || isPlural),
    [interpolatedTranslation.current, nodeCharacters, paramsValues, isPlural]
  );

  return {
    placeholders,
    textHasChanged,
    interpolatedTranslation,
    previewText,
    previewTextIsError,
    hasChangesOutsideFromTolgee,
    updateTranslation,
  };
};
