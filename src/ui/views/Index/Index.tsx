import { Fragment, h } from "preact";
import { useCallback, useEffect, useState, useMemo } from "preact/hooks";
import {
  Banner,
  Button,
  Container,
  Divider,
  IconWarning32,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { Settings } from "@/ui/icons/SvgIcons";
import { useApiQuery } from "@/ui/client/useQueryApi";
import { getConflictingNodes } from "@/tools/getConflictingNodes";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { useSelectedNodes } from "@/ui/hooks/useSelectedNodes";
import { useConnectedNodes } from "@/ui/hooks/useConnectedNodes";

import { NodeList } from "../../components/NodeList/NodeList";
import { TopBar } from "../../components/TopBar/TopBar";
import styles from "./Index.css";
import { ListItem } from "./ListItem";
import { useEditorMode } from "../../hooks/useEditorMode";
import { useHasNamespacesEnabled } from "../../hooks/useHasNamespacesEnabled";

export const Index = () => {
  const selectionLoadable = useSelectedNodes();
  const selection = selectionLoadable.data?.items || [];

  // index page is not removed on certain routes
  // refetch when we go back to it
  const route = useGlobalState((c) => c.route);
  useEffect(() => {
    if (route[0] === "index") {
      selectionLoadable.refetch();
    }
  }, [route]);

  const [error, setError] = useState<string>();

  const languagesLoadable = useApiQuery({
    url: "/v2/projects/languages",
    method: "get",
    query: {
      size: 1000,
    },
  });

  const namespacesLoadable = useApiQuery({
    url: "/v2/projects/used-namespaces",
    method: "get",
  });

  const hasNamespacesEnabled = useHasNamespacesEnabled();

  const languages = languagesLoadable.data?._embedded?.languages;

  const language =
    useGlobalState((c) => c.config?.language) || languages?.[0]?.tag || "";

  const { setRoute } = useGlobalActions();
  const allNodes = useConnectedNodes({ ignoreSelection: true });

  // Combine API namespaces + all namespaces from nodes
  const allAvailableNamespaces = useMemo(() => {
    const apiNamespaces =
      namespacesLoadable.data?._embedded?.namespaces?.map(
        (n) => n.name || "",
      ) || [];
    const nodeNamespaces = Array.from(
      new Set(
        (allNodes.data?.items || [])
          .map((node) => node.ns)
          .filter((ns): ns is string => Boolean(ns)),
      ),
    );
    return Array.from(new Set([...apiNamespaces, ...nodeNamespaces]))
      .filter(Boolean)
      .sort((a, b) => {
        // Sort alphabetically, but put empty string at the end
        if (!a) return 1;
        if (!b) return -1;
        return a.localeCompare(b);
      });
  }, [namespacesLoadable.data, allNodes.data]);

  const loadedNamespaces = useMemo(
    () => allAvailableNamespaces.map((name) => ({ name })),
    [allAvailableNamespaces],
  );

  // Refresh namespaces: refetch API and all nodes
  const handleRefreshNamespaces = useCallback(async () => {
    await Promise.all([namespacesLoadable.refetch(), allNodes.refetch()]);
  }, []);

  const renderRow = useCallback(
    (node: (typeof selection)[number]) => (
      <ListItem
        hasNamespacesEnabled={hasNamespacesEnabled}
        node={node}
        loadedNamespaces={loadedNamespaces}
        onRefreshNamespaces={handleRefreshNamespaces}
      />
    ),
    [hasNamespacesEnabled, loadedNamespaces, handleRefreshNamespaces],
  );

  const nothingSelected = !selectionLoadable.data?.somethingSelected;

  const handleLanguageChange = (lang: string) => {
    if (lang !== language) {
      setRoute("pull", { lang });
    }
  };

  const defaultNamespace = useGlobalState((c) => c.config?.namespace);

  const handlePush = () => {
    const subjectNodes = selection.map((node) => ({
      ...node,
      ns: node.ns ?? defaultNamespace,
    }));
    const conflicts = getConflictingNodes(subjectNodes);
    if (conflicts.length > 0) {
      const keys = Array.from(new Set(conflicts.map((n) => n.key)));
      setError(
        `There are multiple different translations for single key (${keys.join(
          ", ",
        )})`,
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

  useEffect(() => {
    setError(undefined);
  }, [selection]);

  const editorMode = useEditorMode();

  if (languagesLoadable.isLoading || namespacesLoadable.isLoading) {
    return <FullPageLoading />;
  }

  return (
    <div className={styles.container}>
      {selectionLoadable.isFetching && <FullPageLoading blocking={false} />}
      <div>
        <Container
          space="medium"
          style={{ paddingBlock: "var(--space-extra-small)" }}
        >
          <TopBar
            leftPart={
              <Fragment>
                {languages && editorMode.data !== "dev" && (
                  <select
                    data-cy="index_language_select"
                    className={styles.languageContainer}
                    value={language}
                    onChange={(e) => {
                      handleLanguageChange(
                        (e.target as HTMLInputElement).value,
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

                {editorMode.data !== "dev" && (
                  <Fragment>
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
                      Copy
                    </Button>
                  </Fragment>
                )}
              </Fragment>
            }
            rightPart={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  data-cy="index_settings_button"
                  className={styles.settingsButton}
                  onClick={() => setRoute("settings")}
                  role="button"
                >
                  <Settings width={15} height={15} />
                </div>
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

      {nothingSelected || selection.length === 0 ? (
        <Container space="medium" className="noSelection">
          <Text align="center">
            Select texts for translation
            <br />
            (single texts or frames)
          </Text>
        </Container>
      ) : (
        <NodeList items={selection} row={renderRow} />
      )}
    </div>
  );
};
