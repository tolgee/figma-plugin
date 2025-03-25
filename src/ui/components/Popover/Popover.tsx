import { Fragment, h, JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import styles from "./Popover.css";
import { computePosition, offset, autoPlacement } from "@floating-ui/dom";

export interface ActionItem {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
}

interface DropdownProps {
  popoverTrigger: React.RefObject<HTMLElement | null>;
  items?: ActionItem[];
  text?: string;
  clampWidth?: boolean;
  onClose?: () => void;
}

const Dropdown = ({
  popoverTrigger,
  clampWidth,
  items,
  text,
  onClose,
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [displayPopover, setDisplayPopover] = useState(false);

  const handleClick = () => {
    if (!popoverTrigger.current || !dropdownRef.current) {
      return;
    }
    setDisplayPopover(true);
    computePositionAndSet();
  };

  const computePositionAndSet = () => {
    computePosition(popoverTrigger.current!, dropdownRef.current!, {
      placement: "bottom-start",
      middleware: [offset(10), autoPlacement()],
    }).then(({ x, y }) => {
      Object.assign(dropdownRef.current!.style, {
        left: `${x}px`,
        top: `${y}px`,
        maxWidth: clampWidth ? `calc(100% - ${x + 8}px)` : null,
      });
    });
  };

  const close = () => {
    setTimeout(() => {
      setDisplayPopover(false);
    });
    onClose?.();
  };

  useEffect(() => {
    if (!popoverTrigger.current || !dropdownRef.current) {
      return;
    }

    popoverTrigger.current.addEventListener("click", handleClick);
    window.addEventListener("resize", computePositionAndSet);

    return () => {
      popoverTrigger.current?.removeEventListener("click", handleClick);
      window.removeEventListener("resize", computePositionAndSet);
    };
  }, [popoverTrigger]);

  // Close dropdown if clicked outside the dropdown and anchor element.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        popoverTrigger.current &&
        !popoverTrigger.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverTrigger, close]);

  return (
    <div
      ref={dropdownRef}
      class={displayPopover ? styles.popover : styles.popoverHidden}
    >
      {text && <div class={styles.popoverItem}>{text}</div>}
      {items != null &&
        items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              close();
              item.onClick();
            }}
            class={`${styles.popoverItem} ${styles.popoverItemAction}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      {items == null && !text && <Fragment />}
    </div>
  );
};

export default Dropdown;
