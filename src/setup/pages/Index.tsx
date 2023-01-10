import { Container, Text } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useGlobalState } from "../state/GlobalState";

export const Index = () => {
  const selection = useGlobalState((c) => c.selection);

  return (
    <Container space="medium">
      {!selection?.length && <Text>No nodes selected</Text>}
      {selection?.map((node) => (
        <Text key={node.id}>
          {node.id}: {node.name}
        </Text>
      ))}
    </Container>
  );
};
