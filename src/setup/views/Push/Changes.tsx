import { Fragment, h } from "preact";
import { KeyChanges } from "@/setup/tools/getChanges";
import { VerticalSpace } from "@create-figma-plugin/ui";

import styles from "./Changes.css";
import clsx from "clsx";

type Props = {
  changes: KeyChanges;
};

export const Changes = ({ changes }: Props) => {
  return (
    <div className={styles.container}>
      {changes.newKeys.length > 0 && (
        <Fragment>
          <div className={clsx(styles.sectionTitle, styles.spanAll)}>
            New keys
          </div>
          {changes.newKeys.map(({ key, newValue }) => (
            <Fragment key={key}>
              <div className={clsx(styles.new, styles.rowKey)}>{key}</div>
              <div className={clsx(styles.new, styles.rowText)}>{newValue}</div>
            </Fragment>
          ))}
        </Fragment>
      )}
      {changes.changedKeys.length > 0 && (
        <Fragment>
          <div className={clsx(styles.sectionTitle, styles.spanAll)}>
            Changed keys
          </div>
          {changes.changedKeys.map(({ key, newValue }) => (
            <Fragment key={key}>
              <div className={clsx(styles.change, styles.rowKey)}>{key}</div>
              <div className={clsx(styles.change, styles.rowText)}>
                {newValue}
              </div>
            </Fragment>
          ))}
        </Fragment>
      )}
    </div>
  );
};
