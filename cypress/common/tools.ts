import { createShortcutUrl, PluginData } from "@/web/urlConfig";

const ORIGIN = "http://localhost:3000";

export const visitWithState = (data: Partial<PluginData>) => {
  cy.visit(`${ORIGIN}${createShortcutUrl(data)}`);
  cy.wait(100);
  cy.frameLoaded("#plugin_iframe");
};
