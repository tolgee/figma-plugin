/// <reference types="@figma/plugin-typings" />
/// <reference types="@figma/widget-typings" />

declare const EDIT_HTML: string;

const { widget } = figma;
const {
  Text,
  Span,
  useSyncedState,
  usePropertyMenu,
  useWidgetNodeId,
  useEffect,
} = widget;

const WIDGET_ID = "tolgee-widget-spike-local";
const TOLGEE_NODE_INFO = "tolgee_info";

type Token = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

type HAlign = "left" | "right" | "center" | "justified";
type VAlign = "top" | "center" | "bottom";

function stripMarkup(input: string): string {
  return input.replace(/<\/?(b|strong|i|em|u)>/gi, "");
}

function parseInline(input: string): Token[] {
  const tokens: Token[] = [];
  const regex = /<(\/?)(b|strong|i|em|u)>|([^<]+)/gi;
  let m: RegExpExecArray | null;
  let bold = false;
  let italic = false;
  let underline = false;
  while ((m = regex.exec(input)) !== null) {
    if (m[3] !== undefined) {
      tokens.push({ text: m[3], bold, italic, underline });
      continue;
    }
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (tag === "b" || tag === "strong") bold = !closing;
    else if (tag === "i" || tag === "em") italic = !closing;
    else if (tag === "u") underline = !closing;
  }
  return tokens;
}

type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

function styleToWeight(style: string): Weight {
  const s = style.toLowerCase();
  if (s.includes("thin")) return 100;
  if (s.includes("extra light") || s.includes("ultralight")) return 200;
  if (s.includes("light")) return 300;
  if (s.includes("medium")) return 500;
  if (s.includes("semi") || s.includes("demi")) return 600;
  if (s.includes("extra bold") || s.includes("ultra")) return 800;
  if (s.includes("black") || s.includes("heavy")) return 900;
  if (s.includes("bold")) return 700;
  return 400;
}

function rgbToHex(c: RGB): string {
  const to = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(c.r)}${to(c.g)}${to(c.b)}`;
}

function readTextProps(node: TextNode) {
  let fontSize = 16;
  let fontFamily = "Inter";
  let fontWeight: Weight = 400;
  let fill = "#000000";

  try {
    const fs = node.getRangeFontSize(0, Math.min(1, node.characters.length));
    if (typeof fs === "number") fontSize = fs;
  } catch {
    /* ignore */
  }

  try {
    const fn = node.getRangeFontName(0, Math.min(1, node.characters.length));
    if (typeof fn === "object" && "family" in fn) {
      fontFamily = fn.family;
      fontWeight = styleToWeight(fn.style);
    }
  } catch {
    /* ignore */
  }

  const fills = node.fills;
  if (Array.isArray(fills) && fills.length > 0) {
    const first = fills[0];
    if (first.type === "SOLID") fill = rgbToHex(first.color);
  }

  const hAlignMap: Record<string, HAlign> = {
    LEFT: "left",
    RIGHT: "right",
    CENTER: "center",
    JUSTIFIED: "justified",
  };
  const vAlignMap: Record<string, VAlign> = {
    TOP: "top",
    CENTER: "center",
    BOTTOM: "bottom",
  };
  const horizontalAlignText: HAlign = hAlignMap[node.textAlignHorizontal];
  const verticalAlignText: VAlign = vAlignMap[node.textAlignVertical];

  // For alignment to take effect, width must be fixed (not hug).
  const widthFixed = node.textAutoResize !== "WIDTH_AND_HEIGHT";
  const widgetWidth = widthFixed ? node.width : undefined;

  return {
    fontSize,
    fontFamily,
    fontWeight,
    fill,
    horizontalAlignText,
    verticalAlignText,
    widgetWidth,
  };
}

async function findAllSpikeWidgets() {
  await figma.loadAllPagesAsync();
  return figma.root.findWidgetNodesByWidgetId(WIDGET_ID);
}

const SETTINGS_KEY = "tolgee_spike_settings_v1";

type Settings = { apiUrl: string; apiKey: string; language: string };

async function getSettings(): Promise<Settings> {
  const raw = await figma.clientStorage.getAsync(SETTINGS_KEY);
  if (raw) {
    try {
      return { language: "en", ...(JSON.parse(raw) as Partial<Settings>) } as Settings;
    } catch {
      /* fallthrough */
    }
  }
  return { apiUrl: "https://app.tolgee.io", apiKey: "", language: "en" };
}

async function saveSettings(s: Settings) {
  await figma.clientStorage.setAsync(SETTINGS_KEY, JSON.stringify(s));
}

type FetchInit = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
};

async function tolgeeFetch(path: string, init?: FetchInit) {
  const { apiUrl, apiKey } = await getSettings();
  if (!apiKey) throw new Error("API key not set");
  const url = apiUrl.replace(/\/$/, "") + path;
  const res = await fetch(url, {
    method: init?.method,
    body: init?.body,
    headers: {
      ...(init?.headers ?? {}),
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tolgee ${res.status}: ${body.slice(0, 200)}`);
  }
  return res;
}

