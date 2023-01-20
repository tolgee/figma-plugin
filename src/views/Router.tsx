import { Fragment, h } from "preact";
import { Banner, IconWarning32 } from "@create-figma-plugin/ui";
import { useEffect } from "preact/hooks";

import { Route } from "./routes";
import { Index } from "./Index/Index";
import { Settings } from "./Settings/Settings";
import { useGlobalActions, useGlobalState } from "../state/GlobalState";
import { Push } from "./Push/Push";
import { Pull } from "./Pull/Pull";
import { Connect } from "./Connect/Connect";

const getPage = ([routeKey, routeData]: Route) => {
  switch (routeKey) {
    case "index":
      return <Index />;

    case "settings":
      return <Settings />;

    case "push":
      return <Push {...routeData} />;

    case "pull":
      return <Pull {...routeData} />;

    case "connect":
      return <Connect {...routeData} />;
  }
};

export const Router = () => {
  const route = useGlobalState((c) => c.route);
  const routeKey = useGlobalState((c) => c.routeKey);
  const globalError = useGlobalState((c) => c.globalError);
  const config = useGlobalState((c) => c.config);
  const { setRoute } = useGlobalActions();

  useEffect(() => {
    if (!config?.apiKey || !config?.apiUrl) {
      setRoute("settings");
    }
  }, [config]);

  const handleResolveError = () => {
    setRoute("settings");
  };

  return (
    <Fragment>
      {globalError && routeKey !== "settings" && (
        <Banner
          style={{ cursor: "pointer" }}
          onClick={handleResolveError}
          icon={<IconWarning32 />}
        >
          {globalError}
        </Banner>
      )}
      {getPage(route)}
    </Fragment>
  );
};
