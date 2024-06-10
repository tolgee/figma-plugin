import { h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { NodeInfo } from "@/types";
import { NodeRow } from "@/ui/components/NodeList/NodeRow";
import { KeyInput } from "./KeyInput";
import { useSetNodesDataMutation } from "@/ui/hooks/useSetNodesDataMutation";
import { NamespaceSelect } from "@/ui/components/NamespaceSelect/NamespaceSelect";
import styles from "./Index.css";
import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { components } from "@/ui/client/apiSchema.generated";
import { LocateNodeButton } from "@/ui/components/LocateNodeButton/LocateNodeButton";
import { InsertLink } from "@/ui/icons/SvgIcons";

type UsedNamespaceModel = components["schemas"]["UsedNamespaceModel"];

type Props = {
  node: NodeInfo;
  loadedNamespaces: UsedNamespaceModel[] | undefined;
};

export const ListItem = ({ node, loadedNamespaces }: Props) => {
  const [keyName, setKeyName] = useState(node.key);
  const defaultNamespace = useGlobalState((c) => c.config?.namespace);
  const [namespace, setNamespace] = useState(node.ns ?? defaultNamespace);

  const setNodesDataMutation = useSetNodesDataMutation();

  const { setRoute } = useGlobalActions();

  const namespacesDisabled = useGlobalState(
    (c) => c.config?.namespacesDisabled
  );

  const handleConnect = (node: NodeInfo) => {
    setRoute("connect", { node });
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

  const handleKeyChange = (node: NodeInfo) => (value: string) => {
    setKeyName(value);
    setNodesDataMutation.mutate({
      nodes: [{ ...node, key: value, ns: namespace }],
    });
  };

  useEffect(() => {
    if (keyName && namespace !== node.ns) {
      setNodesDataMutation.mutate({
        nodes: [{ ...node, key: keyName, ns: namespace }],
      });
    }
  }, [namespace]);

  const handleNsChange = (node: NodeInfo) => (value: string) => {
    setNamespace(value);
    setNodesDataMutation.mutate({
      nodes: [{ ...node, key: keyName, ns: value }],
    });
  };

  return (
    <NodeRow
      node={node}
      keyComponent={
        !node.connected && (
          <KeyInput value={keyName || ""} onChange={handleKeyChange(node)} />
        )
      }
      nsComponent={
        !node.connected &&
        !namespacesDisabled && (
          <div className={styles.nsSelect}>
            <NamespaceSelect
              value={namespace ?? ""}
              namespaces={namespaces}
              onChange={handleNsChange(node)}
            />
          </div>
        )
      }
      action={
        <div className={styles.actionsContainer}>
          <LocateNodeButton nodeId={node.id} />

          <div
            data-cy="index_link_button"
            role="button"
            title={
              !node.connected
                ? "Connect to existing key"
                : "Edit key connection"
            }
            onClick={() => handleConnect(node)}
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
        </div>
      }
    />
  );
};
