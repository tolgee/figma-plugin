import { Fragment, h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import {
  Banner,
  Button,
  Container,
  Divider,
  IconWarning32,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { NodeInfo } from "@/types";
import { Settings, InsertLink } from "@/ui/icons/SvgIcons";
import { useApiQuery } from "@/ui/client/useQueryApi";
import { getConflictingNodes } from "@/tools/getConflictingNodes";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { NamespaceSelect } from "@/ui/components/NamespaceSelect/NamespaceSelect";
import {
  COMPACT_SIZE,
  DEFAULT_SIZE,
  useWindowSize,
} from "@/ui/hooks/useWindowSize";
import { LocateNodeButton } from "@/ui/components/LocateNodeButton/LocateNodeButton";
import { useSelectedNodes } from "@/ui/hooks/useSelectedNodes";

import { NodeList } from "../../components/NodeList/NodeList";
import { TopBar } from "../../components/TopBar/TopBar";
import styles from "./Index.css";
import { KeyInput } from "./KeyInput";
import { useSetNodesDataMutation } from "@/ui/hooks/useSetNodesDataMutation";

export const Index = () => {
  const selectionLoadable = useSelectedNodes();
  const selection = selectionLoadable.data?.items || [];

  const [error, setError] = useState<string>();
  const defaultNamespace = useGlobalState((c) => c.config?.namespace);
  const namespacesDisabled = useGlobalState(
    (c) => c.config?.namespacesDisabled
  );

  const languagesLoadable = useApiQuery({
    url: "/v2/projects/languages",
    method: "get",
  });

  const namespacesLoadable = useApiQuery({
    url: "/v2/projects/used-namespaces",
    method: "get",
  });

  const setNodesDataMutation = useSetNodesDataMutation();

  const languages = languagesLoadable.data?._embedded?.languages;
  const namespaces = useMemo(
    () =>
      Array.from(
        new Set([
          ...(namespacesLoadable.data?._embedded?.namespaces || []).map(
            (ns) => ns.name || ""
          ),
          defaultNamespace || "",
        ])
      ),
    [namespacesLoadable.data, defaultNamespace]
  );

  const language =
    useGlobalState((c) => c.config?.language) || languages?.[0]?.tag || "";

  const { setRoute } = useGlobalActions();

  const nothingSelected = !selectionLoadable.data?.somethingSelected;

  const handleLanguageChange = (lang: string) => {
    if (lang !== language) {
      setRoute("pull", { lang });
    }
  };

  const handlePush = () => {
    const subjectNodes = /*nothingSelected ? allNodes :*/ selection.map(
      (node) => ({
        ...node,
        ns: node.ns ?? defaultNamespace,
      })
    );
    const conflicts = getConflictingNodes(subjectNodes);
    if (conflicts.length > 0) {
      const keys = Array.from(new Set(conflicts.map((n) => n.key)));
      setError(
        `There are multiple different translations for single key (${keys.join(
          ", "
        )})`
      );
    } else {
      setRoute("push");
    }
  };

  const handlePull = () => {
    setRoute("pull", {
      lang: language,
    });
  };

  const handleCopy = () => {
    setRoute("create_copy");
  };

  const handleConnect = (node: NodeInfo) => {
    setRoute("connect", { node });
  };

  const handleKeyChange = (node: NodeInfo) => (value: string) => {
    setNodesDataMutation.mutate({ nodes: [{ ...node, key: value }] });
  };

  const handleNsChange = (node: NodeInfo) => (value: string) => {
    setNodesDataMutation.mutate({ nodes: [{ ...node, ns: value }] });
  };

  useEffect(() => {
    setError(undefined);
  }, [selection]);

  const size = !selection || selection.length < 2 ? COMPACT_SIZE : DEFAULT_SIZE;

  useWindowSize(size);

  if (languagesLoadable.isLoading || namespacesLoadable.isLoading) {
    return <FullPageLoading />;
  }

  return (
    <div className={styles.container} style={{ height: size.height }}>
      {selectionLoadable.isFetching && <FullPageLoading />}
      <div>
        <Container
          space="medium"
          style={{ paddingBlock: "var(--space-extra-small)" }}
        >
          <TopBar
            leftPart={
              <Fragment>
                {languages && (
                  <select
                    data-cy="index_language_select"
                    className={styles.languageContainer}
                    value={language}
                    placeholder="Language"
                    disabled={!nothingSelected}
                    onChange={(e) => {
                      handleLanguageChange(
                        (e.target as HTMLInputElement).value
                      );
                    }}
                  >
                    {languages.map((l) => (
                      <option key={l.tag} value={l.tag}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                )}

                <Button data-cy="index_push_button" onClick={handlePush}>
                  {nothingSelected ? "Push all" : "Push"}
                </Button>

                <Button
                  data-cy="index_pull_button"
                  onClick={handlePull}
                  secondary
                >
                  {nothingSelected ? "Pull all" : "Pull"}
                </Button>

                <Button
                  data-cy="index_create_copy_button"
                  onClick={handleCopy}
                  secondary
                >
                  Create a copy
                </Button>
              </Fragment>
            }
            rightPart={
              <div
                data-cy="index_settings_button"
                className={styles.settingsButton}
                onClick={() => setRoute("settings")}
                role="button"
              >
                <Settings width={15} height={15} />
              </div>
            }
          />
        </Container>
        <Divider />
        <Container space="medium">
          {error && (
            <Fragment>
              <Banner
                icon={<IconWarning32 />}
                style={{ cursor: "pointer" }}
                onClick={() => setError(undefined)}
              >
                {error}
              </Banner>
              <VerticalSpace space="large" />
            </Fragment>
          )}
        </Container>
      </div>

      {nothingSelected ? (
        <Container space="medium" style={{ marginTop: 16 }}>
          <Text>No texts selected</Text>
        </Container>
      ) : (
        <NodeList
          items={selection}
          keyComponent={(node) =>
            !node.connected && (
              <KeyInput
                initialValue={node.key || ""}
                onDebouncedChange={handleKeyChange(node)}
              />
            )
          }
          nsComponent={(node) =>
            !node.connected &&
            !namespacesDisabled && (
              <div className={styles.nsSelect}>
                <NamespaceSelect
                  initialValue={node.ns ?? defaultNamespace ?? ""}
                  namespaces={namespaces}
                  onChange={handleNsChange(node)}
                />
              </div>
            )
          }
          actionCallback={(node) => {
            return (
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
            );
          }}
        />
      )}
    </div>
  );
};
