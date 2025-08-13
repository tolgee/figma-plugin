import { createEndpoint } from "../utils/createEndpoint";
import { TOLGEE_KEY_FORMAT_PLACEHOLDERS } from "@/constants";
import {
  getFrame,
  getComponent,
  getSection,
  getElement,
  getArtboard,
  getGroup,
} from "../utils/nodeParents";
import { formatString } from "@/utilities";
import { TolgeeConfig } from "@/types";

export type PreformatKeyEndpointArgs = {
  nodeId: string;
  keyFormat: string;
  variableCasing: TolgeeConfig["variableCasing"];
};

function replacePlaceholder(
  originalFormat: string,
  result: string,
  placeholder: string,
  value: string,
  variableCasing: TolgeeConfig["variableCasing"]
) {
  let newFormat = result;
  const replaceString = formatString(value, variableCasing);

  if (replaceString === "") {
    // If the value is empty, we need to remove the placeholder and the separator before it
    const textBeforePlaceholder = originalFormat.slice(
      0,
      originalFormat.indexOf(placeholder)
    );

    const separatorBeforePlaceholder = textBeforePlaceholder.slice(
      textBeforePlaceholder.lastIndexOf("}") + 1
    );

    newFormat = newFormat.replace(
      new RegExp(`${separatorBeforePlaceholder}${placeholder}`, "g"),
      ""
    );
  } else {
    // If the value is not empty, we need to replace the placeholder with the value
    newFormat = newFormat.replace(
      new RegExp(`${placeholder}`, "g"),
      replaceString
    );
  }
  return newFormat;
}

export const preformatKeyEndpoint = createEndpoint<
  PreformatKeyEndpointArgs,
  string
>("FORMAT_KEY", ({ nodeId, keyFormat, variableCasing }) => {
  let result = keyFormat;
  for (const placeholder of Object.values(TOLGEE_KEY_FORMAT_PLACEHOLDERS)) {
    switch (placeholder) {
      case "{artboard}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          getArtboard(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{frame}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          getFrame(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{elementName}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          getElement(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{elementText}": {
        const element = getElement(nodeId);
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          element?.type === "TEXT" ? element.characters : "",
          variableCasing
        );
        break;
      }
      case "{component}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          getComponent(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{section}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          getSection(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{group}":
        result = replacePlaceholder(
          keyFormat,
          result,
          placeholder,
          getGroup(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      default:
        break;
    }
  }
  return result;
});
