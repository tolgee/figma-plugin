import { LoadingIndicator } from "@create-figma-plugin/ui";
import { h } from "preact";

import styles from "./FullPageLoading.css";

export const FullPageLoading = () => {
  return (
    <div className={styles.container}>
      <LoadingIndicator />
    </div>
  );
};
