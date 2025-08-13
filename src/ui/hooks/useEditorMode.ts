import { useQuery } from "react-query";
import { editorTypeEndpoint } from "../../main/endpoints/editorType";

export const useEditorMode = () => {
  return useQuery([editorTypeEndpoint.name], () =>
    // eslint-disable-next-line no-useless-call
    editorTypeEndpoint.call(null)
  );
};
