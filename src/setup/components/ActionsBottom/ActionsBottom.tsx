import { Columns } from "@create-figma-plugin/ui";
import { FunctionComponent, h } from "preact";

import styles from "./ActionsBottom.css";

export const ActionsBottom: FunctionComponent = ({ children }) => {
  return (
    <Columns space="extraSmall" className={styles.container}>
      {children}
    </Columns>
  );
};
