import { FunctionComponent, h } from "preact";
import { useState } from "preact/hooks";
import { ChevronDown } from "../../icons/SvgIcons";

export const Expandable: FunctionComponent<{
  title: string;
  defaultOpen?: boolean;
}> = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <ChevronDown
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
          width={16}
          height={16}
        />
      </div>
      {open && <div>{children}</div>}
    </div>
  );
};
