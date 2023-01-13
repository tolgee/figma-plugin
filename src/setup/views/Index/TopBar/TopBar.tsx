import { h } from "preact";

import { HeadingTab } from "@/setup/components/HeadingTab/HeadingTab";
import { useGlobalActions, useGlobalState } from "@/setup/state/GlobalState";
import { Settings } from "@/setup/icons/SvgIcons";
import styles from "./TopBar.css";

type LanguageType = {
  name: string;
  tag: string;
};

type Props = {
  languages: LanguageType[] | undefined;
};

export const TopBar = ({ languages }: Props) => {
  const language =
    useGlobalState((c) => c.config?.lang) || languages?.[0]?.tag || "";

  const { setLanguage } = useGlobalActions();

  const routeKey = useGlobalState((c) => c.routeKey);
  const { setRoute } = useGlobalActions();

  return (
    <div className={styles.container}>
      <div className={styles.languageContainer}>
        {languages && (
          <select
            value={language}
            placeholder="Language"
            onChange={(e) => {
              setLanguage((e.target as HTMLInputElement).value);
            }}
          >
            {languages.map((l) => (
              <option key={l.tag} value={l.tag}>
                {l.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className={styles.tabsContainerLeft}>
        <HeadingTab
          route="settings"
          currentRoute={routeKey}
          onChange={() => setRoute("settings")}
        >
          <Settings width={15} height={15} />
        </HeadingTab>
      </div>
    </div>
  );
};
