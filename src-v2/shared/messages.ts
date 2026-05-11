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
      type: "apply-translations-result";
      correlationId: string;
      ok: boolean;
      errors: string[];
    }
  | {
      type: "annotation-sync-result";
      correlationId: string;
      updated: number;
    }
  | {
      type: "annotations-state";
      correlationId: string;
      enabled: boolean;
      available: boolean;
    }
  | {
      type: "create-copy-progress";
      correlationId: string;
      current: number;
      total: number;
      phase: string;
    }
  | {
      type: "create-copy-result";
      correlationId: string;
      ok: boolean;
      createdPageIds: string[];
      error?: string;
    }
  | {
      type: "command";
      command: "open" | "open-on-node";
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
  /**
   * Persist a project id resolved from the API key during a successful
   * `Test Connection` in the design-mode UI. The main thread writes this
   * into the document-scoped config so the inspect (Dev Mode) UI can build
   * project-aware deep links without performing its own API validation.
   */
  | { type: "persist-project-id"; projectId: number }
  | { type: "reset" }
  | { type: "set-language"; language: string }
  | { type: "set-branch"; branch: string }
  | {
      type: "set-nodes-data";
      correlationId: string;
      nodes: Array<{ id: string; info: Partial<NodeInfo> }>;
    }
  | {
      type: "apply-translations";
      correlationId: string;
      updates: Array<{
        id: string;
        /** Final, ICU-formatted text to write into the TextNode. */
        text: string;
        /** Raw translation source to persist into plugin data. */
        translation: string;
        /** Optional plural flag to update along with the translation. */
        isPlural?: boolean;
      }>;
    }
  | {
      type: "request-screenshots";
      correlationId: string;
      nodeIds: string[];
    }
  | { type: "scroll-to-node"; id: string }
  | { type: "sync-annotations"; correlationId: string; all?: boolean }
  | { type: "toggle-annotations"; enabled: boolean }
  | { type: "get-annotations-state"; correlationId: string }
  | {
      type: "create-copy";
      correlationId: string;
      mode: "keys" | "languages";
      /** Required when `mode === "languages"`. List of language tags to copy. */
      languages?: string[];
      /**
       * Required when `mode === "languages"`. Map of language tag -> map of
       * `${ns}|${key}` -> translation text. The UI builds this from the
       * Tolgee API so the main thread doesn't need to refetch.
       */
      translations?: Record<string, Record<string, string>>;
    };

/**
 * Helper type to extract the message variant that carries a `correlationId`.
 * Useful for building request/response pairing in the message bus.
 */
export type WithCorrelationId<T> = T extends { correlationId: string }
  ? T
  : never;

export type MainToUiResponse = WithCorrelationId<MainToUi>;
export type UiToMainRequest = WithCorrelationId<UiToMain>;
