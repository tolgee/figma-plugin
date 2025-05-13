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
import { Dialog } from "../components/Dialog/Dialog";
import { StringDetails } from "./StringDetails/StringDetails";

const getDialogPage = ([routeKey, routeData]: Route) => {
  switch (routeKey) {
    case "connect":
      return <Connect {...routeData} />;

    default:
      return null;
  }
};

type PageProps = {
  route: Route;
  setRoute: (...route: Route) => void;
};

const Page = ({ route: [routeKey, routeData], setRoute }: PageProps) => {
  switch (routeKey) {
    case "settings":
      return <Settings />;
    case "push":
      return <Push />;
    case "pull":
      return <Pull {...routeData} />;
    case "create_copy":
      return <CreateCopy />;
    case "string_details":
      return <StringDetails {...routeData} />;
  }

  const dialogPage = getDialogPage([routeKey, routeData] as Route);

  return (
    <Fragment>
      <div style={{ display: dialogPage ? "none" : "block" }}>
        <Index />
      </div>
      {dialogPage && (
        <Dialog onClose={() => setRoute("index")}>{dialogPage}</Dialog>
      )}
    </Fragment>
  );
};

export const Router = () => {
  const route = useGlobalState((c) => c.route);
  const routeKey = useGlobalState((c) => c.routeKey);
  const globalError = useGlobalState((c) => c.globalError);
  const documentInfo = useGlobalState((c) => c.config?.documentInfo);
  const pageInfo = useGlobalState((c) => c.config?.pageInfo);
  const pageCopy = useGlobalState((c) => c.config?.pageCopy);
  const pageStringDetails = useGlobalState((c) => c.config?.pageStringDetails);
  const pageStringDetailsNodeInfo = useGlobalState((c) => c.config?.nodeInfo);
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
      ) : pageStringDetails ? (
        <StringDetails node={pageStringDetailsNodeInfo} />
      ) : forceSettings ? (
        <Settings noNavigation />
      ) : !pageInfo ? (
        <PageSetup />
      ) : (
        <Page route={route} setRoute={setRoute} />
      )}
    </Fragment>
  );
};
