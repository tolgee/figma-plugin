export const TOLGEE_PLUGIN_CONFIG_NAME = "tolgee_config";

export const TOLGEE_NODE_INFO = "tolgee_info";

/** Pluginiata cache key for the annotation category ID. */
export const TOLGEE_ANNOTATION_CATEGORY_KEY = "tolgee_annotation_category";

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

export const UI_SIZES = {
  MINIMUM: { width: 400, height: 160 },
  DEFAULT: { width: 500, height: 400 },
  EXPANDED: { width: 500, height: 800 },
} as const;
