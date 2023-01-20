import { h } from "preact";
import clsx from "clsx";

import { components } from "@/client/apiSchema.generated";
import styles from "./SearchRow.css";
import { useGlobalState } from "@/state/GlobalState";

type KeyWithTranslationsModel =
  components["schemas"]["KeyWithTranslationsModel"];

type Props = {
  onClick: () => void;
  data: KeyWithTranslationsModel;
};

export const SearchRow = ({ data, onClick }: Props) => {
  const language = useGlobalState((c) => c.config?.lang);
  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.translation}>
        {data.translations?.[language!]?.text}
      </div>
      <div>{data.keyName}</div>
      <div className={clsx({ [styles.disabled]: !data.keyNamespace })}>
        {data.keyNamespace || "<no namespace>"}
      </div>
    </div>
  );
};
