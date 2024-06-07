import { ComponentChildren, h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import styles from "./Dialog.css";

type Props = {
  onClose: () => void;
  children: ComponentChildren;
};

export const Dialog = ({ children, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => onClose();
    ref.current?.focus();
    ref.current?.addEventListener("keydown", handler);
    return () => ref.current?.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} tabIndex={0}>
      <div className={styles.dialogBody}>{children}</div>
    </div>
  );
};
