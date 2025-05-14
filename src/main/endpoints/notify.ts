import { createEndpoint } from "../utils/createEndpoint";

export const notifyEndpoint = createEndpoint<string, void>("NOTIFY", (arg) => {
  figma.notify(arg);
});
