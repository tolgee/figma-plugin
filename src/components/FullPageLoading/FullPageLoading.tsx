import { LoadingIndicator, Muted, Text } from "@create-figma-plugin/ui";
import { FunctionalComponent, h } from "preact";

import styles from "./FullPageLoading.css";

type Props = {
  text?: string;
};

export const FullPageLoading: FunctionalComponent<Props> = ({ text }) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoadingIndicator />
        <Muted>
          <Text>{text}</Text>
        </Muted>
      </div>
    </div>
  );
};
