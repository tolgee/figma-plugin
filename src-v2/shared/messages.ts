import type {
  FrameScreenshot,
  NodeInfo,
  TolgeeConfig,
  WindowSize,
} from "./types";

/**
 * Messages sent from the main thread (Plugin sandbox) to the UI iframe.
 */
export type MainToUi =
  | {
      type: "init";
      config: Partial<TolgeeConfig> | null;
      selectedNodes: NodeInfo[];
      editorType: "figma" | "dev";
    }
  | { type: "selection-changed"; nodes: NodeInfo[] }
  | { type: "page-changed"; config: Partial<TolgeeConfig> }
  | { type: "config-changed"; config: Partial<TolgeeConfig> }
  | {
      type: "screenshots-result";
      correlationId: string;
      screenshots: FrameScreenshot[];
    }
  | { type: "nodes-set-result"; correlationId: string; ok: boolean }
  | {
      type: "annotation-sync-result";
      correlationId: string;
      updated: number;
    }
  | {
      type: "command";
      command:
        | "open"
        | "toggle-annotations"
        | "refresh-annotations"
        | "open-on-node";
    };

/**
 * Messages sent from the UI iframe back to the main thread (Plugin sandbox).
 */
export type UiToMain =
  | { type: "ui-ready" }
  | { type: "resize"; size: WindowSize }
  | { type: "close" }
  | { type: "notify"; text: string; error?: boolean }
  | { type: "open-external"; url: string }
  | { type: "save-config"; config: Partial<TolgeeConfig> }
  | { type: "reset" }
  | { type: "set-language"; language: string }
  | { type: "set-branch"; branch: string }
  | {
      type: "set-nodes-data";
      correlationId: string;
      nodes: Array<{ id: string; info: Partial<NodeInfo> }>;
    }
  | {
      type: "request-screenshots";
      correlationId: string;
      nodeIds: string[];
    }
  | { type: "scroll-to-node"; id: string }
  | { type: "sync-annotations"; correlationId: string; all?: boolean };

/**
 * Helper type to extract the message variant that carries a `correlationId`.
 * Useful for building request/response pairing in the message bus.
 */
export type WithCorrelationId<T> = T extends { correlationId: string }
  ? T
  : never;

export type MainToUiResponse = WithCorrelationId<MainToUi>;
export type UiToMainRequest = WithCorrelationId<UiToMain>;
