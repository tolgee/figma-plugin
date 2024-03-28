import {
  EventHandler,
  emit as originalEmit,
} from "@create-figma-plugin/utilities";
export { on, once } from "@create-figma-plugin/utilities";

export const emit = <Handler extends EventHandler>(
  name: Handler["name"],
  ...args: Parameters<Handler["handler"]>
): void => {
  const iframe = document?.getElementById("plugin_iframe") as HTMLIFrameElement;
  console.log({ name });
  if (iframe) {
    iframe.contentWindow!.postMessage({ pluginMessage: [name, ...args] });
  } else {
    originalEmit(name, ...args);
  }
};
