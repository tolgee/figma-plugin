import { useMutation } from "react-query";
import {
  formatTextEndpoint,
  FormatTextEndpointArgs,
} from "../../main/endpoints/formatText";
import { delayed } from "../../main/utils/delayed";

export const useFormatText = () => {
  const result = useMutation<void, unknown, FormatTextEndpointArgs>(
    [formatTextEndpoint.name],
    delayed((props: FormatTextEndpointArgs) => formatTextEndpoint.call(props))
  );
  return { ...result };
};
