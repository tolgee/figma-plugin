import { h } from "preact";
import styles from "./HeadingTab.css";

type Props = {
  name: string;
  route: string;
  currentRoute: string;
  onChange: (route: string) => void;
};

export const HeadingTab = ({ name, route, currentRoute, onChange }: Props) => {
  return (
    <div
      className={styles.container}
      style={{
        color:
          route === currentRoute
            ? "var(--figma-color-text)"
            : "var(--figma-color-text-secondary)",
      }}
      onClick={() => onChange(route)}
    >
      {name}
    </div>
  );
};
