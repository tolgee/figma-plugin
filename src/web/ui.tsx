import { h, render } from "preact";
import { Plugin } from "../ui/Plugin";
import "!@create-figma-plugin/ui/lib/css/base.css";
import { getUrlConfig } from "./urlConfig";

const AppWrapper = () => {
  const data = getUrlConfig(true);

  return <Plugin {...data} />;
};

setTimeout(() => {
  render(<AppWrapper />, document.getElementById("root")!);
}, 0);
