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
      /** See `selection-changed.hasUserSelection`. */
      hasUserSelection: boolean;
      editorType: "figma" | "dev";
    }
  | {
      type: "selection-changed";
      nodes: NodeInfo[];
      /**
       * `true` iff the user has at least one node selected on the current
       * page. When `false`, `nodes` holds the page-wide connected-node
       * fallback and a "you have a selection but … will be applied to all"
       * hint would be misleading.
       */
      hasUserSelection: boolean;
    }
  | { type: "page-changed"; config: Partial<TolgeeConfig> }
  | { type: "config-changed"; config: Partial<TolgeeConfig> }
  | {
      type: "screenshots-result";
      correlationId: string;
      screenshots: FrameScreenshot[];
    }
  | { type: "nodes-set-result"; correlationId: string; ok: boolean }
  | {
      type: "page-connected-nodes-result";
      correlationId: string;
      nodes: NodeInfo[];
    }
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
  /**
   * Request every connected text node on the current page, independent of
   * the user's current selection. Used by Pull when the language changes so
   * the new translations land on the whole page, not just selected layers.
   */
  | { type: "request-page-connected-nodes"; correlationId: string }
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
        /** Optional plural parameter name when isPlural === true. */
        pluralParamValue?: string;
        /** Optional sample parameter values for ICU preview. */
        paramsValues?: Record<string, string>;
        /** Optional key updates so a single round-trip can both label and
            re-render the node (used by StringDetails save). */
        key?: string;
        ns?: string;
        connected?: boolean;
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
