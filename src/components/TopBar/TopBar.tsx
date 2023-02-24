import { IconChevronLeft32 } from "@create-figma-plugin/ui";
import { h, JSX } from "preact";

import styles from "./TopBar.css";

type Props = {
  onBack?: () => void;
  leftPart?: JSX.Element;
  rightPart?: JSX.Element;
};

export const TopBar = ({ leftPart, rightPart, onBack }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.tabsContainerLeft}>
        {onBack && (
          <div
            className={styles.tabsBackButton}
            onClick={onBack}
            role="button"
            data-cy="top_bar_back_button"
          >
            <IconChevronLeft32 />
          </div>
        )}
        {leftPart}
      </div>
      <div className={styles.tabsContainerRight}>{rightPart}</div>
    </div>
  );
};
