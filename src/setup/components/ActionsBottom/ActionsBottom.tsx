import { Divider } from "@create-figma-plugin/ui";
import { Fragment, FunctionComponent, h } from "preact";

import styles from "./ActionsBottom.css";

export const ActionsBottom: FunctionComponent = ({ children }) => {
  return (
    <Fragment>
      <div className={styles.placeHolder} />
      <div className={styles.container}>
        <Divider />
        <div className={styles.actions}>{children}</div>
      </div>
    </Fragment>
  );
};
