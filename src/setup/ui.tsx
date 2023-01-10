import { render } from "@create-figma-plugin/ui";
import { h } from "preact";

import "!../styles.css";
import { Node, TolgeeConfig } from "../types";
import { GlobalState } from "./state/GlobalState";
import { Router } from "./Router";

type Props = {
  config: Partial<TolgeeConfig> | null;
  nodes: Array<Node>;
};

function Plugin({ config, nodes }: Props) {
  return (
    <GlobalState initialSelection={nodes} config={config}>
      <Router />
    </GlobalState>
  );
}

export default render(Plugin);
