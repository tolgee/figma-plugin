export type SizeInfo = {
  width: number;
  height: number;
};

export type FrameInfo = SizeInfo & {
  id: string;
  name: string;
};

export type PositionInfo = {
  x: number;
  y: number;
};

export type FrameScreenshot = {
  image: Uint8Array;
  info: FrameInfo;
  keys: (NodeInfo & SizeInfo & PositionInfo)[];
};

export interface NodeInfo {
  pluralParamValue?: string;
  paramsValues?: Record<string, string>;
  name: string;
  characters: string;
  translation: string;
  id: string;
  isPlural: boolean;
  key: string;
  ns: string | undefined;
  connected: boolean;
  visible?: boolean;
}

export type PartialNodeInfo = Partial<NodeInfo> & {
  id: string;
};

export type GlobalSettings = {
  apiUrl: string;
  apiKey: string;
  ignorePrefix: string;
  ignoreNumbers: boolean;
  updateScreenshots?: boolean;
  addTags?: boolean;
  tags?: string[];
  /** Whether to prefill the key name with the key format */
  prefillKeyFormat?: boolean;
  /**
   * A string that can contain some of the following placeholders and custom separators
   * in order to generate a key name for the node.
   *
   * `{artboard}`
   *
   * `{frame}`
   *
   * `{elementName}` or `{elementText}`
   *
   * `{component}`
   *
   * `{section}` or `{group}`
   */
  keyFormat?: string;
  ignoreHiddenLayers?: boolean;
  ignoreHiddenLayersIncludingChildren?: boolean;
  ignoreTextLayers?: boolean;
  variableCasing?:
    | "snake_case"
    | "snake_case_capitalized"
    | "camelCase"
    | "PascalCase"
    | "noSpaces";
};

export type CurrentDocumentSettings = GlobalSettings & {
  namespace: string;
  branch?: string;
  documentInfo: true;
};

export type CurrentPageSettings = {
  language: string;
  pageInfo: boolean;
  pageCopy: boolean;
  pageStringDetails: boolean;
  nodeInfo?: NodeInfo;
};

export type TolgeeConfig = CurrentDocumentSettings & CurrentPageSettings;

export type FormattedNode = {
  characters: string;
  id: string;
  name: string;
};

export type WindowSize = {
  width: number;
  height: number;
};

export type InitialState = {
  config: Partial<TolgeeConfig> | null;
  selectedNodes: Array<NodeInfo>;
  allNodes: Array<NodeInfo>;
};

export type Route =
  | { name: "index" }
  | { name: "pageSetup" }
  | { name: "copyView" }
  | { name: "settings" }
  | { name: "push" }
  | { name: "pull"; lang: string }
  | { name: "connect"; node: NodeInfo }
  | { name: "stringDetails"; node: NodeInfo }
  | { name: "createCopy" };
