import { EventHandler } from "@create-figma-plugin/utilities";

export interface SetupHandle extends EventHandler {
  name: "SETUP";
  handler: (config: Partial<TolgeeConfig>) => void;
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

export interface TranslationsUpdateHandler extends EventHandler {
  name: "UPDATE_NODES";
  handler: (nodes: NodeInfo[]) => void;
}

export interface ResizeHandler extends EventHandler {
  name: "RESIZE";
  handler: (size: WindowSize) => void;
}

export interface SelectionChangeHandler extends EventHandler {
  name: "SELECTION_CHANGE";
  handler: (data: NodeInfo[]) => void;
}

export interface DocumentChangeHandler extends EventHandler {
  name: "DOCUMENT_CHANGE";
  handler: (data: NodeInfo[]) => void;
}

export interface SetNodesDataHandler extends EventHandler {
  name: "SET_NODES_DATA";
  handler: (nodes: NodeInfo[]) => void;
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
  name: string;
  characters: string;
  id: string;
  key: string;
  ns: string | undefined;
  connected: boolean;
}

export type PartialNodeInfo = Partial<NodeInfo> & {
  id: string;
};

export type GlobalSettings = {
  apiUrl: string;
  apiKey: string;
};

export type CurrentPageSettings = GlobalSettings & {
  language: string;
  namespace: string;
  namespacesDisabled: boolean;
};

export type TolgeeConfig = CurrentPageSettings;

export type FormattedNode = {
  characters: string;
  id: string;
  name: string;
};

export type WindowSize = {
  width: number;
  height: number;
};
