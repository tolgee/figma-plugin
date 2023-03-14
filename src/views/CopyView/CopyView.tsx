import { Fragment, h } from "preact";
import {
  Button,
  Container,
  Divider,
  Muted,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { useGlobalState } from "@/state/GlobalState";
import { NodeList } from "../../components/NodeList/NodeList";
import { TopBar } from "../../components/TopBar/TopBar";
import {
  COMPACT_SIZE,
  DEFAULT_SIZE,
  useWindowSize,
} from "@/tools/useWindowSize";
import { useApiMutation } from "@/client/useQueryApi";
import { getPullChanges } from "@/tools/getPullChanges";
import { emit } from "@create-figma-plugin/utilities";
import { TranslationsUpdateHandler } from "@/types";
import { FullPageLoading } from "@/components/FullPageLoading/FullPageLoading";
import { getConnectedNodes } from "@/tools/getConnectedNodes";

export const CopyView = () => {
  const selection = useGlobalState((c) => c.selection);
  const language = useGlobalState((c) => c.config?.language);
  const allNodes = useGlobalState((c) => c.allNodes);

  const nothingSelected = selection.length === 0;

  const translationsLoadable = useApiMutation({
    url: "/v2/projects/translations",
    method: "get",
  });

  const handlePull = async () => {
    const selectedNodes = getConnectedNodes(
      nothingSelected ? allNodes : selection
    );
    const keys = [...new Set(selectedNodes.map((n) => n.key))];
    const response = await translationsLoadable.mutateAsync({
      query: {
        languages: [language!],
        size: 10000,
        filterKeyName: keys,
      },
    });

    const { changedNodes } = getPullChanges(
      selectedNodes,
      language!,
      response._embedded?.keys || []
    );

    emit<TranslationsUpdateHandler>("UPDATE_NODES", changedNodes);
  };

  useWindowSize(
    !selection || selection.length < 2 ? COMPACT_SIZE : DEFAULT_SIZE
  );

  if (translationsLoadable.isLoading) {
    return <FullPageLoading />;
  }

  return (
    <Fragment>
      <Container space="medium">
        <TopBar
          leftPart={
            <Fragment>
              <Text>Page copy - {language ? language : "keys"}</Text>
              {language && (
                <Button data-cy="copy_view_pull_button" onClick={handlePull}>
                  {nothingSelected ? "Pull all" : "Pull"}
                </Button>
              )}
            </Fragment>
          }
        />
      </Container>
      <Divider />
      <VerticalSpace space="large" />

      {nothingSelected ? (
        <Container space="medium">
          <Text>No texts selected</Text>
        </Container>
      ) : (
        <NodeList
          nodes={selection}
          keyComponent={(node) => {
            if (!node.connected) {
              return <Muted>Not connected</Muted>;
            }
            return node.key || "";
          }}
        />
      )}
    </Fragment>
  );
};
