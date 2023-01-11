import {
  Container,
  LoadingIndicator,
  MiddleAlign,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { Fragment, h } from "preact";
import useSWR from "swr";

import { LanguageType } from "../../../apiTypes";
import { useGlobalState } from "../../state/GlobalState";
import { TopBar } from "./TopBar/TopBar";

export const Index = () => {
  const selection = useGlobalState((c) => c.selection);

  const { data: languageData, isLoading } = useSWR("/v2/projects/languages");

  const languages = languageData?._embedded?.languages as
    | LanguageType[]
    | undefined;

  if (isLoading) {
    return (
      <MiddleAlign>
        <LoadingIndicator />
      </MiddleAlign>
    );
  }

  return (
    <Container space="medium">
      <TopBar languages={languages} />
      <VerticalSpace space="large" />
      {!selection?.length && <Text>No nodes selected</Text>}
      {selection?.map((node) => (
        <Fragment key={node.id}>
          <Text>
            {node.id}: {node.name}
          </Text>
          <VerticalSpace space="medium" />
        </Fragment>
      ))}
    </Container>
  );
};
