import { Fragment, h } from "preact";
import { Banner, IconWarning32 } from "@create-figma-plugin/ui";

import { Route } from "./data";
import { Index } from "./Index/Index";
import { Settings } from "./Settings/Settings";
import { useGlobalActions, useGlobalState } from "../state/GlobalState";
import { useEffect } from "preact/hooks";

const getRoute = (route: Route) => {
  switch (route) {
    case "index":
      return <Index />;

    case "settings":
      return <Settings />;
  }
};

export const Router = () => {
  const route = useGlobalState((c) => c.route);
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
      {globalError && route !== "settings" && (
        <Banner
          style={{ cursor: "pointer" }}
          onClick={handleResolveError}
          icon={<IconWarning32 />}
        >
          {globalError}
        </Banner>
      )}
      {getRoute(route)}
    </Fragment>
  );
};
