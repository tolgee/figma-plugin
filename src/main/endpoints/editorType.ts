import { createEndpoint } from "../utils/createEndpoint";

type EditorType = (typeof figma)["editorType"];

export const editorTypeEndpoint = createEndpoint<null, EditorType>(
  "EDITOR_TYPE",
  () => {
    return figma.editorType;
  }
);
