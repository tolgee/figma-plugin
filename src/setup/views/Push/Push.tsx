import { useApiQuery } from "@/setup/client/useQueryApi";
import { useGlobalActions, useGlobalState } from "@/setup/state/GlobalState";
import { getChanges } from "@/setup/tools/getChanges";
import {
  Container,
  Divider,
  LoadingIndicator,
  MiddleAlign,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { Fragment, FunctionalComponent, h } from "preact";
import { useMemo } from "preact/hooks";
import { TopBar } from "../Index/TopBar/TopBar";
import { RouteParam } from "../routes";
import { Changes } from "./Changes";

type Props = RouteParam<"push">;

export const Push: FunctionalComponent<Props> = ({ nodes }) => {
  const language = useGlobalState((c) => c.config!.lang!);
  const { setRoute } = useGlobalActions();
  const keys = useMemo(() => [...new Set(nodes.map((n) => n.key))], [nodes]);

  const { isLoading, data } = useApiQuery({
    url: "/v2/projects/translations",
    method: "get",
    query: {
      structureDelimiter: null,
      languages: [language],
      size: 10000,
      filterKeyName: [keys],
    },
  });

  const changes = useMemo(() => {
    return getChanges(nodes, data?._embedded?.keys || [], language);
  }, [data, nodes]);

  return (
    <Fragment>
      <TopBar
        onBack={() => setRoute("index")}
        leftPart={<div>Push translations to Tolgee platform</div>}
      />
      <Divider />
      <VerticalSpace space="large" />
      {isLoading ? (
        <MiddleAlign>
          <LoadingIndicator />
        </MiddleAlign>
      ) : (
        <Container space="medium">
          <Changes changes={changes} />
        </Container>
      )}
    </Fragment>
  );
};
