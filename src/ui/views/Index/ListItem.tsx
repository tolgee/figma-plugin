import { h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useDebounce } from "use-debounce";
import { NodeInfo } from "@/types";
import { NodeRow } from "@/ui/components/NodeList/NodeRow";
import { KeyInput } from "./KeyInput";
import { useSetNodesDataMutation } from "@/ui/hooks/useSetNodesDataMutation";
import { NamespaceSelect } from "@/ui/components/NamespaceSelect/NamespaceSelect";
import styles from "./Index.css";
import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { components } from "@/ui/client/apiSchema.generated";
import { InsertLink } from "@/ui/icons/SvgIcons";
import { KeyOptionsButton } from "../../components/KeyOptionsButton/KeyOptionsButton";
import { usePrefilledKey } from "../../hooks/usePrefilledKey";

type UsedNamespaceModel = components["schemas"]["UsedNamespaceModel"];

type Props = {
  node: NodeInfo;
  groupedNodes?: NodeInfo[];
  duplicatesCount?: number;
  loadedNamespaces: UsedNamespaceModel[] | undefined;
  hasNamespacesEnabled: boolean;
  onRefreshNamespaces?: () => void;
};

export const ListItem = ({
  node,
  groupedNodes,
  duplicatesCount,
  loadedNamespaces,
  hasNamespacesEnabled,
  onRefreshNamespaces,
}: Props) => {
  const nodeId = node?.id ?? "";
  const effectiveNodes = useMemo(
    () =>
      groupedNodes && groupedNodes.length > 0
        ? groupedNodes
        : [node],
    [groupedNodes, node]
  );
  const tolgeeConfig = useGlobalState((c) => c.config);

  const prefilledKey = usePrefilledKey(
    nodeId,
    tolgeeConfig?.keyFormat ?? "",
    tolgeeConfig?.variableCasing
  );

  const [keyName, setKeyName] = useState((node.key || prefilledKey.key) ?? "");
  const [debouncedKeyName] = useDebounce(keyName, 300);

  const defaultNamespace = useGlobalState((c) => c.config?.namespace);
  const [namespace, setNamespace] = useState(node.ns ?? defaultNamespace);

  const setNodesDataMutation = useSetNodesDataMutation();

  const { setRoute } = useGlobalActions();

  useEffect(() => {
    if (prefilledKey.key && !node.connected) {
      setKeyName(prefilledKey.key);
    }
  }, [prefilledKey.key]);

  useEffect(() => {
    if (node.connected) {
      setKeyName(node.key || "");
      setNamespace(node.ns ?? defaultNamespace);
    }
  }, [node.connected, node.key, node.ns, defaultNamespace]);

  // Debounced mutation: only update Figma nodes after user stops typing
  useEffect(() => {
    const hasConnected = effectiveNodes.some((current) => current.connected);
    if (hasConnected) {
      return;
    }
    const shouldUpdate = effectiveNodes.some(
      (current) => debouncedKeyName !== (current.key || "")
    );
    if (shouldUpdate) {
      setNodesDataMutation.mutate({
        nodes: effectiveNodes.map((current) => ({
          ...current,
          key: debouncedKeyName,
          ns: namespace,
        })),
      });
    }
  }, [debouncedKeyName, namespace, effectiveNodes]);

  const handleConnect = () => {
    setRoute("connect", { nodes: effectiveNodes });
  };

  const namespaces = useMemo(
    () =>
      Array.from(
        new Set([
          ...(loadedNamespaces?.map((ns) => ns.name || "") || []),
          defaultNamespace || "",
        ])
      ),
    [loadedNamespaces, defaultNamespace]
  );

  const handleKeyChange = () => (value: string) => {
    setKeyName(value);
  };

  useEffect(() => {
    const hasConnected = effectiveNodes.some((current) => current.connected);
    if (hasConnected || !keyName) {
      return;
    }
    const shouldUpdate = effectiveNodes.some(
      (current) => current.ns !== namespace
    );
    if (shouldUpdate) {
      setNodesDataMutation.mutate({
        nodes: effectiveNodes.map((current) => ({
          ...current,
          key: keyName,
          ns: namespace,
        })),
      });
    }
  }, [namespace, keyName, effectiveNodes]);

  const handleNsChange = () => (value: string) => {
    setNamespace(value);
    setNodesDataMutation.mutate({
      nodes: effectiveNodes.map((current) => ({
        ...current,
        key: keyName,
        ns: value,
      })),
    });
    effectiveNodes.forEach((current) => {
      current.key = keyName;
      current.ns = value;
    });
  };

  return (
    <NodeRow
      node={node}
      duplicatesCount={duplicatesCount}
      keyComponent={
        !node.connected && (
          <KeyInput value={keyName || ""} onChange={handleKeyChange()} />
        )
      }
      nsComponent={
        !node.connected &&
        hasNamespacesEnabled && (
          <NamespaceSelect
            value={namespace ?? ""}
            namespaces={namespaces}
            onChange={handleNsChange()}
            onRefresh={onRefreshNamespaces}
          />
        )
      }
      action={
        <div className={styles.actionsContainer}>
          <div
            data-cy="index_link_button"
            role="button"
            title={
              !node.connected
                ? "Connect to existing key"
                : "Edit key connection"
            }
            onClick={handleConnect}
            className={styles.connectButton}
          >
            {node.connected ? (
              <InsertLink width={16} height={16} />
            ) : (
              <InsertLink
                width={16}
                height={16}
                style={{
                  color: "var(--figma-color-text-secondary)",
                }}
              />
            )}
          </div>
          <KeyOptionsButton node={{ ...node, key: keyName ?? node.key }} />
        </div>
      }
    />
  );
};
