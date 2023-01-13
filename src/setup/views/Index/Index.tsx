import {
  Container,
  Divider,
  LoadingIndicator,
  MiddleAlign,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { Fragment, h } from "preact";

import { useApiQuery } from "../../client/useQueryApi";
import { useGlobalState } from "../../state/GlobalState";
import { NodeList } from "./NodeList/NodeList";
import { TopBar } from "./TopBar/TopBar";

export const Index = () => {
  const selection = useGlobalState((c) => c.selection);

  const { data: languageData, isLoading } = useApiQuery({
    url: "/v2/projects/languages",
    method: "get",
  });

  const languages = languageData?._embedded?.languages;

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
        <TopBar languages={languages} />
      </Container>
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        {!!selection.length && <NodeList nodes={selection} />}
        {!selection?.length && <Text>No nodes selected</Text>}
      </Container>
    </Fragment>
  );
};
