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

import { Settings } from "@/icons/SvgIcons";
import { useApiQuery } from "@/client/useQueryApi";
import { getConflictingNodes } from "@/tools/getConflictingNodes";
import { FullPageLoading } from "@/components/FullPageLoading/FullPageLoading";
import { getConnectedNodes } from "@/tools/getConnectedNodes";
import { useGlobalActions, useGlobalState } from "@/state/GlobalState";
import { NodeList } from "./NodeList/NodeList";
import { TopBar } from "../../components/TopBar/TopBar";
import styles from "./Index.css";

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

  const { setRoute } = useGlobalActions();

  const nothingSelected = selection.length === 0;

  const handleLanguageChange = (lang: string) => {
    if (lang !== language) {
      setRoute("pull", { lang });
    }
  };

  const handlePush = () => {
    const conflicts = getConflictingNodes(selection);
    if (conflicts.length > 0) {
      setError("There are conflicting nodes");
    } else {
      setRoute("push", {
        nodes: getConnectedNodes(nothingSelected ? allNodes : selection),
      });
    }
  };

  const handlePull = () => {
    setRoute("pull", {
      nodes: nothingSelected ? undefined : getConnectedNodes(selection),
      lang: language,
    });
  };

  useEffect(() => {
    setError(undefined);
  }, [selection]);

  if (isLoading) {
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
        <NodeList nodes={selection} />
      )}
    </Fragment>
  );
};
