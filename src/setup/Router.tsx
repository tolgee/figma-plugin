import { Fragment, h } from "preact";
import { Container, Divider, Tabs, TabsOption } from "@create-figma-plugin/ui";

import { Route } from "./pages/data";
import { Index } from "./pages/Index";
import { Settings } from "./pages/Settings";
import { useGlobalActions, useGlobalState } from "./state/GlobalState";
import { HeadingTab } from "./components/HeadingTab";

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
  const { setRoute } = useGlobalActions();

  const handleRouteChange = (route: string) => {
    setRoute(route as Route);
  };

  return (
    <Fragment>
      <Container space="medium">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0px",
          }}
        >
          <HeadingTab
            name="Home"
            route="index"
            currentRoute={route}
            onChange={handleRouteChange}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "16px",
            }}
          >
            <HeadingTab
              name="Settings"
              route="settings"
              currentRoute={route}
              onChange={handleRouteChange}
            />
          </div>
        </div>
      </Container>
      <Divider />
      {getRoute(route)}
    </Fragment>
  );
};
