import { useEffect, useState } from "preact/hooks";
import { HeadingTab } from "@/setup/components/HeadingTab/HeadingTab";
import { Settings } from "@/setup/icons/SvgIcons";
import {
  Banner,
  Button,
  Container,
  Divider,
  IconWarning32,
  LoadingIndicator,
  MiddleAlign,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { Fragment, h } from "preact";

import { useApiQuery } from "@/setup/client/useQueryApi";
import { useGlobalActions, useGlobalState } from "@/setup/state/GlobalState";
import { NodeList } from "./NodeList/NodeList";
import { TopBar } from "./TopBar/TopBar";
import styles from "./Index.css";
import { getConflictingNodes } from "@/setup/tools/getConflictingNodes";

export const Index = () => {
  const selection = useGlobalState((c) => c.selection);
  const allNodes = useGlobalState((c) => c.allNodes);
  const [error, setError] = useState<string>();

  const { data: languageData, isLoading } = useApiQuery({
    url: "/v2/projects/languages",
    method: "get",
  });

  const languages = languageData?._embedded?.languages;

  const language =
    useGlobalState((c) => c.config?.lang) || languages?.[0]?.tag || "";

  const { setLanguage, setRoute } = useGlobalActions();

  const routeKey = useGlobalState((c) => c.routeKey);

  const nothingSelected = selection.length === 0;

  const handlePush = () => {
    const conflicts = getConflictingNodes(selection);
    if (conflicts.length > 0) {
      setError("There are conflicting nodes");
    } else {
      const connectedNodes = nothingSelected ? allNodes : selection;
      console.log(connectedNodes);
      setRoute("push", { nodes: connectedNodes.filter((n) => n.key) });
    }
  };

  useEffect(() => {
    setError(undefined);
  }, [selection]);

  if (isLoading) {
    return (
      <MiddleAlign>
        <LoadingIndicator />
      </MiddleAlign>
    );
  }

  return (
    <Fragment>
      <Container space="medium">
        <TopBar
          leftPart={
            <Fragment>
              <div className={styles.languageContainer}>
                {languages && (
                  <select
                    value={language}
                    placeholder="Language"
                    onChange={(e) => {
                      setLanguage((e.target as HTMLInputElement).value);
                    }}
                  >
                    {languages.map((l) => (
                      <option key={l.tag} value={l.tag}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <Button onClick={handlePush}>
                {nothingSelected ? "Push all" : "Push"}
              </Button>
            </Fragment>
          }
          rightPart={
            <HeadingTab
              route="settings"
              currentRoute={routeKey}
              onChange={() => setRoute("settings")}
            >
              <Settings width={15} height={15} />
            </HeadingTab>
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

        {nothingSelected ? (
          <Text>No nodes selected</Text>
        ) : (
          <NodeList nodes={selection} />
        )}
      </Container>
    </Fragment>
  );
};
