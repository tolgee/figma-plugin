import { FunctionalComponent, h } from "preact";
import styles from "./HeadingTab.css";

type Props = {
  route: string;
  currentRoute: string;
  onChange: (route: string) => void;
};

export const HeadingTab: FunctionalComponent<Props> = ({
  children,
  route,
  currentRoute,
  onChange,
}) => {
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
      {children}
    </div>
  );
};
