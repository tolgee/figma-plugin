import { ComponentProps } from "preact";
import { type Plugin } from "../Plugin";
import { NodeInfo } from "@/types";

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

  console.log({ fromParent, url });

  return data;
}

type PluginInitialData = Partial<ComponentProps<typeof Plugin>>;

export function createShortcutLink(name: string, props: PluginInitialData) {
  return `<div><a href="${createShortcutUrl(props)}">${name}</a></div>`;
}

export const DEFAULT_CREDENTIALS = {
  apiUrl: "http://localhost:8202",
  apiKey: "examples-admin-imported-project-implicit",
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
      text: "Test node",
      key: "on-the-road-subtitle",
      connected: true,
    }),
  ];
  return [
    createShortcutLink("Credentials", {
      config: DEFAULT_CREDENTIALS,
    }),
    createShortcutLink("No nodes selected", {
      config: { ...DEFAULT_CREDENTIALS, language: "en", namespace: "" },
    }),
    createShortcutLink("One unlinked node", {
      config: { ...DEFAULT_CREDENTIALS, language: "en", namespace: "" },
      selectedNodes: notConnected,
      allNodes: notConnected,
    }),
    createShortcutLink("One linked node", {
      config: { ...DEFAULT_CREDENTIALS, language: "en", namespace: "" },
      selectedNodes: connected,
      allNodes: connected,
    }),
  ].join("\n");
}
