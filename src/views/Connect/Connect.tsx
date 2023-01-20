import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { useDebounce } from "use-debounce";
import {
  Button,
  Container,
  Divider,
  Muted,
  Text,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { useGlobalActions } from "@/state/GlobalState";
import { TopBar } from "@/components/TopBar/TopBar";
import { ActionsBottom } from "@/components/ActionsBottom/ActionsBottom";
import { useApiQuery } from "@/client/useQueryApi";
import { RouteParam } from "../routes";
import styles from "./Connect.css";
import { SearchRow } from "./SearchRow";
import { emit } from "@create-figma-plugin/utilities";
import { SetNodeConnectionHandler } from "@/types";
import { FullPageLoading } from "@/components/FullPageLoading/FullPageLoading";

type Props = RouteParam<"connect">;

export const Connect = ({ node }: Props) => {
  const { setRoute } = useGlobalActions();

  const [key, setKey] = useState(node.key || "");
  const [ns, setNs] = useState(node.ns || "");

  const [debouncedKey] = useDebounce(key, 1000);
  const [debouncedNs] = useDebounce(ns, 1000);

  const translationsLoadable = useApiQuery({
    url: "/v2/projects/translations",
    method: "get",
    query: {
      search: debouncedKey,
      filterNamespace: debouncedNs ? [debouncedNs] : undefined,
      size: 20,
    },
    options: {
      enabled: Boolean(key),
    },
  });

  const handleGoBack = () => {
    setRoute("index");
  };

  const handleConnect = (key: string, ns: string | undefined) => {
    emit<SetNodeConnectionHandler>("SET_NODE_CONNECTION", {
      ...node,
      key,
      ns: ns || "",
    });
    setRoute("index");
  };

  return (
    <Fragment>
      {translationsLoadable.isFetching && <FullPageLoading />}
      <TopBar
        onBack={handleGoBack}
        leftPart={
          <div className={styles.title}>Connect node - {node.characters}</div>
        }
      />
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        <div className={styles.container}>
          <div>
            <Text>
              <Muted>Key</Muted>
            </Text>
            <VerticalSpace space="small" />
            <Textbox
              autoFocus={true}
              onValueInput={(value) => setKey(value)}
              value={key}
              variant="border"
            />
          </div>
          <div>
            <Text>
              <Muted>Namespace</Muted>
            </Text>
            <VerticalSpace space="small" />
            <Textbox
              placeholder="No namespace"
              onValueInput={(value) => setNs(value)}
              value={ns}
              variant="border"
            />
          </div>
        </div>
        <VerticalSpace space="large" />
      </Container>
      <div className={styles.results}>
        {debouncedKey &&
          translationsLoadable.data?._embedded?.keys?.map((key) => (
            <SearchRow
              key={key.keyId}
              data={key}
              onClick={() => handleConnect(key.keyName, key.keyNamespace)}
            />
          ))}
      </div>
      <ActionsBottom>
        {node.key && (
          <Button secondary onClick={() => handleConnect("", "")}>
            Remove connection
          </Button>
        )}
        <Button secondary onClick={handleGoBack}>
          Cancel
        </Button>
        <Button disabled={!key} onClick={() => handleConnect(key, ns)}>
          Add new
        </Button>
      </ActionsBottom>
    </Fragment>
  );
};
