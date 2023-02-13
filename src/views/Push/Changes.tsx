import { Fragment, h } from "preact";
import clsx from "clsx";

import { KeyChanges } from "@/tools/getChanges";
import styles from "./Changes.css";
import { NodeList } from "@/components/NodeList/NodeList";

type Props = {
  changes: KeyChanges;
};

export const Changes = ({ changes }: Props) => {
  return (
    <Fragment>
      {changes.requiredScreenshots.length > 0 && (
        <Fragment>
          <div className={clsx(styles.sectionTitle, styles.spanAll)}>
            Upload {changes.requiredScreenshots.length} screenshots
          </div>
        </Fragment>
      )}
      {changes.newKeys.length > 0 && (
        <Fragment>
          <div className={clsx(styles.sectionTitle, styles.spanAll)}>
            New keys
          </div>
          <div className={clsx(styles.list, styles.new)}>
            <NodeList
              nodes={changes.newKeys.map((k) => ({
                id: k.key,
                key: k.key,
                ns: k.ns,
                characters: k.newValue,
              }))}
            />
          </div>
        </Fragment>
      )}
      {changes.changedKeys.length > 0 && (
        <Fragment>
          <div className={clsx(styles.sectionTitle, styles.spanAll)}>
            Changed keys
          </div>
          <div className={clsx(styles.list, styles.change)}>
            <NodeList
              nodes={changes.changedKeys.map((k) => ({
                id: k.key,
                key: k.key,
                ns: k.ns,
                characters: k.newValue,
              }))}
            />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};
