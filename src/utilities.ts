import {
  EventHandler,
  emit as originalEmit,
} from "@create-figma-plugin/utilities";
import { TolgeeConfig } from "./types";
export { on, once } from "@create-figma-plugin/utilities";

export const emit = <Handler extends EventHandler>(
  name: Handler["name"],
  ...args: Parameters<Handler["handler"]>
): void => {
  const iframe = document?.getElementById("plugin_iframe") as HTMLIFrameElement;
  if (iframe) {
    iframe.contentWindow!.postMessage({ pluginMessage: [name, ...args] });
  } else {
    originalEmit(name, ...args);
  }
};

/**
 * Formats a string based on the format option by replacing all spaces with the matching
 */
export const formatString = (
  str: string,
  formatOption: TolgeeConfig["variableCasing"]
) => {
  switch (formatOption) {
    case "camelCase":
      return str
        .split(" ")
        .filter(Boolean)
        .map((word, index) =>
          index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
        )
        .join("");
    case "PascalCase":
      return str
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
    case "snake_case":
      return str
        .split(" ")
        .filter(Boolean)
        .map((word) => word.toLowerCase())
        .join("_");
    case "noSpaces":
      return str.replace(/\s/g, "");
  }
  return str;
};
