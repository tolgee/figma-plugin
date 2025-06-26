import { EventHandler } from "@create-figma-plugin/utilities";

export interface SetupHandle extends EventHandler {
  name: "SETUP";
  handler: (config: Partial<TolgeeConfig>) => void;
}

export interface ResetHandler extends EventHandler {
  name: "RESET";
  handler: () => void;
}

export interface SetLanguageHandler extends EventHandler {
  name: "SET_LANGUAGE";
  handler: (language: string) => void;
}

export interface ConfigChangeHandler extends EventHandler {
  name: "CONFIG_CHANGE";
  handler: (config: Partial<TolgeeConfig>) => void;
}

export interface CloseHandler extends EventHandler {
  name: "CLOSE";
  handler: () => void;
}

export interface SyncCompleteHandler extends EventHandler {
  name: "SYNC_COMPLETE";
  handler: () => void;
}

export interface ResizeHandler extends EventHandler {
  name: "RESIZE";
  handler: (size: WindowSize) => void;
}

export interface SelectionChangeHandler extends EventHandler {
  name: "SELECTION_CHANGE";
  handler: () => void;
}

export interface DocumentChangeHandler extends EventHandler {
  name: "DOCUMENT_CHANGE";
  handler: () => void;
}

export interface PageChangeHandler extends EventHandler {
  name: "CURRENT_PAGE_CHANGE";
  handler: (config: Partial<TolgeeConfig>) => void;
}

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
};

export type CurrentDocumentSettings = GlobalSettings & {
  namespace: string;
  namespacesDisabled: boolean;
  documentInfo: true;
  updateScreenshots?: boolean;
  addTags?: boolean;
  tags?: string[];
  prefillKeyName?: boolean;
  keyFormat?: string;
  ignoreHiddenLayers?: boolean;
  ignoreTextLayers?: boolean;
  textLayersPrefix?: string;
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
