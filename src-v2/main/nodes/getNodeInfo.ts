import { TOLGEE_NODE_INFO } from "$shared/constants";
import type { NodeInfo } from "$shared/types";

/**
 * The subset of `NodeInfo` fields that we persist into `setPluginData`.
 *
 * `id`, `name`, `characters` and `visible` come from the live Figma node and
 * must NOT be written into plugin data — they would only ever drift.
 */
type PersistedNodeInfo = Omit<
  NodeInfo,
  "id" | "name" | "characters" | "visible"
>;

const readPersisted = (node: TextNode): Partial<PersistedNodeInfo> => {
  const raw = node.getPluginData(TOLGEE_NODE_INFO);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Partial<PersistedNodeInfo>;
  } catch {
    return {};
  }
};

/**
 * Read the Tolgee `NodeInfo` for a Figma text node. Plugin data is parsed
 * defensively (an invalid JSON payload yields an "empty" record), and every
 * persisted field is normalised to its safe default so the UI can rely on
 * shape-stable records.
 */
export const getNodeInfo = (node: TextNode): NodeInfo => {
  const pluginData = readPersisted(node);
  return {
    id: node.id,
    name: node.name,
    characters: node.characters,
    visible: node.visible,
    key: pluginData.key ?? "",
    ns: pluginData.ns,
    translation: pluginData.translation ?? "",
    isPlural: Boolean(pluginData.isPlural),
    pluralParamValue: pluginData.pluralParamValue,
    paramsValues: pluginData.paramsValues,
    connected: Boolean(pluginData.connected),
  };
};

/**
 * Merge `partial` into the persisted plugin data of `node` and return the
 * resulting `NodeInfo`. Node-derived fields (`id`, `name`, `characters`,
 * `visible`) are never written to plugin data.
 */
export const setNodeInfo = (
  node: TextNode,
  partial: Partial<NodeInfo>,
): NodeInfo => {
  const current = readPersisted(node);

  const merged: PersistedNodeInfo = {
    key: partial.key ?? current.key ?? "",
    ns: "ns" in partial ? partial.ns : current.ns,
    translation: partial.translation ?? current.translation ?? "",
    isPlural: Boolean(partial.isPlural ?? current.isPlural),
    pluralParamValue:
      "pluralParamValue" in partial
        ? partial.pluralParamValue
        : current.pluralParamValue,
    paramsValues:
      "paramsValues" in partial
        ? partial.paramsValues
        : current.paramsValues,
    connected: Boolean(partial.connected ?? current.connected),
  };

  // Strip explicit `undefined` values so the serialized form stays compact and
  // round-trips cleanly through `JSON.parse`.
  const serializable: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined) {
      serializable[k] = v;
    }
  }

  node.setPluginData(TOLGEE_NODE_INFO, JSON.stringify(serializable));

  return {
    id: node.id,
    name: node.name,
    characters: node.characters,
    visible: node.visible,
    ...merged,
  };
};
