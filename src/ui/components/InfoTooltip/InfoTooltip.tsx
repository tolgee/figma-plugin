import { h } from "preact";

import styles from "./InfoTooltip.css";
import { Info } from "../../icons/SvgIcons";
import Popover from "../Popover/Popover";
import { useRef } from "preact/hooks";

type Props = {
  children: string;
};

export const InfoTooltip = ({ children }: Props) => {
  const popoverTrigger = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={popoverTrigger}
      data-cy="tooltip"
      title={children}
      className={styles.info}
    >
      <Info width={16} height={16} />
      <Popover clampWidth text={children} popoverTrigger={popoverTrigger} />
    </div>
  );
};
