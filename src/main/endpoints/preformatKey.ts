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
  result: string,
  placeholder: string,
  value: string,
  variableCasing: TolgeeConfig["variableCasing"]
) {
  let newFormat = result;
  const replaceString = formatString(value, variableCasing);
  console.log(replaceString, placeholder);
  if (replaceString === "") {
    newFormat = newFormat.replace(new RegExp(`[^}]*${placeholder}`, "g"), "");
  } else {
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
          result,
          placeholder,
          getArtboard(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{frame}":
        result = replacePlaceholder(
          result,
          placeholder,
          getFrame(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{elementName}":
        result = replacePlaceholder(
          result,
          placeholder,
          getElement(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{elementText}": {
        const element = getElement(nodeId);
        result = replacePlaceholder(
          result,
          placeholder,
          element?.type === "TEXT" ? element.characters : "",
          variableCasing
        );
        break;
      }
      case "{component}":
        result = replacePlaceholder(
          result,
          placeholder,
          getComponent(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{section}":
        result = replacePlaceholder(
          result,
          placeholder,
          getSection(nodeId)?.name ?? "",
          variableCasing
        );
        break;
      case "{group}":
        result = replacePlaceholder(
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
