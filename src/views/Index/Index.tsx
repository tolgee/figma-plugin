import { Fragment, h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import {
  Banner,
  Button,
  Container,
  Divider,
  IconWarning32,
  Text,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@/utilities";

import { FrameScreenshot, NodeInfo, SetNodesDataHandler } from "@/types";
import { Settings, InsertLink } from "@/icons/SvgIcons";
import { useApiQuery } from "@/client/useQueryApi";
import { getConflictingNodes } from "@/tools/getConflictingNodes";
import { FullPageLoading } from "@/components/FullPageLoading/FullPageLoading";
import { getConnectedNodes, getNodesWithKey } from "@/tools/getConnectedNodes";
import { useGlobalActions, useGlobalState } from "@/state/GlobalState";
import { NodeList } from "../../components/NodeList/NodeList";
import { TopBar } from "../../components/TopBar/TopBar";
import styles from "./Index.css";
import { DEFAULT_SIZE, useWindowSize } from "@/tools/useWindowSize";
import { NamespaceSelect } from "@/components/NamespaceSelect/NamespaceSelect";
import { endpointGetScreenshots } from "@/endpoints";

export const Index = () => {
  const selection = useGlobalState((c) => c.selection);
  const allNodes = useGlobalState((c) => c.allNodes);
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

  const nothingSelected = selection.length === 0;

  const handleLanguageChange = (lang: string) => {
    if (lang !== language) {
      setRoute("pull", { lang });
    }
  };

  const handlePush = () => {
    const subjectNodes = (nothingSelected ? allNodes : selection).map(
      (node) => ({
        ...node,
        ns: node.ns ?? defaultNamespace,
      })
    );
    const conflicts = getConflictingNodes(subjectNodes);
    if (conflicts.length > 0) {
      setError(
        `There are conflicting nodes (${conflicts
          .map((n) => n.characters)
          .join(", ")})`
      );
    } else {
      setRoute("push", {
        nodes: getNodesWithKey(subjectNodes),
      });
    }
  };

  const handlePull = () => {
    setRoute("pull", {
      nodes: nothingSelected ? undefined : getConnectedNodes(selection),
      lang: language,
    });
  };

  const handleConnect = (node: NodeInfo) => {
    setRoute("connect", { node });
  };

  const handleKeyChange =
    (node: NodeInfo) => (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
      emit<SetNodesDataHandler>("SET_NODES_DATA", [
        {
          ...node,
          key: e.currentTarget.value,
        },
      ]);
    };

  const handleNsChange = (node: NodeInfo) => (value: string) => {
    emit<SetNodesDataHandler>("SET_NODES_DATA", [
      {
        ...node,
        ns: value,
      },
    ]);
  };

  const [screenshots, setScreenshots] = useState<FrameScreenshot[]>([]);

  const handleTakeScreenshots = () => {
    endpointGetScreenshots.call().then((data) => {
      setScreenshots(data);
    });
  };

  useEffect(() => {
    setError(undefined);
  }, [selection]);

  useWindowSize(
    !selection || selection.length < 2
      ? { width: 500, height: 150 }
      : DEFAULT_SIZE
  );

  if (languagesLoadable.isLoading || namespacesLoadable.isLoading) {
    return <FullPageLoading />;
  }

  return (
    <Fragment>
      <Container space="medium">
        <TopBar
          leftPart={
            <Fragment>
              {languages && (
                <select
                  className={styles.languageContainer}
                  value={language}
                  placeholder="Language"
                  onChange={(e) => {
                    handleLanguageChange((e.target as HTMLInputElement).value);
                  }}
                >
                  {languages.map((l) => (
                    <option key={l.tag} value={l.tag}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}

              <Button onClick={handlePush}>
                {nothingSelected ? "Push all" : "Push"}
              </Button>

              <Button onClick={handlePull} secondary>
                {nothingSelected ? "Pull all" : "Pull"}
              </Button>

              <Button onClick={handleTakeScreenshots} secondary>
                Take screenshots
              </Button>
            </Fragment>
          }
          rightPart={
            <div
              className={styles.settingsButton}
              onClick={() => setRoute("settings")}
            >
              <Settings width={15} height={15} />
            </div>
          }
        />
      </Container>
      <Divider />
      <VerticalSpace space="large" />
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

      {nothingSelected ? (
        <Container space="medium">
          <Text>No nodes selected</Text>
        </Container>
      ) : (
        <NodeList
          nodes={selection}
          keyComponent={(node) =>
            !node.connected && (
              <Textbox
                placeholder="Key name"
                value={node.key || ""}
                onChange={handleKeyChange(node)}
                variant="border"
                style={{
                  fontSize: 12,
                  height: 23,
                }}
              />
            )
          }
          nsComponent={(node) =>
            !node.connected &&
            !namespacesDisabled && (
              <div className={styles.nsSelect}>
                <NamespaceSelect
                  value={node.ns ?? defaultNamespace ?? ""}
                  namespaces={namespaces}
                  onChange={handleNsChange(node)}
                />
              </div>
            )
          }
          actionCallback={(node) => {
            return (
              <div
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
                      color: "var(--figma-color-icon-oncomponent-tertiary)",
                    }}
                  />
                )}
              </div>
            );
          }}
        />
      )}
      <div>
        {screenshots.map((screenshot, i) => (
          <svg
            key={i}
            width={`${screenshot.info.width}px`}
            height={`${screenshot.info.height}px`}
          >
            <image
              key={i}
              width={screenshot.info.width}
              height={screenshot.info.height}
              href={URL.createObjectURL(
                new Blob([screenshot.image.buffer], { type: "image/svg" })
              )}
            />
            {screenshot.keys.map((key, i) => (
              <rect
                key={i}
                x={key.x}
                y={key.y}
                width={key.width}
                height={key.height}
                stroke="red"
                strokeWidth={2}
                fill="transparent"
              />
            ))}
          </svg>
        ))}
      </div>
    </Fragment>
  );
};
