import { h } from "preact";

import styles from "./Badge.css";

type Props = {
  children: string;
  title?: string;
};

export const Badge = ({ children, title }: Props) => {
  return (
    <div data-cy="badge" title={title} className={styles.badge}>
      {children}
    </div>
  );
};
