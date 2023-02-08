import { h } from "preact";
import clsx from "clsx";

import { components } from "@/client/apiSchema.generated";
import styles from "./SearchRow.css";

type KeySearchSearchResultModel =
  components["schemas"]["KeySearchSearchResultModel"];

type Props = {
  onClick: () => void;
  data: KeySearchSearchResultModel;
};

export const SearchRow = ({ data, onClick }: Props) => {
  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.translation}>{data.translation}</div>
      <div>{data.name}</div>
      <div className={clsx({ [styles.disabled]: !data.namespace })}>
        {data.namespace || "<no namespace>"}
      </div>
    </div>
  );
};
