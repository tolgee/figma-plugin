import { createShortcutUrl, PluginData } from "@/web/urlConfig";

const ORIGIN = "http://localhost:22224";

export const visitWithState = (data: Partial<PluginData>) => {
  cy.visit(`${ORIGIN}${createShortcutUrl(data)}`);
  cy.iframeReady();
};
