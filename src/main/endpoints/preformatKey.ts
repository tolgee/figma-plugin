import { createEndpoint } from "../utils/createEndpoint";
import { TOLGEE_KEY_FORMAT_PLACEHOLDERS } from "@/constants";
import { getAllParents } from "../utils/nodeParents";
import { formatString } from "@/utilities";
import { TolgeeConfig } from "@/types";

export type PreformatKeyEndpointArgs = {
  nodeId: string;
  keyFormat: string;
  variableCasing: TolgeeConfig["variableCasing"];
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replacePlaceholder(
  originalFormat: string,
  result: string,
  placeholder: string,
  value: string,
  variableCasing: TolgeeConfig["variableCasing"],
) {
  let newFormat = result;
  const replaceString = formatString(value, variableCasing);

  if (replaceString === "") {
    // If the value is empty, we need to remove the placeholder and the separator before it
    const textBeforePlaceholder = originalFormat.slice(
      0,
      originalFormat.indexOf(placeholder),
    );

    const separatorBeforePlaceholder = textBeforePlaceholder.slice(
      textBeforePlaceholder.lastIndexOf("}") + 1,
    );

    newFormat = newFormat.replace(
      new RegExp(
        `${escapeRegExp(separatorBeforePlaceholder)}${escapeRegExp(placeholder)}`,
        "g",
      ),
      "",
    );
  } else {
    // If the value is not empty, we need to replace the placeholder with the value
    newFormat = newFormat.replace(
      new RegExp(`${escapeRegExp(placeholder)}`, "g"),
      replaceString,
    );
  }
  return newFormat;
}

export const preformatKeyEndpoint = createEndpoint<
  PreformatKeyEndpointArgs,
  string
>("FORMAT_KEY", ({ nodeId, keyFormat, variableCasing }) => {
  const parents = getAllParents(nodeId);

  let result = keyFormat;
  for (const placeholder of Object.values(TOLGEE_KEY_FORMAT_PLACEHOLDERS)) {
    switch (placeholder) {
      case "{artboard}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          parents.artboard?.name ?? "",
          variableCasing,
        );
        break;
      case "{frame}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          parents.frame?.name ?? "",
          variableCasing,
        );
        break;
      case "{elementName}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          parents.element?.name ?? "",
          variableCasing,
        );
        break;
      case "{elementText}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          parents.element?.type === "TEXT" ? parents.element.characters : "",
          variableCasing,
        );
        break;
      case "{component}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          parents.component?.name ?? "",
          variableCasing,
        );
        break;
      case "{section}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          parents.section?.name ?? "",
          variableCasing,
        );
        break;
      case "{group}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          parents.group?.name ?? "",
          variableCasing,
        );
        break;
      default:
        break;
    }
  }
  return result;
});
