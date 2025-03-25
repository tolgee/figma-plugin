import { h } from "preact";

import styles from "./InfoTooltip.css";
import { Info } from "../../icons/SvgIcons";
import Popover, { ActionItem } from "../Popover/Popover";
import { useRef } from "preact/hooks";

type Props = {
  children: string;
  color?: string;
  items?: ActionItem[] | undefined;
};

export const InfoTooltip = ({ children, color, items }: Props) => {
  const popoverTrigger = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={popoverTrigger}
      data-cy="tooltip"
      title={children}
      className={styles.info}
    >
      <Info style={{ color }} width={16} height={16} />
      <Popover
        clampWidth
        items={items}
        text={children}
        popoverTrigger={popoverTrigger}
      />
    </div>
  );
};
