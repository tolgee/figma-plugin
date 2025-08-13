export const TOLGEE_PLUGIN_CONFIG_NAME = "tolgee_config";

export const TOLGEE_NODE_INFO = "tolgee_info";

export const TOLGEE_KEY_FORMAT_PLACEHOLDERS = {
  elementName: "{elementName}",
  elementText: "{elementText}",
  group: "{group}",
  component: "{component}",
  frame: "{frame}",
  artboard: "{artboard}",
  section: "{section}",
} as const;

export const TOLGEE_KEY_FORMAT_PLACEHOLDERS_EXAMPLES: {
  [key in keyof typeof TOLGEE_KEY_FORMAT_PLACEHOLDERS]: string;
} = {
  elementName: "My element",
  elementText: "My element text",
  group: "My group",
  component: "My Component",
  section: "My Section",
  artboard: "My Artboard",
  frame: "My Frame",
} as const;
