import { createEndpoint } from "../utils/createEndpoint";
import { TOLGEE_KEY_FORMAT_PLACEHOLDERS } from "@/constants";
import {
  getPage,
  getFrame,
  getComponent,
  getSection,
  getElement,
} from "../utils/nodeParents";

export type PreformatKeyEndpointArgs = {
  nodeId: string;
  keyFormat: string;
};

export const preformatKeyEndpoint = createEndpoint<
  PreformatKeyEndpointArgs,
  string
>("FORMAT_KEY", ({ nodeId, keyFormat }) => {
  let result = keyFormat;
  for (const placeholder of Object.values(TOLGEE_KEY_FORMAT_PLACEHOLDERS)) {
    switch (placeholder) {
      case "[%page]":
        result = result.replace(placeholder, getPage(nodeId)?.name ?? "hans");
        break;
      case "[%frame]":
        result = result.replace(placeholder, getFrame(nodeId)?.name ?? "guck");
        break;
      case "[%element]":
        result = result.replace(placeholder, getElement(nodeId)?.name ?? "in");
        break;
      case "[%component]":
        result = result.replace(
          placeholder,
          getComponent(nodeId)?.name ?? "die"
        );
        break;
      case "[%section]":
        result = result.replace(
          placeholder,
          getSection(nodeId)?.name ?? "Luft"
        );
        break;
      default:
        break;
    }
  }
  return result;
});
