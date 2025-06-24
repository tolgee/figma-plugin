import { h } from "preact";

import styles from "./Badge.css";
import { X } from "../../icons/SvgIcons";

type Props = {
  children: string;
  title?: string;
  onRemove?: () => void;
};

export const Badge = ({ children, title, onRemove }: Props) => {
  return (
    <div data-cy="badge" title={title} className={styles.badge}>
      {children}
      {onRemove && (
        <button onClick={onRemove}>
          <X width={16} height={16} />
        </button>
      )}
    </div>
  );
};
