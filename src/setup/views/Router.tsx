import { Fragment, h } from "preact";
import {
  Banner,
  Container,
  Divider,
  IconWarning32,
  Tabs,
  TabsOption,
} from "@create-figma-plugin/ui";

import { Route } from "./data";
import { Index } from "./Index/Index";
import { Settings } from "./Settings/Settings";
import { useGlobalActions, useGlobalState } from "../state/GlobalState";

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
  const { setRoute, setGlobalError } = useGlobalActions();

  const handleResolveError = () => {
    setGlobalError(undefined);
    setRoute("settings");
  };

  return (
    <Fragment>
      {globalError && (
        <Banner onClick={handleResolveError} icon={<IconWarning32 />}>
          {globalError}
        </Banner>
      )}
      {getRoute(route)}
    </Fragment>
  );
};
