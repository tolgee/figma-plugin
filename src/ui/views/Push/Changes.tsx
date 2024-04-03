import { Fragment, h } from "preact";
import clsx from "clsx";

import { KeyChanges } from "@/tools/getPushChanges";
import { NodeList } from "@/ui/components/NodeList/NodeList";

import styles from "./Changes.css";

type Props = {
  changes: KeyChanges;
};

export const Changes = ({ changes }: Props) => {
  return (
    <Fragment>
      {changes.newKeys.length > 0 && (
        <Fragment>
          <div
            className={clsx(styles.sectionTitle, styles.spanAll, styles.new)}
          >
            New keys
          </div>
          <div
            className={clsx(styles.list, styles.new)}
            data-cy="changes_new_keys"
          >
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
          <div
            className={clsx(styles.sectionTitle, styles.spanAll, styles.change)}
          >
            Changed keys
          </div>
          <div
            className={clsx(styles.list, styles.change)}
            data-cy="changes_changed_keys"
          >
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
