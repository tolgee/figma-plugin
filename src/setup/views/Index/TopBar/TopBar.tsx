import { h } from "preact";
import { LanguageType } from "../../../../apiTypes";
import { HeadingTab } from "../../../components/HeadingTab/HeadingTab";
import { useGlobalActions, useGlobalState } from "../../../state/GlobalState";
import { Route } from "../../data";

import styles from "./TopBar.css";

type Props = {
  languages: LanguageType[] | undefined;
};

export const TopBar = ({ languages }: Props) => {
  const language =
    useGlobalState((c) => c.config?.lang) || languages?.[0]?.tag || "";

  const { setLanguage } = useGlobalActions();

  const route = useGlobalState((c) => c.route);
  const { setRoute } = useGlobalActions();

  const handleRouteChange = (route: string) => {
    setRoute(route as Route);
  };

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
          name="Settings"
          route="settings"
          currentRoute={route}
          onChange={handleRouteChange}
        />
      </div>
    </div>
  );
};
