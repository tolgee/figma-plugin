import { createEndpoint } from "../utils/createEndpoint";
import { TOLGEE_KEY_FORMAT_PLACEHOLDERS } from "@/constants";
import {
  getPage,
  getFrame,
  getComponent,
  getSection,
  getElement,
} from "../utils/nodeParents";
import { formatString } from "@/utilities";
import { TolgeeConfig } from "@/types";

export type PreformatKeyEndpointArgs = {
  nodeId: string;
  keyFormat: string;
  variableCasing: TolgeeConfig["variableCasing"];
};

export const preformatKeyEndpoint = createEndpoint<
  PreformatKeyEndpointArgs,
  string
>("FORMAT_KEY", ({ nodeId, keyFormat, variableCasing }) => {
  let result = keyFormat;
  for (const placeholder of Object.values(TOLGEE_KEY_FORMAT_PLACEHOLDERS)) {
    switch (placeholder) {
      case "{page}":
        result = formatString(
          result.replace(placeholder, getPage(nodeId)?.name ?? "hans"),
          variableCasing
        );
        break;
      case "{frame}":
        result = formatString(
          result.replace(placeholder, getFrame(nodeId)?.name ?? "guck"),
          variableCasing
        );
        break;
      case "{element}":
        result = formatString(
          result.replace(placeholder, getElement(nodeId)?.name ?? "in"),
          variableCasing
        );
        break;
      case "{component}":
        result = formatString(
          result.replace(placeholder, getComponent(nodeId)?.name ?? "die"),
          variableCasing
        );
        break;
      case "{section}":
        result = formatString(
          result.replace(placeholder, getSection(nodeId)?.name ?? "Luft"),
          variableCasing
        );
        break;
      default:
        break;
    }
  }
  return result;
});