async function pullTranslations(language: string) {
  // simple non-paginated pull; size=10000 covers most projects for spike purposes
  const json = (await (
    await tolgeeFetch(
      `/v2/projects/translations?languages=${encodeURIComponent(language)}&size=10000`,
    )
  ).json()) as {
    _embedded?: {
      keys?: Array<{
        keyName: string;
        translations: Record<string, { text?: string } | undefined>;
      }>;
    };
  };

  const map = new Map<string, string>();
  for (const k of json._embedded?.keys ?? []) {
    const t = k.translations?.[language]?.text;
    if (typeof t === "string") map.set(k.keyName, t);
  }

  const nodes = await findAllSpikeWidgets();
  let updated = 0;
  let unchanged = 0;
  let missing = 0;
  for (const node of nodes) {
    const state = node.widgetSyncedState ?? {};
    const k = state.keyName as string | undefined;
    if (!k) continue;
    const next = map.get(k);
    if (next === undefined) {
      missing++;
      continue;
    }
    if (next === state.translation) {
      unchanged++;
      continue;
    }
    node.setWidgetSyncedState({
      ...state,
      translation: next,
      rev: ((state.rev as number) ?? 0) + 1,
    });
    updated++;
  }
  return { updated, unchanged, missing, totalKeysOnServer: map.size };
}

async function pushTranslations(language: string) {
  const nodes = await findAllSpikeWidgets();
  const byKey = new Map<string, string>();
  for (const node of nodes) {
    const state = node.widgetSyncedState ?? {};
    const k = state.keyName as string | undefined;
    const t = state.translation as string | undefined;
    if (!k || typeof t !== "string") continue;
    // last write wins for duplicate keys; could collect conflicts in v2
    byKey.set(k, t);
  }
  if (byKey.size === 0) return { pushed: 0 };

  const keys = Array.from(byKey.entries()).map(([name, text]) => ({
    name,
    translations: {
      [language]: { text, resolution: "OVERRIDE" as const },
    },
  }));

  await tolgeeFetch("/v2/projects/single-step-import-resolvable", {
    method: "POST",
    body: JSON.stringify({ keys }),
  });

  return { pushed: byKey.size };
}

async function pushTranslationToAll(matchKey: string, translation: string) {
  const nodes = await findAllSpikeWidgets();
  const t0 = Date.now();
  let updated = 0;
  for (const node of nodes) {
    const state = node.widgetSyncedState ?? {};
    if (state.keyName !== matchKey) continue;
    node.setWidgetSyncedState({
      ...state,
      translation,
      rev: ((state.rev as number) ?? 0) + 1,
    });
    updated++;
  }
  return { count: nodes.length, updated, ms: Date.now() - t0 };
}

async function bumpAllWidgets() {
  const nodes = await findAllSpikeWidgets();
  const t0 = Date.now();
  for (const node of nodes) {
    const state = node.widgetSyncedState ?? {};
    node.setWidgetSyncedState({
      ...state,
      rev: ((state.rev as number) ?? 0) + 1,
    });
  }
  return { count: nodes.length, ms: Date.now() - t0 };
}

