import { ComponentProps } from "preact";
import { type Plugin } from "../Plugin";
import { NodeInfo, TolgeeConfig } from "@/types";

export type PluginData = ComponentProps<typeof Plugin>;

export function createShortcutUrl(props: Partial<PluginData>) {
  return `/?data=${encodeURIComponent(JSON.stringify(props))}`;
}

export function getUrlConfig(fromParent?: boolean): PluginData {
  const url = fromParent
    ? window.parent.parent.location.href
    : window.location.href;
  const search = new URL(url).search;
  const urlData = JSON.parse(new URLSearchParams(search).get("data") || "{}");

  const data = {
    config: {},
    allNodes: [],
    selectedNodes: [],
    ...urlData,
  };

  return data;
}

type PluginInitialData = Partial<ComponentProps<typeof Plugin>>;

export function createShortcutLink(name: string, props: PluginInitialData) {
  return `<div><a href="${createShortcutUrl(props)}">${name}</a></div>`;
}

export const DEFAULT_CREDENTIALS = {
  apiUrl: "http://localhost:8080",
  apiKey: "examples-admin-imported-project-implicit",
};

export const SIGNED_IN: Partial<TolgeeConfig> = {
  ...DEFAULT_CREDENTIALS,
  language: "en",
  namespace: "",
  pageInfo: true,
  documentInfo: true,
};

export const PAGE_COPY: Partial<TolgeeConfig> = {
  ...DEFAULT_CREDENTIALS,
  namespace: "",
  documentInfo: true,
  pageCopy: true,
};

export const PAGE_COPY_LANGUAGE: Partial<TolgeeConfig> = {
  ...PAGE_COPY,
  language: "cs",
};

export const NEW_PAGE: Partial<TolgeeConfig> = {
  ...DEFAULT_CREDENTIALS,
  documentInfo: true,
};

type Props = {
  text: string;
  key?: string;
  ns?: string;
  connected?: boolean;
  id?: string;
};

export function createTestNode(props: Props): NodeInfo {
  return {
    name: props.text,
    characters: props.text,
    id: Math.random().toString(),
    key: props.key || "",
    ns: props.ns || "",
    connected: Boolean(props.connected),
  };
}

export function createLinks() {
  const notConnected = [createTestNode({ text: "Test node" })];
  const connected = [
    createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    }),
  ];
  const connectedKeys = [
    createTestNode({
      text: "on-the-road-title",
      key: "on-the-road-title",
      connected: true,
    }),
  ];
  const connectedCzech = [
    createTestNode({
      text: "Na cestě",
      key: "on-the-road-title",
      connected: true,
    }),
  ];

  return [
    createShortcutLink("Credentials", {
      config: DEFAULT_CREDENTIALS,
    }),
    createShortcutLink("No texts selected", {
      config: SIGNED_IN,
    }),
    createShortcutLink("One unlinked node", {
      config: SIGNED_IN,
      selectedNodes: notConnected,
      allNodes: notConnected,
    }),
    createShortcutLink("One linked node", {
      config: SIGNED_IN,
      selectedNodes: connected,
      allNodes: connected,
    }),
    createShortcutLink("New page", {
      config: NEW_PAGE,
    }),

    createShortcutLink("Page copy with keys", {
      config: PAGE_COPY,
      selectedNodes: connectedKeys,
      allNodes: connectedKeys,
    }),

    createShortcutLink("Page copy with language", {
      config: PAGE_COPY_LANGUAGE,
      selectedNodes: connectedCzech,
      allNodes: connectedCzech,
    }),
  ].join("\n");
}
