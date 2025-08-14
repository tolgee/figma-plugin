import { components } from "@/ui/client/apiSchema.generated";
import { h } from "preact";
import styles from "./UnresolvedConflicts.css";
import { Button } from "@create-figma-plugin/ui";

type SimpleImportConflictResult =
  components["schemas"]["SimpleImportConflictResult"];

type Props = {
  conflicts: SimpleImportConflictResult[];
  onOverride: () => void;
};

function renderKey(key: SimpleImportConflictResult, note?: string) {
  const namespace = key.keyNamespace
    ? ` ${`(namespace: ${key.keyNamespace})`}`
    : "";
  const renderedNote = note ? ` ${note}` : "";
  return `${`${key.keyName}`}${namespace}${renderedNote}`;
}

export const UnresolvedConflicts = ({ conflicts, onOverride }: Props) => {
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
        <div className={styles.styledHint}>
          You have permissions to override some translations (marked as
          overridable), but it's not recommended, because these translations are
          protected
          <Button data-cy="push-override-all-button" onClick={onOverride}>
            Override all
          </Button>
        </div>
      )}
    </div>
  );
};