async function convertTextNodes(
  myWidgetNodeId: string,
  scope: "selection" | "page",
) {
  await figma.loadAllPagesAsync();
  const myNode = (await figma.getNodeByIdAsync(myWidgetNodeId)) as
    | WidgetNode
    | null;
  if (!myNode) return { converted: 0, error: "self not found" };

  const candidates: TextNode[] = [];
  if (scope === "selection") {
    for (const n of figma.currentPage.selection) {
      if (n.type === "TEXT") candidates.push(n);
    }
  } else {
    const walk = (children: readonly SceneNode[]) => {
      for (const c of children) {
        if (c.type === "TEXT") candidates.push(c);
        if ("children" in c) walk((c as ChildrenMixin).children);
      }
    };
    walk(figma.currentPage.children);
  }

  let converted = 0;
  for (const textNode of candidates) {
    let keyName: string | null = null;
    let translation = textNode.characters;

    // 1. Prefer the key stored by the legacy plugin in pluginData.
    const data = textNode.getPluginData(TOLGEE_NODE_INFO);
    if (data) {
      try {
        const parsed = JSON.parse(data) as Partial<{
          key: string;
          translation: string;
        }>;
        if (typeof parsed.key === "string" && parsed.key.length > 0) {
          keyName = parsed.key;
        }
        if (typeof parsed.translation === "string" && parsed.translation) {
          translation = parsed.translation;
        }
      } catch {
        /* ignore malformed pluginData */
      }
    }

    // 2. Legacy README convention: TextNode named "t:my.key.name".
    if (!keyName && textNode.name.startsWith("t:")) {
      const stripped = textNode.name.slice(2).trim();
      if (stripped) keyName = stripped;
    }

    // 3. Fallback: random placeholder so the user can fix it later.
    if (!keyName) {
      keyName = "key-" + Math.random().toString(36).slice(2, 8);
    }

    const props = readTextProps(textNode);

    const widget = myNode.cloneWidget({
      keyName,
      translation,
      fontSize: props.fontSize,
      fontFamily: props.fontFamily,
      fontWeight: props.fontWeight,
      fill: props.fill,
      horizontalAlignText: props.horizontalAlignText,
      verticalAlignText: props.verticalAlignText,
      widgetWidth: props.widgetWidth,
    });

    const parent = textNode.parent;
    if (parent && "children" in parent && "insertChild" in parent) {
      const idx = (parent as ChildrenMixin).children.indexOf(textNode);
      const p = parent as ChildrenMixin & {
        insertChild(i: number, c: SceneNode): void;
      };
      if (idx >= 0) p.insertChild(idx, widget);
      else (parent as ChildrenMixin).appendChild(widget);
    }
    widget.x = textNode.x;
    widget.y = textNode.y;

    textNode.remove();
    converted++;
  }

  return { converted, scope };
}

async function selfUpdate(
  myWidgetNodeId: string,
  patch: Record<string, unknown>,
) {
  const myNode = (await figma.getNodeByIdAsync(myWidgetNodeId)) as
    | WidgetNode
    | null;
  if (!myNode) return;
  const merged: Record<string, unknown> = {
    ...(myNode.widgetSyncedState ?? {}),
    ...patch,
    rev: ((myNode.widgetSyncedState?.rev as number) ?? 0) + 1,
  };
  // Figma rejects `undefined` values. Strip them so useSyncedState falls back to its default.
  for (const k of Object.keys(merged)) {
    if (merged[k] === undefined) delete merged[k];
  }
  myNode.setWidgetSyncedState(merged);
}

