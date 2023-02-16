import {
  createShortcutUrl,
  PluginData,
  DEFAULT_CREDENTIALS,
} from "@/web/urlConfig";

export const SIGNED_IN = {
  ...DEFAULT_CREDENTIALS,
  language: "en",
  namespace: "",
};

const ORIGIN = "http://localhost:3000";

export const visitWithState = (data: Partial<PluginData>) => {
  cy.visit(`${ORIGIN}${createShortcutUrl(data)}`);
  cy.wait(100);
  cy.frameLoaded("#plugin_iframe");
};
