import { h } from "preact";

import styles from "./Badge.css";
import { X } from "../../icons/SvgIcons";

type Props = {
  children: string;
  title?: string;
  bold?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
};

export const Badge = ({ onClick, children, title, bold, onRemove }: Props) => {
  return (
    <div
      data-cy="badge"
      title={title}
      onClick={onClick}
      className={styles.badge + (bold ? ` ${styles.bold}` : "")}
    >
      {children}
      {onRemove && (
        <button
          data-cy="badge-remove"
          onClick={onRemove}
          aria-label="remove-tag"
        >
          <X width={16} height={16} />
        </button>
      )}
    </div>
  );
};