function TolgeeSpikeWidget() {
  const widgetNodeId = useWidgetNodeId();
  const [keyName] = useSyncedState<string>("keyName", "greeting");
  const [translation] = useSyncedState<string>(
    "translation",
    "Hello <b>Tolgee</b>!",
  );
  const [fontSize] = useSyncedState<number>("fontSize", 16);
  const [fontFamily] = useSyncedState<string>("fontFamily", "Inter");
  const [fontWeight] = useSyncedState<Weight>("fontWeight", 400);
  const [fill] = useSyncedState<string>("fill", "#000000");
  const [horizontalAlignText] = useSyncedState<HAlign | undefined>(
    "horizontalAlignText",
    undefined,
  );
  const [verticalAlignText] = useSyncedState<VAlign | undefined>(
    "verticalAlignText",
    undefined,
  );
  const [widgetWidth] = useSyncedState<number | undefined>(
    "widgetWidth",
    undefined,
  );
  const [rev] = useSyncedState<number>("rev", 0);

  // Keep WidgetNode.name in sync with the translation so the layer panel
  // shows the actual text instead of "Tolgee Widget Spike".
  useEffect(() => {
    const desiredName = stripMarkup(translation).trim() || "(empty)";
    figma.getNodeByIdAsync(widgetNodeId).then((node) => {
      if (node && node.name !== desiredName) {
        node.name = desiredName;
      }
    });
  });

  usePropertyMenu(
    [
      { itemType: "action", tooltip: "Edit text", propertyName: "edit" },
      { itemType: "action", tooltip: "Open Spike UI", propertyName: "open" },
      { itemType: "separator" },
      { itemType: "action", tooltip: "Show info", propertyName: "info" },
    ],
    async ({ propertyName }) => {
      if (propertyName === "edit") {
        return new Promise<void>((resolve) => {
          figma.showUI(EDIT_HTML, { width: 360, height: 280, title: "Edit" });
          figma.ui.postMessage({
            type: "INIT",
            key: keyName,
            translation,
          });
          figma.ui.onmessage = async (msg: any) => {
            if (msg.type === "EDIT_SAVE") {
              await selfUpdate(widgetNodeId, {
                keyName: msg.key,
                translation: msg.translation,
              });
              resolve();
            } else if (msg.type === "EDIT_CANCEL") {
              resolve();
            }
          };
        });
      }
      if (propertyName === "open") {
        return new Promise<void>((resolve) => {
          figma.showUI(__html__, { width: 380, height: 540, title: "Spike" });
          // Send current settings on open so the UI is pre-populated.
          getSettings().then((s) =>
            figma.ui.postMessage({ type: "SETTINGS", ...s }),
          );

          figma.ui.onmessage = async (msg: any) => {
            const reply = (op: string, payload: Record<string, unknown> = {}) =>
              figma.ui.postMessage({ type: "DONE", op, ...payload });
            try {
              if (msg.type === "SAVE_SETTINGS") {
                await saveSettings({
                  apiUrl: msg.apiUrl,
                  apiKey: msg.apiKey,
                  language: msg.language,
                });
                reply("SAVE_SETTINGS");
              } else if (msg.type === "PULL") {
                const result = await pullTranslations(msg.language);
                reply("PULL", result);
              } else if (msg.type === "PUSH") {
                const result = await pushTranslations(msg.language);
                reply("PUSH", result);
              } else if (msg.type === "CONVERT_SELECTED") {
                const result = await convertTextNodes(widgetNodeId, "selection");
                reply("CONVERT_SELECTED", result);
              } else if (msg.type === "CONVERT_PAGE") {
                const result = await convertTextNodes(widgetNodeId, "page");
                reply("CONVERT_PAGE", result);
              } else if (msg.type === "DUMP_STATES") {
                const nodes = await findAllSpikeWidgets();
                reply("DUMP_STATES", {
                  states: nodes.map((n) => ({
                    id: n.id,
                    keyName: n.widgetSyncedState?.keyName,
                    translation: n.widgetSyncedState?.translation,
                    rev: n.widgetSyncedState?.rev,
                  })),
                });
              } else if (msg.type === "BENCHMARK_BUMP") {
                const result = await bumpAllWidgets();
                reply("BENCHMARK_BUMP", result);
              } else if (msg.type === "CLOSE") {
                resolve();
              }
            } catch (e) {
              reply(msg.type, { error: String(e) });
            }
          };
        });
      }
      if (propertyName === "info") {
        figma.notify(
          `key=${keyName} · rev=${rev} · ${translation.slice(0, 60)}${translation.length > 60 ? "…" : ""}`,
        );
      }
    },
  );

  const tokens = parseInline(translation);

  return (
    <Text
      name={keyName}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      fill={fill}
      horizontalAlignText={horizontalAlignText}
      verticalAlignText={verticalAlignText}
      width={widgetWidth}
      hoverStyle={{ stroke: "#FF417D" }}
    >
      {tokens.map((t, i) => (
        <Span
          key={i}
          fontWeight={t.bold ? 700 : fontWeight}
          italic={t.italic ?? false}
          textDecoration={t.underline ? "underline" : "none"}
        >
          {t.text}
        </Span>
      ))}
    </Text>
  );
}

widget.register(TolgeeSpikeWidget);
