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
  /** Sample COUNT for the plural variable (a number, e.g. "1"/"10"), as the
   *  published plugin persisted it — the plural variable's NAME is read from the
   *  ICU, not stored here. Rendering also accepts the count from
   *  `paramsValues[name]` (how this UI edits it), see `interpolate.renderParams`. */
  pluralParamValue?: string;
  /** Sample values for ICU params, keyed by param NAME (incl. the plural one). */
  paramsValues?: Record<string, string>;
  name: string;
  characters: string;
  translation: string;
  id: string;
  isPlural: boolean;
  key: string;
  ns: string | undefined;
  connected: boolean;
  /**
   * The exact key value the auto-prefill last generated for this node
   * (persisted). Provenance marker so turning "Prefill key format" off can wipe
   * ONLY untouched auto keys: `clearPrefilledKeys` clears the key only while it
   * still equals this. Any manual edit changes `key` but not this marker, so
   * hand-typed/edited keys are preserved; a format change re-generates both, so
   * they stay in sync. Absent on manually-keyed nodes and on data from the
   * published plugin (which ignores this extra field — rollback-safe). */
  prefilledKey?: string;
  visible?: boolean;
  /**
   * Names of the node's relevant ancestors, resolved from the live Figma tree
   * (like `name`/`characters`, NOT persisted). They feed the parent key-format
   * placeholders — `{component}` / `{instance}` / `{frame}` / `{artboard}` /
   * `{section}` / `{group}`. Computed only when the configured `keyFormat`
   * actually uses one (see `getSelectionInfo`); otherwise left undefined.
   */
  component?: string;
  /** Layer name of the nearest component INSTANCE, feeding `{instance}` —
   *  distinct from `component` (the main component it was created from). */
  instance?: string;
  frame?: string;
  artboard?: string;
  section?: string;
  group?: string;
}

export type PartialNodeInfo = Partial<NodeInfo> & {
  id: string;
};

export type GlobalSettings = {
  apiUrl: string;
  apiKey: string;
  ignorePrefix: string;
  /** Ignore pure-integer strings ("100", "42") — matches the original plugin. */
  ignoreNumbers: boolean;
  /** Opt-in extension of `ignoreNumbers`: also ignore formatted numbers —
   *  decimals, thousands separators and signs ("1,234.00", "3.14", "+420").
   *  Off by default so the base behaviour stays pure-integer-only. */
  ignoreFormattedNumbers?: boolean;
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
    /** "keep original format" — no transformation. Stored as "" (matches the
     *  original plugin), and the default when unset. */
    | ""
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
  /**
   * Project id resolved from the API key during connection validation.
   * Persisted at the document scope so the inspect (Dev Mode) UI — which
   * cannot perform its own API validation — can construct project-aware
   * deep links into the Tolgee web app.
   */
  projectId?: number;
};

export type CurrentPageSettings = {
  language: string;
  pageInfo: boolean;
  pageCopy: boolean;
  pageStringDetails: boolean;
  pageSettings: boolean;
  nodeInfo?: NodeInfo;
  /**
   * The Figma page id this copy was cloned from — set only on pages created
   * by `createCopy` (both "keys" and "languages" modes). Lets `CopyView`
   * detect when the source page gained new connected keys since the copy
   * was made (Download only refreshes text on keys the copy already has, it
   * can't discover new ones) and offer to recreate the copy from scratch.
   * Absent on copies from an older plugin version or from production —
   * the staleness check just skips itself when it's missing.
   */
  sourcePageId?: string;
  /**
   * The language a "languages" copy was created in — an IMMUTABLE property of
   * the copy, written once by `createCopy`/`markPageAsCopy`. Distinct from
   * `language` (the selectable Push/Pull language, which shares the page scope
   * and can be repointed): `CopyView` must Download/Recreate in the language the
   * copy actually holds, not whatever `language` currently reads, so it reads
   * `copyLanguage` first. Absent on "keys" copies and pre-existing copies.
   */
  copyLanguage?: string;
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
  | { name: "settings"; tab?: "project" | "strings" | "upload" }
  | { name: "push" }
  | { name: "pull"; lang: string }
  | { name: "connect"; node: NodeInfo; bulkNodes?: NodeInfo[] }
  | { name: "stringDetails"; node: NodeInfo }
  | { name: "createCopy" };
