import { Fragment, h } from "preact";
import { Banner, IconWarning32 } from "@create-figma-plugin/ui";

import { Route } from "./routes";
import { Index } from "./Index/Index";
import { Settings } from "./Settings/Settings";
import { useGlobalActions, useGlobalState } from "../state/GlobalState";
import { Push } from "./Push/Push";
import { Pull } from "./Pull/Pull";
import { Connect } from "./Connect/Connect";
import { PageSetup } from "./PageSetup/PageSetup";
import { CreateCopy } from "./CreateCopy/CreateCopy";
import { CopyView } from "./CopyView/CopyView";

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

    case "create_copy":
      return <CreateCopy />;
  }
};

export const Router = () => {
  const route = useGlobalState((c) => c.route);
  const routeKey = useGlobalState((c) => c.routeKey);
  const globalError = useGlobalState((c) => c.globalError);
  const documentInfo = useGlobalState((c) => c.config?.documentInfo);
  const pageInfo = useGlobalState((c) => c.config?.pageInfo);
  const pageCopy = useGlobalState((c) => c.config?.pageCopy);
  const { setRoute } = useGlobalActions();

  const forceSettings = !pageCopy && !documentInfo;
  const errorOnTop = !forceSettings && routeKey !== "settings";

  const handleResolveError = () => {
    setRoute("settings");
  };

  return (
    <Fragment>
      {globalError && errorOnTop && (
        <Banner
          style={{ cursor: "pointer" }}
          onClick={handleResolveError}
          icon={<IconWarning32 />}
        >
          {globalError}
        </Banner>
      )}
      {pageCopy ? (
        <CopyView />
      ) : forceSettings ? (
        <Settings noNavigation />
      ) : !pageInfo ? (
        <PageSetup />
      ) : (
        getPage(route)
      )}
    </Fragment>
  );
};
