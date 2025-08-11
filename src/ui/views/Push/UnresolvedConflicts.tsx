import { components } from "@/ui/client/apiSchema.generated";
import { h } from "preact";
import styles from "./UnresolvedConflicts.css";

type SimpleImportConflictResult =
  components["schemas"]["SimpleImportConflictResult"];

type Props = {
  conflicts: SimpleImportConflictResult[];
};

function renderKey(key: SimpleImportConflictResult, note?: string) {
  const namespace = key.keyNamespace
    ? ` ${`(namespace: ${key.keyNamespace})`}`
    : "";
  const renderedNote = note ? ` ${note}` : "";
  return `${`${key.keyName}`}${namespace}${renderedNote}`;
}

export const UnresolvedConflicts = ({ conflicts }: Props) => {
  const someOverridable = Boolean(conflicts.find((c) => c.isOverridable));

  return (
    <div className={styles.container}>
      <div>Some translations cannot be updated:</div>
      <div className={styles.conflicts}>
        {conflicts.map((c, i) => (
          <div key={i}>
            {renderKey(c, c.isOverridable ? " (overridable)" : "")}
          </div>
        ))}
      </div>
      {someOverridable && (
        <div>
          HINT: Overridable translations can be updated with the "Override all"
          setting
        </div>
      )}
    </div>
  );
};
