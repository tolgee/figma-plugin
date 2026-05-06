import { h } from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
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
  loadedNamespaces: UsedNamespaceModel[] | undefined;
  hasNamespacesEnabled: boolean;
  onRefreshNamespaces?: () => void;
};

export const ListItem = ({
  node,
  loadedNamespaces,
  hasNamespacesEnabled,
  onRefreshNamespaces,
}: Props) => {
  const nodeId = node?.id ?? "";
  const tolgeeConfig = useGlobalState((c) => c.config);

  const prefilledKey = usePrefilledKey(
    nodeId,
    tolgeeConfig?.keyFormat ?? "",
    tolgeeConfig?.variableCasing,
    tolgeeConfig?.prefillKeyFormat ?? false,
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

  // Single debounced mutation for both key and namespace changes
  const [debouncedNamespace] = useDebounce(namespace, 300);

  useEffect(() => {
    if (node.connected) return;
    const keyChanged = debouncedKeyName !== (node.key || "");
    const nsChanged = debouncedNamespace !== (node.ns ?? defaultNamespace);
    if (keyChanged || nsChanged) {
      setNodesDataMutation.mutate({
        nodes: [{ ...node, key: debouncedKeyName, ns: debouncedNamespace }],
      });
    }
  }, [
    debouncedKeyName,
    debouncedNamespace,
    node.id,
    node.connected,
    defaultNamespace,
  ]);

  const handleConnect = () => {
    setRoute("connect", { node });
  };

  const namespaces = useMemo(
    () =>
      Array.from(
        new Set([
          ...(loadedNamespaces?.map((ns) => ns.name || "") || []),
          defaultNamespace || "",
        ]),
      ),
    [loadedNamespaces, defaultNamespace],
  );

  const handleKeyChange = useCallback((value: string) => {
    setKeyName(value);
  }, []);

  const handleNsChange = useCallback((value: string) => {
    setNamespace(value);
  }, []);

  return (
    <NodeRow
      node={node}
      showNamespace={hasNamespacesEnabled}
      keyComponent={
        !node.connected && (
          <KeyInput value={keyName || ""} onChange={handleKeyChange} />
        )
      }
      nsComponent={
        !node.connected &&
        hasNamespacesEnabled && (
          <NamespaceSelect
            value={namespace ?? ""}
            namespaces={namespaces}
            onChange={handleNsChange}
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
