import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
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
import { useWindowSize } from "@/ui/hooks/useWindowSize";
import { useSelectedNodes } from "@/ui/hooks/useSelectedNodes";

import { NodeList } from "../../components/NodeList/NodeList";
import { TopBar } from "../../components/TopBar/TopBar";
import styles from "./Index.css";
import { ListItem } from "./ListItem";
import { COMPACT_SIZE, DEFAULT_SIZE } from "@/ui/state/sizes";

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
  });

  const namespacesLoadable = useApiQuery({
    url: "/v2/projects/used-namespaces",
    method: "get",
  });

  const languages = languagesLoadable.data?._embedded?.languages;

  const language =
    useGlobalState((c) => c.config?.language) || languages?.[0]?.tag || "";

  const { setRoute } = useGlobalActions();

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
          row={(node) => (
            <ListItem
              node={node}
              loadedNamespaces={namespacesLoadable.data?._embedded?.namespaces}
            />
          )}
        />
      )}
    </div>
  );
};
