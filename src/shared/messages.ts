import type { KeyParentNames } from "./keyFormat";
import type { FrameScreenshot, NodeInfo, TolgeeConfig, WindowSize } from "./types";

/**
 * Messages sent from the main thread (Plugin sandbox) to the UI iframe.
 */
export type MainToUi =
  | {
      /**
       * A main-thread handler threw. Sent by the bus's error boundary so the
       * UI can settle whatever it armed for this request instead of waiting
       * out a multi-minute idle timeout (or, where there is no watchdog,
       * forever).
       */
      type: "handler-error";
      /** The UI→main message type whose handler failed. */
      forType: string;
      /** Present when the failed request carried one. */
      correlationId?: string;
    }
  | {
      type: "init";
      config: Partial<TolgeeConfig> | null;
      selectedNodes: NodeInfo[];
      /** See `selection-changed.hasUserSelection`. */
      hasUserSelection: boolean;
      editorType: "figma" | "dev";
      /** `figma.currentPage.name` — CopyView's header shows it directly
          (the page name already carries the language, e.g. "Home - cs"),
          so the UI never needs a page-content round trip just for a title. */
      pageName: string;
      /** Optional: navigate to this route immediately after init (used by E2E tests). */
      initialRoute?: string;
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
  | {
      /**
       * Emitted the instant `selectionchange` fires, BEFORE the (potentially
       * slow) selection scan. Lets the UI show a loader during the scan instead
       * of only after `selection-changed` arrives. Carries no data — the UI
       * just flips into a "scanning" state until the matching
       * `selection-changed` lands.
       */
      type: "selection-pending";
    }
  | {
      /** One chunk of a STREAMED selection scan. Large selections used to
          arrive as a single `selection-changed` only after every node's info
          was built — thousands of nodes meant many seconds of built-up work
          before the UI showed anything. Batches let the list render within
          the first ~100 nodes and fill in progressively; a superseding
          selection simply stops the remaining batches. `first: true`
          replaces the list, subsequent batches append. Closed by
          `selection-done`. (`selection-changed` remains for non-streamed
          senders: empty selections, init, and the e2e host.) */
      type: "selection-batch";
      nodes: NodeInfo[];
      first: boolean;
    }
  | {
      /** Terminal marker of a streamed selection scan. `total` lets the UI
          clear the list when the scan yielded zero usable text nodes (no
          `selection-batch` was sent at all). */
      type: "selection-done";
      hasUserSelection: boolean;
      total: number;
    }
  | { type: "page-changed"; config: Partial<TolgeeConfig>; pageName: string }
  | { type: "config-changed"; config: Partial<TolgeeConfig> }
  | {
      /** One exported frame. Screenshots stream one message per frame — a
          single message carrying every PNG serialized tens of MB on the
          canvas thread and held all buffers in memory at once. */
      type: "screenshot-frame";
      correlationId: string;
      screenshot: FrameScreenshot;
      index: number;
    }
  | {
      /** Terminal marker for a `request-screenshots` stream. `total` is the
          number of `screenshot-frame` messages that were sent. */
      type: "screenshots-done";
      correlationId: string;
      /** Frames actually delivered. */
      total: number;
      /** Frames whose export failed and were skipped, so the push summary can
       *  report the gap instead of presenting `total` as the whole set. */
      failed: number;
    }
  | {
      /** Progress for an in-flight `set-nodes-data` write. Same `total > 100`
          guard as `page-connected-nodes-progress`/`apply-translations-progress`
          — see `setNodesData` in `selection.ts`. The UI intentionally does NOT
          pair this by `correlationId`: the write-progress bar represents ANY
          in-flight large write (bulk actions in Index, auto-connect, and the
          save-queue's prefill/regen flush alike), not one specific request. */
      type: "nodes-set-progress";
      correlationId: string;
      done: number;
      total: number;
    }
  | {
      type: "nodes-set-result";
      correlationId: string;
      ok: boolean;
      /** Fresh post-write snapshots of the updated nodes. The UI patches its
          selection in place from these — the main thread deliberately does
          NOT re-scan the whole selection after a write (that full re-scan
          per write is what froze large selections). */
      nodes: NodeInfo[];
    }
  | {
      /** Parent placeholder names resolved on demand — see the matching
          `resolve-parent-names` request. Keyed by node id; a missing id (or
          missing field) means the node has no such ancestor. */
      type: "parent-names-result";
      correlationId: string;
      parents: Record<string, KeyParentNames>;
    }
  | {
      /** Progress for a `request-page-connected-nodes` scan. Only sent when
          `total > 100` (small pages resolve fast enough that the message
          traffic would just be noise) — see `getNodeInfo` loop in
          `scan.ts:buildConnectedNodesInfo`. Also doubles as an idle-timeout
          "still alive" signal for `pageNodes.ts`'s watchdog. */
      type: "page-connected-nodes-progress";
      correlationId: string;
      done: number;
      total: number;
    }
  | {
      type: "page-connected-nodes-result";
      correlationId: string;
      nodes: NodeInfo[];
    }
  | {
      /** Progress for an in-flight `apply-translations` write. Same `total >
          100` guard and idle-timeout role as `page-connected-nodes-progress`
          — see `applyTranslations` in `selection.ts`. */
      type: "apply-translations-progress";
      correlationId: string;
      done: number;
      total: number;
    }
  | {
      type: "apply-translations-result";
      correlationId: string;
      ok: boolean;
      errors: string[];
      /** See `nodes-set-result.nodes` — post-write snapshots for in-place
          patching instead of a full selection re-scan. */
      nodes: NodeInfo[];
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
      /** Layer names a missing font prevented writing — they keep their
       *  ORIGINAL text instead of the key label, so the count is reported
       *  rather than left to a dev-only console warning. */
      skippedMissingFont?: string[];
      /**
       * Languages mode only: the connected nodes of each freshly cloned page.
       * The main thread deliberately does NOT write translated text itself —
       * ICU rendering needs `Intl` (plural rules), which doesn't exist in
       * Figma's main-thread sandbox; every `{param}`/plural render silently
       * failed there and the copy kept the source-language text. The UI takes
       * these nodes, renders each one exactly like the Download flow, and
       * writes them back via the ordinary `apply-translations` request — so a
       * fresh copy is BY CONSTRUCTION identical to clone + Download all.
       */
      pages?: Array<{ pageId: string; language: string; nodes: NodeInfo[] }>;
      error?: string;
    }
  | {
      type: "copy-staleness-result";
      correlationId: string;
      ok: boolean;
      /** Connected strings on the source page this copy doesn't have yet. */
      missingCount?: number;
      /** Connected strings the source page lost since the copy was made. */
      removedCount?: number;
      error?: string;
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
  /**
   * Resolve the parent placeholder names ({component}/{frame}/…) for specific
   * nodes on demand. The selection scan only fills these when the SAVED format
   * uses them; the bulk "Generate key names" action lets the user type an
   * ad-hoc template, so it asks for them here right before formatting.
   */
  | { type: "resolve-parent-names"; correlationId: string; nodeIds: string[] }
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
  | {
      type: "create-copy";
      correlationId: string;
      mode: "keys" | "languages";
      /** Required when `mode === "languages"`. List of language tags to copy.
       *  The translations themselves never cross the bridge: the main thread
       *  only clones and returns the clones' connected nodes (see
       *  `create-copy-result.pages`); the UI renders and applies the text via
       *  `apply-translations` — ICU rendering needs `Intl`, which Figma's
       *  main-thread sandbox doesn't have. */
      languages?: string[];
      /**
       * Only set by CopyView's "Recreate copy" — `figma.currentPage` there is
       * the copy itself, not the page to clone from. Omitted for the normal
       * Index-invoked "Create page" flow (defaults to `figma.currentPage`).
       */
      sourcePageId?: string;
      /**
       * `mode: "keys"` only — whether to prefix the written key label with its
       * namespace (`ns.key` vs plain `key`), matching `namespacedKeyLabel`'s
       * gate everywhere else in the app. The main thread has no access to
       * `auth.value.namespacesEnabled` (a UI-side, API-derived flag, not a
       * persisted setting `readMergedConfig` can see), so the UI sends it.
       */
      namespacesEnabled?: boolean;
    }
  | { type: "request-copy-staleness"; correlationId: string };
