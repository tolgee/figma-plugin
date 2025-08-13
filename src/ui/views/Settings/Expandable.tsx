import { FunctionComponent, h } from "preact";
import { useState } from "preact/hooks";
import { ChevronDown } from "../../icons/SvgIcons";

export const Expandable: FunctionComponent<{
  title: string;
  dataCy?: string;
  defaultOpen?: boolean;
}> = ({ title, defaultOpen = false, dataCy, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        data-cy={dataCy}
        style={{
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-controls={`expandable-content-${title
          .replace(/\s+/g, "-")
          .toLowerCase()}`}
      >
        {title}
        <ChevronDown
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
          width={16}
          height={16}
          aria-hidden="true"
        />
      </div>
      {open && (
        <div
          id={`expandable-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
