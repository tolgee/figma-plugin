import { useMutation } from "react-query";
import {
  formatTextEndpoint,
  FormatTextEndpointArgs,
} from "../../main/endpoints/formatText";
import { delayed } from "../../main/utils/delayed";

/**
 * Takes the arguments from a node to format the textnode accodingly. Replacing some html tags like
 * bold, em, u, or br with the corresponding figma text styles.
 * It also replaces the text in the node with the interpolated string.
 */
export const useFormatText = () => {
  const result = useMutation<void, unknown, FormatTextEndpointArgs>(
    [formatTextEndpoint.name],
    delayed((props: FormatTextEndpointArgs) => formatTextEndpoint.call(props))
  );
  return { ...result };
};
