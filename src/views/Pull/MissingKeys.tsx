import { Fragment, h } from "preact";

import styles from "./MissingKeys.css";
import clsx from "clsx";

type Props = {
  missingKeys: string[];
};

export const MissingKeys = ({ missingKeys }: Props) => {
  return (
    <div className={styles.container}>
      {missingKeys.length > 0 && (
        <Fragment>
          <div className={clsx(styles.sectionTitle, styles.spanAll)}>
            Missing translations for keys:
          </div>
          {missingKeys.map((key) => (
            <Fragment key={key}>
              <div className={clsx(styles.missing, styles.rowKey)}>{key}</div>
            </Fragment>
          ))}
        </Fragment>
      )}
    </div>
  );
};
