import { LoadingIndicator, Muted, Text } from "@create-figma-plugin/ui";
import { FunctionalComponent, h } from "preact";

import styles from "./FullPageLoading.css";

type Props = {
  text?: string;
  blocking?: boolean;
};

export const FullPageLoading: FunctionalComponent<Props> = ({
  text,
  blocking = true,
}) => {
  return (
    <div
      className={styles.container}
      style={{ pointerEvents: blocking ? undefined : "none" }}
    >
      <div className={styles.content} data-cy="full_page_loading">
        <LoadingIndicator />
        <Muted>
          <Text>{text}</Text>
        </Muted>
      </div>
    </div>
  );
};
